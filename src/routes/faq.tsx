import { createFileRoute, Link } from "@tanstack/react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "What file formats can I upload?",
    a: "PDF resumes are read directly in your browser. You can also paste your resume as plain text if your file is a scan or a format we can't parse.",
  },
  {
    q: "Will the resume pass applicant tracking systems?",
    a: "The generated PDF uses a single-column layout with standard section headings, no tables, columns, or graphics — the format ATS parsers handle most reliably.",
  },
  {
    q: "Does it invent experience I don't have?",
    a: "No. The rewrite reframes and prioritises what's already in your resume around the job description. Missing requirements show up in the keyword gaps list instead, so you can decide how to address them.",
  },
  {
    q: "Is the cover letter included?",
    a: "Yes. Every generation produces a tailored cover letter referencing the company and role, downloadable as its own PDF.",
  },
  {
    q: "What happens to my data?",
    a: "Your resume is parsed in your browser and sent to the AI only to produce your documents. We don't store resumes or job descriptions, and no account is required.",
  },
  {
    q: "Can I edit the result before downloading?",
    a: "You can review the generated resume and cover letter on screen, adjust the source text, and regenerate until it reads the way you want.",
  },
  {
    q: "Which countries does the resume tailoring support?",
    a: "Tailoring follows the resume conventions of 11 job markets, including India, the UK, Germany, Canada, Australia, Singapore and the UAE. It also detects the country of the job you paste in, so a resume for a Dubai role is formatted differently from one for a London role.",
  },
  {
    q: "What do the match score and ATS score mean?",
    a: "The match score shows how closely your resume lines up with the job description. The ATS score estimates how well an applicant tracking system can read and rank it. Both come with the missing keywords and tips on what to change.",
  },
  {
    q: "How does the job finder work?",
    a: "Sign in, enter a role and a place, and the job finder searches major job boards for open roles. Jobs in the place you typed are listed first, nearby areas can follow, and far-away regions are left out. Pick a listing and tailor your resume to it in one click.",
  },
  {
    q: "Can I get new job alerts by email?",
    a: "Yes. Career Pro includes job alerts that email you new matching roles every few days, so you do not have to keep searching by hand.",
  },
  {
    q: "Do paid plans renew automatically?",
    a: "Yes. Every paid package is a monthly recurring subscription: by completing checkout you authorise an automatic charge of the same amount every month, on the same date, until you cancel. Cancel any time from your account page — cancellation stops all future charges and you keep access until the end of the period you already paid for.",
  },
];
export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — GotaOfferr Resume & Cover Letter Questions" },
      {
        name: "description",
        content:
          "Answers about PDF uploads, ATS formatting, AI accuracy, privacy, and cover letters in GotaOfferr. Quick, plain answers.",
      },
      { property: "og:title", content: "FAQ — GotaOfferr Resume & Cover Letter Questions" },
      {
        property: "og:description",
        content:
          "Answers about PDF uploads, ATS formatting, AI accuracy, privacy, and cover letters in GotaOfferr. Quick, plain answers.",
      },
      { property: "og:url", content: "https://gotaofferr.com/faq" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});


function Faq() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-4xl font-bold text-foreground">Frequently asked questions</h1>

      <h2 className="sr-only">Common questions</h2>
      <Accordion type="single" collapsible className="mt-10">
        {faqs.map((f) => (
          <AccordionItem key={f.q} value={f.q}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button asChild className="mt-10">
        <Link to="/tailor">Tailor my resume</Link>
      </Button>
    </main>
  );
}
