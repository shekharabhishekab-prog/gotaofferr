import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3, Bell, HeartHandshake, Loader2, Sparkles } from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { setAutoRenew } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

const REASONS = [
  { value: "too_expensive", label: "It's too expensive right now" },
  { value: "found_a_job", label: "I found a job — I don't need it anymore" },
  { value: "not_using", label: "I'm not using it enough" },
  { value: "missing_features", label: "It's missing something I need" },
  { value: "other", label: "Something else" },
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Formatted date access stays active until. */
  accessUntil: string;
  onCancelled: () => void;
};

export function CancelSubscriptionDialog({ open, onOpenChange, accessUntil, onCancelled }: Props) {
  const stopRenew = useServerFn(setAutoRenew);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [reason, setReason] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setStep(1);
    setReason("");
    setFeedback("");
  }

  function close() {
    onOpenChange(false);
    setTimeout(reset, 200);
  }

  async function confirmCancel() {
    setSubmitting(true);
    try {
      const res = await stopRenew({
        data: {
          environment: getStripeEnvironment(),
          autoRenew: false,
          reason: REASONS.find((r) => r.value === reason)?.label ?? reason,
          feedback,
        },
      });
      if ("error" in res && res.error) throw new Error(res.error);
      onCancelled();
      setStep(4);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel your plan");
    } finally {
      setSubmitting(false);
    }
  }

  async function restartPlan() {
    setSubmitting(true);
    try {
      const res = await stopRenew({
        data: { environment: getStripeEnvironment(), autoRenew: true },
      });
      if ("error" in res && res.error) throw new Error(res.error);
      onCancelled();
      toast.success("Welcome back — your plan will renew as usual.");
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not restart your plan");
    } finally {
      setSubmitting(false);
    }
  }

  const valueProps = [
    {
      icon: Sparkles,
      title: "Tailored resumes & cover letters",
      body: "Every application gets a resume rewritten for that exact job description — not one generic CV sent 50 times.",
    },

    {
      icon: BarChart3,
      title: "ATS-ready formatting, every time",
      body: "Clean single-column output that parsers actually read, with your key achievements up top where recruiters look first.",
    },
    {
      icon: Bell,
      title: "Jobs found for you, daily",
      body: "The AI job finder scans the major boards on your filters and emails you matches — so you apply early, not late.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {step === 1 ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Before you go — what went wrong?</DialogTitle>
              <DialogDescription>
                One quick question. It genuinely shapes what we build next.
              </DialogDescription>
            </DialogHeader>

            <RadioGroup value={reason} onValueChange={setReason} className="mt-2 space-y-2">
              {REASONS.map((option) => (
                <label
                  key={option.value}
                  htmlFor={option.value}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                    reason === option.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <RadioGroupItem id={option.value} value={option.value} />
                  {option.label}
                </label>
              ))}
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="cancel-feedback" className="text-xs uppercase tracking-wider text-muted-foreground">
                Anything else? (optional)
              </Label>
              <Textarea
                id="cancel-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us in a line or two…"
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button variant="outline" onClick={close}>
                Keep my plan
              </Button>
              <Button disabled={!reason} onClick={() => setStep(2)}>
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : step === 2 ? (

          <>
            <DialogHeader>
              <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
                <HeartHandshake className="size-5 text-primary" />
              </div>
              <DialogTitle className="font-display">Here's what you'd be giving up</DialogTitle>
              <DialogDescription>
                Landing a role usually takes a few weeks of consistent applying. This is what keeps
                working for you in the background.
              </DialogDescription>
            </DialogHeader>

            <ul className="space-y-3">
              {valueProps.map((item) => (
                <li key={item.title} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                  <item.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
              If you cancel, auto-renewal stops but you keep full access until{" "}
              <span className="font-semibold text-foreground">{accessUntil}</span>. You can turn
              renewal back on any time before then — nothing is lost.
            </p>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/contact" onClick={close}>
                  Talk to us instead
                </Link>
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={close}>Continue my plan</Button>
                <Button variant="outline" onClick={() => setStep(3)}>
                  Continue to cancel
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : step === 3 ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">
                Are you sure you want to cancel?
              </DialogTitle>
              <DialogDescription>
                You can restart your plan at any time — your resumes, cover letters and saved job
                filters stay exactly where they are.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-border bg-card p-4 text-sm text-card-foreground">
              <p>
                Your plan will end on{" "}
                <span className="font-semibold">{accessUntil}</span>. You keep every feature until
                that day, and you will not be charged again.
              </p>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
              <Button onClick={close}>Continue my plan</Button>
              <Button variant="outline" onClick={confirmCancel} disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                Finish cancellation
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-2 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-3xl">
              <span role="img" aria-label="waving goodbye">
                &#128075;
              </span>
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold text-foreground">
              You&apos;re all set. Goodbye for now &#128546;
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your plan ends on{" "}
              <span className="font-semibold text-foreground">{accessUntil}</span> and you won&apos;t
              be charged again. Thank you for trusting us with your job search &#128153;.
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              We hope the next interview is the one &#127775;. The door stays open — turn renewal
              back on any time and everything picks up right where you left it.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={restartPlan} disabled={submitting}>
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                Restart my plan
              </Button>
              <Button variant="outline" asChild>
                <Link to="/tailor" onClick={close}>
                  Keep tailoring until then
                </Link>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

