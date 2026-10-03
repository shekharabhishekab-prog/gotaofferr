# Cover letter examples hub — 5-page pilot

Add a new indexable content hub at `/examples/cover-letters`, mirroring the structure that already works for `/examples/resumes` (currently one of the site's top pages). Each page is a short, useful guide plus a clear CTA into the AI cover letter generator — not a wall of sample text.

## Pages in the pilot

Hub: `/examples/cover-letters`

Five role pages, chosen for India-first demand with international relevance:

1. Software engineer
2. Fresher / first job (no experience)
3. Business analyst
4. Digital marketing executive
5. Customer support

## What each page contains

- H1 with the role, one-paragraph intro on when this cover letter is used
- A short annotated structure: opening line, why-this-company paragraph, proof paragraph, closing + sign-off — each with a one-line "what to write here" note and a compact real example line
- 3–5 role-specific phrases that work, and 3 clichés to avoid (consistent with the site's no-AI-buzzwords rule)
- India vs international note where it differs (length, salary mention, personal details)
- Primary CTA: "Generate this cover letter in 30 seconds" → cover letter generator, with the role prefilled
- Secondary link: the matching resume example page, when one exists
- FAQ block (3 questions) reused for FAQ schema

## Internal linking

- Header/footer: add "Cover letter examples" next to the existing resume examples link
- Hub cross-links to `/examples/resumes`, `/ai-cover-letter-generator`, `/tailor`
- Each resume example page gains a link to its cover letter counterpart where one exists
- `/ai-cover-letter-generator` links down into the hub

## Technical notes

- Content lives in `src/lib/cover-letter-examples.ts` as a typed array (`slug`, `role`, `metaTitle`, `metaDescription`, `intro`, `structure[]`, `phrases[]`, `avoid[]`, `localeNote`, `faqs[]`, `resumeExampleSlug?`), matching the shape used by `src/lib/resume-examples.ts`.
- Routes: `src/routes/examples.cover-letters.index.tsx` and `src/routes/examples.cover-letters.$slug.tsx`, following the existing `examples.resumes.*` pattern — loader with `notFound()`, per-route `head()` with title/description/og/canonical, plus Article, BreadcrumbList and FAQPage JSON-LD.
- Register the hub and all five slugs in `src/routes/sitemap[.]xml.ts`.
- Prefill: CTA links to `/ai-cover-letter-generator?role=<role>`; the generator reads the param to preselect/prefill the role field.
- No database, auth, or pricing changes. Pages are fully public and static — no AI call on page load.

## Out of scope for this pilot

Resume example expansion and the additional country CV guides stay as saved opportunities for a later round.
