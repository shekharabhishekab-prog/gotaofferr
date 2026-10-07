/** Match only Google advertising resources, never Analytics, PostHog or captcha. */
export const GOOGLE_AD_SELECTOR = [
  'script[src*="pagead2.googlesyndication.com"]',
  'script[src*="googleads.g.doubleclick.net"]',
  'iframe[src*="googlesyndication.com"]',
  'iframe[src*="doubleclick.net"]',
  'iframe[id^="google_ads_iframe"]',
  'iframe[id^="aswift_"]',
  'ins.adsbygoogle',
  '.google-auto-placed',
  '#google_vignette',
].join(',');

export function removeGoogleAds(doc: Document): number {
  const elements = Array.from(doc.querySelectorAll<HTMLElement>(GOOGLE_AD_SELECTOR));
  for (const element of elements) {
    element.style.setProperty('display', 'none', 'important');
    element.remove();
  }
  return elements.length;
}

/** Restore the original loader only after this visitor's plan allows ads. */
export function ensureGoogleAds(doc: Document, client: string): void {
  if (!client || doc.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
  const script = doc.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  doc.head.appendChild(script);
}
