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
import { checkIsAdmin, getAdminDashboard, sendApprovedOpsTest } from "@/lib/admin.functions";

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

function fmt(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function csvCell(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function AdminPage() {
  const { user, loading: sessionLoading } = useSession();
  const isAdminFn = useServerFn(checkIsAdmin);
  const dashboardFn = useServerFn(getAdminDashboard);

  const adminQuery = useQuery({
    queryKey: ["admin-check", user?.id],
    queryFn: () => isAdminFn({}),
    enabled: Boolean(user),
  });

  const sendOpsTest = useServerFn(sendApprovedOpsTest);
  const [opsTestStatus, setOpsTestStatus] = useState("");
  const [opsTestBusy, setOpsTestBusy] = useState(false);
  const opsTestPreview = typeof window !== "undefined" && window.location.hostname === "phase18-preview-gotaofferr-copy.shekhar-abhishekab.workers.dev";
  async function runOpsTest() {
    setOpsTestBusy(true);
    try {
      const result = await sendOpsTest({});
      setOpsTestStatus(result.accepted ? `Sender accepted TEST${result.id ? ` (${result.id})` : ""}. Check Gmail for delivery.` : "Sender rejected TEST. Delivery not proven.");
    } catch (error) {
      setOpsTestStatus(error instanceof Error ? error.message : "Test could not be sent.");
    } finally { setOpsTestBusy(false); }
  }
  const isAdmin = adminQuery.data?.isAdmin === true;

  const dataQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => dashboardFn({}),
    enabled: isAdmin && adminQuery.data?.mfaVerified === true,
  });

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

  const d = dataQuery.data;

  return (
    <AdminMfaGate>
      <div className="container mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Admin dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Live view of users, subscriptions and product usage.
        </p>
      </header>

      {opsTestPreview && (
        <section className="mb-6 rounded-xl border border-border p-4">
          <h2 className="font-semibold">TEST alert delivery</h2>
          <p className="text-sm text-muted-foreground">One TEST email to shekhar.abhishekab@gmail.com. Not a real incident.</p>
          <Button className="mt-3" onClick={runOpsTest} disabled={opsTestBusy || Boolean(opsTestStatus)}>{opsTestBusy ? "Sending TEST..." : "Send approved TEST email"}</Button>
          {opsTestStatus && <p role="status" className="mt-2 text-sm">{opsTestStatus}</p>}
        </section>
      )}
      {dataQuery.isLoading || !d ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Users" value={d.totals.users} icon={<Users className="h-4 w-4" />} />
            <Stat
              label="Active subscriptions"
              value={d.totals.activeSubs}
              icon={<CreditCard className="h-4 w-4" />}
            />
            <Stat
              label="Rewrites this month"
              value={d.totals.runsThisMonth}
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <Stat
              label="Active job alerts"
              value={d.totals.activeAlerts}
              icon={<BarChart3 className="h-4 w-4" />}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(d.planBreakdown).map(([plan, count]) => (
              <Badge key={plan} variant="secondary">
                {plan}: {count}
              </Badge>
            ))}
          </div>

          <Tabs defaultValue="users" className="mt-10">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="subs">Subscriptions</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  All {d.users.length} accounts (free and paid).
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadCsv(
                      `gotaofferr-all-users-${stamp()}.csv`,
                      [
                        "user_id",
                        "email",
                        "name",
                        "plan",
                        "plan_status",
                        "plan_end",
                        "rewrites_total",
                        "job_alerts",
                        "joined",
                        "last_sign_in",
                      ],
                      d.users.map((u) => [
                        u.id,
                        u.email,
                        u.fullName,
                        u.plan ?? "Free",
                        u.planStatus,
                        u.planEnd,
                        u.runsTotal,
                        u.alerts,
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
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Rewrites</TableHead>
                      <TableHead className="text-right">Alerts</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last sign-in</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.email ?? "—"}</TableCell>
                        <TableCell>{u.fullName ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={u.plan && u.plan !== "Free" ? "default" : "secondary"}>
                            {u.plan ?? "Free"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{u.runsTotal}</TableCell>
                        <TableCell className="text-right">{u.alerts}</TableCell>
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
                  Paying subscribers only ({d.subscriptions.length}).
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadCsv(
                      `gotaofferr-paid-subscribers-${stamp()}.csv`,
                      [
                        "user_id",
                        "email",
                        "plan",
                        "price_id",
                        "status",
                        "cancel_at_period_end",
                        "environment",
                        "current_period_end",
                        "started",
                      ],
                      d.subscriptions.map((s) => [
                        s.userId,
                        s.email,
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
                  disabled={d.subscriptions.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Renews / ends</TableHead>
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.subscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No subscriptions yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      d.subscriptions.map((s, i) => (
                        <TableRow key={`${s.userId}-${i}`}>
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
