# Stripe Webhook Setup Guide

This guide explains how to set up Stripe webhooks for your Live Timer application. Webhooks are essential for keeping subscription statuses synchronized between Stripe and your application.

## Why Webhooks?

Webhooks allow Stripe to notify your application in real-time when:
- Subscriptions are created, updated, or canceled
- Payments succeed or fail
- Subscription statuses change

Without webhooks, you would need to manually poll Stripe's API to check subscription statuses, which is inefficient and can lead to outdated information.

## Setup Steps

### 1. Get Your Webhook Endpoint URL

Your webhook endpoint is already configured in the application:

**Development**: `http://localhost:3001/stripe/webhook`
**Production**: `https://yourdomain.com/stripe/webhook`

### 2. Configure Webhook in Stripe Dashboard

1. **Log in to Stripe Dashboard**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Make sure you're in **Test Mode** for development, or **Live Mode** for production

2. **Navigate to Webhooks**
   - Go to **Developers** → **Webhooks** in the sidebar
   - Click **Add endpoint**

3. **Add Endpoint URL**
   - For **local development**, use: `http://localhost:3001/stripe/webhook`
   - For **production**, use: `https://yourdomain.com/stripe/webhook`
   - **Important**: Your production server must have HTTPS enabled

4. **Select Events to Listen For**
   
   Select these events (check all that apply):
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Save the Endpoint**
   - Click **Add endpoint**
   - Stripe will generate a **Signing secret** (starts with `whsec_`)

### 3. Get Your Webhook Signing Secret

1. After creating the webhook endpoint, click on it
2. Under **Signing secret**, click **Reveal**
3. Copy the secret (it starts with `whsec_`)

### 4. Add Webhook Secret to Environment Variables

Add the webhook secret to your `.env` file:

```bash
# Add this to your .env file
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here
```

**Important**: 
- Use a **different secret** for test mode and live mode
- Never commit this secret to version control
- Keep your `.env` file in `.gitignore`

### 5. Testing Webhooks Locally

For local development, you have two options:

#### Option A: Stripe CLI (Recommended)

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows (using Scoop)
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_*_linux_x86_64.tar.gz
   tar -xvf stripe_*_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin/
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Local Server**
   ```bash
   stripe listen --forward-to localhost:3001/stripe/webhook
   ```

4. **Copy the Webhook Signing Secret**
   - The CLI will output a webhook signing secret
   - It looks like: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Add this to your `.env` file temporarily:
     ```bash
     STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

5. **Test Webhook Events**
   ```bash
   # Trigger a test subscription event
   stripe trigger customer.subscription.created
   ```

#### Option B: ngrok (Alternative)

1. **Install ngrok**
   - Download from [https://ngrok.com](https://ngrok.com)

2. **Start Your Application**
   ```bash
   npm run dev
   ```

3. **Start ngrok**
   ```bash
   ngrok http 3001
   ```

4. **Use ngrok URL in Stripe Dashboard**
   - Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)
   - Add webhook endpoint in Stripe: `https://abc123.ngrok.io/stripe/webhook`
   - Copy the webhook signing secret to your `.env` file

### 6. Verify Webhook Setup

1. **Check Application Logs**
   - When a webhook is received, you should see logs like:
     ```
     Subscription updated for user [userId]: active
     Payment succeeded for invoice: inv_xxxxx
     ```

2. **Test with Stripe CLI**
   ```bash
   # Test subscription created event
   stripe trigger customer.subscription.created
   
   # Test payment succeeded event
   stripe trigger invoice.payment_succeeded
   
   # Test payment failed event
   stripe trigger invoice.payment_failed
   ```

3. **Check Stripe Dashboard**
   - Go to **Developers** → **Webhooks**
   - Click on your endpoint
   - Check the **Events** tab to see recent webhook deliveries
   - Verify events show **Success** status (green checkmark)

## Production Deployment

### 1. Update Environment Variables

