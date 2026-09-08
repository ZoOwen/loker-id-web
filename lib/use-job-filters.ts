"use client";

import { useQueryStates } from "nuqs";

import { jobFiltersParsers } from "@/lib/job-filters-parsers";

export function useJobFilters() {
  return useQueryStates(jobFiltersParsers, {
    shallow: true,
    clearOnDefault: true,
  });
}

export type JobFiltersState = ReturnType<typeof useJobFilters>[0];
