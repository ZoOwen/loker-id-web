import type {
  Job,
  JobDetail,
  JobFilters,
  JobsResponse,
  SourceStat,
  StackStat,
  StatsResponse,
} from "@/lib/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const JOBS_PAGE_SIZE = 20;

export function buildJobsSearchParams(
  filters: Partial<JobFilters>,
  opts?: { cursor?: string | null; limit?: number }
): URLSearchParams {
  const params = new URLSearchParams();

  // Backend contract for multi-value stack filtering isn't specified by the
  // API docs, so we send it as repeated `stack` params (REST convention).
  for (const stack of filters.stack ?? []) {
    params.append("stack", stack);
  }
  if (filters.salary_min) params.set("salary_min", String(filters.salary_min));
  if (filters.mode) params.set("mode", filters.mode);
  if (filters.level) params.set("level", filters.level);
  if (filters.city) params.set("city", filters.city);
  if (filters.q) params.set("q", filters.q);

  params.set("limit", String(opts?.limit ?? JOBS_PAGE_SIZE));
  if (opts?.cursor) params.set("cursor", opts.cursor);

  return params;
}

export async function getJobs(
  filters: Partial<JobFilters>,
  opts?: { cursor?: string | null; limit?: number; signal?: AbortSignal }
): Promise<JobsResponse> {
  const params = buildJobsSearchParams(filters, opts);
  const res = await fetch(`${API_BASE_URL}/api/jobs?${params.toString()}`, {
    cache: "no-store",
    signal: opts?.signal,
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat daftar loker (${res.status})`);
  }

  const data = await res.json();
  return {
    jobs: Array.isArray(data.jobs) ? (data.jobs as Job[]) : [],
    next_cursor: data.next_cursor ?? null,
  };
}

// For use in Client Components: the backend doesn't send CORS headers, so
// browser fetches go through our own /api/jobs route (same-origin), which
// proxies server-side to the backend instead.
export async function getJobsClient(
  filters: Partial<JobFilters>,
  opts?: { cursor?: string | null; limit?: number }
): Promise<JobsResponse> {
  const params = buildJobsSearchParams(filters, opts);
  const res = await fetch(`/api/jobs?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat daftar loker (${res.status})`);
  }

  const data = await res.json();
  return {
    jobs: Array.isArray(data.jobs) ? (data.jobs as Job[]) : [],
    next_cursor: data.next_cursor ?? null,
  };
}

export async function getJob(id: string): Promise<JobDetail | null> {
  const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Gagal memuat detail loker (${res.status})`);
  }

  const data = await res.json();
  return {
    ...(data.job as Job),
    duplicates: Array.isArray(data.duplicates) ? (data.duplicates as Job[]) : [],
  };
}

export async function getStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/stats`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat statistik (${res.status})`);
  }

  const data = await res.json();

  const bySource: SourceStat[] = Array.isArray(data.by_source)
    ? data.by_source.map((item: Record<string, unknown>) => ({
        source: String(item.name ?? item.source ?? item.slug ?? ""),
        count: Number(item.active_jobs ?? item.count ?? item.total ?? 0),
      }))
    : [];

  const byStack: StackStat[] = Array.isArray(data.by_stack)
    ? data.by_stack.map((item: Record<string, unknown>) => ({
        stack: String(item.stack ?? item.name ?? ""),
        count: Number(item.job_count ?? item.count ?? item.total ?? 0),
      }))
    : [];

  return {
    total_active: Number(data.total_active ?? 0),
    by_source: bySource,
    by_stack: byStack,
  };
}
