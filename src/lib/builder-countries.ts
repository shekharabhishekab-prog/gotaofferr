const CODES = "AF AX AL DZ AS AD AO AI AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BA BW BR VG BN BG BF BI KH CM CA CV KY CF TD CL CN CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI XK KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU KP MK MP NO OM PK PW PS PA PG PY PE PH PL PT PR QA RE RO RU RW WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UY UZ VU VA VE VN VI WF YE ZM ZW".split(" ");
const FIRST = ["IN", "US", "GB", "CA", "AU", "AE", "SG", "DE"];
const names = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const nameOf = (c: string) => (c === "XK" ? "Kosovo" : (names?.of(c) ?? c));

/** Every country. Server rules map any code to its country format, else its region, else general. */
export const BUILDER_COUNTRIES: Array<[string, string]> = [
  ...FIRST.map((c) => [c, nameOf(c)] as [string, string]),
  ...CODES.filter((c) => !FIRST.includes(c)).map((c) => [c, nameOf(c)] as [string, string]).sort((a, b) => a[1].localeCompare(b[1])),
];
export const countryName = (code?: string | null) => {
  const c = (code ?? "").toUpperCase();
  return c ? (BUILDER_COUNTRIES.find(([k]) => k === c)?.[1] ?? "") : "";
};
