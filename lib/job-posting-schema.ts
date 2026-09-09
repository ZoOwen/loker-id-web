import { getValidSalaryRange } from "@/lib/format";
import { SITE_URL } from "@/lib/site";
import type { Job } from "@/lib/types";

// schema.org/JobPosting, mapped to what our API actually gives us. This is
// what lets a listing show up in Google Jobs — see
// https://developers.google.com/search/docs/appearance/structured-data/job-posting
export function buildJobPostingSchema(job: Job) {
  const { min, max } = getValidSalaryRange(job.salary_min, job.salary_max);
  const city = job.location_city ?? job.location;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    url: `${SITE_URL}/jobs/${job.id}`,
    title: job.title,
    description: job.description,
    datePosted: job.posted_at,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    identifier: {
      "@type": "PropertyValue",
      name: "Loker.id",
      value: job.id,
    },
    // We only ever link out to the source listing, never host an apply form.
    directApply: false,
    // The API doesn't give us a contract type, so this is a best-effort
    // guess from `level` — "intern" is the only value we can infer with any
    // confidence, everything else defaults to full-time.
    employmentType: job.level === "intern" ? "INTERN" : "FULL_TIME",
  };

  if (job.mode === "remote") {
    schema.jobLocationType = "TELECOMMUTE";
    schema.applicantLocationRequirements = {
      "@type": "Country",
      name: "Indonesia",
    };
  }

  if (city) {
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressCountry: "ID",
      },
    };
  }

  if (min || max) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "IDR",
      value: {
        "@type": "QuantitativeValue",
        ...(min ? { minValue: min } : {}),
        ...(max ? { maxValue: max } : {}),
        unitText: "MONTH",
      },
    };
  }

  return schema;
}
