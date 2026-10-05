import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Twitter } from "lucide-react";
import { useState } from "react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessage } from "@/lib/contact.functions";
import { TurnstileWidget, resetTurnstile } from "@/components/TurnstileWidget";


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact GotaOfferr — Support and Feedback" },
      {
        name: "description",
        content:
          "Get in touch with the GotaOfferr team about resume tailoring, feedback, bugs, or partnerships. Send us a message anytime.",
      },
      { property: "og:title", content: "Contact GotaOfferr — Support and Feedback" },
      {
        property: "og:description",
        content:
          "Get in touch with the GotaOfferr team about resume tailoring, feedback, bugs, or partnerships. Send us a message anytime.",
      },
      { property: "og:url", content: "https://gotaofferr.com/contact" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [sending, setSending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-4xl font-bold text-foreground">Contact us</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Questions, feedback, or a resume that didn't parse the way you expected? Tell us about it.
      </p>

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_320px]">
        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            setSending(true);
            try {
              await submitContactMessage({
                data: {
                  name: String(fd.get("name") ?? ""),
                  email: String(fd.get("email") ?? ""),
                  message: String(fd.get("message") ?? ""),
                  turnstileToken: captchaToken ?? undefined,
                },
              });
              form.reset();
              toast.success("Thanks — we'll get back to you shortly.");
            } catch (err) {
              toast.error(
                err instanceof Error && /verification/i.test(err.message)
                  ? err.message
                  : "Couldn't send your message. Please email contact@gotaofferr.com.",
              );
            } finally {
              // Turnstile tokens are single-use.
              setCaptchaToken(null);
              resetTurnstile();
              setSending(false);
            }
          }}
        >

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" required rows={7} placeholder="How can we help?" />
          </div>
          <TurnstileWidget onToken={setCaptchaToken} />
          <Button type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send message"}
          </Button>
        </form>

        <aside className="space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="flex gap-3">
            <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-card-foreground">Email</h2>
              <a
                href="mailto:contact@gotaofferr.com"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                contact@gotaofferr.com
              </a>
            </div>
          </div>
          <div className="flex gap-3">
            <MessageSquare className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-card-foreground">Support</h2>
              <p className="text-sm text-muted-foreground">Replies within 1–2 business days.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Twitter className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-card-foreground">Social</h2>
              <p className="text-sm text-muted-foreground">@gotaofferr</p>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <h2 className="text-sm font-semibold text-card-foreground">Business</h2>
            <address className="mt-1 not-italic text-sm text-muted-foreground">
              AB24 SOLUTIONS (GotaOfferr)
              <br />
              Delhi, India
            </address>
          </div>
        </aside>
      </div>

      <section className="mt-16 max-w-3xl space-y-4 text-muted-foreground">
        <h2 className="font-display text-2xl font-bold text-foreground">Before you write</h2>
        <p>
          Many questions are answered already. The{" "}
          <a className="underline" href="/faq">
            FAQ
          </a>{" "}
          covers file formats, ATS formatting, privacy and plans, and{" "}
          <a className="underline" href="/how-it-works">
            how it works
          </a>{" "}
          walks through tailoring a resume step by step.
        </p>
        <p>
          Write to us about resume tailoring problems, a job listing that looks wrong, billing,
          feature ideas, bugs, or partnerships. Include the job link or the country you are applying
          to and we can usually help faster. Want to see what is possible first? Browse our{" "}
          <a className="underline" href="/examples/resumes">
            resume examples
          </a>{" "}
          or try the{" "}
          <a className="underline" href="/resume-builder">
            resume builder
          </a>
          .
        </p>
      </section>
    </main>
  );
}

