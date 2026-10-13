import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ProfileView } from "@/components/ProfileView";
import { DEMO_PROFILES, profileJsonLd, type PublicProfile } from "@/lib/profile-types";

// Phase 1 (preview): server-rendered public profile page. Demo profiles only until the database table is approved.
export const Route = createFileRoute("/p/$slug")({
  loader: ({ params }: { params: { slug: string } }) => {
    const profile = DEMO_PROFILES[params.slug];
    if (!profile) throw notFound();
    return { profile };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Profile not found | GotaOfferr" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.profile;
    const url = `https://gotaofferr.com/p/${p.slug}`;
    const title = `${p.name} - ${p.headline} | GotaOfferr`;
    return {
      meta: [
        { title },
        { name: "description", content: p.about.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        ...(p.indexable ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(profileJsonLd(p, url)),
        },
      ],
    };
  },
  component: ProfilePage,
  notFoundComponent: ProfileNotFound,
});

function ProfileNotFound() {
  return (
    <main className="site-container py-24">
      <h1 className="font-display text-3xl font-bold text-foreground">Profile not found</h1>
      <p className="mt-3 text-muted-foreground">This profile does not exist or is private.</p>
      <Button asChild className="mt-6">
        <Link to="/">Back to GotaOfferr</Link>
      </Button>
    </main>
  );
}

function ProfilePage() {
  const { profile } = Route.useLoaderData() as { profile: PublicProfile };
  return <ProfileView profile={profile} banner={profile.demo ? "Preview demo. Made-up content, not shown on Google." : undefined} />;
}
