import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Briefcase, Home, MessageSquare, Search, User, Users } from "lucide-react";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

/** Header for network pages (profiles, companies, network jobs). Our colors, LinkedIn-style order. */
export function isNetworkPath(pathname: string) {
  return pathname.startsWith("/p/") || pathname.startsWith("/profile/") || pathname.startsWith("/company/") || pathname.startsWith("/j/");
}

const item = "flex min-w-0 flex-col items-center gap-0.5 px-1 py-1 text-[10px] sm:min-w-[4.5rem] sm:px-2 sm:text-xs";

function Soon({ icon: Icon, label }: { icon: typeof Home; label: string }) {
  return (
    <span aria-disabled="true" title={`${label} arrives in a later update`} className={`${item} cursor-not-allowed text-muted-foreground/50`}>
      <Icon className="size-5" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function NetworkHeader() {
  const { session, loading } = useSession();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-1 px-2 py-1.5 sm:gap-4 sm:px-6">
        <Link to="/" className="shrink-0 text-lg font-bold tracking-tight text-foreground sm:text-xl" aria-label="gotaofferr home">
          gotaofferr
        </Link>
        <div className="relative hidden max-w-xs flex-1 md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            disabled
            aria-label="Search (arrives with the network update)"
            placeholder="Search people, companies, jobs"
            className="w-full rounded-full border border-border/60 bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"
          />
        </div>
        <nav aria-label="Network" className="ml-auto flex items-center">
          <Link to="/" className={`${item} text-muted-foreground hover:text-foreground`}>
            <Home className="size-5" aria-hidden="true" />
            <span>Home</span>
          </Link>
          <Soon icon={Users} label="Network" />
          <Link to="/jobs" className={`${item} text-muted-foreground hover:text-foreground`}>
            <Briefcase className="size-5" aria-hidden="true" />
            <span>Jobs</span>
          </Link>
          <Soon icon={MessageSquare} label="Messaging" />
          <Soon icon={Bell} label="Alerts" />
          <div className="relative">
            <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={`${item} text-muted-foreground hover:text-foreground`}>
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="size-4" aria-hidden="true" />
              </span>
              <span>Me</span>
            </button>
            {open ? (
              <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-border/60 bg-card p-2 text-sm shadow-xl">
                <Link role="menuitem" to="/profile/new" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-foreground hover:bg-muted">
                  Make my public profile
                </Link>
                <Link role="menuitem" to="/company/dashboard" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-foreground hover:bg-muted">
                  Company dashboard
                </Link>
                <Link role="menuitem" to="/company/jobs/new" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-foreground hover:bg-muted">
                  Post a job
                </Link>
                <hr className="my-1 border-border/60" />
                {!loading && session ? (
                  <>
                    <Link role="menuitem" to="/account" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-foreground hover:bg-muted">
                      Account
                    </Link>
                    <button type="button" role="menuitem" onClick={signOut} className="block w-full rounded-md px-3 py-2 text-left text-foreground hover:bg-muted">
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link role="menuitem" to="/auth" search={{ redirect: "/tailor" }} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-foreground hover:bg-muted">
                    Sign in
                  </Link>
                )}
                <Link role="menuitem" to="/tailor" onClick={() => setOpen(false)} className="mt-1 block rounded-md bg-primary px-3 py-2 text-center font-semibold text-primary-foreground">
                  Tailor my resume
                </Link>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
