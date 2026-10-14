import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

/** Homepage band for the AI interview. Black, white and yellow like the rest of the page. */
export function InterviewBand() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("ivb-js");
    const io = new IntersectionObserver((es) => {
      for (const e of es) {
        if (e.intersectionRatio >= 0.25) el.classList.add("ivb-in");
        else if (e.intersectionRatio === 0) el.classList.remove("ivb-in");
      }
    }, { threshold: [0, 0.25] });
    io.observe(el);
    let raf = 0;
    const upd = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight));
      el.style.setProperty("--ivp", p.toFixed(3));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(upd); };
    window.addEventListener("scroll", on, { passive: true });
    upd();
    return () => { io.disconnect(); window.removeEventListener("scroll", on); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return (
    <section ref={ref} data-p className="ivb site-container py-12 sm:py-24" aria-labelledby="ivb-h">
      <style>{CSS}</style>
      <p className="ivb-mono">( new: ai interview )</p>
      <div className="ivb-grid">
        <div>
          <h2 id="ivb-h" className="ivb-h">
            <span className="ivb-p">Your next</span> <span className="ivb-it">interview?</span> <span className="ivb-p">Already a rematch.</span> <span className="ivb-out">Seen it,</span> <span className="ivb-mk">nailed it.</span>
          </h2>
          <p className="ivb-sub">
            A kitten asks the real questions out loud. You answer. You get a score and straight feedback. One free interview every month.
          </p>
          <Link to="/ai-interview" className="ivb-cta">
            Start a free interview <ArrowRight className="size-5" />
          </Link>
        </div>
        <div className="ivb-chat" aria-hidden>
          <div className="ivb-cat">🐱</div>
          <div className="ivb-b ivb-b1">Tell me about yourself. You have 90 seconds 🐾</div>
          <div className="ivb-b ivb-b2">Uhh... so... I am a hard worker?</div>
          <div className="ivb-b ivb-b3">Cute. Try again, with numbers 😼</div>
          <div className="ivb-score"><b>82</b>/100 <span>after 3 rounds</span></div>
        </div>
      </div>
    </section>
  );
}

const CSS = `
.ivb-mono{font-family:ui-monospace,monospace;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:#073f89;margin:0 0 14px}
.ivb-grid{display:grid;gap:36px;align-items:center}
@media(min-width:900px){.ivb-grid{grid-template-columns:1.15fr .85fr;gap:56px}}
.ivb-h{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:.98;letter-spacing:-.01em;font-size:2.3rem;margin:0;text-wrap:balance}
@media(min-width:640px){.ivb-h{font-size:3.4rem}}
@media(min-width:1024px){.ivb-h{font-size:4rem}}
.ivb-it{font-family:Georgia,"Times New Roman",serif;font-style:italic;font-weight:400;text-transform:none;color:#073f89;letter-spacing:0;font-size:1.12em}
.ivb-out{color:transparent;-webkit-text-stroke:1.5px #073f89}
.ivb-mk{background:#073f89;color:#fffffd;padding:0 .14em;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.ivb-sub{margin:22px 0 0;max-width:34rem;font-size:1.05rem;line-height:1.5;color:rgba(0,0,0,.75)}
.ivb-cta{display:inline-flex;align-items:center;gap:10px;margin-top:26px;background:#073f89;color:#fffffd;font-weight:800;border-radius:999px;padding:15px 26px;text-decoration:none;font-size:1.02rem;transition:transform .2s}
.ivb-cta:hover{transform:translateY(-3px) rotate(-1deg)}
.ivb-chat{position:relative;display:flex;flex-direction:column;gap:12px;padding:26px 20px 20px;border:1px solid rgba(7,63,137,.35);border-radius:22px;background:rgba(7,63,137,.04)}
.ivb-cat{position:absolute;top:-26px;right:18px;width:58px;height:58px;border-radius:50%;background:#073f89;display:flex;align-items:center;justify-content:center;font-size:32px;transform:rotate(8deg)}
.ivb-b{max-width:88%;padding:11px 15px;border-radius:16px;font-size:.95rem;line-height:1.35}
.ivb-b1{background:#073f89;color:#fffffd;border-bottom-left-radius:4px;align-self:flex-start}
.ivb-b2{border:1px solid rgba(0,0,0,.4);align-self:flex-end;border-bottom-right-radius:4px}
.ivb-b3{background:#073f89;color:#fffffd;border-bottom-left-radius:4px;align-self:flex-start}
.ivb-score{align-self:flex-end;margin-top:4px;background:#073f89;color:#fffffd;border-radius:14px;padding:8px 14px;font-size:.9rem}
.ivb-score b{font-size:1.6rem;margin-right:2px}.ivb-score span{opacity:.7;margin-left:6px}
.ivb-h{transform:translate3d(0,calc(var(--ivp,0)*26px),0)}.ivb-chat{transform:translate3d(0,calc(var(--ivp,0)*-70px),0);will-change:transform}
.ivb-cat{transform:translate3d(0,calc(var(--ivp,0)*60px),0) rotate(8deg)}
.ivb-js .ivb-p,.ivb-js .ivb-it,.ivb-js .ivb-mono,.ivb-js .ivb-sub,.ivb-js .ivb-cta,.ivb-js .ivb-out,.ivb-js .ivb-mk,.ivb-js .ivb-b,.ivb-js .ivb-score,.ivb-js .ivb-cat{opacity:0;transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}
.ivb-js .ivb-mono,.ivb-js .ivb-sub,.ivb-js .ivb-cta{transform:translateY(26px)}
.ivb-js .ivb-p,.ivb-js .ivb-it{display:inline-block;transform:translateY(22px)}
.ivb-js .ivb-out{display:inline-block;transform:translateX(-40px)}
.ivb-js .ivb-mk{display:inline-block;transform:translateX(40px) rotate(-2deg)}
.ivb-js .ivb-b1,.ivb-js .ivb-b3{transform:translateX(-36px)}
.ivb-js .ivb-b2{transform:translateX(36px)}
.ivb-js .ivb-score{transform:scale(.6)}
.ivb-js .ivb-cat{transform:scale(.3) rotate(-40deg)}
.ivb-in .ivb-p,.ivb-in .ivb-it,.ivb-in .ivb-mono,.ivb-in .ivb-sub,.ivb-in .ivb-cta,.ivb-in .ivb-out,.ivb-in .ivb-mk,.ivb-in .ivb-b,.ivb-in .ivb-score{opacity:1;transform:none}
.ivb-in .ivb-cat{opacity:1;transform:translate3d(0,calc(var(--ivp,0)*60px),0) rotate(8deg)}
.ivb-in .ivb-p{transition-delay:.05s}.ivb-in .ivb-it{transition-delay:.18s}.ivb-in .ivb-out{transition-delay:.3s}.ivb-in .ivb-mk{transition-delay:.42s}.ivb-in .ivb-sub{transition-delay:.4s}.ivb-in .ivb-cta{transition-delay:.55s}
.ivb-in .ivb-b1{transition-delay:.35s}.ivb-in .ivb-b2{transition-delay:.65s}.ivb-in .ivb-b3{transition-delay:.95s}.ivb-in .ivb-score{transition-delay:1.25s}.ivb-in .ivb-cat{transition-delay:.2s}
`;
