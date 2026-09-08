import { createLoader } from "nuqs/server";

import { JobExplorer } from "@/components/job-explorer";
import { getJobs, getStats } from "@/lib/api";
import { jobFiltersParsers } from "@/lib/job-filters-parsers";

const loadJobFilters = createLoader(jobFiltersParsers);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = await loadJobFilters(searchParams);

  const [{ jobs, next_cursor }, stats] = await Promise.all([
    getJobs(filters),
    getStats(),
  ]);

  const topStack = [...stats.by_stack]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

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

        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xl font-semibold">{stats.total_active}</p>
            <p className="text-xs text-muted-foreground">Loker aktif</p>
          </div>
          <div>
            <p className="text-xl font-semibold">{stats.by_source.length}</p>
            <p className="text-xs text-muted-foreground">Sumber</p>
          </div>
          {topStack.length > 0 && (
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Teknologi terpopuler
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {topStack.map((s) => (
                  <span
                    key={s.stack}
                    className="rounded-full border border-border px-2 py-0.5 text-xs"
                  >
                    {s.stack} · {s.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <JobExplorer
        initialJobs={jobs}
        initialNextCursor={next_cursor}
        availableStack={stats.by_stack}
      />
    </div>
  );
}
