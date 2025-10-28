# STRIPE INTEGRATION IMPLEMENTATION PLAN

## Overview
Complete Stripe integration for payment processing, refunds, and financial automation following Test-Driven Development (TDD) methodology.

---

## PHASE 1: BASIC PAYMENT INTEGRATION

### Step 1: Stripe Configuration & Setup
**Status:** Pending
**Estimated Time:** 30 minutes

#### Requirements:
- [ ] Install Stripe npm packages (`stripe`, `@stripe/stripe-js`)
- [ ] Add Stripe keys to environment variables (`.env.local`)
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- [ ] Create Stripe client singleton (`/lib/stripe.ts`)
- [ ] Create Stripe client-side helper (`/lib/stripe-client.ts`)

#### Files to Create/Modify:
- `apps/admin/.env.local` (add Stripe keys)
- `apps/storefront/.env.local` (add Stripe keys)
- `apps/admin/src/lib/stripe.ts`
- `apps/storefront/src/lib/stripe.ts`
- `apps/storefront/src/lib/stripe-client.ts`
- `package.json` (add dependencies)

#### Testing:
```bash
# Test 1: Verify environment variables loaded
# In browser DevTools console or API route:
console.log(process.env.STRIPE_SECRET_KEY ? 'Stripe configured' : 'Missing keys')

# Test 2: Test Stripe client connection
# Create test endpoint that retrieves Stripe account info
```

---

### Step 2: Create Payment Intent API Endpoint
**Status:** Pending
**Estimated Time:** 1 hour

#### Requirements:
- [ ] Create POST `/api/checkout/create-payment-intent` endpoint
- [ ] Accept: `orderId` in request body
- [ ] Validate order exists and is not already paid
- [ ] Calculate amount from order (payable field in cents)
- [ ] Create Stripe PaymentIntent
- [ ] Store `stripePaymentIntentId` in Order model
- [ ] Return `clientSecret` to frontend
- [ ] Add metadata: `orderId`, `orderNumber`, `userId`

#### Database Changes:
```prisma
model Order {
  // ... existing fields
  stripePaymentIntentId String? @unique
  stripeCustomerId      String?
}
```

#### Files to Create/Modify:
- `apps/storefront/src/app/api/checkout/create-payment-intent/route.ts`
- `prisma/schema.prisma` (add Stripe fields to Order)
- Run: `npx prisma migrate dev --name add_stripe_fields_to_order`

#### Testing:
```javascript
// Test in browser DevTools after logging in to storefront
const response = await fetch('/api/checkout/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId: 'YOUR_ORDER_ID' })
})
const data = await response.json()
console.log('Client Secret:', data.clientSecret)
console.log('Payment Intent ID:', data.paymentIntentId)

// Expected: Returns clientSecret and paymentIntentId
// Verify in Stripe Dashboard: Payment Intent appears with correct amount
```

---

### Step 3: Checkout Page with Stripe Elements
**Status:** Pending
**Estimated Time:** 2 hours

#### Requirements:
- [ ] Create checkout page at `/checkout/[orderId]`
- [ ] Load order details (items, total, shipping address)
- [ ] Initialize Stripe Elements with Payment Element
- [ ] Create payment form with Stripe Elements
- [ ] Handle payment submission
- [ ] Show loading states during payment
- [ ] Handle payment success/error
- [ ] Redirect to order confirmation on success
- [ ] Display error messages from Stripe

#### Files to Create/Modify:
- `apps/storefront/src/app/(routes)/checkout/[orderId]/page.tsx`
- `apps/storefront/src/components/checkout/payment-form.tsx`
- `apps/storefront/src/components/checkout/order-summary.tsx`

#### Testing:
```
Manual Test Flow:
1. Navigate to: http://localhost:7777/checkout/YOUR_ORDER_ID
2. Verify order summary displays correctly
3. Fill in test card: 4242 4242 4242 4242, any future date, any 3 digits
4. Click "Pay Now"
5. Verify loading state appears
6. Verify redirect to confirmation page
7. Check Stripe Dashboard: Payment should show as succeeded
8. Check database: Order.isPaid should be false (webhook will update it)

Test Cards (Stripe Test Mode):
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Requires Auth: 4000 0025 0000 3155
```

---

