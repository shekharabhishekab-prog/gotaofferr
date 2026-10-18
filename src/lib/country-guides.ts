export interface CountryGuideFaq {
  q: string;
  a: string;
}

export interface CountryGuide {
  slug: string;
  country: string;
  /** Display name used in copy, e.g. "Dubai (UAE)". */
  market: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  /** What changes versus a standard Indian resume. */
  changes: { label: string; india: string; target: string }[];
  before: string[];
  after: string[];
  extras: string[];
  faqs: CountryGuideFaq[];
  /** True when the guide is for the Indian domestic market, not outbound from India. */
  domestic?: boolean;
}

export const countryGuides: CountryGuide[] = [
  {
    slug: "dubai-resume-format",
    country: "UAE",
    market: "Dubai and the wider UAE",
    title: "Dubai Resume Format: How to Rewrite an Indian Resume for UAE Jobs",
    metaTitle: "Dubai Resume Format for Indian Candidates (2026)",
    metaDescription:
      "What applying from India to Dubai changes: CV length, photo and personal details, visa status line, AED salary and the format UAE recruiters expect.",
    intro:
      "Gulf hiring is the one market where several habits from an Indian resume still help — and a few actively hurt. Recruiters in Dubai screen for visa status and notice period within the first few seconds, and most mid-level roles are filtered through Taleo, Oracle or SuccessFactors before a human sees them.",
    changes: [
      {
        label: "Length",
        india: "1–2 pages",
        target: "2 pages is normal and expected for 5+ years of experience",
      },
      {
        label: "Photo",
        india: "Often included",
        target: "Commonly accepted in the UAE, but never required — omit it if the posting is with a multinational using a global ATS",
      },
      {
        label: "Personal details",
        india: "DOB, father's name, marital status",
        target: "Nationality and visa status are useful; drop father's name and marital status",
      },
      {
        label: "Visa line",
        india: "Not applicable",
        target: "State it plainly — visit visa, employment visa transferable, or open to employer sponsorship",
      },
      {
        label: "Salary",
        india: "LPA in INR",
        target: "Convert to AED per month, since UAE offers are quoted monthly",
      },
      {
        label: "Dates",
        india: "Mixed formats",
        target: "Mon YYYY – Mon YYYY throughout, so the ATS reads tenure correctly",
      },
      {
        label: "Notice period",
        india: "Rarely stated",
        target: "State it near the top; Gulf recruiters filter on availability",
      },
    ],
    before: [
      "Objective: Seeking a challenging role in a reputed organisation.",
      "Father's Name: — | Marital Status: Married | DOB: 12/04/1993",
      "Current CTC: 14 LPA",
      "Handled marketing activities and vendor coordination.",
    ],
    after: [
      "Marketing manager with 7 years in retail and FMCG, currently in Mumbai. Available in 30 days, open to employer-sponsored UAE work visa.",
      "Nationality: Indian | Visa status: open to employer sponsorship | Location: relocating to Dubai",
      "Current package: approx. AED 6,500/month equivalent",
      "Ran a AED 400,000-equivalent annual campaign budget across trade and digital, lifting assisted revenue 23%.",
    ],
    extras: [
      "Add a one-line relocation and sponsorship statement under your name — GotaOfferr adds this automatically when it detects a cross-border application.",
      "Keep Arabic language ability, if any, in the skills line; it is a genuine differentiator for client-facing roles.",
      "Attach a plain-text PDF. Gulf recruitment agencies frequently re-upload your CV into their own database, and designed layouts come out mangled.",
    ],
    faqs: [
      {
        q: "Should I put a photo on a Dubai resume?",
        a: "It is accepted but no longer expected. Local agencies often still ask for one; multinationals screening through a global ATS do not. When in doubt, send the plain version — a missing photo has never cost a shortlist, a broken parse has.",
      },
      {
        q: "Do I need to mention visa status on a UAE CV?",
        a: "Yes. Recruiters filter on it immediately. Write it plainly: 'open to employer-sponsored visa', 'employment visa, transferable', or 'visit visa, available immediately'.",
      },
      {
        q: "How long should a CV be for Dubai jobs?",
        a: "Two pages for experienced candidates. Unlike the US, the Gulf market does not penalise a second page — it penalises unexplained gaps and missing availability.",
      },
      {
        q: "Should I convert my salary to AED?",
        a: "Only if the application asks for it. When you do, quote a monthly AED figure rather than an annual one, because UAE offers are structured as monthly basic plus allowances.",
      },
    ],
  },
  {
    slug: "canada-resume-format",
    country: "Canada",
    market: "Canada",
    title: "Canada Resume Format: Rewriting an Indian Resume for Canadian Jobs",
    metaTitle: "Canada Resume Format for Indian Applicants (2026)",
    metaDescription:
      "The Canadian resume format explained for Indian candidates: no photo or personal details, work-authorisation line, Canadian spelling, and ATS-safe structure.",
    intro:
      "Canada has the strictest anti-discrimination norms of the markets Indian candidates commonly apply to. Anything that hints at age, marital status, religion or nationality is a liability, and most employers screen through Workday, Greenhouse or Lever before a recruiter opens the file.",
    changes: [
      { label: "Length", india: "1–2 pages", target: "2 pages maximum, 1 page for early career" },
      { label: "Photo", india: "Often included", target: "Never. It can get an application discarded outright" },
      {
        label: "Personal details",
        india: "DOB, marital status, father's name",
        target: "Remove all of them. Name, city, phone, email and LinkedIn only",
      },
      {
        label: "Work authorisation",
        india: "Not applicable",
        target: "State it: PR, open work permit, or requiring sponsorship",
      },
      { label: "Spelling", india: "Indian/British mix", target: "Canadian spelling — organization, program, colour" },
      { label: "Phone", india: "+91 format", target: "Keep +91 but add a Canadian number if you have one" },
      { label: "References", india: "Often listed", target: "Omit — 'available on request' is also unnecessary" },
    ],
    before: [
      "Curriculum Vitae — Photo attached",
      "DOB: 12/04/1993 | Marital status: Single | Nationality: Indian",
      "Objective: To secure a position where I can utilise my skills.",
      "Responsible for team handling and daily operations.",
    ],
    after: [
      "Operations manager | Toronto (relocating) | +91 ... | email | linkedin.com/in/...",
      "Work authorisation: eligible for an open work permit; open to employer sponsorship.",
      "Operations manager with 8 years scaling fulfilment for a 400-person retail network.",
      "Led a 22-person operations team and cut order cycle time 34% across 3 warehouses.",
    ],
    extras: [
      "Convert Indian degree names literally but add the equivalent in brackets once — 'B.Tech (equivalent to Bachelor of Engineering)'.",
      "If you have Canadian credential recognition (WES ECA), name it in the education section; it removes a common objection.",
      "Add a short 'Relocating to Toronto in March 2026' line if your move is planned — Canadian employers discount candidates who look purely speculative.",
    ],
    faqs: [
      {
        q: "Should I include a photo on a Canadian resume?",
        a: "No. Canadian employers actively avoid photos to stay compliant with human-rights hiring rules, and including one can get your application set aside without review.",
      },
      {
        q: "Do I need Canadian experience to get shortlisted?",
        a: "It helps but is not mandatory. What closes the gap is a clear work-authorisation line, results quantified the way Canadian employers expect, and terminology matched to the posting rather than to your Indian employer's internal titles.",
      },
      {
        q: "Is a CV or a resume expected in Canada?",
        a: "A resume — two pages maximum. Academic CVs are used only for research and university roles.",
      },
    ],
  },
  {
    slug: "australia-resume-format",
    country: "Australia",
    market: "Australia",
    title: "Australia Resume Format: Rewriting an Indian Resume for Australian Jobs",
    metaTitle: "Australia Resume Format for Indian Applicants (2026)",
    metaDescription:
      "Australian resume format for Indian candidates: length, no photo, visa and work-rights line, Australian spelling and STAR-style achievement bullets.",
    intro:
      "Australian hiring rewards detail more than the US does — three pages is unremarkable — but it is unforgiving about two things: work rights and evidence. Every claim is expected to carry a result, and recruiters check visa eligibility before anything else.",
    changes: [
      { label: "Length", india: "1–2 pages", target: "2–3 pages is normal and expected" },
      { label: "Photo", india: "Often included", target: "No photo, no DOB, no marital status" },
      {
        label: "Work rights",
        india: "Not applicable",
        target: "State visa subclass or 'requires employer sponsorship (subclass 482)'",
      },
      { label: "Spelling", india: "Indian/British mix", target: "Australian spelling — organisation, specialise, centre" },
      { label: "Achievements", india: "Duty lists", target: "STAR-style bullets: situation, action, measurable result" },
      { label: "Referees", india: "Listed with contacts", target: "Two referees may be listed, or 'available on request'" },
      { label: "Dates", india: "Mixed formats", target: "Mon YYYY – Mon YYYY, with no unexplained gaps" },
    ],
    before: [
      "Objective: Looking for a growth-oriented role in a reputed MNC.",
      "Photo | DOB: 12/04/1993 | Marital status: Married",
      "Handling client relationships and reporting.",
      "Salary: 18 LPA",
    ],
    after: [
      "Client services manager | Sydney (relocating) | Work rights: requires employer sponsorship (subclass 482)",
      "Client services manager with 9 years in B2B services across India and Southeast Asia.",
      "Grew a 14-account portfolio from A$2.1M to A$3.4M equivalent in 2 years by restructuring quarterly reviews.",
      "Reduced client churn from 18% to 7% by introducing a 30-day onboarding programme.",
    ],
    extras: [
      "Name your Australian qualification equivalence if assessed (for example, Engineers Australia or ACS for IT roles) — it is a standard screening question.",
      "Use A$ conversions for budget and revenue figures so the scale registers immediately.",
      "State relocation intent and availability; Australian recruiters routinely discount offshore applications that do not.",
    ],
    faqs: [
      {
        q: "How long should an Australian resume be?",
        a: "Two to three pages for experienced candidates. Australia does not use the US one-page convention, and cutting detail to fit one page usually removes the evidence recruiters wanted.",
      },
      {
        q: "Do I need to mention visa sponsorship on an Australian resume?",
        a: "Yes. Write it in one line near the top — 'requires employer sponsorship (subclass 482)' or your current visa subclass. Leaving it out wastes recruiter time and usually means a rejection later in the process.",
      },
      {
        q: "Should I include referees on an Australian resume?",
        a: "Either list two referees with their titles and contact details, or write 'referees available on request'. Both are accepted; listing them is slightly more common in Australia than in India.",
      },
    ],
  },
  {
    slug: "uk-resume-format",
    country: "United Kingdom",
    market: "the United Kingdom",
    title: "UK CV Format: Rewriting an Indian Resume for British Jobs",
    metaTitle: "UK CV Format for Indian Applicants (2026)",
    metaDescription:
      "The UK CV format for Indian candidates: two pages, no photo or personal details, right-to-work line, British spelling and ATS-safe structure recruiters expect.",
    intro:
      "In the UK the document is called a CV, not a resume, and it is expected to be two pages of evidence with no personal details attached. Right-to-work status is the first thing an agency checks, and most employers screen through Workday, Greenhouse or a recruitment agency's own database before anyone reads your bullets.",
    changes: [
      { label: "Name", india: "Resume", target: "CV — two pages, reverse-chronological" },
      { label: "Length", india: "1–2 pages", target: "2 pages; 1 page only for early career" },
      { label: "Photo", india: "Often included", target: "Never — UK employers remove them to stay compliant" },
      {
        label: "Personal details",
        india: "DOB, marital status, father's name",
        target: "Remove all. Name, city, phone, email and LinkedIn only",
      },
      {
        label: "Right to work",
        india: "Not applicable",
        target: "State it: Skilled Worker visa held, or 'requires Skilled Worker sponsorship'",
      },
      { label: "Spelling", india: "Indian/British mix", target: "British spelling throughout — organisation, programme, analyse" },
      { label: "Salary", india: "LPA in INR", target: "Never on the CV; UK CVs do not state current or expected pay" },
      { label: "Dates", india: "Mixed formats", target: "Mon YYYY – Mon YYYY, gaps explained in one line" },
    ],
    before: [
      "Curriculum Vitae — Photo attached",
      "DOB: 12/04/1993 | Marital status: Single | Current CTC: 16 LPA",
      "Objective: Seeking a challenging position in a reputed UK organisation.",
      "Responsible for managing the reporting team.",
    ],
    after: [
      "Finance analyst | London (relocating) | +91 ... | email | linkedin.com/in/...",
      "Right to work: requires Skilled Worker sponsorship; available in 30 days.",
      "Finance analyst with 6 years in FP&A for a £180M-equivalent retail business.",
      "Rebuilt the monthly forecasting model, cutting close time from 9 days to 4 and variance from 11% to 3%.",
    ],
    extras: [
      "Add a short personal statement of three or four lines at the top — it is a genuine UK convention, unlike the US, where summaries are optional.",
      "Convert Indian degrees once in brackets, for example 'B.Com (equivalent to UK Bachelor's, NARIC-comparable)'.",
      "Name the certification bodies UK recruiters recognise (ACCA, CIMA, PRINCE2, AWS) rather than internal employer training names.",
    ],
    faqs: [
      {
        q: "Is a CV different from a resume in the UK?",
        a: "In practice, yes. A UK CV is the standard two-page job application document, while 'resume' is the American term. Academic CVs are longer, but for ordinary jobs two pages is the expectation.",
      },
      {
        q: "Should I put my photo or date of birth on a UK CV?",
        a: "No. UK employers strip both to comply with equality legislation, and agencies often ask you to resend a version without them, which delays your application.",
      },
      {
        q: "Do I need to mention visa sponsorship on a UK CV?",
        a: "Yes, in one line near the top. Write 'holds Skilled Worker visa' or 'requires Skilled Worker sponsorship'. Many UK employers are not licensed sponsors, and stating it early avoids wasted rounds.",
      },
      {
        q: "Should I include my salary on a UK CV?",
        a: "No. Current and expected salary are discussed with the recruiter, never printed on the CV, and listing an INR figure only confuses UK screening.",
      },
    ],
  },
  {
    slug: "germany-resume-format",
    country: "Germany",
    market: "Germany",
    title: "German CV Format: Rewriting an Indian Resume for Jobs in Germany",
    metaTitle: "German CV (Lebenslauf) Format for Indians (2026)",
    metaDescription:
      "Writing a German Lebenslauf as an Indian candidate: tabular layout, photo norms, Blue Card line, degree recognition and language levels.",
    intro:
      "Germany is the one Western market where a photo is still common and where the CV is a factual, tabular Lebenslauf rather than a persuasive document. Recruiters look for degree recognition, German language level and Blue Card eligibility before they look at your achievements.",
    changes: [
      { label: "Name", india: "Resume", target: "Lebenslauf — a factual, tabular CV" },
      { label: "Length", india: "1–2 pages", target: "1–2 pages, strictly reverse-chronological with no gaps" },
      {
        label: "Photo",
        india: "Often included",
        target: "Still common in Germany, though optional since the AGG — a professional headshot is safe",
      },
      {
        label: "Personal details",
        india: "DOB, marital status, father's name",
        target: "Date of birth and nationality are still usual; drop father's name and marital status",
      },
      {
        label: "Work authorisation",
        india: "Not applicable",
        target: "State EU Blue Card eligibility or that you need a work visa",
      },
      {
        label: "Language",
        india: "'Good English'",
        target: "Use CEFR levels — German A2/B1/B2, English C1",
      },
      {
        label: "Degrees",
        india: "B.Tech, B.Com",
        target: "Add the Anabin recognition status, for example 'B.Tech — Anabin H+/equivalent to German Bachelor'",
      },
      { label: "Signature", india: "Not used", target: "Place, date and a signature at the end is still a German convention" },
    ],
    before: [
      "Objective: Seeking a challenging role in a reputed German MNC.",
      "Father's Name: — | Marital Status: Married",
      "Languages: English (good), Hindi",
      "Handled backend development and support tasks.",
    ],
    after: [
      "Backend engineer | Berlin (relocating) | Nationality: Indian | EU Blue Card eligible",
      "Languages: English C1, German B1 (B2 course in progress), Hindi native",
      "Education: B.Tech Computer Science — Anabin-listed, equivalent to a German Bachelor's degree",
      "Rebuilt a payments service handling 2.4M daily requests, cutting p95 latency from 480ms to 120ms.",
    ],
    extras: [
      "Keep the layout tabular and plain: dates in the left column, role and employer in the right. German recruiters read structure, not design.",
      "Mention any German language course in progress with the target level and month — it materially changes shortlisting for non-tech roles.",
      "If applying to a Mittelstand company rather than a startup, add place, date and a signature line at the bottom; it is still expected there.",
    ],
    faqs: [
      {
        q: "Should I include a photo on a German CV?",
        a: "It is optional since the AGG anti-discrimination law, but still common and widely expected outside international tech firms. A plain professional headshot is the safe default; omit it if you are applying to a global employer using a standard ATS.",
      },
      {
        q: "Do I need German to get a job in Germany?",
        a: "For most engineering and IT roles in larger cities, English is enough at B2-plus English level. For finance, healthcare, sales and public-sector roles, German B2 is usually a hard requirement. State your CEFR level honestly — it is verified in interview.",
      },
      {
        q: "What is the EU Blue Card and should it be on my CV?",
        a: "The EU Blue Card is a work permit for graduates with a recognised degree and a qualifying salary offer. If you meet the degree condition, write 'EU Blue Card eligible' near the top — it tells the employer the paperwork is straightforward.",
      },
      {
        q: "How do I show that my Indian degree is recognised?",
        a: "Check your university in the Anabin database and state the result in your education section, for example 'H+ listed, equivalent to a German Bachelor's degree'. It removes the most common screening objection for Indian applicants.",
      },
    ],
  },
  {
    slug: "singapore-resume-format",
    country: "Singapore",
    market: "Singapore",
    title: "Singapore Resume Format: Rewriting an Indian Resume for Singapore Jobs",
    metaTitle: "Singapore Resume Format for Indian Applicants (2026)",
    metaDescription:
      "Singapore resume format for Indian candidates: two pages, work-pass line (EP, S Pass), SGD figures, notice period and ATS-safe structure.",
    intro:
      "Singapore hiring is fast and pass-driven. Under the Fair Consideration Framework and COMPASS, employers assess whether you qualify for an Employment Pass before your experience matters, so the top of your resume needs to answer pass eligibility, notice period and salary expectation without being asked.",
    changes: [
      { label: "Length", india: "1–2 pages", target: "2 pages, reverse-chronological" },
      { label: "Photo", india: "Often included", target: "Not required; most local recruiters prefer without" },
      {
        label: "Personal details",
        india: "DOB, marital status, father's name",
        target: "Nationality and pass status only; drop the rest",
      },
      {
        label: "Work pass",
        india: "Not applicable",
        target: "State it: 'requires Employment Pass sponsorship' or your current pass type",
      },
      { label: "Salary", india: "LPA in INR", target: "Quote expected SGD monthly salary; EP has a monthly minimum" },
      { label: "Notice period", india: "Rarely stated", target: "State it near the top — Singapore recruiters filter on availability" },
      { label: "Spelling", india: "Indian/British mix", target: "British spelling; keep terminology aligned to the posting" },
    ],
    before: [
      "Objective: Seeking a challenging role in a reputed organisation in Singapore.",
      "DOB: 12/04/1993 | Marital status: Married | Current CTC: 22 LPA",
      "Handled regional reporting and stakeholder management.",
      "References available on request.",
    ],
    after: [
      "Regional finance manager | Singapore (relocating) | Nationality: Indian | Requires Employment Pass sponsorship",
      "Available in 30 days | Expected salary: SGD 8,500/month",
      "Regional finance manager with 8 years covering India, Singapore and Malaysia entities.",
      "Consolidated reporting across 3 ASEAN entities, cutting the regional close from 12 days to 6.",
    ],
    extras: [
      "Name the ASEAN markets you have actually worked across — regional coverage is the single strongest differentiator for Singapore roles.",
      "Convert budgets and revenue to SGD once so the scale registers with a local hiring manager.",
      "Under COMPASS, degree and salary benchmarks matter. Keep your university name and degree title exact, and do not inflate your expected salary beyond the role's band.",
    ],
    faqs: [
      {
        q: "Do I need an Employment Pass before applying to Singapore jobs?",
        a: "No. The employer applies for the pass once they decide to hire you. What helps is stating clearly on the resume that you would require Employment Pass sponsorship, so the employer knows to run the COMPASS check early.",
      },
      {
        q: "Should I include a photo on a Singapore resume?",
        a: "It is not required and most recruiters prefer a clean text resume. Photos also break parsing in some ATS setups, so leaving it out is the safer default.",
      },
      {
        q: "Should I state my expected salary in SGD?",
        a: "Yes, when the application asks. Quote a monthly SGD figure rather than an annual Indian package, because Employment Pass eligibility is assessed on monthly salary.",
      },
    ],
  },
  {
    slug: "india-resume-format",
    country: "India",
    market: "India",
    domestic: true,
    title: "India Resume Format: How to Build a Modern Resume for Indian Corporate Jobs",
    metaTitle: "India Resume Format for Job Applications (2026)",
    metaDescription:
      "The modern India resume format: ATS-safe single-column layout, section order, what personal details to drop, and keyword alignment for Naukri and LinkedIn.",
    intro:
      "Most Indian private-sector employers — from startups to IT services to FMCG — now run resumes through an ATS before a recruiter reads them. Naukri, LinkedIn, and company career pages all parse the same single-column PDF. The modern India resume keeps the structure that survives parsing and drops the personal details that used to appear on older Indian CVs.",
    changes: [
      { label: "Length", india: "3+ pages with every certificate attached", target: "1–2 pages for early to mid-career; 2–3 pages only for senior or leadership roles" },
      { label: "Layout", india: "Tables, text boxes, icons, photos, multi-column designs", target: "Single-column plain text PDF with standard headings" },
      { label: "Photo", india: "Often included", target: "Not expected for most private-sector corporate roles" },
      { label: "Personal details", india: "Father's name, marital status, full address, date of birth", target: "Name, city/state, phone, email and LinkedIn only" },
      { label: "Opening section", india: "Career objective: 'Seeking a challenging role'", target: "2–3 line professional summary tied to the role" },
      { label: "Section order", india: "Objective, education, then experience", target: "Summary → Core Skills → Key Achievements → Experience → Education → Projects → Additional" },
      { label: "Achievements", india: "Duty lists and responsibilities", target: "Bullets starting with a verb and ending with a number" },
      { label: "Keywords", india: "Buried inside paragraphs", target: "Repeated exactly as the job posting writes them" },
    ],
    before: [
      "Career Objective: To secure a challenging position in a reputed organisation.",
      "Father's Name: Rajesh Kumar | Marital Status: Single | DOB: 12/04/1993",
      "Address: 42B, Lajpat Nagar, New Delhi — 110024",
      "Responsible for sales and team coordination across North India.",
    ],
    after: [
      "Sales manager with 6 years in FMCG distribution, currently based in Delhi NCR. Led a 12-person team across 3 regions and grew primary sales by 31% in FY24.",
      "Core Skills: primary sales, distributor management, team leadership, NIELSEN data, Excel, Hindi/English",
      "Key Achievements: expanded distribution from 180 to 340 stores in 10 months; reduced stock-out rate from 14% to 4%.",
      "Experience: Sales Manager — ABC Foods Pvt. Ltd., Delhi, Apr 2021 – Present",
    ],
    extras: [
      "Keep city and state but drop the full street address. Recruiters only need to know you are in the right geography or willing to relocate.",
      "For Naukri and LinkedIn, mirror the exact job-title and skill phrases from the posting in your headline and skills section — Indian ATS setups are keyword-heavy.",
      "Upload a plain PDF, not a Word file with tracked changes or a designed Canva layout. Parsers on Indian job boards often misread columns and icons.",
    ],
    faqs: [
      {
        q: "Should I put a photo on my Indian resume?",
        a: "For most private-sector corporate roles in India, no. Government, defence and some front-desk roles may still ask for one, but the default for IT, consulting, sales, marketing and operations roles is a text-only resume.",
      },
      {
        q: "How long should an Indian resume be?",
        a: "One to two pages for professionals with under 10 years of experience. Senior managers and leadership candidates can go up to three pages, but only if every line adds relevant evidence.",
      },
      {
        q: "Should I include my date of birth and father's name?",
        a: "Leave them off unless a specific employer or government form asks for them. These details do not affect shortlisting and can trigger compliance concerns at multinational companies operating in India.",
      },
      {
        q: "How do I make my resume ATS-friendly for Naukri and LinkedIn?",
        a: "Use a single-column PDF, standard headings, and repeat the exact keywords from the job description in your Core Skills and Experience bullets. GotaOfferr's match score and keyword gap features check this automatically when you tailor a resume to a posting.",
      },
    ],
  },
];


export function getCountryGuide(slug: string) {
  return countryGuides.find((guide) => guide.slug === slug);
}
