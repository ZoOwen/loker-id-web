import Link from "next/link";
import { createLoader } from "nuqs/server";

import { JobExplorer } from "@/components/job-explorer";
import { getJobs, getStats } from "@/lib/api";
import { jobFiltersParsers } from "@/lib/job-filters-parsers";
import { stackNameToSlug } from "@/lib/stack-slugs";

// searchParams already forces this route to render per-request (see below),
// but pin it explicitly so a future refactor can't accidentally make the
// listing static and serve a stale snapshot.
export const dynamic = "force-dynamic";

const loadJobFilters = createLoader(jobFiltersParsers);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = await loadJobFilters(searchParams);

  const [{ jobs, next_cursor }, statsResult] = await Promise.all([
    getJobs(filters),
    getStats(),
  ]);

  const stats = statsResult.status === "ok" ? statsResult.data : null;
  const topStack = stats
    ? [...stats.by_stack].sort((a, b) => b.count - a.count).slice(0, 6)
    : [];
  const stackStatus: "ok" | "empty" | "error" =
    statsResult.status === "error"
      ? "error"
      : stats && stats.by_stack.length > 0
        ? "ok"
        : "empty";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <section className="flex flex-col gap-4 border-b border-border pb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Loker developer Indonesia, dikumpulkan jadi satu
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Cari lowongan kerja developer dari berbagai sumber sekaligus.
            Filter berdasarkan stack, gaji, mode kerja, level, dan kota.
          </p>
        </div>

        {stats ? (
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xl font-semibold">{stats.total_active}</p>
              <p className="text-xs text-muted-foreground">Loker aktif</p>
            </div>
            <div>
              <p className="text-xl font-semibold">
                {stats.by_source.length}
              </p>
              <p className="text-xs text-muted-foreground">Sumber</p>
            </div>
            {topStack.length > 0 && (
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Teknologi terpopuler
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {topStack.map((s) => (
                    <Link
                      key={s.stack}
                      href={`/stack/${stackNameToSlug(s.stack)}`}
                      className="rounded-full border border-border px-2 py-0.5 text-xs hover:border-foreground/30 hover:bg-muted/40"
                    >
                      {s.stack} · {s.count}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-destructive">
            Statistik sedang tidak bisa dimuat. Daftar loker di bawah tetap
            berjalan normal.
          </p>
        )}
      </section>

      <JobExplorer
        initialJobs={jobs}
        initialNextCursor={next_cursor}
        availableStack={stats?.by_stack ?? []}
        stackStatus={stackStatus}
      />
    </div>
  );
}
