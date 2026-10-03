import { useEffect, useRef } from "react";

import { TURNSTILE_SCRIPT_URL, TURNSTILE_SITE_KEY } from "@/lib/turnstile";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme?: "auto" | "light" | "dark";
      size?: "normal" | "flexible" | "compact";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = TURNSTILE_SCRIPT_URL;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile-script-failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Invisible-to-most-users bot gate. Renders Cloudflare's managed challenge and
 * hands the resulting token to the parent so it can be verified server-side.
 */
export function TurnstileWidget({
  onToken,
  className,
}: {
  onToken: (token: string | null) => void;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(hostRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "dark",
          size: "flexible",
          callback: (token: string) => cb.current(token),
          "expired-callback": () => cb.current(null),
          "error-callback": () => cb.current(null),
        });
      })
      .catch(() => cb.current(null));

    return () => {
      cancelled = true;
      try {
        if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      } catch {
        /* widget already gone */
      }
    };
  }, []);

  return <div ref={hostRef} className={className} />;
}

/** Resets every rendered widget so a fresh single-use token is issued. */
export function resetTurnstile() {
  try {
    window.turnstile?.reset();
  } catch {
    /* noop */
  }
}
