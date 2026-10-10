/**
 * Job-country detection. Pure and client-safe (no server imports) so both the
 * tailor server code and the browser-only ATS checker use one source of truth.
 */

/** Country hints we look for in a job description (city / country / demonym). */
const JOB_COUNTRY_HINTS: Array<{ code: string; patterns: RegExp[] }> = [
  { code: "AU", patterns: [/\baustralia(n)?\b/i, /\bsydney\b/i, /\bmelbourne\b/i, /\bbrisbane\b/i, /\bperth\b/i, /\badelaide\b/i, /\bcanberra\b/i, /\bnsw\b/i, /\bvictoria,\s*au/i, /\bAUD\b/, /\bsuperannuation\b/i] },
  { code: "NZ", patterns: [/\bnew zealand\b/i, /\bauckland\b/i, /\bwellington\b/i, /\bchristchurch\b/i, /\bNZD\b/] },
  { code: "US", patterns: [/\bunited states\b/i, /\bU\.?S\.?A\.?\b/, /\bnew york\b/i, /\bsan francisco\b/i, /\bchicago\b/i, /\baustin\b/i, /\b(dallas|houston|atlanta|denver|miami|los angeles|san diego|san jose|phoenix|philadelphia|washington,?\s*d\.?c)\b/i, /,\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|IL|IN|MA|MD|MI|MN|MO|NC|NJ|NY|OH|OR|PA|TX|VA|WA|WI)\s+\d{5}\b/, /,\s*(TX|NY|WA|MA|IL|GA|FL|NC|NJ|VA|CO|AZ|OH|PA)\b(?!\w)/, /\bseattle\b/i, /\bboston\b/i, /\b401\(k\)\b/i, /\bUSD\b/] },
  { code: "CA", patterns: [/\bcanada\b/i, /\btoronto\b/i, /\bvancouver\b/i, /\bmontreal\b/i, /\bottawa\b/i, /\bCAD\b/] },
  { code: "GB", patterns: [/\bunited kingdom\b/i, /\bengland\b/i, /\bscotland\b/i, /\blondon\b/i, /\bmanchester\b/i, /\bbirmingham\b/i, /\bGBP\b/, /£/] },
  { code: "IE", patterns: [/\bireland\b/i, /\bdublin\b/i, /\bcork,\s*ie/i] },
  { code: "DE", patterns: [/\bgermany\b/i, /\bberlin\b/i, /\bmunich\b/i, /\bmünchen\b/i, /\bhamburg\b/i, /\bfrankfurt\b/i] },
  { code: "FR", patterns: [/\bfrance\b/i, /\bparis\b/i, /\blyon\b/i, /\bmarseille\b/i] },
  { code: "NL", patterns: [/\bnetherlands\b/i, /\bamsterdam\b/i, /\brotterdam\b/i, /\butrecht\b/i] },
  { code: "SG", patterns: [/\bsingapore\b/i, /\bSGD\b/] },
  { code: "AE", patterns: [/\bunited arab emirates\b/i, /\bdubai\b/i, /\babu dhabi\b/i, /\bsharjah\b/i, /\bAED\b/] },
  { code: "ZA", patterns: [/\bsouth africa\b/i, /\bjohannesburg\b/i, /\bcape town\b/i, /\bZAR\b/] },
  { code: "IN", patterns: [/\bindia\b/i, /\bbengaluru\b/i, /\bbangalore\b/i, /\bmumbai\b/i, /\bdelhi\b/i, /\bgurgaon\b/i, /\bgurugram\b/i, /\bnoida\b/i, /\bhyderabad\b/i, /\bpune\b/i, /\bchennai\b/i, /\bINR\b/, /\blakh\b/i, /\bcrore\b/i, /₹/] },
];

/**
 * Best-effort country of the JOB (not the candidate), read from the job
 * description and company name. Cross-border applications must follow the
 * hiring country's resume conventions, not the applicant's.
 */
export function detectJobCountry(jobDescription: string, company?: string | null): string | null {
  const text = `${company ?? ""}\n${jobDescription ?? ""}`;
  if (!text.trim()) return null;
  let best: { code: string; score: number } | null = null;
  for (const { code, patterns } of JOB_COUNTRY_HINTS) {
    let score = 0;
    for (const re of patterns) {
      const matches = text.match(new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`));
      if (matches) score += matches.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { code, score };
  }
  return best?.code ?? null;
}
