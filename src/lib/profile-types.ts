// Public profile data shape, helpers and demo data. No database access in this file.
// PRIVACY: a profile never carries email, phone or street address. Only city and country.

export type ProfileKind = "individual" | "company" | "organization";

export type ProfileExperience = { role: string; org: string; dates: string; bullets: string[] };
export type ProfileEducation = { school: string; degree: string; dates: string };
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
  skills: string[];
  jobs: ProfileJob[]; // only meaningful for company/organization
  indexable: boolean; // false = noindex
  demo?: boolean;
};

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
        role: "Marketing Executive",
        org: "BrightLeaf Media",
        dates: "2023 - Present",
        bullets: [
          "Managed SEO for six client websites",
          "Sent weekly email campaigns using Mailchimp",
          "Wrote blog posts and ad copy",
          "Reported monthly traffic numbers to clients",
        ],
      },
    ],
    education: [{ school: "Pune University", degree: "B.Com", dates: "2022" }],
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
    skills: ["SEO", "Email marketing", "Content", "Paid ads"],
    jobs: [
      { id: "j1", title: "SEO Executive", location: "Pune, India", type: "Full time", posted: "2 days ago" },
      { id: "j2", title: "Content Writer", location: "Remote, India", type: "Part time", posted: "1 week ago" },
    ],
    indexable: false,
    demo: true,
  },
};
