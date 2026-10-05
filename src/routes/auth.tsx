import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordInput } from "@/components/PasswordInput";
import { TurnstileWidget, resetTurnstile } from "@/components/TurnstileWidget";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — GotaOfferr" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "Create a free GotaOfferr account to tailor 3 resumes and cover letters every month with AI.",
      },
      { property: "og:title", content: "Sign in — GotaOfferr" },
      {
        property: "og:description",
        content: "Create a free GotaOfferr account to tailor 3 resumes every month with AI.",
      },
      { property: "og:url", content: "https://gotaofferr.com/auth" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/auth" }],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/tailor";
}

/** Generic copy so a failed attempt never reveals whether an account exists. */
const GENERIC_SIGNIN_ERROR = "Those sign-in details didn't work. Please check and try again.";
const RATE_LIMIT_ERROR = "Too many attempts. Please wait a minute and try again.";

function signInErrorMessage(message: string) {
  return /rate|too many/i.test(message) ? RATE_LIMIT_ERROR : GENERIC_SIGNIN_ERROR;
}

/** Strip anything that isn't a plain name character, and cap the length. */
function cleanName(value: string) {
  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

import { passwordProblem } from "@/lib/password";


function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const next = safePath(search.redirect);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  // Brute-force gate: after repeated failures the human check must pass first.
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const needsCaptcha = failedAttempts >= 3;

  // In-page password reset: email a code, verify it, set a new password.
  const [resetStage, setResetStage] = useState<"idle" | "code" | "password">("idle");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");


  useEffect(() => {
    const raw = `${window.location.hash}&${window.location.search}`;
    const m = raw.match(/error_description=([^&]+)/);
    if (m) toast.error(decodeURIComponent(m[1].replace(/\+/g, " ")));
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: next, replace: true });
    });
  }, [navigate, next]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (needsCaptcha && !captchaToken) {
      return toast.error("Please complete the human check below, then try again.");
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().slice(0, 254),
      password,
    });
    setBusy(false);
    if (error) {
      setFailedAttempts((n) => n + 1);
      setCaptchaToken(null);
      resetTurnstile();
      return toast.error(signInErrorMessage(error.message));
    }
    setFailedAttempts(0);
    toast.success("Welcome back");
    navigate({ to: next, replace: true });
  }

  /** Always reports success so the form can't be used to discover accounts. */
  async function forgotPassword() {
    const address = email.trim().slice(0, 254);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) {
      return toast.error("Enter your email address first, then tap “Forgot password?”.");
    }
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(address, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    setResetEmail(address);
    setResetStage("code");
    setResetCode("");
    toast.success("If that email has an account, a code is on its way.");
  }

  /** Verifies the emailed code, then lets them set a new password right here. */
  async function verifyResetCode(e: React.FormEvent) {
    e.preventDefault();
    const code = resetCode.replace(/\D/g, "");
    if (code.length < 4) return toast.error("Enter the code from your email.");
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: resetEmail,
      token: code,
      type: "recovery",
    });
    setBusy(false);
    if (error) return toast.error("That code is invalid or expired. Send a new one.");
    setResetStage("password");
    toast.success("Code verified — choose a new password.");
  }

  async function saveResetPassword(e: React.FormEvent) {
    e.preventDefault();
    const problem = passwordProblem(resetPassword);
    if (problem) return toast.error(problem);
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: resetPassword });
    setBusy(false);
    if (error) return toast.error(error.message || "Could not update your password.");
    toast.success("Password updated. You're signed in.");
    navigate({ to: next, replace: true });
  }



  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    const name = cleanName(fullName);
    if (name.length < 2) return toast.error("Please enter your name.");
    const problem = passwordProblem(password);
    if (problem) return toast.error(problem);
    if (password !== confirmPassword) return toast.error("Passwords do not match. Please re-enter them.");

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().slice(0, 254),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${next}`,
        data: { full_name: name },
      },
    });
    setBusy(false);
    if (error) {
      return toast.error(
        /rate|too many/i.test(error.message)
          ? RATE_LIMIT_ERROR
          : /registered|already/i.test(error.message)
            ? "Check your email to continue setting up your account."
            : error.message,
      );
    }
    if (!data.session) {
      setSent(true);
      return;
    }
    navigate({ to: next, replace: true });
  }


  async function google() {
    if (import.meta.env.VITE_AUTH_MODE === "supabase") {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth?redirect=${encodeURIComponent(next)}` },
      });
      if (error) toast.error("Google sign-in failed. Please try again.");
      return;
    }
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${next}`,
    });
    if (result.error) return toast.error("Google sign-in failed. Please try again.");
    if (result.redirected) return;
    navigate({ to: next, replace: true });
  }

  return (
    <main className="mx-auto flex max-w-md flex-col px-5 py-16 sm:py-24">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="size-3 text-highlight" /> 10 free tailored resumes every month
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold text-foreground">
          Sign in to GotaOfferr
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account keeps track of your monthly free tailoring credits.
        </p>
      </div>

      <Card className="mt-8 p-6">
        {sent ? (
          <div className="text-center">
            <h2 className="font-display text-lg font-semibold">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a confirmation link to <span className="font-medium">{email}</span>. Click it
              to activate your account, then come back and sign in.
            </p>
          </div>
        ) : (
          <>
            <Button variant="outline" className="w-full" onClick={google} type="button">
              Continue with Google
            </Button>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or use email{" "}
              <span className="h-px flex-1 bg-border" />
            </div>

            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form className="space-y-3 pt-4" onSubmit={signIn}>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput
                      id="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={forgotPassword}
                      disabled={busy}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {resetStage === "code" ? (
                    <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                      <Label htmlFor="reset-code">Enter the code we emailed you</Label>
                      <Input
                        id="reset-code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={10}
                        placeholder="Paste your code"
                        value={resetCode}
                        onChange={(e) =>
                          setResetCode(e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        className="max-w-48 tracking-[0.3em]"
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <Button type="button" size="sm" disabled={busy} onClick={verifyResetCode}>
                          Verify code
                        </Button>
                        <button
                          type="button"
                          onClick={forgotPassword}
                          disabled={busy}
                          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                        >
                          Resend
                        </button>
                        <button
                          type="button"
                          onClick={() => setResetStage("idle")}
                          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {resetStage === "password" ? (
                    <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                      <Label htmlFor="reset-new-password">New password</Label>
                      <PasswordInput
                        id="reset-new-password"
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={72}
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        At least 8 characters with an uppercase letter, a lowercase letter, a number
                        and a special character.
                      </p>
                      <Button type="button" size="sm" disabled={busy} onClick={saveResetPassword}>
                        Save new password
                      </Button>
                    </div>
                  ) : null}



                  {needsCaptcha ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Too many failed attempts. Complete the quick human check to continue.
                      </p>
                      <TurnstileWidget onToken={setCaptchaToken} />
                    </div>
                  ) : null}

                  <Button
                    className="w-full"
                    disabled={busy || (needsCaptcha && !captchaToken)}
                    type="submit"
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" /> : null} Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form className="space-y-3 pt-4" onSubmit={signUp}>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email-up">Email</Label>
                    <Input
                      id="email-up"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password-up">Password</Label>
                    <PasswordInput
                      id="password-up"
                      required
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password-up-confirm">Re-enter password</Label>
                    <PasswordInput
                      id="password-up-confirm"
                      required
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {confirmPassword.length > 0 && confirmPassword !== password ? (
                      <p className="text-xs text-destructive">Passwords do not match.</p>
                    ) : null}
                  </div>
                  <Button className="w-full" disabled={busy} type="submit">
                    {busy ? <Loader2 className="size-4 animate-spin" /> : null} Create free account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to our fair-use policy.{" "}
        <Link to="/pricing" className="underline">
          See plans
        </Link>
      </p>
    </main>
  );
}

