import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  const wm = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const fit = () => {
      const svg = wm.current;
      const tx = svg?.querySelector("text");
      if (!svg || !tx) return;
      try {
        const b = (tx as SVGGraphicsElement).getBBox();
        if (b.width > 50) svg.setAttribute("viewBox", `${b.x} 0 ${b.width} ${(b.width * 215) / 984}`);
      } catch { /* ignore */ }
    };
    fit();
    const f = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    if (f) f.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <footer className="sf">
      <style>{SF_CSS}</style>
      <div className="sf-in">
        <div className="sf-top">
          <p className="sf-say">
            <span className="sf-r">Ready</span> <span className="sf-ft">for the</span> <em>offer?</em>
          </p>
          <div className="sf-cta">
            <Link to="/tailor" className="sf-btn">Tailor my resume</Link>
            <p className="sf-blurb">
              Rebuild your resume for every job description with AI, and download a recruiter-ready resume and cover letter as PDFs.
            </p>
          </div>
        </div>
        <nav aria-label="Footer">
<div className="sf-grp">
<div className="sf-col"><h2 className="sf-h2">Product</h2><ul className="sf-list"><li><Link to="/tailor" className="sf-a"><span>Resume tailor</span></Link></li>
<li><Link to="/resume-builder" className="sf-a"><span>Resume builder</span></Link></li>
<li><Link to="/ats-resume-checker" className="sf-a"><span>ATS resume checker</span></Link></li>
<li><Link to="/ai-cover-letter-generator" className="sf-a"><span>AI cover letter generator</span></Link></li>
<li><Link to="/jobs" search={{ alert: undefined }} className="sf-a"><span>Job finder</span></Link></li>
<li><Link to="/how-it-works" className="sf-a"><span>How it works</span></Link></li>
<li><Link to="/pricing" className="sf-a"><span>Pricing</span></Link></li></ul></div>
<div className="sf-col"><h2 className="sf-h2">Company</h2><ul className="sf-list"><li><Link to="/about" className="sf-a"><span>About</span></Link></li>
<li><Link to="/faq" className="sf-a"><span>FAQ</span></Link></li>
<li><Link to="/contact" className="sf-a"><span>Contact</span></Link></li>
<li><Link to="/privacy" className="sf-a"><span>Privacy policy</span></Link></li>
<li><Link to="/terms" className="sf-a"><span>Terms &amp; conditions</span></Link></li></ul></div>
<div className="sf-col"><h2 className="sf-h2">Guides</h2>
<p className="sf-sub">Examples</p><ul className="sf-chips"><li><Link to="/examples/resumes" className="sf-a"><span>Resume examples</span></Link></li>
<li><Link to="/examples/cover-letters" className="sf-a"><span>Cover letter examples</span></Link></li></ul>
<p className="sf-sub">Resume formats by country</p><ul className="sf-chips"><li><Link to="/guides/dubai-resume-format" className="sf-a"><span>Dubai resume format</span></Link></li>
<li><Link to="/guides/canada-resume-format" className="sf-a"><span>Canada resume format</span></Link></li>
<li><Link to="/guides/australia-resume-format" className="sf-a"><span>Australia resume format</span></Link></li>
<li><Link to="/guides/uk-resume-format" className="sf-a"><span>UK CV format</span></Link></li>
<li><Link to="/guides/germany-resume-format" className="sf-a"><span>Germany CV format</span></Link></li>
<li><Link to="/guides/singapore-resume-format" className="sf-a"><span>Singapore resume format</span></Link></li>
<li><Link to="/guides/india-resume-format" className="sf-a"><span>India resume format</span></Link></li></ul></div>
</div>
</nav>
        <div className="sf-base">
          <span>© {new Date().getFullYear()} GotaOfferr. Built for job seekers.</span>
        </div>

      </div>
      <div className="sf-word" aria-hidden>
        <svg ref={wm} viewBox="8 0 984 215" width="100%" role="presentation" focusable="false">
          <text x="0" y="158" fontSize="205">
            {"gotaofferr".split("").map((c, i) => (
              <tspan key={i}>{c}</tspan>
            ))}
          </text>
        </svg>
      </div>
    </footer>
  );
}

