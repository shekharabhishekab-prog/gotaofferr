import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { initials } from "@/lib/profile-types";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "My network | GotaOfferr" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NetworkPage,
});

type Person = { id: string; name: string; headline: string; mutual: number };

const INVITES: Person[] = [
  { id: "i1", name: "Aarav Singh", headline: "Content strategist at Northwind Studio", mutual: 4 },
  { id: "i2", name: "Meera Iyer", headline: "Email marketing lead | Retail brands", mutual: 2 },
  { id: "i3", name: "Dev Kapoor", headline: "Student at Pune University | SEO intern", mutual: 7 },
];

const SUGGESTED: Person[] = [
  { id: "s1", name: "Neha Verma", headline: "Social media manager at BrightLeaf Media", mutual: 5 },
  { id: "s2", name: "Rohan Das", headline: "Web developer | React and Node", mutual: 3 },
  { id: "s3", name: "Isha Rao", headline: "HR executive hiring for marketing roles", mutual: 9 },
  { id: "s4", name: "Kabir Shah", headline: "Graphic designer | Brand and print", mutual: 1 },
  { id: "s5", name: "Ananya Joshi", headline: "Data analyst | Excel and SQL", mutual: 6 },
  { id: "s6", name: "Vikram Nair", headline: "Sales lead at a SaaS start-up", mutual: 2 },
  { id: "s7", name: "Pooja Menon", headline: "Copywriter | Travel and food", mutual: 4 },
  { id: "s8", name: "Arjun Patil", headline: "Final year student | Mechanical", mutual: 8 },
];

const PAGES = [
  { id: "p1", name: "BrightLeaf Media", line: "Marketing and advertising", slug: "demo-brightleaf-media-k4m9" },
  { id: "p2", name: "Green Campus Club", line: "Non-profit and community", slug: "demo-green-campus-club-q8d3" },
];

const MANAGE = ["Connections", "Following and followers", "Groups", "Events", "Pages", "Newsletters"];

function Avatar({ name, round = true }: { name: string; round?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-12 shrink-0 items-center justify-center bg-primary text-sm font-bold text-primary-foreground ${round ? "rounded-full" : "rounded-lg"}`}
    >
      {initials(name)}
    </span>
  );
}

function NetworkPage() {
  const [invites, setInvites] = useState<Record<string, "accepted" | "ignored">>({});
  const [sent, setSent] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const pending = INVITES.filter((p) => !invites[p.id]).length;
  const accepted = Object.values(invites).filter((v) => v === "accepted").length;

  return (
    <main className="mx-auto w-full max-w-[1400px] px-3 py-6 sm:px-6 sm:py-8">
      <p className="mb-4 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
        Preview demo. Made-up people. Buttons work on this screen only and nothing is saved.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_20rem]">
        <aside className="min-w-0 space-y-4">
          <nav aria-label="Manage my network" className="rounded-xl border border-border/60 bg-card p-3">
            <h1 className="px-2 py-2 font-display text-base font-bold text-foreground">Manage my network</h1>
            <ul>
              {MANAGE.map((m) => (
                <li key={m} className="flex items-center justify-between rounded-md px-2 py-2 text-sm text-muted-foreground">
                  <span>{m}</span>
                  <span className="text-xs">{m === "Connections" ? accepted : 0}</span>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 space-y-4">
          <section aria-label="Invitations" className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
            <h2 className="font-display text-lg font-bold text-foreground">Invitations ({pending})</h2>
            <ul className="mt-2 divide-y divide-border/60">
              {INVITES.map((p) => {
                const st = invites[p.id];
                return (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                    <Avatar name={p.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.headline}</p>
                      <p className="text-xs text-muted-foreground">{p.mutual} mutual connections</p>
                    </div>
                    {st ? (
                      <span className="text-xs font-semibold text-primary">{st === "accepted" ? "Connected" : "Ignored"}</span>
                    ) : (
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => setInvites({ ...invites, [p.id]: "ignored" })}>
                          Ignore
                        </Button>
                        <Button type="button" size="sm" onClick={() => setInvites({ ...invites, [p.id]: "accepted" })}>
                          Accept
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-label="People you may know" className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
            <h2 className="font-display text-lg font-bold text-foreground">People you may know</h2>
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {SUGGESTED.map((p) => {
                const done = sent.includes(p.id);
                return (
                  <li key={p.id} className="flex flex-col items-center rounded-xl border border-border/60 p-4 text-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground" aria-hidden="true">
                      {initials(p.name)}
                    </span>
                    <p className="mt-2 text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="line-clamp-2 min-h-[2rem] text-xs text-muted-foreground">{p.headline}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{p.mutual} mutual connections</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                      disabled={done}
                      onClick={() => setSent([...sent, p.id])}
                    >
                      {done ? "Pending" : "Connect"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="min-w-0 space-y-4 lg:col-span-2 xl:col-span-1">
          <section aria-label="Pages you might like" className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
            <h2 className="font-display text-base font-bold text-foreground">Pages for you</h2>
            <ul className="mt-3 space-y-3">
              {PAGES.map((pg) => {
                const f = following.includes(pg.id);
                return (
                  <li key={pg.id} className="flex items-center gap-3">
                    <Avatar name={pg.name} round={false} />
                    <div className="min-w-0 flex-1">
                      <Link to="/p/$slug" params={{ slug: pg.slug }} className="block truncate text-sm font-semibold text-foreground hover:text-primary">
                        {pg.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{pg.line}</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" disabled={f} onClick={() => setFollowing([...following, pg.id])}>
                      {f ? "Following" : "Follow"}
                    </Button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Follow is not the same as Connect. You follow pages. You connect with people.</p>
          </section>
          <section className="rounded-xl border border-primary/40 bg-primary/5 p-5">
            <h2 className="font-display text-base font-bold text-foreground">Get your own profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">Build it from your resume in about a minute.</p>
            <Button asChild className="mt-3 w-full">
              <Link to="/profile/new">Start with your resume</Link>
            </Button>
          </section>
        </aside>
      </div>
    </main>
  );
}
