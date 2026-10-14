/** Absolute URL of the shared social/preview image used across the site. */
export const SITE_IMAGE =
  "https://terbey.com/og-image.png";

/** Publisher block reused in Article JSON-LD. */
export const SITE_PUBLISHER = {
  "@type": "Organization",
  name: "Terbey",
  logo: { "@type": "ImageObject", url: "https://terbey.com/favicon.png" },
} as const;
