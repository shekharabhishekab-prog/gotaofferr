import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="sf">
      <style>{SF_CSS}</style>
      <div className="sf-in">
        <div className="sf-top">
          <p className="sf-say">
            Ready for the <em>offer?</em>
          </p>
          <div className="sf-cta">
            <Link to="/tailor" className="sf-btn">Tailor my resume</Link>
            <p className="sf-blurb">
              Rebuild your resume for every job description with AI, and download a recruiter-ready resume and cover letter as PDFs.
            </p>
          </div>
        </div>
        <nav className="sf-cols" aria-label="Footer">
          <div className="sf-col">
            <h2 className="sf-h2">Product</h2>
            <ul>
            <li><Link to="/tailor" className="sf-a"><span>Resume tailor</span></Link></li>
            <li><Link to="/resume-builder" className="sf-a"><span>Resume builder</span></Link></li>
            <li><Link to="/ats-resume-checker" className="sf-a"><span>ATS resume checker</span></Link></li>
            <li><Link to="/ai-cover-letter-generator" className="sf-a"><span>AI cover letter generator</span></Link></li>
            <li><Link to="/jobs" search={{ alert: undefined }} className="sf-a"><span>Job finder</span></Link></li>
            <li><Link to="/linkedin-profile-reviewer" className="sf-a"><span>LinkedIn profile reviewer</span></Link></li>
            <li><Link to="/how-it-works" className="sf-a"><span>How it works</span></Link></li>
            <li><Link to="/pricing" className="sf-a"><span>Pricing</span></Link></li>
            </ul>
          </div>
          <div className="sf-col">
            <h2 className="sf-h2">Guides</h2>
            <ul>
            <li><Link to="/examples/resumes" className="sf-a"><span>Resume examples</span></Link></li>
            <li><Link to="/examples/cover-letters" className="sf-a"><span>Cover letter examples</span></Link></li>
            <li><Link to="/guides/dubai-resume-format" className="sf-a"><span>Dubai resume format</span></Link></li>
            <li><Link to="/guides/canada-resume-format" className="sf-a"><span>Canada resume format</span></Link></li>
            <li><Link to="/guides/australia-resume-format" className="sf-a"><span>Australia resume format</span></Link></li>
            <li><Link to="/guides/uk-resume-format" className="sf-a"><span>UK CV format</span></Link></li>
            <li><Link to="/guides/germany-resume-format" className="sf-a"><span>Germany CV format</span></Link></li>
            <li><Link to="/guides/singapore-resume-format" className="sf-a"><span>Singapore resume format</span></Link></li>
            <li><Link to="/guides/india-resume-format" className="sf-a"><span>India resume format</span></Link></li>
            </ul>
          </div>
          <div className="sf-col">
            <h2 className="sf-h2">Company</h2>
            <ul>
            <li><Link to="/about" className="sf-a"><span>About</span></Link></li>
            <li><Link to="/faq" className="sf-a"><span>FAQ</span></Link></li>
            <li><Link to="/contact" className="sf-a"><span>Contact</span></Link></li>
            <li><Link to="/privacy" className="sf-a"><span>Privacy policy</span></Link></li>
            <li><Link to="/terms" className="sf-a"><span>Terms &amp; conditions</span></Link></li>
            </ul>
          </div>
        </nav>
        <div className="sf-word" aria-hidden>
          {"gotaofferr".split("").map((c, i) => (
            <i key={i} style={{ ["--i" as string]: i }}>{c}</i>
          ))}
        </div>
        <div className="sf-base">
          <span>© {new Date().getFullYear()} GotaOfferr. Built for job seekers.</span>
          <span>AB24 SOLUTIONS · Delhi, India</span>
        </div>
      </div>
    </footer>
  );
}

const SF_CSS = `
@font-face{font-family:"HPBric";src:url("/m/bric.ttf") format("truetype");font-weight:800;font-display:swap}
@font-face{font-family:"HPInst";src:url("/m/inst.ttf") format("truetype");font-style:italic;font-display:swap}
@font-face{font-family:"HPSyne";src:url("/m/syne2.ttf") format("truetype");font-weight:400 800;font-display:swap}
.sf{position:relative;background:#000;color:#fff;overflow:hidden;padding-top:4.5rem}
.sf-in{max-width:80rem;margin:0 auto;padding:0 1.5rem}
.sf-top{display:grid;gap:1.8rem}
.sf-say{font-family:"HPSyne","HPBric",sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:-.04em;line-height:.95;font-size:clamp(2.2rem,9vw,5.6rem);margin:0}
.sf-say em{display:block;color:var(--highlight,#ffd600);font-family:"HPInst",Georgia,serif;font-style:italic;font-weight:400;text-transform:none;letter-spacing:-.01em;font-size:1.15em}
.sf-cta{display:flex;flex-direction:column;gap:1rem;align-items:flex-start}
.sf-btn{display:inline-flex;background:var(--highlight,#ffd600);color:#000;font-weight:700;border-radius:999px;padding:.8rem 1.5rem;font-size:.95rem;transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.sf-btn:hover{transform:translateY(-3px) rotate(-1.5deg)}
.sf-blurb{max-width:26rem;font-size:.88rem;line-height:1.55;color:rgba(255,255,255,.55);margin:0}
.sf-cols{display:grid;gap:2.2rem;margin-top:3.5rem;grid-template-columns:1fr 1fr}
.sf-col:first-child{grid-column:1/-1}
.sf-col ul{list-style:none;margin:.9rem 0 0;padding:0;display:grid;gap:.45rem}
.sf-h2{margin:0;font-family:ui-monospace,Menlo,monospace;font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;color:var(--highlight,#ffd600);font-weight:500}
.sf-a{position:relative;display:inline-block;font-size:.98rem;color:rgba(255,255,255,.72);transition:color .25s,transform .3s cubic-bezier(.2,.8,.2,1)}
.sf-a:hover{color:#fff;transform:translateX(8px)}
.sf-a::before{content:"→";position:absolute;left:-1.1rem;opacity:0;color:var(--highlight,#ffd600);transition:opacity .25s}
.sf-a:hover::before{opacity:1}
.sf-word{display:flex;justify-content:center;font-family:"HPSyne","HPBric",sans-serif;font-weight:800;letter-spacing:-.05em;line-height:.8;font-size:clamp(3rem,17.5vw,17rem);margin:3.5rem 0 -.1em;color:rgba(255,255,255,.07);user-select:none;white-space:nowrap}
.sf-word i{font-style:normal;display:inline-block;transition:color .3s,transform .5s cubic-bezier(.2,.9,.2,1.3)}
.sf-word i:hover{color:var(--highlight,#ffd600);transform:translateY(-.08em) rotate(calc((var(--i) - 4.5)*1.6deg))}
.sf-base{display:flex;flex-direction:column;gap:.3rem;padding:1.4rem 0 1.8rem;font-size:.74rem;color:rgba(255,255,255,.45)}
@media(min-width:900px){
.sf{padding-top:7rem}
.sf-in{padding:0 2.5rem}
.sf-top{grid-template-columns:1.5fr 1fr;align-items:end;gap:4rem}
.sf-cols{grid-template-columns:repeat(3,1fr);gap:3rem;margin-top:5rem}
.sf-col:first-child{grid-column:auto}
.sf-base{flex-direction:row;justify-content:space-between}
}
@media(prefers-reduced-motion:reduce){.sf-a,.sf-btn,.sf-word i{transition:none}}
`;
