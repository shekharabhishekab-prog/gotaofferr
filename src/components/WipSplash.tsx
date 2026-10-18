import { useEffect, useRef } from "react";

import { WIP_ENABLED, WIP_LAUNCH_AT } from "@/lib/wip";

const LANGS = [
  { code: "en", chip: "EN", line: "Something big is cooking.", sub: "GotaOfferr is getting a glow-up. Back very soon.", soon: "Launch date soon", enter: "peek inside", units: ["days", "hrs", "min", "sec"] },
  { code: "hi", chip: "Hinglish", line: "Kuch bada pak raha hai.", sub: "GotaOfferr ka glow-up chal raha hai. Bas thodi der mein wapas.", soon: "Date jaldi aayegi", enter: "andar jhaanko", units: ["din", "ghante", "min", "sec"] },
  { code: "zh", chip: "中文", line: "大事正在酝酿中", sub: "GotaOfferr 正在大升级，马上回来。", soon: "上线日期即将公布", enter: "先进去看看", units: ["天", "时", "分", "秒"] },
  { code: "ja", chip: "日本語", line: "なにかスゴいこと、準備中。", sub: "GotaOfferr がパワーアップ中。もうすぐ戻ります。", soon: "公開日はもうすぐ", enter: "のぞいてみる", units: ["日", "時間", "分", "秒"] },
  { code: "ko", chip: "한국어", line: "엄청난 게 오고 있어요", sub: "GotaOfferr가 새롭게 변신 중이에요. 곧 돌아올게요.", soon: "오픈 날짜는 곧 공개", enter: "먼저 둘러보기", units: ["일", "시간", "분", "초"] },
] as const;