const SF_CSS = `
@font-face{font-family:"HPBric";src:url("/m/bric.ttf") format("truetype");font-weight:800;font-display:swap}
@font-face{font-family:"HPInst";src:url("/m/inst.ttf") format("truetype");font-style:italic;font-display:swap}
@font-face{font-family:"HPSyne";src:url("/m/syne2.ttf") format("truetype");font-weight:400 800;font-display:swap}
.sf{position:relative;background:#000;color:oklch(0.86 0.19 96);overflow:hidden;padding-top:4.5rem}
.sf-in{max-width:120rem;margin:0 auto;padding:0 1.5rem}
.sf-top{display:grid;gap:1.8rem}
.sf-say{font-family:"HPSyne","HPBric",sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:-.04em;line-height:.95;font-size:clamp(2.2rem,9vw,5.6rem);margin:0}
.sf-say em{display:block;color:var(--highlight,oklch(0.86 0.19 96));font-family:"HPInst",Georgia,serif;font-style:italic;font-weight:400;text-transform:none;letter-spacing:-.01em;font-size:1.15em}
.sf-cta{display:flex;flex-direction:column;gap:1rem;align-items:flex-start}
.sf-btn{display:inline-flex;background:var(--highlight,oklch(0.86 0.19 96));color:#fffffd;font-weight:700;border-radius:999px;padding:.8rem 1.5rem;font-size:.95rem;transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.sf-btn:hover{transform:translateY(-3px) rotate(-1.5deg)}
.sf-blurb{max-width:26rem;font-size:.88rem;line-height:1.55;color:rgba(0,0,0,.55);margin:0}
.sf-cols{display:grid;gap:2.2rem;margin-top:3.5rem;grid-template-columns:1fr 1fr}
.sf-col:first-child{grid-column:1/-1}
.sf-col ul{list-style:none;margin:.9rem 0 0;padding:0;display:grid;gap:.45rem}
.sf-h2{margin:0;font-family:ui-monospace,Menlo,monospace;font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;color:var(--highlight,oklch(0.86 0.19 96));font-weight:500}
.sf-a{position:relative;display:inline-block;font-size:.98rem;color:rgba(0,0,0,.72);transition:color .25s,transform .3s cubic-bezier(.2,.8,.2,1)}
.sf-a:hover{color:oklch(0.86 0.19 96);transform:translateX(8px)}
.sf-a::before{content:"→";position:absolute;left:-1.1rem;opacity:0;color:var(--highlight,oklch(0.86 0.19 96));transition:opacity .25s}
.sf-a:hover::before{opacity:1}
.sf-word{display:flex;justify-content:center;font-family:"HPSyne","HPBric",sans-serif;font-weight:800;letter-spacing:-.05em;line-height:.8;font-size:clamp(3rem,17.5vw,17rem);margin:3.5rem 0 -.1em;color:rgba(249,216,11,.07);user-select:none;white-space:nowrap}
.sf-wordx i{font-style:normal;display:inline-block;transition:color .3s,transform .5s cubic-bezier(.2,.9,.2,1.3)}
.sf-wordx i:hover{color:var(--highlight,oklch(0.86 0.19 96));transform:translateY(-.08em) rotate(calc((var(--i) - 4.5)*1.6deg))}
.sf-base{display:flex;flex-direction:column;gap:.3rem;padding:1.4rem 0 1.8rem;font-size:.74rem;color:rgba(249,216,11,.45)}
@media(min-width:900px){
.sf{padding-top:7rem}
.sf-in{padding:0 2.5rem}
.sf-top{grid-template-columns:1.5fr 1fr;align-items:end;gap:4rem}
.sf-cols{grid-template-columns:repeat(3,1fr);gap:3rem;margin-top:5rem}
.sf-col:first-child{grid-column:auto}
.sf-base{flex-direction:row;justify-content:space-between}
}

.sf-word{display:block;margin:3rem 0 0;line-height:0;font-size:0}
.sf-word svg{display:block;overflow:visible;width:100%;height:auto}
.sf-word text{font-family:"HPSyne","HPBric",sans-serif;font-weight:800;fill:rgba(249,216,11,.14)}
.sf-word tspan{transition:fill .3s}
.sf-word tspan:hover{fill:var(--highlight,oklch(0.86 0.19 96))}

.sf-word{margin:1.5rem 0 0;aspect-ratio:1000/120;overflow:hidden}
.sf-base{padding-bottom:0}
.sf-word text{fill:rgba(249,216,11,.28)}
@supports(animation-timeline:view()){
.sf-col,.sf-top>*{animation:sf-up both cubic-bezier(.2,.8,.2,1);animation-timeline:view();animation-range:entry 0% entry 55%}
.sf-col:nth-child(2){animation-range:entry 8% entry 62%}.sf-col:nth-child(3){animation-range:entry 16% entry 70%}
.sf-word svg{animation:sf-rise both linear;animation-timeline:view();animation-range:entry 10% cover 55%}
}
@keyframes sf-up{from{opacity:0;transform:translateY(46px)}to{opacity:1;transform:none}}
@keyframes sf-rise{from{transform:translateY(55%)}to{transform:none}}
.sf-btn{animation:sf-pulse 2.6s ease-in-out infinite}
@keyframes sf-pulse{0%,100%{box-shadow:0 0 0 0 rgba(249,216,11,.45)}50%{box-shadow:0 0 0 14px rgba(249,216,11,0)}}
.sf-word tspan{transition:fill .25s}
.sf-word tspan:hover{fill:var(--highlight,oklch(0.86 0.19 96))}

.sf-in{padding-left:clamp(1.5rem,3.2vw,4rem);padding-right:clamp(1.5rem,3.2vw,4rem)}
.sf-base{flex-direction:column!important;align-items:center;justify-content:center!important;text-align:center;gap:.35rem;padding:2.5rem 0 1.2rem}
.sf-word{width:100%;margin:.5rem 0 0;aspect-ratio:984/139;overflow:hidden;padding:0}
.sf-word svg{width:100%}
@media(min-width:900px){.sf-grp{grid-template-columns:1fr 1fr 2.6fr}}

@media(min-width:900px){
.sf-grp{grid-template-columns:1fr 1fr 3.4fr;gap:clamp(2rem,4vw,6rem)}
.sf-grp .sf-col:nth-child(3){display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);column-gap:clamp(2rem,3vw,4rem);align-content:start}
.sf-grp .sf-col:nth-child(3) .sf-h2{grid-column:1/-1;grid-row:1}
.sf-grp .sf-col:nth-child(3)>.sf-sub:nth-of-type(1){grid-column:1;grid-row:2}
.sf-grp .sf-col:nth-child(3)>ul:nth-of-type(1){grid-column:1;grid-row:3;align-content:start}
.sf-grp .sf-col:nth-child(3)>.sf-sub:nth-of-type(2){grid-column:2;grid-row:2}
.sf-grp .sf-col:nth-child(3)>ul:nth-of-type(2){grid-column:2;grid-row:3;align-content:start}
}

.sf-say{font-size:clamp(1.9rem,7.6vw,5.6rem)!important;display:flex;flex-wrap:wrap;align-items:baseline;column-gap:.22em;row-gap:0}
.sf-say .sf-r{flex-basis:100%}
.sf-say .sf-ft,.sf-say em{white-space:nowrap}
.sf-say em{display:inline-block;transform:rotate(-5deg) translateY(-.04em);transform-origin:left bottom;margin-left:.06em;font-size:1.05em}
.sf-top{gap:1rem}
.sf-cta{margin-top:-.4rem}
@media(min-width:900px){.sf-top{gap:4rem}.sf-cta{transform:translateY(-1.6rem)}}
.sf-word svg{animation:none!important}
@media(prefers-reduced-motion:reduce){.sf-btn,.sf-col,.sf-top>*,.sf-word svg{animation:none!important}}
@media(prefers-reduced-motion:reduce){.sf-a,.sf-btn,.sf-wordx i{transition:none}}

.sf-top{display:grid;gap:2rem;align-items:end}
.sf-grp{margin-top:3rem;display:grid;gap:2.4rem}
.sf-grp .sf-col ul{display:flex;flex-wrap:wrap;gap:.5rem .5rem;margin-top:1rem}
.sf-a{display:inline-flex;align-items:center;font-size:.92rem;color:rgba(0,0,0,.8)}
.sf-a::before{content:none}
.sf-col ul.sf-list{display:grid;gap:.55rem}
.sf-col ul.sf-chips li a{border:0;background:rgba(249,216,11,.07);padding:.5rem .95rem;border-radius:999px;transition:background .25s,color .25s,transform .3s cubic-bezier(.2,.8,.2,1)}
.sf-col ul.sf-chips li a:hover{background:var(--highlight,oklch(0.86 0.19 96));color:#fffffd;transform:translateY(-2px)}
.sf-col ul.sf-list .sf-a:hover{transform:translateX(6px)}
.sf-sub{margin:1.4rem 0 .3rem;font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(249,216,11,.4);font-family:ui-monospace,Menlo,monospace}
.sf-word{justify-content:flex-start;margin-left:-.04em}
@media(min-width:900px){
.sf-top{grid-template-columns:1.6fr 1fr;align-items:end}
.sf-grp{grid-template-columns:1fr 1fr 2.4fr;gap:3rem;margin-top:5rem}
.sf-grp .sf-col:first-child{grid-column:auto}
}
`;

