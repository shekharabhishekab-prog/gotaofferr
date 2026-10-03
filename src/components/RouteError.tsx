import { useRouter } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Shared route-level error component.
 *
 * Renders inside the route's layout so a failed loader or server function
 * doesn't blow away the whole page shell. Used by interactive routes across
 * the app.
 */
export function RouteError({ error, reset }: { error: Error; reset?: () => void }) {
  const router = useRouter();

  return (
    <div className="site-container flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-foreground">
        This page didn't load
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Something went wrong on our end. You can try refreshing or head back home.
      </p>
      {process.env.NODE_ENV !== "production" && error?.message && (
        <p className="mt-4 max-w-md rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error.message}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          onClick={() => {
            router.invalidate();
            reset?.();
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="mr-2 size-4" />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <a href="/">Go home</a>
        </Button>
      </div>
    </div>
  );
}
