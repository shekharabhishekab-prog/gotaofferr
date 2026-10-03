# Three ways to get more relevant visitors (India-first)

## Where the site stands today

- Search Console: homepage is indexed and canonical, but the last 28 complete days show **0 clicks, 1 impression**. The site is discoverable, it just has almost no content that matches what people search.
- The SEO scan is clean (titles, meta, schema, sitemap, robots, SSR all passing) — technical SEO is not the bottleneck.
- Existing keyword-targeted pages: `/ats-resume-checker`, `/ai-cover-letter-generator`, two blog posts, and `/examples/resumes` with 6 samples.
- Semrush (India database) shows where the realistic demand is: "resume format for freshers pdf" 2,400/mo (difficulty 22), "dubai resume format" 1,000/mo (25), "graphic designer resume" 1,000/mo (29), "canada resume format" 880/mo (37), "hr resume format" 720/mo (32), "ats friendly resume format" 720/mo (42). "resume maker free" (40,500/mo) is difficulty 99 — not winnable yet.

Priority order below is: biggest realistic traffic per unit of work.

---

## Priority 1 — Turn resume examples into a real content hub

The `/examples/resumes` pages already exist but are thin. Sample-resume searches are the highest-volume terms this site can actually rank for in India.

- Expand each existing sample page into a full guide: role-specific H1 ("Graphic Designer Resume Sample & Format — 2026"), the sample rendered as readable text on the page (not only a PDF), what recruiters look for in that role, keywords ATS scans for, common mistakes, plus the download and a "tailor this to your job description" CTA.
- Add role pages targeting proven demand: fresher resume (with a dedicated `resume format for freshers pdf` angle), sales, business analyst, software engineer, digital marketing, accountant, customer support.
- Add `Article` + `BreadcrumbList` JSON-LD per page, self-referencing canonical, and cross-links from the hub and between related roles.
- Add each new page to the sitemap.

Why first: the route pattern, PDF download and search box already exist, so each new page is content work, not new plumbing — and these are the lowest-difficulty, highest-volume terms available.

## Priority 2 — Cross-border resume format pages (your real differentiator)

The tailoring engine already handles country conventions and visa/relocation lines. Nobody else in this niche pairs that with a tool.

- Create `/guides/dubai-resume-format`, `/guides/canada-resume-format`, `/guides/australia-resume-format` (and later UK, Germany, Singapore).
- Each page: what changes vs an Indian resume (photo, DOB, marital status, page length, date and currency format, visa/sponsorship line), a before/after example, an FAQ block with `FAQPage` JSON-LD, and a CTA into `/tailor` pre-framed as "rewrite my Indian resume for a Dubai job".
- Link them from the footer, the homepage, and the resume-examples hub.

Why second: combined ~2,000/mo at easy-to-moderate difficulty, and the traffic converts far better than generic resume searches because those visitors need exactly what the tool does.

## Priority 3 — Off-site distribution while the pages age

New pages take weeks to rank. This is what brings visitors in the meantime.

- Post in the communities where Indian job seekers already ask these questions: r/developersIndia, r/IndianWorkplace, r/india jobs threads, r/dubai and r/PersonalFinanceIndia relocation threads. Lead with a genuinely useful answer (the ATS/format advice from your own pages), link only as a source.
- LinkedIn: one short post per week built from a real before/after tailoring result — the keyword-gap screenshot is the hook.
- Get listed in the free AI-tool directories (There's An AI For That, Futurepedia, Toolify, AlternativeTo, Product Hunt launch). These are do-follow-ish referral traffic plus early backlinks, which is what the domain currently lacks.

Why third: high effort per visit and it does not compound like the pages, but it is the only channel that produces traffic before Google catches up.

---

## What I'd build if you approve

1. Extend the resume-examples route with the richer page template and add the new role pages plus sitemap entries.
2. Add the three country guide routes with head metadata, FAQ schema, footer links, and `/tailor` CTAs.
3. No code for Priority 3 — I'll write the posting copy and the directory submission blurb for you to use.

Tell me if you want all three in one pass or Priority 1 alone first.
