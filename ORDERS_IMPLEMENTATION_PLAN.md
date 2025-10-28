# Orders System Implementation Plan

## Overview
This document outlines the step-by-step implementation plan for completing the orders system in the admin panel.

---

## Priority 1: Critical - Fix Broken Functionality

### ✅ Step 1: Create GET /api/orders endpoint
**Status:** ✅ COMPLETED (2025-10-25)
**Description:** Create the main orders listing endpoint
**Files created:**
- ✅ `apps/admin/src/app/api/orders/route.ts`

**Completed Requirements:**
- ✅ GET endpoint that fetches all orders with relations (user, address, orderItems with products)
- ✅ Support filtering by userId, status, isPaid, isCompleted
- ✅ Return orders sorted by createdAt DESC
- ✅ Require X-USER-ID authentication
- ✅ Tested and working

---

### ✅ Step 2: Create GET /api/orders/[orderId] endpoint
**Status:** ✅ COMPLETED (2025-10-25)
**Description:** Create single order fetching endpoint
**Files created:**
- ✅ `apps/admin/src/app/api/orders/[orderId]/route.ts`

**Completed Requirements:**
- ✅ GET endpoint that fetches single order with all relations
- ✅ Include: user, address, orderItems (with product details), payments, refund, discountCode
- ✅ Require X-USER-ID authentication
- ✅ Return 404 if order not found
- ✅ Tested and working

---

### ✅ Step 3: Create PATCH /api/orders/[orderId] endpoint
**Status:** ✅ COMPLETED (2025-10-25)
**Description:** Create order update endpoint
**Files modified:**
- ✅ `apps/admin/src/app/api/orders/[orderId]/route.ts`

**Completed Requirements:**
- ✅ PATCH endpoint for updating order fields
- ✅ Allowed fields: status, total, shipping, payable, tax, discount, isPaid, isCompleted, addressId, discountCodeId
- ✅ Validate status against OrderStatusEnum
- ✅ Require X-USER-ID authentication
- ✅ Return updated order with relations
- ✅ **Bonus:** Integrated notification system for status changes and payment updates
- ✅ Tested and working

---

### ✅ Step 4: Fix order-form.tsx API endpoint
**Status:** ✅ COMPLETED (2025-10-25)
**Description:** Update order form to call correct API
**Files modified:**
- ✅ `apps/admin/src/app/(dashboard)/(routes)/orders/[orderId]/components/order-form.tsx`

**Completed Changes:**
- ✅ Changed `/api/products/${params.productId}` to `/api/orders/${params.orderId}`
- ✅ Updated redirect from `/products` to `/orders`
- ✅ Added `Content-Type: application/json` headers
- ✅ Updated form schema to match Order model fields
- ✅ Removed product-specific fields, added order-specific fields
- ✅ Tested and working

---

### ✅ Step 5: Add OrderStatusEnum selector
**Status:** ✅ COMPLETED (2025-10-25)
**Description:** Replace text input with proper status dropdown
**Files modified:**
- ✅ `apps/admin/src/app/(dashboard)/(routes)/orders/[orderId]/components/order-form.tsx`

**Completed Requirements:**
- ✅ Imported OrderStatusEnum values (Processing, Shipped, Delivered, ReturnProcessing, ReturnCompleted, Cancelled, RefundProcessing, RefundCompleted, Denied)
- ✅ Replaced status text input with Select component
- ✅ Added proper FormField with validation
- ✅ Dropdown shows all 9 status options
- ✅ Tested and working

---

### ✅ Step 6: Fix misleading form labels
**Status:** ✅ COMPLETED (2025-10-25)
**Description:** Update labels to reflect actual fields and add missing fields
**Files modified:**
- ✅ `apps/admin/src/app/(dashboard)/(routes)/orders/[orderId]/components/order-form.tsx`

**Completed Changes:**
- ✅ "Featured" → "Paid" (for isPaid field)
- ✅ "Available" → "Completed" (for isCompleted field)
- ✅ "Price" → "Shipping Cost" (for shipping field)
- ✅ "Discount" → "Total Payable" (for payable field)
- ✅ Added "Order Total" field (total)
- ✅ Added "Tax Amount" field (tax)
- ✅ Added "Discount Amount" field (discount)
- ✅ Added descriptive FormDescription for each field
- ✅ Updated placeholders to "0.00"
- ✅ Tested and working