const CSS = `
@font-face{font-family:"Covered Grace";src:url(/fonts/covered-grace.ttf) format("truetype");font-display:swap}
@font-face{font-family:"Caveat Brush";src:url(/fonts/caveat-brush.woff2) format("woff2");font-display:swap}
#wip{display:none;position:fixed;inset:0;z-index:2147483000;background:radial-gradient(ellipse at 50% 120%,#0b0a1c 0%,#fffffd 60%);color:oklch(0.86 0.19 96);overflow:hidden;
font-family:"Caveat Brush","Segoe Print","Comic Sans MS","Hiragino Maru Gothic ProN","PingFang SC","Noto Sans CJK JP","Malgun Gothic",cursive,sans-serif}
html[data-wip=on] #wip{display:flex;align-items:center;justify-content:center}
html[data-wip=on] body{overflow:hidden}
#wip [data-l]{display:none}
html[data-wl=en] #wip [data-l=en],html[data-wl=hi] #wip [data-l=hi],html[data-wl=zh] #wip [data-l=zh],html[data-wl=ja] #wip [data-l=ja],html[data-wl=ko] #wip [data-l=ko]{display:block}
#wip .wip-main{position:relative;max-width:min(92vw,1000px);padding:0 24px;text-align:center}
#wip .wip-logo{display:block;margin:0 auto 26px;width:min(170px,40vw);height:auto;animation:wipFloat 6s ease-in-out infinite}
html[data-wip=on] #wip h2{font-family:"Covered Grace","Caveat Brush","Segoe Print","Hiragino Maru Gothic ProN","PingFang SC","Noto Sans CJK JP","Malgun Gothic",cursive,sans-serif !important}
html[data-wip=on] #wip p{font-family:"Caveat Brush","Segoe Print","Comic Sans MS","Hiragino Maru Gothic ProN","PingFang SC","Noto Sans CJK JP","Malgun Gothic",cursive,sans-serif !important}
#wip h2{margin:0;font-weight:400;font-size:clamp(3.2rem,14vw,7.4rem);line-height:1.06;letter-spacing:.01em;transform:rotate(-2deg);text-wrap:balance}
#wip .wip-sub{margin:28px auto 0;max-width:30ch;font-size:clamp(1.35rem,3.4vw,2rem);line-height:1.45;opacity:.92;text-wrap:balance}
#wip .wip-line{display:block;margin:10px auto 0;width:min(70%,420px);height:22px;overflow:visible}
#wip .wip-line path{fill:none;stroke:oklch(0.86 0.19 96);stroke-width:5;stroke-linecap:round;stroke-dasharray:420;stroke-dashoffset:420;animation:wipDraw 1.4s .4s ease-out forwards}
#wip .wip-star{position:absolute;color:oklch(0.86 0.19 96);animation:wipBob 4s ease-in-out infinite}
#wip .wip-timer{position:absolute;top:clamp(40px,8vh,84px);right:clamp(28px,5vw,72px);display:flex;gap:8px;align-items:flex-start}
#wip .wip-box{min-width:46px;padding:5px 7px 4px;border:2px solid oklch(0.86 0.19 96);border-radius:13px;text-align:center}
#wip .wip-box b{display:block;font-weight:400;font-size:1.35rem;line-height:1;font-variant-numeric:tabular-nums}
#wip .wip-box i{display:block;font-style:normal;font-size:.75rem;opacity:.85;margin-top:2px}
#wip .wip-soon-wrap{display:contents}
#wip .wip-soon{position:absolute;top:clamp(40px,8vh,84px);right:clamp(28px,5vw,72px);padding:8px 18px;border:3px solid oklch(0.86 0.19 96);border-radius:999px;font-size:1.25rem}
#wip .wip-enter{position:absolute;right:22px;bottom:22px;display:flex;align-items:center;gap:10px;background:none;border:0;color:oklch(0.86 0.19 96);font:inherit;font-size:1.3rem;cursor:pointer;padding:6px}
#wip .wip-enter span.wip-arrow{display:grid;place-items:center;width:52px;height:52px;border:3px solid oklch(0.86 0.19 96);border-radius:50%;transition:transform .2s ease}
#wip .wip-enter:hover span.wip-arrow,#wip .wip-enter:focus-visible span.wip-arrow{transform:translate(4px,4px) rotate(8deg)}
#wip .wip-enter:focus-visible,#wip .wip-chip:focus-visible{outline:3px solid oklch(0.86 0.19 96);outline-offset:3px}
#wip .wip-langs{position:absolute;left:0;right:0;bottom:22px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;padding:0 120px 0 20px}
#wip .wip-chip{background:none;border:2px solid rgba(255,214,10,.45);color:oklch(0.86 0.19 96);font:inherit;font-size:1.05rem;border-radius:999px;padding:3px 14px;cursor:pointer}
html[data-wl=en] #wip .wip-chip[data-c=en],html[data-wl=hi] #wip .wip-chip[data-c=hi],html[data-wl=zh] #wip .wip-chip[data-c=zh],html[data-wl=ja] #wip .wip-chip[data-c=ja],html[data-wl=ko] #wip .wip-chip[data-c=ko]{background:oklch(0.86 0.19 96);color:#fffffd;border-color:oklch(0.86 0.19 96)}

#wip .wip-sky{position:absolute;inset:0;pointer-events:none;overflow:hidden}
#wip .wip-st{position:absolute;left:0;top:0;border-radius:50%;background:transparent;will-change:opacity}
#wip .wip-st.a{width:2px;height:2px;box-shadow:var(--s);color:oklch(0.86 0.19 96);animation:wipTw 3.6s ease-in-out infinite}
#wip .wip-st.b{width:3px;height:3px;box-shadow:var(--s);animation:wipTw 5.2s -2s ease-in-out infinite}
#wip .wip-st.c{width:2px;height:2px;box-shadow:var(--s);animation:wipTw 4.4s -1s ease-in-out infinite}
#wip .wip-sh{position:absolute;width:140px;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(255,233,138,0),oklch(0.86 0.19 96));opacity:0;transform:rotate(35deg);will-change:transform,opacity;animation:wipShoot 9s linear infinite}
#wip .wip-sub{animation:wipFloat 7s -2s ease-in-out infinite}
#wip .wip-box{animation:wipGlow 3.5s ease-in-out infinite}
#wip .wip-box:nth-child(2){animation-delay:-.9s}#wip .wip-box:nth-child(3){animation-delay:-1.8s}#wip .wip-box:nth-child(4){animation-delay:-2.7s}
#wip .wip-soon{animation:wipGlow 3.5s ease-in-out infinite}
#wip .wip-enter span.wip-arrow{animation:wipNudge 2.4s ease-in-out infinite}
#wip .wip-main,#wip .wip-timer,#wip .wip-soon,#wip .wip-langs,#wip .wip-enter{z-index:2}
#wip .wip-w{display:inline-block;white-space:nowrap;margin:0 .14em}
#wip .wip-w.c{display:inline;white-space:normal;margin:0}
#wip .wip-ch{display:inline-block;will-change:transform;animation:wipWave 3.8s ease-in-out infinite}
@keyframes wipWave{0%,100%{transform:translateY(0) rotate(0) scale(1)}25%{transform:translateY(-.09em) rotate(-2.5deg) scale(1.015)}50%{transform:translateY(0) rotate(0) scale(1)}75%{transform:translateY(.07em) rotate(2.5deg) scale(.99)}}
@keyframes wipTw{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes wipFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes wipGlow{0%,100%{box-shadow:0 0 0 rgba(255,214,10,0)}50%{box-shadow:0 0 14px rgba(255,214,10,.45)}}
@keyframes wipNudge{0%,100%{transform:translate(0,0)}50%{transform:translate(4px,4px)}}
@keyframes wipShoot{0%{opacity:0;transform:translate3d(0,0,0) rotate(35deg)}2%{opacity:1}12%{opacity:0;transform:translate3d(420px,300px,0) rotate(35deg)}100%{opacity:0;transform:translate3d(420px,300px,0) rotate(35deg)}}
@keyframes wipWobble{0%,100%{transform:rotate(-2deg) translateY(0)}50%{transform:rotate(-1deg) translateY(-6px)}}
@keyframes wipBob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-12px) rotate(12deg)}}
@keyframes wipDraw{to{stroke-dashoffset:0}}
@media (max-width:640px){
#wip .wip-timer{top:34px;left:0;right:0;justify-content:center;gap:7px}
#wip .wip-box{min-width:44px;padding:4px 6px 3px;border-radius:12px}
#wip .wip-box b{font-size:1.2rem}
#wip .wip-soon{top:34px;right:auto;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:1.1rem}
#wip .wip-main{padding:0 18px;margin-top:40px}
#wip .wip-langs{padding:0 86px 0 14px;bottom:26px}
#wip .wip-enter span.wip-arrow{width:46px;height:46px}
#wip .wip-enter span.wip-label{display:none}
}
@media (prefers-reduced-motion:reduce){#wip h2,#wip .wip-star,#wip .wip-st,#wip .wip-sh,#wip .wip-ch,#wip .wip-box,#wip .wip-logo,#wip .wip-sub,#wip .wip-enter span.wip-arrow{animation:none}#wip .wip-line path{animation:none;stroke-dashoffset:0}}
`;



