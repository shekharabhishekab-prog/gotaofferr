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
export type ProfileJob = { id: string; title: string; location: string; type: string; posted: string };

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
    skills: ["SEO", "Email marketing", "Content", "Paid ads"],
    jobs: [
      { id: "j1", title: "SEO Executive", location: "Pune, India", type: "Full time", posted: "2 days ago" },
      { id: "j2", title: "Content Writer", location: "Remote, India", type: "Part time", posted: "1 week ago" },
    ],
    indexable: false,
    demo: true,
  },
};
