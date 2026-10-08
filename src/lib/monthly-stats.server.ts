/**
 * Monthly numbers for the admin cards and the year-end report.
 * - A month is a calendar month in India time (fixed UTC+05:30).
 * - The current month is counted live from the database. A finished month is
 *   "locked" once (one small JSON file in R2, about 1 KB, numbers only, no names or emails).
 * - Locked files are never overwritten unless force is set by hand.
 */
import { r2Get, r2Put } from "./r2.server";
import { regionForCountry, REGIONS } from "./region";

export type MonthCards = {
  users: number;
  rewrites: number;
  searches: number;
  builderDownloads: number;
  alerts: number;
  subscriptionsStarted: number; // all subscription records (dashboard card)
  paidSubscriptionsStarted: number; // only records that are active/paid (year-end report)
  subscriberSharePercent: number;
  // Uses split by whether the user is a paying subscriber at the time of counting.
  split?: { rewrites: UseSplit; searches: UseSplit; builderDownloads: UseSplit; alerts: UseSplit };
};
export type UseSplit = { paid: number; free: number };
export type RegionSplit = Record<string, { users: number; subscriptions: number }>;
export type MonthRecord = {
  month: string; // YYYY-MM
  lockedAt: string | null; // null while still running
  cards: MonthCards;
  regions: RegionSplit;
  totalUsersAtEnd: number;
  activeSubscribersAtEnd: number;
};

const IST_MS = 330 * 60_000;

export function currentMonthIST(now = new Date()): string {
  const d = new Date(now.getTime() + IST_MS);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
export function isValidMonth(m: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(m);
}
export function monthRange(ym: string): { start: number; end: number } {
  const [y, m] = ym.split("-").map(Number);
  return { start: Date.UTC(y, m - 1, 1) - IST_MS, end: Date.UTC(y, m, 1) - IST_MS };
}
/** True on the last IST day of the month at 22:00 or later. */
export function isMonthLockWindow(now = new Date()): boolean {
  const d = new Date(now.getTime() + IST_MS);
  const tomorrow = new Date(d.getTime() + 24 * 3600_000);
  return tomorrow.getUTCMonth() !== d.getUTCMonth() && d.getUTCHours() >= 22;
}

async function allRows(makeQuery: () => any): Promise<any[]> {
  const all: any[] = [];
  for (let offset = 0; offset < 100000; offset += 1000) {
    const { data, error } = await makeQuery().range(offset, offset + 999);
    if (error) throw new Error("monthly-read-failed");
    all.push(...(data ?? []));
    if ((data ?? []).length < 1000) return all;
  }
  throw new Error("monthly-too-large");
}

export async function loadAuthUsers(supabaseAdmin: any): Promise<any[]> {
  const out: any[] = [];
  for (let page = 1; page <= 100; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error("monthly-users-failed");
    out.push(...(data?.users ?? []));
    if ((data?.users ?? []).length < 1000) break;
  }
  return out;
}

export function userRegion(u: any): string {
  return String(u?.app_metadata?.signup_region ?? regionForCountry(u?.app_metadata?.signup_country ?? null));
}

/** Counts several months with ONE round of database reads (the Worker allows only about 50 outbound calls per request). */
export async function computeMonths(yms: string[]): Promise<MonthRecord[]> {
  if (!yms.length) return [];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { isEntitled } = await import("./plans");
  const { getStripeEnvironment } = await import("./stripe");
  const sorted = [...yms].sort();
  const from = new Date(monthRange(sorted[0]).start).toISOString();
  const to = new Date(monthRange(sorted[sorted.length - 1]).end).toISOString();
  const ranged = (table: string) =>
    allRows(() => supabaseAdmin.from(table).select("id,user_id,created_at").gte("created_at", from).lt("created_at", to).order("id"));
  const [authUsers, subs, usage, searches, builders, alerts] = await Promise.all([
    loadAuthUsers(supabaseAdmin),
    allRows(() => supabaseAdmin.from("subscriptions").select("id,user_id,price_id,status,current_period_end,cancel_at_period_end,created_at").eq("environment", getStripeEnvironment()).order("id")),
    ranged("tailor_usage_log"),
    ranged("job_search_runs"),
    ranged("builder_uses"),
    ranged("job_alerts"),
  ]);
  const regionOf = new Map<string, string>();
  for (const u of authUsers) regionOf.set(u.id, userRegion(u));
  const qa = new Set(["mailboss@mail.instinct.com", "mailboss+gotaqa1@mail.instinct.com"]);
  const firstSub = new Map<string, any>();
  for (const s of subs) if (!firstSub.has(s.user_id)) firstSub.set(s.user_id, s);
  const real = authUsers.filter((u) => !qa.has(String(u.email ?? "").trim().toLowerCase()));
  const entitledNow = real.filter((u) => {
    const s = firstSub.get(u.id);
    return s && isEntitled(s);
  }).length;
  const paidUsers = new Set(authUsers.filter((u) => { const s = firstSub.get(u.id); return s && isEntitled(s); }).map((u) => u.id));
  const activeNow = authUsers.filter((u) => {
    const s = firstSub.get(u.id);
    return s && isEntitled(s);
  }).length;

  return yms.map((ym) => {
    const { start, end } = monthRange(ym);
    const inMonth = (row: { created_at?: string | null }) => {
      const t = new Date(row.created_at ?? "").getTime();
      return Number.isFinite(t) && t >= start && t < end;
    };
    const regions: RegionSplit = {};
    for (const r of REGIONS) regions[r] = { users: 0, subscriptions: 0 };
    const joined = authUsers.filter((u) => inMonth({ created_at: u.created_at }));
    for (const u of joined) regions[regionOf.get(u.id) ?? "India"].users += 1;
    const started = subs.filter(inMonth);
    const paidStarted = started.filter((s) => isEntitled(s));
    for (const s of paidStarted) regions[regionOf.get(s.user_id) ?? "India"].subscriptions += 1;
    const split = (rows: any[]): UseSplit => {
      const r = rows.filter(inMonth);
      const paid = r.filter((x) => paidUsers.has(x.user_id)).length;
      return { paid, free: r.length - paid };
    };
    return {
      month: ym,
      lockedAt: null,
      cards: {
        users: joined.length,
        rewrites: usage.filter(inMonth).length,
        searches: searches.filter(inMonth).length,
        builderDownloads: builders.filter(inMonth).length,
        alerts: alerts.filter(inMonth).length,
        subscriptionsStarted: started.length,
        paidSubscriptionsStarted: paidStarted.length,
        // Share is a point-in-time number: it is the share at the moment of counting.
        split: { rewrites: split(usage), searches: split(searches), builderDownloads: split(builders), alerts: split(alerts) },
        subscriberSharePercent: real.length ? (entitledNow / real.length) * 100 : 0,
      },
      regions,
      totalUsersAtEnd: authUsers.filter((u) => new Date(u.created_at ?? "").getTime() < end).length,
      activeSubscribersAtEnd: activeNow,
    };
  });
}

export async function computeMonth(ym: string): Promise<MonthRecord> {
  return (await computeMonths([ym]))[0];
}

const lockKey = (ym: string) => `reports/monthly/${ym}.json`;

export async function readLocked(ym: string): Promise<MonthRecord | null> {
  if (!isValidMonth(ym)) return null;
  const res = await r2Get(lockKey(ym));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`monthly-read-${res.status}`);
  return (await res.json()) as MonthRecord;
}

