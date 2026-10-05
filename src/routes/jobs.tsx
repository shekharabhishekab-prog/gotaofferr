import { friendlyMessage } from "@/lib/friendly-error";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { RouteError } from "@/components/RouteError";
import { RouteNotFound } from "@/components/RouteNotFound";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Bell, Briefcase, Loader2, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSession } from "@/hooks/useSession";
import { useSubscription } from "@/hooks/useSubscription";
import { UsageUpsell } from "@/components/UsageUpsell";
import {
  getAlertDigest,
  getJobAlert,
  getAlertUsage,
  getJobSearchUsage,
  saveJobAlert,
  searchJobs,
} from "@/lib/jobs.functions";
import { getVisitorCountry } from "@/lib/geo.functions";
import { runQueued, queueMessage } from "@/lib/ai-queue";
import { DEFAULT_PRICING, detectPricing, pricingForCountry } from "@/lib/pricing-currency";
import {
  detectTimezone,
  formatHour,
  EXPERIENCE_OPTIONS,
  EXTRA_FILTER_OPTIONS,
  LOCATION_OPTIONS,
  ROLE_OPTIONS,
  salaryRangesFor,
  TIMEZONES,
  type JobListing,
} from "@/lib/jobs-schema";

export const Route = createFileRoute("/jobs")({
  validateSearch: (search: Record<string, unknown>) => ({
    alert: search['alert'] === "1" || search['alert'] === 1 || search['alert'] === true ? "1" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "AI Job Finder — Find & Apply Faster | GotaOfferr" },
      {
        name: "description",
        content:
          "Type a role, set your filters, and get one clean list of live job openings from across the web — plus an email of new matches every 3 days.",
      },
      { property: "og:title", content: "AI Job Finder — Find & Apply Faster | GotaOfferr" },
      {
        property: "og:description",
        content:
          "One search across job boards, your filters saved, and an email every 3 days with only the new matches.",
      },
      { property: "og:url", content: "https://gotaofferr.com/jobs" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/jobs" }],
  }),
  component: Jobs,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
});

const selectClass =
  "mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground";

