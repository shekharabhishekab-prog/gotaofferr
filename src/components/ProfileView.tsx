import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { initials, type PublicProfile } from "@/lib/profile-types";

function SectionTitle({ children }: { children: string }) {
  return <h2 className="font-display text-sm font-bold uppercase tracking-widest text-primary">{children}</h2>;
}

export function ProfileView({ profile: p, banner }: { profile: PublicProfile; banner?: string }) {
  const isPerson = p.kind === "individual";

  return (
    <main className="site-container py-10 sm:py-16">
      {banner ? (
        <p className="mb-6 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
          {banner}
        </p>
      ) : null}

      <header className="flex flex-col gap-5 rounded-xl border border-border/60 bg-card p-6 sm:flex-row sm:items-center sm:p-8">
        <div
          aria-hidden="true"
          className={`flex h-20 w-20 shrink-0 items-center justify-center bg-primary font-display text-3xl font-bold text-primary-foreground ${
            isPerson ? "rounded-full" : "rounded-xl"
          }`}
        >
          {initials(p.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {p.kind === "individual" ? "Professional" : p.kind === "company" ? "Company" : "Organization"}
          </p>
          <h1 className="mt-1 break-words font-display text-3xl font-bold text-foreground sm:text-4xl">{p.name}</h1>
          <p className="mt-1 text-foreground/90">{p.headline}</p>
          <p className="mt-1 text-sm text-muted-foreground">{p.location}</p>
        </div>
        <div className="flex flex-wrap gap-3 sm:flex-col">
          <Button type="button" disabled title="Follow arrives with the network update">
            Follow
          </Button>
          {isPerson ? (
            <Button type="button" variant="outline" disabled title="Connect arrives with the network update">
              Connect
            </Button>
          ) : null}
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-8">
          <section className="rounded-xl border border-border/60 bg-card p-6">
            <SectionTitle>About</SectionTitle>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.about}</p>
          </section>

          {!isPerson ? (
            <section className="rounded-xl border border-border/60 bg-card p-6">
              <SectionTitle>Open roles</SectionTitle>
              {p.jobs.length ? (
                <ul className="mt-4 divide-y divide-border/60">
                  {p.jobs.map((j) => (
                    <li key={j.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <p className="font-semibold text-foreground">{j.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {j.location} - {j.type}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{j.posted}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No open roles right now.</p>
              )}
            </section>
          ) : null}

          {p.experience.length ? (
            <section className="rounded-xl border border-border/60 bg-card p-6">
              <SectionTitle>Experience</SectionTitle>
              <div className="mt-4 space-y-6">
                {p.experience.map((e) => (
                  <div key={`${e.org}-${e.role}`}>
                    <p className="font-semibold text-foreground">{e.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {e.org} - {e.dates}
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {e.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {p.education.length ? (
            <section className="rounded-xl border border-border/60 bg-card p-6">
              <SectionTitle>Education</SectionTitle>
              <ul className="mt-4 space-y-3">
                {p.education.map((e) => (
                  <li key={`${e.school}-${e.degree}`}>
                    <p className="font-semibold text-foreground">{e.school}</p>
                    <p className="text-sm text-muted-foreground">
                      {e.degree} - {e.dates}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-8">
          {p.skills.length ? (
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <SectionTitle>{isPerson ? "Skills" : "Focus"}</SectionTitle>
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.skills.map((s) => (
                  <li key={s} className="rounded-full border border-primary/40 px-3 py-1 text-xs text-foreground">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-6">
            <h2 className="font-display text-lg font-bold text-foreground">Get your own profile</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Build it from your resume in about a minute. You choose what is public.
            </p>
            <Button asChild className="mt-4 w-full">
              <Link to="/resume-builder">Start with your resume</Link>
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}
