import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mic, MicOff, Upload, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { useSession } from "@/hooks/useSession";
import { readResumeFile } from "@/lib/interview-read";
import { finishInterview, startInterview } from "@/lib/interview.functions";

export const Route = createFileRoute("/ai-interview")({
  head: () => ({
    meta: [
      { title: "AI Interview: Practice With Coco | GotaOfferr" },
      { name: "description", content: "Practice a real interview with Coco, your AI interviewer. 10 short questions from your resume and the job description. Answer by voice or text. Nothing is stored." },
      { property: "og:title", content: "AI Interview: Practice With Coco | GotaOfferr" },
      { property: "og:description", content: "Practice a real interview with Coco, your AI interviewer. 10 short questions from your resume and the job description. Answer by voice or text. Nothing is stored." },
      { property: "og:url", content: "https://gotaofferr.com/ai-interview" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/ai-interview" }],
  }),
  component: AiInterview,
});

const ANSWER_SECONDS = 120;
const TOTAL = 10;

type Qa = { q: string; a: string };
type Feedback = {
  overall: number;
  parts: { relevance: number; clarity: number; examples: number; jdMatch: number };
  summary: string;
  strengths: string[];
  fixes: string[];
  perQuestion: { n: number; tip: string }[];
};
type Stage = "setup" | "loading" | "room" | "wrapping" | "feedback";

/* ---------- Coco: sprite of the original animation, 8 frames a second ---------- */
const FW = 168;
const FH = 148;
const COLS = 8;
const CLIPS: Record<string, { from: number; to: number; loop: boolean; bounce?: boolean }> = {
  idle: { from: 0, to: 8, loop: true, bounce: true },
  talk: { from: 9, to: 15, loop: true, bounce: true },
  wave: { from: 16, to: 18, loop: true, bounce: true },
  lick: { from: 19, to: 31, loop: false },
};
type ClipName = keyof typeof CLIPS;

function Coco({ clip, fx, size = 1.5 }: { clip: ClipName; fx?: "jump" | "spin" | ""; size?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [frame, setFrame] = useState(0);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(!!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches));
  }, []);
  useEffect(() => {
    if (reduce) { setFrame(0); return; }
    const c = CLIPS[clip];
    let i = c.from;
    let dir = 1;
    let visible = true;
    setFrame(i);
    const io = typeof IntersectionObserver !== "undefined" && ref.current
      ? new IntersectionObserver((es) => { visible = es[0]?.isIntersecting ?? true; })
      : null;
    if (io && ref.current) io.observe(ref.current);
    const t = window.setInterval(() => {
      if (!visible || document.hidden) return;
      i += dir;
      if (i > c.to) {
        if (c.bounce) { dir = -1; i = c.to - 1; } else if (c.loop) i = c.from; else i = c.to;
      } else if (i < c.from) { dir = 1; i = c.from + 1; }
      setFrame(i);
    }, 125);
    return () => { window.clearInterval(t); io?.disconnect(); };
  }, [clip, reduce]);
  const col = frame % COLS;
  const row = Math.floor(frame / COLS);
  return (
    <div ref={ref} className={`ai-coco ${fx ? "fx-" + fx : ""} ${clip === "talk" ? "talking" : ""}`} style={{ width: FW * size, height: FH * size }} role="img" aria-label="Coco, a yellow cat who is your interviewer">
      <div style={{ width: FW, height: FH, transform: `scale(${size})`, transformOrigin: "top left", backgroundImage: "url(/coco-sprite.webp)", backgroundSize: `${FW * COLS}px ${FH * 4}px`, backgroundPosition: `-${col * FW}px -${row * FH}px` }} />
    </div>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

type SR = { start: () => void; stop: () => void; abort: () => void; onresult: ((e: any) => void) | null; onend: (() => void) | null; onerror: ((e: any) => void) | null; lang: string; continuous: boolean; interimResults: boolean };

function AiInterview() {
  const { user, loading } = useSession();
  const [cs, setCs] = useState(1.5);
  useEffect(() => { const f = () => setCs(window.innerWidth < 720 ? 0.9 : window.innerWidth >= 1200 ? 1.9 : 1.5); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  const startFn = useServerFn(startInterview);
  const finishFn = useServerFn(finishInterview);

  const [stage, setStage] = useState<Stage>("setup");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");
  const [fileName, setFileName] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [questions, setQuestions] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [left, setLeft] = useState(ANSWER_SECONDS);
  const [running, setRunning] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState(true);
  const [bubble, setBubble] = useState("");
  const [clip, setClip] = useState<ClipName>("idle");
  const [micBlocked, setMicBlocked] = useState(false);
  const [fx, setFx] = useState<"jump" | "spin" | "wander" | "">("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const recRef = useRef<SR | null>(null);
  const wantMicRef = useRef(false);
  const answersRef = useRef<string[]>([]);
  const answerRef = useRef("");
  answerRef.current = answer;
  const hintedRef = useRef(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const w = window as any;
    setVoiceOk(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  // Leaving mid-interview loses it (nothing is stored). Warn once.
  useEffect(() => {
    if (stage !== "room" && stage !== "wrapping") return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [stage]);

  const stopMic = useCallback(() => {
    wantMicRef.current = false;
    try { recRef.current?.stop(); } catch { /* ignore */ }
    setListening(false);
  }, []);

  const startRec = useCallback(() => {
    setMicBlocked(false);
    setErr("");
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) { setVoiceOk(false); return; }
    try { recRef.current?.abort(); } catch { /* ignore */ }
    const rec: SR = new Ctor();
    const nl = navigator.language || "en-US";
    rec.lang = /^en/i.test(nl) ? nl : "en-US";
    rec.continuous = true;
    rec.interimResults = false;
    let gotAny = false;
    let errored = false;
    const t0 = Date.now();
    rec.onstart = () => { if (recRef.current === rec) { setListening(true); setRunning(true); } };
    rec.onresult = (e: any) => {
      let add = "";
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) add += e.results[i][0].transcript + " ";
      if (add) { gotAny = true; setAnswer((a) => (a ? a.replace(/\s*$/, " ") : "") + add.trim()); }
    };
    rec.onerror = (ev: any) => {
      if (recRef.current !== rec) return;
      const code = String(ev?.error || "unknown");
      errored = true;
      setListening(false);
      if (code === "aborted") return;
      if (code === "not-allowed" || code === "service-not-allowed") { setErr(""); setMicBlocked(true); return; }
      const why: Record<string, string> = {
        "network": "Voice could not reach the browser's speech service. Check your internet, or that the browser allows its speech service, then try again. Or just type.",
        "no-speech": "I did not hear anything. Check that the right microphone is selected, then try again. Or just type.",
        "audio-capture": "No microphone was found. Plug one in or pick one in your browser settings, then try again. Or just type.",
        "language-not-supported": "This browser does not support voice in your language. Please type your answer.",
      };
      setMicBlocked(false);
      setErr((why[code] || "Voice stopped unexpectedly.") + " (code: " + code + ")");
    };
    rec.onend = () => {
      if (recRef.current !== rec) return;
      if (wantMicRef.current && !errored && Date.now() - t0 > 1500) {
        // Chrome ends a session after a pause. Keep listening until the user taps Stop.
        try { rec.start(); return; } catch { /* fall through */ }
      }
      setListening(false);
      if (!errored && !gotAny && Date.now() - t0 < 1500) {
        const mac = /Mac/i.test(navigator.platform || "") || /Macintosh/i.test(navigator.userAgent || "");
        setMicBlocked(false);
        setErr(mac
          ? "Voice stopped right away. On a Mac this is usually the system mic setting: open System Settings > Privacy & Security > Microphone, turn Chrome on, then quit Chrome fully (Cmd+Q) and open it again. Or just type. (code: ended-early)"
          : "Voice stopped right away. Check that your microphone is on and allowed for this browser, then try again. Or just type. (code: ended-early)");
      }
    };
    recRef.current = rec;
    wantMicRef.current = true;
    try { rec.start(); setErr(""); } catch (e: any) { setListening(false); setErr("Could not start the microphone (" + String(e?.name || "error") + "). Try again, or type."); }
  }, []);

  // Check the microphone itself first, so we can tell "no mic / blocked" apart from "speech service failed".
  const startMic = useCallback(() => {
    setErr("");
    setMicBlocked(false);
    const md = navigator.mediaDevices;
    if (!md || !md.getUserMedia) { startRec(); return; }
    md.getUserMedia({ audio: true }).then((st) => {
      st.getTracks().forEach((t) => t.stop());
      startRec();
    }).catch((e: any) => {
      const n = String(e?.name || "error");
      if (n === "NotAllowedError" || n === "SecurityError") setMicBlocked(true);
      else if (n === "NotFoundError" || n === "OverconstrainedError") setErr("No microphone was found. Plug one in or pick one in your browser settings. Or just type. (code: " + n + ")");
      else if (n === "NotReadableError" || n === "AbortError") setErr("The microphone is busy or not readable (another app may be using it). Close other apps using the mic, then try again. Or just type. (code: " + n + ")");
      else setErr("Could not open the microphone. Or just type. (code: " + n + ")");
    });
  }, [startRec]);

  // Coco keeps moving: every so often she wanders around the tile while you are not talking.
  useEffect(() => {
    if (stage !== "room" || listening) return;
    const id = window.setInterval(() => {
      setFx((f) => (f === "" ? "wander" : f));
      window.setTimeout(() => setFx((f) => (f === "wander" ? "" : f)), 4700);
    }, 13000);
    return () => window.clearInterval(id);
  }, [stage, listening]);

  // 2 minute answer timer. It starts when you start talking or typing.
  useEffect(() => {
    if (!running || stage !== "room") return;
    const t = window.setInterval(() => setLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [running, stage]);

  const goNext = useCallback((auto = false) => {
    stopMic();
    const finalA = answerRef.current.trim();
    const next = [...answersRef.current];
    next[idx] = finalA;
    answersRef.current = next;
    setAnswers(next);
    if (idx + 1 >= TOTAL) void wrap(next);
    if (idx + 1 < TOTAL) {
      setIdx(idx + 1);
      setAnswer("");
      setLeft(ANSWER_SECONDS);
      setRunning(false);
      hintedRef.current = false;
      setBubble(auto ? "Time. No worries, next one." : questions[idx + 1]);
      if (auto) window.setTimeout(() => setBubble(questions[idx + 1]), 1400);
      setClip("talk");
      window.setTimeout(() => setClip("idle"), 2200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, questions, stopMic]);

  useEffect(() => {
    if (stage !== "room") return;
    if (left === 20 && !hintedRef.current && running) {
      hintedRef.current = true;
      setBubble("20 seconds left. Finish your thought in a line or two.");
      setClip("lick");
      window.setTimeout(() => setClip("idle"), 2500);
    }
    if (left <= 0 && running) goNext(true);
  }, [left, running, stage, goNext]);
  const onNext = () => {
    if (!answerRef.current.trim()) { setErr("Write or say an answer first, or tap Skip this question."); return; }
    setErr("");
    goNext(false);
  };

  // A little life: Coco licks a paw now and then while you think.
  useEffect(() => {
    if (stage !== "room") return;
    const t = window.setInterval(() => {
      setClip((c) => {
        if (c !== "idle") return c;
        window.setTimeout(() => setClip("idle"), 2600);
        return "lick";
      });
    }, 16000);
    return () => window.clearInterval(t);
  }, [stage]);

  const pickFile = async (f: File | null) => {
    if (!f) return;
    setErr("");
    try {
      const text = await readResumeFile(f);
      if (text.trim().length < 80) throw new Error("We could not read enough text from that file. Try a text-based PDF or paste your resume.");
      setResume(text);
      setFileName(f.name);
    } catch (e) {
      setFileName("");
      setResume("");
      setErr(e instanceof Error ? e.message : "Could not read that file.");
    }
  };

  const begin = async () => {
    setErr("");
    if (!role.trim()) return setErr("Add the job role.");
    if (jd.trim().length < 40) return setErr("Paste the job description (a few lines at least).");
    if (resume.trim().length < 80) return setErr("Add your resume first (upload it or paste it).");
    setBusy(true);
    setStage("loading");
    try {
      const r = await startFn({ data: { company, role, jd, resume } });
      setQuestions(r.questions);
      setIdx(0);
      setAnswers([]);
      answersRef.current = [];
      setAnswer("");
      setLeft(ANSWER_SECONDS);
      setRunning(false);
      hintedRef.current = false;
      setStage("room");
      setClip("idle");
      setFx("wander");
      setBubble("Coco is looking around...");
      window.setTimeout(() => { setClip("wave"); setFx("jump"); setBubble("Hi! I'm Coco. Let's practice. Take your time."); }, 4600);
      window.setTimeout(() => { setFx(""); setClip("talk"); setBubble(r.questions[0]); }, 7000);
      window.setTimeout(() => setClip("idle"), 9400);
      window.setTimeout(() => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setStage("setup");
      setErr(e instanceof Error ? e.message : "Could not start the interview. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  async function wrap(all: string[]) {
    setStage("wrapping");
    setBubble("All done! Give me a moment to think about your answers.");
    setClip("idle");
    setFx("spin");
    window.setTimeout(() => setFx(""), 1400);
    try {
      const qa: Qa[] = questions.map((q, i) => ({ q, a: all[i] ?? "" }));
      const r = await finishFn({ data: { company, role, jd, resume, qa } });
      setFeedback(r.feedback as Feedback);
      setStage("feedback");
      window.setTimeout(() => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not make your feedback. Please try again.");
      setStage("setup");
    }
  }

  const reset = () => {
    stopMic();
    setStage("setup");
    setFeedback(null);
    setQuestions([]);
    setAnswers([]);
    setAnswer("");
    setErr("");
    setFx("");
  };

  const speak = (text: string) => {
    try {
      const ss = window.speechSynthesis;
      if (!ss) return;
      ss.cancel();
      const go = () => {
        const vs = ss.getVoices().filter((x) => /^en/i.test(x.lang));
        const male = /\b(david|mark|alex|daniel|fred|george|james|guy|ryan|male|rishi|oliver|arthur|aaron|thomas|eddy|reed|rocko|grandpa|ravi|albert|bruce|junior|ralph|jacques)\b/i;
        const prefer = ["Google UK English Female", "Samantha", "Victoria", "Karen", "Moira", "Tessa", "Microsoft Zira", "Microsoft Aria", "Microsoft Jenny", "Ava", "Allison", "Susan", "Fiona", "Serena", "Kate", "Nicky", "Google US English"];
        let v: SpeechSynthesisVoice | undefined;
        for (const n of prefer) { v = vs.find((x) => x.name.toLowerCase().includes(n.toLowerCase())); if (v) break; }
        if (!v) v = vs.find((x) => /female|woman|girl/i.test(x.name)) || vs.find((x) => !male.test(x.name)) || vs[0];
        const u = new SpeechSynthesisUtterance(text);
        if (v) { u.voice = v; u.lang = v.lang; }
        u.rate = 1.1;
        u.pitch = 2;
        u.onstart = () => setClip("talk");
        u.onend = () => setClip("idle");
        u.onerror = () => setClip("idle");
        ss.speak(u);
      };
      if (ss.getVoices().length) go();
      else {
        let done = false;
        const once = () => { if (done) return; done = true; ss.removeEventListener("voiceschanged", once); go(); };
        ss.addEventListener("voiceschanged", once);
        window.setTimeout(once, 1200);
      }
    } catch { /* voice is optional */ }
  };

  const low = running && left <= 20;

  return (
    <main className="ai">
      <style>{AI_CSS}</style>
      <section className="ai-hero">
        <div className="ai-wrap">
          <span className="ai-mono">( ai interview, 10 short questions )</span>
          <h1 className="ai-h1">Practice with <mark>Coco.</mark></h1>
          <p className="ai-sub">She reads your resume and the job description, then asks 10 short questions. Answer out loud or type. Get honest feedback at the end. Nothing you say or upload is saved.</p>
        </div>
      </section>

      <section className="ai-wrap ai-stage" ref={stageRef}>
        {loading ? null : !user ? (
          <div className="ai-card ai-center">
            <Coco clip="wave" size={1.4} />
            <h2 className="ai-h2">Sign in to start</h2>
            <p className="ai-sub2">AI Interview is for signed-in users. It is free to try.</p>
            <Link to="/auth" search={{ redirect: "/ai-interview" }} className="ai-btn">Sign in to continue <ArrowRight className="size-4" /></Link>
          </div>
        ) : stage === "setup" || stage === "loading" ? (
          <div className="ai-card ph-no-capture" data-ph-no-capture="true">
            <div className="ai-grid">
              <div className="ai-fields">
                <label><span>Company (optional)</span><input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" maxLength={120} /></label>
                <label><span>Job role</span><input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Marketing Manager" maxLength={120} /></label>
                <label className="ai-grow"><span>Job description</span><textarea value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description here" maxLength={8000} /></label>
              </div>
              <div className="ai-fields">
                <span className="ai-lab">Your resume</span>
                {pasteMode ? (
                  <textarea className="ai-paste" value={resume} onChange={(e) => { setResume(e.target.value); setFileName(""); }} placeholder="Paste your resume text here" maxLength={12000} />
                ) : (
                  <label className="ai-drop">
                    <input type="file" accept=".pdf,.docx,.txt" hidden onChange={(e) => void pickFile(e.target.files?.[0] ?? null)} />
                    <span className="ai-dic"><Upload className="size-6" /></span>
                    <span className="ai-dt">{fileName || "Drop your resume"}</span>
                    <span className="ai-dh">{fileName ? "Click to change" : "PDF, DOCX or TXT. Read in your browser, never uploaded."}</span>
                  </label>
                )}
                <button type="button" className="ai-link" onClick={() => { setPasteMode((m) => !m); setErr(""); }}>{pasteMode ? "Upload a file instead" : "Paste text instead"}</button>
                <p className="ai-note">Your resume and answers are sent to the AI to write the questions and feedback, then forgotten. We only count that you did an interview.</p>
              </div>
            </div>
            {err ? <p className="ai-err" role="alert">{err}</p> : null}
            <button type="button" className="ai-btn ai-go" disabled={busy} onClick={() => void begin()}>
              {busy ? "Coco is reading your resume..." : <>Start my interview <ArrowRight className="size-4" /></>}
            </button>
          </div>
        ) : stage === "feedback" && feedback ? (
          <div className="ai-card ph-no-capture" data-ph-no-capture="true">
            <div className="ai-fb-top">
              <Coco clip="talk" fx="jump" size={1.2} />
              <div>
                <span className="ai-mono">( your feedback )</span>
                <div className="ai-score"><b>{feedback.overall}</b><span>/100</span></div>
                <p className="ai-sub2">{feedback.summary}</p>
              </div>
            </div>
            <div className="ai-parts">
              {([["Relevance", feedback.parts.relevance], ["Clarity", feedback.parts.clarity], ["Examples", feedback.parts.examples], ["Job match", feedback.parts.jdMatch]] as const).map(([n, v]) => (
                <div key={n} className="ai-part"><span>{n}</span><i><u style={{ width: `${v}%` }} /></i><b>{v}</b></div>
              ))}
            </div>
            <div className="ai-two">
              <div><h3 className="ai-h3">What went well</h3><ul>{feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
              <div><h3 className="ai-h3">Work on this</h3><ul>{feedback.fixes.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            </div>
            <h3 className="ai-h3">Question by question</h3>
            <ol className="ai-pq">
              {questions.map((q, i) => (
                <li key={i}>
                  <b>{q}</b>
                  <em>{answers[i]?.trim() ? answers[i] : "(no answer)"}</em>
                  <span>{feedback.perQuestion.find((p) => p.n === i + 1)?.tip}</span>
                </li>
              ))}
            </ol>
            <p className="ai-note">This is AI coaching, not a verdict. It is gone when you leave this page, so copy anything you want to keep.</p>
            <button type="button" className="ai-btn" onClick={reset}>Practice again <ArrowRight className="size-4" /></button>
          </div>
        ) : (
          <div className="ai-room ph-no-capture" data-ph-no-capture="true">
            <div className="ai-bar">
              <span className="ai-rec">Coco&apos;s interview room</span>
              <span className="ai-qn">Question {Math.min(idx + 1, TOTAL)} of {TOTAL}</span>
              <span className={`ai-timer ${low ? "low" : ""} ${running ? "on" : ""}`} aria-live="off">{fmt(Math.max(0, left))}</span>
            </div>
            <div className="ai-tiles">
              <div className="ai-tile ai-coco-tile">
                <Coco clip={clip} fx={fx} size={cs} />
                <span className="ai-name">Coco, interviewer</span>
              </div>
              <div className={`ai-tile ai-me ${listening ? "live" : ""}`}>
                <span className="ai-av">{(user.email || "You").slice(0, 1).toUpperCase()}</span>
                <span className="ai-name">You {listening ? "(listening)" : ""}</span>
                <div className="ai-wave" aria-hidden="true"><i /><i /><i /><i /><i /></div>
              </div>
            </div>
            <div className="ai-bubble" role="status">
              <p>{stage === "wrapping" ? bubble : bubble || questions[idx]}</p>
              {stage === "room" && questions[idx] ? <button type="button" className="ai-ico" onClick={() => speak(questions[idx])} aria-label="Read the question out loud"><Volume2 className="size-4" /></button> : null}
            </div>
            {stage === "room" ? (
              <div className="ai-answer">
                <textarea
                  value={answer}
                  onChange={(e) => { setAnswer(e.target.value); if (!running) setRunning(true); }}
                  placeholder={voiceOk ? "Press the mic and talk, or type here. Your answer shows here." : "Type your answer here."}
                  maxLength={3000}
                />
                {err ? <p className="ai-err" role="alert">{err}</p> : null}
                <div className="ai-actions">
                  {voiceOk ? (
                    <button type="button" className={`ai-mic ${listening ? "on" : ""}`} onClick={() => (listening ? stopMic() : startMic())} aria-pressed={listening}>
                      {listening ? <><MicOff className="size-5" /> Stop</> : <><Mic className="size-5" /> Answer by voice</>}
                    </button>
                  ) : <span className="ai-note">Voice is not available in this browser. Type your answer.</span>}
                  {voiceOk && micBlocked ? <span className="ai-note">Microphone is blocked. Click the lock icon in the address bar, allow Microphone, then press the mic again. On a Mac also check System Settings > Privacy & Security > Microphone > Chrome, and restart Chrome. Or just type.</span> : null}
                  <button type="button" className="ai-btn sm" onClick={onNext}>{idx + 1 >= TOTAL ? "Finish" : "Next question"} <ArrowRight className="size-4" /></button>
                </div>
                <p className="ai-note"><button type="button" className="ai-skip" onClick={() => { setErr(""); goNext(false); }}>Skip this question</button></p>
                <p className="ai-note">You have 2 minutes per answer. The timer starts when you start talking or typing.</p>
              </div>
            ) : (
              <p className="ai-note ai-center">Writing your feedback...</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

const AI_CSS = `
.ai{--y:#ffd600;--cream:#f6f1d6;background:#000;color:var(--cream);overflow:hidden;min-height:70vh}
.ai *{box-sizing:border-box}
.ai-wrap{max-width:1100px;margin:0 auto;padding:0 20px}
@media (min-width:1200px){.ai-wrap{max-width:min(1680px,94vw);padding:0 24px}.ai-tile{min-height:340px}.ai-coco.fx-wander{--w:150px}}
.ai-hero .ai-wrap{position:relative}
.ai-hero-coco{display:none}
@media (min-width:1340px){.ai-hero-coco{display:block;position:absolute;right:20px;top:-20px;animation:ai-bob 3.2s ease-in-out infinite}}
@keyframes ai-bob{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-14px) rotate(1.5deg)}}

.ai-hero{position:relative;padding:56px 0 18px;background:radial-gradient(ellipse 38% 45% at 70% 50%,rgba(255,214,0,.14),transparent 70%)}
.ai-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;letter-spacing:.04em;color:var(--y)}
.ai-h1{margin:14px 0 0;font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;line-height:.95;letter-spacing:-.015em;font-size:clamp(2.6rem,7vw,5.5rem)}
.ai-h1 mark{background:var(--y);color:#000;padding:0 .14em;display:inline-block;transform:rotate(-1.5deg)}
.ai-sub{max-width:38rem;margin-top:18px;font-size:1.08rem;line-height:1.5;color:rgba(246,241,214,.75)}
.ai-sub2{font-size:1rem;line-height:1.5;color:rgba(246,241,214,.75);margin:8px 0}
.ai-stage{padding-top:22px;padding-bottom:80px;scroll-margin-top:80px}
.ai-card{border:1px solid rgba(255,214,0,.35);border-radius:22px;padding:22px;background:linear-gradient(160deg,rgba(255,214,0,.07),rgba(255,255,255,.015))}
.ai-center{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px}
.ai-h2{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;font-size:1.8rem;margin:0}
.ai-h3{font-family:var(--font-display,inherit);font-weight:700;text-transform:uppercase;font-size:1.05rem;margin:18px 0 8px;color:var(--y)}
.ai-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.ai-fields{display:flex;flex-direction:column;gap:14px}
.ai-fields label{display:flex;flex-direction:column;gap:6px}
.ai-fields label>span,.ai-lab{font-family:ui-monospace,Menlo,monospace;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--y)}
.ai-fields input,.ai-fields textarea,.ai-answer textarea{width:100%;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.2);border-radius:12px;color:var(--cream);padding:13px 14px;font:inherit;font-size:.95rem;outline:none}
.ai-fields input:focus,.ai-fields textarea:focus,.ai-answer textarea:focus{border-color:var(--y);box-shadow:0 0 0 3px rgba(255,214,0,.2)}
.ai-grow textarea{min-height:190px;resize:vertical}
.ai-paste{min-height:250px;resize:vertical}
.ai-drop{position:relative;display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;min-height:250px;border:2px dashed rgba(255,214,0,.55);border-radius:16px;cursor:pointer;padding:16px}
.ai-drop:hover{background:rgba(255,214,0,.08)}
.ai-dic{width:56px;height:56px;border-radius:50%;background:var(--y);color:#000;display:grid;place-items:center}
.ai-dt{font-family:var(--font-display,inherit);font-weight:700;font-size:1.1rem;text-transform:uppercase;word-break:break-word}
.ai-dh,.ai-note{font-size:.85rem;color:rgba(246,241,214,.6);line-height:1.45}
.ai-link{align-self:flex-start;background:none;border:0;color:var(--y);text-decoration:underline;cursor:pointer;font-size:.9rem;padding:0}
.ai-err{color:#ff8a80;font-size:.92rem;margin:12px 0 0}
.ai-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:var(--y);color:#000;font-weight:700;border-radius:999px;padding:15px 28px;font-size:1rem;border:0;cursor:pointer;text-decoration:none;transition:transform .2s}
.ai-btn:hover{transform:translateY(-2px)}
.ai-btn:disabled{opacity:.7;cursor:wait}
.ai-btn.sm{padding:11px 20px;font-size:.92rem}
.ai-go{width:100%;margin-top:18px;font-size:1.08rem;padding:17px}

.ai-room{border:1px solid rgba(255,214,0,.35);border-radius:22px;background:#0b0b0b;overflow:hidden}
.ai-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;background:#111;border-bottom:1px solid rgba(255,255,255,.08);flex-wrap:wrap}
.ai-rec{font-size:.8rem;display:inline-flex;align-items:center;gap:8px;color:rgba(246,241,214,.8)}
.ai-rec:before{content:"";width:9px;height:9px;border-radius:50%;background:#ff5252}
.ai-qn{font-family:ui-monospace,Menlo,monospace;font-size:.8rem;color:var(--y)}
.ai-timer{font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:1.25rem;color:rgba(246,241,214,.55);min-width:64px;text-align:right}
.ai-timer.on{color:var(--cream)}
.ai-timer.low{color:#ff5252;animation:ai-pulse 1s ease-in-out infinite}
@keyframes ai-pulse{50%{opacity:.45}}
.ai-tiles{display:grid;grid-template-columns:1.6fr 1fr;gap:12px;padding:14px}
.ai-tile{position:relative;border-radius:16px;background:radial-gradient(70% 70% at 50% 40%,#1c1a10,#0e0e0e);min-height:260px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(255,255,255,.06)}
.ai-coco-tile{border-color:rgba(255,214,0,.4)}
.ai-name{position:absolute;left:12px;bottom:10px;font-size:.78rem;background:rgba(0,0,0,.6);padding:4px 10px;border-radius:999px;color:var(--cream)}
.ai-me.live{border-color:#4caf50;box-shadow:0 0 0 2px rgba(76,175,80,.35)}
.ai-av{width:84px;height:84px;border-radius:50%;background:#333;color:var(--y);display:grid;place-items:center;font-size:2.2rem;font-weight:700}
.ai-wave{position:absolute;right:12px;bottom:12px;display:flex;align-items:flex-end;gap:3px;height:22px}
.ai-wave i{width:4px;height:6px;border-radius:2px;background:#4caf50;opacity:.35}
.ai-me.live .ai-wave i{opacity:1;animation:ai-w .8s ease-in-out infinite}
.ai-me.live .ai-wave i:nth-child(2){animation-delay:.12s}.ai-me.live .ai-wave i:nth-child(3){animation-delay:.24s}.ai-me.live .ai-wave i:nth-child(4){animation-delay:.36s}.ai-me.live .ai-wave i:nth-child(5){animation-delay:.48s}
@keyframes ai-w{50%{height:22px}}
.ai-bubble{margin:0 14px;background:var(--cream);color:#0a0a0a;border-radius:16px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:1.15rem;font-weight:600;line-height:1.35;min-height:70px}
.ai-bubble p{margin:0}
.ai-ico{flex:none;width:40px;height:40px;border-radius:50%;border:0;background:#000;color:var(--y);display:grid;place-items:center;cursor:pointer}
.ai-answer{padding:14px}
.ai-answer textarea{min-height:110px;resize:vertical}
.ai-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;flex-wrap:wrap}
.ai-mic{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--y);background:transparent;color:var(--y);font-weight:700;border-radius:999px;padding:11px 20px;cursor:pointer;font-size:.95rem}
.ai-mic.on{background:#c62828;border-color:#c62828;color:#fff}
.ai-answer .ai-note{margin:10px 0 0}
.ai-coco{will-change:transform}
.ai-skip{background:none;border:0;padding:0;color:rgba(246,241,214,.6);text-decoration:underline;cursor:pointer;font-size:.72rem}
.ai-skip:hover{color:var(--y)}
.ai-coco-tile .ai-coco:not([class*="fx-"]){animation:ai-sway 7s ease-in-out infinite}
@keyframes ai-sway{0%,100%{transform:translate(-16px,0)}25%{transform:translate(0,-6px)}50%{transform:translate(16px,0)}75%{transform:translate(0,-6px)}}
.ai-coco-tile .ai-coco.talking:not([class*="fx-"]){animation:ai-talkbob .55s ease-in-out infinite}
@keyframes ai-talkbob{0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(-8px,-10px) rotate(-3deg)}75%{transform:translate(8px,-10px) rotate(3deg)}}
.ai-card,.ai-tiles,.ai-bubble{animation:ai-rise .6s ease-out both}
@keyframes ai-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.ai::before,.ai::after{content:"";position:absolute;border-radius:50%;pointer-events:none;filter:blur(60px);opacity:.16;background:#ffd600}
.ai{position:relative}
.ai::before{width:320px;height:320px;left:-80px;top:120px;animation:ai-drift 14s ease-in-out infinite alternate}
.ai::after{width:260px;height:260px;right:-60px;top:420px;animation:ai-drift 11s ease-in-out infinite alternate-reverse}
@keyframes ai-drift{from{transform:translate(0,0)}to{transform:translate(60px,70px)}}
.ai-h1 mark{animation:ai-tilt 5s ease-in-out infinite}
@keyframes ai-tilt{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1deg)}}
.ai-btn{transition:transform .15s,box-shadow .15s}
.ai-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,214,0,.25)}
.ai-skip{font-size:.72rem;opacity:.7}

.ai-coco.fx-jump{animation:ai-jump .9s ease-in-out 2}
.ai-coco.fx-spin{animation:ai-spin 1.2s ease-in-out 1}
@keyframes ai-jump{0%,100%{transform:translateY(0)}40%{transform:translateY(-34px)}60%{transform:translateY(-34px)}}
@keyframes ai-spin{to{transform:rotateY(360deg)}}
.ai-coco.fx-wander{--w:90px;animation:ai-wander 4.5s ease-in-out 1}
@keyframes ai-wander{0%{transform:translate(0,0) scaleX(1)}8%{transform:translate(calc(var(--w)*-.5),-22px) scaleX(1)}16%{transform:translate(calc(var(--w)*-1),0) scaleX(1)}30%{transform:translate(calc(var(--w)*-1),0) scaleX(1)}38%{transform:translate(calc(var(--w)*-.2),-26px) scaleX(-1)}50%{transform:translate(calc(var(--w)*.6),0) scaleX(-1)}58%{transform:translate(var(--w),-22px) scaleX(-1)}66%{transform:translate(var(--w),0) scaleX(-1)}80%{transform:translate(calc(var(--w)*.5),-22px) scaleX(1)}92%{transform:translate(calc(var(--w)*.1),0) scaleX(1)}100%{transform:translate(0,0) scaleX(1)}}

.ai-fb-top{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.ai-score{display:flex;align-items:baseline;gap:4px}
.ai-score b{font-family:var(--font-display,inherit);font-size:4rem;line-height:1;color:var(--y)}
.ai-score span{font-size:1.2rem;color:rgba(246,241,214,.6)}
.ai-parts{display:grid;grid-template-columns:1fr 1fr;gap:10px 22px;margin:16px 0}
.ai-part{display:grid;grid-template-columns:90px 1fr 34px;align-items:center;gap:10px;font-size:.92rem}
.ai-part i{display:block;height:8px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden}
.ai-part u{display:block;height:100%;background:var(--y);text-decoration:none}
.ai-two{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.ai ul,.ai ol{padding-left:1.2rem;margin:0;line-height:1.5;color:rgba(246,241,214,.85)}
.ai-pq li{margin:0 0 14px;display:flex;flex-direction:column;gap:3px}
.ai-pq b{color:var(--cream)}
.ai-pq em{font-style:normal;color:rgba(246,241,214,.55);font-size:.9rem;white-space:pre-wrap}
.ai-pq span{color:var(--y);font-size:.95rem}

@media (max-width:720px){
.ai-coco.fx-wander{--w:34px}
.ai-grid,.ai-two,.ai-parts{grid-template-columns:1fr}
.ai-tiles{grid-template-columns:1fr 1fr;gap:8px;padding:10px}
.ai-tile{min-height:190px}
.ai-av{width:56px;height:56px;font-size:1.5rem}
.ai-bubble{font-size:1.02rem;margin:0 10px}
.ai-answer{padding:10px}
}
@media (prefers-reduced-motion:reduce){.ai-coco-tile .ai-coco,.ai-card,.ai-tiles,.ai-bubble,.ai::before,.ai::after,.ai-h1 mark{animation:none}.ai-coco.fx-jump,.ai-coco.fx-spin,.ai-timer.low{animation:none}}
`;
