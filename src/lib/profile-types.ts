// Public profile data shape, helpers and demo data. No database access in this file.
// PRIVACY: a profile never carries email, phone or street address. Only city and country.

export type ProfileKind = "individual" | "company" | "organization";

export type ProfileExperience = {
  id: string;
  role: string;
  org: string;
  empType: string; // Full-time, Part-time, Contract, Internship, Freelance
  location: string;
  locType: string; // On-site, Hybrid, Remote
  start: string; // YYYY-MM
  end: string; // YYYY-MM, empty if current
  current: boolean;
  description: string;
};
export type ProfileEducation = {
  id: string;
  school: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  grade: string;
  activities: string;
  description: string;
};
export type ProfileLink = { label: string; url: string };
export type ProjectType = "Software" | "Research" | "Academic" | "Design" | "Open source" | "Business" | "Personal" | "Other";
export const PROJECT_TYPES: ProjectType[] = ["Software", "Research", "Academic", "Design", "Open source", "Business", "Personal", "Other"];
export type ProfileProject = {
  id: string;
  name: string;
  type: ProjectType;
  role: string; // e.g. Lead developer, Research assistant, Solo builder
  status: "Ongoing" | "Completed" | "Paused";
  start: string;
  end: string;
  associated: string; // company, university or "Personal"
  summary: string; // what it is and why
  contribution: string; // what you personally did
  tools: string[]; // tech, methods or tools used
  links: ProfileLink[]; // repo, live demo, paper, case study
  collaborators: string; // plain names, no accounts needed
};
export type ProfileLanguage = { id: string; name: string; level: string };
export const LANG_LEVELS = ["Elementary", "Limited working", "Professional working", "Full professional", "Native or bilingual"];
export type ProfileCert = { id: string; name: string; issuer: string; issued: string; expires: string; credentialId: string; url: string };
export type ProfileVolunteer = { id: string; org: string; role: string; cause: string; start: string; end: string; description: string };
export type ProfileHonor = { id: string; title: string; issuer: string; date: string; description: string };
export type ProfileWebsite = { label: string; url: string };
export type OpenToWork = { titles: string[]; workTypes: string[]; visibleTo: "everyone" | "recruiters" };
export const COMPANY_SIZES = ["0-1", "2-10", "11-50", "51-200", "201-500", "501-1,000", "1,001-5,000", "5,001-10,000", "10,001+"];
export const ORG_TYPES = ["Privately held", "Public company", "Nonprofit", "Partnership", "Government agency", "Educational institution", "Community or club", "Self-employed"];
export type OrgLocation = { id: string; city: string; region: string; country: string; hq: boolean };
export type OrgInfo = {
  website: string;
  industry: string;
  size: string;
  orgType: string;
  founded: string;
  buttons: ProfileWebsite[]; // custom call-to-action buttons, up to 3
  locations: OrgLocation[];
};
export type JobSalary = { min: number; max: number; currency: string; period: "hour" | "month" | "year" };
export type ProfileJob = {
  id: string;
  title: string;
  location: string;
  type: string; // Full time, Part time, Contract, Temporary, Internship, Volunteer, Other
  posted: string; // human text for the list, e.g. "2 days ago"
  workplace?: "On-site" | "Hybrid" | "Remote";
  description?: string;
  skills?: string[];
  salary?: JobSalary; // shown by default; the employer must switch it off on purpose
  applyUrl?: string; // external application link or mailto:
  datePosted?: string; // YYYY-MM-DD, used for JSON-LD
};

