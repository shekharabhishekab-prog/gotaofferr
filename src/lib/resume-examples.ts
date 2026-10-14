import { extraResumeExamples } from "./resume-examples-extra";

export interface ResumeExampleSection {
  heading: string;
  lines: string[];
}

export interface ResumeExample {
  slug: string;
  role: string;
  title: string;
  /** True when the example is a real resume rebuilt with Terbey (used for the showcase). */
  builtWithAi?: boolean;
  metaTitle: string;
  metaDescription: string;
  summaryLine: string;
  atsKeywords: string[];
  writingTips: string[];
  /** What a recruiter scans for first in this role. */
  recruiterFocus?: string[];
  /** Common resume mistakes for this role. */
  mistakes?: string[];
  /** Role-specific FAQs, rendered on the page and as FAQPage schema. */
  faqs?: { q: string; a: string }[];
  sections: ResumeExampleSection[];
}

export const resumeExamples: ResumeExample[] = [
  {
    slug: "software-engineer",
    role: "Software Engineer",
    title: "Software Engineer Resume Example (ATS-Optimized Master Resume)",
    metaTitle: "Software Engineer Resume Example — Terbey",
    metaDescription:
      "A full ATS-optimized software engineer resume example with section order, keyword list, and bullet formulas you can copy into your own master resume.",
    summaryLine:
      "Backend-leaning full-stack engineer with 5 years shipping production services used by 400k+ monthly users.",
    atsKeywords: [
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "AWS",
      "CI/CD",
      "REST APIs",
      "Unit testing",
      "System design",
      "Agile / Scrum",
    ],
    writingTips: [
      "Lead every experience bullet with a verb and end it with a measurable result — latency, revenue, users, or hours saved.",
      "Name the exact stack in Core Skills; ATS keyword matching is literal, so 'JavaScript' does not match a posting asking for 'TypeScript'.",
      "Keep one column, no tables, no icons. Parsers drop text inside graphics and sidebars.",
      "Put Key Achievements right after Core Skills so a recruiter sees impact within the first screen.",
    ],
    recruiterFocus: [
      "Languages and frameworks named exactly as the job post spells them, near the top.",
      "Scale and impact: users, requests per second, latency or cost improvements.",
      "Ownership: features or services you designed and shipped, not just contributed to.",
    ],
    mistakes: [
      "Listing every technology you have touched instead of the ones you used in production.",
      "Bullets that describe tasks (\"worked on APIs\") with no measurable result.",
      "Hiding links to GitHub or shipped projects at the bottom of the page.",
    ],
    faqs: [
      { q: "How long should a software engineer resume be?", a: "One page for under ten years of experience. Lead with recent roles and put the stack and measurable impact in the first lines of each job." },
      { q: "Should I list every programming language I know?", a: "No. List the languages and tools that match the job description and that you can discuss in an interview. A shorter, relevant list ranks better than a long one." },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Software engineer with 5 years building and scaling TypeScript and Node.js services. Shipped an API rewrite that cut p95 latency 62% and owns CI/CD for a 12-engineer team.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Languages: TypeScript, JavaScript, Python, SQL",
          "Frameworks: React, Next.js, Node.js, Express, Prisma",
          "Infrastructure: AWS (ECS, Lambda, RDS), Docker, GitHub Actions, Terraform",
          "Practices: System design, code review, unit and integration testing, Agile/Scrum",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Cut p95 API latency from 840ms to 320ms by replacing N+1 queries with batched loaders.",
          "Reduced deploy time from 22 minutes to 6 by parallelising the CI pipeline.",
          "Mentored 3 junior engineers; all 3 promoted within 18 months.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Senior Software Engineer — Northwind Systems | 2022–Present",
          "• Led the migration of a monolith checkout flow to 4 typed services, supporting 3x order volume with no downtime.",
          "• Designed the PostgreSQL schema and caching layer behind a catalogue serving 400k monthly users.",
          "• Introduced contract tests that reduced production regressions by 41% year over year.",
          "Software Engineer — Bluepeak Labs | 2019–2022",
          "• Built 20+ REST endpoints in Node.js powering the customer dashboard.",
          "• Automated release notes and versioning, saving the team ~5 hours per sprint.",
        ],
      },
      {
        heading: "Education",
        lines: ["B.Tech, Computer Science — State Institute of Technology, 2019"],
      },
      {
        heading: "Projects",
        lines: [
          "OpenLedger — Open-source double-entry accounting library in TypeScript, 1.2k GitHub stars.",
        ],
      },
      {
        heading: "Additional",
        lines: ["AWS Certified Developer – Associate", "Conference talk: 'Cheap Observability', 2024"],
      },
    ],
  },
  {
    slug: "product-manager",
    role: "Product Manager",
    title: "Product Manager Resume Example (ATS-Optimized Master Resume)",
    metaTitle: "Product Manager Resume Example — Terbey",
    metaDescription:
      "An ATS-friendly product manager resume example showing outcome-first bullets, the right section order, and the keywords hiring teams screen for.",
    summaryLine:
      "Product manager who owns discovery through launch for B2B SaaS, measured on activation and retention.",
    atsKeywords: [
      "Product roadmap",
      "User research",
      "A/B testing",
      "Product analytics",
      "Stakeholder management",
      "Go-to-market",
      "OKRs",
      "SQL",
      "Agile backlog",
      "Retention",
    ],
    writingTips: [
      "Write outcomes, not responsibilities: 'raised activation 18%' beats 'responsible for onboarding'.",
      "Name the metric you owned in the summary — PMs are screened on ownership, not feature lists.",
      "Include the tools (Amplitude, Jira, Figma, SQL) verbatim; postings list them as hard requirements.",
      "One page for under 8 years of experience; two pages only if every line carries a number.",
    ],
    recruiterFocus: [
      "Outcomes tied to numbers: revenue, retention, activation or adoption.",
      "Evidence you work across engineering, design and the business.",
      "Clear scope: product area, team size and the decisions you owned.",
    ],
    mistakes: [
      "Describing features shipped without saying what changed for users or the business.",
      "Using job-title language only, with no metrics.",
      "Skipping the discovery side: research, experiments and prioritisation.",
    ],
    faqs: [
      { q: "What metrics should a product manager resume show?", a: "Use the metrics your product was judged on, such as activation, retention, conversion or revenue, and show the before and after." },
      { q: "Do product managers need a technical background on the resume?", a: "Not necessarily, but show you can work with engineers. Mention tools, data skills such as SQL or analytics, and the technical decisions you took part in." },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Product manager with 6 years in B2B SaaS, owning activation and retention for a $12M ARR platform. Ran discovery-to-launch on 3 major releases that added 18% to trial-to-paid conversion.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Discovery: User interviews, JTBD, opportunity solution trees, usability testing",
          "Delivery: Roadmapping, backlog grooming, Agile/Scrum, Jira, Linear",
          "Analytics: SQL, Amplitude, Mixpanel, A/B testing, funnel analysis",
          "Business: OKRs, pricing, go-to-market, stakeholder and exec communication",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Raised trial-to-paid conversion from 9% to 18% by rebuilding onboarding around a single activation event.",
          "Killed two roadmap items after research, redirecting a quarter of engineering capacity to the integrations that won 4 enterprise deals.",
          "Cut churn on the SMB tier by 3.1 points in two quarters.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Senior Product Manager — Cadence Software | 2022–Present",
          "• Own the activation and retention surface: onboarding, in-app guidance, and lifecycle messaging.",
          "• Ran 40+ customer interviews per year and turned findings into a quarterly roadmap reviewed by the exec team.",
          "• Partnered with sales and support to ship an integrations marketplace that now drives 22% of new revenue.",
          "Product Manager — Ridgeline Apps | 2019–2022",
          "• Shipped the mobile reporting suite, reaching 60k monthly active users within a year.",
          "• Instrumented product analytics from scratch, giving the company its first reliable funnel view.",
        ],
      },
      {
        heading: "Education",
        lines: ["BBA, Marketing — University of Pune, 2018"],
      },
      {
        heading: "Additional",
        lines: ["Certified Scrum Product Owner (CSPO)", "Writes a monthly newsletter on SaaS activation"],
      },
    ],
  },
  {
    slug: "sales-associate",
    role: "Sales Associate",
    title: "Sales Associate Resume Example (ATS-Optimized Master Resume)",
    metaTitle: "Sales Associate Resume Example — Terbey",
    metaDescription:
      "A clean, ATS-optimized sales associate resume example with quota numbers, service keywords, and the exact section order recruiters expect.",
    summaryLine:
      "Retail sales associate consistently above quota, with upselling and customer-retention numbers on every line.",
    atsKeywords: [
      "Customer service",
      "Upselling",
      "POS systems",
      "Inventory management",
      "Quota attainment",
      "Visual merchandising",
      "CRM",
      "Conflict resolution",
      "Cash handling",
      "Product knowledge",
    ],
    writingTips: [
      "Numbers matter more than adjectives: quota %, average basket size, NPS, conversion rate.",
      "List the systems you have used (Shopify POS, Salesforce, Zoho) — retail and B2B postings filter on them.",
      "If you have gaps or short stints, group them under one 'Retail Experience' heading with clear dates.",
      "Keep it to one page and skip photos, which ATS parsers cannot read.",
    ],
    recruiterFocus: [
      "Numbers: sales targets, percent of quota reached and customer counts.",
      "Customer service strengths such as upselling and repeat customers.",
      "Reliability: shifts covered, handling cash and following store procedures.",
    ],
    mistakes: [
      "Listing duties like \"served customers\" with no result.",
      "Leaving out targets and awards you actually reached.",
      "A long objective statement instead of a short summary with numbers.",
    ],
    faqs: [
      { q: "What should a sales associate resume highlight?", a: "Highlight results: sales against target, upsell rate, customer feedback and awards. Name the product category and the store or channel you worked in." },
      { q: "Can I apply for sales jobs with no experience?", a: "Yes. Use customer-facing work, volunteering or school projects, and show communication, reliability and any numbers you can honestly support." },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Sales associate with 4 years in high-footfall retail, averaging 118% of monthly quota and a 4.8/5 customer satisfaction score. Trains new hires on POS and upselling scripts.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Selling: Upselling, cross-selling, needs discovery, objection handling, closing",
          "Service: Conflict resolution, returns and exchanges, loyalty enrolment",
          "Systems: Shopify POS, Square, Salesforce, inventory scanners, cash handling",
          "Floor: Visual merchandising, stock replenishment, opening and closing procedures",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Hit 118% of quota across 11 of 12 months in 2025; top performer in a 14-person store.",
          "Lifted average basket size 23% by rebuilding the accessory attach script now used store-wide.",
          "Enrolled 620 customers in the loyalty programme, the highest in the region.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Senior Sales Associate — Metro Lifestyle Store | 2023–Present",
          "• Sell across apparel and accessories in a store averaging 1,200 daily visitors.",
          "• Onboard and coach new associates on POS, returns policy, and consultative selling.",
          "• Own weekend floor merchandising for the promotions bay, which outperforms plan by 15%.",
          "Sales Associate — Urban Threads | 2021–2023",
          "• Handled cash and card transactions with zero till discrepancies across two years.",
          "• Managed inventory counts and reduced stock-out incidents by 30%.",
        ],
      },
      {
        heading: "Education",
        lines: ["B.Com — Delhi University, 2021"],
      },
      {
        heading: "Additional",
        lines: ["Languages: English, Hindi", "Retail Customer Experience certification, 2024"],
      },
    ],
  },
  {
    slug: "social-media-manager",
    role: "Social Media Manager",
    builtWithAi: true,
    title: "Social Media Manager Resume Example (Built With Terbey)",
    metaTitle: "Social Media Manager Resume Example — Terbey",
    metaDescription:
      "A real ATS-optimized social media manager resume rebuilt with Terbey — impressions, ROAS, and paid social keywords in the order recruiters scan.",
    summaryLine:
      "Real resume rebuilt with Terbey: 6 years across agency, e-commerce, and non-profit, with 27M+ impressions and 2.5x ROAS on the page.",
    atsKeywords: [
      "Social media strategy",
      "Meta Ads Manager",
      "Paid social advertising",
      "Community management",
      "Influencer marketing",
      "Content creation",
      "Google Analytics",
      "Sprout Social",
      "A/B testing",
      "Analytics and reporting",
    ],
    writingTips: [
      "Impressions, reach, follower growth, and ROAS belong in the first six lines — social hiring managers screen on numbers first.",
      "Name every platform and tool literally (Meta Ads Manager, Sprout Social, Hootsuite); ATS keyword matching does not infer synonyms.",
      "Quote budget size next to results — 'INR 50,000/month at 2.5x ROAS' proves you can be trusted with spend.",
      "Move Key Achievements above Experience so the biggest campaign wins land on the first screen.",
    ],
    recruiterFocus: [
      "Channel results: follower growth, engagement rate, reach and conversions.",
      "Tools by name: scheduling, analytics and design tools you used.",
      "Campaign examples with a clear goal and outcome.",
    ],
    mistakes: [
      "Listing platforms without any results.",
      "Counting follower numbers but not engagement or business impact.",
      "Skipping content strategy and reporting work.",
    ],
    faqs: [
      { q: "Which numbers belong on a social media manager resume?", a: "Engagement rate, reach, follower growth, click-through and leads or sales from campaigns, each with a time frame." },
      { q: "Should I add a portfolio link?", a: "Yes. A link to campaigns, accounts you managed or a short case study helps hiring managers verify your results." },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Social media manager with 6+ years across ad agency, e-commerce, and non-profit brands, leading strategy, visual storytelling, and community growth. Generated 27M+ impressions, scaled communities past 10,000 followers, and drove 5x sales growth through trend-led content and paid social.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Strategy: Social media strategy, content calendars, community management, brand voice",
          "Paid: Meta Ads Manager, budget planning, A/B testing, ROAS optimisation, influencer marketing",
          "Analytics: Google Analytics, Meta Business Suite, Instagram Insights, Sprout Social, Hootsuite",
          "Creative: Short-form video, copywriting, Canva, CapCut, Adobe Photoshop, team management",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Generated 27M+ Instagram impressions in 8 months and scaled daily e-commerce sales 5x, from 40 to 200+ units.",
          "Scaled a craft-sector brand past 10,000 followers with 3.2M reach through combined organic and paid strategy.",
          "Ran Meta campaigns from INR 5,000 to INR 50,000+ monthly at 2.5x ROAS and 8%+ engagement rate.",
          "Grew a new brand account to 1,000+ organic followers and 400K monthly views within 30 days of launch.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Communication Manager — Craft Sector Non-Profit | 2024–2026",
          "• Owned end-to-end social strategy across Instagram, Facebook, and LinkedIn for two brand accounts.",
          "• Delivered 3M paid and 1M organic impressions on a INR 5,000 monthly budget through tight audience targeting.",
          "• Led campaign moments (Environment Day, Women's Day) that lifted organic engagement 40%.",
          "• Mentored a 5-person writing and design team and owned the content calendar end to end.",
          "Social Media Manager — Footwear E-commerce Brand | 2023–2024",
          "• Built the B2C content engine that produced 27M+ impressions and 4x follower growth in 8 months.",
          "• Managed INR 50,000+ monthly Meta spend with creative and copy A/B tests, sustaining 2.5x ROAS.",
          "• Ran a 20+ micro and macro influencer programme adding 2M+ incremental reach.",
          "Assistant Social Media Manager — Digital Marketing Agency | 2022–2023",
          "• Managed 5+ concurrent B2C client accounts and improved lead generation 35% with full-funnel campaigns.",
          "• Held 100% client retention across assigned accounts.",
        ],
      },
      {
        heading: "Education",
        lines: ["BBA, Marketing & Digital Business — IGNOU, New Delhi"],
      },
      {
        heading: "Additional",
        lines: [
          "Google Digital Marketing & E-commerce Professional Certificate",
          "Meta Social Media Marketing Professional Certificate (in progress)",
          "Languages: English (professional), Hindi (native)",
        ],
      },
    ],
  },
  {
    slug: "brand-manager",
    role: "Brand Manager",
    builtWithAi: true,
    title: "Brand Manager Resume Example (Built With Terbey)",
    metaTitle: "Brand Manager Resume Example — Terbey",
    metaDescription:
      "See the same career rebuilt for a brand manager job description: positioning, campaign P&L, and brand-health keywords in ATS-safe order.",
    summaryLine:
      "The same social media career, rebuilt by Terbey for a brand manager posting — positioning, campaign ownership, and budget language up front.",
    atsKeywords: [
      "Brand strategy",
      "Brand positioning",
      "Integrated campaigns",
      "Go-to-market",
      "Budget management",
      "Consumer insights",
      "Brand guidelines",
      "Agency management",
      "Cross-functional leadership",
      "Brand awareness",
    ],
    writingTips: [
      "Brand roles are screened on ownership words: positioning, guidelines, campaign P&L, agency management. Use them literally.",
      "Translate channel metrics into brand outcomes — reach becomes awareness, engagement becomes brand affinity, ROAS becomes efficient spend.",
      "Show scope: budget size, number of markets, team size, and stakeholders you aligned.",
      "Keep the same facts as your master resume; only the framing changes — inventing scope is what gets caught in interviews.",
    ],
    recruiterFocus: [
      "Brand strategy results: awareness, share or revenue growth for a brand.",
      "Budget size and agencies or partners you managed.",
      "Launches you led from brief to market.",
    ],
    mistakes: [
      "Describing brand work with no business result.",
      "Leaving out budget, scope or team size.",
      "Using vague words such as \"creative\" instead of specific launches.",
    ],
    faqs: [
      { q: "What does a brand manager resume need?", a: "Show the brand or portfolio you owned, the budget, launches you led and the measurable lift in awareness, share or revenue." },
      { q: "How is a brand manager resume different from a marketing manager resume?", a: "A brand manager resume centres on positioning, brand health and launches. A marketing manager resume centres on channels, campaigns and demand generation." },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Brand marketer with 6+ years building and growing consumer brands across e-commerce, non-profit, and agency environments. Owns positioning, integrated campaign execution, and paid budgets — delivering 27M+ brand impressions, 5x sales growth, and a 40% lift in audience engagement.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Brand: Positioning, brand voice and guidelines, storytelling, brand health tracking",
          "Campaigns: Integrated campaign planning, go-to-market, seasonal moments, influencer partnerships",
          "Commercial: Budget management, ROAS and CAC efficiency, performance reporting",
          "Leadership: Agency and vendor management, cross-functional alignment, 5-person creative team",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Repositioned Koburg Footwear's creative platform, lifting daily sales 5x (40 → 200+ units) and generating 27M+ brand impressions in 8–9 months.",
          "Scaled Craftmark past the 10,000-follower milestone with 3.2M reach, building recognition across domestic and international craft markets.",
          "Delivered 2.5x ROAS on INR 50,000+ monthly Meta budgets through disciplined creative and audience testing.",
          "Launched Desi Dastan from zero to 1,000+ organic followers and 400K monthly views within 30 days on a defined brand narrative.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Communication Manager (Brand) — All India Artisans and Craftworkers Welfare Association (AIACA), Delhi | Nov 2024 – Apr 2026",
          "• Owned brand communication for AIACA and the Craftmark certification programme, setting voice, visual direction, and campaign calendar across Instagram, Facebook, and LinkedIn.",
          "• Planned tentpole campaigns (Environment Day, Women's Day) that raised engagement 40% and expanded international brand awareness.",
          "• Led brand moments with corporate partners including HCL Foundation, Flipkart Foundation, and Titan (TATA) under CSR programmes; covered Craftkatha and Shilp Charcha live.",
          "• Directed a 5-person content and design team plus external creative partners against brand guidelines.",
          "Brand & Social Media Manager — Koburg Footwear (E-commerce), Delhi | Aug 2023 – Oct 2024",
          "• Defined the brand's content platform and tone of voice, turning it into a repeatable creative system.",
          "• Owned monthly media budget allocation across awareness and conversion, holding 2.5x ROAS on INR 50,000+ spend.",
          "• Built a 20+ micro and macro influencer roster as an always-on advocacy layer, adding 2M+ incremental reach.",
          "Assistant Manager, Client Brands — Workfolic (Digital Marketing Agency), Delhi | Feb 2022 – Jun 2023",
          "• Ran brand and performance calendars for 5+ consumer clients in travel and tourism, including Vibgyor Hospitality and Flyfino, with 100% retention.",
          "• Delivered monthly brand and funnel reporting with recommendations adopted by client leadership.",
        ],
      },
      {
        heading: "Education",
        lines: ["BBA, Marketing & Digital Business — IGNOU, New Delhi (2025 – Present)"],
      },
      {
        heading: "Projects",
        lines: [
          "Desi Dastan — Founder & Content Creator (Mar 2026 – Present): crafts, culture, and sustainability page built to 1,000+ followers and 100K–400K monthly views, collaborating directly with Indian artisans and sustainability brands.",
        ],
      },
      {
        heading: "Additional",
        lines: [
          "Google Digital Marketing & E-commerce Professional Certificate",
          "Advanced Social Media Strategy Specialization",
          "Languages: English (professional), Hindi (native) | Delhi, India — open to relocation",
        ],
      },
    ],
  },
  {
    slug: "marketing-manager",
    role: "Marketing Manager",
    builtWithAi: true,
    title: "Marketing Manager Resume Example (Built With Terbey)",
    metaTitle: "Marketing Manager Resume Example — Terbey",
    metaDescription:
      "The same resume rebuilt for a marketing manager role: full-funnel ownership, budget and ROAS numbers, and the keywords marketing ATS filters look for.",
    summaryLine:
      "One career, rewritten by Terbey for a marketing manager posting — full-funnel ownership, budget accountability, and team leadership first.",
    atsKeywords: [
      "Marketing strategy",
      "Full-funnel marketing",
      "Performance marketing",
      "Budget ownership",
      "Campaign management",
      "Lead generation",
      "Marketing analytics",
      "Content marketing",
      "Stakeholder management",
      "Team leadership",
    ],
    writingTips: [
      "Marketing manager postings screen for budget, funnel, and team scope — put all three in the summary line.",
      "Use funnel language explicitly (TOFU/MOFU/BOFU, lead generation, conversion) when the posting does.",
      "Pair every channel result with a business outcome: leads, revenue, CAC, or retention.",
      "Group multi-client agency work under one heading so the ATS reads continuous experience, not short stints.",
    ],
    recruiterFocus: [
      "Channel performance: leads, cost per acquisition and return on spend.",
      "Budget owned and team size managed.",
      "Campaigns tied to pipeline or revenue.",
    ],
    mistakes: [
      "Listing channels without results.",
      "Reporting activity such as posts sent instead of leads and revenue.",
      "Leaving out the tools you use for analytics and automation.",
    ],
    faqs: [
      { q: "What results should a marketing manager resume show?", a: "Leads, cost per acquisition, conversion rates, pipeline or revenue influenced, and the budget and team you managed." },
      { q: "Which marketing skills should be on the resume?", a: "Include skills the job post names, such as SEO, paid media, email automation, analytics and content strategy, and back each with a result." },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Marketing manager with 6+ years owning full-funnel strategy, paid media, and content across e-commerce, non-profit, and agency accounts. Manages monthly media budgets up to INR 50,000+ at 2.5x ROAS, grew revenue 5x, and improved client lead generation 35% while leading a 5-person team.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Strategy: Full-funnel marketing (TOFU/MOFU/BOFU), GTM planning, positioning, campaign roadmaps",
          "Acquisition: Meta Ads Manager, paid social, influencer marketing, A/B testing, ROAS and CAC management",
          "Content: Content marketing, short-form video, copywriting, editorial calendars",
          "Analytics: Google Analytics, Meta Business Suite, funnel and cohort reporting, monthly performance reviews",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Drove 5x revenue growth at Koburg Footwear (40 → 200+ daily units) through an integrated organic and paid programme.",
          "Improved lead generation 35% across 5+ Workfolic clients by rebuilding full-funnel campaign structures.",
          "Delivered 27M+ impressions and 8%+ engagement while holding 2.5x ROAS on INR 50,000+ monthly paid spend.",
          "Built and managed a 5-person content team at AIACA, shipping a consistent multi-channel calendar in-house.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Marketing & Communication Manager — All India Artisans and Craftworkers Welfare Association (AIACA), Delhi | Nov 2024 – Apr 2026",
          "• Owned the marketing calendar across Instagram, Facebook, and LinkedIn for AIACA and Craftmark.",
          "• Allocated and reported a INR 5,000 monthly media budget, producing 3M paid and 1M organic impressions.",
          "• Led campaign launches that increased engagement 40% and supported CSR partnerships with HCL Foundation, Flipkart Foundation, and Titan (TATA).",
          "• Managed a 5-person team plus external creative partners against monthly delivery targets.",
          "Marketing Manager (Social & Paid) — Koburg Footwear (E-commerce), Delhi | Aug 2023 – Oct 2024",
          "• Ran acquisition end to end: creative strategy, Meta media buying, influencer partnerships, and reporting.",
          "• Scaled monthly spend past INR 50,000 while maintaining 2.5x ROAS through structured A/B testing.",
          "• Delivered 4x follower growth and 27M+ impressions that translated directly into 5x daily order volume.",
          "Assistant Marketing Manager — Workfolic (Digital Marketing Agency), Delhi | Feb 2022 – Jun 2023",
          "• Managed 5+ B2C travel and tourism accounts (Vibgyor Hospitality, Flyfino) with TOFU/MOFU/BOFU campaign plans.",
          "• Produced monthly ROI reports with recommendations, sustaining 100% client retention.",
        ],
      },
      {
        heading: "Education",
        lines: ["BBA, Marketing & Digital Business — IGNOU, New Delhi (2025 – Present)"],
      },
      {
        heading: "Projects",
        lines: [
          "Desi Dastan — Founder & Content Creator (Mar 2026 – Present): built a crafts, culture, and sustainability brand to 1,000+ organic followers and 100K–400K monthly views in 30 days.",
        ],
      },
      {
        heading: "Additional",
        lines: [
          "Google Digital Marketing & E-commerce Professional Certificate",
          "AI for Content Creation & Marketing",
          "Languages: English (professional), Hindi (native) | Delhi, India — open to relocation",
        ],
      },
    ],
  },
  {
    slug: "finance-analyst",
    role: "Finance Analyst",
    title: "Finance Analyst Resume Example (ATS-Optimized Master Resume)",
    metaTitle: "Finance Analyst Resume Example — Terbey",
    metaDescription:
      "An ATS-optimized finance analyst resume example with FP&A keywords, variance-analysis bullets, and the section order recruiters and parsers expect.",
    summaryLine:
      "FP&A analyst who owns the monthly forecast, variance commentary, and board reporting for a mid-market business.",
    atsKeywords: [
      "Financial modelling",
      "FP&A",
      "Variance analysis",
      "Budgeting and forecasting",
      "Cash flow",
      "Excel / Power Query",
      "SQL",
      "Power BI",
      "Month-end close",
      "IFRS / GAAP",
    ],
    writingTips: [
      "Quantify the size of what you handled — revenue owned, budget managed, entities consolidated. Finance screening is scale-sensitive.",
      "Name the systems verbatim: SAP, NetSuite, Anaplan, Power BI. Postings list them as hard filters.",
      "Show the decision your analysis drove, not just the report you produced.",
      "Put certifications (CFA, CA, CPA — including progress levels) in Additional; recruiters search for them by name.",
    ],
    recruiterFocus: [
      "Modelling and reporting skills: forecasting, budgeting and variance analysis.",
      "Tools by name: Excel, SQL, BI tools and ERP systems.",
      "Business impact: savings found, forecast accuracy and decisions supported.",
    ],
    mistakes: [
      "Listing Excel as a skill with no example of what you built.",
      "Describing reports without the decision they supported.",
      "Leaving out certifications or coursework such as CFA or CA progress.",
    ],
    faqs: [
      { q: "What should a finance analyst resume include?", a: "Forecasting and reporting work, the tools you use, the size of the budgets you supported and the decisions your analysis changed." },
      { q: "Do I need certifications on a finance analyst resume?", a: "They help when relevant, such as CFA, CA or FRM. List completed ones and show progress honestly for those in progress." },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Finance analyst with 5 years in FP&A for a $180M revenue business. Owns the rolling 12-month forecast, monthly variance commentary, and the board pack, and cut close time from 9 days to 5.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Planning: Budgeting, rolling forecasts, scenario and sensitivity modelling, cash flow planning",
          "Reporting: Month-end close, variance analysis, board and investor reporting, KPI dashboards",
          "Systems: Excel (Power Query, advanced modelling), SQL, Power BI, SAP, NetSuite, Anaplan",
          "Standards: IFRS, US GAAP, internal controls, audit support",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Cut month-end close from 9 days to 5 by automating three consolidation workbooks in Power Query.",
          "Built the pricing model behind a 4% list-price increase that added $2.1M annual gross margin.",
          "Identified $640K of duplicate vendor spend during a cost review; 100% recovered or cancelled.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Senior Finance Analyst — Harlow Industries | 2023–Present",
          "• Own the rolling 12-month P&L forecast across 4 business units, with variance commentary delivered to the CFO in 48 hours of close.",
          "• Rebuilt the annual budget model in Excel and Anaplan, cutting the planning cycle from 10 weeks to 6.",
          "• Partner with Sales Ops on quota and commission modelling covering a 45-person team.",
          "Finance Analyst — Ridgeway Foods | 2021–2023",
          "• Produced weekly cash flow forecasts with 97% accuracy against actuals over 18 months.",
          "• Automated the management reporting pack in Power BI, replacing 30 hours of manual work each month.",
        ],
      },
      {
        heading: "Education",
        lines: ["B.Com (Hons), Accounting & Finance — University of Delhi, 2021"],
      },
      {
        heading: "Projects",
        lines: [
          "Working capital review: 60-day DSO reduction plan modelled and presented to the exec team; adopted in full.",
        ],
      },
      {
        heading: "Additional",
        lines: ["CFA Level II candidate", "Advanced Financial Modelling & Valuation (Wall Street Prep)"],
      },
    ],
  },
  {
    slug: "hr-manager",
    role: "HR Manager",
    title: "HR Manager Resume Example (ATS-Optimized Master Resume)",
    metaTitle: "HR Manager Resume Example — Terbey",
    metaDescription:
      "A recruiter-ready HR manager resume example with HRBP keywords, retention and hiring metrics, and the section order that clears ATS.",
    summaryLine:
      "HR manager covering the full employee lifecycle — hiring, performance, ER and policy — for a 400-person organisation.",
    atsKeywords: [
      "Talent acquisition",
      "Employee relations",
      "HRBP",
      "Performance management",
      "Onboarding",
      "HRIS (Workday / SuccessFactors)",
      "Compensation and benefits",
      "Employment law compliance",
      "Engagement surveys",
      "Attrition analysis",
    ],
    writingTips: [
      "Lead with headcount supported and attrition or time-to-hire numbers — HR is screened on scale plus outcome.",
      "Say HRBP, talent acquisition and employee relations explicitly; parsers do not infer them from 'people operations'.",
      "Name your HRIS and ATS by product, and note the jurisdictions whose employment law you have worked under.",
      "Keep sensitive case detail out; describe the process and the result, never the individual.",
    ],
    recruiterFocus: [
      "Headcount supported and outcomes such as attrition and time to hire.",
      "Experience across hiring, performance, employee relations and policy.",
      "HR systems and the employment laws you have worked under.",
    ],
    mistakes: [
      "Listing HR duties with no metrics.",
      "Mixing in sensitive case detail instead of describing process and result.",
      "Leaving out the HRIS and applicant tracking tools you use.",
    ],
    faqs: [
      { q: "What metrics belong on an HR manager resume?", a: "Headcount supported, attrition, time to hire, engagement survey results and the size of programs you rolled out." },
      { q: "Should an HR resume mention employment law?", a: "Yes. Name the jurisdictions and areas you have worked in, such as disciplinary procedure, POSH or labour compliance." },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "HR manager supporting 400 employees across 3 sites. Cut regretted attrition from 19% to 11% in two years and reduced average time-to-hire to 26 days while running the full lifecycle from hiring to exit.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Talent: Talent acquisition, structured interviewing, employer branding, onboarding design",
          "Lifecycle: Performance management, succession planning, L&D, engagement surveys",
          "Employee relations: Grievances, disciplinaries, investigations, restructuring consultation",
          "Systems and compliance: Workday, SuccessFactors, Greenhouse, employment law, POSH, payroll inputs",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Reduced regretted attrition from 19% to 11% by redesigning onboarding and the first-90-days check-in.",
          "Brought average time-to-hire down from 44 to 26 days with a structured interview scorecard.",
          "Rolled out a company-wide performance framework adopted by 100% of managers within one cycle.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "HR Manager — Calder Group | 2022–Present",
          "• Business partner to 4 department heads covering 400 employees across engineering, sales and operations.",
          "• Own the annual review and compensation cycle, including banding, calibration and manager training.",
          "• Lead employee relations casework end to end; closed 40+ cases with no escalation to tribunal.",
          "HR Business Partner — Lumen Retail | 2019–2022",
          "• Hired 120+ roles in three years across store operations and head office.",
          "• Ran engagement surveys and action planning that lifted participation from 58% to 86%.",
        ],
      },
      {
        heading: "Education",
        lines: ["MBA, Human Resource Management — Symbiosis Institute, 2019"],
      },
      {
        heading: "Projects",
        lines: [
          "Hybrid working policy: researched, drafted and rolled out across 3 sites with manager enablement sessions.",
        ],
      },
      {
        heading: "Additional",
        lines: ["SHRM-CP", "Certified in workplace investigations", "Workday HCM core administration"],
      },
    ],
  },
  {
    slug: "graphic-designer",
    role: "Graphic Designer",
    title: "Graphic Designer Resume Example (ATS-Optimized Master Resume)",
    metaTitle: "Graphic Designer Resume Example — Terbey",
    metaDescription:
      "An ATS-safe graphic designer resume example — plain text, portfolio link placement, brand and campaign keywords, and bullets that show measurable design impact.",
    summaryLine:
      "Brand and campaign designer working across identity, packaging and performance creative, with a linked portfolio.",
    atsKeywords: [
      "Brand identity",
      "Adobe Creative Suite",
      "Figma",
      "Typography",
      "Art direction",
      "Packaging design",
      "Motion graphics",
      "Design systems",
      "Print production",
      "Campaign creative",
    ],
    writingTips: [
      "Send the designed portfolio as a link, and keep the resume itself plain single-column text — a visual PDF is what ATS parsers fail on.",
      "Put the portfolio URL in the contact line as full text (not a hidden hyperlink), so it survives parsing.",
      "Tie design work to a business result: conversion lift, production cost saved, launch delivered on date.",
      "List tools by exact product name — Illustrator, After Effects, Figma — because postings filter on them literally.",
    ],
    recruiterFocus: [
      "A portfolio link at the top and work that matches the role.",
      "Tools by name: design software and any motion or web skills.",
      "Results of the design work: conversions, engagement or brand outcomes.",
    ],
    mistakes: [
      "Sending a resume with no portfolio link.",
      "Using a heavily designed layout that an ATS cannot read.",
      "Listing tools without showing what you made with them.",
    ],
    faqs: [
      { q: "Should a graphic designer resume be designed?", a: "Keep it clean and single column so an ATS can read it. Let the portfolio link show your design skill." },
      { q: "What should a graphic designer put on a resume?", a: "Your portfolio link, tools, the types of work you made such as branding or social creative, and any measurable results." },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Graphic designer with 6 years across brand identity, packaging and performance creative. Rebuilt a design system that cut campaign turnaround from 6 days to 2, and art-directed a rebrand rolled out across 40 SKUs.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Design: Brand identity, typography, layout, packaging, design systems, art direction",
          "Digital: Social and performance creative, landing pages, email design, basic motion graphics",
          "Tools: Illustrator, Photoshop, InDesign, After Effects, Figma, Canva",
          "Production: Print specs, prepress, colour management, vendor coordination",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Cut campaign creative turnaround from 6 days to 2 by building a component-based Figma system.",
          "Art-directed a packaging rebrand across 40 SKUs, delivered on schedule for a national retail launch.",
          "Produced ad creative that lifted click-through 34% over the previous quarter's control set.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Senior Graphic Designer — Northlight Studio | 2022–Present",
          "• Lead designer for 3 retained brand accounts, from identity through to rollout across print and digital.",
          "• Built and maintain the shared Figma design system used by 6 designers and 2 marketing teams.",
          "• Direct freelance illustrators and photographers on campaign shoots and asset delivery.",
          "Graphic Designer — Pivot Media | 2019–2022",
          "• Produced 300+ performance creatives a year for paid social, tested in structured variant sets.",
          "• Redesigned the pitch deck template used across the agency, cited in 4 new-business wins.",
        ],
      },
      {
        heading: "Education",
        lines: ["B.Des, Communication Design — National Institute of Design, 2019"],
      },
      {
        heading: "Projects",
        lines: [
          "Portfolio: portfolio-url.com — identity, packaging and campaign case studies with before/after metrics.",
        ],
      },
      {
        heading: "Additional",
        lines: ["Adobe Certified Professional — Visual Design", "Motion design for social (School of Motion)"],
      },
    ],
  },
  ...extraResumeExamples,
];



export function getResumeExample(slug: string) {
  return resumeExamples.find((example) => example.slug === slug);
}
