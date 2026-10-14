import type { ResumeExample } from "./resume-examples";

/**
 * Second batch of resume examples, written to target the role and format
 * searches Indian job seekers actually run ("resume format for freshers pdf",
 * "business analyst resume", "accountant resume format", and so on).
 */
export const extraResumeExamples: ResumeExample[] = [
  {
    slug: "fresher",
    role: "Fresher",
    title: "Fresher Resume Format & Sample (ATS-Friendly, 2026)",
    metaTitle: "Fresher Resume Format & Sample PDF — Terbey",
    metaDescription:
      "A complete fresher resume format with a full sample you can copy, the sections campus and ATS recruiters expect, and a free PDF download.",
    summaryLine:
      "A first-job resume with no work experience: projects, internships and coursework doing the work that experience normally does.",
    atsKeywords: [
      "Internship",
      "Academic projects",
      "SQL",
      "Excel",
      "Python",
      "Communication",
      "Teamwork",
      "Problem solving",
      "MS Office",
      "Data analysis",
    ],
    writingTips: [
      "One page, single column, no photo, no tables. Campus ATS setups parse plain layouts and drop everything inside graphics.",
      "Put Projects and Internships above Education only if they are stronger than your marks; otherwise keep Education first.",
      "Give every project a result line — users, accuracy, time saved, marks awarded — instead of only listing the tech used.",
      "Write the percentage or CGPA exactly as your marksheet does, and use Mon YYYY date formats throughout.",
    ],
    recruiterFocus: [
      "Whether you can actually do the task, shown through a project or internship rather than adjectives.",
      "Tools named literally — Excel, SQL, Python, Figma — because fresher shortlists are usually keyword filtered first.",
      "Consistency: no gaps left unexplained, dates in one format, one page.",
    ],
    mistakes: [
      "Objective lines like 'seeking a challenging role in a reputed organisation' — replace with what you can do.",
      "Listing every subject you studied instead of the 4–6 that map to the job.",
      "Photo, date of birth, father's name and marital status on resumes for private-sector and international roles.",
    ],
    faqs: [
      {
        q: "What is the correct resume format for a fresher?",
        a: "Reverse-chronological, one page, single column: contact line, a two-line summary, core skills, projects, internships, education, then certifications. Save as PDF with selectable text so the ATS can read it.",
      },
      {
        q: "How long should a fresher resume be?",
        a: "One page. Recruiters screening campus applications spend seconds per resume, and a second page almost always repeats what the first already said.",
      },
      {
        q: "Should a fresher resume include a photo?",
        a: "Not for private-sector or international applications. Photos break parsing and are not expected in India, the US, UK, Canada or Australia.",
      },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Final-year B.Com graduate with two internships in accounts and reporting. Built an Excel dashboard used by a 6-person team and completed a 120-hour SQL certification.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Tools: Excel (VLOOKUP, pivot tables), SQL, Tally, MS Word, PowerPoint",
          "Analysis: Data cleaning, reconciliation, basic reporting, charts and summaries",
          "Workplace: Written communication, teamwork, time management, attention to detail",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Cut monthly reporting time from 6 hours to 90 minutes with an Excel template still in use by the team.",
          "Ranked in the top 5% of a 400-student SQL certification cohort.",
          "Led a 4-person project team that delivered its capstone two weeks ahead of the deadline.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Accounts Intern — Sharma & Associates | Jan 2026 – Apr 2026",
          "• Reconciled 300+ monthly vendor entries in Tally, flagging 22 mismatches before closing.",
          "• Built the Excel reporting template the team now uses for its monthly summary.",
          "Finance Intern — Brightline Retail | May 2025 – Jul 2025",
          "• Cleaned and consolidated 12 months of sales data into a single reporting sheet.",
          "• Prepared the weekly variance summary reviewed by the finance manager.",
        ],
      },
      {
        heading: "Education",
        lines: [
          "B.Com (Honours) — Delhi University, 2026 | 8.1 CGPA",
          "Class XII (CBSE) — 2023 | 88%",
        ],
      },
      {
        heading: "Projects",
        lines: [
          "Retail sales dashboard — cleaned 40k rows in SQL and built an Excel dashboard tracking category margin by month.",
          "Budget tracker — a spreadsheet tool with automated category rollups, used by 30 classmates.",
        ],
      },
      {
        heading: "Additional",
        lines: ["SQL for Data Analysis (120 hours)", "Advanced Excel certification", "Languages: English, Hindi"],
      },
    ],
  },
  {
    slug: "business-analyst",
    role: "Business Analyst",
    title: "Business Analyst Resume Example (ATS-Optimized Master Resume)",
    metaTitle: "Business Analyst Resume Example — Terbey",
    metaDescription:
      "A business analyst resume example with requirement, SQL and stakeholder keywords, quantified bullets, and a downloadable ATS-safe PDF.",
    summaryLine:
      "Requirements, data and stakeholder work shown as outcomes: cycle time cut, defects avoided, decisions made faster.",
    atsKeywords: [
      "Requirements gathering",
      "SQL",
      "Stakeholder management",
      "Process mapping",
      "User stories",
      "JIRA",
      "Power BI",
      "Gap analysis",
      "UAT",
      "Agile",
    ],
    writingTips: [
      "Name the documentation artefacts you actually produced — BRD, FRD, user stories, process maps — because BA filters search for them literally.",
      "Quantify the business outcome, not the paperwork: hours saved, defects prevented, revenue protected.",
      "Split Core Skills into Analysis, Tools and Domain so a recruiter can scan your fit in one pass.",
      "Include the domain (banking, insurance, retail, healthcare) in your summary line — most BA shortlists filter on it.",
    ],
    recruiterFocus: [
      "Evidence you can translate between business and engineering, not just attend meetings.",
      "SQL and reporting tools, since most BA roles now expect self-serve data pulls.",
      "Domain match — a banking BA shortlist rarely surfaces a retail-only profile.",
    ],
    mistakes: [
      "Describing responsibilities ('responsible for requirements') instead of what changed because of you.",
      "Leaving out the tools: JIRA, Confluence, Power BI, SQL, Visio.",
      "Burying the domain experience on page two.",
    ],
    faqs: [
      {
        q: "What keywords should a business analyst resume include?",
        a: "Requirements gathering, BRD/FRD, user stories, process mapping, gap analysis, UAT, SQL, JIRA, Confluence, Power BI or Tableau, plus your domain — banking, insurance, retail or healthcare.",
      },
      {
        q: "Do business analysts need SQL on the resume?",
        a: "For most current postings, yes. Even where it is listed as preferred, SQL is one of the fastest filters recruiters apply when a shortlist is too long.",
      },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Business analyst with 5 years in retail banking. Delivered the requirements for a payments migration serving 1.2M customers and cut manual reconciliation effort by 30 hours a month.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Analysis: Requirements gathering, BRD and FRD authoring, user stories, gap analysis, process mapping",
          "Tools: SQL, Power BI, JIRA, Confluence, Visio, Excel (advanced)",
          "Delivery: Agile/Scrum, UAT planning and execution, release sign-off, stakeholder workshops",
          "Domain: Retail banking, payments, KYC and onboarding",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Wrote the requirements for a payments platform migration covering 1.2M customers, delivered with zero post-release critical defects.",
          "Removed 30 hours a month of manual reconciliation by redesigning the exception-handling process.",
          "Cut UAT cycle length from 4 weeks to 2.5 by restructuring test coverage around risk.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Senior Business Analyst — Meridian Bank | Mar 2022 – Present",
          "• Own requirements across 3 squads, from discovery workshops through to UAT sign-off.",
          "• Built the SQL queries and Power BI views the product team uses for weekly funnel review.",
          "• Ran the gap analysis that reprioritised a ₹4 crore programme backlog.",
          "Business Analyst — Cove Financial Services | Jun 2019 – Feb 2022",
          "• Authored 40+ user stories per quarter with acceptance criteria accepted without rework in 90% of cases.",
          "• Mapped the customer onboarding process end to end, exposing 7 redundant approval steps.",
        ],
      },
      {
        heading: "Education",
        lines: ["MBA, Finance — Symbiosis Institute of Business Management, 2019", "B.Com — Mumbai University, 2017"],
      },
      {
        heading: "Projects",
        lines: [
          "Onboarding redesign — reduced average account activation from 3 days to 6 hours across 4 branches in pilot.",
        ],
      },
      {
        heading: "Additional",
        lines: ["CBAP (in progress)", "Certified Scrum Product Owner", "SQL and Power BI certifications"],
      },
    ],
  },
  {
    slug: "digital-marketing-executive",
    role: "Digital Marketing Executive",
    title: "Digital Marketing Resume Example (ATS-Optimized Master Resume)",
    metaTitle: "Digital Marketing Resume Example — Terbey",
    metaDescription:
      "A digital marketing resume example with paid, SEO and analytics keywords, ROAS and CPL numbers in every bullet, and a free ATS-safe PDF.",
    summaryLine:
      "Performance marketing shown in the numbers that get you shortlisted: spend managed, ROAS, CPL and organic growth.",
    atsKeywords: [
      "Google Ads",
      "Meta Ads",
      "SEO",
      "Google Analytics 4",
      "ROAS",
      "CPL",
      "Email marketing",
      "Content marketing",
      "Conversion rate optimisation",
      "Marketing automation",
    ],
    writingTips: [
      "Put monthly budget managed in your summary line — it is the single fastest way recruiters size a marketing candidate.",
      "Use the platform names exactly: Google Ads, Meta Ads, GA4, HubSpot. Filters do not expand 'social ads' into 'Meta Ads'.",
      "Every campaign bullet needs a metric: ROAS, CPL, CAC, CTR, organic sessions, revenue.",
      "Keep a short Channels line so a recruiter sees paid, organic and lifecycle coverage in one glance.",
    ],
    recruiterFocus: [
      "Budget scale and channel mix — a ₹5 lakh/month buyer and a ₹50,000/month buyer are different shortlists.",
      "Whether you owned the numbers or only executed someone else's plan.",
      "Analytics fluency: GA4, attribution, and what you did after reading the report.",
    ],
    mistakes: [
      "Listing channels with no spend, scale or result attached.",
      "Vague claims like 'grew social presence' with no follower, reach or revenue figure.",
      "Leaving certifications (Google Ads, GA4, HubSpot) off — they are cheap credibility and common filter terms.",
    ],
    faqs: [
      {
        q: "What should a digital marketing resume include?",
        a: "Channels owned, monthly budget managed, the platforms by exact name, and campaign results as ROAS, CPL, CAC or organic growth. Certifications from Google and HubSpot help pass keyword filters.",
      },
      {
        q: "How do I show results if my company will not share revenue numbers?",
        a: "Use percentages and ratios instead of absolute figures — ROAS improved from 2.1x to 3.4x, CPL down 38%, organic sessions up 61% year over year. Those pass review and still show scale.",
      },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Digital marketing executive managing ₹18 lakh a month across Google and Meta. Took blended ROAS from 2.1x to 3.4x in three quarters and grew organic sessions 61% year over year.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Paid: Google Ads (Search, PMax, YouTube), Meta Ads, LinkedIn Ads, budget planning and pacing",
          "Organic: SEO (on-page, technical basics, content briefs), landing page CRO",
          "Lifecycle: Email and WhatsApp campaigns, HubSpot automation, segmentation",
          "Analytics: GA4, Google Tag Manager, Looker Studio, attribution reporting",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Lifted blended ROAS from 2.1x to 3.4x while holding spend flat at ₹18 lakh a month.",
          "Cut cost per lead 38% by restructuring campaigns around intent rather than product category.",
          "Grew organic sessions 61% year over year with a 40-page content and internal-linking programme.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Digital Marketing Executive — Falcon Retail | Aug 2022 – Present",
          "• Own ₹18 lakh monthly paid spend across Google and Meta, reporting weekly on ROAS and CPL.",
          "• Run the SEO roadmap with an agency partner: briefs, on-page fixes and internal linking.",
          "• Built the Looker Studio dashboard leadership uses for channel review.",
          "Marketing Associate — Nexa Digital | Jul 2020 – Jul 2022",
          "• Managed 9 client ad accounts, averaging 28% CPL reduction in the first 90 days.",
          "• Produced and tested 200+ ad creatives a year in structured variant sets.",
        ],
      },
      {
        heading: "Education",
        lines: ["BBA, Marketing — Christ University, 2020"],
      },
      {
        heading: "Projects",
        lines: [
          "Festive campaign — a 6-week always-on plus burst structure that delivered 3.9x ROAS at peak spend.",
        ],
      },
      {
        heading: "Additional",
        lines: ["Google Ads Search & Measurement certified", "GA4 certified", "HubSpot Inbound Marketing"],
      },
    ],
  },
  {
    slug: "accountant",
    role: "Accountant",
    title: "Accountant Resume Format & Example (ATS-Optimized)",
    metaTitle: "Accountant Resume Format & Example — Terbey",
    metaDescription:
      "An accountant resume format with GST, TDS, Tally and reconciliation keywords, quantified bullets, and a downloadable ATS-safe PDF sample.",
    summaryLine:
      "Compliance and closing work stated as scale and accuracy: entries handled, closes shortened, audits cleared.",
    atsKeywords: [
      "Accounts payable",
      "Accounts receivable",
      "GST",
      "TDS",
      "Bank reconciliation",
      "Tally ERP",
      "SAP FICO",
      "Month-end close",
      "Statutory audit",
      "Financial reporting",
    ],
    writingTips: [
      "State volume: invoices processed, ledgers owned, entities closed. Accounting shortlists are sized by throughput.",
      "Name the statutory work explicitly — GST returns, TDS, PF/ESI — since compliance filters are literal.",
      "List the ERP by name and version family: Tally ERP 9, TallyPrime, SAP FICO, Oracle NetSuite, Zoho Books.",
      "Show close cycle improvements in days; that number is what a controller reads first.",
    ],
    recruiterFocus: [
      "Whether you have closed books independently or only supported someone who did.",
      "Statutory exposure — GST, TDS and audit are the usual first filters in India.",
      "ERP match with the company's stack.",
    ],
    mistakes: [
      "Writing 'handled accounting work' with no volume, entity count or software named.",
      "Omitting audit exposure, which is often the deciding line between two similar profiles.",
      "Mixing date formats between roles — parsers then misread your tenure.",
    ],
    faqs: [
      {
        q: "What is the best resume format for an accountant in India?",
        a: "Reverse-chronological, one to two pages, single column. Lead with a summary naming your ERP and statutory exposure, then core skills, key achievements, experience, education and certifications.",
      },
      {
        q: "Should I list GST and TDS separately on my resume?",
        a: "Yes. Many Indian postings filter for those exact terms, and a generic 'statutory compliance' line will not match them.",
      },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Accountant with 6 years across AP, AR and statutory compliance for two entities. Shortened month-end close from 9 days to 5 and cleared three consecutive statutory audits with no adverse observations.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Accounting: Accounts payable and receivable, general ledger, bank reconciliation, month-end close",
          "Compliance: GST returns (GSTR-1, 3B), TDS, PF and ESI, statutory audit support",
          "Systems: TallyPrime, SAP FICO, Zoho Books, Excel (pivot tables, lookups, macros)",
          "Reporting: MIS reports, cash flow tracking, variance analysis",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Cut month-end close from 9 days to 5 by standardising the accrual and reconciliation checklist.",
          "Processed 900+ vendor invoices a month with a sub-1% error rate over 24 months.",
          "Cleared three consecutive statutory audits with no adverse observations.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Senior Accountant — Vantage Industries | Apr 2022 – Present",
          "• Own the general ledger and month-end close for two entities in TallyPrime and SAP FICO.",
          "• File monthly GSTR-1 and 3B and quarterly TDS returns, with zero late filings to date.",
          "• Prepare the MIS pack reviewed by the finance controller each month.",
          "Accountant — Rasmi Traders | Jun 2019 – Mar 2022",
          "• Managed AP and AR across 200+ active vendor and customer accounts.",
          "• Reconciled 6 bank accounts weekly and cleared a 14-month backlog of open items.",
        ],
      },
      {
        heading: "Education",
        lines: ["M.Com — Pune University, 2019", "B.Com — Pune University, 2017"],
      },
      {
        heading: "Projects",
        lines: [
          "Vendor master cleanup — de-duplicated 1,100 vendor records, removing repeat-payment risk before an ERP migration.",
        ],
      },
      {
        heading: "Additional",
        lines: ["CA Inter (both groups cleared)", "Advanced Excel certification", "GST practitioner training"],
      },
    ],
  },
  {
    slug: "customer-support",
    role: "Customer Support",
    title: "Customer Support Resume Example (ATS-Optimized Master Resume)",
    metaTitle: "Customer Support Resume Example — Terbey",
    metaDescription:
      "A customer support resume example with CSAT, ticket volume and CRM keywords, plus an ATS-safe PDF you can download and adapt.",
    summaryLine:
      "Support work shown in the metrics team leads hire on: ticket volume, CSAT, first-response time and resolution rate.",
    atsKeywords: [
      "Customer support",
      "CSAT",
      "Zendesk",
      "Freshdesk",
      "Salesforce Service Cloud",
      "SLA",
      "First response time",
      "Escalation management",
      "Ticketing",
      "Voice and chat support",
    ],
    writingTips: [
      "Lead with volume and CSAT. Support hiring is metric-driven and those two numbers decide the first cut.",
      "Name the helpdesk platform exactly — Zendesk, Freshdesk, Salesforce Service Cloud, Intercom.",
      "Separate channels (voice, email, chat) so a chat-only role does not screen you out for a voice profile.",
      "Include shift and language flexibility if you have it; both are common filter fields.",
    ],
    recruiterFocus: [
      "Daily ticket or call volume, because it maps directly to the queue you would join.",
      "CSAT or QA score, ideally with the period it was measured over.",
      "Escalation and process work that shows you can grow past frontline.",
    ],
    mistakes: [
      "Writing 'handled customer queries' without volume, channel or satisfaction score.",
      "Omitting the CRM or helpdesk tool, which is one of the most common keyword filters in support hiring.",
      "Skipping language proficiency on multilingual support roles.",
    ],
    faqs: [
      {
        q: "What metrics should be on a customer support resume?",
        a: "Daily or monthly ticket and call volume, CSAT or QA score, first-response time, resolution rate and SLA adherence. Give the period alongside each number so it reads as real.",
      },
      {
        q: "Is a customer support resume different for chat versus voice roles?",
        a: "Yes. Mirror the channel in your summary and skills — a voice-process shortlist filters for call handling and AHT, while a chat role filters for concurrent chats and written English.",
      },
    ],
    sections: [
      {
        heading: "Professional Summary",
        lines: [
          "Customer support specialist handling 60–80 tickets a day across chat and email at 94% CSAT. Cut first-response time from 4 hours to 45 minutes by rebuilding the macro library.",
        ],
      },
      {
        heading: "Core Skills",
        lines: [
          "Channels: Email, live chat, voice, social response",
          "Tools: Zendesk, Freshdesk, Salesforce Service Cloud, Intercom, Slack",
          "Process: SLA management, escalation handling, macro and help-centre authoring, QA reviews",
          "Languages: English, Hindi, Marathi",
        ],
      },
      {
        heading: "Key Achievements",
        lines: [
          "Held 94% CSAT across 14,000+ tickets over 12 months.",
          "Reduced first-response time from 4 hours to 45 minutes by rewriting 60 macros and the routing rules.",
          "Trained 6 new hires; all cleared their 30-day QA benchmark on the first attempt.",
        ],
      },
      {
        heading: "Experience",
        lines: [
          "Senior Support Specialist — Cleartrail SaaS | Feb 2023 – Present",
          "• Handle 60–80 chat and email tickets a day within a 2-hour SLA, at 94% CSAT.",
          "• Own the escalation queue and the weekly bug handoff to engineering.",
          "• Wrote 40 help-centre articles that cut repeat 'how do I' tickets by 22%.",
          "Customer Support Executive — Orbit Retail | Jul 2020 – Jan 2023",
          "• Managed 100+ daily voice and email contacts for order and refund issues.",
          "• Recovered 300+ at-risk orders a quarter through proactive delay outreach.",
        ],
      },
      {
        heading: "Education",
        lines: ["B.A., English — Savitribai Phule Pune University, 2020"],
      },
      {
        heading: "Projects",
        lines: [
          "Macro library rebuild — restructured 60 canned responses by intent, cutting average handle time 31%.",
        ],
      },
      {
        heading: "Additional",
        lines: ["Zendesk Support Administrator fundamentals", "Available for rotational and night shifts"],
      },
    ],
  },
];
