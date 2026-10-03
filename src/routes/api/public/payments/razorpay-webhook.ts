import { createFileRoute } from '@tanstack/react-router';
import { verifyRazorpayWebhook, rzp } from '@/lib/razorpay.server';
import { upsertRazorpaySubscriptionRow, setSubscriptionStatus } from '@/lib/subscription-sync.server';

const ENV = 'live' as const;

async function refresh(subscriptionId: string) {
  const subscription = await rzp<any>(`/subscriptions/${subscriptionId}`);
  await upsertRazorpaySubscriptionRow(subscription, ENV);
}

export const Route = createFileRoute('/api/public/payments/razorpay-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let event: string;
        let payload: any;
        try {
          ({ event, payload } = await verifyRazorpayWebhook(request));
        } catch (e) {
          console.error('Razorpay webhook rejected:', e);
          return new Response('Invalid signature', { status: 401 });
        }

        try {
          const subscription = payload?.subscription?.entity;
          switch (event) {
            case 'subscription.activated':
            case 'subscription.charged':
            case 'subscription.updated':
            case 'subscription.pending':
            case 'subscription.halted':
            case 'subscription.cancelled':
            case 'subscription.completed':
            case 'subscription.paused':
            case 'subscription.resumed':
              if (subscription?.id) {
                // Re-read so period dates and status stay authoritative.
                try {
                  await refresh(subscription.id);
                } catch {
                  await upsertRazorpaySubscriptionRow(subscription, ENV);
                }
              }
              break;
            case 'payment.failed':
              if (payload?.payment?.entity?.subscription_id) {
                await setSubscriptionStatus(payload.payment.entity.subscription_id, 'past_due', ENV);
              }
              break;
            default:
              console.log('Unhandled Razorpay event:', event);
          }
        } catch (e) {
          console.error('Razorpay webhook error:', e);
          return new Response('Webhook error', { status: 400 });
        }

        return Response.json({ received: true });
      },
    },
  },
});