function Jobs() {
  const { session } = useSession();
  const { tier, isSubscribed, loading: subLoading } = useSubscription();
  const runSearch = useServerFn(searchJobs);
  const loadSearchUsage = useServerFn(getJobSearchUsage);
  const loadAlert = useServerFn(getJobAlert);
  const loadAlertUsage = useServerFn(getAlertUsage);
  const [alertUsage, setAlertUsage] = useState<{ tier: "free" | "starter" | "job_hunt" | "career_pro"; limit: number; used: number } | null>(null);
  const refreshAlertUsage = () => { if (session) loadAlertUsage({}).then(setAlertUsage).catch(() => undefined); };
  useEffect(refreshAlertUsage, [session]); // eslint-disable-line react-hooks/exhaustive-deps
  const storeAlert = useServerFn(saveJobAlert);
  const loadDigest = useServerFn(getAlertDigest);
  const { alert: alertParam } = Route.useSearch();
  const navigate = useNavigate();



  

  // Salary bands follow the visitor's own market, not India's LPA brackets.
  const [currency, setCurrency] = useState(DEFAULT_PRICING.code);
  useEffect(() => {
    let live = true;
    void getVisitorCountry()
      .then((geo) => {
        if (!live) return;
        setCurrency((pricingForCountry(geo?.country) ?? detectPricing()).code);
      })
      .catch(() => {
        if (live) setCurrency(detectPricing().code);
      });
    return () => {
      live = false;
    };
  }, []);
  const salaryOptions = salaryRangesFor(currency);

  // One free trial search per account; Career pro gets a monthly allowance.
  const [searchUsage, setSearchUsage] = useState<{
    tier: "free" | "starter" | "job_hunt" | "career_pro";
    pro: boolean;
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);

  const refreshSearchUsage = useCallback(() => {
    if (!session) return;
    void loadSearchUsage({})
      .then((res) => setSearchUsage(res))
      .catch(() => undefined);
  }, [session, loadSearchUsage]);

  useEffect(() => {
    refreshSearchUsage();
  }, [refreshSearchUsage]);

  // The server usage call is authoritative about paid access — it already
  // knows every tier's search allowance and any comped grant.
  const usageLoaded = !session || searchUsage !== null;
  const isPro = searchUsage?.pro ?? (isSubscribed && tier === "career_pro");
  const trialAvailable = !isPro && !!searchUsage && !searchUsage.pro && searchUsage.remaining > 0;
  // Once the finder is open in this visit it stays open. Otherwise spending the
  // last free search would swap the results the user is reading for the
  // upgrade wall the moment the usage counter refreshes.
  const [finderUnlocked, setFinderUnlocked] = useState(false);
  useEffect(() => {
    if (isPro || trialAvailable) setFinderUnlocked(true);
  }, [isPro, trialAvailable]);
  const canUseFinder = isPro || trialAvailable || finderUnlocked;
  const outOfSearches = !isPro && !!searchUsage && searchUsage.remaining <= 0;




  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [experience, setExperience] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [extraTags, setExtraTags] = useState<string[]>([]);
  const extraFilters = extraTags.join(", ");

  function toggleTag(tag: string) {
    setExtraTags((tags) => (tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]));
  }

  const [jobs, setJobs] = useState<JobListing[] | null>(null);
  const [page, setPage] = useState(0);
  const [searching, setSearching] = useState(false);
  const [queueNote, setQueueNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const PAGE_SIZE = 7;
  const totalPages = jobs ? Math.max(1, Math.ceil(jobs.length / PAGE_SIZE)) : 1;
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * PAGE_SIZE;
  const pageJobs = jobs ? jobs.slice(pageStart, pageStart + PAGE_SIZE) : [];


  // Defaults ON: someone opening this card wants the email digest. A saved
  // alert overwrites this with its stored value below.
  const [alertOn, setAlertOn] = useState(true);
  const [alertHour, setAlertHour] = useState(9);
  const [timezone, setTimezone] = useState(detectTimezone());
  const [alertSaved, setAlertSaved] = useState<string | null>(null);
  const [savingAlert, setSavingAlert] = useState(false);

  const [digestOpen, setDigestOpen] = useState(false);
  const [digestLoading, setDigestLoading] = useState(false);
  const [digest, setDigest] = useState<{
    jobs: JobListing[];
    sentAt: string | null;
    criteria: { role: string; location: string | null; experience: string | null; salaryRange: string | null } | null;
  } | null>(null);

  useEffect(() => {
    if (!session) return;
    let live = true;
    loadAlert({})
      .then((res) => {
        if (!live || !res.alert) return;
        const a = res.alert;
        setRole((r) => r || a.role);
        setLocation((l) => l || (a.location ?? ""));
        setRemoteOnly(a.remote_only);
        setExperience((e) => e || (a.experience ?? ""));
        setSalaryRange((s) => s || (a.salary_range ?? ""));
        setExtraTags((tags) =>
          tags.length
            ? tags
            : (a.extra_filters ?? "")
                .split(",")
                .map((t: string) => t.trim())
                .filter((t: string) => EXTRA_FILTER_OPTIONS.includes(t as (typeof EXTRA_FILTER_OPTIONS)[number])),
        );
        setAlertOn(a.enabled);
        setAlertHour(a.local_hour);
        setTimezone(a.timezone);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [session, loadAlert]);

  // Opened from the alert email: show the exact jobs that were sent.
  useEffect(() => {
    if (alertParam !== "1" || !session) return;
    let live = true;
    setDigestOpen(true);
    setDigestLoading(true);
    loadDigest({})
      .then((res) => {
        if (!live) return;
        setDigest(res as typeof digest);
      })
      .catch(() => undefined)
      .finally(() => {
        if (live) setDigestLoading(false);
      });
    return () => {
      live = false;
    };
  }, [alertParam, session, loadDigest]);

  function closeDigest(open: boolean) {
    setDigestOpen(open);
    if (!open && alertParam === "1") {
      void navigate({ to: "/jobs", search: { alert: undefined }, replace: true });
    }
  }


  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (role.trim().length < 2) return;
    setSearching(true);
    setError(null);
    setJobs(null);
    setQueueNote(null);
    try {
      const res = await runQueued(
        () =>
          runSearch({
            data: {
              role: role.trim(),
              location: location.trim() || undefined,
              remoteOnly,
              experience: experience.trim() || undefined,
              salaryRange: salaryRange || undefined,
              extraFilters: extraFilters.trim() || undefined,
            },
          }),
        {
          onWait: (info) => setQueueNote(queueMessage(info)),
          onResolved: () => setQueueNote(null),
        },
      );

      if ("error" in res) setError(friendlyMessage(res.error));
      else { setJobs(res.jobs); setPage(0); }
      refreshSearchUsage();
    } catch (err) {
      setError(friendlyMessage(err, "Job search hit a wall 🧱 Please try again in a moment."));
    } finally {
      setSearching(false);
      setQueueNote(null);
    }
  }

  async function onSaveAlert() {
    if (role.trim().length < 2) {
      setAlertSaved("Add a role first.");
      return;
    }
    setSavingAlert(true);
    setAlertSaved(null);
    try {
      const res = await storeAlert({
        data: {
          role: role.trim(),
          location: location.trim() || undefined,
          remoteOnly,
          experience: experience.trim() || undefined,
          salaryRange: salaryRange || undefined,
          extraFilters: extraFilters.trim() || undefined,
          localHour: alertHour,
          timezone,
          enabled: alertOn,
        },
      });
      refreshAlertUsage();
      const firstSent = "firstEmailSent" in res && (res as { firstEmailSent?: boolean }).firstEmailSent;
      setAlertSaved(
        "error" in res && res.error
          ? res.error
          : alertOn
            ? `Job alert saved — ${
                firstSent ? "your first digest is on its way to your inbox now" : "we'll email you"
              } ${role.trim()} matches${
                location ? ` in ${location}` : ""
              }${firstSent ? `, then 2 more emails, 3 days apart, at ${formatHour(alertHour)} ${timezone}.` : ` every 3 days at ${formatHour(alertHour)} ${timezone}.`}`
            : "Saved, but alert emails are OFF — turn on \"Email me every 3 days\" and save again to start receiving them.",
      );

    } catch (err) {
      setAlertSaved(friendlyMessage(err, "Your alert slipped away 🐟 Please try saving it again."));
    } finally {
      setSavingAlert(false);
    }
  }

  const currentTier = searchUsage?.tier ?? tier;
  const nextPackName = !session
    ? "Career Pro Pack"
    : currentTier === "free"
      ? "Starter Pack"
      : currentTier === "starter"
        ? "Job Hunt Pack"
        : "Career Pro Pack";

  return (
    <main className="site-container py-14 sm:py-20">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <Sparkles className="size-4" /> {nextPackName}
      </div>
      <h1 className="mt-3 font-display text-4xl font-bold text-foreground">AI job finder</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Type the role you want and your filters once. We search across job boards and hand you one clean
        list — click any job to apply on the company's own page.
      </p>

      {!session ? (
        <div className="mt-10 rounded-2xl border border-border bg-card p-8">
          <p className="text-card-foreground">Sign in to use the job finder.</p>
          <Button asChild className="mt-4">
            <Link to="/auth" search={{ redirect: "/jobs" }}>Sign in</Link>
          </Button>
        </div>
      ) : !subLoading && usageLoaded && !canUseFinder ? (
        <div className="mt-10 rounded-2xl border border-primary/40 bg-card p-8">
          <h2 className="font-display text-xl font-semibold text-card-foreground">
            You have used your job searches for this month
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Your allowance resets next month. You can also move up a plan to keep searching now.
          </p>
          {searchUsage ? (
            <div className="mt-4">
              <UsageUpsell tier={searchUsage.tier} noun="searches" limit={searchUsage.limit} used={searchUsage.used} />
            </div>
          ) : null}
          <Button asChild className="mt-5">
            <Link to="/pricing">See plans</Link>
          </Button>
        </div>
      ) : (
        <>
          {searchUsage ? (
            <div className="mt-8">
              <UsageUpsell tier={searchUsage.tier} noun="searches" limit={searchUsage.limit} used={searchUsage.used} />
            </div>
          ) : null}

          <form onSubmit={onSearch} className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="role">Job role</Label>
                <Input
                  id="role"
                  list="role-suggestions"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Social Media Manager"
                  className="mt-2 h-11"
                  required
                />
                <datalist id="role-suggestions">
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Exact matches first, then closest similar roles.
                </p>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  list="location-suggestions"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Any location — type or pick"
                  className="mt-2 h-11"
                />
                <datalist id="location-suggestions">
                  {LOCATION_OPTIONS.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Type any city or country, or pick a suggestion.
                </p>
              </div>

              <div>
                <Label htmlFor="experience">Experience</Label>
                <select
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Any experience</option>
                  {EXPERIENCE_OPTIONS.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="salary">Salary range (per year)</Label>
                <select
                  id="salary"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Any salary</option>
                  {salaryOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Other filters</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EXTRA_FILTER_OPTIONS.map((tag) => {
                    const active = extraTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        aria-pressed={active}
                        className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/60"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>


            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-3 text-sm text-muted-foreground">
                <Switch checked={remoteOnly} onCheckedChange={setRemoteOnly} />
                Remote only
              </label>
              {outOfSearches ? (
                <Button asChild>
                  <Link to="/pricing">Upgrade for more searches</Link>
                </Button>
              ) : (
                <Button type="submit" disabled={searching}>
                  {searching ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Searching boards…
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 size-4" /> Find jobs
                    </>
                  )}
                </Button>
              )}

            </div>
          </form>

          <div className={`mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8 ${session ? "" : "hidden"}`}>
            <div className="flex items-center gap-2 text-card-foreground">
              <Bell className="size-4 text-primary" />
              <h2 className="font-display text-lg font-semibold">Job alert every 3 days</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              We reuse the filters above — role, location, salary, experience — run that search every
              3 days and email you the matching openings (4 to 8 each time) at your chosen time. Each alert sends 3 emails, then ends. Setting it again starts a new one.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {[
                role.trim() || "Add a role above",
                location || "Any location",
                experience || "Any experience",
                salaryRange || "Any salary",
                remoteOnly ? "Remote only" : "",
              ]
                .filter(Boolean)
                .map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground"
                  >
                    {chip}
                  </span>
                ))}
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-5">
              <label className="flex items-center gap-3 text-sm text-muted-foreground">
                <Switch checked={alertOn} onCheckedChange={setAlertOn} />
                Email me every 3 days
              </label>
              <div>
                <Label htmlFor="hour">Send time</Label>
                <select
                  id="hour"
                  value={alertHour}
                  onChange={(e) => setAlertHour(Number(e.target.value))}
                  className="mt-2 h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>
                      {formatHour(h)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="tz">Timezone</Label>
                <select
                  id="tz"
                  value={TIMEZONES.includes(timezone as (typeof TIMEZONES)[number]) ? timezone : "UTC"}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="mt-2 h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="outline" onClick={onSaveAlert} disabled={savingAlert}>
                {savingAlert ? "Saving…" : "Save alert"}
              </Button>
            </div>
            {alertUsage ? (
              <div className="mt-4">
                <UsageUpsell tier={alertUsage.tier} noun={alertUsage.limit === 1 ? "alert" : "alerts"} limit={alertUsage.limit} used={alertUsage.used} />
              </div>
            ) : null}
            {alertSaved ? <p className="mt-3 text-sm text-muted-foreground">{alertSaved}</p> : null}
          </div>

          {error ? (
            <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
              {error}
            </p>
          ) : null}

          {searching ? (
            <div className="mt-8 space-y-3">
              {queueNote ? (
                <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
                  {queueNote}
                </div>
              ) : null}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-muted/40" />
              ))}
            </div>
          ) : null}


          {jobs && jobs.length === 0 ? (
            <p className="mt-8 text-muted-foreground">
              No live listings matched those filters. Try a broader role or drop a filter.
            </p>
          ) : null}

          {jobs && jobs.length > 0 ? (
            <div className="mt-8 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {jobs.length} matches found
                  {totalPages > 1 ? ` · showing ${pageStart + 1}–${pageStart + pageJobs.length}` : ""}
                </p>
                {totalPages > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant={i === safePage ? "default" : "outline"}
                        onClick={() => setPage(i)}
                      >
                        List {i + 1}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>
              {pageJobs.map((job) => (

                <article
                  key={job.url}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/60"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-card-foreground">{job.title}</h3>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="size-3.5" />
                        {job.company} · {job.location} · {job.workMode}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {job.match === "related" ? (
                        <span className="rounded-full border border-primary/50 px-2.5 py-1 text-xs text-primary">
                          Similar role
                        </span>
                      ) : null}
                      <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                        {job.source}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">{job.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Experience: {job.experience}</span>
                    <span>Salary: {job.salary}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        Apply on {job.source} <ArrowUpRight className="ml-1 size-3.5" />
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/tailor">Tailor my resume for this</Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </>
      )}

      <Dialog open={digestOpen} onOpenChange={closeDigest}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="size-4 text-primary" /> Your job alert
            </DialogTitle>
            <DialogDescription>
              {digest?.criteria
                ? [
                    digest.criteria.role,
                    digest.criteria.location,
                    digest.criteria.experience,
                    digest.criteria.salaryRange,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "The openings from your latest alert email."}
            </DialogDescription>
          </DialogHeader>

          {digestLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-muted/40" />
              ))}
            </div>
          ) : digest && digest.jobs.length > 0 ? (
            <div className="space-y-3">
              {digest.jobs.map((job) => (
                <article key={job.url} className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-display text-base font-semibold text-card-foreground">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.company} · {job.location} · {job.workMode}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Experience: {job.experience}</span>
                    <span>Salary: {job.salary}</span>
                    <span>via {job.source}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        Apply <ArrowUpRight className="ml-1 size-3.5" />
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/tailor">Tailor my resume</Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No alert results yet — save a job alert below and we'll email your first batch.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {!session && (
        <section className="mt-16 max-w-3xl space-y-4 text-muted-foreground">
          <h2 className="font-display text-2xl font-bold text-foreground">
            How the AI job finder works
          </h2>
          <p>
            Enter the role you want, a city or country, and optional filters such as remote only,
            experience level and salary. The job finder searches major job boards and company career
            pages and returns one clean list of open roles. Jobs in the place you typed come first,
            nearby areas can follow, and far-away regions are left out.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Exact role matches are listed before related roles.</li>
            <li>Closed and expired postings are filtered out where we can detect them.</li>
            <li>Every listing links to the original posting, so you apply on the company's own page.</li>
            <li>One click tailors your resume and cover letter to the job you picked.</li>
          </ul>
          <p>
            Every plan includes job alerts: each alert emails you new matches 3 times, every 3 days. New to
            GotaOfferr? Read{" "}
            <a className="underline" href="/how-it-works">
              how it works
            </a>
            , try the{" "}
            <a className="underline" href="/resume-builder">
              resume builder
            </a>{" "}
            or see the{" "}
            <a className="underline" href="/faq">
              FAQ
            </a>
            .
          </p>
        </section>
      )}
    </main>
  );

}

