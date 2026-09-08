import Link from "next/link";
import { ArrowUpRight, Banknote, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  formatLevel,
  formatMode,
  formatRelativeTime,
  formatSalary,
} from "@/lib/format";
import type { Job } from "@/lib/types";

const MAX_VISIBLE_STACK = 5;

export function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job.salary_min, job.salary_max);
  const mode = formatMode(job.mode);
  const level = formatLevel(job.level);
  const location = job.location_city ?? job.location;
  const visibleStack = job.stack.slice(0, MAX_VISIBLE_STACK);
  const hiddenStackCount = job.stack.length - visibleStack.length;

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex flex-col gap-2.5 rounded-lg border border-border p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-foreground">
            {job.title}
          </h3>
          <p className="truncate text-sm text-muted-foreground">
            {job.company}
          </p>
        </div>
        <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
          {formatRelativeTime(job.posted_at)}
        </span>
      </div>

      {visibleStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleStack.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
          {hiddenStackCount > 0 && (
            <Badge variant="outline">+{hiddenStackCount}</Badge>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {salary && (
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <Banknote className="size-3.5" />
            {salary}
          </span>
        )}
        {location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {location}
          </span>
        )}
        {mode && <span>{mode}</span>}
        {level && <span>{level}</span>}
        <span className="ml-auto inline-flex items-center gap-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          Detail
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
