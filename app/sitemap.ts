import type { MetadataRoute } from "next";

import { getAllJobs, getStats } from "@/lib/api";
import { SITE_URL } from "@/lib/site";
import { slugifyStack } from "@/lib/stack-slug";

// Job data changes as the scrape cron re-runs, so this must never be a
// stale static snapshot — force it dynamic on top of the no-store fetches.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, statsResult] = await Promise.all([getAllJobs(), getStats()]);

  const stackEntries: MetadataRoute.Sitemap =
    statsResult.status === "ok"
      ? statsResult.data.by_stack.map((s) => ({
          url: `${SITE_URL}/stack/${slugifyStack(s.stack)}`,
          changeFrequency: "hourly",
          priority: 0.7,
        }))
      : [];

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${SITE_URL}/jobs/${job.id}`,
    lastModified: job.last_seen_at ?? job.posted_at,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  return [
    {
      url: SITE_URL,
      changeFrequency: "hourly",
      priority: 1,
    },
    ...stackEntries,
    ...jobEntries,
  ];
}
