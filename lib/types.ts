export type JobMode = "remote" | "hybrid" | "onsite";

export type JobLevel = "intern" | "junior" | "mid" | "senior" | "lead";

export type SalaryConfidence = string;

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_confidence: SalaryConfidence | null;
  stack: string[];
  location: string | null;
  location_city: string | null;
  mode: JobMode | null;
  level: JobLevel | null;
  source_url: string;
  posted_at: string;
  last_seen_at?: string;
}

export interface JobDetail extends Job {
  duplicates: Job[];
}

export interface JobsResponse {
  jobs: Job[];
  next_cursor: string | null;
}

export interface StackStat {
  stack: string;
  count: number;
}

export interface SourceStat {
  source: string;
  count: number;
}

export interface StatsResponse {
  total_active: number;
  by_source: SourceStat[];
  by_stack: StackStat[];
}

export type StatsResult =
  | { status: "ok"; data: StatsResponse }
  | { status: "error" };

export interface JobFilters {
  stack: string[];
  salary_min: number | null;
  mode: string | null;
  level: string | null;
  city: string | null;
  q: string | null;
}
