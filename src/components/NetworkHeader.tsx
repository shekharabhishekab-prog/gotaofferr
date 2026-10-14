import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Briefcase, Home, MessageSquare, Search, User, Users } from "lucide-react";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { DEMO_PROFILES } from "@/lib/profile-types";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

/** Header for network pages (profiles, companies, network jobs). Our colors, LinkedIn-style order. */
export function isNetworkPath(pathname: string) {
  return pathname === "/network" || pathname.startsWith("/p/") || pathname.startsWith("/profile/") || pathname.startsWith("/company/") || pathname.startsWith("/j/");
}

const item = "flex min-w-0 flex-col items-center gap-0.5 px-1 py-1 text-[10px] sm:min-w-[4.5rem] sm:px-2 sm:text-xs";

const TRY = ["seo executive", "content writer", "marketing", "volunteer"];

type Hit =
  | { key: string; title: string; sub: string; tag: string; to: "/p/$slug"; params: { slug: string } }
  | { key: string; title: string; sub: string; tag: string; to: "/j/$id"; params: { id: string } };

function searchDemo(term: string): Hit[] {
  const out: Hit[] = [];
  for (const p of Object.values(DEMO_PROFILES)) {
    if (`${p.name} ${p.headline}`.toLowerCase().includes(term)) {
      out.push({ key: p.slug, title: p.name, sub: p.headline, tag: p.kind === "individual" ? "P" : p.kind === "company" ? "C" : "O", to: "/p/$slug", params: { slug: p.slug } });
    }
    for (const j of p.jobs) {
      if (`${j.title} ${p.name} ${j.type} ${(j.skills || []).join(" ")}`.toLowerCase().includes(term)) {
        out.push({ key: j.id, title: j.title, sub: `${p.name} - ${j.location}`, tag: "J", to: "/j/$id", params: { id: j.id } });
      }
    }
  }
  return out.slice(0, 6);
}

function Soon({ icon: Icon, label }: { icon: typeof Home; label: string }) {
  return (
    <span aria-disabled="true" title={`${label} arrives in a later update`} className={`${item} cursor-not-allowed text-muted-foreground/50`}>
      <Icon className="size-5" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

function SearchBody({ term, results, setQ, onPick }: { term: string; results: Hit[]; setQ: (v: string) => void; onPick: () => void }) {
  return (
    <>
              {term ? (
                <>
                  <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-widest text-primary">Results</p>
                  {results.length ? (
                    <ul>
                      {results.map((r) => (
                        <li key={r.key}>
                          <Link to={r.to} params={r.params} onClick={() => onPick()} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted">
                            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{r.tag}</span>
                            <span className="min-w-0">
                              <span className="block truncate text-foreground">{r.title}</span>
                              <span className="block truncate text-xs text-muted-foreground">{r.sub}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-2 py-2 text-muted-foreground">No demo match. Real search arrives with the network update.</p>
                  )}
                </>
              ) : (
                <>
                  <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-widest text-primary">Try searching for</p>
                  <ul>
                    {TRY.map((t) => (
                      <li key={t}>
                        <button type="button" onClick={() => setQ(t)} className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-foreground hover:bg-muted">
                          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
                          {t}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-2 border-t border-border/60 px-2 pt-2 text-xs text-muted-foreground">Demo search. It only finds the demo pages and jobs.</p>
    </>
  );
}

export function NetworkHeader() {
  const { session, loading } = useSession();
  const [open, setOpen] = useState(false);
  const [sOpen, setSOpen] = useState(false);
  const [mOpen, setMOpen] = useState(false);
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const results = term ? searchDemo(term) : [];
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
        <div
          className="relative hidden max-w-xs flex-1 md:block"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSOpen(false);
          }}
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setSOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSOpen(false);
            }}
            aria-label="Search people, companies and jobs"
            placeholder="Search people, companies, jobs"
            className="w-full rounded-full border border-border/60 bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70"
          />
          {sOpen ? (
            <div className="absolute left-0 top-full z-50 mt-2 w-[26rem] max-w-[90vw] rounded-xl border border-border/60 bg-card p-3 text-sm shadow-xl">
              <SearchBody term={term} results={results} setQ={setQ} onPick={() => setSOpen(false)} />
            </div>
          ) : null}
        </div>
        <button type="button" aria-label="Search" aria-expanded={mOpen} onClick={() => setMOpen((v) => !v)} className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground md:hidden">
          <Search className="size-5" aria-hidden="true" />
        </button>
        <nav aria-label="Network" className="ml-auto flex items-center">
          <Link to="/" className={`${item} text-muted-foreground hover:text-foreground`}>
            <Home className="size-5" aria-hidden="true" />
            <span>Home</span>
          </Link>
          <Link to="/network" className={`${item} text-muted-foreground hover:text-foreground`}>
            <Users className="size-5" aria-hidden="true" />
            <span>Network</span>
          </Link>
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
      {mOpen ? (
        <div className="border-t border-border/60 bg-card px-3 py-3 md:hidden">
          <input
            type="search"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search people, companies and jobs"
            placeholder="Search people, companies, jobs"
            className="mb-2 w-full rounded-full border border-border/60 bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/70"
          />
          <div className="text-sm">
            <SearchBody term={term} results={results} setQ={setQ} onPick={() => setMOpen(false)} />
          </div>
        </div>
      ) : null}
    </header>
  );
}
