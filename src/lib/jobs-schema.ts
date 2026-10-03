import { z } from "zod";

export const jobSearchInputSchema = z
  .object({
    role: z.string().trim().min(2).max(120),
    location: z.string().trim().max(120).optional(),
    remoteOnly: z.boolean().optional(),
    experience: z.string().trim().max(60).optional(),
    salaryRange: z.string().trim().max(60).optional(),
    extraFilters: z.string().trim().max(300).optional(),
  })
  .strict();

export type JobSearchInput = z.infer<typeof jobSearchInputSchema>;

/**
 * Yearly salary bands per billing currency. The job finder shows the bands of
 * the visitor's own market — an American shouldn't be picking LPA brackets.
 */
export const SALARY_RANGES_BY_CURRENCY: Record<string, readonly string[]> = {
  INR: [
    "₹0 - 3 LPA",
    "₹3 - 6 LPA",
    "₹6 - 10 LPA",
    "₹10 - 15 LPA",
    "₹15 - 25 LPA",
    "₹25 - 40 LPA",
    "₹40 LPA+",
  ],
  USD: [
    "$30k - 60k / year",
    "$60k - 100k / year",
    "$100k - 150k / year",
    "$150k - 200k / year",
    "$200k+ / year",
  ],
  GBP: [
    "£20k - 35k / year",
    "£35k - 55k / year",
    "£55k - 80k / year",
    "£80k - 120k / year",
    "£120k+ / year",
  ],
  EUR: [
    "€25k - 45k / year",
    "€45k - 70k / year",
    "€70k - 100k / year",
    "€100k - 140k / year",
    "€140k+ / year",
  ],
  CAD: [
    "CA$40k - 70k / year",
    "CA$70k - 100k / year",
    "CA$100k - 140k / year",
    "CA$140k - 180k / year",
    "CA$180k+ / year",
  ],
  AUD: [
    "A$50k - 80k / year",
    "A$80k - 120k / year",
    "A$120k - 160k / year",
    "A$160k - 200k / year",
    "A$200k+ / year",
  ],
  AED: [
    "AED 60k - 120k / year",
    "AED 120k - 200k / year",
    "AED 200k - 350k / year",
    "AED 350k - 500k / year",
    "AED 500k+ / year",
  ],
  SGD: [
    "S$40k - 70k / year",
    "S$70k - 110k / year",
    "S$110k - 160k / year",
    "S$160k - 220k / year",
    "S$220k+ / year",
  ],
};

/** Salary bands for a currency code, falling back to USD bands. */
export function salaryRangesFor(currency?: string | null): readonly string[] {
  const code = (currency ?? "USD").toUpperCase();
  return SALARY_RANGES_BY_CURRENCY[code] ?? SALARY_RANGES_BY_CURRENCY.USD!;
}

/** Default list (India) — kept for callers without a currency in hand. */
export const SALARY_RANGE_OPTIONS = SALARY_RANGES_BY_CURRENCY.INR!;

/** Suggestions for the role field (users can type anything). */
export const ROLE_OPTIONS = [
  "Social Media Manager",
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "QA / Test Engineer",
  "Product Manager",
  "Project Manager",
  "Business Analyst",
  "UI/UX Designer",
  "Graphic Designer",
  "Digital Marketing Executive",
  "Content Writer",
  "SEO Specialist",
  "Sales Executive",
  "Business Development Manager",
  "Customer Support Executive",
  "HR Executive / Recruiter",
  "Finance / Accounts Executive",
  "Operations Executive",
] as const;

