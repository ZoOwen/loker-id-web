const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

export function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "baru saja";
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)} menit lalu`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)} jam lalu`;
  if (seconds < WEEK) return `${Math.floor(seconds / DAY)} hari lalu`;
  if (seconds < MONTH) return `${Math.floor(seconds / WEEK)} minggu lalu`;
  if (seconds < YEAR) return `${Math.floor(seconds / MONTH)} bulan lalu`;
  return `${Math.floor(seconds / YEAR)} tahun lalu`;
}

function formatJuta(value: number): string {
  const juta = value / 1_000_000;
  const rounded = Math.round(juta * 10) / 10;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
}

export function formatSalary(
  minInput: number | null | undefined,
  maxInput: number | null | undefined
): string | null {
  // Scraped salaries are sometimes junk (0, or a few hundred thousand
  // rupiah instead of a monthly salary). Anything under Rp 1jt isn't a
  // plausible monthly salary, so treat it as missing rather than show it.
  const MIN_PLAUSIBLE_SALARY = 1_000_000;
  const min = minInput && minInput >= MIN_PLAUSIBLE_SALARY ? minInput : null;
  const max = maxInput && maxInput >= MIN_PLAUSIBLE_SALARY ? maxInput : null;

  if (!min && !max) return null;
  if (min && max && min !== max) {
    return `Rp ${formatJuta(min)}–${formatJuta(max)} jt`;
  }
  if (min) return `Rp ${formatJuta(min)} jt+`;
  if (max) return `Hingga Rp ${formatJuta(max)} jt`;
  return null;
}

export function formatSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const label = hostname.split(".")[0];
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return "sumber asli";
  }
}

const LEVEL_LABELS: Record<string, string> = {
  intern: "Intern",
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
};

export function formatLevel(level: string | null | undefined): string | null {
  if (!level) return null;
  return LEVEL_LABELS[level] ?? level;
}

const MODE_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "Onsite",
};

export function formatMode(mode: string | null | undefined): string | null {
  if (!mode) return null;
  return MODE_LABELS[mode] ?? mode;
}
