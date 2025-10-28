# Discount Codes Implementation Plan

## Overview
This document outlines the implementation plan for completing the discount codes feature. Currently, the feature is **partially implemented** (database model exists) but is **non-functional** (no UI, discount not applied).

---

## Current State Analysis

### ✅ What Exists:
- **Database Model:** `DiscountCode` model in Prisma schema
- **Navigation Link:** "Codes" menu item in admin panel
- **Basic Validation:** Storefront API checks if code exists and has stock

### ❌ What's Missing:
- **Admin UI:** No pages to create/edit/delete discount codes
- **API Endpoints:** No CRUD operations for discount codes
- **Discount Logic:** Codes are validated but never applied to order total
- **Stock Management:** Code usage count is never decremented
- **Customer UI:** No input field in checkout to enter codes
- **Expiration Logic:** Date validation not enforced

### 🐛 Critical Issues:
1. Customers cannot enter discount codes (no UI in checkout)
2. Even if they could, the discount amount is never calculated
3. Admin staff cannot manage codes (no admin pages)
4. Stock tracking doesn't work (never decremented)
5. Date range validation is not enforced

---

## Database Schema

```prisma
model DiscountCode {
  id                String   @id @default(cuid())
  code              String   @unique      // e.g., "SUMMER2025"
  stock             Int      @default(1)  // How many times can be used
  description       String?               // Internal note
  percent           Int                   // Discount percentage (0-100)
  maxDiscountAmount Float    @default(1) // Maximum discount cap in currency
  startDate         DateTime              // When code becomes active
  endDate           DateTime              // When code expires
  createdAt         DateTime @default(now())
  order             Order[]               // Orders that used this code
}

model Order {
  // ... other fields
  discountCodeId    String?
  discountCode      DiscountCode?   @relation(fields: [discountCodeId], references: [id])
}
```

---

## Priority 1: Critical - Admin Management

### ✅ Step 1: Create GET /api/codes endpoint
**Status:** Pending
**Description:** Create endpoint to list all discount codes
**Files to create:**
- `apps/admin/src/app/api/codes/route.ts`

**Requirements:**
- GET endpoint that fetches all discount codes
- Sort by createdAt DESC
- Include usage count (count of related orders)
- Support filtering by active/expired status
- Require X-USER-ID authentication

**Example Response:**
```json
[
  {
    "id": "abc123",
    "code": "SUMMER2025",
    "percent": 20,
    "maxDiscountAmount": 50,
    "stock": 100,
    "usedCount": 15,
    "startDate": "2025-06-01T00:00:00Z",
    "endDate": "2025-08-31T23:59:59Z",
    "isActive": true,
    "isExpired": false
  }
]
```

---

### ✅ Step 2: Create GET /api/codes/[codeId] endpoint
**Status:** Pending
**Description:** Create endpoint to fetch single discount code
**Files to create:**
- `apps/admin/src/app/api/codes/[codeId]/route.ts`

**Requirements:**
- GET endpoint that fetches single code with details
- Include related orders list
- Calculate usage statistics
- Require X-USER-ID authentication
- Return 404 if code not found

---

### ✅ Step 3: Create POST /api/codes endpoint
**Status:** Pending
**Description:** Create endpoint to add new discount codes
**Files to modify:**
- `apps/admin/src/app/api/codes/route.ts`

**Requirements:**
- POST endpoint to create new discount code
- Validate required fields: code, percent, startDate, endDate
- Ensure code is unique (case-insensitive)
- Validate percent is between 1-100
- Validate startDate < endDate
- Default stock to 1 if not provided
- Require X-USER-ID authentication

**Request Body:**
```json
{
  "code": "SUMMER2025",
  "description": "Summer sale 2025",
  "percent": 20,
  "maxDiscountAmount": 50,
  "stock": 100,
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-08-31T23:59:59Z"
}
```

---

### ✅ Step 4: Create PATCH /api/codes/[codeId] endpoint
**Status:** Pending
**Description:** Create endpoint to update discount codes
**Files to modify:**
- `apps/admin/src/app/api/codes/[codeId]/route.ts`

**Requirements:**
- PATCH endpoint to update existing code
- Allow updating: description, percent, maxDiscountAmount, stock, startDate, endDate
- Do NOT allow changing the code itself once created
- Validate percent and date ranges
- Prevent reducing stock below current usage count
- Require X-USER-ID authentication

