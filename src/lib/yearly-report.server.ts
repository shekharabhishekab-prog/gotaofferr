/**
 * Year-end report: four PDFs built in memory and emailed. Nothing but the small
 * monthly number files (see monthly-stats.server.ts) is kept in R2.
 * The insight text is plain rules over the numbers. No AI, nothing leaves our own servers
 * except the email itself.
 */
import { MiniPdf } from "./mini-pdf";
import { REGIONS } from "./region";
import { monthsForYear, loadAuthUsers, userRegion, type MonthRecord } from "./monthly-stats.server";
import { r2Get, r2Put } from "./r2.server";

export const YEARLY_REPORT_TO = ["shekhar.abhishekab@gmail.com", "contact@gotaofferr.com"];
export type ReportFile = { filename: string; bytes: Uint8Array };

const pct = (n: number) => `${n.toFixed(1)}%`;
const monthName = (ym: string) => new Date(`${ym}-01T00:00:00Z`).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const istDate = (iso: string | null | undefined) =>
  iso ? new Date(new Date(iso).getTime() + 330 * 60_000).toISOString().slice(0, 10) : "-";

function sum(months: MonthRecord[], pick: (m: MonthRecord) => number) {
  return months.reduce((a, m) => a + pick(m), 0);
}

function totalsPdf(year: number, months: MonthRecord[]): Uint8Array {
  const doc = new MiniPdf(`GotaOfferr ${year} totals`);
  doc.title(`GotaOfferr - yearly totals ${year}`);
  doc.p("Month by month. A month is a calendar month in India time. Finished months are locked numbers; the last row may be a month still running.");
  doc.h("Totals per month");
  doc.table(
    ["Month", "New users", "Rewrites", "Searches", "Builder", "Alerts", "Paid subs", "Paid share"],
    months.map((m) => [monthName(m.month), m.cards.users, m.cards.rewrites, m.cards.searches, m.cards.builderDownloads, m.cards.alerts, (m.cards.paidSubscriptionsStarted ?? 0), pct(m.cards.subscriberSharePercent)]),
    [9, 9, 8, 8, 7, 6, 9, 10],
  );
  doc.gap(8);
  doc.table(
    ["Year total", "New users", "Rewrites", "Searches", "Builder", "Alerts", "Paid subs"],
    [["", sum(months, (m) => m.cards.users), sum(months, (m) => m.cards.rewrites), sum(months, (m) => m.cards.searches), sum(months, (m) => m.cards.builderDownloads), sum(months, (m) => m.cards.alerts), sum(months, (m) => (m.cards.paidSubscriptionsStarted ?? 0))]],
    [10, 9, 8, 8, 7, 6, 9],
  );
  const last = months[months.length - 1];
  if (last) doc.p(`Users in total at the end of ${monthName(last.month)}: ${last.totalUsersAtEnd}. Active subscribers then: ${last.activeSubscribersAtEnd}.`);
  doc.h("By region (whole year)");
  doc.table(
    ["Region", "Users joined", "Paid subscriptions started"],
    REGIONS.map((r) => [r, sum(months, (m) => m.regions[r]?.users ?? 0), sum(months, (m) => m.regions[r]?.subscriptions ?? 0)]),
    [16, 13, 26],
  );
  doc.p("Region comes from the connection country at first sign-in. A VPN can show a different region. Accounts made before tracking began count as India.", 8);
  return doc.build();
}

export function insightLines(year: number, months: MonthRecord[]): { happened: string[]; next: string[] } {
  const happened: string[] = [];
  const next: string[] = [];
  if (!months.length) return { happened: ["No monthly numbers were recorded this year."], next: ["Check that the month-end lock job ran."] };
  const users = sum(months, (m) => m.cards.users);
  const rewrites = sum(months, (m) => m.cards.rewrites);
  const subs = sum(months, (m) => (m.cards.paidSubscriptionsStarted ?? 0));
  const searches = sum(months, (m) => m.cards.searches);
  const last = months[months.length - 1];
  happened.push(`${users} people signed up in ${year}. ${last.totalUsersAtEnd} accounts exist now.`);
  const best = [...months].sort((a, b) => b.cards.users - a.cards.users)[0];
  happened.push(`Best month for signups: ${monthName(best.month)} with ${best.cards.users}.`);
  if (months.length >= 2) {
    const prev = months[months.length - 2];
    const d = last.cards.users - prev.cards.users;
    const rel = prev.cards.users ? ` (${d >= 0 ? "+" : ""}${((d / prev.cards.users) * 100).toFixed(0)}%)` : "";
    happened.push(`Last month versus the month before: ${last.cards.users} against ${prev.cards.users} signups${rel}.`);
  }
  happened.push(`${rewrites} resume rewrites, ${searches} job searches and ${subs} paid subscriptions started in the year.`);
  happened.push(`${last.activeSubscribersAtEnd} active subscribers at the end of the latest month; paid share ${pct(last.cards.subscriberSharePercent)} of real users.`);
  const byRegion = REGIONS.map((r) => ({ r, u: sum(months, (m) => m.regions[r]?.users ?? 0) })).sort((a, b) => b.u - a.u);
  happened.push(`Most new users came from ${byRegion[0].r} (${byRegion[0].u}).`);
  const outsideIndia = byRegion.filter((x) => x.r !== "India").reduce((a, x) => a + x.u, 0);

  const perUser = users ? rewrites / users : 0;
  if (last.cards.subscriberSharePercent < 5) next.push("Few users pay. Work on the step from free to paid: clear value after the free limit, and a reminder before it runs out.");
  else next.push("Paid share is healthy. Protect it: watch cancellations and keep prices steady.");
  if (perUser < 2) next.push("Users rewrite less than twice on average. Improve the first-use path so a new user finishes one rewrite quickly.");
  if (users && outsideIndia / users < 0.2) next.push("Under 20% of new users are outside India. Add country pages and foreign job sources to grow abroad.");
  if (months.length >= 2 && last.cards.users <= months[months.length - 2].cards.users) next.push("Signups did not grow last month. Put effort into search traffic and backlinks first.");
  next.push(`Distance to the 10,000-user milestone: ${Math.max(0, 10000 - last.totalUsersAtEnd)} more users.`);
  next.push("Vision check (5 to 10 years): a full hiring platform with resumes, job search, company profiles and project showcases. Near term the order stays visitor growth first, then the platform pieces.");
  return { happened, next };
}

