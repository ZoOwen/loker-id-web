import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Banknote, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getJob } from "@/lib/api";
import {
  formatLevel,
  formatMode,
  formatRelativeTime,
  formatSalary,
  formatSourceName,
} from "@/lib/format";

// Job data changes as the scrape cron re-runs; never serve a static snapshot.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) return { title: "Loker tidak ditemukan" };

  return {
    title: `${job.title} di ${job.company}`,
    description: job.description.slice(0, 160),
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) notFound();

  const salary = formatSalary(job.salary_min, job.salary_max);
  const mode = formatMode(job.mode);
  const level = formatLevel(job.level);
  const location = job.location_city ?? job.location;
  const sourceName = formatSourceName(job.source_url);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke daftar loker
      </Link>

      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {job.title}
          </h1>
          <p className="text-sm text-muted-foreground">{job.company}</p>
        </div>

        {job.stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.stack.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {salary && (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Banknote className="size-4" />
              {salary}
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" />
              {location}
            </span>
          )}
          {mode && <span>{mode}</span>}
          {level && <span>{level}</span>}
          <span>{formatRelativeTime(job.posted_at)}</span>
        </div>

        <Button
          className="w-fit"
          nativeButton={false}
          render={
            <a href={job.source_url} target="_blank" rel="noopener noreferrer" />
          }
        >
          Lamar di {sourceName}
          <ArrowUpRight className="size-3.5" />
        </Button>
      </div>

      <Separator />

      <article className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {job.description}
      </article>

      {job.duplicates.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">
              Loker ini juga tayang di
            </h2>
            <ul className="flex flex-col gap-1.5">
              {job.duplicates.map((dup) => (
                <li key={dup.id}>
                  <a
                    href={dup.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {formatSourceName(dup.source_url)} · {dup.company}
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