---

## Priority 2: High - Important Missing Features

### ✅ Step 7: Create order item management UI
**Status:** ✅ COMPLETED (2025-10-25)
**Description:** Add ability to manage items in existing orders
**Files created:**
- ✅ `apps/admin/src/app/(dashboard)/(routes)/orders/[orderId]/components/order-items-list.tsx`
- ✅ `apps/admin/src/app/api/orders/[orderId]/items/[productId]/route.ts`

**Files modified:**
- ✅ `apps/admin/src/app/(dashboard)/(routes)/orders/[orderId]/page.tsx`

**Completed Requirements:**
- ✅ Display list of current order items in table format
- ✅ Show product image, name, price, discount, count, subtotal
- ✅ Inline editing for item quantity (click → edit → save/cancel)
- ✅ Delete button to remove items with confirmation
- ✅ Calculate and display item subtotals automatically
- ✅ Show items total and total quantity summary
- ✅ Created PATCH endpoint for updating item count
- ✅ Created DELETE endpoint for removing items
- ✅ Accordion UI following project theme
- ✅ Tested and working

---

### ✅ Step 8: Implement refund processing
**Status:** COMPLETED (Partial - needs Stripe integration)
**Description:** Add UI and API for processing refunds
**Files created:**
- `apps/admin/src/app/api/orders/[orderId]/refund/route.ts` ✅
- `apps/admin/src/components/modals/refund-modal.tsx` ✅
- `apps/admin/src/app/(dashboard)/(routes)/orders/[orderId]/components/refund-section.tsx` ✅
- `apps/admin/src/components/ui/textarea.tsx` ✅

**Completed:**
- ✅ Refund modal with amount and reason fields
- ✅ POST endpoint to create refund
- ✅ Update order status to RefundProcessing
- ✅ Link refund to order (one-to-one relationship)
- ✅ Show refund details in order form if exists
- ✅ Validation: amount <= order.payable
- ✅ Validation: only one refund per order
- ✅ Validation: order must be paid first

**TODO - Future Enhancements (Step 8.5):**
- [ ] **Stripe Integration** - Process actual refund via Stripe API
- [ ] **Refund Status Tracking** - Add `status` field to Refund model:
  - `Pending` - Refund created, awaiting processing
  - `Processing` - Being processed by payment provider
  - `Completed` - Funds returned to customer
  - `Failed` - Refund failed, needs manual intervention
- [ ] **Payment Provider Integration:**
  - Get payment details from order.payments
  - Call Stripe refund API with payment intent ID
  - Handle async webhook responses
  - Update refund status based on provider response
- [ ] **Partial Refunds:**
  - Allow multiple partial refunds up to total amount
  - Track total refunded amount
  - Update schema: remove `unique` constraint on orderId
  - Add `totalRefunded` field to Order model
- [ ] **Admin Actions:**
  - "Mark Refund as Completed" button (manual override)
  - "Retry Refund" button (if failed)
  - View refund transaction logs
- [ ] **Customer Notifications:**
  - Email when refund is initiated
  - Email when refund is completed
  - Email if refund fails
- [ ] **Audit Trail:**
  - Log who initiated refund
  - Log Stripe response
  - Track status changes

**Implementation Notes:**
```typescript
// Future Stripe integration example
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// In refund endpoint:
const payment = order.payments.find(p => p.isSuccessful)
if (payment && payment.refId) {
  const stripeRefund = await stripe.refunds.create({
    payment_intent: payment.refId,
    amount: Math.round(amount * 100), // Convert to cents
    reason: 'requested_by_customer',
    metadata: {
      orderId: order.id,
      refundId: refund.id,
    }
  })

  // Update refund with Stripe data
  await prisma.refund.update({
    where: { id: refund.id },
    data: {
      status: 'Processing',
      stripeRefundId: stripeRefund.id,
    }
  })
}
```

**Database Schema Changes Needed:**
```prisma
model Refund {
  id              String   @id @default(cuid())
  amount          Float
  reason          String
  status          RefundStatus @default(Pending) // NEW
  stripeRefundId  String?  @unique              // NEW
  processedAt     DateTime?                     // NEW
  failureReason   String?                       // NEW
  orderId         String   @unique
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  order           Order    @relation(fields: [orderId], references: [id])
}

enum RefundStatus {
  Pending
  Processing
  Completed
  Failed
}
```