function insightPdf(year: number, months: MonthRecord[]): Uint8Array {
  const { happened, next } = insightLines(year, months);
  const doc = new MiniPdf(`GotaOfferr ${year} insight`);
  doc.title(`GotaOfferr - insight report ${year}`);
  doc.p("Written by simple rules from the monthly numbers. No AI was used and no data was sent anywhere.");
  doc.h("What happened this year");
  for (const l of happened) doc.p(`- ${l}`);
  doc.h("What we can do next year");
  for (const l of next) doc.p(`- ${l}`);
  return doc.build();
}

async function loadDetails() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { planLabel } = await import("./plans");
  const { getStripeEnvironment } = await import("./stripe");
  const { decryptText } = await import("./field-crypto.server");
  const users = await loadAuthUsers(supabaseAdmin);
  const { data: profs } = await supabaseAdmin.from("profiles").select("id,full_name").limit(10000);
  const names = new Map<string, string | null>();
  for (const p of profs ?? []) names.set(p.id, await decryptText(p.full_name));
  const { data: subs } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id,price_id,status,current_period_end,cancel_at_period_end,created_at")
    .eq("environment", getStripeEnvironment())
    .order("created_at", { ascending: true })
    .limit(10000);
  const byId = new Map(users.map((u) => [u.id, u] as const));
  const nameOf = (id: string) => names.get(id) ?? (byId.get(id)?.user_metadata?.full_name ? String(byId.get(id).user_metadata.full_name) : null);
  return { users, subs: subs ?? [], nameOf, planLabel, byId };
}

async function detailPdfs(year: number) {
  const { users, subs, nameOf, planLabel, byId } = await loadDetails();
  const u = new MiniPdf(`GotaOfferr ${year} user details`);
  u.title(`GotaOfferr - user details ${year}`);
  u.p(`${users.length} accounts. Private: contains names and emails.`);
  u.table(
    ["Name", "Email", "Region", "Joined", "Last sign-in"],
    [...users].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))).map((x) => [nameOf(x.id), x.email, userRegion(x), istDate(x.created_at), istDate(x.last_sign_in_at)]),
    [18, 32, 14, 11, 12],
  );
  const s = new MiniPdf(`GotaOfferr ${year} subscription details`);
  s.title(`GotaOfferr - subscription details ${year}`);
  s.p(`${subs.length} subscription records. Private: contains names and emails.`);
  s.table(
    ["Name", "Email", "Plan", "Status", "Started", "Renews/ends"],
    subs.map((x: any) => [nameOf(x.user_id), byId.get(x.user_id)?.email, planLabel(x.price_id), x.cancel_at_period_end ? `${x.status} (cancels)` : x.status, istDate(x.created_at), istDate(x.current_period_end)]),
    [14, 26, 13, 17, 10, 10],
  );
  return { users: u.build(), subs: s.build() };
}

export async function buildYearlyReports(year: number): Promise<ReportFile[]> {
  const months = await monthsForYear(year);
  const d = await detailPdfs(year);
  return [
    { filename: `gotaofferr-${year}-1-yearly-totals.pdf`, bytes: totalsPdf(year, months) },
    { filename: `gotaofferr-${year}-2-insight-report.pdf`, bytes: insightPdf(year, months) },
    { filename: `gotaofferr-${year}-3-user-details.pdf`, bytes: d.users },
    { filename: `gotaofferr-${year}-4-subscription-details.pdf`, bytes: d.subs },
  ];
}

function b64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Emails the four PDFs once. A marker file in R2 stops a second send for the same year. */
export async function sendYearlyReports(year: number): Promise<{ ok: boolean; reason?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: "email-not-configured" };
  const markerKey = `reports/sent/${year}.json`;
  const m = await r2Get(markerKey);
  if (m.ok) return { ok: true, reason: "already-sent" };
  const files = await buildYearlyReports(year);
  const domain = process.env.RESEND_FROM_DOMAIN || "gotaofferr.com";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `GotaOfferr reports <noreply@${domain}>`,
      to: YEARLY_REPORT_TO,
      subject: `GotaOfferr yearly report ${year}`,
      text: `The four year-end PDFs for ${year} are attached: yearly totals, insight report, user details, subscription details.\n\nThese are not stored on our servers. Please save them to your Google Drive.`,
      attachments: files.map((f) => ({ filename: f.filename, content: b64(f.bytes) })),
    }),
  });
  if (!res.ok) return { ok: false, reason: `email-failed-${res.status}` };
  await r2Put(markerKey, new TextEncoder().encode(JSON.stringify({ sentAt: new Date().toISOString() })), "application/json");
  return { ok: true };
}