function field(n: number, seed: number) {
  let x = seed;
  const r = () => ((x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(`${(r() * 100).toFixed(1)}vw ${(r() * 100).toFixed(1)}vh oklch(0.86 0.19 96)`);
  return out.join(",");
}
const SKY_A = field(70, 11), SKY_B = field(36, 29), SKY_C = field(22, 47);
const SHOOTERS = [
  { top: "6%", left: "12%", d: "0s" }, { top: "14%", left: "55%", d: "-3.2s" }, { top: "3%", left: "78%", d: "-6s" },
  { top: "30%", left: "30%", d: "-4.5s" }, { top: "22%", left: "88%", d: "-1.4s" },
];

export function WipSplash() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const params = new URLSearchParams(window.location.search);
    const target = Date.parse(params.get("wipdate") || WIP_LAUNCH_AT);
    const boxes = el.querySelectorAll<HTMLElement>("[data-tick]");
    if (Number.isNaN(target) || !boxes.length) return;
    const tick = () => {
      let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const parts = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
      boxes.forEach((b) => {
        const n = parts[Number(b.dataset.tick)];
        b.textContent = String(n).padStart(2, "0");
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!WIP_ENABLED) return null;
  const hasDate = Boolean(WIP_LAUNCH_AT);
  const demoDate = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("wipdate");

  const enter = () => {
    sessionStorage.setItem("wip_enter", "1");
    document.documentElement.removeAttribute("data-wip");
  };
  const setLang = (code: string) => {
    sessionStorage.setItem("wip_lang", code);
    document.documentElement.setAttribute("data-wl", code);
  };

  return (
    <div id="wip" ref={root} role="dialog" aria-label="GotaOfferr is coming back soon">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="wip-sky" aria-hidden="true">
        <i className="wip-st a" style={{ "--s": SKY_A } as React.CSSProperties} />
        <i className="wip-st b" style={{ "--s": SKY_B } as React.CSSProperties} />
        <i className="wip-st c" style={{ "--s": SKY_C } as React.CSSProperties} />
        {SHOOTERS.map((h, i) => (
          <i key={i} className="wip-sh" style={{ top: h.top, left: h.left, animationDelay: h.d }} />
        ))}
      </div>

      {hasDate || demoDate ? (
        <div className="wip-timer">
          {LANGS.map((l) => (
            <div key={l.code} data-l={l.code}>
              <div style={{ display: "flex", gap: 8 }}>
                {l.units.map((u, i) => (
                  <div className="wip-box" key={u}>
                    <b data-tick={i}>--</b>
                    <i>{u}</i>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="wip-soon-wrap">
          {LANGS.map((l) => (
            <div key={l.code} data-l={l.code} className="wip-soon">{l.soon}</div>
          ))}
        </div>
      )}

      <div className="wip-main">
        <img className="wip-logo" src="/wip-logo.png" alt="GotaOfferr" width="170" />
        {LANGS.map((l) => (
          <div key={l.code} data-l={l.code} lang={l.code === "hi" ? "en" : l.code}>
            <h2 aria-label={l.line}>
              {l.line.split(" ").map((word, wi) => (
                <span key={wi} className={/[\u3000-\u9fff\uac00-\ud7af]/.test(word) ? "wip-w c" : "wip-w"} aria-hidden="true">
                  {Array.from(word).map((ch, ci) => (
                    <span key={ci} className="wip-ch" style={{ animationDelay: `${(-(wi * 5 + ci) * 0.16).toFixed(2)}s` }}>{ch}</span>
                  ))}
                </span>
              ))}
            </h2>
            <svg className="wip-line" viewBox="0 0 420 22" preserveAspectRatio="none" aria-hidden="true">
              <path d="M4 14 C 40 2, 70 22, 110 10 S 180 20, 215 9 S 290 21, 330 8 S 395 16, 416 6" />
            </svg>
            <p className="wip-sub">{l.sub}</p>
          </div>
        ))}
      </div>

      <div className="wip-langs">
        {LANGS.map((l) => (
          <button key={l.code} type="button" className="wip-chip" data-c={l.code} onClick={() => setLang(l.code)}>
            {l.chip}
          </button>
        ))}
      </div>

      <button type="button" className="wip-enter" onClick={enter} aria-label="Enter the site">
        <span className="wip-label">
          {LANGS.map((l) => (
            <span key={l.code} data-l={l.code}>{l.enter}</span>
          ))}
        </span>
        <span className="wip-arrow" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6c4 1 9 4 12 12M18 18l-8-.5M18 18l.5-8" /></svg>
        </span>
      </button>
    </div>
  );
}
