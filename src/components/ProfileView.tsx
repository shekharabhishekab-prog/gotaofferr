import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { fmtMonth, fmtRange, initials, safeUrl, type PublicProfile } from "@/lib/profile-types";

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
          <h1 className="mt-1 break-words font-display text-3xl font-bold text-foreground sm:text-4xl">
            {p.name}
            {p.pronouns ? <span className="ml-2 text-base font-normal text-muted-foreground">({p.pronouns})</span> : null}
          </h1>
          <p className="mt-1 text-foreground/90">{p.headline}</p>
          <p className="mt-1 text-sm text-muted-foreground">{p.location}</p>
          {p.openToWork ? (
            <p className="mt-2 inline-block rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-semibold text-foreground">
              Open to work{p.openToWork.titles.length ? `: ${p.openToWork.titles.join(", ")}` : ""}
              {p.openToWork.workTypes.length ? ` (${p.openToWork.workTypes.join(", ")})` : ""}
            </p>
          ) : null}
          {p.websites && p.websites.length ? (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {p.websites.map((w, i) => {
                const href = safeUrl(w.url);
                return href ? (
                  <li key={i}>
                    <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className="text-primary underline underline-offset-2">
                      {w.label || "Website"}
                    </a>
                  </li>
                ) : null;
              })}
            </ul>
          ) : null}
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
                  <div key={e.id}>
                    <p className="font-semibold text-foreground">{e.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {[e.org, e.empType].filter(Boolean).join(" - ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[fmtRange(e.start, e.end, e.current), [e.location, e.locType].filter(Boolean).join(", ")]
                        .filter(Boolean)
                        .join(" | ")}
                    </p>
                    {e.description ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {e.description.split("\n").filter((l) => l.trim()).map((l, i) => (
                          <li key={i}>{l.trim()}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {p.projects.length ? (
            <section className="rounded-xl border border-border/60 bg-card p-6">
              <SectionTitle>Projects</SectionTitle>
              <div className="mt-4 space-y-6">
                {p.projects.map((pr) => (
                  <article key={pr.id} className="border-l-2 border-primary/60 pl-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{pr.name}</h3>
                      <span className="rounded-full border border-primary/40 px-2 py-0.5 text-[11px] text-foreground">{pr.type}</span>
                      <span className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">{pr.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[pr.role, pr.associated, fmtRange(pr.start, pr.end, pr.status === "Ongoing", "Ongoing")]
                        .filter(Boolean)
                        .join(" | ")}
                    </p>
                    {pr.summary ? <p className="mt-2 text-sm text-muted-foreground">{pr.summary}</p> : null}
                    {pr.contribution ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">My part: </span>
                        {pr.contribution}
                      </p>
                    ) : null}
                    {pr.collaborators ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">With: </span>
                        {pr.collaborators}
                      </p>
                    ) : null}
                    {pr.tools.length ? (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {pr.tools.map((s) => (
                          <li key={s} className="rounded-full border border-border/60 px-2.5 py-0.5 text-xs text-foreground">
                            {s}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {pr.links.length ? (
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {pr.links.map((l, i) => {
                          const href = safeUrl(l.url);
                          return href ? (
                            <li key={i}>
                              <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className="text-primary underline underline-offset-2">
                                {l.label || "Link"}
                              </a>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {p.education.length ? (
            <section className="rounded-xl border border-border/60 bg-card p-6">
              <SectionTitle>Education</SectionTitle>
              <ul className="mt-4 space-y-4">
                {p.education.map((e) => (
                  <li key={e.id}>
                    <p className="font-semibold text-foreground">{e.school}</p>
                    <p className="text-sm text-muted-foreground">{[e.degree, e.field].filter(Boolean).join(", ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {[fmtRange(e.start, e.end, false), e.grade && `Grade: ${e.grade}`].filter(Boolean).join(" | ")}
                    </p>
                    {e.activities ? <p className="mt-1 text-sm text-muted-foreground">Activities: {e.activities}</p> : null}
                    {e.description ? <p className="mt-1 text-sm text-muted-foreground">{e.description}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {p.certs && p.certs.length ? (
            <section className="rounded-xl border border-border/60 bg-card p-6">
              <SectionTitle>Licenses and certifications</SectionTitle>
              <ul className="mt-4 space-y-3">
                {p.certs.map((c) => {
                  const href = c.url ? safeUrl(c.url) : null;
                  return (
                    <li key={c.id}>
                      <p className="font-semibold text-foreground">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.issuer}</p>
                      <p className="text-xs text-muted-foreground">
                        {[c.issued && `Issued ${fmtMonth(c.issued)}`, c.expires && `Expires ${fmtMonth(c.expires)}`, c.credentialId && `ID ${c.credentialId}`]
                          .filter(Boolean)
                          .join(" | ")}
                      </p>
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className="text-sm text-primary underline underline-offset-2">
                          Show credential
                        </a>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {p.volunteer && p.volunteer.length ? (
            <section className="rounded-xl border border-border/60 bg-card p-6">
              <SectionTitle>Volunteering</SectionTitle>
              <ul className="mt-4 space-y-3">
                {p.volunteer.map((x) => (
                  <li key={x.id}>
                    <p className="font-semibold text-foreground">{x.role}</p>
                    <p className="text-sm text-muted-foreground">{[x.org, x.cause].filter(Boolean).join(" - ")}</p>
                    <p className="text-xs text-muted-foreground">{fmtRange(x.start, x.end, !x.end && !!x.start)}</p>
                    {x.description ? <p className="mt-1 text-sm text-muted-foreground">{x.description}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {p.honors && p.honors.length ? (
            <section className="rounded-xl border border-border/60 bg-card p-6">
              <SectionTitle>Honors and awards</SectionTitle>
              <ul className="mt-4 space-y-3">
                {p.honors.map((h) => (
                  <li key={h.id}>
                    <p className="font-semibold text-foreground">{h.title}</p>
                    <p className="text-sm text-muted-foreground">{[h.issuer, h.date && fmtMonth(h.date)].filter(Boolean).join(" | ")}</p>
                    {h.description ? <p className="mt-1 text-sm text-muted-foreground">{h.description}</p> : null}
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
                {p.skills.map((s, i) => (
                  <li
                    key={s}
                    className={`rounded-full border px-3 py-1 text-xs text-foreground ${
                      i < 3 && isPerson ? "border-primary bg-primary/10 font-semibold" : "border-primary/40"
                    }`}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {p.languages && p.languages.length ? (
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <SectionTitle>Languages</SectionTitle>
              <ul className="mt-4 space-y-2 text-sm">
                {p.languages.map((l) => (
                  <li key={l.id}>
                    <span className="font-semibold text-foreground">{l.name}</span>
                    <span className="block text-xs text-muted-foreground">{l.level}</span>
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