---

### ✅ Step 5: Create DELETE /api/codes/[codeId] endpoint
**Status:** Pending
**Description:** Create endpoint to delete discount codes
**Files to modify:**
- `apps/admin/src/app/api/codes/[codeId]/route.ts`

**Requirements:**
- DELETE endpoint to remove discount code
- Check if code has been used (has related orders)
- If used: return error and suggest deactivating instead
- If not used: delete permanently
- Require X-USER-ID authentication

**Alternative:** Implement soft-delete with `isActive` field

---

### ✅ Step 6: Create codes list page
**Status:** Pending
**Description:** Create admin page to view all discount codes
**Files to create:**
- `apps/admin/src/app/(dashboard)/(routes)/codes/page.tsx`
- `apps/admin/src/app/(dashboard)/(routes)/codes/components/client.tsx`
- `apps/admin/src/app/(dashboard)/(routes)/codes/components/columns.tsx`

**Requirements:**
- Display codes in data table
- Show columns: Code, Percent, Stock, Used Count, Date Range, Status, Actions
- Color-code status: Active (green), Expired (red), Upcoming (blue)
- Add "New Code" button
- Add search/filter functionality
- Show usage percentage bar
- Actions: Edit, Delete, View Details

---

### ✅ Step 7: Create new code page
**Status:** Pending
**Description:** Create page to add new discount codes
**Files to create:**
- `apps/admin/src/app/(dashboard)/(routes)/codes/new/page.tsx`

**Requirements:**
- Reuse code-form component (to be created in Step 8)
- Breadcrumb navigation
- Success redirect to codes list

---

### ✅ Step 8: Create code form component
**Status:** Pending
**Description:** Create form for creating/editing discount codes
**Files to create:**
- `apps/admin/src/app/(dashboard)/(routes)/codes/components/code-form.tsx`

**Requirements:**
- Fields:
  - Code (text input, uppercase, alphanumeric + dashes)
  - Description (textarea, optional)
  - Percent (number input, 1-100)
  - Max Discount Amount (number input)
  - Stock (number input, minimum 1)
  - Start Date (date picker)
  - End Date (date picker)
- Validation with Zod
- Preview discount calculation
- Form state management with React Hook Form
- Loading states
- Error handling

---

### ✅ Step 9: Create edit code page
**Status:** Pending
**Description:** Create page to edit existing discount codes
**Files to create:**
- `apps/admin/src/app/(dashboard)/(routes)/codes/[codeId]/page.tsx`

**Requirements:**
- Reuse code-form component
- Load existing code data
- Show usage statistics
- Disable code field (cannot change code once created)
- Warning if reducing stock below usage
- Delete button with confirmation
- Show related orders list

---

## Priority 2: High - Customer Integration

### ✅ Step 10: Add discount code validation function
**Status:** Pending
**Description:** Create reusable function to validate discount codes
**Files to create:**
- `apps/storefront/src/lib/discount-codes.ts`

**Requirements:**
- Function to validate code:
  - Exists in database
  - Has stock available (stock > used count)
  - Is within date range (startDate <= now <= endDate)
  - Return discount details or error
- Calculate discount amount:
  - Apply percentage to order total
  - Cap at maxDiscountAmount
  - Return final discount value

**Example:**
```typescript
export async function validateDiscountCode(code: string, orderTotal: number) {
  const discountCode = await prisma.discountCode.findUnique({
    where: { code: code.toUpperCase() },
    include: { _count: { select: { order: true } } }
  })

  if (!discountCode) {
    throw new Error('Invalid discount code')
  }

  if (discountCode._count.order >= discountCode.stock) {
    throw new Error('Discount code is no longer available')
  }

  const now = new Date()
  if (now < discountCode.startDate || now > discountCode.endDate) {
    throw new Error('Discount code is not valid at this time')
  }

  const discountAmount = Math.min(
    (orderTotal * discountCode.percent) / 100,
    discountCode.maxDiscountAmount
  )

  return {
    id: discountCode.id,
    code: discountCode.code,
    percent: discountCode.percent,
    discountAmount,
    finalTotal: orderTotal - discountAmount
  }
}
```

---

### ✅ Step 11: Update order creation to apply discount
**Status:** Pending
**Description:** Modify order creation to actually apply discount
**Files to modify:**
- `apps/storefront/src/app/api/orders/route.ts` (lines 66-77)

