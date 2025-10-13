# Live Timer Subscription System Setup Guide

## Overview

This guide explains how to set up and configure the complete subscription system for Live Timer, including Stripe integration, user dashboard, billing management, and subscription-based access control.

## Features

✅ **Complete Stripe Integration**

- Checkout sessions for subscription creation
- Customer portal for subscription management
- Webhook handling for subscription events
- Automatic subscription status updates

✅ **User Dashboard**

- Subscription status display
- Quick actions and room management
- Usage statistics and limits
- Direct access to billing management

✅ **Billing Management**

- Complete subscription details
- Billing history access
- Subscription cancellation/reactivation
- Usage tracking and limits

✅ **Access Control**

- Subscription-based room limits
- Timer limits per room
- Feature restrictions based on plan
- Automatic limit enforcement

## Architecture

### Backend Components

1. **Stripe Controller** (`src/controllers/stripe.controller.ts`)

   - Handles all Stripe API interactions
   - Manages checkout sessions and customer portal
   - Processes webhooks for subscription events

2. **Subscription Middleware** (`src/middleware/subscription.middleware.ts`)

   - Enforces subscription limits
   - Checks room and timer creation limits
   - Provides subscription-based access control

3. **Database Schema** (`prisma/schema.prisma`)
   - Updated User model with Stripe customer ID
   - Subscription model with full Stripe integration
   - Proper relationships and indexing

### Frontend Components

1. **Dashboard** (`pages/dashboard.vue`)

   - User overview with subscription status
   - Quick actions and room management
   - Subscription management buttons

2. **Billing Page** (`pages/billing.vue`)

   - Complete subscription details
   - Billing history and management
   - Usage statistics and limits

3. **Stripe Integration** (`composables/useStripe.ts`)
   - Frontend Stripe SDK integration
   - Checkout session creation
   - Customer portal access

## Setup Instructions

### 1. Stripe Configuration

#### Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Set up webhook endpoints

#### Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here
FRONTEND_URL=http://localhost:3000

# Frontend Environment Variables
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here
```

### 2. Stripe Products and Prices

Create these products in your Stripe dashboard:

#### Pro Plan

- **Product Name**: "Live Timer Pro"
- **Description**: "Professional timer management with advanced features"
- **Monthly Price**: $9.99/month
- **Yearly Price**: $99.99/year (save 20%)

#### Enterprise Plan

- **Product Name**: "Live Timer Enterprise"
- **Description**: "Enterprise-grade timer solution with unlimited features"
- **Monthly Price**: $29.99/month

### 3. Webhook Configuration

Set up webhooks in your Stripe dashboard:

**Endpoint URL**: `https://yourdomain.com/stripe/webhook`

**Events to listen for**:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 4. Database Migration

Run the database migration to apply schema changes:

```bash
npm run db:push
```

### 5. Install Dependencies

Backend:

```bash
npm install
```

Frontend:

```bash
cd live-timer-frontend
npm install
```

## Subscription Plans

### Free Plan

- **Rooms**: Up to 3 rooms
- **Timers**: 10 timers per room
- **Views**: 100 views per month
- **Features**: Basic timer functionality

### Pro Plan ($9.99/month)

- **Rooms**: Up to 50 rooms
- **Timers**: 100 timers per room
- **Views**: 10,000 views per month
- **Features**: Advanced features, priority support

### Enterprise Plan ($29.99/month)

- **Rooms**: Unlimited
- **Timers**: Unlimited
- **Views**: Unlimited
- **Features**: All features, custom integrations, dedicated support

## API Endpoints

### Stripe Endpoints

- `POST /stripe/create-customer` - Create Stripe customer
- `POST /stripe/create-checkout-session` - Create checkout session
- `POST /stripe/create-portal-session` - Create customer portal session
- `GET /stripe/subscription` - Get subscription details
- `POST /stripe/cancel-subscription` - Cancel subscription
- `POST /stripe/reactivate-subscription` - Reactivate subscription
- `POST /stripe/webhook` - Handle Stripe webhooks

### Frontend API Endpoints

- `POST /api/stripe/create-checkout-session` - Create checkout session
- `POST /api/stripe/create-portal-session` - Create portal session
- `GET /api/stripe/subscription` - Get subscription
- `POST /api/stripe/cancel-subscription` - Cancel subscription
- `POST /api/stripe/reactivate-subscription` - Reactivate subscription

## Usage Examples

### Creating a Checkout Session

```javascript
const { createCheckoutSession } = useStripe();

await createCheckoutSession("price_pro_monthly", {
  successUrl: "https://yourdomain.com/dashboard?success=true",
  cancelUrl: "https://yourdomain.com/pricing?canceled=true",
});
```

### Opening Customer Portal

```javascript
const { createCustomerPortal } = useStripe();

await createCustomerPortal();
```

### Checking Subscription Status

```javascript
const response = await $fetch("/api/stripe/subscription");
if (response.success && response.subscription) {
  console.log("User has active subscription:", response.subscription);
}
```

## Access Control

The system automatically enforces subscription limits:

### Room Creation

- Free users: Limited to 3 rooms
- Pro users: Up to 50 rooms
- Enterprise users: Unlimited

### Timer Creation

- Free users: 10 timers per room
- Pro users: 100 timers per room
- Enterprise users: Unlimited

### Feature Access

- Advanced features require Pro or Enterprise plan
- Usage tracking and analytics require subscription

## Testing

### Test Cards

Use these Stripe test cards for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Test Webhooks

Use Stripe CLI to test webhooks locally:

```bash
stripe listen --forward-to localhost:3001/stripe/webhook
```

## Production Deployment

### Environment Variables

Update all environment variables for production:

```bash
STRIPE_SECRET_KEY=sk_live_your-live-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-live-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-live-webhook-secret
FRONTEND_URL=https://yourdomain.com
```

### Webhook Endpoint

Update your Stripe webhook endpoint to your production URL:

`https://yourdomain.com/stripe/webhook`

### SSL Certificate

Ensure your production server has a valid SSL certificate for webhook processing.

## Monitoring

### Subscription Events

Monitor these events in your application logs:

- Subscription created/updated/deleted
- Payment succeeded/failed
- Customer portal access

### Usage Tracking

Track user usage against subscription limits:

- Room creation attempts
- Timer creation attempts
- View counts per month

## Support

For issues with the subscription system:

1. Check Stripe dashboard for payment status
2. Verify webhook endpoint configuration
3. Check application logs for errors
4. Ensure environment variables are correct

## Security Considerations

- Never expose Stripe secret keys in frontend code
- Use HTTPS for all webhook endpoints
- Validate webhook signatures
- Implement proper error handling
- Use rate limiting for API endpoints

## Conclusion

The Live Timer subscription system provides a complete, production-ready solution for managing user subscriptions, billing, and access control. The system is designed to scale and can be easily extended with additional features and plans.
