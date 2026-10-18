import { useCallback, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { toast } from "@/lib/toast";

import { createTopupOrder, verifyTopupPayment } from '@/lib/topups.functions';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpay(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Checkout unavailable'));
    if (window.Razorpay) return resolve(window.Razorpay);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener('load', () => resolve(window.Razorpay));
    script.addEventListener('error', () => reject(new Error('Could not load the payment window')));
    if (!existing) document.body.appendChild(script);
  });
}

/**
 * One-off top-up checkout. Credits are only released after the server has
 * verified the payment signature with Razorpay.
 */
export function useTopupCheckout(onPurchased?: () => void) {
  const [buying, setBuying] = useState<string | null>(null);
  const createOrder = useServerFn(createTopupOrder);
  const verify = useServerFn(verifyTopupPayment);

  const buyTopup = useCallback(
    async (packId: string, currency: string) => {
      setBuying(packId);
      try {
        const [Razorpay, order] = await Promise.all([
          loadRazorpay(),
          createOrder({ data: { packId, currency } }),
        ]);
        if ('error' in order) throw new Error(order.error);

        const rzp = new Razorpay({
          key: order.keyId,
          order_id: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: 'GotaOfferr',
          description: order.name,
          image: `${window.location.origin}/favicon.png`,
          prefill: order.prefill,
          theme: { color: '#000000' },
          modal: { ondismiss: () => setBuying(null) },
          handler: async (response: any) => {
            try {
              const result = await verify({
                data: {
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                },
              });
              if (!result.ok) throw new Error(result.error ?? 'Could not confirm the payment');
              toast.success('Top-up added to your account.');
              onPurchased?.();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : 'Could not confirm the payment');
            } finally {
              setBuying(null);
            }
          },
        });
        rzp.on('payment.failed', (response: any) => {
          setBuying(null);
          toast.error(response?.error?.description ?? 'Payment failed. Please try again.');
        });
        rzp.open();
      } catch (e) {
        setBuying(null);
        toast.error(e instanceof Error ? e.message : 'Could not start checkout');
      }
    },
    [createOrder, verify, onPurchased],
  );

  return { buyTopup, buying };
}

