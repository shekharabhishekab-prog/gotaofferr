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
      { title: "Contact Terbey — Support and Feedback" },
      {
        name: "description",
        content:
          "Get in touch with Terbey about resume tailoring, feedback, bugs, or partnerships. Send us a message anytime.",
      },
      { property: "og:title", content: "Contact Terbey — Support and Feedback" },
      {
        property: "og:description",
        content:
          "Get in touch with Terbey about resume tailoring, feedback, bugs, or partnerships. Send us a message anytime.",
      },
      { property: "og:url", content: "https://gotaofferr.com/contact" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/contact" }],
  }),
  component: Contact,
});

const CT_CSS = `
@font-face{font-family:"HPInst";src:url("/m/inst.ttf") format("truetype");font-style:italic;font-display:swap}
.tlp{--y:#073f89;--cream:#073f89;background:#fffffd;color:var(--cream)}
.tl-hero{position:relative;padding:44px 20px 40px;text-align:center;background:radial-gradient(55% 60% at 50% 0%,rgba(7,63,137,.14),transparent 72%)}
.tl-hero:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(7,63,137,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(7,63,137,.045) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:linear-gradient(#fffffd 20%,transparent);mask-image:linear-gradient(#fffffd 20%,transparent)}
.tl-hero>*{position:relative}
.tl-hero,.tl-hero *{text-align:center}.tl-mono,.tl-sub{display:block;text-wrap:balance}.tl-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;color:var(--y)}
.tl-h1{margin:16px auto 0;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:.95;letter-spacing:-.015em;font-size:clamp(2.3rem,7vw,4.6rem);max-width:15em}
.tl-h1 span{display:block}
.tl-h1 mark{background:var(--y);color:#fffffd;padding:0 .12em;display:inline-block;transform:rotate(-1deg);line-height:1}
.tl-cur{font-family:"HPInst",Georgia,serif;font-style:italic;text-transform:none;color:var(--y);font-weight:400;font-size:1.06em;line-height:.9;vertical-align:baseline;letter-spacing:-.01em}
.tl-sub{max-width:34rem;margin:18px auto 0;font-size:1.05rem;line-height:1.5;color:rgba(0,0,0,.72)}
.tl-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:30px}
.tl-chips i{font-style:normal;font-size:.78rem;border:1px solid rgba(7,63,137,.4);color:var(--y);border-radius:999px;padding:5px 12px}
.tl-rise{opacity:0;transform:translateY(.6em);animation:tl-rise .6s cubic-bezier(.2,.8,.2,1) var(--d,0s) forwards}
@keyframes tl-rise{to{opacity:1;transform:none}}
.tl-chips i{transition:transform .2s}
.tl-chips i:nth-child(odd){transform:rotate(-1.5deg)}
.tl-chips i:nth-child(even){transform:rotate(1.5deg)}
.tl-chips i:hover{transform:rotate(0) scale(1.08);background:rgba(7,63,137,.12)}
.tl-cur{display:inline-block;transition:transform .3s}
.tl-h1:hover .tl-cur{transform:rotate(-2deg) scale(1.04)}
.tl-sticker{display:inline-block;margin-bottom:14px;background:var(--y);color:#fffffd;font-weight:700;font-size:.82rem;padding:6px 14px;border-radius:999px;transform:rotate(-2deg);box-shadow:3px 3px 0 #073f89,0 0 0 2px var(--y);transition:transform .25s}
.tl-sticker:hover{animation:tl-wig .55s}
@keyframes tl-wig{25%{transform:rotate(-8deg) scale(1.08)}60%{transform:rotate(6deg) scale(1.08)}100%{transform:rotate(-2deg)}}
.tl button.rounded-full:not(:disabled):hover{animation:tl-wig2 .5s}
@keyframes tl-wig2{25%{transform:translateY(-3px) rotate(-1.2deg)}60%{transform:translateY(-3px) rotate(1.2deg)}100%{transform:translateY(-3px) rotate(0)}}
@keyframes tl-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}@keyframes tl-pop{from{transform:scale(.3) rotate(-12deg);opacity:0}}
@keyframes tl-grow{from{transform:scaleX(0)}}
@supports (animation-timeline:view()){.tl-grid>*{animation:tl-rise linear backwards;animation-timeline:view();animation-range:entry 0% entry 45%}}
@media (min-width:900px){.tl-h1{max-width:1440px;font-size:clamp(2.6rem,4.6vw,4.4rem);white-space:nowrap}.tl-sub{max-width:46rem}.tl-sub{max-width:46rem}}
@media (min-width:1700px){.tl-wrap{max-width:1780px;padding-left:40px;padding-right:40px}.tl-h1{max-width:1700px;font-size:4.9rem}.tl-sub{max-width:54rem;font-size:1.15rem}}
@media (max-width:640px){.tl-hero,.tl-hero *{text-align:left}.tl-h1{margin:16px 0 0;max-width:none}.tl-h1 span{text-wrap:wrap}.tl-sub{margin:14px 0 0;text-wrap:pretty;font-size:.78rem!important;line-height:1.5}.tl-chips{justify-content:flex-start}.tl-sticker,.tl-chips i:nth-child(n),.tl-sticker{transform:none}.tl-chips{gap:6px;flex-wrap:nowrap}.tl-chips i{font-size:.7rem;padding:4px 8px;white-space:nowrap}.tl-hero{padding-left:14px!important;padding-right:14px!important}.tl-mono{font-size:.66rem;letter-spacing:0}.tl-hero{padding:32px 16px 26px}.tl-wrap{padding-left:14px;padding-right:14px}.tl-h1{font-size:10.5vw;white-space:normal}.tl-h1 span{text-wrap:balance}.tl-sub{font-size:.86rem;line-height:1.5;color:rgba(0,0,0,.55);max-width:19rem}}
.tl-br{display:flex;flex-direction:column;align-items:center;padding:34px 16px 6px}
.tl-bl{display:block;width:1px;height:64px;background:linear-gradient(to bottom,transparent,var(--y))}
.tl-bp{display:inline-flex;align-items:center;gap:8px;margin-top:8px;border:1px solid rgba(7,63,137,.18);background:rgba(255,255,253,.7);color:var(--y);border-radius:99px;padding:6px 16px;font-family:Georgia,"Times New Roman",serif;font-style:italic;font-size:1.15rem;text-decoration:none;transition:border-color .2s,transform .2s}
.tl-bp:hover{border-color:rgba(7,63,137,.7);transform:translateY(-2px)}
.tl-bp i{width:7px;height:7px;border-radius:99px;background:var(--y);display:block}
.tl-strip{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:22px auto 0;max-width:34rem}
.tl-strip span{font-size:.78rem;border:1px solid rgba(7,63,137,.35);color:var(--cream);border-radius:99px;padding:5px 12px;background:rgba(7,63,137,.06)}
.tl-strip span:nth-child(odd){transform:rotate(-1.5deg)}.tl-strip span:nth-child(even){transform:rotate(1.5deg);border-color:rgba(7,63,137,.25);background:transparent}
.tl-seo2{max-width:1100px;margin:0 auto;padding:44px 20px 80px;color:rgba(0,0,0,.72)}
.tl-seo2 h2{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:1;letter-spacing:-.01em;font-size:clamp(1.7rem,4.2vw,2.8rem);color:var(--cream);margin:0;text-wrap:balance}
.tl-seo2 h2 mark{background:var(--y);color:#fffffd;padding:0 .12em;display:inline-block;transform:rotate(-1deg);line-height:1}
.tl-seo2 .tl-lead{margin:18px 0 0;font-size:1.02rem;line-height:1.7;max-width:46rem;overflow-wrap:anywhere}
.tl-seo2 h3{margin:40px 0 14px;font-family:Georgia,"Times New Roman",serif;font-style:italic;font-weight:400;font-size:1.5rem;color:var(--y)}
.tl-gets{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.tl-gets li{background:linear-gradient(160deg,rgba(7,63,137,.07),rgba(7,63,137,.015));border:1px solid rgba(7,63,137,.3);border-radius:20px;padding:18px;line-height:1.55;transition:transform .25s,border-color .25s;overflow-wrap:anywhere}
.tl-gets li:hover{transform:translateY(-4px) rotate(-.4deg);border-color:rgba(7,63,137,.7)}
.tl-gets b{display:block;font-size:1.7rem;margin-bottom:6px;font-weight:400}
.tl-more{margin:30px 0 0;padding:20px;border:1px dashed rgba(7,63,137,.35);border-radius:20px;line-height:1.9;max-width:100%;overflow-wrap:anywhere}
.tl-more a{color:var(--y);text-decoration:none;border-bottom:1px solid rgba(7,63,137,.5);padding:0 2px;transition:background .2s,color .2s}
.tl-more a:hover{background:var(--y);color:#fffffd}
@supports (animation-timeline:view()){.tl-bl{animation:tl-grow linear both;animation-timeline:view();animation-range:entry 0% cover 40%}@keyframes tl-grow{from{height:8px}to{height:64px}}.tl-gets li{animation:tl-up linear backwards;animation-timeline:view();animation-range:entry 0% entry 55%}}
@media (max-width:760px){.tl-gets{grid-template-columns:minmax(0,1fr)}.tl-seo2{padding:30px 14px 56px}.tl-seo2 .tl-lead{font-size:.95rem}.tl-br{padding-top:24px}.tl-bl{height:44px}.tl-more{padding:16px}.tl-seo2 h3{font-size:1.3rem;margin-top:30px}}
@media (min-width:1280px){.tl-seo2{max-width:1480px;padding-left:32px;padding-right:32px}}
@media (min-width:1700px){.tl-seo2{max-width:1780px;padding-left:40px;padding-right:40px}.tl-seo2 .tl-lead{font-size:1.12rem;max-width:56rem}}
@media (prefers-reduced-motion:reduce){.tl-bl,.tl-gets li{animation:none}.tl-gets li:hover,.tl-bp:hover{transform:none}}
.tl-br{display:none}
@supports (animation-timeline:view()){.tl-bw{animation:tl-bwl linear both;animation-timeline:view();animation-range:entry 0% exit 100%}.tl-bw.out{animation-name:tl-bwr}@keyframes tl-bwl{from{transform:translateX(24%)}to{transform:translateX(-24%)}}@keyframes tl-bwr{from{transform:translateX(-24%)}to{transform:translateX(24%)}}.tl-gchip{animation:tl-pop linear backwards;animation-timeline:view();animation-range:entry 0% entry 60%}.tl-gchip:nth-child(2){animation-range:entry 5% entry 65%}.tl-gchip:nth-child(3){animation-range:entry 10% entry 70%}.tl-gchip:nth-child(4){animation-range:entry 15% entry 75%}.tl-seo2 h2,.tl-seo2 .tl-lead,.tl-more{animation:tl-up linear backwards;animation-timeline:view();animation-range:entry 0% entry 50%}@keyframes tl-pop{from{opacity:0;transform:translateY(26px) scale(.85)}to{opacity:1;transform:none}}}
.tl-seo2 h2{font-size:clamp(2.4rem,4.6vw,5rem);line-height:.98}
.tl-seo2 h2 mark{padding:.02em .2em;transform:rotate(-1.5deg);box-shadow:7px 7px 0 rgba(0,0,0,.9);transition:transform .25s}
.tl-seo2 h2:hover mark{transform:rotate(0) scale(1.03)}
.tl-seo2 h2:after{content:"";display:block;width:min(100%,520px);height:6px;margin-top:20px;border-radius:9px;background:linear-gradient(90deg,var(--y),rgba(7,63,137,0))}
@media (prefers-reduced-motion:reduce){.tl-bw,.tl-gchip,.tl-seo2 h2,.tl-seo2 .tl-lead,.tl-more{animation:none}.tl-gchip:hover{transform:none}}
.tl-sub-d{display:none}
@media (min-width:900px){.tl-sub-m{display:none}.tl-sub-d{display:inline}}
.tl-ct{max-width:1100px;margin:0 auto;padding:10px 20px 20px;display:grid;gap:22px;grid-template-columns:1fr 340px}
.tl-ct form,.tl-ct aside{background:linear-gradient(160deg,rgba(7,63,137,.07),rgba(7,63,137,.015));border:1px solid rgba(7,63,137,.35);border-radius:22px;padding:24px;transition:transform .25s,border-color .25s}
.tl-ct form:hover,.tl-ct aside:hover{border-color:rgba(7,63,137,.65)}
.tl-ct input,.tl-ct textarea{background:rgba(255,255,253,.6)}
.tl-ct input:focus,.tl-ct textarea:focus{border-color:var(--y);box-shadow:0 0 0 3px rgba(7,63,137,.2)}
.tl-ct button[type=submit]{border-radius:999px;background:var(--y);color:#fffffd;font-weight:700;padding:0 28px;transition:transform .2s}
.tl-ct button[type=submit]:not(:disabled):hover{transform:translateY(-3px) rotate(-1deg)}
.tl-ct aside h2{color:var(--y)}
.tl-ct aside svg{color:var(--y)}
@media (max-width:820px){.tl-ct{grid-template-columns:minmax(0,1fr);padding:6px 14px}}
@media (min-width:1280px){.tl-ct{max-width:1480px;padding-left:32px;padding-right:32px;grid-template-columns:1fr 380px}}
`;

