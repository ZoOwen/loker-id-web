"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { JobCard } from "@/components/job-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getJobsClient } from "@/lib/api";
import type { Job } from "@/lib/types";

export function StackJobList({
  stack,
  initialJobs,
  initialNextCursor,
}: {
  stack: string;
  initialJobs: Job[];
  initialNextCursor: string | null;
}) {
  const [jobs, setJobs] = useState(initialJobs);
  const [cursor, setCursor] = useState(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(() => {
    if (loadingMore || !cursor) return;
    setLoadingMore(true);
    setError(null);

    getJobsClient({ stack: [stack] }, { cursor })
      .then((res) => {
        setJobs((prev) => [...prev, ...res.jobs]);
        setCursor(res.next_cursor);
      })
      .catch(() => setError("Gagal memuat loker berikutnya."))
      .finally(() => setLoadingMore(false));
  }, [cursor, loadingMore, stack]);

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

  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada loker aktif untuk teknologi ini.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}

      <div ref={sentinelRef} />

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {loadingMore && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!loadingMore && !cursor && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Sudah menampilkan semua loker.
        </p>
      )}
    </div>
  );
}
