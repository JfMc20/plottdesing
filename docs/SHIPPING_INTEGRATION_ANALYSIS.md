# Shipping Integration Analysis & Implementation Plan

## Overview
This document provides a comprehensive analysis of the current orders system and identifies the integration points for implementing shipping cost calculation. This analysis is based on the existing codebase and complements the Orders and Stripe implementation plans.

**Date:** 2025-10-27
**Status:** Analysis Complete - Ready for Implementation

---

## Executive Summary

### Current State
- ✅ Order system has `shipping` field in database
- ✅ Admin schema has product dimensions (`weight`, `width`, `height`, `length`)
- ❌ Storefront schema missing product dimension fields
- ❌ Shipping is hardcoded to `0` in order creation
- ❌ Admin can manually edit financial fields (security risk)

### Required Actions
1. Synchronize product schema between admin and storefront
2. Implement shipping calculation utility
3. Integrate calculation into order creation flow
4. Make financial fields auto-calculated and read-only
5. Integrate with Stripe PaymentIntent

---

## Part 1: Current System Analysis

### 1.1 Database Schema Analysis

#### Product Model Comparison

**Admin Schema** (`apps/admin/prisma/schema.prisma:88-115`)
```prisma
model Product {
  id          String   @id @default(cuid())
  title       String
  price       Float    @default(100)
  discount    Float    @default(0)
  stock       Int      @default(0)

  weight      Float?   ✅ HAS SHIPPING FIELDS
  width       Float?   ✅ HAS SHIPPING FIELDS
  height      Float?   ✅ HAS SHIPPING FIELDS
  length      Float?   ✅ HAS SHIPPING FIELDS

  isPhysical  Boolean  @default(true)
  isAvailable Boolean  @default(false)
  isArchived  Boolean  @default(false)
}
```

**Storefront Schema** (`apps/storefront/prisma/schema.prisma:97-127`)
```prisma
model Product {
  id          String   @id @default(cuid())
  title       String
  price       Float    @default(100)
  discount    Float    @default(0)
  stock       Int      @default(0)

  ❌ MISSING: weight
  ❌ MISSING: width
  ❌ MISSING: height
  ❌ MISSING: length

  isPhysical  Boolean  @default(true)
  isAvailable Boolean  @default(false)
  isFeatured  Boolean  @default(false)
}
```

**🔴 CRITICAL ISSUE:** Schema mismatch prevents storefront from calculating shipping.

#### Order Model Analysis

**Both schemas have:**
```prisma
model Order {
  id       String          @id @default(cuid())
  number   Int             @unique @default(autoincrement())
  status   OrderStatusEnum

  total    Float @default(100)
  shipping Float @default(100)  ✅ Field exists
  payable  Float @default(100)
  tax      Float @default(100)
  discount Float @default(0)

  isPaid      Boolean @default(false)
  isCompleted Boolean @default(false)
}
```

**✅ GOOD:** Shipping field exists and ready to use.

#### Address Model Analysis

```prisma
model Address {
  id         String @id @default(cuid())
  country    String @default("IRI")
  address    String
  city       String
  phone      String
  postalCode String
  userId     String
}
```

**✅ GOOD:** All fields needed for zone-based shipping calculation are present.

---

### 1.2 Current Order Creation Flow

**Location:** `apps/storefront/src/app/api/orders/route.ts:47-151`

```typescript
export async function POST(req: Request) {
  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Get request data
  const { addressId, discountCode } = await req.json()

  // 3. Load cart with items
  const cart = await prisma.cart.findUniqueOrThrow({
    where: { userId: prismaUser.id },
    include: {
      items: {
        include: { product: true }
      }
    }
  })

  // 4. Calculate costs
  const { tax, total, discount, payable } = calculateCosts({ cart })
  //                                        ❌ NOT passing address
  //                                        ❌ NOT calculating shipping

  // 5. Create order
  const order = await prisma.order.create({
    data: {
      total,
      tax,
      payable,
      discount,
      shipping: 0,  // ❌ HARDCODED TO ZERO (Line 106)
      // ...
    }
  })
}
```

---

### 1.3 Current Cost Calculation Logic

**Location:** `apps/storefront/src/app/api/orders/route.ts:153-173`

