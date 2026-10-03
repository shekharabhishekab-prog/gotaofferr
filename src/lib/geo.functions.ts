import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

/**
 * Resolve the visitor's country from edge/CDN geo headers.
 *
 * This is the authoritative signal for which market price we show — the
 * browser timezone/locale can be changed trivially, so it is only ever used
 * as a fallback on the client when the edge gives us nothing.
 */
export const getVisitorCountry = createServerFn({ method: 'GET' }).handler(async () => {
  const candidates = [
    'cf-ipcountry',
    'x-vercel-ip-country',
    'x-country-code',
    'x-geo-country',
    'fastly-client-country',
  ];
  const headers = getRequest().headers;
  for (const name of candidates) {
    const value = headers.get(name);
    if (value && /^[A-Za-z]{2}$/.test(value) && value.toUpperCase() !== 'XX') {
      return { country: value.toUpperCase() };
    }
  }
  return { country: null as string | null };
});
