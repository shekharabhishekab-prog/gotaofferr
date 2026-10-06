import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Download,
  KeyRound,
  LifeBuoy,
  Loader2,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Palette,
  Sun,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";

import { CancelSubscriptionDialog } from "@/components/CancelSubscriptionDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RouteError } from "@/components/RouteError";
import { SavedBuilderResumes } from "@/components/SavedBuilderResumes";
import { RouteNotFound } from "@/components/RouteNotFound";
import { PasswordInput } from "@/components/PasswordInput";
import { useSession } from "@/hooks/useSession";
import { useSubscription } from "@/hooks/useSubscription";
import { useTheme, type ThemePreference } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { passwordProblem } from "@/lib/password";
import {
  changePassword,
  deleteMyAccount,
  exportMyData,
  getAccountOverview,
  getTailorRunResult,
  updateProfile,
} from "@/lib/account.functions";
import { checkIsAdmin } from "@/lib/admin.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { FREE_MONTHLY_LIMIT, STARTER_MONTHLY_LIMIT, JOB_HUNT_MONTHLY_LIMIT, CAREER_PRO_MONTHLY_LIMIT } from "@/lib/tailor-schema";



export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account — GotaOfferr" },
      {
        name: "description",
        content:
          "Manage your GotaOfferr account: track your plan and usage, update your profile, switch theme and get support.",
      },
      { property: "og:title", content: "Your account — GotaOfferr" },
      {
        property: "og:description",
        content:
          "Manage your GotaOfferr plan, usage, profile, appearance and support options in one place.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/account" }],
  }),
  component: Account,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
});

type Overview = {
  fullName: string | null;
  memberSince: string | null;
  runsThisMonth: number;
  runsTotal: number;
  recentRuns: Array<{
    id: string;
    company: string | null;
    role: string | null;
    match_score: number | null;
    created_at: string;
    hasResult: boolean;
  }>;
};

function fmtDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Account() {
  const { session, user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    isSubscribed,
    tier,
    planName,
    status,
    paymentFailing,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    loading: subLoading,
    refresh: refreshSubscription,
  } = useSubscription();


  const { theme, setTheme } = useTheme();

  const loadOverview = useServerFn(getAccountOverview);
  const saveProfile = useServerFn(updateProfile);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const loadRunResult = useServerFn(getTailorRunResult);
  const runExport = useServerFn(exportMyData);
  const runDeleteAccount = useServerFn(deleteMyAccount);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const runChangePassword = useServerFn(changePassword);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  // Password settings are hidden behind the Profile toggle, then walked step by step.
  const [pwOpen, setPwOpen] = useState(false);
  const [pwStep, setPwStep] = useState<"current" | "new">("current");
  const [verifyingCurrent, setVerifyingCurrent] = useState(false);

  /** Step 1: confirm the current password before showing the new-password fields. */
  async function onVerifyCurrentPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) return;
    if (!currentPassword) return toast.error("Enter your current password.");
    setVerifyingCurrent(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    setVerifyingCurrent(false);
    if (error) return toast.error("That password isn't right. Try again or use a code instead.");
    setPwStep("new");
  }


  // Inline "I forgot my current password" flow: email OTP -> verify -> set new password.
  const [otpStage, setOtpStage] = useState<"idle" | "sent" | "verified">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpNewPassword, setOtpNewPassword] = useState("");
  const [otpConfirmPassword, setOtpConfirmPassword] = useState("");
  const [savingOtpPassword, setSavingOtpPassword] = useState(false);

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    const problem = passwordProblem(newPassword);
    if (problem) return toast.error(problem);
    if (newPassword !== confirmPassword) return toast.error("Both new passwords must match.");

    setChangingPassword(true);
    try {
      await runChangePassword({ data: { currentPassword, newPassword } });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your password.");
    } finally {
      setChangingPassword(false);
    }
  }

  /** Step 1: email a one-time code (same recovery email as the sign-in page). */
  async function onSendOtp() {
    if (!user?.email) return toast.error("This account has no email address on file.");
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSendingReset(false);
    if (error) return toast.error("Could not send the code. Please try again in a minute.");
    setOtpStage("sent");
    setOtpCode("");
    toast.success(`Code sent to ${user.email}.`);
  }

  /** Step 2: verify the code, which re-authenticates this session. */
  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) return;
    const code = otpCode.replace(/\D/g, "");
    if (code.length < 4) return toast.error("Enter the code from your email.");

    setVerifyingOtp(true);
    const { error } = await supabase.auth.verifyOtp({
      email: user.email,
      token: code,
      type: "recovery",
    });
    setVerifyingOtp(false);
    if (error) return toast.error("That code is invalid or expired. Send a new one.");
    setOtpStage("verified");
    toast.success("Code verified — choose a new password.");
  }

  /** Step 3: set the new password on the re-authenticated session. */
  async function onSetPasswordAfterOtp(e: React.FormEvent) {
    e.preventDefault();
    const problem = passwordProblem(otpNewPassword);
    if (problem) return toast.error(problem);
    if (otpNewPassword !== otpConfirmPassword)
      return toast.error("Both new passwords must match.");
    setSavingOtpPassword(true);
    const { error } = await supabase.auth.updateUser({ password: otpNewPassword });
    setSavingOtpPassword(false);
    if (error) return toast.error(error.message || "Could not update your password.");
    setOtpNewPassword("");
    setOtpConfirmPassword("");
    setOtpCode("");
    setOtpStage("idle");
    toast.success("Password updated.");
  }




  /** Right to Information: downloads everything we store about this account as JSON. */
  async function onExportData() {
    setExporting(true);
    try {
      const payload = await runExport(undefined as never);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gotaofferr-my-data.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Your data export has been downloaded.");
    } catch {
      toast.error("Could not build your export right now. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  /** Right to Erasure: deletes all stored data and the login itself. */
  async function onDeleteAccount() {
    if (
      !window.confirm(
        "Delete your account permanently? This erases your profile, saved rewrites, job alerts and billing records. This cannot be undone.",
      )
    )
      return;
    setDeleting(true);
    try {
      await runDeleteAccount(undefined as never);
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      toast.success("Your account and data have been deleted.");
      navigate({ to: "/", replace: true });
    } catch {
      toast.error("Could not delete your account. Email contact@gotaofferr.com and we'll do it.");
    } finally {
      setDeleting(false);
    }
  }


  /** Rebuilds a previously tailored resume / cover letter PDF on demand. */
  async function downloadRun(id: string, kind: "resume" | "cover") {
    setDownloading(`${id}-${kind === "resume" ? "resume" : "cover"}`);
    try {
      const { buildCoverLetterPdf, buildResumePdf, slug } = await import("@/lib/resume-pdf");
      const run = (await loadRunResult({ data: { id } })) as {
        company: string | null;
        role: string | null;
        result: any;
      };
      const doc =
        kind === "resume"
          ? await buildResumePdf(run.result)
          : await buildCoverLetterPdf(run.result, run.company ?? undefined, run.role ?? undefined);
      const base = `${slug(run.result?.name || "resume")}-${slug(run.company || run.role || "tailored")}`;
      doc.save(`${base}-${kind === "resume" ? "resume" : "cover-letter"}.pdf`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not build the PDF");
    } finally {
      setDownloading(null);
    }
  }

  const loadIsAdmin = useServerFn(checkIsAdmin);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    loadOverview()
      .then((data) => {
        if (!alive) return;
        setOverview(data as Overview);
        setName((data as Overview).fullName ?? "");
      })
      .catch(() => undefined);
    loadIsAdmin()
      .then((res) => {
        if (alive) setIsAdmin(Boolean(res?.isAdmin));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [session, loadOverview, loadIsAdmin]);


  async function onSaveProfile() {
    setSaving(true);
    try {
      await saveProfile({ data: { fullName: name } });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }

  /** Invalidates every refresh token for this user, on all devices. */
  async function signOutEverywhere() {
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) return toast.error("Could not sign out everywhere. Please try again.");
    toast.success("Signed out on all devices.");
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }


  if (sessionLoading) {
    return (
      <main className="site-container py-16">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-6 h-64 w-full" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="site-container flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">Your account</h1>
        <p className="max-w-md text-muted-foreground">
          Sign in to track your plan, usage history and preferences.
        </p>
        <Button asChild size="lg">
          <Link to="/auth" search={{ redirect: "/account" }}>
            Sign in
          </Link>
        </Button>
      </main>
    );
  }

  const monthlyLimit = isSubscribed
    ? tier === "career_pro"
      ? CAREER_PRO_MONTHLY_LIMIT
      : tier === "starter"
        ? STARTER_MONTHLY_LIMIT
        : JOB_HUNT_MONTHLY_LIMIT
    : FREE_MONTHLY_LIMIT;
  const remaining = Math.max(0, monthlyLimit - (overview?.runsThisMonth ?? 0));
  const planLabel = isSubscribed ? planName : "Free";


  return (
    <main className="site-container max-w-5xl py-12 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
            <User className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {overview?.fullName || user?.email?.split("@")[0] || "Your account"}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Button variant="outline" asChild>
              <Link to="/admin">Admin</Link>
            </Button>
          ) : null}
          <Button variant="outline" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-10">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Current plan", value: planLabel },
              {
                label: "Rewrites this month",
                value:
                  `${overview?.runsThisMonth ?? 0} / ${monthlyLimit}`,
              },

              { label: "Resumes tailored (all time)", value: `${overview?.runsTotal ?? 0}` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-card-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-card-foreground">
                Recent rewrites
              </h2>
            </div>

            {overview === null ? (
              <Skeleton className="mt-4 h-24 w-full" />
            ) : overview.recentRuns.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No rewrites yet.{" "}
                <Link to="/tailor" className="underline underline-offset-2">
                  Tailor your first resume
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border/60">
                {overview.recentRuns.map((run) => (
                  <li key={run.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {run.role || "Untitled role"}
                        {run.company ? ` · ${run.company}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">{fmtDate(run.created_at)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {run.match_score !== null ? (
                        <span className="rounded-full border border-primary/40 px-3 py-1 text-xs font-bold text-primary">
                          {run.match_score}% match
                        </span>
                      ) : null}
                      {run.hasResult ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={downloading === `${run.id}-resume`}
                            onClick={() => downloadRun(run.id, "resume")}
                          >
                            {downloading === `${run.id}-resume` ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Download className="size-4" />
                            )}
                            Resume
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={downloading === `${run.id}-cover`}
                            onClick={() => downloadRun(run.id, "cover")}
                          >
                            {downloading === `${run.id}-cover` ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Download className="size-4" />
                            )}
                            Cover letter
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not saved</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <SavedBuilderResumes />
        </TabsContent>

        <TabsContent value="subscription" className="mt-8 space-y-6">
          {paymentFailing ? (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
              <p className="text-sm font-semibold text-foreground">
                We couldn't take your last payment
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your plan stays active while we retry. Razorpay emails you a secure link to
                retry the payment — use it before {fmtDate(currentPeriodEnd)} to keep access.
              </p>
            </div>
          ) : null}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-card-foreground">
                  {planLabel}
                </h2>
              </div>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                {subLoading ? "Checking…" : isSubscribed ? (status ?? "active") : "Free plan"}
              </span>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Renews / ends</dt>
                <dd className="mt-1 text-sm text-card-foreground">{fmtDate(currentPeriodEnd)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Monthly allowance
                </dt>
                <dd className="mt-1 text-sm text-card-foreground">
                  {`${remaining} of ${monthlyLimit} left this month`}
                </dd>
              </div>


              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Member since</dt>
                <dd className="mt-1 text-sm text-card-foreground">{fmtDate(overview?.memberSince ?? null)}</dd>
              </div>
            </dl>

            {isSubscribed ? (
              <div className="mt-6 rounded-xl border border-border/70 bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      Auto-renewal {cancelAtPeriodEnd ? "off" : "on"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cancelAtPeriodEnd
                        ? `Your plan ends on ${fmtDate(currentPeriodEnd)} and won't be charged again.`
                        : `Renews automatically on ${fmtDate(currentPeriodEnd)}. Cancel any time — access continues to the end of the paid period.`}
                    </p>
                  </div>
                  {cancelAtPeriodEnd ? (
                    <Button size="sm" asChild>
                      <Link to="/pricing">Start a plan again</Link>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setCancelOpen(true)}>
                      Cancel subscription
                    </Button>
                  )}
                </div>
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-3">
              {isSubscribed ? (
                <Button asChild>
                  <Link to="/pricing">Change plan</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/pricing">Upgrade plan</Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/pricing">Compare plans</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Billing opens in a new tab, where you can change payment method or download invoices.
            </p>
          </div>

          <CancelSubscriptionDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            accessUntil={fmtDate(currentPeriodEnd)}
            onCancelled={() => {
              void refreshSubscription();
            }}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-card-foreground">Profile</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email ?? ""} disabled />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Button onClick={onSaveProfile} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Save changes
              </Button>
              <button
                type="button"
                onClick={() => {
                  setPwOpen((v) => !v);
                  setPwStep("current");
                  setOtpStage("idle");
                }}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {pwOpen ? "Hide password settings" : "Forgot / change password"}
              </button>
            </div>
          </div>




          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <LogOut className="size-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-card-foreground">
                Active sessions
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed in on a shared or lost device? This signs you out of every device, everywhere.
            </p>
            <Button variant="outline" className="mt-4" onClick={signOutEverywhere}>
              Sign out everywhere
            </Button>
          </div>


          <Dialog
            open={pwOpen}
            onOpenChange={(o) => {
              setPwOpen(o);
              if (!o) {
                setPwStep("current");
                setOtpStage("idle");
              }
            }}
          >
            <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto rounded-2xl p-5 sm:p-6">
              <DialogHeader className="text-left">
                <DialogTitle className="flex items-center gap-2 font-display text-lg">
                  <KeyRound className="size-5 shrink-0 text-primary" />
                  Password
                </DialogTitle>
                <DialogDescription>
                  {otpStage === "sent"
                    ? "Enter the code we emailed you."
                    : otpStage === "verified" || pwStep === "new"
                      ? "Choose your new password."
                      : "Confirm it's you, then set a new password."}
                </DialogDescription>
              </DialogHeader>

              {/* Step 1 — confirm it's you with the current password. */}
              {otpStage === "idle" && pwStep === "current" ? (
                <form className="space-y-4" onSubmit={onVerifyCurrentPassword}>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <PasswordInput
                      id="current-password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={verifyingCurrent}>
                    {verifyingCurrent ? <Loader2 className="size-4 animate-spin" /> : null}
                    Continue
                  </Button>
                  <button
                    type="button"
                    onClick={onSendOtp}
                    disabled={sendingReset}
                    className="block w-full text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    {sendingReset
                      ? "Sending code…"
                      : "Don't know it? Try another way — email me a code"}
                  </button>
                </form>
              ) : null}

              {/* Step 2 — choose the new password (current password already confirmed). */}
              {otpStage === "idle" && pwStep === "new" ? (
                <form className="space-y-4" onSubmit={onChangePassword}>
                  <div className="space-y-2">
                    <Label htmlFor="account-new-password">New password</Label>
                    <PasswordInput
                      id="account-new-password"
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-confirm-password">Confirm new password</Label>
                    <PasswordInput
                      id="account-confirm-password"
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    At least 8 characters with an uppercase letter, a lowercase letter, a number and
                    a special character.
                  </p>
                  <Button type="submit" className="w-full" disabled={changingPassword}>
                    {changingPassword ? <Loader2 className="size-4 animate-spin" /> : null}
                    Update password
                  </Button>
                  <button
                    type="button"
                    onClick={() => setPwStep("current")}
                    className="block w-full text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Back
                  </button>
                </form>
              ) : null}

              {otpStage === "sent" ? (
                <form onSubmit={onVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-otp">Enter the code we emailed you</Label>
                    <Input
                      id="reset-otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={10}
                      placeholder="Paste your code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="tracking-[0.3em]"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={verifyingOtp}>
                    {verifyingOtp ? <Loader2 className="size-4 animate-spin" /> : null}
                    Verify code
                  </Button>
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={onSendOtp}
                      disabled={sendingReset}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      Resend code
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpStage("idle")}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      Use my current password instead
                    </button>
                  </div>
                </form>
              ) : null}

              {otpStage === "verified" ? (
                <form onSubmit={onSetPasswordAfterOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp-new-password">New password</Label>
                    <PasswordInput
                      id="otp-new-password"
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      value={otpNewPassword}
                      onChange={(e) => setOtpNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otp-confirm-password">Confirm new password</Label>
                    <PasswordInput
                      id="otp-confirm-password"
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      value={otpConfirmPassword}
                      onChange={(e) => setOtpConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={savingOtpPassword}>
                    {savingOtpPassword ? <Loader2 className="size-4 animate-spin" /> : null}
                    Save new password
                  </Button>
                </form>
              ) : null}
            </DialogContent>
          </Dialog>






          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Palette className="size-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-card-foreground">Appearance</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              GotaOfferr is designed dark-first. Light mode is available if you prefer it.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(
                [
                  { key: "dark", label: "Dark", icon: Moon },
                  { key: "light", label: "Light", icon: Sun },
                  { key: "system", label: "System", icon: Monitor },
                ] as Array<{ key: ThemePreference; label: string; icon: typeof Moon }>
              ).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setTheme(option.key)}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    theme === option.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <option.icon className="size-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-card-foreground">Your data</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Under India's DPDP Act 2023 and similar laws, you can get a copy of everything we hold
              about you, or erase it completely. Read our{" "}
              <Link to="/privacy" className="text-primary underline underline-offset-4">
                privacy notice
              </Link>{" "}
              for what we store and for how long.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="outline" onClick={onExportData} disabled={exporting}>
                {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                Download my data
              </Button>
              <Button variant="destructive" onClick={onDeleteAccount} disabled={deleting}>
                {deleting ? <Loader2 className="size-4 animate-spin" /> : null}
                Delete my account
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold text-card-foreground">Job alerts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Daily job matches are configured inside the job finder, including your timezone and
              send time.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/jobs" search={{ alert: undefined }}>Open job finder settings</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="support" className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <LifeBuoy className="size-5 text-primary" />
              <h2 className="mt-3 font-display text-lg font-semibold text-card-foreground">
                Contact support
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Questions about billing, a rewrite that went wrong, or a feature request — send us a
                message and we'll reply.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Or email{" "}
                <a
                  href="mailto:contact@gotaofferr.com"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  contact@gotaofferr.com
                </a>
              </p>
              <Button className="mt-4" asChild>
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <Mail className="size-5 text-primary" />
              <h2 className="mt-3 font-display text-lg font-semibold text-card-foreground">
                Help & guides
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Answers to the most common questions, plus guides on tailoring a resume to any job
                description.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <Link to="/faq">Read FAQ</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/how-it-works">How it works</Link>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}

