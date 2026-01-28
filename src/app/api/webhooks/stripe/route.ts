import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, PlanType } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType as PlanType;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId || !planType) {
    console.error("Missing metadata in checkout session");
    return;
  }

  const plan = PLANS[planType];

  // Get subscription to check if it's trialing
  let subscriptionStatus = "active";
  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      subscriptionStatus = subscription.status;
    } catch (e) {
      console.error("Failed to retrieve subscription:", e);
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus,
      subscriptionPlan: planType,
      bridgeLimit: plan.bridgeLimit ?? 999,
    },
  });

  console.log(`User ${userId} subscribed to ${planType} plan with status ${subscriptionStatus}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!user) {
      console.error("Could not find user for subscription:", subscription.id);
      return;
    }
    
    await updateUserSubscriptionStatus(user.id, subscription);
    return;
  }

  await updateUserSubscriptionStatus(userId, subscription);
}

async function updateUserSubscriptionStatus(userId: string, subscription: Stripe.Subscription) {
  const status = subscription.status;
  const planType = subscription.metadata?.planType as PlanType;
  const plan = planType ? PLANS[planType] : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: status,
      bridgeLimit: status === "active" ? (plan?.bridgeLimit ?? 1) : 1,
    },
  });

  console.log(`Updated subscription status for user ${userId}: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!user) {
    console.error("Could not find user for cancelled subscription:", subscription.id);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "cancelled",
      subscriptionPlan: null,
      bridgeLimit: 1,
    },
  });

  console.log(`Subscription cancelled for user ${user.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error("Could not find user for failed payment:", customerId);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "past_due",
    },
  });

  console.log(`Payment failed for user ${user.id}`);
}
