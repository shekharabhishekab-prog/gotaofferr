import { Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Shared route-level not-found component.
 *
 * Keeps the site header/footer visible and gives the user clear next steps.
 */
export function RouteNotFound() {
  return (
    <div className="site-container flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="font-display text-8xl font-bold text-highlight/80">404</div>
      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <a href="/">
            <Home className="mr-2 size-4" />
            Go home
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/tailor">
            <Search className="mr-2 size-4" />
            Tailor a resume
          </a>
        </Button>
      </div>
    </div>
  );
}