```typescript
function calculateCosts({ cart }) {
  let total = 0,
      discount = 0

  // Calculate product totals
  for (const item of cart?.items) {
     total += item?.count * item?.product?.price
     discount += item?.count * item?.product?.discount
  }

  // Calculate tax (9%)
  const afterDiscount = total - discount
  const tax = afterDiscount * 0.09

  // Calculate payable
  const payable = afterDiscount + tax
  //              ❌ MISSING: + shipping

  return {
     total: parseFloat(total.toFixed(2)),
     discount: parseFloat(discount.toFixed(2)),
     afterDiscount: parseFloat(afterDiscount.toFixed(2)),
     tax: parseFloat(tax.toFixed(2)),
     payable: parseFloat(payable.toFixed(2)),
     // ❌ MISSING: shipping
  }
}
```

**Problems:**
1. No `address` parameter
2. No shipping calculation
3. Shipping not included in `payable`
4. No shipping returned

---

### 1.4 Admin Order Management

**Location:** `apps/admin/src/app/(dashboard)/(routes)/orders/[orderId]/components/order-form.tsx`

**Current Form Fields:**
```typescript
// Financial fields are EDITABLE inputs
<FormField name="total" />          // ⚠️ Should be read-only
<FormField name="shipping" />       // ⚠️ Should be read-only
<FormField name="tax" />            // ⚠️ Should be read-only
<FormField name="payable" />        // ⚠️ Should be read-only
<FormField name="discount" />       // ⚠️ Should be read-only
```

**🔴 SECURITY RISK:** Admin can manually edit financial fields, causing:
- Incorrect charges to customers
- Stripe payment amount mismatches
- Accounting discrepancies
- Data integrity issues

**Documented Issue:** See `ORDERS_IMPLEMENTATION_PLAN.md:294-333`

---

## Part 2: Integration Points Identified

### 2.1 Primary Integration Point: `calculateCosts` Function

**File:** `apps/storefront/src/app/api/orders/route.ts:153-173`

**Current Signature:**
```typescript
function calculateCosts({ cart })
```

**Required Signature:**
```typescript
function calculateCosts({
  cart,
  address  // 👈 ADD THIS
}): {
  total: number
  discount: number
  tax: number
  shipping: number    // 👈 ADD THIS
  payable: number
}
```

**Changes Needed:**
```typescript
import { calculateShipping } from '@/packages/shared/shipping'

function calculateCosts({ cart, address }) {
  // ... existing total/discount calculation ...

  const afterDiscount = total - discount
  const tax = afterDiscount * 0.09

  // 👇 NEW: Calculate shipping
  const { shippingCost } = calculateShipping({
    items: cart.items,
    destinationAddress: address
  })

  // 👇 UPDATED: Include shipping in payable
  const payable = afterDiscount + tax + shippingCost

  return {
    total: parseFloat(total.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    shipping: parseFloat(shippingCost.toFixed(2)),  // 👈 NEW
    payable: parseFloat(payable.toFixed(2)),
  }
}
```

---

### 2.2 Secondary Integration Point: Order Creation

**File:** `apps/storefront/src/app/api/orders/route.ts:47-151`

**Changes Needed:**

```typescript
export async function POST(req: Request) {
  // ... authentication ...

  const { addressId, discountCode } = await req.json()

  // 👇 ADD: Load address
  const address = await prisma.address.findUniqueOrThrow({
    where: {
      id: addressId,
      userId: prismaUser.id  // Security: verify ownership
    }
  })

  const cart = await prisma.cart.findUniqueOrThrow({
    where: { userId: prismaUser.id },
    include: {
      items: {
        include: { product: true }
      }
    }
  })

  // 👇 UPDATED: Pass address and receive shipping
  const { tax, total, discount, payable, shipping } = calculateCosts({
    cart,
    address  // 👈 NEW
  })

  const order = await prisma.order.create({
    data: {
      total,
      tax,
      payable,
      discount,
      shipping,  // 👈 UPDATED: Use calculated value
      // ...
    }
  })
}
```

---

### 2.3 Tertiary Integration Point: Admin Order Items

**Files:**
- `apps/admin/src/app/api/orders/[orderId]/items/route.ts` (POST - Add item)
- `apps/admin/src/app/api/orders/[orderId]/items/[productId]/route.ts` (PATCH/DELETE)

**Current Behavior:**
When admin adds/removes items, financial fields are NOT recalculated.

