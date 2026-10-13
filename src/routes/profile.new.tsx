import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ProfileView } from "@/components/ProfileView";
import { Counter, endBeforeStart, Field, fieldClass as field, ListEditor, newId } from "@/components/ListEditor";
import {
  fmtMonth,
  fmtRange,
  LANG_LEVELS,
  makeSlug,
  PROJECT_TYPES,
  safeUrl,
  type ProfileCert,
  type ProfileEducation,
  type ProfileHonor,
  type ProfileLanguage,
  type ProfileVolunteer,
  type ProfileWebsite,
  type ProfileExperience,
  type ProfileProject,
  type ProjectType,
  type PublicProfile,
} from "@/lib/profile-types";

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

function Show({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#f7d000]" />
      Show on my profile
    </label>
  );
}

const EMP_TYPES = ["", "Full-time", "Part-time", "Contract", "Internship", "Freelance", "Self-employed"];
const LOC_TYPES = ["", "On-site", "Hybrid", "Remote"];

const emptyExp = (): ProfileExperience => ({ id: newId(), role: "", org: "", empType: "", location: "", locType: "", start: "", end: "", current: false, description: "" });
const emptyEdu = (): ProfileEducation => ({ id: newId(), school: "", degree: "", field: "", start: "", end: "", grade: "", activities: "", description: "" });
const emptyLang = (): ProfileLanguage => ({ id: newId(), name: "", level: "Professional working" });
const emptyCert = (): ProfileCert => ({ id: newId(), name: "", issuer: "", issued: "", expires: "", credentialId: "", url: "" });
const emptyVol = (): ProfileVolunteer => ({ id: newId(), org: "", role: "", cause: "", start: "", end: "", description: "" });
const emptyHonor = (): ProfileHonor => ({ id: newId(), title: "", issuer: "", date: "", description: "" });
const PRONOUNS = ["", "she/her", "he/him", "they/them"];
const WORK_TYPES = ["On-site", "Hybrid", "Remote"];
const emptyProj = (): ProfileProject => ({
  id: newId(), name: "", type: "Software", role: "", status: "Completed", start: "", end: "", associated: "", summary: "", contribution: "", tools: [], links: [], collaborators: "",
});

