import { Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "../config/database";
import { logger } from "../utils/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export class StripeController {
  // Create Stripe customer
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;

      if (!email || !name) {
        res.status(400).json({
          success: false,
          message: "Email and name are required",
        });
        return;
      }

      // Check if customer already exists
      const existingCustomer = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      let customer;
      if (existingCustomer.data.length > 0) {
        customer = existingCustomer.data[0];
      } else {
        customer = await stripe.customers.create({
          email,
          name,
          metadata: {
            userId: req.user!.id,
          },
        });
      }

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { stripeCustomerId: customer.id },
      });

      res.json({
        success: true,
        customerId: customer.id,
      });
    } catch (error) {
      logger.error("Error creating Stripe customer:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create customer",
      });
    }
  }

  // Create checkout session
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const { priceId, successUrl, cancelUrl } = req.body;

      if (!priceId) {
        res.status(400).json({
          success: false,
          message: "Price ID is required",
        });
        return;
      }

      const user = req.user!;
      let customerId = user.stripeCustomerId;

      // Create customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id,
          },
        });
        customerId = customer.id;

        // Update user with customer ID
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId },
        });
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl || `${process.env.FRONTEND_URL}/dashboard?success=true`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/pricing?canceled=true`,
        metadata: {
          userId: user.id,
        },
        subscription_data: {
          metadata: {
            userId: user.id,
          },
        },
      });

      res.json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      logger.error("Error creating checkout session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create checkout session",
      });
    }
  }

  // Create customer portal session
  async createPortalSession(req: Request, res: Response): Promise<void> {
    try {
      const { returnUrl } = req.body;
      const user = req.user!;

      if (!user.stripeCustomerId) {
        res.status(400).json({
          success: false,
          message: "No subscription found",
        });
        return;
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: returnUrl || `${process.env.FRONTEND_URL}/dashboard`,
      });

      res.json({
        success: true,
        url: session.url,
      });
    } catch (error) {
      logger.error("Error creating portal session:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create portal session",
      });
    }
  }

  // Get subscription details
  async getSubscription(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user!;

      if (!user.stripeCustomerId) {
        res.json({
          success: true,
          subscription: null,
        });
        return;
      }

      // Get subscriptions from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        expand: ["data.default_payment_method"],
      });

      const activeSubscription = subscriptions.data.find((sub) => sub.status === "active" || sub.status === "trialing");

      if (!activeSubscription) {
        res.json({
          success: true,
          subscription: null,
        });
        return;
      }

      // Get product details
      const product = await stripe.products.retrieve(activeSubscription.items.data[0].price.product as string);

      res.json({
        success: true,
        subscription: {
          id: activeSubscription.id,
          status: activeSubscription.status,
          currentPeriodStart: activeSubscription.current_period_start,
          currentPeriodEnd: activeSubscription.current_period_end,
          cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
          product: {
            id: product.id,
            name: product.name,
            description: product.description,
          },
          price: {
            id: activeSubscription.items.data[0].price.id,
            amount: activeSubscription.items.data[0].price.unit_amount,
            currency: activeSubscription.items.data[0].price.currency,
            interval: activeSubscription.items.data[0].price.recurring?.interval,
          },
        },
      });
    } catch (error) {
      logger.error("Error getting subscription:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get subscription",
      });
    }
  }

  // Cancel subscription
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user!;

      if (!user.stripeCustomerId) {
        res.status(400).json({
          success: false,
          message: "No subscription found",
        });
        return;
      }

      // Get active subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
      });

      if (subscriptions.data.length === 0) {
        res.status(400).json({
          success: false,
          message: "No active subscription found",
        });
        return;
      }

      const subscription = subscriptions.data[0];

      // Cancel at period end
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });

      res.json({
        success: true,
        message: "Subscription will be canceled at the end of the current period",
      });
    } catch (error) {
      logger.error("Error canceling subscription:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel subscription",
      });
    }
  }

  // Reactivate subscription
  async reactivateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user!;

      if (!user.stripeCustomerId) {
        res.status(400).json({
          success: false,
          message: "No subscription found",
        });
        return;
      }

      // Get subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
      });

      const subscription = subscriptions.data.find((sub) => sub.cancel_at_period_end === true);

      if (!subscription) {
        res.status(400).json({
          success: false,
          message: "No subscription to reactivate",
        });
        return;
      }

      // Reactivate subscription
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: false,
      });

      res.json({
        success: true,
        message: "Subscription reactivated successfully",
      });
    } catch (error) {
      logger.error("Error reactivating subscription:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reactivate subscription",
      });
    }
  }

  // Handle Stripe webhooks
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const sig = req.headers["stripe-signature"] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        logger.error("Webhook signature verification failed:", err);
        res.status(400).send("Webhook signature verification failed");
        return;
      }

      // Handle the event
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
          await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
          break;
        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case "invoice.payment_succeeded":
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case "invoice.payment_failed":
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error("Error handling webhook:", error);
      res.status(500).json({
        success: false,
        message: "Webhook handling failed",
      });
    }
  }

  private async handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
    try {
      const userId = subscription.metadata.userId;
      if (!userId) return;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return;

      // Get product details
      const product = await stripe.products.retrieve(subscription.items.data[0].price.product as string);

      // Upsert subscription in database
      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: subscription.id },
        update: {
          status: subscription.status,
          periodStart: new Date(subscription.current_period_start * 1000),
          periodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        create: {
          plan: product.name,
          referenceId: userId,
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          periodStart: new Date(subscription.current_period_start * 1000),
          periodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });

      logger.info(`Subscription updated for user ${userId}: ${subscription.status}`);
    } catch (error) {
      logger.error("Error handling subscription change:", error);
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "canceled" },
      });

      logger.info(`Subscription deleted: ${subscription.id}`);
    } catch (error) {
      logger.error("Error handling subscription deletion:", error);
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    try {
      if (invoice.subscription) {
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { status: "active" },
        });
      }

      logger.info(`Payment succeeded for invoice: ${invoice.id}`);
    } catch (error) {
      logger.error("Error handling payment success:", error);
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      if (invoice.subscription) {
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { status: "past_due" },
        });
      }

      logger.info(`Payment failed for invoice: ${invoice.id}`);
    } catch (error) {
      logger.error("Error handling payment failure:", error);
    }
  }
}
