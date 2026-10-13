import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ProfileView } from "@/components/ProfileView";
import { makeSlug, type PublicProfile } from "@/lib/profile-types";

// Phase 1 (preview): "Make my public profile" with live preview. Nothing is saved yet: the database step is waiting for approval.
export const Route = createFileRoute("/profile/new")({
  head: () => ({
    meta: [
      { title: "Make my public profile | GotaOfferr" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewProfilePage,
});

const field =
  "mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none";

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#f7d000]" />
      Show on my profile
      <span className="sr-only"> {label}</span>
    </label>
  );
}

function NewProfilePage() {
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState("");
  const [role, setRole] = useState("");
  const [org, setOrg] = useState("");
  const [dates, setDates] = useState("");
  const [bullets, setBullets] = useState("");
  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [eduDates, setEduDates] = useState("");
  const [showAbout, setShowAbout] = useState(true);
  const [showExp, setShowExp] = useState(true);
  const [showEdu, setShowEdu] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [indexable, setIndexable] = useState(false);

  const profile = useMemo<PublicProfile>(
    () => ({
      slug: makeSlug(name || "your-name", () => 0.5),
      kind: "individual",
      name: name || "Your name",
      headline: headline || "Your headline",
      location: location || "City, Country",
      about: showAbout ? about || "A few lines about you." : "",
      experience:
        showExp && (role || org)
          ? [{ role, org, dates, bullets: bullets.split("\n").map((b) => b.trim()).filter(Boolean) }]
          : [],
      education: showEdu && school ? [{ school, degree, dates: eduDates }] : [],
      skills: showSkills ? skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20) : [],
      jobs: [],
      indexable,
    }),
    [name, headline, location, about, skills, role, org, dates, bullets, school, degree, eduDates, showAbout, showExp, showEdu, showSkills, indexable],
  );

  return (
    <main className="site-container py-10 sm:py-16">
      <p className="text-xs uppercase tracking-widest text-primary">Public profile</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-5xl">Make my public profile</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        You decide what is public. Your email, phone number and street address are never shown. Nothing goes live until
        you press Publish, and you can delete it any time.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <label className="block text-sm font-semibold text-foreground">
              Full name
              <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Riya Mehta" maxLength={80} />
            </label>
            <label className="mt-4 block text-sm font-semibold text-foreground">
              Headline
              <input className={field} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Digital Marketing Executive" maxLength={120} />
            </label>
            <label className="mt-4 block text-sm font-semibold text-foreground">
              City and country only
              <input className={field} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Pune, India" maxLength={80} />
            </label>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <label className="block text-sm font-semibold text-foreground">
              About
              <textarea className={field} rows={4} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Two or three plain lines about your work." maxLength={600} />
            </label>
            <div className="mt-2"><Toggle label="About" checked={showAbout} onChange={setShowAbout} /></div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Latest role</p>
            <input className={field} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Job title" maxLength={80} />
            <input className={field} value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Company" maxLength={80} />
            <input className={field} value={dates} onChange={(e) => setDates(e.target.value)} placeholder="2023 - Present" maxLength={40} />
            <textarea className={field} rows={4} value={bullets} onChange={(e) => setBullets(e.target.value)} placeholder="One line per achievement" maxLength={900} />
            <div className="mt-2"><Toggle label="Experience" checked={showExp} onChange={setShowExp} /></div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Education</p>
            <input className={field} value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School or university" maxLength={100} />
            <input className={field} value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="Degree" maxLength={80} />
            <input className={field} value={eduDates} onChange={(e) => setEduDates(e.target.value)} placeholder="2022" maxLength={20} />
            <div className="mt-2"><Toggle label="Education" checked={showEdu} onChange={setShowEdu} /></div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <label className="block text-sm font-semibold text-foreground">
              Skills (comma separated)
              <input className={field} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="SEO, Mailchimp, Excel" maxLength={300} />
            </label>
            <div className="mt-2"><Toggle label="Skills" checked={showSkills} onChange={setShowSkills} /></div>
          </div>

          <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
            <label className="flex items-start gap-2 text-sm text-foreground">
              <input type="checkbox" checked={indexable} onChange={(e) => setIndexable(e.target.checked)} className="mt-1 h-4 w-4 accent-[#f7d000]" />
              <span>
                Let Google list my profile
                <span className="block text-xs text-muted-foreground">Off by default. When off, only people with your link can see it.</span>
              </span>
            </label>
            <Button type="button" disabled className="mt-4 w-full">
              Publish profile
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">Publishing opens after the database step is approved. This is a preview only and nothing is saved.</p>
          </div>
        </form>

        <div className="min-w-0">
          <ProfileView profile={profile} banner="Live preview. Only you can see this." />
        </div>
      </div>
    </main>
  );
}
