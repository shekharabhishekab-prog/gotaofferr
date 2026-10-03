import { Link } from "@tanstack/react-router";


export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="site-container grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <span className="text-2xl font-bold tracking-tight text-foreground">gotaofferr</span>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Rebuild your resume for every job description with AI, and download a recruiter-ready
            resume and cover letter as PDFs.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Product</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/tailor" className="hover:text-foreground">
                Resume tailor
              </Link>
            </li>
            <li>
              <Link to="/resume-builder" className="hover:text-foreground">
                Resume builder
              </Link>
            </li>
            <li>
              <Link to="/ats-resume-checker" className="hover:text-foreground">
                ATS resume checker
              </Link>
            </li>
            <li>
              <Link to="/ai-cover-letter-generator" className="hover:text-foreground">
                AI cover letter generator
              </Link>
            </li>
            <li>
              <Link to="/jobs" search={{ alert: undefined }} className="hover:text-foreground">
                Job finder
              </Link>
            </li>
            <li>
              <Link to="/linkedin-profile-reviewer" className="hover:text-foreground">
                LinkedIn profile reviewer
              </Link>
            </li>


            <li>
              <Link to="/how-it-works" className="hover:text-foreground">
                How it works
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-foreground">
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Guides</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/examples/resumes" className="hover:text-foreground">
                Resume examples
              </Link>
            </li>
            <li>
              <Link to="/examples/cover-letters" className="hover:text-foreground">
                Cover letter examples
              </Link>
            </li>
            <li>
              <Link to="/guides/dubai-resume-format" className="hover:text-foreground">
                Dubai resume format
              </Link>
            </li>
            <li>
              <Link to="/guides/canada-resume-format" className="hover:text-foreground">
                Canada resume format
              </Link>
            </li>
            <li>
              <Link to="/guides/australia-resume-format" className="hover:text-foreground">
                Australia resume format
              </Link>
            </li>
            <li>
              <Link to="/guides/uk-resume-format" className="hover:text-foreground">
                UK CV format
              </Link>
            </li>
            <li>
              <Link to="/guides/germany-resume-format" className="hover:text-foreground">
                Germany CV format
              </Link>
            </li>
            <li>
              <Link to="/guides/singapore-resume-format" className="hover:text-foreground">
                Singapore resume format
              </Link>
            </li>
            <li>
              <Link to="/guides/india-resume-format" className="hover:text-foreground">
                India resume format
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Company</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-foreground">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-foreground">
                Terms &amp; conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>


      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} GotaOfferr. Built for job seekers.
        </p>
        <p className="mt-1">
          AB24 SOLUTIONS · Delhi, India
        </p>
      </div>
    </footer>
  );
}