export const LOCATION_OPTIONS = [
  "Worldwide",
  "India",
  "Bengaluru, India",
  "Hyderabad, India",
  "Pune, India",
  "Mumbai, India",
  "Delhi NCR, India",
  "Noida, India",
  "Gurugram, India",
  "Chennai, India",
  "Kolkata, India",
  "Ahmedabad, India",
  "Anywhere in India",
  "United States",
  "New York, NY, United States",
  "San Francisco Bay Area, United States",
  "Seattle, WA, United States",
  "Austin, TX, United States",
  "Texas, United States",
  "California, United States",
  "Washington, United States",
  "Boston, MA, United States",
  "Chicago, IL, United States",
  "Los Angeles, CA, United States",
  "Atlanta, GA, United States",
  "Denver, CO, United States",
  "Dallas, TX, United States",
  "Houston, TX, United States",
  "Florida, United States",
  "New Jersey, United States",
  "North Carolina, United States",
  "Virginia, United States",
  "Canada",
  "Toronto, Canada",
  "Vancouver, Canada",
  "Montreal, Canada",
  "Calgary, Canada",
  "United Kingdom",
  "London, United Kingdom",
  "Manchester, United Kingdom",
  "Edinburgh, United Kingdom",
  "Dublin, Ireland",
  "Germany",
  "Berlin, Germany",
  "Munich, Germany",
  "Frankfurt, Germany",
  "Hamburg, Germany",
  "Amsterdam, Netherlands",
  "Paris, France",
  "Madrid, Spain",
  "Barcelona, Spain",
  "Lisbon, Portugal",
  "Zurich, Switzerland",
  "Stockholm, Sweden",
  "Copenhagen, Denmark",
  "Oslo, Norway",
  "Helsinki, Finland",
  "Warsaw, Poland",
  "Prague, Czech Republic",
  "Vienna, Austria",
  "Brussels, Belgium",
  "Milan, Italy",
  "United Arab Emirates",
  "Dubai, United Arab Emirates",
  "Abu Dhabi, United Arab Emirates",
  "Riyadh, Saudi Arabia",
  "Doha, Qatar",
  "Tel Aviv, Israel",
  "Istanbul, Turkey",
  "Singapore",
  "Australia",
  "Sydney, Australia",
  "Melbourne, Australia",
  "New Zealand",
  "Tokyo, Japan",
  "Seoul, South Korea",
  "Hong Kong",
  "Kuala Lumpur, Malaysia",
  "Jakarta, Indonesia",
  "Manila, Philippines",
  "Bangkok, Thailand",
  "Sao Paulo, Brazil",
  "Mexico City, Mexico",
  "Buenos Aires, Argentina",
  "Bogota, Colombia",
  "Johannesburg, South Africa",
  "Cape Town, South Africa",
  "Lagos, Nigeria",
  "Nairobi, Kenya",
  "Cairo, Egypt",
] as const;

export const EXPERIENCE_OPTIONS = [
  "Internship",
  "Fresher / 0-1 years",
  "1-3 years",
  "3-5 years",
  "5-8 years",
  "8+ years / Lead",
] as const;

/** Multi-select chips — joined into `extraFilters`. */
export const EXTRA_FILTER_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Startup",
  "MNC / Big tech",
  "Product company",
  "Service company",
  "SaaS",
  "Fintech",
  "E-commerce",
  "Healthcare",
  "Hiring urgently",
  "Visa sponsorship",
  "Night shift",
  "Day shift",
  "High salary",
  "Immediate joiner",
] as const;

export const jobListingSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  workMode: z.string(),
  experience: z.string(),
  salary: z.string(),
  source: z.string(),
  url: z.string(),
  summary: z.string(),
  /** "exact" = the searched role, "related" = an adjacent/similar role. */
  match: z.enum(["exact", "related"]).default("exact"),
});


export const jobListingsSchema = z.object({
  jobs: z.array(jobListingSchema),
});

export type JobListing = z.infer<typeof jobListingSchema>;

/** Timezones offered in the alert settings picker. */
export const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Lisbon",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "UTC",
] as const;

export const jobAlertInputSchema = z
  .object({
    role: z.string().trim().min(2).max(120),
    location: z.string().trim().max(120).optional(),
    remoteOnly: z.boolean().optional(),
    experience: z.string().trim().max(60).optional(),
    salaryRange: z.string().trim().max(60).optional(),
    extraFilters: z.string().trim().max(300).optional(),
    localHour: z.number().int().min(0).max(23),
    timezone: z.string().trim().min(1).max(64).refine((tz) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, "Unknown timezone"),
    enabled: z.boolean(),
  })
  .strict();

export type JobAlertInput = z.infer<typeof jobAlertInputSchema>;

/** Current hour (0-23) in the given IANA timezone. DST-safe. */
export function currentHourInTimezone(tz: string, now = new Date()): number | null {
  try {
    const hour = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      hour12: false,
    }).format(now);
    const parsed = Number(hour);
    return Number.isFinite(parsed) ? parsed % 24 : null;
  } catch {
    return null;
  }
}

/** The browser's IANA timezone, falling back to UTC. */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}
