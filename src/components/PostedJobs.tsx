import { Link } from "@tanstack/react-router";

import { DEMO_PROFILES } from "@/lib/profile-types";

/** Jobs posted by companies on GotaOfferr. Preview: shows made-up demo jobs only. */
export function PostedJobs() {
  const rows = Object.values(DEMO_PROFILES).flatMap((c) => c.jobs.map((j) => ({ job: j, company: c })));
  if (!rows.length) return null;
  return (
    <section aria-label="Posted on GotaOfferr" className="mx-auto mt-8 w-full max-w-3xl rounded-2xl border border-border/60 bg-card p-5 text-left sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-foreground">Posted on GotaOfferr</h2>
        <span className="text-xs text-muted-foreground">Preview demo jobs. Made-up.</span>
      </div>
      <ul className="mt-3 divide-y divide-border/60">
        {rows.map(({ job, company }) => (
          <li key={job.id}>
            <Link to="/j/$id" params={{ id: job.id }} className="flex items-center justify-between gap-3 py-3 hover:text-primary">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">{job.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {company.name} - {job.location} - {job.type} - {job.posted}
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-primary">View</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
