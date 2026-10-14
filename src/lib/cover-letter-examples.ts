export interface CoverLetterStructureStep {
  /** Section label, e.g. "The opening line". */
  label: string;
  /** One line explaining what belongs here. */
  guidance: string;
  /** A short, concrete sample line the reader can adapt. */
  sample: string;
}

export interface CoverLetterExample {
  slug: string;
  role: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  summaryLine: string;
  intro: string;
  structure: CoverLetterStructureStep[];
  phrases: string[];
  avoid: string[];
  localeNote: string;
  faqs: { q: string; a: string }[];
  /** Matching slug in resume-examples, when one exists. */
  resumeExampleSlug?: string;
}

export const coverLetterExamples: CoverLetterExample[] = [
  {
    slug: "software-engineer",
    role: "Software engineer",
    title: "Software engineer cover letter example and structure",
    metaTitle: "Software Engineer Cover Letter Example (2026) | Terbey",
    metaDescription:
      "A short software engineer cover letter structure with sample lines, phrases that work, and clichés to cut. Written for Indian and international applications.",
    summaryLine:
      "Four short paragraphs that prove you can ship, without repeating your resume line by line.",
    intro:
      "Engineering hiring managers skim. A software engineer cover letter earns its place only when it explains something the resume cannot: why this system, this product or this team, and what you built that is closest to the problem they are hiring for. Keep it under 250 words and lead with the work.",
    structure: [
      {
        label: "The opening line",
        guidance: "Name the role and the single closest thing you have built. No throat-clearing.",
        sample:
          "I'm applying for the Backend Engineer role. I spent the last two years running the payments service at Zeta, handling about 40,000 transactions a day on Go and Postgres.",
      },
      {
        label: "Why this company",
        guidance:
          "One specific, checkable reason — a product decision, a scale problem, an engineering blog post. Skip mission-statement flattery.",
        sample:
          "Your move to event-driven inventory is the exact migration I ran last year, so I know where it hurts around idempotency and replay.",
      },
      {
        label: "The proof paragraph",
        guidance:
          "Two or three sentences mapping the posting's top requirements to work you actually did, with the numbers kept intact.",
        sample:
          "I cut p95 checkout latency from 820ms to 260ms by moving reads to a read replica and batching fraud checks, and I wrote the load tests that kept it there through Diwali traffic.",
      },
      {
        label: "The close",
        guidance:
          "State availability, notice period if relevant, and one plain sign-off line. No 'eagerly awaiting'.",
        sample:
          "I'm on a 30-day notice period and happy to walk through the migration design in a call. Thanks for reading.",
      },
    ],
    phrases: [
      "I owned the service end to end, from schema to on-call",
      "I reduced <metric> from X to Y by <specific change>",
      "I wrote the migration plan and the rollback path",
      "The closest thing I've built to this is …",
    ],
    avoid: [
      "\"Passionate about leveraging cutting-edge technologies\"",
      "\"Fast learner and team player with excellent communication skills\"",
      "\"I would be a great fit for your esteemed organisation\"",
    ],
    localeNote:
      "India: mention notice period and current location — recruiters screen on both. International: drop age, photo and marital status, add one line on work authorisation or relocation if you need sponsorship.",
    faqs: [
      {
        q: "Do software engineers still need a cover letter?",
        a: "For big job boards, often not. For a company you actually want, yes — it is the only place you can explain a career gap, a stack switch, or why this specific product interests you.",
      },
      {
        q: "How long should it be?",
        a: "150 to 250 words. Anything longer and a hiring manager reading 60 applications will skip to the resume.",
      },
      {
        q: "Should I paste code or links?",
        a: "One link, at most — the repository or demo that is closest to their problem. Bury it in a sentence rather than making a list.",
      },
    ],
    resumeExampleSlug: "software-engineer",
  },
  {
    slug: "fresher",
    role: "Fresher",
    title: "Fresher cover letter example with no work experience",
    metaTitle: "Fresher Cover Letter Example (No Experience) | Terbey",
    metaDescription:
      "A fresher cover letter structure with sample lines for your first job: what to write instead of experience, phrases that work, and clichés to avoid.",
    summaryLine:
      "What to put in the proof paragraph when you have projects and internships instead of jobs.",
    intro:
      "With no work history, a fresher cover letter has one job: show that you have already done something resembling the work. Coursework alone does not do that. Projects, internships, college fests, freelance gigs and competition entries do — as long as you describe the outcome, not the syllabus.",
    structure: [
      {
        label: "The opening line",
        guidance: "Role, your degree, and the one project or internship closest to the job.",
        sample:
          "I'm applying for the Junior Data Analyst role. I finished my B.Com at Christ University this year and spent my final semester building a dashboard that tracked stock-outs for a 12-store retail chain.",
      },
      {
        label: "Why this company",
        guidance: "One honest, researched reason. 'It's a great learning opportunity' is not one.",
        sample:
          "You publish your pricing methodology openly, and that transparency is what I want to learn analysis inside.",
      },
      {
        label: "The proof paragraph",
        guidance:
          "Describe one project like a job: what the problem was, what you did, what changed. Numbers, even small ones.",
        sample:
          "For the dashboard I cleaned 18 months of messy POS exports in Python, built the SQL views, and shipped it in Power BI. The store managers cut their weekly reporting time from about three hours to twenty minutes.",
      },
      {
        label: "The close",
        guidance: "State availability and that you can start immediately. One line.",
        sample:
          "I can join immediately and I'm based in Bengaluru. Thank you for considering my application.",
      },
    ],
    phrases: [
      "For my final-year project I …, which meant …",
      "During my internship at X I was given … and I delivered …",
      "I taught myself <tool> to finish <specific thing>",
      "I can start immediately",
    ],
    avoid: [
      "\"Though I lack experience, I am a quick learner\" — never open by apologising",
      "\"I am seeking a challenging position in a reputed organisation\"",
      "Listing every subject you studied",
    ],
    localeNote:
      "India: including your CGPA and graduation year is normal and expected for fresher roles. International: lead with the project outcome instead of the marks, and state your visa or work-permit status upfront.",
    faqs: [
      {
        q: "What do I write if I have no internship at all?",
        a: "Use a college project, a freelance job, a volunteering role or a self-built side project. Describe it exactly the way you would describe paid work — problem, action, result.",
      },
      {
        q: "Should I mention my CGPA in the cover letter?",
        a: "Only in India, only if it is strong, and only in one clause. It already sits on your resume.",
      },
      {
        q: "Is a fresher cover letter really read?",
        a: "For campus and mass hiring, often not. For startups and small teams — where one person reads every application — it is frequently the deciding document.",
      },
    ],
    resumeExampleSlug: "fresher",
  },
  {
    slug: "business-analyst",
    role: "Business analyst",
    title: "Business analyst cover letter example and structure",
    metaTitle: "Business Analyst Cover Letter Example (2026) | Terbey",
    metaDescription:
      "A business analyst cover letter structure with sample lines, domain phrases that work, and the generic openers to cut. India and international variants.",
    summaryLine:
      "Show the decision you changed, not the list of tools and frameworks you know.",
    intro:
      "Business analyst hiring turns on judgement: can you take a vague ask from a stakeholder and turn it into something a team can build or a leader can act on. Your cover letter should show one such situation in full, because the resume can only list the artefacts.",
    structure: [
      {
        label: "The opening line",
        guidance: "Role, domain, and the scale of the process or product you worked on.",
        sample:
          "I'm applying for the Business Analyst role on your lending team. I spent three years on unsecured lending at HDFC, working across a book of roughly ₹400 crore.",
      },
      {
        label: "Why this company",
        guidance: "Name a business problem you can see them having and would want to work on.",
        sample:
          "Your expansion into tier-2 markets means the underwriting rules will have to be rebuilt around thinner credit files, which is exactly the work I enjoy.",
      },
      {
        label: "The proof paragraph",
        guidance:
          "One requirement-to-outcome story: the ambiguous ask, what you did to make it concrete, what the business gained.",
        sample:
          "Collections asked for 'better reports'. I sat with four agents for a week, found the real problem was ageing buckets refreshing daily instead of hourly, wrote the BRD and the SQL spec, and recovery on the 30-day bucket improved 6% in the following quarter.",
      },
      {
        label: "The close",
        guidance: "Notice period, location, and an offer to walk through a specific artefact.",
        sample:
          "I'm on 60 days' notice in Mumbai and can share a redacted BRD from that project if useful.",
      },
    ],
    phrases: [
      "The stakeholder asked for X; the underlying problem was Y",
      "I wrote the BRD/FRD and the acceptance criteria the team built against",
      "I sat with the users for <time> before writing a line of requirements",
      "The change moved <business metric> by <number>",
    ],
    avoid: [
      "\"Bridge between business and technology\" — every applicant writes it",
      "\"Proficient in Agile, Scrum, JIRA, Confluence, SQL, Excel\" as prose",
      "\"Detail-oriented professional with a proven track record\"",
    ],
    localeNote:
      "India: quote figures in ₹ / lakh / crore as the domain does, and include notice period. International: convert to the local currency, and translate India-specific regulator or product names into their function.",
    faqs: [
      {
        q: "Should I mention tools like JIRA and SQL?",
        a: "Inside a sentence about what you did with them, never as a standalone list. The list belongs on the resume where the parser reads it.",
      },
      {
        q: "How do I write one for a domain change?",
        a: "Pick the story where the domain mattered least and the method mattered most — stakeholder discovery, requirement conflict, prioritisation — then name in one line what you have already read about their domain.",
      },
      {
        q: "How long should a BA cover letter be?",
        a: "Around 200 words. One story told properly beats four mentioned in passing.",
      },
    ],
    resumeExampleSlug: "business-analyst",
  },
  {
    slug: "digital-marketing-executive",
    role: "Digital marketing executive",
    title: "Digital marketing executive cover letter example",
    metaTitle: "Digital Marketing Cover Letter Example (2026) | Terbey",
    metaDescription:
      "A digital marketing executive cover letter structure with sample lines, metric-led phrases that work, and buzzwords to cut before you send it.",
    summaryLine:
      "Marketing letters are judged as writing samples — every line has to earn attention.",
    intro:
      "For a marketing role, the cover letter is the work sample. If it opens with 'I am writing to apply for the above-mentioned position', the reader already knows how your ad copy will read. Lead with a number, keep the sentences short, and show that you understand who they sell to.",
    structure: [
      {
        label: "The opening line",
        guidance: "Open on your strongest result, stated plainly with the channel and the number.",
        sample:
          "I took our paid social CAC from ₹740 to ₹410 in five months at Boldcare, on a ₹12 lakh monthly budget. I'd like to do that for your D2C line.",
      },
      {
        label: "Why this company",
        guidance:
          "Prove you looked at their actual marketing — an ad, a landing page, a channel they are under-using.",
        sample:
          "Your Meta creatives all lead with the discount, and your best organic content is educational — there's an obvious test in bringing that angle into paid.",
      },
      {
        label: "The proof paragraph",
        guidance: "One campaign, from hypothesis to result. Include the spend and the outcome.",
        sample:
          "I rebuilt the account into three intent-based campaigns, wrote 40 creative variants across two months, and killed anything under a 1.8 ROAS within four days. Blended ROAS moved from 2.1 to 3.4 while spend grew 30%.",
      },
      {
        label: "The close",
        guidance:
          "Offer something concrete — an audit, a teardown, a first-30-days plan. Then stop.",
        sample:
          "Happy to send a short teardown of your current landing page before we speak. I'm available to start in two weeks.",
      },
    ],
    phrases: [
      "I moved <metric> from X to Y on a budget of Z",
      "The hypothesis was …; the test showed …",
      "I wrote and shipped <number> creatives / emails / pages in <time>",
      "Here's what I'd test first at your company",
    ],
    avoid: [
      "\"Data-driven marketer passionate about driving growth\"",
      "\"Leveraged synergies across omnichannel touchpoints\"",
      "\"Results-oriented professional with excellent communication skills\"",
    ],
    localeNote:
      "India: quote budgets in ₹ lakh per month and name the platforms you ran (Meta, Google, Amazon Ads). International: convert budgets to the local currency and mention any experience with that market's dominant channels.",
    faqs: [
      {
        q: "What if my results were not great?",
        a: "Use a learning story instead. A campaign you killed early, with the reasoning and the money it saved, reads better than an inflated ROAS a hiring manager will probe in the interview.",
      },
      {
        q: "Should I attach a portfolio?",
        a: "One link, in the closing line. Send a specific page, not a Drive folder.",
      },
      {
        q: "Can I be informal?",
        a: "Match their voice. A D2C brand that writes casually will not mind; a bank will. Read their own site before you pick a register.",
      },
    ],
    resumeExampleSlug: "digital-marketing-executive",
  },
  {
    slug: "customer-support",
    role: "Customer support",
    title: "Customer support cover letter example and structure",
    metaTitle: "Customer Support Cover Letter Example (2026) | Terbey",
    metaDescription:
      "A customer support cover letter structure with sample lines, metric-led phrases like CSAT and AHT, and the generic sentences to cut before applying.",
    summaryLine:
      "Support hiring runs on numbers and temperament — show both in four short paragraphs.",
    intro:
      "Support managers hire for two things they cannot teach quickly: composure with an angry customer, and consistency across hundreds of tickets. Your letter should carry one number that proves consistency and one short story that proves composure.",
    structure: [
      {
        label: "The opening line",
        guidance: "Role, channel mix, volume, and your headline quality metric.",
        sample:
          "I'm applying for the Customer Support Associate role. I handle around 60 chats and 25 emails a day at Razorpay's merchant desk, holding a CSAT of 94%.",
      },
      {
        label: "Why this company",
        guidance:
          "Show you know who their customers are and what those customers get frustrated by.",
        sample:
          "Your users are first-time sellers, which means most tickets are really onboarding confusion rather than bugs — that's the queue I've worked in for two years.",
      },
      {
        label: "The proof paragraph",
        guidance:
          "One escalation, handled. What went wrong, what you did, how it ended — and any process you fixed afterwards.",
        sample:
          "When a payout delay hit 300 merchants over a weekend, I drafted the holding update, worked the queue solo for six hours, and afterwards wrote the macro and escalation checklist the team still uses. Complaints on the next incident dropped by half.",
      },
      {
        label: "The close",
        guidance: "Confirm shift flexibility, languages, and availability. Support teams screen on these.",
        sample:
          "I'm comfortable with rotational shifts, work in English, Hindi and Marathi, and can start in 15 days.",
      },
    ],
    phrases: [
      "CSAT of X% across <volume> tickets a month",
      "I brought first-response time from X to Y",
      "I wrote the macro / help article the team uses for <situation>",
      "Comfortable with rotational and night shifts",
    ],
    avoid: [
      "\"Excellent communication skills and a customer-centric mindset\"",
      "\"I am a good listener and always go the extra mile\"",
      "\"Seeking a challenging role in a dynamic environment\"",
    ],
    localeNote:
      "India: list the languages you support and your shift flexibility — both are screening criteria for BPO and SaaS support roles. International: mention time-zone overlap and any work-authorisation status instead.",
    faqs: [
      {
        q: "What metrics should I include?",
        a: "CSAT, ticket volume, first-response time or AHT. One or two, with the volume they were measured over — a 98% CSAT on ten tickets means nothing.",
      },
      {
        q: "I'm moving from retail or hospitality — what do I write?",
        a: "The same skills, measured differently. Describe a difficult customer you turned around and any number you have: footfall handled, complaint rate, repeat customers.",
      },
      {
        q: "Should I mention shift timings?",
        a: "Yes, in the closing line. It is one of the first things a support manager checks, and volunteering it saves a screening call.",
      },
    ],
    resumeExampleSlug: "customer-support",
  },
];

export function getCoverLetterExample(slug: string): CoverLetterExample | undefined {
  return coverLetterExamples.find((example) => example.slug === slug);
}