export type PublicProfile = {
  slug: string;
  kind: ProfileKind;
  name: string;
  headline: string;
  location: string; // "City, Country" only
  about: string;
  experience: ProfileExperience[];
  education: ProfileEducation[];
  skills: string[]; // first 3 are shown as featured
  projects: ProfileProject[];
  languages?: ProfileLanguage[];
  certs?: ProfileCert[];
  volunteer?: ProfileVolunteer[];
  honors?: ProfileHonor[];
  pronouns?: string;
  websites?: ProfileWebsite[]; // public links only; email and phone are never part of a profile
  openToWork?: OpenToWork | null;
  org?: OrgInfo; // company and organization pages only
  jobs: ProfileJob[]; // only meaningful for company/organization
  indexable: boolean; // false = noindex
  demo?: boolean;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2023-04" -> "Apr 2023" */
export function fmtMonth(v: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(v || "");
  if (!m) return v || "";
  return `${MONTHS[Number(m[2]) - 1] ?? ""} ${m[1]}`.trim();
}
export function fmtRange(start: string, end: string, current: boolean, ongoingWord = "Present"): string {
  const s = fmtMonth(start);
  const e = current ? ongoingWord : fmtMonth(end);
  return [s, e].filter(Boolean).join(" - ");
}
/** Only http(s) links are ever rendered as links. */
export function safeUrl(u: string): string | null {
  try {
    const x = new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`);
    return x.protocol === "http:" || x.protocol === "https:" ? x.toString() : null;
  } catch {
    return null;
  }
}

/** Lowercase, a-z 0-9 and dashes only, no leading dash, max 60. */
export function cleanSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{2,60}$/.test(slug);
}

/** name + 4 random letters/digits so two people with one name never clash and URLs cannot be guessed. */
export function makeSlug(name: string, rand: () => number = Math.random): string {
  const base = cleanSlug(name) || "member";
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += alphabet[Math.floor(rand() * alphabet.length)];
  return `${base.slice(0, 50)}-${suffix}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "G";
}

/** schema.org JSON-LD. Person for individuals, Organization for companies and organizations. */
export function profileJsonLd(p: PublicProfile, url: string) {
  if (p.kind === "individual") {
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      name: p.name,
      description: p.headline,
      url,
      jobTitle: p.headline,
      homeLocation: p.location ? { "@type": "Place", name: p.location } : undefined,
      knowsAbout: p.skills.slice(0, 20),
      alumniOf: p.education.map((e) => ({ "@type": "EducationalOrganization", name: e.school })),
      worksFor: p.experience[0] ? { "@type": "Organization", name: p.experience[0].org } : undefined,
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: p.name,
    description: p.about.slice(0, 300),
    url,
    address: p.location ? { "@type": "PostalAddress", addressLocality: p.location } : undefined,
  };
}

/** Demo profiles for the preview only. Always noindex. Fake people and fake companies. */
export const DEMO_PROFILES: Record<string, PublicProfile> = {
  "demo-riya-mehta-x7k2": {
    slug: "demo-riya-mehta-x7k2",
    kind: "individual",
    name: "Riya Mehta",
    headline: "Digital Marketing Executive | SEO and email campaigns",
    location: "Pune, India",
    about:
      "Two years in digital marketing for small businesses. I run SEO for client websites, send weekly email campaigns and report traffic every month.",
    experience: [
      {
        id: "e1",
        role: "Marketing Executive",
        org: "BrightLeaf Media",
        empType: "Full-time",
        location: "Pune, India",
        locType: "Hybrid",
        start: "2023-06",
        end: "",
        current: true,
        description:
          "Managed SEO for six client websites\nSent weekly email campaigns using Mailchimp\nWrote blog posts and ad copy\nReported monthly traffic numbers to clients",
      },
    ],
    education: [
      { id: "d1", school: "Pune University", degree: "B.Com", field: "Commerce", start: "2019-06", end: "2022-05", grade: "", activities: "", description: "" },
    ],
    projects: [
      {
        id: "p1",
        name: "Local bakery SEO study",
        type: "Business",
        role: "Lead",
        status: "Completed",
        start: "2024-01",
        end: "2024-04",
        associated: "BrightLeaf Media",
        summary: "A four month SEO project for a small bakery website.",
        contribution: "Fixed page titles, wrote six blog posts and set up the monthly traffic report.",
        tools: ["SEO", "Google Search Console", "Excel"],
        links: [],
        collaborators: "",
      },
    ],
    skills: ["SEO", "Google Ads", "Mailchimp", "Excel", "Content writing"],
    jobs: [],
    indexable: false,
    demo: true,
  },
  "demo-brightleaf-media-k4m9": {
    slug: "demo-brightleaf-media-k4m9",
    kind: "company",
    name: "BrightLeaf Media",
    headline: "Digital marketing studio for small businesses",
    location: "Pune, India",
    about:
      "We help small businesses get found on Google and keep customers coming back with email. Clear reports and no jargon.",
    experience: [],
    education: [],
    projects: [],
    org: {
      website: "https://brightleaf.example.com",
      industry: "Marketing and advertising",
      size: "11-50",
      orgType: "Privately held",
      founded: "2018",
      buttons: [{ label: "Visit website", url: "https://brightleaf.example.com" }],
      locations: [
        { id: "l1", city: "Pune", region: "Maharashtra", country: "India", hq: true },
        { id: "l2", city: "Mumbai", region: "Maharashtra", country: "India", hq: false },
      ],
    },
    skills: ["SEO", "Email marketing", "Content", "Paid ads"],
    jobs: [
      {
        id: "j1",
        title: "SEO Executive",
        location: "Pune, India",
        type: "Full time",
        posted: "2 days ago",
        workplace: "Hybrid",
        description:
          "Run SEO for 6 to 8 small business websites.\nFix page titles, speed and broken links.\nWrite and publish two blog posts a week.\nSend a plain monthly traffic report to each client.\n\nYou should know: Google Search Console, basic HTML, Excel.\nBenefits: 24 paid leave days, coffee on us, learning budget.",
        skills: ["SEO", "Google Search Console", "Excel", "Content writing"],
        salary: { min: 300000, max: 480000, currency: "INR", period: "year" },
        applyUrl: "https://brightleaf.example.com/careers/seo-executive",
        datePosted: "2026-10-12",
      },
      {
        id: "j2",
        title: "Content Writer",
        location: "Remote, India",
        type: "Part time",
        posted: "1 week ago",
        workplace: "Remote",
        description: "Write four blog posts a month for small business clients.\nResearch topics and keep a simple style.\nEdit your own work before sending.",
        skills: ["Content writing", "SEO basics"],
        applyUrl: "mailto:jobs@brightleaf.example.com",
        datePosted: "2026-10-07",
      },
    ],
    indexable: false,
    demo: true,
  },
  "demo-green-campus-club-q8d3": {
    slug: "demo-green-campus-club-q8d3",
    kind: "organization",
    name: "Green Campus Club",
    headline: "Student club for tree planting and clean-up drives",
    location: "Pune, India",
    about:
      "We are students who plant trees and clean up lakes and campuses. Anyone can join. We run one drive every month and share what we did.",
    experience: [],
    education: [],
    projects: [],
    org: {
      website: "https://greencampus.example.org",
      industry: "Non-profit and community",
      size: "11-50",
      orgType: "Club",
      founded: "2021",
      buttons: [{ label: "Join the club", url: "https://greencampus.example.org/join" }],
      locations: [{ id: "l1", city: "Pune", region: "Maharashtra", country: "India", hq: true }],
    },
    skills: ["Community drives", "Tree planting", "Awareness events"],
    jobs: [
      {
        id: "j3",
        title: "Drive Volunteer",
        location: "Pune, India",
        type: "Volunteer",
        posted: "3 days ago",
        workplace: "On-site",
        description:
          "Help run the monthly clean-up drive.\nBring people, set up the site, and count what we collect.\nNo pay. We give you a certificate and lunch.",
        skills: ["Teamwork", "Event help"],
        applyUrl: "mailto:join@greencampus.example.org",
        datePosted: "2026-10-11",
      },
    ],
    indexable: false,
    demo: true,
  },
};

/** Find a demo job and the company that posted it. */
export function findDemoJob(id: string): { job: ProfileJob; company: PublicProfile } | null {
  for (const c of Object.values(DEMO_PROFILES)) {
    const job = c.jobs.find((j) => j.id === id);
    if (job) return { job, company: c };
  }
  return null;
}

const EMP_TYPE_LD: Record<string, string> = {
  "Full time": "FULL_TIME", "Part time": "PART_TIME", Contract: "CONTRACTOR", Temporary: "TEMPORARY", Internship: "INTERN", Volunteer: "VOLUNTEER", Other: "OTHER",
};

/** schema.org JobPosting. Pay is only included when the employer chose to show it. */
export function jobJsonLd(job: ProfileJob, company: PublicProfile, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: (job.description || job.title).replace(/\n/g, "<br>"),
    datePosted: job.datePosted,
    employmentType: EMP_TYPE_LD[job.type] ?? "OTHER",
    hiringOrganization: { "@type": "Organization", name: company.name, sameAs: company.org?.website },
    jobLocationType: job.workplace === "Remote" ? "TELECOMMUTE" : undefined,
    jobLocation: job.workplace === "Remote" ? undefined : { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location } },
    applicantLocationRequirements: job.workplace === "Remote" ? { "@type": "Country", name: job.location.replace(/^Remote,\s*/, "") } : undefined,
    baseSalary: job.salary
      ? {
          "@type": "MonetaryAmount",
          currency: job.salary.currency,
          value: { "@type": "QuantitativeValue", minValue: job.salary.min, maxValue: job.salary.max, unitText: job.salary.period.toUpperCase() },
        }
      : undefined,
    url,
  };
}
