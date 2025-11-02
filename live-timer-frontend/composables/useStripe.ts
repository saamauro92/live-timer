export const useStripe = () => {
  const config = useRuntimeConfig()
  const stripe = ref<any>(null);

  const initializeStripe = async () => {
    if (stripe.value) return stripe.value;

    const publishableKey = config.public.stripePublishableKey;

    if (!publishableKey || publishableKey.trim() === "") {
      throw new Error("Stripe publishable key is not configured. Please add NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env file in the live-timer-frontend directory.");
    }

    const { loadStripe } = await import("@stripe/stripe-js");
    stripe.value = await loadStripe(publishableKey);
    return stripe.value;
  };

  const createCheckoutSession = async (priceId: string, successUrl?: string, cancelUrl?: string) => {
    // Ensure we're on the client side
    if (process.server || typeof window === "undefined") {
      throw new Error("Checkout can only be initiated on the client side");
    }

    const stripeInstance = await initializeStripe();
    if (!stripeInstance) throw new Error("Stripe not initialized");

    const { api } = useApi();

    try {
      const response = (await api("/stripe/create-checkout-session", {
        method: "POST",
        body: {
          priceId,
          successUrl: successUrl || `${window.location.origin}/dashboard?success=true`,
          cancelUrl: cancelUrl || `${window.location.origin}/pricing?canceled=true`,
        },
      })) as { sessionId: string; url?: string };

      // Use nextTick to avoid navigation conflicts with Nuxt
      await nextTick();

      const { error } = await stripeInstance.redirectToCheckout({
        sessionId: response.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  };

  const createCustomerPortal = async () => {
    const { api } = useApi();

    try {
      const response = (await api("/stripe/create-portal-session", {
        method: "POST",
        body: {
          returnUrl: window.location.origin,
        },
      })) as { url: string };

      window.location.href = response.url;
    } catch (error) {
      console.error("Error creating portal session:", error);
      throw error;
    }
  };
  
  return {
    stripe: readonly(stripe),
    initializeStripe,
    createCheckoutSession,
    createCustomerPortal
  }
}