### Step 4: Stripe Webhooks Endpoint
**Status:** Pending
**Estimated Time:** 1.5 hours

#### Requirements:
- [ ] Create POST `/api/webhooks/stripe` endpoint
- [ ] Verify webhook signature from Stripe
- [ ] Handle `payment_intent.succeeded` event
  - Update Order: `isPaid = true`
  - Create Payment record
  - Create notification for user
- [ ] Handle `payment_intent.payment_failed` event
  - Update Order status to 'Denied'
  - Create notification for user
- [ ] Handle `charge.refunded` event (for future refunds)
- [ ] Return 200 status to acknowledge receipt
- [ ] Log all webhook events for debugging

#### Database Changes:
```prisma
model Payment {
  // ... existing fields
  stripeChargeId     String? @unique
  stripeRefundId     String?
  stripePaymentMethod String?
}
```

#### Files to Create/Modify:
- `apps/storefront/src/app/api/webhooks/stripe/route.ts`
- `prisma/schema.prisma` (add Stripe fields to Payment)
- Run: `npx prisma migrate dev --name add_stripe_fields_to_payment`

#### Testing:
```bash
# Test 1: Install Stripe CLI
stripe login

# Test 2: Forward webhooks to local server
stripe listen --forward-to localhost:7777/api/webhooks/stripe

# Test 3: Trigger test payment_intent.succeeded event
stripe trigger payment_intent.succeeded

# Test 4: Check logs in terminal
# Expected: "[WEBHOOK] payment_intent.succeeded processed"

# Test 5: Verify in database
# Check Order.isPaid = true
# Check Payment record created
# Check Notification created

# Test 6: Check Stripe Dashboard
# Webhooks section should show successful delivery
```

---

### Step 5: Order Confirmation Page
**Status:** Pending
**Estimated Time:** 1 hour

#### Requirements:
- [ ] Create order confirmation page at `/order-confirmation/[orderId]`
- [ ] Display order number, total paid, payment method
- [ ] Show order items with images
- [ ] Display shipping address
- [ ] Show estimated delivery date
- [ ] Add "View Order Details" button
- [ ] Add "Continue Shopping" button
- [ ] Only accessible if order is paid

#### Files to Create/Modify:
- `apps/storefront/src/app/(routes)/order-confirmation/[orderId]/page.tsx`

#### Testing:
```
Manual Test Flow:
1. Complete a test payment (Step 3)
2. Should redirect to: http://localhost:7777/order-confirmation/ORDER_ID
3. Verify all order details display correctly
4. Verify payment status shows "Paid"
5. Test "View Order Details" button navigation
6. Test "Continue Shopping" button navigation
7. Try accessing URL directly without payment: should redirect or show error
```

---

## PHASE 2: REFUNDS WITH STRIPE

### Step 6: Update Refund Database Schema
**Status:** Pending
**Estimated Time:** 30 minutes

#### Requirements:
- [ ] Add Stripe-related fields to Refund model
- [ ] Add `refundStatus` enum
- [ ] Add timestamps for tracking

#### Database Changes:
```prisma
enum RefundStatus {
  Pending
  Processing
  Completed
  Failed
  Cancelled
}

model Refund {
  id              String        @id @default(cuid())
  orderId         String        @unique
  amount          Float
  reason          String
  status          RefundStatus  @default(Pending)
  stripeRefundId  String?       @unique
  processedAt     DateTime?
  failureReason   String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  order           Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
}
```

#### Files to Create/Modify:
- `prisma/schema.prisma`
- Run: `npx prisma migrate dev --name add_refund_status_and_stripe_fields`

#### Testing:
```bash
# Test: Verify migration successful
npx prisma studio
# Check Refund model has new fields: status, stripeRefundId, processedAt, failureReason
```

---

### Step 7: Update Refund API with Stripe Integration
**Status:** Pending
**Estimated Time:** 1.5 hours

#### Requirements:
- [ ] Modify POST `/api/orders/[orderId]/refund`
- [ ] Retrieve Stripe PaymentIntent from order
- [ ] Create Stripe Refund via API
- [ ] Store `stripeRefundId` in Refund record
- [ ] Set initial status to 'Processing'
- [ ] Handle Stripe errors gracefully
- [ ] Update order status based on refund type (partial/full)
- [ ] Send notification to user