**Required Behavior:**
Automatically recalculate shipping and payable when items change.

**Implementation Strategy:**

**Option A:** Create recalculate endpoint and call it
```typescript
// Create: apps/admin/src/app/api/orders/[orderId]/recalculate/route.ts
export async function POST(req, { params }) {
  // Load order with items and address
  // Recalculate all financial fields
  // Update order
  // Return updated order
}

// Then call from item endpoints:
await fetch(`/api/orders/${orderId}/recalculate`, { method: 'POST' })
```

**Option B:** Extract recalculation logic to shared function
```typescript
// Create: packages/shared/src/orders/recalculate.ts
export async function recalculateOrder(orderId: string, prisma) {
  // Recalculation logic
}

// Then import and call:
import { recalculateOrder } from '@/packages/shared/orders'
const updatedOrder = await recalculateOrder(orderId, prisma)
```

**Recommendation:** Option B (shared function) for better code reuse.

---

### 2.4 Quaternary Integration Point: Stripe PaymentIntent

**File:** `apps/storefront/src/app/api/checkout/create-payment-intent/route.ts` (to be created)

**Referenced in:** `STRIPE_INTEGRATION_PLAN.md` Phase 1, Step 2

**Integration Requirements:**

```typescript
export async function POST(req: Request) {
  const { orderId } = await req.json()

  // Load order
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId }
  })

  // 👇 CRITICAL: Use order.payable which includes shipping
  const amount = Math.round(order.payable * 100)  // Convert to cents

  // 👇 VALIDATION: Verify payable calculation is correct
  const expectedPayable = order.total - order.discount + order.tax + order.shipping
  if (Math.abs(order.payable - expectedPayable) > 0.01) {
    throw new Error('Order calculation mismatch')
  }

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: {
      orderId: order.id,
      total: order.total.toFixed(2),
      shipping: order.shipping.toFixed(2),  // 👈 Include in metadata
      tax: order.tax.toFixed(2),
      discount: order.discount.toFixed(2),
      payable: order.payable.toFixed(2),
    }
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret
  })
}
```

**Why This Matters:**
- Stripe charges the customer `amount` (in cents)
- If `amount` doesn't include shipping, customer is undercharged
- This creates a financial loss for the business
- Metadata helps with accounting and reconciliation

---

### 2.5 Quinary Integration Point: Admin Form UI

**File:** `apps/admin/src/app/(dashboard)/(routes)/orders/[orderId]/components/order-form.tsx`

**Current Problems:**
1. Financial fields are editable text inputs
2. No validation on manual edits
3. No recalculation mechanism
4. Can create inconsistent data

**Required Changes:**

**Remove Editable Fields:**
```typescript
// ❌ REMOVE these FormField inputs:
<FormField name="total" control={form.control} render={...} />
<FormField name="shipping" control={form.control} render={...} />
<FormField name="tax" control={form.control} render={...} />
<FormField name="payable" control={form.control} render={...} />
<FormField name="discount" control={form.control} render={...} />
```

**Add Read-Only Display:**
```typescript
// ✅ ADD read-only display section:
<div className="border rounded-lg p-4 bg-muted/50">
  <h3 className="font-semibold mb-4">Financial Summary (Auto-Calculated)</h3>

  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span>Subtotal:</span>
      <span className="font-mono">${order.total.toFixed(2)}</span>
    </div>

    <div className="flex justify-between text-green-600">
      <span>Discount:</span>
      <span className="font-mono">-${order.discount.toFixed(2)}</span>
    </div>

    <div className="flex justify-between">
      <span>Shipping:</span>
      <span className="font-mono">${order.shipping.toFixed(2)}</span>
    </div>

    <div className="flex justify-between">
      <span>Tax (9%):</span>
      <span className="font-mono">${order.tax.toFixed(2)}</span>
    </div>

    <div className="flex justify-between font-semibold pt-2 border-t">
      <span>Total Payable:</span>
      <span className="font-mono">${order.payable.toFixed(2)}</span>
    </div>
  </div>

  <Button
    onClick={handleRecalculate}
    className="w-full mt-4"
    variant="outline"
  >
    Recalculate Totals
  </Button>

  <p className="text-xs text-muted-foreground mt-2">
    Financial values are auto-calculated from order items.
    Click "Recalculate" if items were modified.
  </p>
</div>
```

