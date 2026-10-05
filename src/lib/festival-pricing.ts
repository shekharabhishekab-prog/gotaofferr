/**
 * Festival sale window.
 *
 * A festival offer runs for 10 days around each festival: it opens 7 days
 * before the festival, covers the festival day itself, and closes at the end
 * of the third day after it. The calendar below is the only thing to edit
 * when new festival dates are confirmed — every price, badge and checkout
 * lookup key derives from it.
 */

export type FestivalRegion = "IN" | "GLOBAL";

export interface Festival {
  name: string;
  /**
   * Who sees this offer. "IN" = visitors in India only. Add more regions
   * (Europe, Americas, ...) here as their festival lists and prices are ready.
   * Nothing is shown to a visitor outside the festival's region.
   */
  regions: FestivalRegion[];
  /** Optional custom offer title, e.g. "Diwali Offer". Defaults to "<name> Offer". */
  title?: string;
  /** Festival day, ISO `YYYY-MM-DD` (interpreted in IST). */
  date: string;
}

export const FESTIVAL_LEAD_DAYS = 7;
export const FESTIVAL_TAIL_DAYS = 3;

/** India-facing festival calendar. Keep it sorted; past entries are harmless.
 * Dates checked against truecalendar.com / drikpanchang.com (Oct 2026). Eid dates depend on moon sighting (2027 is tentative). */
export const FESTIVALS: Festival[] = [
  { regions: ["IN"], name: "Holi", date: "2026-03-04" },
  { regions: ["IN"], name: "Eid", date: "2026-03-20" },
  { regions: ["IN"], name: "Raksha Bandhan", date: "2026-08-28" },
  { regions: ["IN"], name: "Janmashtami", date: "2026-09-04" },
  { regions: ["IN"], name: "Ganesh Chaturthi", date: "2026-09-14" },
  { regions: ["IN"], name: "Navratri", date: "2026-10-11" },
  { regions: ["IN"], name: "Dussehra", date: "2026-10-20" },
  { regions: ["IN"], name: "Diwali", date: "2026-11-08" },
  { regions: ["IN"], name: "Chhath Puja", date: "2026-11-15" },
  { regions: ["IN"], name: "Guru Nanak Jayanti", date: "2026-11-24" },
  { regions: ["IN"], name: "Christmas", date: "2026-12-25" },
  { regions: ["IN"], name: "New Year", date: "2027-01-01" },
  { regions: ["IN"], name: "Pongal", date: "2027-01-15" },
  { regions: ["IN"], name: "Maha Shivaratri", date: "2027-03-06" },
  { regions: ["IN"], name: "Eid", date: "2027-03-10" },
  { regions: ["IN"], name: "Holi", date: "2027-03-22" },
  { regions: ["IN"], name: "Ugadi", date: "2027-04-07" },
  { regions: ["IN"], name: "Baisakhi", date: "2027-04-14" },
  { regions: ["IN"], name: "Raksha Bandhan", date: "2027-08-17" },
  { regions: ["IN"], name: "Janmashtami", date: "2027-08-25" },
  { regions: ["IN"], name: "Ganesh Chaturthi", date: "2027-09-04" },
  { regions: ["IN"], name: "Navratri", date: "2027-09-30" },
  { regions: ["IN"], name: "Dussehra", date: "2027-10-09" },
  { regions: ["IN"], name: "Diwali", date: "2027-10-29" },
];

/** IST offset in ms — the sale window is anchored to Indian local days. */
const IST_OFFSET = 5.5 * 60 * 60 * 1000;
const DAY = 86_400_000;

function festivalDayStart(date: string): number {
  // Midnight IST on the festival day, expressed as a UTC timestamp.
  return Date.parse(`${date}T00:00:00.000Z`) - IST_OFFSET;
}

export interface ActiveFestival {
  name: string;
  /** Offer title shown to visitors, e.g. "Diwali Offer". */
  title: string;
  /** Festival day, ISO date string. */
  date: string;
  /** Timestamp when the offer stops applying. */
  endsAt: number;
}

/** The festival offer running right now, if any. */
export function activeFestival(
  now: number = Date.now(),
  region: FestivalRegion | null = "IN",
): ActiveFestival | null {
  if (!region) return null;
  for (const festival of FESTIVALS) {
    if (!festival.regions.includes(region)) continue;
    const start = festivalDayStart(festival.date);
    if (!Number.isFinite(start)) continue;
    const opensAt = start - FESTIVAL_LEAD_DAYS * DAY;
    const endsAt = start + (FESTIVAL_TAIL_DAYS + 1) * DAY;
    if (now >= opensAt && now < endsAt) {
      return { name: festival.name, title: festival.title ?? `${festival.name} Offer`, date: festival.date, endsAt };
    }
  }
  return null;
}

export function isFestivalActive(now: number = Date.now(), region: FestivalRegion | null = "IN"): boolean {
  return activeFestival(now, region) !== null;
}