Make sure your production `.env` has:
```bash
STRIPE_SECRET_KEY=sk_live_your-live-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-live-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-live-webhook-secret
FRONTEND_URL=https://yourdomain.com
```

### 2. Create Production Webhook Endpoint

1. **Switch to Live Mode** in Stripe Dashboard
2. Create a new webhook endpoint: `https://yourdomain.com/stripe/webhook`
3. Select the same events as test mode
4. Copy the **Live Mode** webhook signing secret
5. Update `STRIPE_WEBHOOK_SECRET` in production environment

### 3. Ensure HTTPS

- Webhooks require HTTPS in production
- Your server must have a valid SSL certificate
- Stripe will not send webhooks to HTTP endpoints in production

## Troubleshooting

### Webhook Not Receiving Events

1. **Check Webhook Secret**
   - Verify `STRIPE_WEBHOOK_SECRET` is set in `.env`
   - Make sure you're using the correct secret for test/live mode

2. **Check Endpoint URL**
   - Verify the URL in Stripe Dashboard matches your server
   - For local development, use Stripe CLI or ngrok

3. **Check Server Logs**
   - Look for errors in your application logs
   - Check for "Webhook signature verification failed" errors

4. **Check Stripe Dashboard**
   - Go to **Developers** → **Webhooks** → Your endpoint → **Events**
   - Check if events show **Failed** status
   - Click on failed events to see error details

### "Webhook signature verification failed"

This error means:
- The webhook secret is incorrect
- The request body was modified before verification
- You're using the wrong secret (test vs live mode)

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` in your `.env` matches the secret in Stripe Dashboard
2. Make sure the webhook route uses `express.raw({ type: "application/json" })` (already configured)

### Webhook Events Not Processing

1. **Check Event Types**
   - Verify the correct events are selected in Stripe Dashboard
   - Ensure events match what your code handles

2. **Check Application Logs**
   - Look for errors in webhook handler
   - Check database connection is working

3. **Test Individual Handlers**
   - Use Stripe CLI to trigger specific events
   - Check logs to see if handlers are called

## Security Best Practices

1. **Never Expose Webhook Secret**
   - Keep it in `.env` file only
   - Never commit to version control
   - Use different secrets for test and production

2. **Always Verify Signatures**
   - The application already verifies webhook signatures
   - Never disable signature verification

3. **Use HTTPS in Production**
   - Stripe requires HTTPS for production webhooks
   - Use a valid SSL certificate

4. **Monitor Webhook Failures**
   - Set up alerts for failed webhook deliveries
   - Review failed events in Stripe Dashboard regularly

## Environment Variables Summary

Add these to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here
FRONTEND_URL=http://localhost:3000

# Frontend Environment Variables (in live-timer-frontend/.env)
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here
```

## Quick Reference

### Test Mode Setup
```bash
# 1. Start your server
npm run dev

# 2. In another terminal, start Stripe CLI
stripe listen --forward-to localhost:3001/stripe/webhook

# 3. Copy the webhook secret from CLI output
# 4. Add to .env: STRIPE_WEBHOOK_SECRET=whsec_xxxxx
# 5. Test with: stripe trigger customer.subscription.created
```

### Production Setup
1. Create webhook endpoint in Stripe Dashboard (Live Mode)
2. Copy webhook signing secret
3. Add to production environment variables
4. Deploy application
5. Monitor webhook events in Stripe Dashboard

## Next Steps

After setting up webhooks:
1. ✅ Test subscription creation
2. ✅ Test payment success
3. ✅ Test payment failure
4. ✅ Verify subscription status updates in database
5. ✅ Test subscription cancellation
6. ✅ Monitor webhook delivery in Stripe Dashboard

## Support

If you encounter issues:
1. Check Stripe Dashboard → Webhooks → Events for error details
2. Review application logs for webhook processing errors
3. Verify environment variables are set correctly
4. Ensure webhook endpoint URL is accessible (HTTPS in production)

