import { Wifi, WifiOff, AlertTriangle } from "lucide-react";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";

/**
 * Sticky banner shown when the browser goes offline or detects a slow/metered
 * connection. This is part of "design every state" — users should know why
 * an AI request or download might fail or take longer.
 */
export function NetworkStatusBanner() {
  const { online, isSlow } = useNetworkStatus();

  if (online && !isSlow) return null;

  if (!online) {
    return (
      <div className="relative z-50 border-b border-destructive/30 bg-destructive/90 px-4 py-2 text-center text-sm font-medium text-destructive-foreground">
        <span className="inline-flex items-center gap-2">
          <WifiOff className="size-4" />
          You're offline. Check your connection and try again.
        </span>
      </div>
    );
  }

  return (
    <div className="relative z-50 border-b border-highlight/30 bg-highlight/90 px-4 py-2 text-center text-sm font-medium text-highlight-foreground">
      <span className="inline-flex items-center gap-2">
        <AlertTriangle className="size-4" />
        <Wifi className="size-4" />
        Slow or metered connection detected. Some features may take longer.
      </span>
    </div>
  );
}