**Add Recalculate Handler:**
```typescript
async function handleRecalculate() {
  const response = await fetch(`/api/orders/${orderId}/recalculate`, {
    method: 'POST',
    headers: { 'X-USER-ID': userId }
  })

  const updatedOrder = await response.json()

  // Update form values
  form.setValue('total', updatedOrder.total)
  form.setValue('shipping', updatedOrder.shipping)
  form.setValue('tax', updatedOrder.tax)
  form.setValue('discount', updatedOrder.discount)
  form.setValue('payable', updatedOrder.payable)

  toast.success('Order totals recalculated')
}
```

---

## Part 3: Shipping Calculation Design

### 3.1 Proposed Architecture

```
packages/shared/src/shipping/
├── calculate-shipping.ts      # Main calculation logic
├── shipping.types.ts          # TypeScript interfaces
├── shipping.constants.ts      # Rates, zones, configuration
├── shipping.utils.ts          # Helper functions
├── index.ts                   # Public exports
└── __tests__/
    └── calculate-shipping.test.ts
```

### 3.2 Core Function Signature

```typescript
export interface ShippingCalculationInput {
  items: Array<{
    product: Product
    count: number
  }>
  destinationAddress: Address
}

export interface ShippingCalculationResult {
  shippingCost: number
  breakdown: {
    baseRate: number
    weightCharge: number
    volumeCharge?: number
    zoneMultiplier: number
    totalWeight: number
    totalVolume?: number
  }
  method: string
}

export function calculateShipping(
  input: ShippingCalculationInput
): ShippingCalculationResult
```

### 3.3 Implementation Considerations

**1. Physical vs Digital Products:**
```typescript
// Filter only physical products
const physicalItems = items.filter(item => item.product.isPhysical)

if (physicalItems.length === 0) {
  return {
    shippingCost: 0,
    breakdown: { /* zero values */ },
    method: "Digital Delivery"
  }
}
```

**2. Weight Calculation:**
```typescript
let totalWeight = 0
for (const item of physicalItems) {
  if (!item.product.weight) {
    throw new Error(`Product ${item.product.id} missing weight`)
  }
  totalWeight += item.product.weight * item.count
}
```

**3. Volumetric Weight (if applicable):**
```typescript
let totalVolume = 0
for (const item of physicalItems) {
  if (item.product.width && item.product.height && item.product.length) {
    const volume = item.product.width * item.product.height * item.product.length
    totalVolume += volume * item.count
  }
}

// DIM factor (typically 5000 for cm³ to kg conversion)
const volumetricWeight = totalVolume / 5000
const chargeableWeight = Math.max(totalWeight, volumetricWeight)
```

**4. Zone-Based Multipliers:**
```typescript
function getZoneMultiplier(address: Address): number {
  const zoneRates = {
    'US': 1.0,      // Domestic
    'CA': 1.2,      // Canada
    'MX': 1.3,      // Mexico
    'EU': 1.5,      // Europe
    'ASIA': 2.0,    // Asia
    'OTHER': 2.5    // Rest of world
  }

  return zoneRates[address.country] || zoneRates['OTHER']
}
```

**5. Formula Structure (Placeholder):**
```typescript
// Basic structure - actual formula to be provided
const baseRate = 5.00                          // Flat fee per shipment
const weightCharge = chargeableWeight * 2.00   // Rate per kg/lb
const zoneMultiplier = getZoneMultiplier(address)
const shippingCost = (baseRate + weightCharge) * zoneMultiplier
```

### 3.4 Error Handling

```typescript
// Validation before calculation
for (const item of physicalItems) {
  if (!item.product.weight || item.product.weight <= 0) {
    throw new Error(
      `Physical product "${item.product.title}" (${item.product.id}) ` +
      `is missing valid weight. Please update product information.`
    )
  }
}

// Optional: Validate dimensions
if (requireDimensions) {
  for (const item of physicalItems) {
    if (!item.product.width || !item.product.height || !item.product.length) {
      console.warn(
        `Product ${item.product.id} missing dimensions, ` +
        `using weight-only calculation`
      )
    }
  }
}
```

### 3.5 Testing Strategy