#### Files to Create/Modify:
- `apps/admin/src/app/api/orders/[orderId]/refund/route.ts`

#### Code Example:
```typescript
// Create refund in Stripe
const stripeRefund = await stripe.refunds.create({
  payment_intent: order.stripePaymentIntentId,
  amount: Math.round(amount * 100), // Convert to cents
  reason: 'requested_by_customer',
  metadata: {
    orderId: order.id,
    orderNumber: order.number.toString(),
    adminUserId: userId,
  },
})

// Create refund record with Stripe ID
const refund = await prisma.refund.create({
  data: {
    amount,
    reason,
    orderId: params.orderId,
    status: 'Processing',
    stripeRefundId: stripeRefund.id,
  },
})
```

#### Testing:
```javascript
// Test in browser DevTools (admin panel)
const response = await fetch('/api/orders/ORDER_ID/refund', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 50.00,
    reason: 'Customer requested refund due to defect'
  })
})
const data = await response.json()
console.log('Refund:', data.refund)

// Expected results:
// 1. Response includes stripeRefundId
// 2. Refund status is 'Processing'
// 3. Check Stripe Dashboard: Refund appears
// 4. Check database: Refund record has stripeRefundId
// 5. User receives notification
```

---

### Step 8: Handle Refund Webhooks
**Status:** Pending
**Estimated Time:** 1 hour

#### Requirements:
- [ ] Update `/api/webhooks/stripe` endpoint
- [ ] Handle `charge.refund.updated` event
  - Update Refund status to 'Completed' or 'Failed'
  - Set `processedAt` timestamp
  - Store failure reason if failed
  - Update Order status if full refund
  - Create notification for user
- [ ] Handle partial vs full refund logic

#### Files to Create/Modify:
- `apps/storefront/src/app/api/webhooks/stripe/route.ts`

#### Testing:
```bash
# Test 1: Trigger refund webhook
stripe trigger charge.refund.updated

# Test 2: Verify in database
# Refund.status should be 'Completed'
# Refund.processedAt should be set
# Order.status should be 'RefundCompleted' (if full refund)

# Test 3: Check notification created
# User should have notification about completed refund

# Test 4: Test failed refund
# Manually create a failed refund in Stripe Dashboard
# Verify Refund.status = 'Failed'
# Verify Refund.failureReason is populated
```

---

### Step 9: Update Refund UI with Status
**Status:** Pending
**Estimated Time:** 1 hour

#### Requirements:
- [ ] Update `refund-section.tsx` to show refund status
- [ ] Add status badge with colors:
  - Pending: yellow
  - Processing: blue
  - Completed: green
  - Failed: red
- [ ] Show Stripe Refund ID
- [ ] Show processed date when completed
- [ ] Show failure reason if failed
- [ ] Add "View in Stripe" link to Stripe Dashboard
- [ ] Add "Retry Refund" button for failed refunds (admin only)

#### Files to Create/Modify:
- `apps/admin/src/app/(dashboard)/(routes)/orders/[orderId]/components/refund-section.tsx`
- `apps/admin/src/components/ui/badge.tsx` (if not exists)

#### Testing:
```
Manual Test Flow:
1. Navigate to order with refund: http://localhost:8888/orders/ORDER_ID
2. Verify refund section shows status badge
3. Check status colors match specification
4. Verify Stripe Refund ID displayed
5. Test "View in Stripe" link opens correct Stripe Dashboard page
6. For failed refund: verify failure reason displays
7. For failed refund: test "Retry Refund" button (should reprocess)
```

---

## PHASE 3: STRIPE TAX & AUTOMATIC CALCULATIONS

### Step 10: Enable Stripe Tax
**Status:** Pending
**Estimated Time:** 2 hours

#### Requirements:
- [ ] Enable Stripe Tax in Stripe Dashboard
- [ ] Configure tax settings (nexus, tax codes)
- [ ] Create tax calculation endpoint
- [ ] Integrate with checkout flow
- [ ] Store tax calculation details in order

#### Database Changes:
```prisma
model Order {
  // ... existing fields
  stripeTaxCalculationId String?
  taxBreakdown           Json?   // Store detailed tax breakdown
}
```

#### Files to Create/Modify:
- `apps/storefront/src/app/api/checkout/calculate-tax/route.ts`
- `prisma/schema.prisma`
- Run migration

