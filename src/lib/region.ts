/** Region groups for the admin view. Based on the connection country (edge header), so a VPN can show a different region. */
export type Region = "India" | "Asia" | "Australia" | "North America" | "South America" | "Rest of world";
export const REGIONS: Region[] = ["India", "Asia", "Australia", "North America", "South America", "Rest of world"];

const ASIA = "AF AM AZ BH BD BT BN KH CN CY GE HK ID IR IQ IL JP JO KZ KW KG LA LB MO MY MV MN MM NP KP OM PK PS PH QA SA SG KR LK SY TW TJ TH TL TR TM AE UZ VN YE".split(" ");
const AUSTRALIA = "AU NZ FJ PG WS TO VU SB NC PF".split(" ");
const NORTH_AMERICA = "US CA MX GT BZ SV HN NI CR PA CU JM HT DO BS BB TT PR GL BM".split(" ");
const SOUTH_AMERICA = "AR BO BR CL CO EC GY PY PE SR UY VE".split(" ");

export function regionForCountry(country: string | null | undefined): Region {
  const c = (country ?? "").trim().toUpperCase();
  if (c === "IN") return "India";
  if (ASIA.includes(c)) return "Asia";
  if (AUSTRALIA.includes(c)) return "Australia";
  if (NORTH_AMERICA.includes(c)) return "North America";
  if (SOUTH_AMERICA.includes(c)) return "South America";
  // Unknown country on an old account counts as India (owner rule); a known foreign country not listed is Rest of world.
  return c ? "Rest of world" : "India";
}