---

### ✅ Step 9: Add notification system
**Status:** ✅ COMPLETED (2025-10-25)
**Description:** Send notifications when order status changes
**Files created:**
- ✅ `apps/admin/src/lib/notifications.ts`

**Files modified:**
- ✅ `apps/admin/src/app/api/orders/[orderId]/route.ts` (integrated notifications)
- ✅ `apps/admin/src/app/api/orders/[orderId]/refund/route.ts` (refund notifications)

**Completed Requirements:**
- ✅ Create notification when status changes
- ✅ Link to user via userId from order
- ✅ Different messages per status change (9 status-specific messages)
- ✅ Mark as unread by default (isRead: false)
- ✅ Notification for payment received (isPaid change)
- ✅ Notification for refund initiated
- ✅ Non-blocking error handling (notifications don't break order updates)
- ✅ Console logging for debugging
- ✅ Tested and working (notifications stored in database)

**Functions implemented:**
- `createOrderNotification()` - Status change notifications
- `createRefundNotification()` - Refund initiated notifications
- `createPaymentNotification()` - Payment received notifications

**Future Enhancement:**
- [ ] Email notifications (requires email service integration)
- [ ] SMS notifications (optional)
- [ ] Push notifications (optional)

---

### ✅ Step 10: Implement bulk operations
**Status:** Pending
**Description:** Add multi-select and bulk actions for orders
**Files to modify:**
- `apps/admin/src/app/(dashboard)/(routes)/orders/components/client.tsx`

**Requirements:**
- Add checkbox column to data table
- Track selected order IDs
- Bulk actions dropdown: Update Status, Export to CSV, Mark as Paid
- Confirmation modal for bulk operations
- API endpoint for bulk updates

---

## Priority 3: Medium - Enhancements

### ⏸️ Step 11: Tax and Shipping Calculations & Auto-Calculate Fields
**Status:** Discussion Required
**Description:** Implement automatic tax and shipping cost calculations + Make order form fields read-only/auto-calculated

---

## 🔴 CURRENT PROBLEM (Identified 2025-10-25)

**Issue:** Admin can manually edit financial fields (total, shipping, tax, payable, discount) in order-form.tsx
- This is **INCORRECT** for a real e-commerce flow
- Prone to human errors
- These values should be calculated automatically

**Current Flow (WRONG):**
```
Admin manually enters:
  ├─ Order Total
  ├─ Shipping Cost
  ├─ Tax Amount
  ├─ Total Payable
  └─ Discount
```

**Correct Flow (SHOULD BE):**
```
Client creates order (Storefront) →
  System auto-calculates (already implemented in storefront):
    ├─ Total = sum(item.price × item.count)
    ├─ Discount = sum(item.discount × item.count)
    ├─ Tax = (Total - Discount) × 0.09
    ├─ Shipping = [TBD: by weight/zone/API]
    └─ Payable = Total + Shipping + Tax - Discount
      ↓
  Order created with calculated values →
      ↓
  Payment processed (Stripe/PayPal) →
      ↓
  isPaid = true (automatically)
      ↓
  Admin VIEWS order (values are READ-ONLY)
```

**Note:** Calculation logic already exists in:
- File: `apps/storefront/src/app/api/orders/route.ts:153-173`
- Function: `calculateCosts({ cart })`

---

## 📋 Required Changes for Step 11

### Part A: Admin Form Field Behavior

**Make these fields READ-ONLY (calculated, not editable):**
- `total` - Calculated from order items
- `tax` - Calculated from subtotal
- `discount` - Calculated from discount codes & product discounts

**Make these fields CONDITIONALLY EDITABLE:**
- `shipping` - Can adjust for exceptions (e.g., shipping refund, correction)
- `payable` - Auto-recalculates when shipping changes

**Keep these fields EDITABLE:**
- `status` - Admin changes order status
- `isPaid` - Admin can mark as paid manually
- `isCompleted` - Admin marks order as completed

### Part B: Auto-Calculation Logic

**When to recalculate:**
1. When order items are added/removed/updated (Step 7)
2. When discount code is applied/removed
3. When shipping is manually adjusted
4. When admin clicks "Recalculate" button (emergency use)

**Formula:**
```javascript
total = sum(orderItems.map(item => item.price * item.count))
discount = sum(orderItems.map(item => item.discount * item.count)) + discountCodeAmount
afterDiscount = total - discount
tax = afterDiscount × taxRate  // Currently 0.09 (9%)
payable = afterDiscount + shipping + tax
```

### Part C: UI/UX Improvements

**Add visual indicators:**
- 🔒 Icon next to read-only fields
- 🧮 "Auto-calculated" badge
- 💡 Tooltip explaining calculation
- ⚠️  Warning when manually overriding shipping

**Add action buttons:**
- "Recalculate All" button (recalculates everything)
- "Unlock" button for emergency manual edits (with confirmation)
- "Apply Discount Code" button

---

## 🎯 Implementation Strategy (Step 11)

### Option A: Full Read-Only (Recommended for MVP)
```
✅ All financial fields disabled
✅ Display formulas in tooltips
✅ Only editable via order items management
⚠️  Shipping locked (unless "Unlock" clicked)
```

### Option B: Smart Auto-Calculate
```
✅ Fields show calculated values
✅ Can override if needed
⚠️  Shows warning when overriding
✅ "Reset to calculated" button available
```

### Option C: Hybrid (Most Flexible)
```
✅ Total, Tax, Discount = READ-ONLY
✅ Shipping = Editable with calculation suggestion
✅ Payable = Auto-updates when shipping changes
✅ "Override Mode" toggle for admin users
```

**Recommended: Option C (Hybrid)**

---

## 📝 Step 11 Implementation Tasks

**Files to modify:**
- `apps/admin/src/app/(dashboard)/(routes)/orders/[orderId]/components/order-form.tsx`
  - Add `disabled` prop to read-only fields
  - Add calculation display/tooltips
  - Add recalculate logic

- `apps/admin/src/app/api/orders/[orderId]/route.ts`
  - Add validation to prevent manual override (optional)
  - Add recalculate endpoint

- Create new utility:
  - `apps/admin/src/lib/order-calculations.ts`
  - Extract `calculateCosts` function
  - Add TypeScript types
  - Reuse in both admin and storefront

**Requirements:**
- [x] Calculate total from order items
- [x] Calculate discount from items + discount code
- [ ] Calculate tax based on configurable rate
- [ ] Calculate shipping (decision needed - see below)
- [ ] Auto-update payable when dependencies change
- [ ] Add visual indicators for calculated fields
- [ ] Add manual override option with confirmation
- [ ] Log changes when admin overrides calculations

---

## 🚦 Before Proceeding with Step 11 - Decisions Needed:

1. **Shipping Calculation Method:**
   - [ ] By weight only
   - [ ] By dimensions (volumetric weight)
   - [ ] Hybrid (greater of actual vs volumetric)
   - [ ] Fixed rates by region/country
   - [ ] Third-party API integration (ShipEngine, EasyPost)
   - [x] **Current:** Manual entry (shipping = 0 in calculateCosts)

2. **Tax Calculation Method:**
   - [x] **Current:** Single fixed tax rate (9%)
   - [ ] Variable by product category
   - [ ] Variable by customer location
   - [ ] Tax exempt products support

3. **Field Override Policy:**
   - [ ] Never allow manual override (strict)
   - [ ] Allow with admin confirmation (recommended)
   - [ ] Allow freely with audit log
   - [ ] Role-based (only super-admin can override)

4. **Calculation Trigger:**
   - [ ] Real-time (on every field change)
   - [ ] On save (when form submits)
   - [ ] Manual (admin clicks "Recalculate")
   - [ ] Hybrid (auto + manual option)

5. **Database Requirements:**
   - [ ] Create ShippingZone model
   - [ ] Create ShippingRate model
   - [ ] Create TaxRate model
   - [ ] Add configuration table for tax rates
   - [ ] Add OrderHistory for audit trail

---

## 🔗 Related Steps

- **Step 7:** Create order item management UI (needed for recalculation)
- **Step 12:** Add order audit trail (track manual overrides)
- **Step 13:** Implement financial validation (prevent invalid calculations)

---

**Priority:** Medium → High (affects data integrity)
**Complexity:** Medium
**Estimated Time:** 4-6 hours
**Dependencies:** Step 7 (order items management)

---

### ✅ Step 12: Add order audit trail
**Status:** Pending
**Description:** Track all changes made to orders
**Files to create:**
- Add OrderHistory model to schema
- Create audit logging middleware

**Requirements:**
- Record who changed what and when
- Track status changes, amount changes, field updates
- Display history timeline in order detail view
- Include admin user info (need to add Owner relation)

---

### ✅ Step 13: Implement financial validation
**Status:** Pending
**Description:** Add validation for order financial calculations
**Files to modify:**
- `apps/admin/src/app/api/orders/[orderId]/route.ts`

**Requirements:**
- Validate: payable = total + shipping + tax - discount
- Ensure discount doesn't exceed total
- Validate shipping > 0 if physical products
- Check discount code validity (stock, dates)
- Prevent negative amounts

---

## Priority 4: Low - Nice to Have

### ✅ Step 14: Add order creation from admin
**Status:** Pending
**Description:** Allow admins to create orders manually
**Files to create:**
- `apps/admin/src/app/(dashboard)/(routes)/orders/new/page.tsx`

**Requirements:**
- Product selector with search
- Customer selector
- Address selector or creation
- Calculate totals automatically
- Create order with items in single transaction

---

### ✅ Step 15: Implement advanced filtering
**Status:** Pending
**Description:** Add comprehensive search and filter options
**Files to modify:**
- `apps/admin/src/app/(dashboard)/(routes)/orders/components/client.tsx`

**Requirements:**
- Date range picker
- Customer search
- Order number search
- Amount range filter
- Multiple status filter
- Payment method filter

---

### ✅ Step 16: Add reporting and analytics
**Status:** Pending
**Description:** Create orders analytics dashboard
**Files to create:**
- `apps/admin/src/app/(dashboard)/(routes)/analytics/orders/page.tsx`

**Requirements:**
- Total revenue chart
- Orders by status breakdown
- Average order value
- Top products by revenue
- Revenue by date range
- Export reports to PDF/CSV

---

### ✅ Step 17: Add order templates
**Status:** Pending
**Description:** Create reusable order templates

**Requirements:**
- Save order configurations as templates
- Quick create from template
- Template management UI

---

### ✅ Step 18: Webhook support
**Status:** Pending
**Description:** Allow external systems to receive order updates

**Requirements:**
- Webhook configuration UI
- Event types: order.created, order.updated, order.paid, order.shipped
- Retry logic for failed webhooks
- Webhook logs

---

## How to Use This Document

1. **Read each step carefully** before starting
2. **Tell me which step number** you want me to implement (e.g., "implement step 1")
3. **I'll complete that step** and mark it as done
4. **Review the changes** and test
5. **Move to the next step** or request modifications

## Current Status

- **Completed Steps:** 9/18 (50% complete) ✅
- **Last Updated:** 2025-10-25
- **In Progress:** None
- **Blocked:** Step 11 (needs decisions on tax/shipping calculations)
- **Next Recommended:** Step 10 (Implement bulk operations)

### ✅ Completed (Steps 1-9):
1. ✅ GET /api/orders endpoint
2. ✅ GET /api/orders/[orderId] endpoint
3. ✅ PATCH /api/orders/[orderId] endpoint
4. ✅ Fix order-form.tsx API endpoints
5. ✅ OrderStatusEnum selector
6. ✅ Fix misleading form labels + add missing fields
7. ✅ Order item management UI (CRUD)
8. ✅ Refund processing system
9. ✅ Notification system

### 📋 Pending (Steps 10-18):
10. ⏳ Implement bulk operations
11. ⏸️ Tax and Shipping Calculations (blocked - needs decisions)
12. ⏳ Add order audit trail
13. ⏳ Implement financial validation
14. ⏳ Add order creation from admin
15. ⏳ Implement advanced filtering
16. ⏳ Add reporting and analytics
17. ⏳ Add order templates
18. ⏳ Webhook support

---

## Notes

- All API endpoints require X-USER-ID header (middleware handles this)
- Use Prisma transactions for operations affecting multiple tables
- Follow existing code patterns (shadcn/ui, Zod validation, React Hook Form)
- Test each step before moving to next
- Run `npx prisma db push` if schema changes are needed
