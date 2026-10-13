import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { DEMO_PROFILES, fmtMonth, fmtRange, initials, safeUrl, type PublicProfile } from "@/lib/profile-types";

function SectionTitle({ children }: { children: string }) {
  return <h2 className="font-display text-lg font-bold text-foreground">{children}</h2>;
}

const card = "rounded-xl border border-border/60 bg-card p-5 sm:p-6";

/** Default cover when no banner image is uploaded: our colors, no outside artwork. */
function Cover({ tall }: { tall?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-t-xl ${tall ? "h-36 sm:h-48" : "h-28 sm:h-44"} bg-[linear-gradient(120deg,#0b0b0b_0%,#1d1a05_55%,#3a3200_100%)]`}
    >
      <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-primary/80" />
      <div className="absolute right-40 top-10 h-40 w-40 rounded-full bg-primary/25" />
    </div>
  );
}

export function ProfileView({ profile: p, banner, compact }: { profile: PublicProfile; banner?: string; compact?: boolean }) {
  const isPerson = p.kind === "individual";
  const hq = p.org?.locations.find((l) => l.hq);
  const others = Object.values(DEMO_PROFILES).filter((x) => x.slug !== p.slug);

  return (
    <main className={compact ? "w-full" : "mx-auto w-full max-w-[1400px] px-3 py-6 sm:px-6 sm:py-10"}>
      {banner ? (
        <p className="mb-4 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 text-xs text-muted-foreground">{banner}</p>
      ) : null}

      <div className={`grid gap-6 ${compact ? "" : "xl:grid-cols-[minmax(0,1fr)_21rem]"}`}>
        <div className="min-w-0 space-y-4">
          {/* Top card */}
          <header className="overflow-hidden rounded-xl border border-border/60 bg-card">
            <Cover tall={!isPerson} />
            <div className="relative px-5 pb-5 sm:px-8 sm:pb-7">
              <div
                aria-hidden="true"
                className={`-mt-14 flex h-28 w-28 items-center justify-center border-4 border-card bg-primary font-display text-4xl font-bold text-primary-foreground sm:-mt-16 sm:h-32 sm:w-32 ${
                  isPerson ? "rounded-full" : "rounded-xl"
                }`}
              >
                {initials(p.name)}
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <h1 className="break-words font-display text-2xl font-bold text-foreground sm:text-3xl">
                    {p.name}
                    {p.pronouns ? <span className="ml-2 text-base font-normal text-muted-foreground">({p.pronouns})</span> : null}
                  </h1>
                  <p className="mt-1 text-foreground/90">{p.headline}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isPerson
                      ? p.location
                      : [p.org?.industry, hq ? [hq.city, hq.country].filter(Boolean).join(", ") : p.location, p.org?.size && `${p.org.size} people`]
                          .filter(Boolean)
                          .join(" - ")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary">0 followers{isPerson ? " - 0 connections" : ""}</p>
                  {p.openToWork ? (
                    <p className="mt-3 inline-block rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-semibold text-foreground">
                      Open to work{p.openToWork.titles.length ? `: ${p.openToWork.titles.join(", ")}` : ""}
                      {p.openToWork.workTypes.length ? ` (${p.openToWork.workTypes.join(", ")})` : ""}
                    </p>
                  ) : null}
                </div>
                {isPerson && p.experience[0] ? (
                  <ul className="space-y-2 text-sm text-foreground md:max-w-[16rem]">
                    <li className="flex items-center gap-2">
                      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary text-xs font-bold">{initials(p.experience[0].org)}</span>
                      <span className="min-w-0 truncate">{p.experience[0].org}</span>
                    </li>
                    {p.education[0] ? (
                      <li className="flex items-center gap-2">
                        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary text-xs font-bold">{initials(p.education[0].school)}</span>
                        <span className="min-w-0 truncate">{p.education[0].school}</span>
                      </li>
                    ) : null}
                  </ul>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button type="button" disabled title="Follow arrives with the network update">Follow</Button>
                {isPerson ? (
                  <Button type="button" variant="outline" disabled title="Connect arrives with the network update">Connect</Button>
                ) : null}
                <Button type="button" variant="outline" disabled title="Messaging arrives in a later update">Message</Button>
                {!isPerson && p.org
                  ? p.org.buttons.slice(0, 3).map((b, i) => {
                      const href = safeUrl(b.url);
                      return href ? (
                        <Button key={i} asChild variant="outline">
                          <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc">{b.label || "Visit website"}</a>
                        </Button>
                      ) : null;
                    })
                  : null}
                {isPerson && p.websites && p.websites.length
                  ? p.websites.map((w, i) => {
                      const href = safeUrl(w.url);
                      return href ? (
                        <a key={i} href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className="px-2 text-sm text-primary underline underline-offset-2">
                          {w.label || "Website"}
                        </a>
                      ) : null;
                    })
                  : null}
              </div>
            </div>
            {!isPerson ? (
              <nav aria-label="Page sections" className="flex gap-6 overflow-x-auto border-t border-border/60 px-5 text-sm sm:px-8">
                {["Home", "About", "Jobs", "Posts", "People"].map((t, i) => (
                  <span key={t} className={`whitespace-nowrap py-3 ${i === 0 ? "border-b-2 border-primary font-semibold text-foreground" : "text-muted-foreground"}`}>{t}</span>
                ))}
              </nav>
            ) : null}
          </header>

          {/* About */}
          {p.about ? (
            <section className={card}>
              <SectionTitle>{isPerson ? "About" : "Overview"}</SectionTitle>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{p.about}</p>
            </section>
          ) : null}

          {!isPerson && p.org ? (
            <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
              <SectionTitle>Company details</SectionTitle>
              <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                {[
                  ["Website", p.org.website],
                  ["Industry", p.org.industry],
                  ["Size", p.org.size && `${p.org.size} people`],
                  ["Type", p.org.orgType],
                  ["Founded", p.org.founded],
                  ["Headquarters", (p.org.locations.find((l) => l.hq) && [p.org.locations.find((l) => l.hq)!.city, p.org.locations.find((l) => l.hq)!.country].filter(Boolean).join(", ")) || ""],
                ]
                  .filter(([, val]) => val)
                  .map(([k, val]) => {
                    const href = k === "Website" ? safeUrl(String(val)) : null;
                    return (
                      <div key={k as string}>
                        <dt className="text-xs uppercase tracking-widest text-muted-foreground">{k}</dt>
                        <dd className="mt-0.5 break-words text-foreground">
                          {href ? (
                            <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className="text-primary underline underline-offset-2">
                              {String(val).replace(/^https?:\/\//, "")}
                            </a>
                          ) : (
                            val
                          )}
                        </dd>
                      </div>
                    );
                  })}
              </dl>
              {p.org.locations.length > 1 ? (
                <div className="mt-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Locations</p>
                  <ul className="mt-2 space-y-1 text-sm text-foreground">
                    {p.org.locations.map((l) => (
                      <li key={l.id}>
                        {[l.city, l.region, l.country].filter(Boolean).join(", ")}
                        {l.hq ? <span className="ml-2 rounded-full border border-primary/40 px-2 py-0.5 text-[11px]">Headquarters</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          {!isPerson ? (
            <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
              <SectionTitle>Open roles</SectionTitle>
              {p.jobs.length ? (
                <ul className="mt-4 divide-y divide-border/60">
                  {p.jobs.map((j) => (
                    <li key={j.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <Link to="/j/$id" params={{ id: j.id }} className="font-semibold text-foreground underline-offset-2 hover:underline">
                          {j.title}
                        </Link>
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
            <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
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
            <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
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
            <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
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
            <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
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
            <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
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
            <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
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
          {p.skills.length ? (
            <section className={card}>
              <SectionTitle>{isPerson ? "Skills" : "Specialties"}</SectionTitle>
              {isPerson ? (
                <ul className="mt-3 divide-y divide-border/60">
                  {p.skills.slice(0, 3).map((s) => (
                    <li key={s} className="py-2 text-sm font-semibold text-foreground">{s}</li>
                  ))}
                </ul>
              ) : null}
              <ul className="mt-3 flex flex-wrap gap-2">
                {(isPerson ? p.skills.slice(3) : p.skills).map((s) => (
                  <li key={s} className="rounded-full border border-primary/40 px-3 py-1 text-xs text-foreground">{s}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {/* Right rail */}
        <aside className="space-y-4">
          <div className={card}>
            <p className="text-sm font-semibold text-foreground">Public profile and URL</p>
            <p className="mt-1 break-all text-xs text-muted-foreground">gotaofferr.com/p/{p.slug}</p>
          </div>
          {p.languages && p.languages.length ? (
            <div className={card}>
              <SectionTitle>Languages</SectionTitle>
              <ul className="mt-3 space-y-2 text-sm">
                {p.languages.map((l) => (
                  <li key={l.id}>
                    <span className="font-semibold text-foreground">{l.name}</span>
                    <span className="block text-xs text-muted-foreground">{l.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {others.length ? (
            <div className={card}>
              <SectionTitle>{isPerson ? "More profiles for you" : "Pages people also view"}</SectionTitle>
              <ul className="mt-3 space-y-3">
                {others.map((o) => (
                  <li key={o.slug} className="flex items-center gap-3">
                    <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center bg-primary text-sm font-bold text-primary-foreground ${o.kind === "individual" ? "rounded-full" : "rounded-md"}`}>{initials(o.name)}</span>
                    <span className="min-w-0">
                      <Link to="/p/$slug" params={{ slug: o.slug }} className="block truncate text-sm font-semibold text-foreground hover:underline">{o.name}</Link>
                      <span className="block truncate text-xs text-muted-foreground">{o.headline}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-muted-foreground">Sample suggestions. Real ones arrive with the network update.</p>
            </div>
          ) : null}
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-foreground">Get your own profile</h2>
            <p className="mt-2 text-sm text-muted-foreground">Build it from your resume in about a minute. You choose what is public.</p>
            <Button asChild className="mt-4 w-full">
              <Link to="/resume-builder">Start with your resume</Link>
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}
