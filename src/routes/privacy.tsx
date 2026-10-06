import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — GotaOfferr" },
      {
        name: "description",
        content:
          "GotaOfferr privacy policy explains what data we collect, how we use it, and how we keep your resume and account information safe.",
      },
      { property: "og:title", content: "Privacy Policy — GotaOfferr" },
      {
        property: "og:description",
        content:
          "GotaOfferr privacy policy explains what data we collect, how we use it, and how we keep your resume and account information safe.",
      },
      { property: "og:url", content: "https://gotaofferr.com/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://gotaofferr.com/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <h1 className="font-display text-4xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-4 text-sm text-muted-foreground">Last updated: 7 October 2026</p>

      <div className="mt-8 space-y-8 text-muted-foreground">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">1. About us and what GotaOfferr is</h2>
          <p>
            GotaOfferr is an AI-powered resume and cover-letter builder operated by{" "}
            <strong>AB24 SOLUTIONS</strong>, a sole proprietorship business, Delhi, India. The proprietor is
            Abhishek.
          </p>
          <p>
            We help you rewrite your resume for a specific job description, generate a matching
            cover letter in PDF format, build a resume from scratch with AI assistance, search
            public job listings, and receive job alert emails.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">2. Data we collect</h2>
          <p>
            <strong>Account information:</strong> When you sign up, we collect your email address through
            our authentication provider so you can log in, save your usage history, and manage your
            subscription.
          </p>
          <p>
            <strong>Resume and job-description content:</strong> When you upload or paste a resume and
            job description, we send the text to our AI provider to generate the tailored output. The
            content is used only for the tailoring request and is not stored on our servers permanently.
          </p>
          <p>
            <strong>Country and payment location:</strong> We use your approximate country (from your
            IP address) to show and charge the right price and to prevent price abuse. Card details
            are handled only by Razorpay; Razorpay tells us whether a card is Indian or international.
          </p>
          <p>
            <strong>Usage data:</strong> We record how many tailoring, resume-builder, job-search and job-alert uses you have in the
            current plan month to enforce free and paid plan limits.
          </p>
          <p>
            <strong>Payment information:</strong> We do not collect or store card details. Payments are
            handled by Razorpay, and we only receive a subscription ID and payment status.
          </p>
          <p>
            <strong>Logged-out (anonymous) tailoring:</strong> If you try one free rewrite without an
            account, we store a device identifier (a random ID plus a hashed browser fingerprint) and
            the email address you enter to download the result. This is used only to enforce the
            one-time free limit and prevent abuse.
          </p>
          <p>
            <strong>Bot-protection and security data:</strong> Cloudflare Turnstile checks some actions
            (sign-ups, downloads, resume builder) to block automated abuse, and we keep short-lived
            rate-limit records keyed by IP or account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">3. How we use your data</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>To provide the resume tailoring and cover-letter generation services.</li>
            <li>To enforce plan limits and manage your subscription.</li>
            <li>To send transactional emails such as one-time sign-in codes, password reset codes, job alert emails (up to 3 per alert, one every 3 days), and payment receipts.</li>
            <li>To improve the service and fix bugs.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">4. Storage and security</h2>
          <p>
            Authentication and limited account data are stored in Supabase (our own project). Resume and job-description content is processed in real time and not retained after your session ends, unless you explicitly save a job alert or tailored output.
          </p>
          <p>
            All data in transit is encrypted with TLS, and saved resumes and tailored documents are
            encrypted at rest with AES-256-GCM. We do not sell your data, and we do not use it to train
            our own AI models.
          </p>
          <p>
            We do not sell your data. Your resume and job description text is sent to our AI provider, Google (Gemini), only to generate your output. Depending on the service tier we use at the time, the provider may handle this content under its own data terms. Please do not include sensitive details you are not comfortable sharing.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">5. Third-party services</h2>
          <p>
            We use trusted providers for authentication, hosting, payments, AI generation, and email delivery. Each provider only receives the data needed to perform its specific function.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Supabase — authentication and account data storage.</li>
            <li>Cloudflare — website hosting and security.</li>
            <li>Google (Gemini AI models) — resume, cover-letter and job-search generation.</li>
            <li>Adzuna and Firecrawl — public job listing search. We send only your search words and location, never your resume.</li>
            <li>Razorpay — payment processing and subscription mandates.</li>
            <li>Resend — transactional email delivery (sign-in codes, alerts, receipts).</li>
            <li>Cloudflare Turnstile — bot and abuse protection.</li>
            <li>Google — sign-in with Google, Google Analytics (usage measurement) and Google AdSense (advertising).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">6. Cookies, analytics and advertising</h2>
          <p>
            We use essential cookies to keep you signed in. We use Google Analytics to measure which
            pages are visited and where errors occur, and Google AdSense to show advertising. Both
            load only after the page finishes loading (or on your first interaction) so they do not
            slow the site down, and they may set their own cookies under Google's privacy policy.
            You can block analytics and ad cookies in your browser settings or with an ad blocker
            without breaking the core service.
          </p>
          <p>
            We do not build advertising profiles ourselves. Google AdSense may use cookies for its
            ads. You can control this at adssettings.google.com.
          </p>
          <p>
            Ads depend on your plan. The Free plan shows ads. Starter and Job Hunt show fewer ads.
            Career Pro shows no ads.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">7. Your rights</h2>
          <p>
            If you are in India, the Digital Personal Data Protection Act 2023 gives you the rights
            below. We extend the same rights to every user, wherever you live.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Right to information and access:</strong> download a complete copy of the data
              we hold about you from Account → Settings → Your data.
            </li>
            <li>
              <strong>Right to correction:</strong> update your name and email on the account page,
              or write to us for anything you can't change yourself.
            </li>
            <li>
              <strong>Right to erasure:</strong> delete your account and all associated data from
              Account → Settings → Your data. Deletion is immediate and cannot be undone.
            </li>
            <li>
              <strong>Right to withdraw consent:</strong> turn off job alerts, stop using the
              tailoring tool, or delete your account at any time. Withdrawing consent does not
              affect processing already carried out.
            </li>
            <li>
              <strong>Right to nominate:</strong> you may nominate another person to exercise these
              rights on your behalf in the event of death or incapacity — email us to register a
              nominee.
            </li>
            <li>
              <strong>Right to grievance redressal:</strong> contact our Grievance Officer below
              before approaching the Data Protection Board of India.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">8. Data retention</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Account and profile data — kept while your account is active.</li>
            <li>
              Tailored resumes and cover letters — kept so you can re-download them; a limited number
              of your most recent ones are kept and shown on your account page.
            </li>
            <li>Job alert settings and send history — kept until you delete the alert.</li>
            <li>
              Payment and subscription records — retained as long as tax and accounting law
              requires, even after account deletion.
            </li>
            <li>
              Resume and job description text sent for tailoring — processed in real time and not
              retained beyond generating your documents, unless it is part of a saved rewrite.
            </li>
            <li>
              Emails captured from logged-out users who downloaded a free rewrite — deleted on
              request.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">9. International data transfers</h2>
          <p>
            GotaOfferr uses cloud infrastructure, AI processing, payment and email providers that may
            store or process data outside your country, including outside India. We remain
            responsible for your data as the data fiduciary, use providers under data-processing
            agreements, and do not transfer data to any jurisdiction restricted by the Indian
            Government.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">10. Children's data</h2>
          <p>
            GotaOfferr is intended for job seekers aged 18 and over. We do not knowingly collect
            personal data from anyone under 18. If you believe a minor has created an account,
            email us and we will delete it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">11. Security and breach response</h2>
          <p>
            Data is encrypted in transit with TLS, access to production systems is restricted, and
            database access is enforced with row-level security so you can only ever read your own
            records. If a personal data breach occurs, we will notify affected users and the Data
            Protection Board of India without undue delay, and in any case within 72 hours of
            becoming aware of it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">12. Grievance Officer</h2>
          <p>
            In line with the DPDP Act 2023, complaints about how your personal data is handled can be
            sent to our Grievance Officer, who will respond within 30 days.
          </p>
          <p>
            Grievance Officer: Abhishek — AB24 SOLUTIONS (GotaOfferr)
            <br />
            Location: Delhi, India
            <br />
            Email:{" "}
            <a
              href="mailto:contact@gotaofferr.com"
              className="text-primary underline underline-offset-4 hover:text-foreground"
            >
              contact@gotaofferr.com
            </a>
          </p>
          <p>
            If your complaint is not resolved, you may escalate it to the Data Protection Board of
            India.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">13. Changes to this policy</h2>
          <p>
            We may update this policy as the service changes. The latest version will always be posted at this URL with an updated "last updated" date.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">14. Contact us</h2>
          <p>
            If you have questions about this privacy policy, email us at{" "}
            <a
              href="mailto:contact@gotaofferr.com"
              className="text-primary underline underline-offset-4 hover:text-foreground"
            >
              contact@gotaofferr.com
            </a>
            .
          </p>
          <p>
            <strong>AB24 SOLUTIONS</strong> · Delhi, India
          </p>
        </section>
      </div>
    </main>
  );
}