**Current Issue:**
```typescript
// Current code validates but doesn't apply discount
if (discountCode) {
  const discount = await prisma.discountCode.findUniqueOrThrow({
    where: { code: discountCode },
  })
  if (discount.stock < 1) {
    throw new Error('Discount code is not available')
  }
}
```

**Required Changes:**
1. Use validation function from Step 10
2. Calculate discount amount
3. Subtract discount from payable amount
4. Store discount amount in order
5. Link discount code to order
6. Validate dates and stock

**Fixed Code:**
```typescript
let discountAmount = 0
let discountCodeId = null

if (discountCode) {
  const validation = await validateDiscountCode(discountCode, total)
  discountAmount = validation.discountAmount
  discountCodeId = validation.id
}

const order = await prisma.order.create({
  data: {
    // ... other fields
    discount: discountAmount,
    payable: total + shipping + tax - discountAmount,
    discountCodeId: discountCodeId,
  }
})
```

---

### ✅ Step 12: Add discount code input in checkout
**Status:** Pending
**Description:** Add UI for customers to enter discount codes
**Files to modify:**
- `apps/storefront/src/app/(routes)/checkout/components/checkout-form.tsx` (or equivalent)

**Requirements:**
- Add discount code input field
- "Apply" button to validate code
- Show loading state while validating
- Display error messages if invalid
- Show success message with discount amount
- Update order total in real-time
- Remove code button
- Show discount breakdown in receipt

**UI Flow:**
1. Customer enters code
2. Click "Apply"
3. Call API to validate
4. If valid: Show discount amount, update total
5. If invalid: Show error message
6. Allow removing code to recalculate

---

### ✅ Step 13: Create discount code validation API
**Status:** Pending
**Description:** Create public API to validate codes before checkout
**Files to create:**
- `apps/storefront/src/app/api/discount-codes/validate/route.ts`

**Requirements:**
- POST endpoint to validate discount code
- Accept code and orderTotal
- Return discount details or error
- No authentication required (public API)
- Rate limiting to prevent brute force

**Request:**
```json
{
  "code": "SUMMER2025",
  "orderTotal": 150.00
}
```

**Response:**
```json
{
  "valid": true,
  "code": "SUMMER2025",
  "percent": 20,
  "discountAmount": 30.00,
  "finalTotal": 120.00
}
```

---

### ✅ Step 14: Update receipt component
**Status:** Pending
**Description:** Show discount code details in order receipt
**Files to modify:**
- `apps/storefront/src/components/receipt.tsx` (or equivalent)

**Requirements:**
- Display discount code used (if any)
- Show discount percentage
- Show discount amount as negative line item
- Update total calculation
- Style discount in green/highlighted

**Example Display:**
```
Subtotal:        $150.00
Shipping:        $10.00
Tax:             $12.00
---
Discount (SUMMER2025 -20%):  -$30.00
---
Total:           $142.00
```

---

## Priority 3: Medium - Enhancements

### ✅ Step 15: Add usage analytics
**Status:** Pending
**Description:** Track and display discount code analytics
**Files to create:**
- `apps/admin/src/app/(dashboard)/(routes)/codes/[codeId]/analytics/page.tsx`

**Requirements:**
- Total usage count
- Revenue impact (total discount given)
- Usage over time chart
- Top customers using the code
- Average order value with code
- Conversion rate

---

### ✅ Step 16: Implement code generator
**Status:** Pending
**Description:** Add bulk code generation feature
**Files to create:**
- `apps/admin/src/app/(dashboard)/(routes)/codes/generate/page.tsx`

**Requirements:**
- Generate N codes with same settings
- Format options: Random, Sequential, Custom pattern
- Bulk create in single transaction
- Export to CSV
- Use cases: Gift cards, promotional campaigns

**Example:**
```
Generate 100 codes:
Pattern: GIFT-[RANDOM-8]
Result: GIFT-A7X9K2L4, GIFT-B3M8P1Q9, ...
```

---

### ✅ Step 17: Add code stacking rules
**Status:** Pending
**Description:** Allow/prevent multiple codes per order
**Files to modify:**
- Schema: Add `allowStacking` boolean to DiscountCode
- Order creation logic to handle multiple codes
- UI to show multiple code inputs

