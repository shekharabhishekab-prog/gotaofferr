import { useCallback, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { toast } from "@/lib/toast";

import { createSubscriptionCheckout } from '@/lib/payments.functions';

interface CheckoutOptions {
  priceId: string;
  quantity?: number;
  currency?: string;
  returnUrl?: string;
  title?: string;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/** Loads Razorpay Checkout once, on demand, so it never blocks first paint. */
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
 * Opens Razorpay Checkout as a centred overlay (its own modal), so payment
 * appears immediately in view on desktop and mobile.
 */
export function useStripeCheckout() {
  const [isOpen, setIsOpen] = useState(false);
  const startCheckout = useServerFn(createSubscriptionCheckout);

  const closeCheckout = useCallback(() => setIsOpen(false), []);

  const openCheckout: (opts: CheckoutOptions & { indianConfirmed?: boolean }) => Promise<void> = useCallback(
    async (opts: CheckoutOptions & { indianConfirmed?: boolean }): Promise<void> => {
      setIsOpen(true);
      try {
        const [Razorpay, result] = await Promise.all([
          loadRazorpay(),
          startCheckout({ data: { priceId: opts.priceId, ...(opts.indianConfirmed ? { indianConfirmed: true } : {}) } }),
        ]);
        if ('geoNotice' in result) {
          setIsOpen(false);
          toast(
            'Plot twist: you are not in India and neither is your card. We love the confidence. Pay with an Indian card/UPI, or see your own price.',
            {
              duration: 15000,
              action: { label: 'I have an Indian card/UPI', onClick: () => { void openCheckout({ ...opts, indianConfirmed: true }); } },
            },
          );
          return;
        }
        if ('error' in result) throw new Error(result.error);

        const rzp = new Razorpay({
          key: result.keyId,
          subscription_id: result.subscriptionId,
          name: 'Terbey',
          description: `${opts.title ?? 'Subscription'} — auto-renews monthly until you cancel`,
          image: `${window.location.origin}/favicon.png`,
          prefill: result.prefill,
          theme: { color: '#000000' },
          modal: { ondismiss: () => setIsOpen(false) },
          handler: () => {
            setIsOpen(false);
            const base = `${window.location.origin}/checkout/return`;
            window.location.href = `${base}?subscription_id=${result.subscriptionId}`;
          },
        });
        rzp.on('payment.failed', (response: any) => {
          setIsOpen(false);
          toast.error('That payment bounced like a bad tennis serve 🎾 Please try again or use a different card.');
        });
        rzp.open();
      } catch (e) {
        setIsOpen(false);
        const m = e instanceof Error ? e.message : '';
        toast.error(m && m.length < 90 && !/key|passed|razorpay|undefined|null|token|fetch|json|\b[45]\d\d\b/i.test(m) ? m : 'Checkout hit a speed bump 🚧 Please try again in a moment.');
      }
    },
    [startCheckout],
  ) as any;

  // Razorpay renders its own overlay, so nothing extra needs mounting.
  const checkoutElement = null;

  return { openCheckout, closeCheckout, isOpen, checkoutElement };
}