```typescript
describe('calculateShipping', () => {
  test('returns 0 for digital products', () => {
    const result = calculateShipping({
      items: [{
        product: { ...mockProduct, isPhysical: false },
        count: 1
      }],
      destinationAddress: mockAddress
    })
    expect(result.shippingCost).toBe(0)
  })

  test('calculates weight-based shipping', () => {
    const result = calculateShipping({
      items: [{
        product: {
          ...mockProduct,
          isPhysical: true,
          weight: 2.5
        },
        count: 1
      }],
      destinationAddress: { ...mockAddress, country: 'US' }
    })
    expect(result.shippingCost).toBeGreaterThan(0)
  })

  test('applies zone multipliers correctly', () => {
    const usShipping = calculateShipping({
      items: [{ product: mockProduct, count: 1 }],
      destinationAddress: { ...mockAddress, country: 'US' }
    })

    const asiaShipping = calculateShipping({
      items: [{ product: mockProduct, count: 1 }],
      destinationAddress: { ...mockAddress, country: 'ASIA' }
    })

    expect(asiaShipping.shippingCost).toBeGreaterThan(usShipping.shippingCost)
  })

  test('throws error for physical product without weight', () => {
    expect(() => {
      calculateShipping({
        items: [{
          product: {
            ...mockProduct,
            isPhysical: true,
            weight: null
          },
          count: 1
        }],
        destinationAddress: mockAddress
      })
    }).toThrow('missing weight')
  })

  test('sums weight correctly for multiple items', () => {
    const result = calculateShipping({
      items: [
        { product: { ...mockProduct, weight: 1.0 }, count: 2 },
        { product: { ...mockProduct, weight: 0.5 }, count: 3 }
      ],
      destinationAddress: mockAddress
    })

    // Total weight should be (1.0 * 2) + (0.5 * 3) = 3.5
    expect(result.breakdown.totalWeight).toBe(3.5)
  })
})
```

---

## Part 4: Implementation Roadmap

### Phase 1: Foundation (1-2 hours)
1. ✅ Sync storefront Product schema with admin
2. ✅ Run database migration
3. ✅ Validate existing products have weight data

### Phase 2: Calculation Logic (2-3 hours)
4. ⏳ **BLOCKED:** Receive shipping formula from stakeholder
5. ⏳ Implement `calculateShipping` utility in shared package
6. ⏳ Write unit tests for calculation logic
7. ⏳ Validate with stakeholder

### Phase 3: Order Integration (2-3 hours)
8. ⏳ Update `calculateCosts` function signature
9. ⏳ Update `POST /api/orders` to load address
10. ⏳ Update `POST /api/orders` to pass address to calculateCosts
11. ⏳ Test order creation with shipping calculation

### Phase 4: Admin Panel (2-3 hours)
12. ⏳ Create `POST /api/orders/[orderId]/recalculate` endpoint
13. ⏳ Update order items endpoints to auto-recalculate
14. ⏳ Update admin form to make financial fields read-only
15. ⏳ Add recalculate button to admin form
16. ⏳ Test admin workflows

### Phase 5: Stripe Integration (1-2 hours)
17. ⏳ Update PaymentIntent creation to include shipping
18. ⏳ Add validation for amount accuracy
19. ⏳ Update webhook to log shipping metadata
20. ⏳ End-to-end payment testing

### Phase 6: Polish & Deploy (1-2 hours)
21. ⏳ Update email templates to show shipping
22. ⏳ Add product validation for missing weight
23. ⏳ Create bulk validation script
24. ⏳ Documentation
25. ⏳ Production deployment

**Total Estimated Time:** 9-15 hours (depending on formula complexity)

---

## Part 5: Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Checkout Flow                          │
└─────────────────────────────────────────────────────────────────┘

User adds products to cart
         │
         ▼
User proceeds to checkout
         │
         ▼
