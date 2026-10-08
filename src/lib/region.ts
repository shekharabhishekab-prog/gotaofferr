/** Region groups for the admin view. Based on the connection country (edge header), so a VPN can show a different region. */
export type Region = "India" | "Asia" | "Australia" | "North America" | "South America" | "Europe" | "Africa";
export const REGIONS: Region[] = ["Australia", "Asia", "South America", "North America", "Europe", "Africa", "India"];

const split = (s: string) => s.split(" ");
// Asia without India (India is its own region).
const ASIA = split("AF AM AZ BH BD BT BN KH CN CY GE HK ID IR IQ IL JP JO KZ KW KG LA LB MO MY MV MN MM NP KP OM PK PS PH QA SA SG KR LK SY TW TJ TH TL TR TM AE UZ VN YE");
const AUSTRALIA = split("AU NZ FJ PG WS TO VU SB NC PF KI FM MH NR PW TV CK NU TK WF AS GU MP");
const NORTH_AMERICA = split("US CA MX GT BZ SV HN NI CR PA CU JM HT DO BS BB TT PR GL BM AG DM GD KN LC VC AW CW SX BQ KY TC VG VI AI MS MQ GP BL MF PM");
const SOUTH_AMERICA = split("AR BO BR CL CO EC GY PY PE SR UY VE FK GF");
const EUROPE = split("AL AD AT BY BE BA BG HR CZ DK EE FO FI FR DE GI GR GG HU IS IE IM IT JE XK LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SJ SE CH UA GB VA AX");
const AFRICA = split("DZ AO BJ BW BF BI CV CM CF TD KM CG CD CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU YT MA MZ NA NE NG RE RW SH ST SN SC SL SO ZA SS SD TZ TG TN UG EH ZM ZW");

export function regionForCountry(country: string | null | undefined): Region {
  const c = (country ?? "").trim().toUpperCase();
  if (!c || c === "IN") return "India"; // no country on an old account counts as India (owner rule)
  if (ASIA.includes(c)) return "Asia";
  if (AUSTRALIA.includes(c)) return "Australia";
  if (NORTH_AMERICA.includes(c)) return "North America";
  if (SOUTH_AMERICA.includes(c)) return "South America";
  if (EUROPE.includes(c)) return "Europe";
  if (AFRICA.includes(c)) return "Africa";
  return "Australia"; // rare leftover territories (Oceania/remote islands)
}
