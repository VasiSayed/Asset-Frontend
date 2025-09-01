// components/CronSettingOld.tsx
import React, { useMemo, useState } from "react";
import { FiX } from "react-icons/fi";

/** ---- constants ---- */
const MONTHS_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const WEEKDAYS_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0..23
const MINSEC = Array.from({ length: 60 }, (_, i) => i); // 0..59
const DATES = Array.from({ length: 31 }, (_, i) => i + 1); // 1..31

export type Frequency = "year" | "month" | "week" | "day" | "hour";

/** The value shape your form can easily map to/from */
export type CronValue = {
  frequency: Frequency;
  months: number[] | null; // 1..12
  dates: number[] | null; // 1..31
  weekdays: number[] | null; // 0..6 (0=MON)
  hours: number[] | null; // 0..23
  minutes: number[] | null; // 0..59
  seconds: number[] | null; // 0..59
};

type Props = {
  value?: Partial<CronValue>;
  onChange?: (v: CronValue) => void;
  disabled?: boolean;
  className?: string;
};

const DEFAULT_VALUE: CronValue = {
  frequency: "day",
  months: null,
  dates: null,
  weekdays: null,
  hours: null,
  minutes: null,
  seconds: null,
};

/** ---- tiny UI bits ---- */
function Pill({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm px-4 py-2 rounded-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
    >
      {label}
    </button>
  );
}

function summary(
  label: string,
  items: (number | string)[] | null,
  render?: (n: number) => string
) {
  if (!items || items.length === 0) return `${label}: any`;
  const toText = (x: number | string) =>
    typeof x === "number" ? (render ? render(x) : String(x)) : String(x);
  const firstTwo = items.slice(0, 2).map(toText).join(", ");
  const more = items.length > 2 ? ` +${items.length - 2}` : "";
  return `${label}: ${firstTwo}${more}`;
}

