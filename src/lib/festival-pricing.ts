/**
 * Festival sale window.
 *
 * A festival offer runs for 10 days around each festival: it opens 7 days
 * before the festival, covers the festival day itself, and closes at the end
 * of the third day after it. The calendar below is the only thing to edit
 * when new festival dates are confirmed — every price, badge and checkout
 * lookup key derives from it.
 */

export interface Festival {
  name: string;
  /** Festival day, ISO `YYYY-MM-DD` (interpreted in IST). */
  date: string;
}

export const FESTIVAL_LEAD_DAYS = 7;
export const FESTIVAL_TAIL_DAYS = 3;

/** India-facing festival calendar. Keep it sorted; past entries are harmless. */
export const FESTIVALS: Festival[] = [
  { name: "Holi", date: "2026-03-04" },
  { name: "Eid", date: "2026-03-20" },
  { name: "Raksha Bandhan", date: "2026-08-28" },
  { name: "Ganesh Chaturthi", date: "2026-09-14" },
  { name: "Navratri", date: "2026-10-11" },
  { name: "Dussehra", date: "2026-10-20" },
  { name: "Diwali", date: "2026-11-08" },
  { name: "New Year", date: "2027-01-01" },
  { name: "Holi", date: "2027-03-22" },
  { name: "Diwali", date: "2027-10-29" },
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
  /** Festival day, ISO date string. */
  date: string;
  /** Timestamp when the offer stops applying. */
  endsAt: number;
}

/** The festival offer running right now, if any. */
export function activeFestival(now: number = Date.now()): ActiveFestival | null {
  for (const festival of FESTIVALS) {
    const start = festivalDayStart(festival.date);
    if (!Number.isFinite(start)) continue;
    const opensAt = start - FESTIVAL_LEAD_DAYS * DAY;
    const endsAt = start + (FESTIVAL_TAIL_DAYS + 1) * DAY;
    if (now >= opensAt && now < endsAt) {
      return { name: festival.name, date: festival.date, endsAt };
    }
  }
  return null;
}

export function isFestivalActive(now: number = Date.now()): boolean {
  return activeFestival(now) !== null;
}
