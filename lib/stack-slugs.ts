import type { StackStat } from "@/lib/types";

// Explicit slug overrides. Two different problems live here:
// - ".NET" / "C#" / "Node.js" generically slugify into near-unusable
//   fragments (net / c / node-js) — these overrides just fix the URL.
// - "Go" -> "golang" is different: nobody searches "lowongan go", they
//   search "lowongan golang". This one also changes what we *display*
//   (see STACK_DISPLAY_NAME below), not just the URL.
const STACK_NAME_TO_SLUG: Record<string, string> = {
  Go: "golang",
  ".NET": "dotnet",
  "C#": "csharp",
  "Node.js": "nodejs",
  "React Native": "react-native",
};

const SLUG_TO_STACK_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STACK_NAME_TO_SLUG).map(([name, slug]) => [slug, name])
);

// The term people actually search for, where it differs from the raw
// stack name the backend returns. Used for titles/headings only — API
// filters and hrefs must keep using the raw name.
const STACK_DISPLAY_NAME: Record<string, string> = {
  Go: "Golang",
};

function genericSlugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** name -> slug, for building links and the sitemap. */
export function stackNameToSlug(name: string): string {
  return STACK_NAME_TO_SLUG[name] ?? genericSlugify(name);
}

/**
 * slug -> name, for querying the backend directly. Only resolves the
 * explicit overrides above — a generic slug (lowercase, dashes) can't be
 * reliably reversed on its own (e.g. "PostgreSQL", "iOS", "GCP" lose their
 * casing), so those need `findStackBySlug` against a real stack list
 * instead.
 */
export function slugToStackName(slug: string): string | null {
  return SLUG_TO_STACK_NAME[slug] ?? null;
}

/** The display name to show for a stack (e.g. "Go" -> "Golang"). */
export function stackDisplayName(name: string): string {
  return STACK_DISPLAY_NAME[name] ?? name;
}

export function findStackBySlug(
  stacks: StackStat[],
  slug: string
): StackStat | null {
  return stacks.find((s) => stackNameToSlug(s.stack) === slug) ?? null;
}