/** Locks one finished (or ending) month. Refuses to overwrite a locked month. */
export async function lockMonth(ym: string, opts: { dry?: boolean } = {}): Promise<{ ok: boolean; reason?: string; record?: MonthRecord; wrote?: boolean }> {
  if (!isValidMonth(ym)) return { ok: false, reason: "bad-month" };
  const existing = await readLocked(ym);
  if (existing) return { ok: true, reason: "already-locked", record: existing, wrote: false };
  const record = await computeMonth(ym);
  record.lockedAt = new Date().toISOString();
  if (opts.dry) return { ok: true, record, wrote: false };
  await r2Put(lockKey(ym), new TextEncoder().encode(JSON.stringify(record)), "application/json");
  return { ok: true, record, wrote: true };
}

/** Locked months for a year, plus the live current month if it falls in that year. */
export async function monthsForYear(year: number): Promise<MonthRecord[]> {
  const cur = currentMonthIST();
  const yms: string[] = [];
  for (let m = 1; m <= 12; m++) {
    const ym = `${year}-${String(m).padStart(2, "0")}`;
    if (ym > cur) break;
    yms.push(ym);
  }
  const locked = new Map<string, MonthRecord>();
  for (const ym of yms) {
    const l = await readLocked(ym);
    if (l) locked.set(ym, l);
  }
  // A month that was never locked is counted from the database rows that still exist.
  const missing = yms.filter((ym) => !locked.has(ym));
  const counted = new Map((await computeMonths(missing)).map((r) => [r.month, r] as const));
  return yms.map((ym) => locked.get(ym) ?? (counted.get(ym) as MonthRecord));
}

export async function lockedMonthList(): Promise<string[]> {
  const list: string[] = [];
  const now = currentMonthIST();
  const [yNow] = now.split("-").map(Number);
  for (let y = yNow; y <= yNow; y++) {
    for (let m = 1; m <= 12; m++) {
      const ym = `${y}-${String(m).padStart(2, "0")}`;
      if (ym >= now) break;
      if (await readLocked(ym)) list.push(ym);
    }
  }
  return list;
}
