/** Spreadsheet formula-injection-safe CSV for owner-only admin downloads. */
function csvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
function buildAdminCsv(headers: string[], rows: unknown[][]): string {
  return "\ufeff" + [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3, CreditCard, Download, Loader2, ShieldAlert, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminMfaGate } from "@/components/AdminMfaGate";
import { RouteError } from "@/components/RouteError";
import { RouteNotFound } from "@/components/RouteNotFound";
import { useSession } from "@/hooks/useSession";
import { checkIsAdmin, getAdminDashboard, getMarketingEmails, getMonthCards } from "@/lib/admin.functions";
import { REGIONS } from "@/lib/region";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — GotaOfferr" },
      {
        name: "description",
        content: "Internal GotaOfferr admin dashboard for users, subscriptions and usage.",
      },
      { property: "og:title", content: "Admin dashboard — GotaOfferr" },
      {
        property: "og:description",
        content: "Internal GotaOfferr admin dashboard for users, subscriptions and usage.",
      },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
});

function monthLabel(ym: string) {
  return new Date(`${ym}-01T00:00:00Z`).toLocaleString("en-US", { month: "long", timeZone: "UTC" });
}

function fmt(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const url = URL.createObjectURL(new Blob([buildAdminCsv(headers, rows)], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

function Stat({ label, value, monthly, icon }: { label: string; value: string | number; monthly?: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {monthly !== undefined && <p className="mt-2 text-sm text-muted-foreground">This month: {monthly}</p>}
    </div>
  );
}

function AdminPage() {
  const { user, loading: sessionLoading } = useSession();
  const [region, setRegion] = useState<string>("All");
  const [month, setMonth] = useState<string>("");
  const monthFn = useServerFn(getMonthCards);
  const isAdminFn = useServerFn(checkIsAdmin);
  const dashboardFn = useServerFn(getAdminDashboard);
  const marketingFn = useServerFn(getMarketingEmails);
  const [exportingMarketing, setExportingMarketing] = useState(false);

  const adminQuery = useQuery({
    queryKey: ["admin-check", user?.id],
    queryFn: () => isAdminFn({}),
    enabled: Boolean(user),
  });

  const isAdmin = adminQuery.data?.isAdmin === true;

  const dataQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => dashboardFn({}),
    enabled: isAdmin && adminQuery.data?.mfaVerified === true,
    // Near-live: users and subscriptions lists refresh every 5 seconds while the tab is visible.
    refetchInterval: 5_000,
  });

  const cardsQuery = useQuery({
    queryKey: ["admin-month-cards", month],
    queryFn: () => monthFn({ data: { month: month || undefined } }),
    enabled: isAdmin && adminQuery.data?.mfaVerified === true,
    // Near-live: the running month refreshes every 5 seconds; other months do not need it.
    refetchInterval: month === "" || month === new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 7) ? 5_000 : false,
  });
  const cards = cardsQuery.data;

  if (sessionLoading || (user && adminQuery.isLoading)) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <ShieldAlert className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Restricted area</h1>
        <p className="text-muted-foreground">
          This dashboard is only available to GotaOfferr administrators.
        </p>
        <Button asChild>
          <Link to={user ? "/account" : "/auth"}>{user ? "Back to account" : "Sign in"}</Link>
        </Button>
      </div>
    );
  }

  if (dataQuery.isError) {
    return <AdminMfaGate><main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <p role="alert" className="mt-4">Could not load complete dashboard data. No partial numbers are shown.</p>
      <Button className="mt-4" onClick={() => dataQuery.refetch()}>Try again</Button>
    </main></AdminMfaGate>;
  }

  const d = dataQuery.data;
  const shownUsers = (d?.users ?? []).filter((u) => region === "All" || u.region === region);
  const shownSubs = (d?.subscriptions ?? []).filter((x) => region === "All" || x.region === region);
  const regionCounts = Object.fromEntries(["All", ...REGIONS].map((r) => [r, r === "All" ? (d?.users.length ?? 0) : (d?.users ?? []).filter((u) => u.region === r).length]));

  return (
    <AdminMfaGate>
      <div className="mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Admin dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Live view of users, subscriptions and product usage.
        </p>
      </header>

      {dataQuery.isLoading || !d ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label htmlFor="month-select" className="text-sm font-medium">Month</label>
            <select
              id="month-select"
              value={cards?.month ?? ""}
              onChange={(e) => setMonth(e.target.value === cards?.current ? "" : e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {(cards?.months ?? []).map((m) => (
                <option key={m} value={m}>{monthLabel(m)}</option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">Year {cards?.month?.slice(0, 4) ?? ""}</span>
          </div>
          {cards?.record ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Total users" value={cards.record.cards.users} icon={<Users className="h-4 w-4" />} />
              <Stat label="Total tailored resumes" value={cards.record.cards.rewrites} icon={<BarChart3 className="h-4 w-4" />} />
              <Stat label="Total resume builder uses" value={cards.record.cards.builderDownloads} icon={<BarChart3 className="h-4 w-4" />} />
              <Stat label="Total ATS score checks (logged-in only, guests not counted)" value={cards.record.cards.atsChecks ?? 0} icon={<BarChart3 className="h-4 w-4" />} />
              <Stat label="Total job searches" value={cards.record.cards.searches} icon={<BarChart3 className="h-4 w-4" />} />
              <Stat label="Total AI interviews" value={cards.record.cards.aiInterviews ?? 0} icon={<BarChart3 className="h-4 w-4" />} />
              <Stat label="Total job alerts" value={cards.record.cards.alerts} icon={<BarChart3 className="h-4 w-4" />} />
              <Stat label="Total active subscriptions" value={cards.record.cards.activeSubscriptions ?? 0} icon={<CreditCard className="h-4 w-4" />} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{cardsQuery.isLoading ? "Loading month numbers..." : "No saved numbers for this month."}</p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">Each number counts only the chosen month (India time). The current month grows live and starts again from 0 on the 1st. A finished month is locked at about 22:30 IST on its last day. Counts are recorded activity; builder counts are download attempts. Test and owner accounts (6) are left out of every number. Active subscriptions include plans cancelled but still paid up to the period end.</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(d.planBreakdown).map(([plan, count]) => (
              <Badge key={plan} variant="secondary">
                {plan}: {count}
              </Badge>
            ))}
          </div>

          <div className="mt-8" role="group" aria-label="Region filter">
            <p className="mb-2 text-sm font-medium">Region (users and subscriptions below)</p>
            <label className="sr-only" htmlFor="region-select">Region</label>
            <select
              id="region-select"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm"
            >
              {["All", ...REGIONS].map((r) => (
                <option key={r} value={r}>
                  {r} ({regionCounts[r]})
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted-foreground">Region comes from the connection country at first sign-in, so someone on a VPN may show a different region than where they really are. Accounts made before this was tracked count as India.</p>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">
              Marketing emails: people who left an email on the free try without signing up.
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={exportingMarketing}
              onClick={async () => {
                setExportingMarketing(true);
                try {
                  const res = await marketingFn({});
                  downloadCsv(
                    `terbey-marketing-emails-${stamp()}.csv`,
                    ["email", "source", "captured_at"],
                    res.rows.map((r) => [r.email, r.source, r.createdAt]),
                  );
                } catch {
                  toast.error("Could not export marketing emails. Please try again.");
                } finally {
                  setExportingMarketing(false);
                }
              }}
            >
              {exportingMarketing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Marketing emails CSV
            </Button>
          </div>
          <Tabs defaultValue="users" className="mt-10">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="subs">Subscriptions</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  All {shownUsers.length} accounts (free and paid).
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadCsv(
                      `terbey-all-users-${stamp()}.csv`,
                      [
                        "user_id",
                        "email",
                        "cancel_at_period_end",
                        "name",
                        "plan",
                        "plan_status",
                        "plan_end",
                        "rewrites_this_month_ist",
                        "alert_records_this_month_ist",
                        "job_searches_this_month_ist",
                        "joined",
                        "last_sign_in",
                      ],
                      shownUsers.map((u) => [
                        u.id,
                        u.email,
                        u.cancelAtPeriodEnd,
                        u.fullName,
                        u.plan ?? "Free",
                        u.planStatus,
                        u.planEnd,
                        u.runsThisMonth,
                        u.alertsThisMonth,
                        u.searchesThisMonth,
                        u.createdAt,
                        u.lastSignInAt,
                      ]),
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">If needed, scroll the table sideways to see every column.</p>
              <div role="region" aria-label="Scrollable account table" tabIndex={0} className="w-full overflow-x-auto rounded-xl border border-border [&>div]:overflow-visible" style={{ scrollbarWidth: "auto" }}>
                <Table className="[&_th]:whitespace-nowrap [&_td]:whitespace-nowrap" style={{ minWidth: "1100px" }}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan / status</TableHead>
                      <TableHead className="text-right">Rewrites this month</TableHead>
                      <TableHead className="text-right">Alert records this month</TableHead>
                      <TableHead className="text-right">Searches this month</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last sign-in</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shownUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.fullName ?? "—"}</TableCell>
                        <TableCell className="font-medium">{u.email ?? "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {u.plan ?? "Free"} · {u.planStatus ?? "Free"}{u.cancelAtPeriodEnd ? " · cancels at period end" : ""}
                        </TableCell>
                        <TableCell className="text-right">{u.runsThisMonth}</TableCell>
                        <TableCell className="text-right">{u.alertsThisMonth}</TableCell>
                        <TableCell className="text-right">{u.searchesThisMonth}</TableCell>
                        <TableCell>{fmt(u.createdAt)}</TableCell>
                        <TableCell>{fmt(u.lastSignInAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="subs" className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Subscription records ({shownSubs.length}).
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadCsv(
                      `terbey-paid-subscribers-${stamp()}.csv`,
                      [
                        "user_id",
                        "email",
                        "name",
                        "plan",
                        "price_id",
                        "status",
                        "cancel_at_period_end",
                        "environment",
                        "current_period_end",
                        "started",
                      ],
                      shownSubs.map((s) => [
                        s.userId,
                        s.email,
                        s.fullName,
                        s.plan,
                        s.priceId,
                        s.status,
                        s.cancelAtPeriodEnd,
                        s.environment,
                        s.currentPeriodEnd,
                        s.createdAt,
                      ]),
                    )
                  }
                  disabled={shownSubs.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">If needed, scroll the table sideways to see every column.</p>
              <div role="region" aria-label="Scrollable account table" tabIndex={0} className="w-full overflow-x-auto rounded-xl border border-border [&>div]:overflow-visible" style={{ scrollbarWidth: "auto" }}>
                <Table className="[&_th]:whitespace-nowrap [&_td]:whitespace-nowrap" style={{ minWidth: "1100px" }}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Renews / ends</TableHead>
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shownSubs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No subscriptions yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      shownSubs.map((s, i) => (
                        <TableRow key={`${s.userId}-${i}`}>
                          <TableCell>{s.fullName ?? "-"}</TableCell>
                          <TableCell className="font-medium">{s.email ?? s.userId}</TableCell>
                          <TableCell>{s.plan}</TableCell>
                          <TableCell>
                            <Badge variant={s.status === "active" ? "default" : "secondary"}>
                              {s.status}
                              {s.cancelAtPeriodEnd ? " (cancelling)" : ""}
                            </Badge>
                          </TableCell>
                          <TableCell>{s.environment === "live" ? "Live" : "Test"}</TableCell>
                          <TableCell>{fmt(s.currentPeriodEnd)}</TableCell>
                          <TableCell>{fmt(s.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
      </div>
    </AdminMfaGate>
  );
}