**Requirements:**
- Flag codes as stackable or not
- Validate stacking rules during checkout
- Apply multiple discounts in order
- Show breakdown of each discount

---

### ✅ Step 18: Implement minimum order value
**Status:** Pending
**Description:** Add minimum purchase requirement for codes
**Files to modify:**
- Schema: Add `minOrderValue Float?` to DiscountCode
- Validation to check order meets minimum
- Display minimum in error message

**Example:**
```
Error: "Code SAVE20 requires minimum order of $50.00"
```

---

### ✅ Step 19: Add user-specific codes
**Status:** Pending
**Description:** Create codes that only work for specific users
**Files to modify:**
- Schema: Add `userId String?` to DiscountCode
- Schema: Add relation to User model
- Validation to check user eligibility

**Use Cases:**
- Personalized codes for VIP customers
- Referral codes
- Customer service compensation codes

---

### ✅ Step 20: Add category/product restrictions
**Status:** Pending
**Description:** Limit codes to specific products or categories
**Files to create:**
- Schema: Add many-to-many relations
- Validation to check cart items

**Requirements:**
- Code applies only to eligible products
- Calculate discount only on eligible items
- Show which items are discounted
- Clear messaging about restrictions

---

## Priority 4: Low - Nice to Have

### ✅ Step 21: Email code distribution
**Status:** Pending
**Description:** Send discount codes via email
**Requirements:**
- Email template for code delivery
- Bulk email sending
- Track email open/click rates
- Integration with email service

---

### ✅ Step 22: Auto-apply codes
**Status:** Pending
**Description:** Automatically apply best available code
**Requirements:**
- Check all eligible codes for user
- Calculate and compare all discounts
- Auto-apply the best one
- Option to manually choose different code

---

### ✅ Step 23: Referral code system
**Status:** Pending
**Description:** Generate unique codes for user referrals
**Requirements:**
- Auto-generate code per user
- Track referral attribution
- Reward both referrer and referee
- Referral analytics dashboard

---

### ✅ Step 24: Code scheduling
**Status:** Pending
**Description:** Schedule future code activations
**Requirements:**
- Automated activation at start date
- Automated deactivation at end date
- Queue system for scheduled changes
- Notifications before expiration

---

## Implementation Order Recommendation

### Phase 1: Admin Foundation (Steps 1-9)
Start here to give staff ability to manage codes. This is the foundation.

**Estimated Effort:** 2-3 days
**Priority:** Critical

---

### Phase 2: Customer Integration (Steps 10-14)
Make codes actually work for customers. This completes the core feature.

**Estimated Effort:** 1-2 days
**Priority:** High

---

### Phase 3: Analytics & Enhancements (Steps 15-20)
Add advanced features and tracking.

**Estimated Effort:** 2-3 days
**Priority:** Medium

---

### Phase 4: Advanced Features (Steps 21-24)
Nice-to-have features for marketing campaigns.

**Estimated Effort:** 2-4 days
**Priority:** Low

---

## How to Use This Document

1. **Read each step carefully** before starting
2. **Tell me which step number** you want me to implement (e.g., "implement step 1")
3. **I'll complete that step** and mark it as done
4. **Review the changes** and test
5. **Move to the next step** or request modifications

## Current Status

- **Completed Steps:** 0/24
- **In Progress:** None
- **Next Recommended:** Step 1 (Create GET /api/codes endpoint)

---

## Dependencies

- All API endpoints require X-USER-ID header (middleware handles this)
- Use Zod for validation
- Follow shadcn/ui patterns for components
- Use Prisma for database operations
- Follow existing code style and patterns

---

## Testing Checklist

After completing implementation, verify:

- [ ] Admin can create discount codes
- [ ] Admin can edit discount codes
- [ ] Admin can delete unused codes
- [ ] Cannot delete codes that have been used
- [ ] Customers can enter codes in checkout
- [ ] Valid codes reduce order total correctly
- [ ] Invalid codes show proper error messages
- [ ] Expired codes are rejected
- [ ] Codes with no stock are rejected
- [ ] Discount respects maxDiscountAmount cap
- [ ] Stock is decremented when code is used
- [ ] Multiple uses of same code are prevented when stock is depleted
- [ ] Date range validation works correctly
- [ ] Receipt shows discount breakdown
- [ ] Order history shows which code was used
