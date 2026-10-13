import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DEMO_PROFILES, initials } from "@/lib/profile-types";

// Phase 1 (preview): company admin dashboard shell. Demo company and zero numbers. Sign-in and real data arrive with the database step.
export const Route = createFileRoute("/company/dashboard")({
  head: () => ({
    meta: [
      { title: "Company dashboard | GotaOfferr" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Dashboard,
});

const MENU = ["Dashboard", "Page posts", "Analytics", "Feed", "Activity", "Inbox", "Edit page", "Jobs", "Settings"];
const card = "rounded-xl border border-border/60 bg-card p-5 sm:p-6";

function Dashboard() {
  const c = DEMO_PROFILES["demo-brightleaf-media-k4m9"];
  const [tips, setTips] = useState([
    { id: "t1", title: "Add your services", body: "Let people see what your company does. Add them in Edit page." },
    { id: "t2", title: "Post your first job", body: "Jobs are free. Pay is shown by default so people do not waste time." },
  ]);
  const [tab, setTab] = useState("Dashboard");

  return (
    <main className="mx-auto w-full max-w-[1400px] px-3 py-6 sm:px-6 sm:py-10">
      <p className="mb-4 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
        Preview demo. Made-up company and zero numbers. Only company and organization pages get this dashboard. Personal profiles cannot post jobs.
      </p>
      <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className={`${card} h-fit`}>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">{initials(c.name)}</span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground">0 followers</p>
            </div>
          </div>
          <Button asChild className="mt-4 w-full"><Link to="/company/jobs/new">Post a job</Link></Button>
          <Button asChild variant="outline" className="mt-2 w-full"><Link to="/p/$slug" params={{ slug: c.slug }}>View as member</Link></Button>
          <nav aria-label="Dashboard menu" className="mt-4 flex gap-1 overflow-x-auto lg:flex-col">
            {MENU.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTab(m)}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-left text-sm ${tab === m ? "bg-primary/10 font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {m}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-4">
          {tab !== "Dashboard" ? (
            <section className={card}>
              <h1 className="font-display text-2xl font-bold text-foreground">{tab}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {tab === "Jobs" ? "Your posted jobs will be listed here with views, applies, pause, close and repost." : "This section opens in a later update."}
              </p>
              {tab === "Jobs" ? <Button asChild className="mt-4"><Link to="/company/jobs/new">Post a job</Link></Button> : null}
            </section>
          ) : (
            <>
              {tips.length ? (
                <section className={card}>
                  <h1 className="font-display text-2xl font-bold text-foreground">Grow your followers faster</h1>
                  <ul className="mt-4 space-y-3">
                    {tips.map((t) => (
                      <li key={t.id} className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background p-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t.title}</p>
                          <p className="text-xs text-muted-foreground">{t.body}</p>
                        </div>
                        <button type="button" aria-label={`Dismiss ${t.title}`} className="text-muted-foreground hover:text-foreground" onClick={() => setTips(tips.filter((x) => x.id !== t.id))}>x</button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className={card}>
                <h2 className="font-display text-lg font-bold text-foreground">Track performance</h2>
                <p className="mt-1 text-xs text-muted-foreground">Last 30 days. Numbers start when people visit your page.</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {["Search appearances", "New followers", "Post impressions", "Page visitors"].map((k) => (
                    <div key={k} className="rounded-lg border border-border/60 bg-background p-4">
                      <dd className="font-display text-2xl font-bold text-foreground">0</dd>
                      <dt className="mt-1 text-xs text-primary">{k}</dt>
                      <p className="text-[11px] text-muted-foreground">No data yet</p>
                    </div>
                  ))}
                </dl>
              </section>

              <section className={card}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Your jobs</h2>
                  <Button asChild size="sm"><Link to="/company/jobs/new">Post a job</Link></Button>
                </div>
                <ul className="mt-3 divide-y divide-border/60">
                  {c.jobs.map((j) => (
                    <li key={j.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <Link to="/j/$id" params={{ id: j.id }} className="font-semibold text-foreground hover:underline">{j.title}</Link>
                        <p className="text-xs text-muted-foreground">{j.location} - {j.type} - posted {j.posted}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">0 views - 0 applies</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={card}>
                <h2 className="font-display text-lg font-bold text-foreground">Recent posts</h2>
                <p className="mt-2 text-sm text-muted-foreground">Page posts arrive with the Feed update. Nothing to manage yet.</p>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
