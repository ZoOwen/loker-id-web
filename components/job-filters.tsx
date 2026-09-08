"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useJobFilters } from "@/lib/use-job-filters";
import type { StackStat } from "@/lib/types";

const MODE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

const LEVEL_OPTIONS = [
  { value: "intern", label: "Intern" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function JobFiltersForm({
  availableStack,
}: {
  availableStack: StackStat[];
}) {
  const [filters, setFilters] = useJobFilters();

  const [qInput, setQInput] = useState(filters.q ?? "");
  const [cityInput, setCityInput] = useState(filters.city ?? "");
  const [salaryInput, setSalaryInput] = useState(
    filters.salary_min ? String(filters.salary_min) : ""
  );

  const debouncedQ = useDebouncedValue(qInput, 400);
  const debouncedCity = useDebouncedValue(cityInput, 400);
  const debouncedSalary = useDebouncedValue(salaryInput, 400);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, q: debouncedQ || null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, city: debouncedCity || null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCity]);

  useEffect(() => {
    const parsed = Number(debouncedSalary);
    setFilters((prev) => ({
      ...prev,
      salary_min: debouncedSalary && parsed > 0 ? parsed : null,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSalary]);

  function toggleStack(stack: string, checked: boolean) {
    setFilters((prev) => ({
      ...prev,
      stack: checked
        ? [...prev.stack, stack]
        : prev.stack.filter((s) => s !== stack),
    }));
  }

  function reset() {
    setQInput("");
    setCityInput("");
    setSalaryInput("");
    setFilters(null);
  }

  const hasActiveFilters =
    filters.stack.length > 0 ||
    filters.salary_min ||
    filters.mode ||
    filters.level ||
    filters.city ||
    filters.q;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filter</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="q">Cari</Label>
        <Input
          id="q"
          placeholder="cth. backend, frontend..."
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
        />
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <Label>Teknologi</Label>
        <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
          {availableStack.map(({ stack, count }) => {
            const checked = filters.stack.includes(stack);
            return (
              <div key={stack} className="flex items-center gap-2">
                <Checkbox
                  id={`stack-${stack}`}
                  checked={checked}
                  onCheckedChange={(value) => toggleStack(stack, value)}
                />
                <Label
                  htmlFor={`stack-${stack}`}
                  className="flex flex-1 justify-between font-normal text-foreground"
                >
                  <span>{stack}</span>
                  <span className="text-muted-foreground">{count}</span>
                </Label>
              </div>
            );
          })}
          {availableStack.length === 0 && (
            <p className="text-xs text-muted-foreground">Tidak ada data.</p>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="salary_min">Gaji minimal (Rp)</Label>
        <Input
          id="salary_min"
          type="number"
          inputMode="numeric"
          step={1_000_000}
          min={0}
          placeholder="cth. 12000000"
          value={salaryInput}
          onChange={(e) => setSalaryInput(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mode">Mode kerja</Label>
        <Select
          value={filters.mode ?? ""}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, mode: value || null }))
          }
        >
          <SelectTrigger id="mode" className="w-full">
            <SelectValue placeholder="Semua mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua mode</SelectItem>
            {MODE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="level">Level</Label>
        <Select
          value={filters.level ?? ""}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, level: value || null }))
          }
        >
          <SelectTrigger id="level" className="w-full">
            <SelectValue placeholder="Semua level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua level</SelectItem>
            {LEVEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="city">Kota</Label>
        <Input
          id="city"
          placeholder="cth. Jakarta"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
        />
      </div>
    </div>
  );
}
