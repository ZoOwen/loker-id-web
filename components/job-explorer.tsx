"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { JobCard } from "@/components/job-card";
import { JobFiltersForm } from "@/components/job-filters";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getJobsClient } from "@/lib/api";
import { useJobFilters } from "@/lib/use-job-filters";
import type { Job, StackStat } from "@/lib/types";

export function JobExplorer({
  initialJobs,
  initialNextCursor,
  availableStack,
}: {
  initialJobs: Job[];
  initialNextCursor: string | null;
  availableStack: StackStat[];
}) {
  const [filters] = useJobFilters();
  const filtersKey = JSON.stringify(filters);

  const [jobs, setJobs] = useState(initialJobs);
  const [cursor, setCursor] = useState(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFirstRun = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const requestId = ++requestIdRef.current;
    setRefetching(true);
    setError(null);

    getJobsClient(filters)
      .then((res) => {
        if (requestIdRef.current !== requestId) return;
        setJobs(res.jobs);
        setCursor(res.next_cursor);
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setError("Gagal memuat loker. Coba lagi.");
      })
      .finally(() => {
        if (requestIdRef.current !== requestId) return;
        setRefetching(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const loadMore = useCallback(() => {
    if (loadingMore || refetching || !cursor) return;
    setLoadingMore(true);
    setError(null);

    getJobsClient(filters, { cursor })
      .then((res) => {
        setJobs((prev) => [...prev, ...res.jobs]);
        setCursor(res.next_cursor);
      })
      .catch(() => setError("Gagal memuat loker berikutnya."))
      .finally(() => setLoadingMore(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, filtersKey, loadingMore, refetching]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <JobFiltersForm availableStack={availableStack} />
      </aside>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between lg:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="sm" />}>
              <SlidersHorizontal className="size-3.5" />
              Filter
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto p-5">
              <SheetHeader className="sr-only p-0">
                <SheetTitle>Filter loker</SheetTitle>
              </SheetHeader>
              <div className="mt-2">
                <JobFiltersForm availableStack={availableStack} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-sm text-muted-foreground">
            {jobs.length} loker
          </span>
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {refetching ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Tidak ada loker yang cocok dengan filter ini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        <div ref={sentinelRef} />

        {loadingMore && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!refetching && !loadingMore && !cursor && jobs.length > 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Sudah menampilkan semua loker.
          </p>
        )}
      </div>
    </div>
  );
}
