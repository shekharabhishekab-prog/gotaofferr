import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import dmSansFont from "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?url";
import spaceGroteskFont from "@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2?url";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { NetworkStatusBanner } from "../components/NetworkStatusBanner";
import { Toaster } from "../components/ui/sonner";
import { DeferredThirdParty } from "../components/DeferredThirdParty";
import { AdPolicy } from "../components/AdPolicy";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";

// Publishable IDs. Env vars win when set; production falls back to the live IDs
// so the tags ship even if the deploy build doesn't load .env.production.
const GA_ID =
  (import.meta.env['VITE_GA_MEASUREMENT_ID'] as string | undefined) ||
  (import.meta.env.PROD ? "G-3J5Q0XY5WS" : undefined);
const ADSENSE_CLIENT =
  (import.meta.env['VITE_ADSENSE_CLIENT'] as string | undefined) ||
  (import.meta.env.PROD ? "ca-pub-9570238585409638" : undefined);

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
        <nav aria-label="Helpful links" className="mt-6 text-sm text-muted-foreground">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <li>
              <Link to="/tailor" className="underline underline-offset-4 hover:text-foreground">
                Tailor a resume
              </Link>
            </li>
            <li>
              <a href="/jobs" className="underline underline-offset-4 hover:text-foreground">
                Job finder
              </a>
            </li>
            <li>
              <Link to="/pricing" className="underline underline-offset-4 hover:text-foreground">
                Pricing
              </Link>
            </li>
            <li>
              <a href="/sitemap.xml" className="underline underline-offset-4 hover:text-foreground">
                Sitemap
              </a>
            </li>
            <li>
              <a href="/llms.txt" className="underline underline-offset-4 hover:text-foreground">
                llms.txt
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { property: "og:site_name", content: "GotaOfferr" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://gotaofferr.com/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: "https://gotaofferr.com/og-image.png" },
      ...(ADSENSE_CLIENT ? [{ name: "google-adsense-account", content: ADSENSE_CLIENT }] : []),
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Font preloads only in production; in dev the `?url` paths point at
      // /node_modules/... which Vite does not serve, producing 404 noise.
      ...(import.meta.env.PROD
        ? [
            {
              rel: "preload",
              as: "font",
              type: "font/woff2",
              href: dmSansFont,
              crossOrigin: "anonymous" as const,
            },
            {
              rel: "preload",
              as: "font",
              type: "font/woff2",
              href: spaceGroteskFont,
              crossOrigin: "anonymous" as const,
            },
          ]
        : []),

      // Versioned icon URLs: browsers (and Chrome's synced favicon DB) cache
      // icons for weeks, so a plain swap leaves returning visitors on the old
      // mark. Bumping ?v= forces a refetch; /favicon.ico now exists for the
      // generic fallback fetch (it used to 404).
      { rel: "icon", href: "/favicon.ico?v=2", sizes: "any" },
      { rel: "icon", href: "/brand/logo-symbol-square.png?v=2", type: "image/png" },
      { rel: "apple-touch-icon", href: "/brand/logo-symbol-square.png?v=2" },
      ...(GA_ID
        ? [
            { rel: "preconnect", href: "https://www.googletagmanager.com" },
            { rel: "dns-prefetch", href: "https://www.google-analytics.com" },
          ]
        : []),
      ...(ADSENSE_CLIENT
        ? [
            {
              rel: "preconnect",
              href: "https://pagead2.googlesyndication.com",
              crossOrigin: "anonymous" as const,
            },
          ]
        : []),
    ],
    scripts: [
      // AdSense by plan, decided BEFORE any ad script exists. This inline script only
      // sets flags - it never loads adsbygoogle.js. The script itself is injected later
      // by <DeferredThirdParty /> (idle / first interaction) so 220KB+ of ad code stays
      // off the critical path. A paid plan remembered on this device sets __gtAdsSkip so
      // the deferred loader skips ads entirely (no ad request, no flash). A signed-in
      // visitor whose plan is not known yet stays paused until AdPolicy confirms the plan.
      ...(ADSENSE_CLIENT
        ? [
            {
              children:
                'window.adsbygoogle=window.adsbygoogle||[];(function(){var t=null,s=false;try{t=localStorage.getItem("gt_tier");for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf("sb-")===0&&k.slice(-11)==="-auth-token"){s=true}}}catch(e){}'
                + 'if(t&&t!=="free"){window.adsbygoogle.pauseAdRequests=1;window.__gtAdsSkip=1;return}'
                + 'if(s){window.adsbygoogle.pauseAdRequests=1}})()',
            },
          ]
        : []),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://gotaofferr.com/#organization",
              name: "GotaOfferr",
              url: "https://gotaofferr.com",
              description:
                "GotaOfferr rewrites your resume and writes a matching cover letter for each job description, delivered as ATS-ready PDFs.",
              logo: {
                "@type": "ImageObject",
                url: "https://gotaofferr.com/brand/logo-symbol-square.png",
              },
              image: "https://gotaofferr.com/brand/logo-symbol-square.png",
              email: "contact@gotaofferr.com",
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  contactType: "customer support",
                  email: "contact@gotaofferr.com",
                  url: "https://gotaofferr.com/contact",
                  areaServed: "Worldwide",
                  availableLanguage: ["English"],
                },
              ],
              address: {
                "@type": "PostalAddress",
                addressCountry: "IN",
              },
            },
            {
              "@type": "WebSite",
              "@id": "https://gotaofferr.com/#website",
              name: "GotaOfferr",
              url: "https://gotaofferr.com",
              publisher: { "@id": "https://gotaofferr.com/#organization" },
            },
          ],
        }),
      },
      // GA + AdSense are intentionally NOT in <head>: they load after the page
      // is interactive via <DeferredThirdParty /> to keep TBT/LCP low on mobile.
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  // gtag only auto-tracks the first load; send a page_view on client navigation.
  useEffect(() => {
    if (!GA_ID) return;
    return router.subscribe("onResolved", () => {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (typeof gtag !== "function") return;
      gtag("event", "page_view", {
        page_path: window.location.pathname + window.location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    });
  }, [router]);

  // Decorative animations stay paused (mobile only) until the page is loaded,
  // then resume in full — no motion is removed, just delayed a moment.
  useEffect(() => {
    let done = false;
    const enable = () => {
      if (done) return;
      done = true;
      document.body.classList.add("motion-ready");
    };
    const t = window.setTimeout(enable, 2500);
    if (document.readyState === "complete") {
      window.setTimeout(enable, 300);
    } else {
      window.addEventListener("load", () => window.setTimeout(enable, 300), { once: true });
    }
    return () => window.clearTimeout(t);
  }, []);





  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background">
        <NetworkStatusBanner />
        <SiteHeader />
        <div className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </div>
        <SiteFooter />
      </div>
      <Toaster position="top-center" richColors />
      <DeferredThirdParty gaId={GA_ID} />
      <AdPolicy />
    </QueryClientProvider>
  );
}

