import type { StackStat } from "@/lib/types";

export function slugifyStack(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findStackBySlug(
  stacks: StackStat[],
  slug: string
): StackStat | null {
  return stacks.find((s) => slugifyStack(s.stack) === slug) ?? null;
}
