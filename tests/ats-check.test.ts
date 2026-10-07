import { checkAts } from "../src/lib/ats-check";

const good = (name: string, role: string, extra = "") => `${name}
${name.toLowerCase().replace(/ /g, ".")}@example.com | +91 98765 43210

Summary
${role} with 5 years of experience delivering measurable results across teams and tools.

Experience
${role}, Acme Corp
Jan 2021 - Present
- Led a team of 6 to deliver 12 projects, cutting turnaround time by 30%
- Built dashboards used by 40 managers, saving 8 hours a week
- Improved onboarding flow and increased activation by 18%
- Automated weekly reporting, reducing errors by 25%
Analyst, Beta Ltd
Jun 2018 - Dec 2020
- Analysed sales data for 3 regions and grew revenue by 12%
- Created a pricing model adopted across 5 product lines
- Managed vendor contracts worth 40 lakh
${extra}

Education
B.Com, Delhi University, 2018

Skills
SQL, Excel, Power BI, stakeholder management, reporting
`;

type Case = { name: string; text: string; jd?: string; min: number; max: number; mustHint?: RegExp };
const jd = "We need a data analyst with SQL, Tableau and Python experience to build dashboards and reporting for finance stakeholders.";
const cases: Case[] = [
  { name: "01 strong resume", text: good("Aarav Sharma", "Business Analyst"), min: 85, max: 100 },
  { name: "02 strong + JD", text: good("Meera Iyer", "Data Analyst"), jd, min: 75, max: 100, mustHint: /tableau|python/i },
  { name: "03 empty", text: "", min: 0, max: 20 },
  { name: "04 no contact", text: good("Ravi K", "Analyst").replace(/.*@example\.com.*\n/, ""), min: 60, max: 95, mustHint: /email|phone/i },
  { name: "05 no sections", text: good("Zoya A", "Analyst").replace(/^(Summary|Experience|Education|Skills)$/gm, ""), min: 40, max: 85, mustHint: /headings/i },
  { name: "06 no numbers", text: good("Tom B", "Analyst").replace(/\d+%?/g, (m) => (m.length > 3 ? m : "")), min: 40, max: 90, mustHint: /numbers/i },
  { name: "07 paragraph only", text: "John Doe\njohn@x.com 9876543210\n" + "I worked on many things and helped the team a lot over the years. ".repeat(30), min: 10, max: 55, mustHint: /bullet/i },
  { name: "08 table layout", text: good("Ann C", "Analyst") + "\nSkills | Level | Years\nSQL | Expert | 5\n", min: 50, max: 79, mustHint: /tables/i },
  { name: "09 emoji", text: good("Dev P", "Analyst") + "\n📞 📧 ⭐", min: 70, max: 99, mustHint: /emoji/i },
  { name: "10 too short", text: "Sam\nsam@x.com\nExperience\nWorked at a shop.", min: 5, max: 50, mustHint: /short/i },
  { name: "11 too long", text: good("Ela R", "Analyst") + "\n" + "- Managed a project with 5 people and improved output by 10%\n".repeat(120), min: 50, max: 79, mustHint: /long/i },
  { name: "12 no dates", text: good("Kai L", "Analyst").replace(/^(Jan|Jun) \d{4}.*$/gm, ""), min: 50, max: 79, mustHint: /dates/i },
  { name: "13 weak verbs", text: good("Nia O", "Analyst").replace(/^- (\w+)/gm, "- Responsible for $1"), min: 55, max: 95, mustHint: /action verbs/i },
  { name: "14 CRLF + headings colon", text: good("Uma S", "Analyst").replace(/^(Summary|Experience|Education|Skills)$/gm, "$1:").replace(/\n/g, "\r\n"), min: 85, max: 100 },
  { name: "15 JD fully matched", text: good("Vik T", "Analyst") + "\nSQL Tableau Python dashboards reporting finance stakeholders analyst", jd, min: 85, max: 100 },
];

let fail = 0;
for (const c of cases) {
  const r = checkAts(c.text, c.jd);
  const okRange = r.score >= c.min && r.score <= c.max;
  const okHint = !c.mustHint || r.hints.some((h) => c.mustHint!.test(h));
  const okSum = r.score >= 0 && r.score <= 100;
  const ok = okRange && okHint && okSum;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"} ${c.name}: score ${r.score} (${r.band}) expected ${c.min}-${c.max}${okHint ? "" : " | missing hint " + c.mustHint}`);
}
// never invents skills: output must not contain skills absent from resume + JD
const r2 = checkAts(good("A B", "Analyst"), jd);
const inv = r2.missingKeywords.filter((k) => new RegExp(`\\b${k}\\b`, "i").test(good("A B", "Analyst")));
console.log(inv.length === 0 ? "PASS missing keywords are really missing" : "FAIL keyword listed but present: " + inv);
if (inv.length) fail++;
const det = JSON.stringify(checkAts(good("A B", "X"), jd)) === JSON.stringify(checkAts(good("A B", "X"), jd));
console.log(det ? "PASS deterministic" : "FAIL not deterministic"); if (!det) fail++;
const rule = (name: string, ok: boolean) => { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); if (!ok) fail++; };
rule("empty score is zero", checkAts("").score === 0);
const fakePhone = checkAts("Summary\nExperienced analyst\nExperience\n2018 - 2020\n2021 - 2024\nEducation\nSkills\nSQL");
rule("employment years are not a phone", fakePhone.checks.find(c => c.id === "contact")?.points === 0);
rule("contact separators are not tables", !checkAts(good("A B", "Analyst").replace("@example.com |", "@example.com | Delhi |")).hints.some(h => /tables/.test(h)));
rule("tokens keep C++ and node.js", !checkAts(good("A B", "Analyst") + "\nC++ node.js", "A developer needed for C++ and node.js development development development.").missingKeywords.some(k => k === "c++" || k === "node.js"));
const base = good("A B", "Analyst");
rule("table warning cannot receive strong band", checkAts(base + "\nTool | Level | Years\nSQL | Expert | 5").score < 85);
rule("long resume cannot receive strong band", checkAts(base + " word".repeat(1200)).score < 85);
rule("same input with CRLF is same score", checkAts(base).score === checkAts(base.replace(/\n/g,"\r\n")).score);
rule("true numbers improve score", checkAts(base).score > checkAts(base.replace(/^-.*$/gm, "- Led projects and improved outcomes")).score);
console.log(fail ? `${fail} FAILED` : "ALL PASSED");
process.exit(fail ? 1 : 0);
