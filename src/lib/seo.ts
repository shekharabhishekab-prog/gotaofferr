/** Absolute URL of the shared social/preview image used across the site. */
export const SITE_IMAGE =
  "https://gotaofferr.com/og-image.png";

/** Publisher block reused in Article JSON-LD. */
export const SITE_PUBLISHER = {
  "@type": "Organization",
  name: "GotaOfferr",
  logo: { "@type": "ImageObject", url: "https://gotaofferr.com/favicon.png" },
} as const;
