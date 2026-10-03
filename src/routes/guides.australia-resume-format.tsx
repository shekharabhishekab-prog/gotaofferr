import { createFileRoute } from "@tanstack/react-router";

import { CountryGuidePage, countryGuideHead } from "@/components/CountryGuidePage";
import { getCountryGuide } from "@/lib/country-guides";

const SLUG = "australia-resume-format";
const guide = getCountryGuide(SLUG)!;

export const Route = createFileRoute("/guides/australia-resume-format")({
  head: () => countryGuideHead(SLUG, guide),
  component: () => <CountryGuidePage guide={guide} />,
});
