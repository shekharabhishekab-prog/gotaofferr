import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import { supabase } from "@/integrations/supabase/client";
import { signOutOtherSessions } from "@/lib/session.functions";
import { passwordProblem } from "@/lib/password";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — Terbey" },
      {
        name: "description",
        content: "Set a new password for your Terbey account and get back to tailoring resumes.",
      },
      { property: "og:title", content: "Choose a new password — Terbey" },
      {
        property: "og:description",
        content: "Set a new password for your Terbey account.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    // The recovery link hands Supabase a one-time session before this renders.
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (active) setReady(Boolean(data.session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = passwordProblem(password);
    if (problem) return toast.error(problem);
    if (password !== confirm) return toast.error("Both passwords must match.");

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      return toast.error(
        /same/i.test(error.message)
          ? "Please choose a password you haven't used before."
          : "That reset link has expired. Please request a new one.",
      );
    }
    await signOutOtherSessions().catch(() => undefined);
    toast.success("Password updated. You're signed in.");
    navigate({ to: "/tailor", replace: true });
  }

  return (
    <main className="mx-auto flex max-w-md flex-col px-5 py-16 sm:py-24">
      <h1 className="text-center font-display text-3xl font-bold text-foreground">
        Choose a new password
      </h1>

      <Card className="mt-8 p-6">
        {ready === false ? (
          <p className="text-sm text-muted-foreground">
            This reset link is invalid or has expired. Please request a new password reset email
            from the sign-in page.
          </p>
        ) : (
          <form className="space-y-3" onSubmit={submit}>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <PasswordInput
                id="new-password"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <PasswordInput
                id="confirm-password"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              At least 8 characters with an uppercase letter, a lowercase letter, a number and a
              special character.
            </p>
            <Button className="w-full" disabled={busy || ready !== true} type="submit">
              {busy ? <Loader2 className="size-4 animate-spin" /> : null} Update password
            </Button>
          </form>
        )}
      </Card>
    </main>
  );
}

