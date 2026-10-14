import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

type Enrollment = { factorId: string; qr: string; secret: string };

/**
 * Two-factor gate for the admin dashboard.
 * Renders children only once the session has reached AAL2 (TOTP verified).
 */
export function AdminMfaGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ok" | "needs-code" | "needs-enroll">("loading");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === "aal2") {
      setStatus("ok");
      return;
    }
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verified = factors?.totp?.find((f) => f.status === "verified");
    if (verified) {
      setFactorId(verified.id);
      setStatus("needs-code");
      return;
    }
    setStatus("needs-enroll");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function startEnroll() {
    setBusy(true);
    // Clear any half-finished factors so enrollment never collides on the name.
    const { data: factors } = await supabase.auth.mfa.listFactors();
    for (const f of factors?.all ?? []) {
      if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `admin-${Date.now()}`,
    });
    setBusy(false);
    if (error || !data) return toast.error(error?.message ?? "Could not start setup.");
    setEnrollment({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    setFactorId(data.id);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.replace(/\D/g, "").slice(0, 6),
    });
    setBusy(false);
    if (error) return toast.error("That code didn't match. Try the next one.");
    setCode("");
    setEnrollment(null);
    toast.success("Two-factor verified");
    await refresh();
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "ok") return <>{children}</>;

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-highlight" />
          <h1 className="font-display text-xl font-bold">Two-factor required</h1>
        </div>

        {status === "needs-enroll" && !enrollment ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              The admin dashboard needs an authenticator app (Google Authenticator, 1Password, Authy).
              Set it up once — after that you'll just enter a 6-digit code.
            </p>
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">
              <strong>Important:</strong> Save a backup of this 2FA setup in your password manager.
              If you lose your authenticator device, you can only regain admin access by contacting
              support at <span className="font-medium">contact@terbey.com</span>.
            </div>
            <Button className="mt-5 w-full" onClick={startEnroll} disabled={busy}>
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null} Set up authenticator
            </Button>
          </>
        ) : null}

        {enrollment ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Scan this with your authenticator app, then enter the 6-digit code it shows.
            </p>
            <div className="mt-4 flex justify-center rounded-lg bg-white p-3">
              <img src={enrollment.qr} alt="Two-factor setup QR code" className="h-44 w-44" />
            </div>
            <p className="mt-3 break-all text-center text-xs text-muted-foreground">
              Can't scan? Enter this key manually: <span className="font-mono">{enrollment.secret}</span>
            </p>
          </>
        ) : null}

        {status === "needs-code" && !enrollment ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app to continue.
          </p>
        ) : null}

        {factorId ? (
          <form className="mt-5 space-y-3" onSubmit={verify}>
            <div className="space-y-1.5">
              <Label htmlFor="mfa-code">Authentication code</Label>
              <Input
                id="mfa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <Button className="w-full" type="submit" disabled={busy || code.length < 6}>
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null} Verify
            </Button>
          </form>
        ) : null}
      </Card>
    </div>
  );
}

