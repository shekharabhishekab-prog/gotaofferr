import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, User, X } from "lucide-react";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { NetworkHeader, isNetworkPath } from "@/components/NetworkHeader";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/ats-checker", label: "ATS score checker" },
  { to: "/resume-builder", label: "Resume builder" },
  { to: "/ai-interview", label: "AI Interview" },
  { to: "/jobs", label: "Job finder" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { session, loading } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signInTo = pathname === "/ai-interview" || pathname === "/ats-checker" ? pathname : "/tailor";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }

  if (isNetworkPath(pathname)) return <NetworkHeader />;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="site-container flex items-center justify-between py-3 md:px-2 lg:px-4">
        <Link to="/" className="flex items-center" aria-label="gotaofferr home">
          <span className="text-xl font-bold tracking-tight text-foreground">gotaofferr</span>
        </Link>


        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-sm text-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {!loading && session ? (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/account">
                <User className="size-4" /> Account
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth" search={{ redirect: signInTo }}>
                Sign in
              </Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link to="/tailor">Tailor my resume</Link>
          </Button>
        </div>


        <button
          type="button"
          aria-label="Toggle menu"
          className="text-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <nav className="site-container flex flex-col gap-1 py-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            {!loading && session ? (
              <>
                <Button variant="outline" className="mt-2" asChild>
                  <Link to="/account" onClick={() => setOpen(false)}>
                    <User className="size-4" /> Account
                  </Link>
                </Button>
                <Button variant="ghost" className="mt-2" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button variant="outline" className="mt-2" asChild>
                <Link to="/auth" search={{ redirect: signInTo }} onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
            )}
            <Button asChild className="mt-2">

              <Link to="/tailor" onClick={() => setOpen(false)}>
                Tailor my resume
              </Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
