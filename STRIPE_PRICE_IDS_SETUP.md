# Stripe Price IDs Setup Guide

This guide explains where to add your Stripe Price IDs after creating products and prices in your Stripe Dashboard.

## Where to Add Price IDs

After creating products and prices in Stripe Dashboard, you need to update Price IDs in two places:

### 1. Backend Configuration

**File**: `src/config/stripe.config.ts`

Update the Price IDs in the `PRICE_IDS` object:

```typescript
export const STRIPE_CONFIG = {
  PRICE_IDS: {
    PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_YOUR_PRO_MONTHLY_ID",
    PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || "price_YOUR_PRO_YEARLY_ID",
    ENTERPRISE_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || "price_YOUR_ENTERPRISE_ID",
  },
};
```

**Option A: Direct Update (Recommended)**
Replace the placeholder values with your actual Price IDs from Stripe Dashboard.

**Option B: Environment Variables (Alternative)**
Add to your `.env` file:
```bash
STRIPE_PRICE_PRO_MONTHLY=price_YOUR_PRO_MONTHLY_ID
STRIPE_PRICE_PRO_YEARLY=price_YOUR_PRO_YEARLY_ID
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_YOUR_ENTERPRISE_ID
```

### 2. Frontend Configuration

**File**: `live-timer-frontend/composables/useStripeConfig.ts`

Update the Price IDs in the `STRIPE_PRICE_IDS` object:

```typescript
export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: process.env.NUXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "price_YOUR_PRO_MONTHLY_ID",
  PRO_YEARLY: process.env.NUXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || "price_YOUR_PRO_YEARLY_ID",
  ENTERPRISE_MONTHLY: process.env.NUXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY || "price_YOUR_ENTERPRISE_ID",
};
```

**Option A: Direct Update (Recommended)**
Replace the placeholder values with your actual Price IDs.

**Option B: Environment Variables (Alternative)**
Add to your `live-timer-frontend/.env` file:
```bash
NUXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_YOUR_PRO_MONTHLY_ID
NUXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_YOUR_PRO_YEARLY_ID
NUXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY=price_YOUR_ENTERPRISE_ID
```

## How to Find Your Price IDs in Stripe Dashboard

1. **Log in to Stripe Dashboard**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Make sure you're in **Test Mode** for development

2. **Navigate to Products**
   - Click **Products** in the sidebar
   - Find your product (e.g., "Live Timer Pro")

3. **Get the Price ID**
   - Click on the product
   - Find the price you want (Monthly or Yearly)
   - The **Price ID** is shown next to the price (starts with `price_`)
   - Copy this ID

4. **Repeat for All Plans**
   - Pro Monthly: `price_xxxxx`
   - Pro Yearly: `price_xxxxx`
   - Enterprise Monthly: `price_xxxxx`

## Quick Setup Checklist

- [ ] Created products in Stripe Dashboard
- [ ] Created prices for each product (monthly/yearly)
- [ ] Copied Price IDs from Stripe Dashboard
- [ ] Updated `src/config/stripe.config.ts` with Price IDs
- [ ] Updated `live-timer-frontend/composables/useStripeConfig.ts` with Price IDs
- [ ] Verified Price IDs are correct (format: `price_xxxxx`)
- [ ] Tested subscription checkout flow

## Creating Products in Stripe Dashboard

If you haven't created products yet, here's how:

### Pro Plan

1. **Create Product**
   - Go to **Products** → **Add product**
   - Name: "Live Timer Pro"
   - Description: "Professional timer management with advanced features"

2. **Add Monthly Price**
   - Click **Add price**
   - Pricing model: **Recurring**
   - Price: $10.00 (or your desired amount)
   - Billing period: **Monthly**
   - Copy the Price ID (e.g., `price_1AbC123...`)

3. **Add Yearly Price**
   - Click **Add another price**
   - Price: $96.00 (20% discount = $8/month)
   - Billing period: **Yearly**
   - Copy the Price ID (e.g., `price_1XyZ789...`)

### Enterprise Plan

1. **Create Product**
   - Go to **Products** → **Add product**
   - Name: "Live Timer Enterprise"
   - Description: "Enterprise-grade timer solution with unlimited features"

2. **Add Monthly Price**
   - Click **Add price**
   - Price: $25.00 (or your desired amount)
   - Billing period: **Monthly**
   - Copy the Price ID

## Testing Price IDs

After updating the Price IDs, test the checkout flow:

1. **Start your application**
   ```bash
   npm run dev
   ```

2. **Navigate to Pricing Page**
   - Go to `/pricing` in your application
   - Select a plan (Pro or Enterprise)
   - Click the subscription button

3. **Complete Checkout**
   - You should be redirected to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Complete the checkout

4. **Verify Subscription**
   - Check your Stripe Dashboard → Customers
   - Verify subscription was created
   - Check your application database
   - Verify subscription status in your app

## Common Issues

### "Price ID is required" Error

**Cause**: Price ID is not being passed correctly or is undefined.

**Solution**:
1. Check that Price IDs are set in configuration files
2. Verify the pricing page is using `getStripePriceId()` function
3. Check browser console for errors

### "No such price: price_xxxxx" Error

**Cause**: Price ID doesn't exist in Stripe or is incorrect.

**Solution**:
1. Verify Price ID exists in Stripe Dashboard
2. Check you're using the correct mode (test vs live)
3. Ensure Price ID format is correct (starts with `price_`)

### Price ID Mismatch Between Backend and Frontend

**Cause**: Different Price IDs in backend and frontend configs.

**Solution**:
1. Ensure both config files have the same Price IDs
2. Use environment variables for consistency
3. Double-check Price IDs are correct in both files

## Current Configuration

The application uses these configuration files:

- **Backend**: `src/config/stripe.config.ts`
- **Frontend**: `live-timer-frontend/composables/useStripeConfig.ts`
- **Pricing Page**: `live-timer-frontend/pages/pricing.vue` (uses the config)

The pricing page automatically uses the correct Price ID based on:
- Selected plan (Pro or Enterprise)
- Billing period (Monthly or Yearly)

## Example Price IDs

Here's what your Price IDs should look like:

```typescript
// Backend (src/config/stripe.config.ts)
PRO_MONTHLY: "price_1AbC123def456ghi789"
PRO_YEARLY: "price_1XyZ789abc123def456"
ENTERPRISE_MONTHLY: "price_1MnO456pqr789stu012"

// Frontend (live-timer-frontend/composables/useStripeConfig.ts)
PRO_MONTHLY: "price_1AbC123def456ghi789"
PRO_YEARLY: "price_1XyZ789abc123def456"
ENTERPRISE_MONTHLY: "price_1MnO456pqr789stu012"
```

**Important**: Replace with your actual Price IDs from Stripe Dashboard!

## Next Steps

After setting up Price IDs:

1. ✅ Test subscription checkout
2. ✅ Verify webhook events (see `STRIPE_WEBHOOK_SETUP.md`)
3. ✅ Test subscription management (cancel/reactivate)
4. ✅ Verify subscription limits are enforced
5. ✅ Test with Stripe test cards

For webhook setup, see: `STRIPE_WEBHOOK_SETUP.md`

