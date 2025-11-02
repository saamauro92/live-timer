/**
 * Stripe Configuration for Frontend
 * 
 * This file contains Stripe Price IDs used in the frontend.
 * These should match the Price IDs in your Stripe Dashboard.
 * 
 * IMPORTANT: After creating products and prices in Stripe Dashboard,
 * replace these placeholder values with your actual Price IDs.
 */

export const STRIPE_PRICE_IDS = {
  /**
   * Pro Plan - Monthly
   * Replace with your actual Stripe Price ID (starts with "price_")
   */
  PRO_MONTHLY: process.env.NUXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "price_1SP72u9hO9qprR3wAlCDQMrA",
  
  /**
   * Pro Plan - Yearly
   * Replace with your actual Stripe Price ID (starts with "price_")
   */
  PRO_YEARLY: process.env.NUXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || "price_1SP72u9hO9qprR3wAlCDQMrA",
  
  /**
   * Enterprise Plan - Monthly
   * Replace with your actual Stripe Price ID (starts with "price_")
   */
  ENTERPRISE_MONTHLY: process.env.NUXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY || "price_1SP72u9hO9qprR3wAlCDQMrA",
} as const;

/**
 * Get price ID for a plan and billing period
 */
export const getStripePriceId = (plan: "pro" | "enterprise", billingPeriod: "monthly" | "yearly") => {
  if (plan === "pro") {
    return billingPeriod === "yearly" 
      ? STRIPE_PRICE_IDS.PRO_YEARLY 
      : STRIPE_PRICE_IDS.PRO_MONTHLY;
  }
  
  // Enterprise is only monthly for now
  return STRIPE_PRICE_IDS.ENTERPRISE_MONTHLY;
};

