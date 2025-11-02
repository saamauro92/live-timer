/**
 * Stripe Configuration
 * 
 * This file contains Stripe-related configuration constants.
 * Price IDs should be updated after creating products and prices in Stripe Dashboard.
 */

export const STRIPE_CONFIG = {
  /**
   * Stripe Price IDs
   * 
   * These are the Price IDs from your Stripe Dashboard.
   * After creating products and prices in Stripe, replace these with your actual Price IDs.
   * 
   * To find your Price IDs:
   * 1. Go to Stripe Dashboard > Products
   * 2. Click on a product
   * 3. Find the Price ID (starts with "price_")
   */
  PRICE_IDS: {
    // Pro Plan - Monthly
    PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_pro_monthly",
    
    // Pro Plan - Yearly
    PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || "price_pro_yearly",
    
    // Enterprise Plan - Monthly
    ENTERPRISE_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || "price_enterprise_monthly",
  },
  
  /**
   * Subscription Plan Names
   * These should match the product names in Stripe
   */
  PLAN_NAMES: {
    PRO: "Live Timer Pro",
    ENTERPRISE: "Live Timer Enterprise",
  },
  
  /**
   * Webhook Events
   * Events that the webhook handler listens for
   */
  WEBHOOK_EVENTS: {
    SUBSCRIPTION_CREATED: "customer.subscription.created",
    SUBSCRIPTION_UPDATED: "customer.subscription.updated",
    SUBSCRIPTION_DELETED: "customer.subscription.deleted",
    PAYMENT_SUCCEEDED: "invoice.payment_succeeded",
    PAYMENT_FAILED: "invoice.payment_failed",
  },
} as const;

/**
 * Get price ID for a plan and billing period
 */
export const getPriceId = (plan: "pro" | "enterprise", billingPeriod: "monthly" | "yearly"): string => {
  if (plan === "pro") {
    return billingPeriod === "yearly" 
      ? STRIPE_CONFIG.PRICE_IDS.PRO_YEARLY 
      : STRIPE_CONFIG.PRICE_IDS.PRO_MONTHLY;
  }
  
  // Enterprise is only monthly for now
  return STRIPE_CONFIG.PRICE_IDS.ENTERPRISE_MONTHLY;
};