#### Testing:
```javascript
// Test tax calculation
const response = await fetch('/api/checkout/calculate-tax', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{ productId: 'xxx', quantity: 2 }],
    shippingAddress: {
      line1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94111',
      country: 'US'
    }
  })
})
const data = await response.json()
console.log('Tax:', data.tax)
console.log('Total:', data.total)

// Verify correct sales tax for CA (should be ~9%)
```

---

### Step 11: Automatic Shipping Cost Calculation
**Status:** Pending
**Estimated Time:** 2 hours

#### Requirements:
- [ ] Define shipping calculation strategy:
  - Option A: Flat rate by region
  - Option B: Weight-based calculation
  - Option C: Integration with shipping API (ShipStation, EasyPost)
- [ ] Create shipping calculation endpoint
- [ ] Store shipping method in order
- [ ] Update checkout to show shipping options

#### Database Changes:
```prisma
model Order {
  // ... existing fields
  shippingMethod     String?
  shippingCarrier    String?
  estimatedDelivery  DateTime?
}
```

#### Files to Create/Modify:
- `apps/storefront/src/app/api/checkout/calculate-shipping/route.ts`
- `apps/storefront/src/lib/shipping.ts`

#### Testing:
```
Test Cases:
1. Calculate shipping for single item
2. Calculate shipping for multiple items
3. Calculate for different regions (domestic vs international)
4. Verify shipping method selection works
5. Verify estimated delivery date calculation
```

---

### Step 12: Finalize Order Calculation Flow
**Status:** Pending
**Estimated Time:** 1.5 hours

#### Requirements:
- [ ] Make financial fields read-only in admin
- [ ] Create recalculation endpoint for admin overrides
- [ ] Update order form UI to show calculated values
- [ ] Add "Recalculate" button for admins
- [ ] Show breakdown: items total + shipping + tax = payable

#### Files to Create/Modify:
- `apps/admin/src/app/(dashboard)/(routes)/orders/[orderId]/components/order-form.tsx`
- `apps/admin/src/app/api/orders/[orderId]/recalculate/route.ts`

#### Testing:
```
Manual Test Flow:
1. Create new order in admin
2. Verify total, tax, shipping are read-only
3. Add items to order
4. Click "Recalculate" button
5. Verify all financial fields update correctly
6. Verify payable = total + shipping + tax - discount
```

---

## PHASE 4: STRIPE CUSTOMERS & PRODUCTS SYNC

### Step 13: Sync Users as Stripe Customers
**Status:** Pending
**Estimated Time:** 2 hours

#### Requirements:
- [ ] Create Stripe Customer on user registration
- [ ] Store `stripeCustomerId` in User model
- [ ] Sync user updates to Stripe (email, name)
- [ ] Link payment methods to customer
- [ ] Add webhook for customer updates

#### Database Changes:
```prisma
model User {
  // ... existing fields
  stripeCustomerId String? @unique
}
```

#### Testing:
```javascript
// Test customer creation
// 1. Register new user in storefront
// 2. Check database: User.stripeCustomerId should be populated
// 3. Check Stripe Dashboard: Customer should appear with matching email
// 4. Update user email
// 5. Verify Stripe Customer email updates
```

---

### Step 14: Sync Products to Stripe
**Status:** Pending
**Estimated Time:** 2 hours

#### Requirements:
- [ ] Create Stripe Product when admin creates product
- [ ] Create Stripe Price for product
- [ ] Store `stripeProductId` and `stripePriceId` in Product model
- [ ] Sync product updates (name, description, price)
- [ ] Handle product archiving in Stripe
- [ ] Add bulk sync for existing products

#### Database Changes:
```prisma
model Product {
  // ... existing fields
  stripeProductId String? @unique
  stripePriceId   String? @unique
}
```

#### Testing:
```
Manual Test Flow:
1. Create product in admin panel
2. Check database: Product has stripeProductId and stripePriceId
3. Check Stripe Dashboard: Product appears with correct details
4. Update product price
5. Verify new Price created in Stripe
6. Archive product
7. Verify product archived in Stripe
```

---

## PHASE 5: ADVANCED FEATURES

### Step 15: Payment Methods Management
**Status:** Pending
**Estimated Time:** 2 hours

