import { createFileRoute } from "@tanstack/react-router";

import { CountryGuidePage, countryGuideHead } from "@/components/CountryGuidePage";
import { getCountryGuide } from "@/lib/country-guides";

const SLUG = "singapore-resume-format";
const guide = getCountryGuide(SLUG)!;

export const Route = createFileRoute("/guides/singapore-resume-format")({
  head: () => countryGuideHead(SLUG, guide),
  component: () => <CountryGuidePage guide={guide} />,
});