/** Modal for multi-select chips */
function SelectionModal({
  title,
  options,
  selected,
  onToggle,
  onClose,
  onApply,
  render,
  columns = 6,
}: {
  title: string;
  options: number[];
  selected: Set<number>;
  onToggle: (n: number) => void;
  onClose: () => void;
  onApply: () => void;
  render?: (n: number) => string;
  columns?: number;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600 text-sm mt-1">
              Select multiple values by clicking. Leave empty to mean "any".
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Close"
          >
            <FiX className="text-gray-500" size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {options.map((n) => {
              const isSelected = selected.has(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onToggle(n)}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-[#7991BB] text-white border-[#7991BB]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#7991BB] hover:text-[#7991BB]"
                  }`}
                >
                  {render ? render(n) : String(n)}
                </button>
              );
            })}
          </div>

          {selected.size > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Selected ({selected.size}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(selected)
                  .sort((a, b) => a - b)
                  .map((n) => (
                    <span
                      key={n}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {render ? render(n) : String(n)}
                      <button
                        onClick={() => onToggle(n)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <FiX size={10} />
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={() => {
              // Clear all selections
              Array.from(selected).forEach((n) => onToggle(n));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Clear All
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onApply}
              className="px-4 py-2 bg-[#7991BB] text-white rounded-lg hover:bg-[#6B82AB] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---- main ---- */
export default function CronSettingOld({
  value,
  onChange,
  disabled,
  className = "",
}: Props) {
  const [v, setV] = useState<CronValue>({ ...DEFAULT_VALUE, ...value });
  const [open, setOpen] = useState<
    null | "months" | "dates" | "weekdays" | "hours" | "minutes" | "seconds"
  >(null);

  const update = (patch: Partial<CronValue>) => {
    const next = { ...v, ...patch };
    setV(next);
    onChange?.(next);
  };

  const sel = {
    months: useMemo(() => new Set(v.months ?? []), [v.months]),
    dates: useMemo(() => new Set(v.dates ?? []), [v.dates]),
    weekdays: useMemo(() => new Set(v.weekdays ?? []), [v.weekdays]),
    hours: useMemo(() => new Set(v.hours ?? []), [v.hours]),
    minutes: useMemo(() => new Set(v.minutes ?? []), [v.minutes]),
    seconds: useMemo(() => new Set(v.seconds ?? []), [v.seconds]),
  };

  const toggleNum = (
    which: keyof CronValue,
    set: Set<number>,
    n: number,
    sortAsc = true
  ) => {
    if (disabled) return;
    const next = new Set(set);
    next.has(n) ? next.delete(n) : next.add(n);
    const arr = Array.from(next);
    if (sortAsc) arr.sort((a, b) => a - b);
    update({ [which]: arr.length ? arr : null } as Partial<CronValue>);
  };

  const handleApplyAndClose = () => {
    setOpen(null);
  };

  /** which pills to show per frequency */
  const pillsFor: Record<Frequency, Array<keyof CronValue>> = {
    year: ["months", "dates", "weekdays", "hours", "minutes", "seconds"],
    month: ["dates", "weekdays", "hours", "minutes", "seconds"],
    week: ["weekdays", "hours", "minutes", "seconds"],
    day: ["hours", "minutes", "seconds"],
    hour: ["minutes", "seconds"],
  };

  const visible = pillsFor[v.frequency];

  return (
    <div className={["w-full", className].join(" ")}>
      {/* Scope dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Every
        </label>
        <select
          value={v.frequency}
          onChange={(e) =>
            !disabled && update({ frequency: e.target.value as Frequency })
          }
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="year">year</option>
          <option value="month">month</option>
          <option value="week">week</option>
          <option value="day">day</option>
          <option value="hour">hour</option>
        </select>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {/* months */}
        {visible.includes("months") && (
          <Pill
            label={summary(
              "months",
              v.months?.map((m) => MONTHS_LABELS[m - 1]) ?? null
            )}
            onClick={() => setOpen("months")}
          />
        )}

        {/* dates */}
        {visible.includes("dates") && (
          <Pill
            label={summary("dates", v.dates)}
            onClick={() => setOpen("dates")}
          />
        )}

        {/* weekdays */}
        {visible.includes("weekdays") && (
          <Pill
            label={summary(
              "weekdays",
              v.weekdays?.map((i) => WEEKDAYS_LABELS[i]) ?? null
            )}
            onClick={() => setOpen("weekdays")}
          />
        )}

        {/* hours */}
        {visible.includes("hours") && (
          <Pill
            label={summary("hours", v.hours, (n) => String(n).padStart(2, "0"))}
            onClick={() => setOpen("hours")}
          />
        )}

        {/* minutes */}
        {visible.includes("minutes") && (
          <Pill
            label={summary("minutes", v.minutes, (n) =>
              String(n).padStart(2, "0")
            )}
            onClick={() => setOpen("minutes")}
          />
        )}

        {/* seconds */}
        {visible.includes("seconds") && (
          <Pill
            label={summary("seconds", v.seconds, (n) =>
              String(n).padStart(2, "0")
            )}
            onClick={() => setOpen("seconds")}
          />
        )}
      </div>

      {/* Modals */}
      {open === "months" && (
        <SelectionModal
          title="Select Months"
          options={MONTHS_LABELS.map((_, i) => i + 1)}
          selected={sel.months}
          onToggle={(n) => toggleNum("months", sel.months, n)}
          onClose={() => setOpen(null)}
          onApply={handleApplyAndClose}
          render={(n) => MONTHS_LABELS[n - 1]}
          columns={4}
        />
      )}

      {open === "dates" && (
        <SelectionModal
          title="Select Dates (1-31)"
          options={DATES}
          selected={sel.dates}
          onToggle={(n) => toggleNum("dates", sel.dates, n)}
          onClose={() => setOpen(null)}
          onApply={handleApplyAndClose}
          columns={8}
        />
      )}

      {open === "weekdays" && (
        <SelectionModal
          title="Select Weekdays"
          options={WEEKDAYS_LABELS.map((_, i) => i)}
          selected={sel.weekdays}
          onToggle={(n) => toggleNum("weekdays", sel.weekdays, n)}
          onClose={() => setOpen(null)}
          onApply={handleApplyAndClose}
          render={(n) => WEEKDAYS_LABELS[n]}
          columns={7}
        />
      )}

      {open === "hours" && (
        <SelectionModal
          title="Select Hours (0-23)"
          options={HOURS}
          selected={sel.hours}
          onToggle={(n) => toggleNum("hours", sel.hours, n)}
          onClose={() => setOpen(null)}
          onApply={handleApplyAndClose}
          render={(n) => String(n).padStart(2, "0")}
          columns={6}
        />
      )}

      {open === "minutes" && (
        <SelectionModal
          title="Select Minutes (0-59)"
          options={MINSEC}
          selected={sel.minutes}
          onToggle={(n) => toggleNum("minutes", sel.minutes, n)}
          onClose={() => setOpen(null)}
          onApply={handleApplyAndClose}
          render={(n) => String(n).padStart(2, "0")}
          columns={10}
        />
      )}

      {open === "seconds" && (
        <SelectionModal
          title="Select Seconds (0-59)"
          options={MINSEC}
          selected={sel.seconds}
          onToggle={(n) => toggleNum("seconds", sel.seconds, n)}
          onClose={() => setOpen(null)}
          onApply={handleApplyAndClose}
          render={(n) => String(n).padStart(2, "0")}
          columns={10}
        />
      )}
    </div>
  );
}