function NewProfilePage() {
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [showAbout, setShowAbout] = useState(true);
  const [exp, setExp] = useState<ProfileExperience[]>([]);
  const [showExp, setShowExp] = useState(true);
  const [edu, setEdu] = useState<ProfileEducation[]>([]);
  const [showEdu, setShowEdu] = useState(true);
  const [proj, setProj] = useState<ProfileProject[]>([]);
  const [showProj, setShowProj] = useState(true);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillIn, setSkillIn] = useState("");
  const [showSkills, setShowSkills] = useState(true);
  const [indexable, setIndexable] = useState(false);
  const [pronouns, setPronouns] = useState("");
  const [websites, setWebsites] = useState<ProfileWebsite[]>([]);
  const [otw, setOtw] = useState(false);
  const [otwTitles, setOtwTitles] = useState("");
  const [otwTypes, setOtwTypes] = useState<string[]>([]);
  const [langs, setLangs] = useState<ProfileLanguage[]>([]);
  const [showLangs, setShowLangs] = useState(true);
  const [certs, setCerts] = useState<ProfileCert[]>([]);
  const [showCerts, setShowCerts] = useState(true);
  const [vols, setVols] = useState<ProfileVolunteer[]>([]);
  const [showVols, setShowVols] = useState(true);
  const [honors, setHonors] = useState<ProfileHonor[]>([]);
  const [showHonors, setShowHonors] = useState(true);

  const addSkill = () => {
    const parts = skillIn.split(",").map((s) => s.trim().slice(0, 40)).filter(Boolean);
    const next = [...skills];
    for (const s of parts) if (next.length < 100 && !next.some((x) => x.toLowerCase() === s.toLowerCase())) next.push(s);
    setSkills(next);
    setSkillIn("");
  };

  const profile = useMemo<PublicProfile>(
    () => ({
      slug: makeSlug(name || "your-name", () => 0.5),
      kind: "individual",
      name: name || "Your name",
      headline: headline || "Your headline",
      location: location || "City, Country",
      about: showAbout ? about || "A few lines about you." : "",
      experience: showExp ? exp : [],
      education: showEdu ? edu : [],
      projects: showProj ? proj : [],
      skills: showSkills ? skills : [],
      languages: showLangs ? langs : [],
      certs: showCerts ? certs : [],
      volunteer: showVols ? vols : [],
      honors: showHonors ? honors : [],
      pronouns,
      websites: websites.filter((w) => w.url.trim() && safeUrl(w.url)),
      openToWork: otw ? { titles: otwTitles.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 5), workTypes: otwTypes, visibleTo: "everyone" } : null,
      jobs: [],
      indexable,
    }),
    [pronouns, websites, otw, otwTitles, otwTypes, langs, showLangs, certs, showCerts, vols, showVols, honors, showHonors, name, headline, location, about, showAbout, exp, showExp, edu, showEdu, proj, showProj, skills, showSkills, indexable],
  );

  const jumpTo = (title: string) => {
    const root = document.querySelector("form");
    if (!root) return;
    let card: HTMLElement | null = root.querySelector(`section[aria-label="${title}"]`);
    if (!card) {
      const hit = [...root.querySelectorAll("label,p,span")].find((n) => (n.textContent || "").trim().startsWith(title));
      card = (hit?.closest("div.rounded-xl, section") as HTMLElement | null) ?? null;
    }
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("ring-2", "ring-primary");
    window.setTimeout(() => card?.classList.remove("ring-2", "ring-primary"), 1800);
    const first = card.querySelector<HTMLElement>("input,textarea,select,button");
    window.setTimeout(() => first?.focus({ preventScroll: true }), 350);
  };

  return (
    <main className="mx-auto w-full max-w-[1500px] overflow-x-clip px-3 py-8 sm:px-6 sm:py-12">
      <p className="text-xs uppercase tracking-widest text-primary">Public profile</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-5xl">Make my public profile</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        You decide what is public. Your email, phone number and street address are never shown. Nothing goes live until
        you press Publish, and you can delete it any time.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <Field label="Full name" required>
              <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Riya Mehta" maxLength={100} />
            </Field>
            <Field label="Headline" required>
              <input className={field} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Digital Marketing Executive" maxLength={220} />
              <Counter value={headline} max={220} />
            </Field>
            <Field label="City and country only" hint="No street address. It is never shown.">
              <input className={field} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Pune, India" maxLength={80} />
            </Field>
            <Field label="Pronouns">
              <select className={field} value={pronouns} onChange={(e) => setPronouns(e.target.value)}>
                {PRONOUNS.map((o) => <option key={o} value={o}>{o || "Not set"}</option>)}
              </select>
            </Field>
            <p className="mt-3 text-sm font-semibold text-foreground">Websites (up to 3)</p>
            <p className="text-xs text-muted-foreground">Portfolio, blog or company site. Email and phone are never shown.</p>
            {websites.map((w, i) => (
              <div key={i} className="mt-2 flex gap-2">
                <input className={field + " !mt-0 w-28"} placeholder="Label" value={w.label} maxLength={30} onChange={(e) => setWebsites(websites.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <input className={field + " !mt-0"} placeholder="https://" value={w.url} maxLength={300} onChange={(e) => setWebsites(websites.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                <Button type="button" size="sm" variant="outline" aria-label="Remove website" onClick={() => setWebsites(websites.filter((_, j) => j !== i))}>X</Button>
              </div>
            ))}
            {websites.length < 3 ? (
              <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => setWebsites([...websites, { label: "", url: "" }])}>
                Add website
              </Button>
            ) : null}
            <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <input type="checkbox" checked={otw} onChange={(e) => setOtw(e.target.checked)} className="h-4 w-4 accent-[#f7d000]" />
              Open to work
            </label>
            {otw ? (
              <div className="mt-2">
                <Field label="Job titles (up to 5, comma separated)">
                  <input className={field} value={otwTitles} maxLength={200} onChange={(e) => setOtwTitles(e.target.value)} />
                </Field>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-foreground">
                  {WORK_TYPES.map((w) => (
                    <label key={w} className="flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 accent-[#f7d000]" checked={otwTypes.includes(w)} onChange={(e) => setOtwTypes(e.target.checked ? [...otwTypes, w] : otwTypes.filter((x) => x !== w))} />
                      {w}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <Field label="About">
              <textarea className={field} rows={5} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Two or three plain lines about your work." maxLength={2600} />
              <Counter value={about} max={2600} />
            </Field>
            <Show checked={showAbout} onChange={setShowAbout} />
          </div>

          <ListEditor<ProfileExperience>
            title="Experience"
            help="Add every job, internship or freelance work. Use Up and Down to reorder."
            items={exp}
            onChange={setExp}
            show={showExp}
            onShow={setShowExp}
            empty={emptyExp}
            addLabel="Add experience"
            summary={(e) => ({ title: e.role || "Role", sub: [e.org, fmtRange(e.start, e.end, e.current)].filter(Boolean).join(" | ") })}
            validate={(e) =>
              !e.role.trim() ? "Add a job title." : !e.org.trim() ? "Add the company." : !e.start ? "Add a start date."
              : !e.current && !e.end ? "Add an end date, or tick I currently work here."
              : endBeforeStart(e.start, e.end) ? "End date cannot be before the start date." : null
            }
            form={(d, set) => (
              <>
                <Field label="Title" required><input className={field} value={d.role} maxLength={100} onChange={(e) => set({ role: e.target.value })} /></Field>
                <Field label="Company" required><input className={field} value={d.org} maxLength={100} onChange={(e) => set({ org: e.target.value })} /></Field>
                <Field label="Employment type">
                  <select className={field} value={d.empType} onChange={(e) => set({ empType: e.target.value })}>{EMP_TYPES.map((o) => <option key={o} value={o}>{o || "Not set"}</option>)}</select>
                </Field>
                <Field label="Location"><input className={field} value={d.location} maxLength={80} onChange={(e) => set({ location: e.target.value })} /></Field>
                <Field label="Location type">
                  <select className={field} value={d.locType} onChange={(e) => set({ locType: e.target.value })}>{LOC_TYPES.map((o) => <option key={o} value={o}>{o || "Not set"}</option>)}</select>
                </Field>
                <Field label="Start date" required><input type="month" className={field} value={d.start} onChange={(e) => set({ start: e.target.value })} /></Field>
                <label className="mt-3 flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={d.current} className="h-4 w-4 accent-[#f7d000]" onChange={(e) => set({ current: e.target.checked, end: e.target.checked ? "" : d.end })} />
                  I currently work here
                </label>
                {!d.current ? <Field label="End date" required><input type="month" className={field} value={d.end} onChange={(e) => set({ end: e.target.value })} /></Field> : null}
                <Field label="Description" hint="One line per point.">
                  <textarea className={field} rows={4} value={d.description} maxLength={2000} onChange={(e) => set({ description: e.target.value })} />
                  <Counter value={d.description} max={2000} />
                </Field>
              </>
            )}
          />

          <ListEditor<ProfileEducation>
            title="Education"
            items={edu}
            onChange={setEdu}
            show={showEdu}
            onShow={setShowEdu}
            empty={emptyEdu}
            addLabel="Add education"
            summary={(e) => ({ title: e.school || "School", sub: [e.degree, fmtRange(e.start, e.end, false)].filter(Boolean).join(" | ") })}
            validate={(e) => (!e.school.trim() ? "Add the school or university." : endBeforeStart(e.start, e.end) ? "End date cannot be before the start date." : null)}
            form={(d, set) => (
              <>
                <Field label="School" required><input className={field} value={d.school} maxLength={120} onChange={(e) => set({ school: e.target.value })} /></Field>
                <Field label="Degree"><input className={field} value={d.degree} maxLength={80} onChange={(e) => set({ degree: e.target.value })} placeholder="B.Tech" /></Field>
                <Field label="Field of study"><input className={field} value={d.field} maxLength={80} onChange={(e) => set({ field: e.target.value })} /></Field>
                <Field label="Start"><input type="month" className={field} value={d.start} onChange={(e) => set({ start: e.target.value })} /></Field>
                <Field label="End (or expected)"><input type="month" className={field} value={d.end} onChange={(e) => set({ end: e.target.value })} /></Field>
                <Field label="Grade"><input className={field} value={d.grade} maxLength={40} onChange={(e) => set({ grade: e.target.value })} /></Field>
                <Field label="Activities and societies"><textarea className={field} rows={2} value={d.activities} maxLength={1000} onChange={(e) => set({ activities: e.target.value })} /></Field>
                <Field label="Description"><textarea className={field} rows={3} value={d.description} maxLength={1000} onChange={(e) => set({ description: e.target.value })} /></Field>
              </>
            )}
          />

          <ListEditor<ProfileProject>
            title="Projects"
            help="Software you built, research, college projects, side projects, client work. Anything you made or worked on."
            items={proj}
            onChange={setProj}
            show={showProj}
            onShow={setShowProj}
            empty={emptyProj}
            addLabel="Add project"
            summary={(p) => ({ title: p.name || "Project", sub: [p.type, p.role, p.status].filter(Boolean).join(" | ") })}
            validate={(p) =>
              !p.name.trim() ? "Add a project name." : !p.summary.trim() && !p.contribution.trim() ? "Say what it is or what you did."
              : endBeforeStart(p.start, p.end) ? "End date cannot be before the start date."
              : p.links.some((l) => l.url.trim() && !safeUrl(l.url)) ? "One link is not a valid web address." : null
            }
            form={(d, set) => (
              <>
                <Field label="Project name" required><input className={field} value={d.name} maxLength={100} onChange={(e) => set({ name: e.target.value })} /></Field>
                <Field label="Type">
                  <select className={field} value={d.type} onChange={(e) => set({ type: e.target.value as ProjectType })}>{PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
                </Field>
                <Field label="Your role" hint="Example: Lead developer, Research assistant, Team member.">
                  <input className={field} value={d.role} maxLength={80} onChange={(e) => set({ role: e.target.value })} />
                </Field>
                <Field label="Status">
                  <select className={field} value={d.status} onChange={(e) => set({ status: e.target.value as ProfileProject["status"] })}>
                    {["Completed", "Ongoing", "Paused"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Start"><input type="month" className={field} value={d.start} onChange={(e) => set({ start: e.target.value })} /></Field>
                {d.status !== "Ongoing" ? <Field label="End"><input type="month" className={field} value={d.end} onChange={(e) => set({ end: e.target.value })} /></Field> : null}
                <Field label="Linked to" hint="A job, a university, a client, or Personal.">
                  <input className={field} value={d.associated} maxLength={100} onChange={(e) => set({ associated: e.target.value })} />
                </Field>
                <Field label="What it is" hint="Plain words. What problem, what for.">
                  <textarea className={field} rows={3} value={d.summary} maxLength={1000} onChange={(e) => set({ summary: e.target.value })} />
                  <Counter value={d.summary} max={1000} />
                </Field>
                <Field label="What you did" hint="Your own part, so readers can tell it apart from the team's.">
                  <textarea className={field} rows={3} value={d.contribution} maxLength={1000} onChange={(e) => set({ contribution: e.target.value })} />
                  <Counter value={d.contribution} max={1000} />
                </Field>
                <Field label="Tools, tech or methods (comma separated)">
                  <input className={field} value={d.tools.join(", ")} maxLength={300} onChange={(e) => set({ tools: e.target.value.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 15) })} />
                </Field>
                <Field label="Worked with" hint="Names as plain text. They do not need an account.">
                  <input className={field} value={d.collaborators} maxLength={200} onChange={(e) => set({ collaborators: e.target.value })} />
                </Field>
                <p className="mt-3 text-sm font-semibold text-foreground">Links (code, live demo, paper, case study)</p>
                {d.links.map((l, i) => (
                  <div key={i} className="mt-2 flex gap-2">
                    <input className={field + " !mt-0 w-28"} placeholder="Label" value={l.label} maxLength={30} onChange={(e) => set({ links: d.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                    <input className={field + " !mt-0"} placeholder="https://" value={l.url} maxLength={300} onChange={(e) => set({ links: d.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} />
                    <Button type="button" size="sm" variant="outline" aria-label="Remove link" onClick={() => set({ links: d.links.filter((_, j) => j !== i) })}>X</Button>
                  </div>
                ))}
                {d.links.length < 4 ? (
                  <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => set({ links: [...d.links, { label: "", url: "" }] })}>
                    Add link
                  </Button>
                ) : null}
              </>
            )}
          />

          <ListEditor<ProfileCert>
            title="Licenses and certifications"
            items={certs}
            onChange={setCerts}
            show={showCerts}
            onShow={setShowCerts}
            empty={emptyCert}
            addLabel="Add certification"
            summary={(c) => ({ title: c.name || "Certification", sub: [c.issuer, c.issued && fmtMonth(c.issued)].filter(Boolean).join(" | ") })}
            validate={(c) =>
              !c.name.trim() ? "Add the certification name." : !c.issuer.trim() ? "Add who issued it."
              : endBeforeStart(c.issued, c.expires) ? "Expiry cannot be before the issue date."
              : c.url.trim() && !safeUrl(c.url) ? "The credential link is not a valid web address." : null
            }
            form={(d, set) => (
              <>
                <Field label="Name" required><input className={field} value={d.name} maxLength={120} onChange={(e) => set({ name: e.target.value })} /></Field>
                <Field label="Issuing organization" required><input className={field} value={d.issuer} maxLength={120} onChange={(e) => set({ issuer: e.target.value })} /></Field>
                <Field label="Issue date"><input type="month" className={field} value={d.issued} onChange={(e) => set({ issued: e.target.value })} /></Field>
                <Field label="Expiry date"><input type="month" className={field} value={d.expires} onChange={(e) => set({ expires: e.target.value })} /></Field>
                <Field label="Credential ID"><input className={field} value={d.credentialId} maxLength={80} onChange={(e) => set({ credentialId: e.target.value })} /></Field>
                <Field label="Credential link"><input className={field} value={d.url} maxLength={300} placeholder="https://" onChange={(e) => set({ url: e.target.value })} /></Field>
              </>
            )}
          />

          <ListEditor<ProfileVolunteer>
            title="Volunteering"
            items={vols}
            onChange={setVols}
            show={showVols}
            onShow={setShowVols}
            empty={emptyVol}
            addLabel="Add volunteering"
            summary={(v) => ({ title: v.role || "Role", sub: [v.org, v.cause].filter(Boolean).join(" | ") })}
            validate={(v) => (!v.org.trim() ? "Add the organization." : !v.role.trim() ? "Add your role." : endBeforeStart(v.start, v.end) ? "End date cannot be before the start date." : null)}
            form={(d, set) => (
              <>
                <Field label="Organization" required><input className={field} value={d.org} maxLength={120} onChange={(e) => set({ org: e.target.value })} /></Field>
                <Field label="Role" required><input className={field} value={d.role} maxLength={100} onChange={(e) => set({ role: e.target.value })} /></Field>
                <Field label="Cause"><input className={field} value={d.cause} maxLength={60} placeholder="Education, Environment..." onChange={(e) => set({ cause: e.target.value })} /></Field>
                <Field label="Start"><input type="month" className={field} value={d.start} onChange={(e) => set({ start: e.target.value })} /></Field>
                <Field label="End (leave empty if ongoing)"><input type="month" className={field} value={d.end} onChange={(e) => set({ end: e.target.value })} /></Field>
                <Field label="Description"><textarea className={field} rows={3} value={d.description} maxLength={2000} onChange={(e) => set({ description: e.target.value })} /></Field>
              </>
            )}
          />

          <ListEditor<ProfileHonor>
            title="Honors and awards"
            items={honors}
            onChange={setHonors}
            show={showHonors}
            onShow={setShowHonors}
            empty={emptyHonor}
            addLabel="Add award"
            summary={(h) => ({ title: h.title || "Award", sub: [h.issuer, h.date && fmtMonth(h.date)].filter(Boolean).join(" | ") })}
            validate={(h) => (!h.title.trim() ? "Add the award title." : null)}
            form={(d, set) => (
              <>
                <Field label="Title" required><input className={field} value={d.title} maxLength={120} onChange={(e) => set({ title: e.target.value })} /></Field>
                <Field label="Issued by"><input className={field} value={d.issuer} maxLength={120} onChange={(e) => set({ issuer: e.target.value })} /></Field>
                <Field label="Date"><input type="month" className={field} value={d.date} onChange={(e) => set({ date: e.target.value })} /></Field>
                <Field label="Description"><textarea className={field} rows={3} value={d.description} maxLength={2000} onChange={(e) => set({ description: e.target.value })} /></Field>
              </>
            )}
          />

          <ListEditor<ProfileLanguage>
            title="Languages"
            items={langs}
            onChange={setLangs}
            show={showLangs}
            onShow={setShowLangs}
            empty={emptyLang}
            addLabel="Add language"
            summary={(l) => ({ title: l.name || "Language", sub: l.level })}
            validate={(l) => (!l.name.trim() ? "Add the language." : null)}
            form={(d, set) => (
              <>
                <Field label="Language" required><input className={field} value={d.name} maxLength={50} onChange={(e) => set({ name: e.target.value })} /></Field>
                <Field label="Proficiency" required>
                  <select className={field} value={d.level} onChange={(e) => set({ level: e.target.value })}>{LANG_LEVELS.map((o) => <option key={o}>{o}</option>)}</select>
                </Field>
              </>
            )}
          />

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <p className="text-sm font-semibold text-foreground">Skills</p>
            <p className="mt-1 text-xs text-muted-foreground">The first 3 are shown as featured. Up to 100.</p>
            <div className="mt-2 flex gap-2">
              <input
                className={field + " !mt-0"}
                value={skillIn}
                maxLength={120}
                placeholder="Add a skill, press Enter"
                onChange={(e) => setSkillIn(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              />
              <Button type="button" size="sm" onClick={addSkill}>Add</Button>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <li key={s} className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-foreground ${i < 3 ? "border-primary bg-primary/10" : "border-border/60"}`}>
                  {s}
                  {i > 2 ? <button type="button" aria-label={`Feature ${s}`} className="text-primary" onClick={() => setSkills([s, ...skills.filter((x) => x !== s)])}>^</button> : null}
                  <button type="button" aria-label={`Remove ${s}`} className="text-muted-foreground" onClick={() => setSkills(skills.filter((x) => x !== s))}>x</button>
                </li>
              ))}
            </ul>
            <Show checked={showSkills} onChange={setShowSkills} />
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

        <div className="min-w-0 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <ProfileView compact onEdit={jumpTo} profile={profile} banner="Live preview. Only you can see this." />
        </div>
      </div>
    </main>
  );
}
