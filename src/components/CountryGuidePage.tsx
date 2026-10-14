import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CountryGuide } from "@/lib/country-guides";
import { SITE_IMAGE, SITE_PUBLISHER } from "@/lib/seo";

const GUIDE_LINKS = [
  { to: "/guides/india-resume-format", label: "India resume format" },
  { to: "/guides/dubai-resume-format", label: "Dubai / UAE resume format" },
  { to: "/guides/canada-resume-format", label: "Canada resume format" },
  { to: "/guides/australia-resume-format", label: "Australia resume format" },
  { to: "/guides/uk-resume-format", label: "UK resume format" },
  { to: "/guides/germany-resume-format", label: "Germany resume format" },
  { to: "/guides/singapore-resume-format", label: "Singapore resume format" },
] as const;

export function CountryGuidePage({ guide }: { guide: CountryGuide }) {
  const domestic = Boolean(guide.domestic);
  return (
    <main className="site-container py-16 sm:py-24">
      <nav className="text-sm text-muted-foreground">
        <Link to="/examples/resumes" className="hover:text-foreground">
          Resume examples
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{guide.country} resume format</span>
      </nav>

      <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold text-foreground sm:text-5xl">
        {guide.title}
      </h1>
      <p className="mt-5 max-w-3xl text-muted-foreground">{guide.intro}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/tailor">
            {domestic
              ? "Rewrite my resume for an India job"
              : `Rewrite my resume for a ${guide.country} job`}{" "}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/ats-resume-checker">Check my current resume</Link>
        </Button>
      </div>

      <h2 className="mt-16 font-display text-2xl font-bold text-foreground">
        {guide.domestic ? "What to keep and what to drop for Indian corporate roles" : "What changes versus an Indian resume"}
      </h2>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <thead className="bg-muted/40 text-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Element</th>
              <th className="px-4 py-3 font-semibold">
                {guide.domestic ? "Older Indian resume habit" : "Typical Indian resume"}
              </th>
              <th className="px-4 py-3 font-semibold">
                {guide.domestic ? "Modern India corporate format" : guide.market}
              </th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {guide.changes.map((row) => (
              <tr key={row.label} className="border-t border-border/60">
                <td className="px-4 py-3 font-medium text-foreground">{row.label}</td>
                <td className="px-4 py-3">{row.india}</td>
                <td className="px-4 py-3">{row.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-16 font-display text-2xl font-bold text-foreground">Before and after</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-card-foreground">
            <X className="size-4 text-destructive" />{" "}
            {domestic ? "Before — older Indian resume style" : "Before — as sent from India"}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {guide.before.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-primary/40 bg-primary/5 p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-card-foreground">
            <Check className="size-4 text-primary" />{" "}
            {domestic
              ? "After — modern India corporate format"
              : `After — rewritten for ${guide.country}`}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {guide.after.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="mt-16 font-display text-2xl font-bold text-foreground">
        Three details most applicants miss
      </h2>
      <ul className="mt-6 space-y-3">
        {guide.extras.map((extra) => (
          <li
            key={extra}
            className="rounded-xl border border-border/60 bg-card p-5 text-sm text-muted-foreground"
          >
            {extra}
          </li>
        ))}
      </ul>

      <h2 className="mt-16 font-display text-2xl font-bold text-foreground">
        {guide.country} resume FAQs
      </h2>
      <div className="mt-6 space-y-4">
        {guide.faqs.map((faq) => (
          <div key={faq.q} className="rounded-xl border border-border/60 bg-card p-6">
            <h3 className="font-display text-base font-semibold text-card-foreground">{faq.q}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-primary/40 bg-primary/5 p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {domestic
            ? "Rewrite your resume for an Indian corporate role"
            : `Rewrite your Indian resume for a ${guide.country} job`}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          {domestic
            ? "Upload your existing resume and paste the job description. GotaOfferr aligns your keywords with Naukri and LinkedIn, applies the modern Indian ATS format, and returns an ATS-ready PDF with a matching cover letter."
            : `Upload your existing resume and paste the job description. GotaOfferr applies ${guide.country} conventions, adds the relocation and sponsorship line, and returns an ATS-ready PDF with a matching cover letter.`}
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/tailor">
            Tailor my resume free <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-xl font-bold text-foreground">More country guides</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {GUIDE_LINKS.filter(
            (link) => link.to !== `/guides/${guide.slug}`,
          ).map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="hover:text-foreground">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/examples/resumes" className="hover:text-foreground">
              All resume examples by role
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}

export function countryGuideHead(slug: string, guide: CountryGuide) {
  const url = `https://gotaofferr.com/guides/${slug}`;
  return {
    meta: [
      { title: guide.metaTitle },
      { name: "description", content: guide.metaDescription },
      { property: "og:title", content: guide.metaTitle },
      { property: "og:description", content: guide.metaDescription },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.metaDescription,
          image: [SITE_IMAGE],
          mainEntityOfPage: url,
          author: { "@type": "Organization", name: "GotaOfferr" },
          publisher: SITE_PUBLISHER,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://gotaofferr.com/" },
            { "@type": "ListItem", position: 2, name: `${guide.country} resume format`, item: url },
          ],
        }),
      },
    ],
  };
}