User selects/creates shipping address
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ POST /api/orders                                               │
│  • Authenticate user                                           │
│  • Get addressId from request                                  │
│  • Load address from database         ◄── NEW                 │
│  • Load cart with items                                        │
│  • Call calculateCosts({ cart, address })  ◄── UPDATED         │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ calculateCosts({ cart, address })                              │
│  • Calculate product totals                                    │
│  • Calculate discounts                                         │
│  • Calculate tax (9%)                                          │
│  • Call calculateShipping({ items, address })  ◄── NEW         │
│  • Calculate payable (subtotal + tax + shipping - discount)   │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ calculateShipping({ items, address })      ◄── NEW UTILITY     │
│  • Filter physical products only                               │
│  • Validate products have weight                               │
│  • Calculate total weight                                      │
│  • Calculate volumetric weight (if formula requires)           │
│  • Determine destination zone                                  │
│  • Apply shipping formula                                      │
│  • Return { shippingCost, breakdown }                          │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
Create Order in database
  • total = sum of product prices
  • discount = sum of product discounts
  • tax = calculated tax
  • shipping = calculated shipping cost     ◄── UPDATED
  • payable = total - discount + tax + shipping
         │
         ▼
Send notifications to owners (including shipping info)
         │
         ▼
Return order to frontend
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ POST /api/checkout/create-payment-intent                       │
│  • Load order from database                                    │
│  • Validate order.payable includes shipping                    │
│  • Create Stripe PaymentIntent                                 │
│    - amount = order.payable * 100 (in cents)                   │
│    - metadata includes shipping breakdown                      │
│  • Return clientSecret to frontend                             │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
User completes payment with Stripe
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ POST /api/webhooks/stripe                                      │
│  • Receive payment_intent.succeeded event                      │
│  • Verify amount matches order.payable                         │
│  • Update order.isPaid = true                                  │
│  • Log shipping amount for accounting                          │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
Order complete - payment includes shipping cost
```

---

## Part 6: Critical Blockers & Questions

### 🚫 BLOCKER: Shipping Formula Not Defined

**Status:** Waiting for stakeholder input

**Required Information:**

1. **Formula Type:**
   - [ ] Fixed rate per product
   - [ ] Weight-based calculation
   - [ ] Volumetric weight calculation
   - [ ] Distance-based calculation
   - [ ] Tiered pricing (weight ranges)
   - [ ] Carrier API integration (FedEx, UPS, USPS)
   - [ ] Custom formula

2. **Formula Variables:**
   - [ ] Product weight
   - [ ] Product dimensions (L×W×H)
   - [ ] Destination country
   - [ ] Destination state/region
   - [ ] Destination postal code
   - [ ] Number of items
   - [ ] Order total (free shipping threshold?)

3. **Example Scenarios:**
   Please provide expected shipping costs for:

   **Scenario A:** 1 product, 1kg, domestic (same country)
   **Expected Cost:** $_____

   **Scenario B:** 1 product, 1kg, international (different country)
   **Expected Cost:** $_____

   **Scenario C:** 3 products, 0.5kg each (1.5kg total), domestic
   **Expected Cost:** $_____

   **Scenario D:** Digital product (no physical shipping)
   **Expected Cost:** $0 (confirmed?)

4. **Units:**
   - [ ] Weight: kilograms (kg) or pounds (lbs)?
   - [ ] Dimensions: centimeters (cm) or inches (in)?
   - [ ] Currency: USD, EUR, other?

5. **Special Cases:**
   - [ ] Free shipping over $____ order total?
   - [ ] Flat rate for orders under ___kg?
   - [ ] Maximum shipping cost cap?
   - [ ] Handling fee (separate from shipping)?

**Please provide the formula or answer these questions to proceed.**

---

## Part 7: Risk Assessment

### High Risk Items

**1. Incorrect Formula Implementation**
- **Impact:** Customer overcharged/undercharged
- **Mitigation:**
  - Thorough testing with real scenarios
  - Stakeholder validation before production
  - Soft launch with manual verification

**2. Stripe Amount Mismatch**
- **Impact:** Payment amount doesn't match order total
- **Mitigation:**
  - Validation step in PaymentIntent creation
  - Automated tests for amount calculation
  - Webhook verification

**3. Schema Migration Issues**
- **Impact:** Data loss or inconsistency
- **Mitigation:**
  - Test migration on development database first
  - Backup production database before migration
  - Reversible migration script

### Medium Risk Items

**1. Missing Product Data**
- **Impact:** Unable to calculate shipping for some products
- **Mitigation:**
  - Validation on product create/update
  - Bulk validation script for existing products
  - Clear error messages to admin

**2. Admin Manual Edits**
- **Impact:** Data inconsistency if admin bypasses auto-calculation
- **Mitigation:**
  - Make fields truly read-only (not just disabled)
  - Remove from form schema entirely
  - Audit log for any direct database changes

### Low Risk Items

**1. Performance Impact**
- **Impact:** Calculation adds latency to order creation
- **Mitigation:**
  - Calculation should be O(n) where n = cart items
  - Typically <10ms for reasonable cart sizes
  - Monitor in production

---

## Part 8: Success Criteria

### Must Have (P0)
- [x] Physical products calculate shipping automatically
- [x] Digital products have $0 shipping
- [x] Shipping included in order.payable
- [x] Stripe PaymentIntent includes shipping in amount
- [x] Admin cannot manually edit financial fields
- [x] Order item changes trigger recalculation

### Should Have (P1)
- [x] Zone-based shipping rates (if formula requires)
- [x] Product validation for missing weight
- [x] Bulk validation script for existing products
- [x] Clear error messages
- [x] Email notifications show shipping

### Nice to Have (P2)
- [ ] Multiple shipping methods (standard, express)
- [ ] Carrier API integration (real-time rates)
- [ ] Free shipping threshold automation
- [ ] Customer-facing shipping calculator
- [ ] Shipping discount codes

---

## Part 9: Files to Create/Modify

### Create New Files
```
packages/shared/src/shipping/
├── calculate-shipping.ts         # Main calculation logic
├── shipping.types.ts             # TypeScript interfaces
├── shipping.constants.ts         # Configuration
├── shipping.utils.ts             # Helpers
├── index.ts                      # Exports
└── __tests__/
    └── calculate-shipping.test.ts