function Contact() {
  const [sending, setSending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  return (
    <main className="tlp bg-background">
      <style>{CT_CSS}</style>
      <section className="tl-hero">
        <span className="tl-sticker" aria-hidden>Coco reads every message 🐾 (our kitten)</span>
        <span className="tl-mono tl-rise" style={{ ["--d" as string]: "0s" }}>( contact, real humans, replies in 1-2 days )</span>
        <h1 className="tl-h1" aria-label="Say hello. We reply faster than your last recruiter.">
          <span className="tl-rise" style={{ ["--d" as string]: ".06s" }}><mark>Say hello.</mark> We reply</span>
          <span className="tl-rise" style={{ ["--d" as string]: ".16s" }}>faster than <em className="tl-cur">your last recruiter.</em></span>
        </h1>
        <p className="tl-sub tl-rise" style={{ ["--d" as string]: ".3s" }}>
          <span className="tl-sub-m">Questions, feedback, or a resume that did not parse the way you expected? Tell us about it over coffee (virtual one is fine).</span>
          <span className="tl-sub-d">Questions, feedback or a stuck resume? Tell us, over coffee.</span>
        </p>
      </section>

      <div className="tl tl-ct">
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
                  : "Couldn't send your message. Please email contact@terbey.com.",
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
                href="mailto:contact@terbey.com"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                contact@terbey.com
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
        </aside>
      </div>

      <section className="tl-seo2">
        <h2>Before you <mark>write</mark></h2>
        <p className="tl-lead">
          Many questions are answered already. The{" "}
          <a style={{ color: "var(--y)" }} href="/faq">
            FAQ
          </a>{" "}
          covers file formats, ATS formatting, privacy and plans, and{" "}
          <a style={{ color: "var(--y)" }} href="/how-it-works">
            how it works
          </a>{" "}
          walks through tailoring a resume step by step.
        </p>
        <p className="tl-lead">
          Write to us about resume tailoring problems, a job listing that looks wrong, billing,
          feature ideas, bugs, or partnerships. Include the job link or the country you are applying
          to and we can usually help faster. Want to see what is possible first? Browse our{" "}
          <a style={{ color: "var(--y)" }} href="/examples/resumes">
            resume examples
          </a>{" "}
          or try the{" "}
          <a style={{ color: "var(--y)" }} href="/resume-builder">
            resume builder
          </a>
          .
        </p>
      </section>
    </main>
  );
}


