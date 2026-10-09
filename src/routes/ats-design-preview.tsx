import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, FileText, TriangleAlert, Upload, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/ats-design-preview")({
  head: () => ({
    meta: [
      { title: "ATS score design preview | GotaOfferr" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AtsDesignPreview,
});

type Fix = { tag: "AUTO-FIXED" | "NEEDS YOU" | "YOUR CALL"; bad: string; fix: string };
type Sample = {
  score: number;
  meme: string[];
  verdict: string;
  parts: [string, number, number][];
  fixes: Fix[];
};

const SAMPLES: Record<string, Sample> = {
  "38": {
    score: 38,
    meme: ["The robot", "fell asleep."],
    verdict: "Tables and two columns. The parser got lost on line 4.",
    parts: [["Layout", 6, 20], ["Headings", 8, 15], ["Contact", 5, 10], ["Dates", 6, 15], ["Bullets", 6, 20], ["Keywords", 7, 20]],
    fixes: [
      { tag: "NEEDS YOU", bad: "Your experience sits inside a table", fix: "Copy it out as plain lines. Tables get read cell by cell, out of order." },
      { tag: "NEEDS YOU", bad: "Two columns found", fix: "Move the sidebar under Experience. One column reads top to bottom." },
      { tag: "AUTO-FIXED", bad: "Heading \"My Journey\"", fix: "Renamed to \"Experience\" so the robot knows where jobs start." },
      { tag: "YOUR CALL", bad: "Missing: SQL, forecasting, stakeholder reporting", fix: "Add them only if they are true. We never add skills for you." },
    ],
  },
  "72": {
    score: 72,
    meme: ["The robot can read it.", "Barely."],
    verdict: "Two things to fix and you are in the clear.",
    parts: [["Layout", 12, 20], ["Headings", 15, 15], ["Contact", 10, 10], ["Dates", 8, 15], ["Bullets", 14, 20], ["Keywords", 13, 20]],
    fixes: [
      { tag: "NEEDS YOU", bad: "Two columns found", fix: "Move the skills sidebar under Experience. One column reads in order." },
      { tag: "AUTO-FIXED", bad: "Heading \"My Journey\"", fix: "Renamed to \"Experience\". Your words stay untouched." },
      { tag: "NEEDS YOU", bad: "Dates like \"2021\" have no month", fix: "Write Mar 2021 - Jun 2023. Parsers drop bare years." },
      { tag: "YOUR CALL", bad: "Missing: stakeholder management, SQL", fix: "Add them only if they are true. We never add skills for you." },
    ],
  },
  "94": {
    score: 94,
    meme: ["Robot approved.", "Go apply."],
    verdict: "Clean. One small thing left.",
    parts: [["Layout", 20, 20], ["Headings", 15, 15], ["Contact", 10, 10], ["Dates", 14, 15], ["Bullets", 19, 20], ["Keywords", 16, 20]],
    fixes: [
      { tag: "NEEDS YOU", bad: "One date has no month", fix: "Write Jun 2022 instead of 2022." },
      { tag: "YOUR CALL", bad: "Missing: Tableau", fix: "Add it only if you have used it." },
    ],
  },
};

const STEPS = ["Reading the text", "Counting columns", "Checking headings", "Hunting dates", "Matching keywords"];

function useReveal() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-ak]"));
    if (typeof IntersectionObserver === "undefined") {
      els.forEach((e) => e.classList.add("ak-in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ak-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return ref;
}

function AtsDesignPreview() {
  const root = useReveal();
  const [key, setKey] = useState("72");
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<"idle" | "scan" | "done">("done");
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(0);
  const [file, setFile] = useState("");
  const [over, setOver] = useState(false);
  const resRef = useRef<HTMLDivElement | null>(null);
  const s = SAMPLES[key];

  useEffect(() => {
    if (phase !== "done") return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setShown(Math.round(s.score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setShown(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [s.score, run, phase]);

  useEffect(() => {
    if (phase !== "scan") return;
    setStep(0);
    const iv = window.setInterval(() => setStep((n) => (n + 1) % STEPS.length), 340);
    const to = window.setTimeout(() => {
      setPhase("done");
      setRun((n) => n + 1);
      resRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1850);
    return () => {
      window.clearInterval(iv);
      window.clearTimeout(to);
    };
  }, [phase]);

  const C = 2 * Math.PI * 54;
  const tone = s.score >= 85 ? "good" : s.score >= 60 ? "mid" : "bad";

  return (
    <main ref={root} className="ak">
      <style>{AK_CSS}</style>

      {/* HERO */}
      <section className="ak-hero">
        <div className="ak-wrap ak-hero-grid">
          <div>
            <span className="ak-mono ak-rise" style={{ ["--d" as string]: "0s" }}>( ats score, no ai, 20 seconds )</span>
            <h1 className="ak-h1" aria-label="The robot reads your resume first.">
              <span className="ak-ln ak-rise" style={{ ["--d" as string]: ".08s" }}>The <mark>robot</mark></span>
              <span className="ak-ln ak-rise" style={{ ["--d" as string]: ".2s" }}>reads your</span>
              <span className="ak-ln ak-out ak-rise" style={{ ["--d" as string]: ".32s" }}>resume first.</span>
            </h1>
            <p className="ak-sub ak-rise" style={{ ["--d" as string]: ".5s" }}>
              Most resumes die in software before a person sees them. Drop yours in, see what the robot sees, fix it before you apply.
            </p>
            <div className="ak-cta ak-rise" style={{ ["--d" as string]: ".65s" }}>
              <a href="#check" className="ak-btn">Check my resume <ArrowRight className="size-4" /></a>
            </div>
          </div>

          <div className="ak-paper-wrap" aria-hidden>
            <div className="ak-paper">
              <i className="ak-pl w60" /><i className="ak-pl w35 thin" />
              <div className="ak-cols"><div><i className="ak-pl w90" /><i className="ak-pl w70" /><i className="ak-pl w80" /><i className="ak-pl w50" /></div><div><i className="ak-pl w80" /><i className="ak-pl w60" /><i className="ak-pl w90" /></div></div>
              <i className="ak-pl w45 head" /><i className="ak-pl w95" /><i className="ak-pl w85" /><i className="ak-pl w75" /><i className="ak-pl w90" />
              <i className="ak-beam" />
            </div>
            <span className="ak-pin p1"><Check className="size-3.5" /> contact found</span>
            <span className="ak-pin p2 bad"><TriangleAlert className="size-3.5" /> 2 columns</span>
            <span className="ak-pin p3"><Check className="size-3.5" /> headings ok</span>
            <span className="ak-pin p4 bad"><TriangleAlert className="size-3.5" /> date, no month</span>
          </div>
        </div>
      </section>

      <div aria-hidden className="ak-mq"><div className="ak-mq-in">{[0, 1].map((n) => (<span key={n}>SCORE 0-100 <b>*</b> FIX IN ONE CLICK <b>*</b> NO AI, NO GUESSING <b>*</b> NO FAKE SKILLS <b>*</b> SCORE 0-100 <b>*</b> FIX IN ONE CLICK <b>*</b> NO AI, NO GUESSING <b>*</b> NO FAKE SKILLS <b>*</b> </span>))}</div></div>

      {/* CHECKER */}
      <section id="check" className="ak-wrap ak-check">
        <h2 data-ak className="ak-rv ak-h2">Drop it. <span>Paste the job.</span> Go.</h2>
        <div className="ak-stage">
        <div data-ak className="ak-rv ak-panel">
          <label
            className={`ak-drop ${over ? "over" : ""} ${phase === "scan" ? "scan" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f.name); }}
          >
            <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} />
            <i className="ak-c c1" /><i className="ak-c c2" /><i className="ak-c c3" /><i className="ak-c c4" />
            <i className="ak-dbeam" />
            <span className="ak-dic">{file ? <FileText className="size-8" /> : <Upload className="size-8" />}</span>
            <span className="ak-dt">{phase === "scan" ? STEPS[step] + "..." : file || "Drop your resume here"}</span>
            <span className="ak-dh">{file ? "Click to change" : "PDF or DOC. Or click to browse."}</span>
          </label>

          <div className="ak-fields">
            <div className="ak-two">
              <label><span>Company</span><input placeholder="Acme Corp" /></label>
              <label><span>Job position</span><input placeholder="Product Marketing Manager" /></label>
            </div>
            <label className="ak-grow"><span>Job description</span><textarea placeholder="Paste the full job description. The robot matches keywords against it." /></label>
          </div>

          <button type="button" className="ak-btn ak-go" disabled={phase === "scan"} onClick={() => setPhase("scan")}>
            {phase === "scan" ? "Scanning..." : <>Check my resume <ArrowRight className="size-4" /></>}
          </button>
        </div>

        {/* RESULT */}
        <div ref={resRef} className={`ak-res ${phase === "scan" ? "wait" : ""}`}>
          <div className="ak-res-top">
            <span className="ak-tag">SAMPLE RESULT</span>
            <div className="ak-tabs" role="tablist" aria-label="Try a sample score">
              {Object.keys(SAMPLES).map((k) => (
                <button key={k} type="button" role="tab" aria-selected={k === key} className={k === key ? "on" : ""} onClick={() => { setKey(k); setRun((n) => n + 1); }}>{k}</button>
              ))}
            </div>
          </div>

          <h3 key={key + run} className="ak-meme">
            <span>{s.meme[0]}</span>
            <span className="y">{s.meme[1]}</span>
          </h3>

          <div className="ak-res-grid">
            <div className={`ak-gauge ${tone}`}>
              <svg viewBox="0 0 120 120" aria-hidden>
                <circle cx="60" cy="60" r="54" className="bg" />
                <circle key={key + run} cx="60" cy="60" r="54" className="fg" style={{ strokeDasharray: C, ["--to" as string]: C * (1 - s.score / 100) }} />
              </svg>
              <div className="ak-num"><b>{shown}</b><span>/100</span></div>
              <p>{s.verdict}</p>
            </div>

            <div className="ak-bars">
              {s.parts.map(([n, v, m], i) => (
                <div key={n + key + run} className="ak-bar" style={{ ["--i" as string]: i }}>
                  <span>{n}</span>
                  <div className="tr"><i style={{ ["--w" as string]: `${(v / m) * 100}%` }} className={v / m >= 0.8 ? "g" : v / m >= 0.55 ? "m" : "b"} /></div>
                  <em>{v}/{m}</em>
                </div>
              ))}
            </div>
          </div>

          <div className="ak-fixes">
            <h4>{s.fixes.length} things to fix</h4>
            {s.fixes.map((f, i) => (
              <div key={f.bad + key + run} className="ak-fix" style={{ ["--i" as string]: i }}>
                <span className={`ak-ft ${f.tag === "AUTO-FIXED" ? "a" : f.tag === "YOUR CALL" ? "c" : "n"}`}>{f.tag === "AUTO-FIXED" ? <Wrench className="size-3" /> : null}{f.tag}</span>
                <div><b>{f.bad}</b><p>{f.fix}</p></div>
              </div>
            ))}
          </div>

          <div className="ak-fn">
            <span>Facts never change. No skill or job is ever added for you.</span>
            <Link to="/tailor" className="ak-btn sm">Fix it in 15 seconds <ArrowRight className="size-4" /></Link>
          </div>
        </div>
        </div>
      </section>

      {/* HOW */}
      <section className="ak-wrap ak-how">
        <h2 data-ak className="ak-rv ak-h2">What the robot <span>looks at</span></h2>
        {[
          ["Can it read you?", "One column. Real text, not a picture. No tables, no text boxes."],
          ["Can it find you?", "Standard headings. A contact block. Dates with months."],
          ["Does it want you?", "Your bullets. Your numbers. Your words against the job description."],
        ].map(([t, b], k) => (
          <div key={t} data-ak className="ak-rv ak-row" style={{ ["--k" as string]: k }}>
            <span className="n">0{k + 1}</span>
            <h3 className={k === 1 ? "out" : k === 2 ? "yel" : ""}>{t}</h3>
            <p>{b}</p>
          </div>
        ))}
      </section>

      <section data-ak className="ak-rv ak-end">
        <div className="ak-wrap">
          <h2>Score first.<br /><span>Apply second.</span></h2>
          <a href="#check" className="ak-btn">Check my resume <ArrowRight className="size-4" /></a>
        </div>
      </section>
    </main>
  );
}

const AK_CSS = `
@font-face{font-family:"HPHand";src:url("/fonts/caveat-brush.woff2") format("woff2");font-display:swap}
.ak{--y:#ffd600;--ink:#0a0a0a;--cream:#f6f1d6;background:#000;color:var(--cream);overflow:hidden}
.ak *{box-sizing:border-box}
.ak-wrap{max-width:1180px;margin:0 auto;padding:0 20px}
.ak-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;color:var(--y);opacity:.9}
.ak-hand{font-family:"HPHand","Caveat Brush",cursive;font-size:1.5rem;color:var(--y);transform:rotate(-4deg);display:inline-block}
.ak-rise{opacity:0;transform:translateY(.7em);filter:blur(8px);animation:ak-rise .8s cubic-bezier(.2,.8,.2,1) var(--d,0s) forwards}
@keyframes ak-rise{to{opacity:1;transform:none;filter:none}}
.ak-rv{opacity:0;transform:translateY(40px);transition:opacity .7s cubic-bezier(.2,.8,.2,1),transform .7s cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--k,0)*.12s)}
.ak-rv.ak-in{opacity:1;transform:none}

.ak-hero{position:relative;padding:56px 0 40px;background:radial-gradient(60% 50% at 78% 30%,rgba(255,214,0,.16),transparent 70%)}
.ak-hero:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:56px 56px;mask-image:linear-gradient(#000 30%,transparent);animation:ak-grid 12s linear infinite}
@keyframes ak-grid{to{background-position:0 56px}}
.ak-hero-grid{position:relative;display:grid;grid-template-columns:1.15fr .85fr;gap:32px;align-items:center}
.ak-h1{margin:18px 0 0;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:.92;letter-spacing:-.015em;font-size:clamp(3rem,8.4vw,7rem)}
.ak-ln{display:block}
.ak-h1 mark{background:var(--y);color:#000;padding:0 .12em;display:inline-block;transform:rotate(-1.5deg);animation:ak-wob 4s ease-in-out infinite}
@keyframes ak-wob{50%{transform:rotate(1.2deg) translateY(-3px)}}
.ak-out{color:transparent;-webkit-text-stroke:2px var(--cream)}
.ak-sub{max-width:34rem;margin-top:22px;font-size:1.12rem;line-height:1.5;color:rgba(246,241,214,.72)}
.ak-cta{display:flex;align-items:center;gap:18px;margin-top:28px;flex-wrap:wrap}
.ak-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:var(--y);color:#000;font-weight:700;border-radius:999px;padding:15px 28px;font-size:1rem;border:0;cursor:pointer;text-decoration:none;box-shadow:0 0 0 0 rgba(255,214,0,.5);transition:transform .2s,box-shadow .3s;animation:ak-ring 2.6s ease-out infinite}
.ak-btn:hover{transform:translateY(-3px) scale(1.03)}
.ak-btn:disabled{opacity:.7;cursor:wait;animation:none}
.ak-btn.sm{padding:11px 20px;font-size:.92rem;animation:none}
@keyframes ak-ring{0%{box-shadow:0 0 0 0 rgba(255,214,0,.45)}70%,100%{box-shadow:0 0 0 18px rgba(255,214,0,0)}}

.ak-paper-wrap{position:relative;min-height:380px;display:flex;align-items:center;justify-content:center}
.ak-paper{position:relative;width:270px;aspect-ratio:.72;background:#f6f1d6;border-radius:6px;padding:26px 22px;transform:rotate(5deg);box-shadow:0 30px 80px rgba(255,214,0,.18),0 0 0 1px rgba(255,255,255,.2);animation:ak-flt 6s ease-in-out infinite;overflow:hidden}
@keyframes ak-flt{50%{transform:rotate(2.5deg) translateY(-14px)}}
.ak-pl{display:block;height:8px;border-radius:4px;background:#161616;margin:0 0 9px;opacity:.85}
.ak-pl.thin{height:5px;opacity:.4}.ak-pl.head{height:11px;margin-top:14px;background:#000}
.w35{width:35%}.w45{width:45%}.w50{width:50%}.w60{width:60%}.w70{width:70%}.w75{width:75%}.w80{width:80%}.w85{width:85%}.w90{width:90%}.w95{width:95%}
.ak-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.ak-beam{position:absolute;left:0;right:0;height:46px;top:-46px;background:linear-gradient(transparent,rgba(255,214,0,.55),transparent);border-bottom:2px solid var(--y);animation:ak-scan 3.2s ease-in-out infinite}
@keyframes ak-scan{0%{top:-46px}100%{top:100%}}
.ak-pin{position:absolute;display:inline-flex;align-items:center;gap:6px;background:#000;border:1px solid rgba(255,255,255,.3);color:var(--cream);font-size:.74rem;font-weight:700;text-transform:uppercase;padding:7px 11px;border-radius:999px;white-space:nowrap;animation:ak-pop 6.4s ease-in-out infinite;opacity:0}
.ak-pin.bad{background:var(--y);color:#000;border-color:var(--y)}
.ak-pin.p1{left:0;top:16%;animation-delay:.6s}.ak-pin.p2{right:-2%;top:30%;animation-delay:1.6s}.ak-pin.p3{left:2%;bottom:30%;animation-delay:2.6s}.ak-pin.p4{right:2%;bottom:14%;animation-delay:3.6s}
@keyframes ak-pop{0%{opacity:0;transform:scale(.6) translateY(10px)}8%,70%{opacity:1;transform:none}85%,100%{opacity:0;transform:translateY(-8px)}}

.ak-mq{border-block:1px solid rgba(255,255,255,.15);background:var(--y);color:#000;overflow:hidden;white-space:nowrap;transform:rotate(-1deg);margin:26px -2% 0}
.ak-mq-in{display:inline-flex;animation:ak-mq 26s linear infinite}
.ak-mq-in span{font-family:var(--font-display,inherit);font-weight:800;font-size:1.25rem;padding:13px 0;letter-spacing:.02em}
.ak-mq-in b{margin:0 .7em}
@keyframes ak-mq{to{transform:translateX(-50%)}}

.ak-check{padding-top:90px}
.ak-h2{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:.98;font-size:clamp(2.2rem,5.4vw,4.2rem);margin:0 0 34px}
.ak-h2 span{color:var(--y)}
.ak-panel{display:grid;grid-template-columns:1fr 1fr;gap:22px;border:1px solid rgba(255,214,0,.35);border-radius:22px;padding:22px;background:linear-gradient(160deg,rgba(255,214,0,.07),rgba(255,255,255,.015))}
.ak-drop{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;min-height:300px;border:2px dashed rgba(255,214,0,.55);border-radius:16px;cursor:pointer;overflow:hidden;transition:background .25s,transform .25s}
.ak-drop:hover,.ak-drop.over{background:rgba(255,214,0,.1);transform:scale(1.01)}
.ak-c{position:absolute;width:22px;height:22px;border:3px solid var(--y)}
.ak-c.c1{left:10px;top:10px;border-right:0;border-bottom:0}.ak-c.c2{right:10px;top:10px;border-left:0;border-bottom:0}.ak-c.c3{left:10px;bottom:10px;border-right:0;border-top:0}.ak-c.c4{right:10px;bottom:10px;border-left:0;border-top:0}
.ak-dic{width:68px;height:68px;border-radius:50%;background:var(--y);color:#000;display:grid;place-items:center;animation:ak-bob 2.4s ease-in-out infinite}
@keyframes ak-bob{50%{transform:translateY(-8px)}}
.ak-dt{font-family:var(--font-display,inherit);font-weight:700;font-size:1.35rem;text-transform:uppercase;padding:0 16px;word-break:break-word}
.ak-dh{font-size:.88rem;color:rgba(246,241,214,.6)}
.ak-dbeam{position:absolute;left:0;right:0;top:0;height:3px;background:var(--y);box-shadow:0 0 24px 6px rgba(255,214,0,.7);opacity:0}
.ak-drop.scan .ak-dbeam{opacity:1;animation:ak-dscan .9s ease-in-out infinite alternate}
@keyframes ak-dscan{to{top:calc(100% - 3px)}}
.ak-fields{display:flex;flex-direction:column;gap:14px;min-height:300px}
.ak-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ak-fields label{display:flex;flex-direction:column;gap:6px}
.ak-fields label span{font-family:ui-monospace,Menlo,monospace;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--y)}
.ak-fields input,.ak-fields textarea{width:100%;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.2);border-radius:12px;color:var(--cream);padding:13px 14px;font:inherit;font-size:.95rem;outline:none;transition:border-color .2s,box-shadow .2s}
.ak-fields input:focus,.ak-fields textarea:focus{border-color:var(--y);box-shadow:0 0 0 3px rgba(255,214,0,.2)}
.ak-fields input::placeholder,.ak-fields textarea::placeholder{color:rgba(246,241,214,.35)}
.ak-grow{flex:1}.ak-grow textarea{flex:1;min-height:150px;resize:none}
.ak-go{grid-column:1/-1;font-size:1.1rem;padding:18px}

.ak-res{margin-top:70px;border-radius:24px;background:var(--cream);color:#0a0a0a;padding:30px;position:relative;overflow:hidden;transition:opacity .3s,filter .3s;scroll-margin-top:90px}
.ak-res.wait{opacity:.35;filter:blur(3px)}
.ak-res-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.ak-tag{background:#000;color:var(--y);font-family:ui-monospace,Menlo,monospace;font-size:.72rem;font-weight:700;padding:6px 12px;border-radius:999px;letter-spacing:.06em}
.ak-tabs{display:flex;gap:6px;background:rgba(0,0,0,.1);padding:4px;border-radius:999px}
.ak-tabs button{border:0;background:transparent;font-weight:800;padding:7px 18px;border-radius:999px;cursor:pointer;font-size:.95rem;transition:background .2s,color .2s}
.ak-tabs button.on{background:#000;color:var(--y)}
.ak-meme{margin:22px 0 6px;font-family:var(--font-display,inherit);font-weight:800;text-transform:uppercase;line-height:.95;font-size:clamp(2.1rem,5.8vw,4.6rem);letter-spacing:-.02em;text-shadow:3px 3px 0 var(--y)}
.ak-meme span{display:block;animation:ak-slam .6s cubic-bezier(.2,1.4,.4,1) both}
.ak-meme span.y{background:#000;color:var(--y);display:inline-block;padding:0 .14em;text-shadow:none;transform:rotate(-1.2deg);animation-delay:.2s}
@keyframes ak-slam{from{opacity:0;transform:scale(1.5) translateY(-20px)}}
.ak-res-grid{display:grid;grid-template-columns:230px 1fr;gap:34px;align-items:center;margin-top:20px}
.ak-gauge{text-align:center;position:relative}
.ak-gauge svg{width:210px;height:210px;transform:rotate(-90deg)}
.ak-gauge circle{fill:none;stroke-width:11}
.ak-gauge .bg{stroke:rgba(0,0,0,.12)}
.ak-gauge .fg{stroke:#000;stroke-linecap:round;animation:ak-dash 1.1s cubic-bezier(.2,.8,.2,1) both}
.ak-gauge.good .fg{stroke:#0a7a2f}.ak-gauge.bad .fg{stroke:#c4230f}
@keyframes ak-dash{from{stroke-dashoffset:339.3}to{stroke-dashoffset:var(--to)}}
.ak-num{position:absolute;left:0;right:0;top:50px;height:110px;display:flex;align-items:baseline;justify-content:center;padding-top:22px}
.ak-num b{font-family:var(--font-display,inherit);font-size:4.4rem;line-height:1;font-weight:800}
.ak-num span{font-weight:700;opacity:.5;margin-left:2px}
.ak-gauge p{margin:6px 0 0;font-weight:600;font-size:.95rem}
.ak-bars{display:flex;flex-direction:column;gap:12px}
.ak-bar{display:grid;grid-template-columns:86px 1fr 54px;align-items:center;gap:12px;font-weight:700;font-size:.95rem;opacity:0;animation:ak-fade .5s ease both;animation-delay:calc(var(--i)*.09s + .3s)}
.ak-bar .tr{height:14px;background:rgba(0,0,0,.12);border-radius:99px;overflow:hidden}
.ak-bar i{display:block;height:100%;width:var(--w);border-radius:99px;transform-origin:left;animation:ak-grow 1s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i)*.09s + .35s)}
.ak-bar i.g{background:#0a7a2f}.ak-bar i.m{background:#e0a800}.ak-bar i.b{background:#c4230f}
.ak-bar em{font-style:normal;text-align:right;font-variant-numeric:tabular-nums}
@keyframes ak-grow{from{transform:scaleX(0)}}
@keyframes ak-fade{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
.ak-fixes{margin-top:30px;border-top:2px solid #000;padding-top:18px}
.ak-fixes h4{font-family:var(--font-display,inherit);text-transform:uppercase;font-size:1.3rem;margin:0 0 12px}
.ak-fix{display:grid;grid-template-columns:112px 1fr;gap:14px;align-items:start;padding:12px 0;border-bottom:1px dashed rgba(0,0,0,.25);opacity:0;animation:ak-fade .5s ease both;animation-delay:calc(var(--i)*.12s + .8s)}
.ak-fix b{display:block;font-size:1rem}.ak-fix p{margin:3px 0 0;font-size:.93rem;color:rgba(0,0,0,.72)}
.ak-ft{display:inline-flex;align-items:center;gap:5px;justify-content:center;font-size:.68rem;font-weight:800;letter-spacing:.05em;padding:6px 8px;border-radius:99px;white-space:nowrap}
.ak-ft.a{background:#0a7a2f;color:#fff}.ak-ft.n{background:#000;color:var(--y)}.ak-ft.c{background:transparent;border:2px solid #000}
.ak-fn{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-top:22px;font-weight:600;font-size:.92rem}
.ak-fn .ak-btn{background:#000;color:var(--y)}

.ak-how{padding-top:110px}
.ak-row{position:relative;display:grid;grid-template-columns:70px 1.2fr 1fr;gap:20px;align-items:center;padding:30px 0;border-top:1px solid rgba(255,255,255,.2);transition:padding-left .3s,background .3s}
.ak-row:hover{padding-left:16px;background:linear-gradient(90deg,rgba(255,214,0,.1),transparent)}
.ak-row .n{font-family:ui-monospace,Menlo,monospace;color:var(--y)}
.ak-row h3{margin:0;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;font-size:clamp(1.8rem,4.4vw,3.6rem);line-height:1}
.ak-row h3.out{color:transparent;-webkit-text-stroke:1.5px var(--cream)}.ak-row h3.yel{color:var(--y)}
.ak-row p{margin:0;color:rgba(246,241,214,.7);font-size:1.02rem;line-height:1.5}
.ak-end{padding:110px 0 120px;text-align:center}
.ak-end h2{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;font-size:clamp(2.8rem,8vw,6.6rem);line-height:.95;margin:0 0 30px}
.ak-end h2 span{color:var(--y)}

@media(max-width:820px){
.ak-wrap{padding:0 16px}
.ak-hero{padding:34px 0 20px}
.ak-hero-grid{grid-template-columns:1fr;gap:6px}
.ak-h1{font-size:clamp(2.7rem,14.5vw,4.4rem)}
.ak-out{-webkit-text-stroke:1.5px var(--cream)}
.ak-sub{font-size:1rem}
.ak-paper-wrap{min-height:300px;margin-top:10px}.ak-paper{width:210px}
.ak-pin{font-size:.66rem;padding:5px 9px}.ak-pin.p2{right:0}.ak-pin.p4{right:0}
.ak-mq-in span{font-size:1rem;padding:10px 0}
.ak-check{padding-top:60px}
.ak-panel{grid-template-columns:1fr;padding:14px;gap:14px}
.ak-drop{min-height:200px}
.ak-fields{min-height:0}.ak-two{grid-template-columns:1fr}
.ak-res{margin-top:44px;padding:18px;border-radius:18px}
.ak-res-grid{grid-template-columns:1fr;gap:18px}
.ak-gauge svg{width:180px;height:180px;display:block;margin:0 auto}.ak-num{top:36px;left:50%;right:auto;width:180px;transform:translateX(-50%)}.ak-num b{font-size:3.6rem}
.ak-bar{grid-template-columns:70px 1fr 48px;font-size:.88rem}
.ak-fix{grid-template-columns:1fr;gap:6px}.ak-ft{justify-self:start;padding:5px 10px}
.ak-fn{flex-direction:column;align-items:stretch;text-align:center}.ak-fn .ak-btn{width:100%}
.ak-how{padding-top:70px}
.ak-row{grid-template-columns:44px 1fr;gap:6px 12px;padding:22px 0}.ak-row p{grid-column:2}
.ak-end{padding:70px 0 90px}
}

@media(min-width:821px){
.ak-wrap{max-width:1560px;padding:0 48px}
.ak-hero{padding:72px 0 56px}
.ak-hero-grid{grid-template-columns:1.1fr .9fr}
.ak-h1{font-size:clamp(4rem,7.6vw,8.4rem)}
.ak-sub{max-width:40rem;font-size:1.3rem}
.ak-paper-wrap{min-height:540px}.ak-paper{width:370px}
.ak-pin{font-size:.86rem;padding:9px 14px}
.ak-mq-in span{font-size:1.5rem;padding:16px 0}
.ak-h2{font-size:clamp(2.6rem,5vw,5rem)}
.ak-panel{padding:36px;gap:32px;border-radius:30px;box-shadow:0 0 90px rgba(255,214,0,.12)}
.ak-drop{min-height:500px;border-radius:20px}
.ak-fields{min-height:500px;gap:18px}
.ak-fields label span{font-size:.8rem}
.ak-fields input,.ak-fields textarea{padding:18px 20px;font-size:1.1rem;border-radius:14px}
.ak-grow textarea{min-height:250px}
.ak-dic{width:96px;height:96px}.ak-dt{font-size:2rem}.ak-dh{font-size:1rem}
.ak-go{font-size:1.45rem;padding:26px}
.ak-stage{display:grid;grid-template-columns:minmax(0,1.9fr) minmax(0,1fr);gap:28px;align-items:start}
.ak-res{margin-top:0;padding:22px;border-radius:20px;position:sticky;top:84px}
.ak-meme{font-size:clamp(1.5rem,2vw,2.1rem);margin:14px 0 4px;text-shadow:2px 2px 0 var(--y)}
.ak-res-grid{grid-template-columns:1fr;gap:12px;margin-top:10px}
.ak-gauge svg{width:130px;height:130px}.ak-num{top:20px;height:90px;padding-top:14px}.ak-num b{font-size:2.8rem}.ak-gauge p{font-size:.85rem}
.ak-bars{gap:8px}.ak-bar{grid-template-columns:70px 1fr 46px;font-size:.85rem;gap:10px}.ak-bar .tr{height:10px}
.ak-fixes{margin-top:16px;padding-top:12px}.ak-fixes h4{font-size:1rem;margin-bottom:6px}
.ak-fix{grid-template-columns:1fr;gap:4px;padding:8px 0}.ak-fix b{font-size:.9rem}.ak-fix p{font-size:.82rem}
.ak-ft{justify-self:start;font-size:.62rem;padding:4px 8px}
.ak-fn{flex-direction:column;align-items:stretch;text-align:center;gap:10px;font-size:.8rem;margin-top:14px}.ak-fn .ak-btn{width:100%}
.ak-tabs button{padding:5px 14px;font-size:.85rem}
.ak-row h3{font-size:clamp(2.4rem,4.6vw,4.4rem)}
.ak-row{padding:38px 0}
}

@media(max-width:820px){
.ak-res{padding:14px}
.ak-res-top{gap:8px}
.ak-meme{font-size:1.6rem;margin:12px 0 2px;text-shadow:2px 2px 0 var(--y)}
.ak-res-grid{grid-template-columns:104px 1fr;gap:14px;margin-top:8px}
.ak-gauge svg{width:104px;height:104px}
.ak-num{top:16px;width:104px;height:72px;padding-top:10px}.ak-num b{font-size:2rem}.ak-num span{font-size:.7rem}
.ak-gauge p{display:none}
.ak-bars{gap:6px}.ak-bar{grid-template-columns:60px 1fr 38px;gap:8px;font-size:.76rem}.ak-bar .tr{height:8px}
.ak-fixes{margin-top:12px;padding-top:10px}.ak-fixes h4{font-size:.95rem;margin-bottom:2px}
.ak-fix{grid-template-columns:86px 1fr;gap:10px;padding:8px 0}
.ak-fix b{font-size:.85rem}.ak-fix p{font-size:.76rem;margin-top:1px}
.ak-ft{font-size:.58rem;padding:4px 6px;justify-self:stretch}
.ak-fn{margin-top:12px;gap:8px}.ak-fn>span{display:none}
}
@media(prefers-reduced-motion:reduce){.ak *{animation-duration:.01s!important;animation-iteration-count:1!important;transition-duration:.01s!important}.ak-rv{opacity:1;transform:none}}
`;