packages/shared/src/orders/
└── recalculate.ts                # Order recalculation utility

apps/admin/src/app/api/orders/[orderId]/
└── recalculate/
    └── route.ts                  # Recalculate endpoint

scripts/
└── validate-product-shipping.ts  # Bulk validation script
```

### Modify Existing Files
```
apps/storefront/
├── prisma/schema.prisma          # Add shipping fields to Product
├── src/app/api/orders/route.ts   # Update POST handler
└── src/lib/email/templates/      # Update email templates

apps/admin/
├── src/app/api/orders/[orderId]/items/route.ts          # Add recalc
├── src/app/api/orders/[orderId]/items/[productId]/route.ts  # Add recalc
└── src/app/(dashboard)/(routes)/orders/[orderId]/
    └── components/order-form.tsx  # Make fields read-only

(Future Stripe Integration)
apps/storefront/src/app/api/
├── checkout/create-payment-intent/route.ts  # Include shipping
└── webhooks/stripe/route.ts                 # Verify shipping
```

---

## Part 10: Next Steps

### Immediate Actions
1. ✅ Review this analysis document
2. ⏳ **Provide shipping calculation formula** (BLOCKER)
3. ⏳ Approve implementation approach
4. ⏳ Begin Phase 1: Schema synchronization

### After Formula Received
5. ⏳ Implement calculation utility
6. ⏳ Write unit tests
7. ⏳ Integrate with order creation
8. ⏳ Update admin panel
9. ⏳ Integrate with Stripe
10. ⏳ Deploy to production

---

## Appendix A: Related Documents

- **ORDERS_IMPLEMENTATION_PLAN.md** - Main orders system plan (9/18 steps complete)
- **STRIPE_INTEGRATION_PLAN.md** - Stripe payment integration (pending)
- **This Document** - Shipping calculation analysis and integration plan

---

## Appendix B: Questions for Stakeholder

Before implementation can begin, please answer:

1. **What is your shipping calculation formula?**
   (See Part 6: Critical Blockers for details)

2. **Do you already use a carrier (FedEx, UPS, USPS)?**
   - If yes, do you want to integrate their API for real-time rates?
   - If no, do you have a rate table or formula?

3. **What units do you use?**
   - Weight: kg or lbs?
   - Dimensions: cm or inches?

4. **Do you offer free shipping?**
   - If yes, at what order total threshold?

5. **Do rates vary by destination?**
   - Different rates for different countries?
   - Different rates for different regions within a country?

6. **How do you handle products without weight?**
   - Block order creation?
   - Use default weight?
   - Contact admin?

---

**Document Status:** ✅ Complete - Ready for Implementation
**Blocker Status:** ⏳ Waiting for shipping formula
**Created:** 2025-10-27
**Author:** Claude Code Analysis
