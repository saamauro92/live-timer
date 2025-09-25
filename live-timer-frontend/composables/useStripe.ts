export const useStripe = () => {
  const config = useRuntimeConfig()
  const stripe = ref(null)
  
  const initializeStripe = async () => {
    if (stripe.value) return stripe.value
    
    const { loadStripe } = await import('@stripe/stripe-js')
    stripe.value = await loadStripe(config.public.stripePublishableKey)
    return stripe.value
  }
  
  const createCheckoutSession = async (priceId: string, successUrl?: string, cancelUrl?: string) => {
    const stripeInstance = await initializeStripe()
    if (!stripeInstance) throw new Error('Stripe not initialized')
    
    const { api } = useApi()
    
    try {
      const response = await api('/stripe/create-checkout-session', {
        method: 'POST',
        body: {
          priceId,
          successUrl: successUrl || `${window.location.origin}/dashboard?success=true`,
          cancelUrl: cancelUrl || `${window.location.origin}/pricing?canceled=true`
        }
      })
      
      const { error } = await stripeInstance.redirectToCheckout({
        sessionId: response.sessionId
      })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }
  
  const createCustomerPortal = async () => {
    const { api } = useApi()
    
    try {
      const response = await api('/stripe/create-portal-session', {
        method: 'POST',
        body: {
          returnUrl: window.location.origin
        }
      })
      
      window.location.href = response.url
    } catch (error) {
      console.error('Error creating portal session:', error)
      throw error
    }
  }
  
  return {
    stripe: readonly(stripe),
    initializeStripe,
    createCheckoutSession,
    createCustomerPortal
  }
}
