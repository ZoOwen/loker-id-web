import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";

import { StackJobList } from "@/components/stack-job-list";
import { getJobs, getStats } from "@/lib/api";
import { SITE_URL } from "@/lib/site";
import {
  findStackBySlug,
  stackDisplayName,
  stackNameToSlug,
} from "@/lib/stack-slugs";

// Stack pages are pre-rendered at build time for every known stack
// (generateStaticParams below) and then revalidated hourly. Full static
// generation for crawl speed, but never frozen forever — the job count and
// listing here would otherwise go stale exactly like the stats-cache bug
// we shipped once already.
export const revalidate = 3600;

export async function generateStaticParams() {
  const statsResult = await getStats({ revalidate });
  if (statsResult.status !== "ok") return [];
  return statsResult.data.by_stack.map((s) => ({
    slug: stackNameToSlug(s.stack),
  }));
}

async function resolveStack(slug: string) {
  const statsResult = await getStats({ revalidate });
  if (statsResult.status !== "ok") return null;
  return findStackBySlug(statsResult.data.by_stack, slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const stack = await resolveStack(slug);

  if (!stack) return { title: "Teknologi tidak ditemukan" };

  const displayName = stackDisplayName(stack.stack);
  const title = `Lowongan ${displayName} Indonesia — ${stack.count} loker aktif`;
  const description = `Kumpulan lowongan kerja ${displayName} di Indonesia dari berbagai sumber. ${stack.count} loker aktif saat ini, diperbarui otomatis.`;
  const url = `${SITE_URL}/stack/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Loker.id",
      type: "website",
    },
  };
}

export default async function StackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stack = await resolveStack(slug);

  if (!stack) notFound();

  const displayName = stackDisplayName(stack.stack);
  const { jobs, next_cursor } = await getJobs(
    { stack: [stack.stack] },
    { revalidate }
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Lowongan {displayName} Indonesia
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {stack.count} loker aktif yang membutuhkan {displayName}.
        </p>
      </div>

      <Link
        href={`/?stack=${encodeURIComponent(stack.stack)}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <SlidersHorizontal className="size-3.5" />
        Cari dengan filter lain (gaji, kota, mode kerja, dll.)
      </Link>

      <StackJobList
        stack={stack.stack}
        initialJobs={jobs}
        initialNextCursor={next_cursor}
      />
    </div>
  );
}