#### Requirements:
- [ ] Create page to view saved payment methods
- [ ] Add payment method during checkout
- [ ] Set default payment method
- [ ] Delete payment method
- [ ] Use saved payment method for faster checkout

#### Files to Create/Modify:
- `apps/storefront/src/app/(routes)/account/payment-methods/page.tsx`
- `apps/storefront/src/app/api/payment-methods/route.ts`

---

### Step 16: Stripe Checkout Session (Alternative)
**Status:** Pending
**Estimated Time:** 2 hours

#### Requirements:
- [ ] Implement Stripe Checkout as alternative to custom form
- [ ] Create checkout session endpoint
- [ ] Redirect to Stripe-hosted page
- [ ] Handle success/cancel redirects
- [ ] Add option to choose between custom or Stripe Checkout

---

### Step 17: Subscription Support (Future)
**Status:** Pending
**Estimated Time:** 4 hours

#### Requirements:
- [ ] Add subscription products
- [ ] Create subscription checkout flow
- [ ] Handle recurring payments
- [ ] Manage subscription lifecycle
- [ ] Handle failed payments and dunning

---

### Step 18: Stripe Dashboard Embeds
**Status:** Pending
**Estimated Time:** 1 hour

#### Requirements:
- [ ] Embed Stripe payment links in admin
- [ ] Show payment timeline
- [ ] Display refund history
- [ ] Link to Stripe Dashboard for details

---

## TESTING CHECKLIST

### Payment Flow Testing
- [ ] Successful payment with test card
- [ ] Declined payment with test card
- [ ] Payment requiring authentication (3D Secure)
- [ ] Webhook successfully updates order
- [ ] Notification sent to user
- [ ] Order confirmation page displays correctly

### Refund Flow Testing
- [ ] Full refund processes successfully
- [ ] Partial refund processes successfully
- [ ] Refund appears in Stripe Dashboard
- [ ] Webhook updates refund status
- [ ] User receives refund notification
- [ ] Failed refund handled gracefully

### Tax Calculation Testing
- [ ] Tax calculated correctly for US addresses
- [ ] Tax calculated correctly for international addresses
- [ ] Tax breakdown stored in order
- [ ] Tax amount matches Stripe calculation

### Error Handling
- [ ] Invalid Stripe keys show helpful error
- [ ] Network errors handled gracefully
- [ ] Webhook signature verification works
- [ ] Invalid payment amount rejected
- [ ] Refund exceeding payment amount rejected

---

## ENVIRONMENT VARIABLES NEEDED

```bash
# Stripe Keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Webhook Secret (get from Stripe CLI or Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Optional: Stripe Tax
STRIPE_TAX_ENABLED=true
```

---

## STRIPE DASHBOARD CONFIGURATION

### Required Setup:
1. **Account**: Create/use Stripe account
2. **Test Mode**: Enable test mode for development
3. **Webhooks**: Add endpoint URLs
   - `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refund.updated`
4. **API Keys**: Copy publishable and secret keys
5. **Products**: Enable product catalog
6. **Tax (Optional)**: Enable Stripe Tax
7. **Customer Portal (Optional)**: Enable customer portal

---

## CURRENT STATUS

**Phase 1:** 0/5 steps completed (0%)
**Phase 2:** 0/4 steps completed (0%)
**Phase 3:** 0/3 steps completed (0%)
**Phase 4:** 0/2 steps completed (0%)
**Phase 5:** 0/3 steps completed (0%)

**Overall:** 0/17 steps completed (0%)

---

## NOTES

- All Stripe operations should use test mode during development
- Use Stripe test cards: https://stripe.com/docs/testing
- Stripe CLI is essential for webhook testing
- Keep Stripe Dashboard open for monitoring
- Log all Stripe API calls for debugging
- Handle Stripe errors with user-friendly messages
- Follow TDD: Test each step before moving to next
- Make git commits after each completed step

---

## RESOURCES

- Stripe Documentation: https://stripe.com/docs
- Stripe Node.js Library: https://stripe.com/docs/api?lang=node
- Stripe Elements: https://stripe.com/docs/stripe-js
- Stripe Testing: https://stripe.com/docs/testing
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Stripe Webhooks: https://stripe.com/docs/webhooks
