# Frontend Setup Guide for Live Timer Subscription System

## Overview

This guide covers the complete frontend setup for the Live Timer subscription system, including all the components, pages, and integrations that have been created.

## Frontend Components Created

### 🎯 **Core Pages**

1. **Dashboard** (`/dashboard`)

   - User overview with subscription status
   - Quick actions and room management
   - Subscription management buttons
   - Success message handling

2. **Billing Page** (`/billing`)

   - Complete subscription details
   - Billing history and management
   - Usage statistics and limits
   - Subscription cancellation/reactivation

3. **Subscription Success** (`/subscription-success`)

   - Post-subscription confirmation page
   - Plan details and next steps
   - Quick access to dashboard and rooms

4. **Subscription Canceled** (`/subscription-canceled`)
   - Post-cancellation information
   - Reactivation options
   - Access timeline details

### 🧩 **Reusable Components**

1. **SubscriptionStatus** (`components/SubscriptionStatus.vue`)

   - Compact subscription status display
   - Plan name and status badge
   - Upgrade link for free users

2. **SubscriptionLimitWarning** (`components/SubscriptionLimitWarning.vue`)

   - Warning when approaching limits
   - Contextual upgrade prompts
   - Usage statistics display

3. **SubscriptionUpgradePrompt** (`components/SubscriptionUpgradePrompt.vue`)
   - Prominent upgrade call-to-action
   - Feature highlighting
   - Dismissible design

### 🔗 **API Integration**

1. **Stripe API Endpoints**

   - `POST /api/stripe/create-checkout-session`
   - `POST /api/stripe/create-portal-session`
   - `GET /api/stripe/subscription`
   - `POST /api/stripe/cancel-subscription`
   - `POST /api/stripe/reactivate-subscription`

2. **Stripe Composable** (`composables/useStripe.ts`)
   - Checkout session creation
   - Customer portal access
   - Error handling

## Navigation Updates

### Updated Layout (`layouts/default.vue`)

- Added Dashboard, Billing, and Pricing links to user menu
- Improved navigation structure
- Better user experience flow

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the frontend directory:

```bash
# API Configuration
NUXT_PUBLIC_API_BASE=http://localhost:3001
NUXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Stripe Configuration
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here

# App Configuration
NUXT_PUBLIC_APP_URL=http://localhost:3000
NUXT_PUBLIC_APP_NAME="Live Timer"
```

### Nuxt Configuration (`nuxt.config.ts`)

- Added Stripe publishable key configuration
- Updated runtime config
- Proper environment variable handling

## Subscription Flow Integration

### 1. **Pricing Page Integration**

- Existing pricing page works with new Stripe system
- Automatic checkout session creation
- Proper error handling

### 2. **Dashboard Integration**

- Real-time subscription status
- Quick subscription management
- Success message handling

### 3. **Rooms Page Integration**

- Subscription limit warnings
- Usage tracking display
- Upgrade prompts when needed

## User Experience Features

### ✅ **Success Messages**

- Subscription success notifications
- Reactivation confirmations
- Dismissible alerts

### ✅ **Error Handling**

- Comprehensive error messages
- User-friendly error states
- Fallback UI components

### ✅ **Loading States**

- Skeleton loading for subscription data
- Spinner animations
- Progressive loading

### ✅ **Responsive Design**

- Mobile-first approach
- Dark mode support
- Consistent styling

## Subscription Limits Integration

### Room Creation Limits

- Free: 3 rooms maximum
- Pro: 50 rooms maximum
- Enterprise: Unlimited

### Timer Limits

- Free: 10 timers per room
- Pro: 100 timers per room
- Enterprise: Unlimited

### Usage Tracking

- Real-time usage display
- Limit warnings at 80% usage
- Upgrade prompts when needed

## Testing the Frontend

### 1. **Start the Frontend**

```bash
cd live-timer-frontend
npm install
npm run dev
```

### 2. **Test Subscription Flow**

1. Register a new user
2. Go to `/pricing`
3. Click on a paid plan
4. Complete Stripe checkout
5. Verify success page
6. Check dashboard for subscription status

### 3. **Test Subscription Management**

1. Go to `/dashboard`
2. Click "Manage" in subscription section
3. Test customer portal access
4. Go to `/billing` for detailed management

### 4. **Test Limit Warnings**

1. Create rooms up to the limit
2. Verify warning messages appear
3. Test upgrade prompts

## Production Deployment

### Environment Variables

Update all environment variables for production:

```bash
NUXT_PUBLIC_API_BASE=https://your-api-domain.com
NUXT_PUBLIC_SOCKET_URL=https://your-api-domain.com
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-key
NUXT_PUBLIC_APP_URL=https://your-frontend-domain.com
```

### Build and Deploy

```bash
npm run build
npm run preview
```

## Component Usage Examples

### Using SubscriptionStatus Component

```vue
<template>
  <div>
    <SubscriptionStatus />
  </div>
</template>
```

### Using SubscriptionLimitWarning Component

```vue
<template>
  <SubscriptionLimitWarning type="rooms" :current="roomCount" :limit="maxRooms" :subscription="subscription" />
</template>
```

### Using SubscriptionUpgradePrompt Component

```vue
<template>
  <SubscriptionUpgradePrompt title="Unlock Premium Features" description="Upgrade to access advanced timer features and remove limits." :show-close="true" @close="hidePrompt" />
</template>
```

## Troubleshooting

### Common Issues

1. **Stripe Not Loading**

   - Check `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
   - Verify key is correct format (starts with `pk_`)

2. **API Calls Failing**

   - Check `NUXT_PUBLIC_API_BASE` is correct
   - Verify backend is running
   - Check CORS configuration

3. **Subscription Status Not Updating**
   - Check webhook configuration
   - Verify database connection
   - Check browser console for errors

### Debug Mode

Enable debug logging by adding to your `.env`:

```bash
NUXT_PUBLIC_DEBUG=true
```

## Security Considerations

- Never expose Stripe secret keys in frontend
- Use HTTPS in production
- Validate all user inputs
- Implement proper error boundaries
- Use environment variables for sensitive data

## Performance Optimization

- Lazy load subscription components
- Cache subscription data
- Optimize API calls
- Use proper loading states
- Implement error boundaries

## Conclusion

The frontend subscription system is now complete with:

✅ **Full Stripe Integration**
✅ **User Dashboard with Subscription Management**
✅ **Billing Management Page**
✅ **Subscription Limit Warnings**
✅ **Success/Cancellation Pages**
✅ **Responsive Design**
✅ **Error Handling**
✅ **Loading States**

The system provides a seamless user experience for subscription management, from initial signup through ongoing billing management and feature access control.
