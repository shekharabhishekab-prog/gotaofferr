import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { findDemoJob, jobJsonLd, safeUrl, type JobSalary, type ProfileJob, type PublicProfile } from "@/lib/profile-types";

// Phase 1 (preview): public job page, server-rendered with JobPosting JSON-LD. Demo jobs only until the database step is approved.
export const Route = createFileRoute("/j/$id")({
  loader: ({ params }: { params: { id: string } }) => {
    const found = findDemoJob(params.id);
    if (!found) throw notFound();
    return found;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Job not found | GotaOfferr" }, { name: "robots", content: "noindex" }] };
    const { job, company } = loaderData as { job: ProfileJob; company: PublicProfile };
    const url = `https://gotaofferr.com/j/${job.id}`;
    const title = `${company.name} hiring ${job.title} in ${job.location} | GotaOfferr`;
    return {
      meta: [
        { title },
        { name: "description", content: (job.description || job.title).replace(/\s+/g, " ").slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:url", content: url },
        ...(company.indexable ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jobJsonLd(job, company, url)) }],
    };
  },
  component: JobPage,
  notFoundComponent: () => (
    <main className="site-container py-24">
      <h1 className="font-display text-3xl font-bold text-foreground">Job not found</h1>
      <p className="mt-3 text-muted-foreground">This job is closed or does not exist.</p>
      <Button asChild className="mt-6"><Link to="/jobs">Browse jobs</Link></Button>
    </main>
  ),
});

function money(s: JobSalary) {
  const f = (n: number) => new Intl.NumberFormat("en-IN").format(n);
  return `${s.currency} ${f(s.min)} - ${f(s.max)} per ${s.period}`;
}

function JobPage() {
  const { job, company } = Route.useLoaderData() as { job: ProfileJob; company: PublicProfile };
  const href = job.applyUrl ? (job.applyUrl.startsWith("mailto:") ? job.applyUrl : safeUrl(job.applyUrl)) : null;
  return (
    <main className="site-container py-10 sm:py-16">
      <p className="mb-6 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
        Preview demo. Made-up job, not shown on Google.
      </p>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="rounded-xl border border-border/60 bg-card p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary">Job</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">{job.title}</h1>
          <p className="mt-2 text-foreground/90">
            <Link to="/p/$slug" params={{ slug: company.slug }} className="underline underline-offset-2">{company.name}</Link>
            {" - "}
            {job.location}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Posted {job.posted}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[job.type, job.workplace].filter(Boolean).map((c) => (
              <li key={c} className="rounded-full border border-primary/40 px-3 py-1 text-xs text-foreground">{c}</li>
            ))}
          </ul>
          {job.salary ? (
            <p className="mt-4 text-sm"><span className="font-semibold text-foreground">Pay: </span><span className="text-muted-foreground">{money(job.salary)}</span></p>
          ) : null}
          <h2 className="mt-6 font-display text-sm font-bold uppercase tracking-widest text-primary">About the job</h2>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {(job.description || "").split("\n").map((l, i) => (l.trim() ? <p key={i}>{l}</p> : <div key={i} className="h-2" />))}
          </div>
          {job.skills?.length ? (
            <>
              <h2 className="mt-6 font-display text-sm font-bold uppercase tracking-widest text-primary">Skills</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((s) => <li key={s} className="rounded-full border border-border/60 px-3 py-1 text-xs text-foreground">{s}</li>)}
              </ul>
            </>
          ) : null}
        </article>
        <aside className="space-y-6">
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-6">
            <h2 className="font-display text-lg font-bold text-foreground">Apply</h2>
            <p className="mt-2 text-sm text-muted-foreground">You apply on the employer's own link. Nothing from your profile is sent unless you send it.</p>
            {href ? (
              <Button asChild className="mt-4 w-full">
                <a href={href} target="_blank" rel="noopener noreferrer nofollow">Apply now</a>
              </Button>
            ) : null}
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link to="/tailor">Tailor my resume to this job</Link>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">Opens the resume tailor. Paste this job's description there.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-primary">About {company.name}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{company.about}</p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to="/p/$slug" params={{ slug: company.slug }}>See company page</Link>
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}
