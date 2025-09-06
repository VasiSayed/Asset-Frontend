// src/pages/AssetChecklist.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getChecklistsByScheduleRun, submitRunBulk } from "../api/endpoints";
import { showToast } from "../utils/toast";
import { ArrowLeft, Calendar, CheckCircle, XCircle, Send } from "lucide-react";

/** ---------------- Types ---------------- */
type Option = { value: string; name: string };

type Question = {
  id: number;
  text: string;
  response_type: string;
  required: boolean;
  allow_na: boolean;
  group: number | null;
  options: Option[];
  min_value?: number | null;
  max_value?: number | null;
  group_name?: string | null;
};

type ApiChecklist = {
  id: number;
  name: string;
  description: string;
  questions: Question[];
  cron_settings?: {
    allowed_time_to_submit?: string; // "1 00:00:00"
    extension_time?: string; // "12 00:00:00"
  };
};

type SubmissionAnswer = {
  question: number;
  value: any;
  is_na: boolean;
};

type Submission = {
  submission_id: number;
  group: number | null;
  group_name: string | null;
  user_id: number;
  username: string;
  status: string;
  submitted_at: string | null;
  answers: SubmissionAnswer[];
};

type ApiRun = {
  run_id: number;
  association_id: number;
  scheduled_for: string; // ISO with offset
  status: string; // "pending" | "completed" | ...
  submissions?: Submission[];
};

type Item = {
  checklist: ApiChecklist;
  runs: ApiRun[];
};

type ApiResponse = {
  asset_id: number;
  user_id: number;
  window: { start: string; end_exclusive: string };
  items: Item[];
};

/** ---------------- Utils ---------------- */
const pad = (n: number) => String(n).padStart(2, "0");
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthOf = (ymd: string) => ymd.slice(0, 7); // "YYYY-MM"

const parseDurationMs = (s?: string | null): number => {
  if (!s) return 0;
  const parts = s.trim().split(" ");
  let days = 0,
    h = 0,
    m = 0,
    sec = 0;
  if (parts.length === 2) {
    days = Number(parts[0]) || 0;
    [h, m, sec] = parts[1].split(":").map((x) => Number(x) || 0);
  } else {
    [h, m, sec] = s.split(":").map((x) => Number(x) || 0);
  }
  return (((days * 24 + h) * 60 + m) * 60 + sec) * 1000;
};

const fmt = (d: Date) =>
  d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const within = (now: Date, start: Date, end: Date) =>
  now >= start && now <= end;

const Badge: React.FC<{ ok: boolean; text: string }> = ({ ok, text }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm border ${
      ok
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-gray-50 text-gray-600 border-gray-200"
    }`}
  >
    {ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
    {text}
  </span>
);

// format answers for the read-only completed view
function getOptionName(q: Question, value: string) {
  const op = q.options?.find((o) => String(o.value) === String(value));
  return op ? op.name || op.value : value;
}
function formatAnswer(q: Question | undefined, a: SubmissionAnswer): string {
  if (a.is_na) return "N/A";
  const v = a.value ?? {};
  if (!q) return typeof v === "string" ? v : JSON.stringify(v);

  const rt = (q.response_type || "").toLowerCase();
  switch (rt) {
    case "text":
      return v?.text ?? (typeof v === "string" ? v : JSON.stringify(v));
    case "number":
    case "numeric":
    case "rating":
      if (typeof v?.number === "number") return String(v.number);
      return typeof v === "number" ? String(v) : v?.number ?? String(v ?? "");
    case "boolean":
      if (typeof v?.bool === "boolean") return v.bool ? "Yes" : "No";
      if (typeof v === "boolean") return v ? "Yes" : "No";
      return String(v ?? "");
    case "single_select": {
      const raw = v?.value ?? v;
      return getOptionName(q, String(raw ?? ""));
    }
    case "multi_select": {
      const arr: string[] = Array.isArray(v?.values)
        ? v.values
        : Array.isArray(v)
        ? v
        : [];
      if (!arr.length) return "";
      return arr.map((x) => getOptionName(q, String(x))).join(", ");
    }
    default:
      try {
        return typeof v === "string" ? v : JSON.stringify(v);
      } catch {
        return String(v ?? "");
      }
  }
}

/** ---------------- Page ---------------- */
const AssetChecklist: React.FC = () => {
  const navigate = useNavigate();
  const { assetId } = useParams();
  const location = useLocation() as any;

  // Today by default
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    toYMD(new Date())
  );
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // answers + NA per checklist
  const [answersByChecklist, setAnswersByChecklist] = useState<
    Record<number, Record<number, any>>
  >({});
  const [naByChecklist, setNaByChecklist] = useState<
    Record<number, Record<number, boolean>>
  >({});

  const asset = useMemo(
    () => location?.state?.asset ?? null,
    [location?.state]
  );
  const resolvedAssetId = Number(assetId || asset?.id);

  const [loadedMonth, setLoadedMonth] = useState<string>(monthOf(selectedDate));

  const fetchForMonth = async (yyyyMM: string) => {
    if (!resolvedAssetId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getChecklistsByScheduleRun(resolvedAssetId, {
        month: yyyyMM,
      });
      setData(res);
      setLoadedMonth(yyyyMM);
    } catch (e: any) {
      setError(e?.detail || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchForMonth(loadedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedAssetId]);

  // if the chosen date moves into a different month, refetch
  useEffect(() => {
    const m = monthOf(selectedDate);
    if (m !== loadedMonth) fetchForMonth(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // selected date inside server window?
  const activeWindow = useMemo(() => {
    if (!data) return false;
    const start = new Date(data.window.start);
    const endEx = new Date(data.window.end_exclusive);
    const sel = new Date(selectedDate + "T00:00:00");
    return sel >= start && sel < endEx;
  }, [data, selectedDate]);

  // helpers to manage answers
  const setAnswer = (checklistId: number, qid: number, val: any) =>
    setAnswersByChecklist((s) => ({
      ...s,
      [checklistId]: { ...(s[checklistId] || {}), [qid]: val },
    }));

  const setNA = (checklistId: number, qid: number, on: boolean) =>
    setNaByChecklist((s) => ({
      ...s,
      [checklistId]: { ...(s[checklistId] || {}), [qid]: on },
    }));

  const getRunForDate = (runs: ApiRun[]) =>
    runs.find((r) => toYMD(new Date(r.scheduled_for)) === selectedDate);

  const renderInput = (checklistId: number, q: Question) => {
    const answers = answersByChecklist[checklistId] || {};
    const na = naByChecklist[checklistId]?.[q.id] || false;
    if (na) return <em className="text-gray-500">Marked N/A</em>;

    const rt = (q.response_type || "").toLowerCase();
    const val = answers[q.id];

    if (rt === "text") {
      return (
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Enter text"
          value={val?.text || ""}
          onChange={(e) =>
            setAnswer(checklistId, q.id, { text: e.target.value })
          }
        />
      );
    }

    if (rt === "number" || rt === "numeric" || rt === "rating") {
      return (
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          placeholder="0"
          value={val?.number ?? ""}
          onChange={(e) =>
            setAnswer(checklistId, q.id, {
              number: e.target.value === "" ? "" : Number(e.target.value),
            })
          }
        />
      );
    }

    if (rt === "boolean") {
      return (
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name={`q-${checklistId}-${q.id}`}
              checked={val?.bool === true}
              onChange={() => setAnswer(checklistId, q.id, { bool: true })}
            />
            <span>Yes</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name={`q-${checklistId}-${q.id}`}
              checked={val?.bool === false}
              onChange={() => setAnswer(checklistId, q.id, { bool: false })}
            />
            <span>No</span>
          </label>
        </div>
      );
    }

    if (rt === "single_select") {
      return (
        <select
          className="w-full border rounded px-3 py-2"
          value={val?.value ?? ""}
          onChange={(e) =>
            setAnswer(checklistId, q.id, { value: e.target.value })
          }
        >
          <option value="" disabled>
            Choose…
          </option>
          {q.options?.map((op) => (
            <option key={op.value} value={op.value}>
              {op.name || op.value}
            </option>
          ))}
        </select>
      );
    }

    if (rt === "multi_select") {
      const selected: string[] = val?.values ?? [];
      return (
        <div className="flex flex-wrap gap-2">
          {q.options?.map((op) => {
            const on = selected.includes(String(op.value));
            return (
              <button
                key={op.value}
                type="button"
                className={`px-3 py-1 rounded border ${
                  on
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
                onClick={() => {
                  const next = on
                    ? selected.filter((v) => v !== String(op.value))
                    : [...selected, String(op.value)];
                  setAnswer(checklistId, q.id, { values: next });
                }}
              >
                {op.name || op.value}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Enter value"
        onChange={(e) => setAnswer(checklistId, q.id, e.target.value)}
      />
    );
  };

  const handleSubmit = async (
    checklist: ApiChecklist,
    run: ApiRun,
    finalize: boolean
  ) => {
    const answers = answersByChecklist[checklist.id] || {};
    const nas = naByChecklist[checklist.id] || {};
    const payload = checklist.questions.map((q) => ({
      question: q.id,
      value: answers[q.id] ?? {},
      is_na: !!nas[q.id],
    }));

    try {
      const res = await submitRunBulk(run.run_id, {
        answers: payload,
        finalize,
      });
      showToast(res.finalized ? "Run submitted" : "Saved as draft", "success");
      // refresh the current month data to update run status + bring back submissions
      await fetchForMonth(loadedMonth);
    } catch (e: any) {
      showToast(e?.detail || "Submit failed", "error");
    }
  };

  /** ---------------- Render ---------------- */
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checklists</h1>
              {data && (
                <p className="text-gray-600">
                  Window: {fmt(new Date(data.window.start))} →{" "}
                  {fmt(new Date(data.window.end_exclusive))} (exclusive)
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <Badge
              ok={activeWindow}
              text={activeWindow ? "Within window" : "Outside window"}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          Loading…
        </div>
      )}
      {error && (
        <div className="bg-white rounded-xl border border-red-200 p-6 text-red-700">
          {String(error)}
        </div>
      )}

      {!loading && data && data.items.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          No checklists found.
        </div>
      )}

      {!loading &&
        data &&
        data.items.map(({ checklist, runs }) => {
          const runForDay = getRunForDate(runs);

          // compute allowed window for THIS checklist/run
          const allowMs = parseDurationMs(
            checklist.cron_settings?.allowed_time_to_submit
          );
          const extMs = parseDurationMs(
            checklist.cron_settings?.extension_time
          );

          let sched: Date | null = null;
          let due: Date | null = null;
          let grace: Date | null = null;
          let allowedNow = false;

          if (runForDay) {
            sched = new Date(runForDay.scheduled_for);
            due = allowMs ? new Date(sched.getTime() + allowMs) : null;
            grace = due ? new Date(due.getTime() + (extMs || 0)) : null;
            allowedNow = !!(sched && grace && within(new Date(), sched, grace));
          }

          const answers = answersByChecklist[checklist.id] || {};
          const nas = naByChecklist[checklist.id] || {};

          // ⚠️ NO HOOKS HERE — compute qMap as a normal const
          const qMap: Record<number, Question> = {};
          for (const q of checklist.questions) qMap[q.id] = q;

          return (
            <div
              key={checklist.id}
              className="bg-white rounded-xl border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {checklist.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {checklist.description || "—"}
                </p>

                <div className="mt-2 text-sm text-gray-500">
                  Allowed submit:{" "}
                  {checklist.cron_settings?.allowed_time_to_submit || "—"} ·
                  Extension: {checklist.cron_settings?.extension_time || "—"}
                  {runForDay && (
                    <>
                      {" · "}Scheduled: {fmt(new Date(runForDay.scheduled_for))}
                      {due && <> · Due: {fmt(due)}</>}
                      {grace && <> · Grace: {fmt(grace)}</>}
                    </>
                  )}
                </div>

                <div className="mt-2">
                  {!runForDay && (
                    <Badge ok={false} text="No run scheduled for this date" />
                  )}
                  {runForDay && runForDay.status === "completed" && (
                    <Badge ok={true} text="Already completed" />
                  )}
                  {runForDay && runForDay.status !== "completed" && (
                    <Badge
                      ok={allowedNow && activeWindow}
                      text={
                        allowedNow && activeWindow
                          ? "Within allowed time"
                          : "Outside allowed time"
                      }
                    />
                  )}
                </div>
              </div>

              {/* ====== View-only (completed) ====== */}
              {runForDay && runForDay.status === "completed" && (
                <div className="p-6">
                  {!runForDay.submissions?.length ? (
                    <div className="text-sm text-gray-600">
                      No submission details.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {runForDay.submissions!.map((sub) => (
                        <div
                          key={sub.submission_id}
                          className="border rounded-lg"
                        >
                          <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                              <span className="font-medium">
                                {sub.username || `User #${sub.user_id}`}
                              </span>{" "}
                              submitted{" "}
                              {sub.submitted_at
                                ? new Date(sub.submitted_at).toLocaleString()
                                : "—"}
                              {sub.group_name ? (
                                <>
                                  {" "}
                                  · Group: <i>{sub.group_name}</i>
                                </>
                              ) : null}
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">
                              {sub.status}
                            </span>
                          </div>
                          <div className="px-4 py-4">
                            {sub.answers.length === 0 ? (
                              <div className="text-sm text-gray-500">
                                No answers.
                              </div>
                            ) : (
                              <ul className="space-y-3">
                                {sub.answers.map((ans, idx) => {
                                  const q = qMap[ans.question];
                                  return (
                                    <li
                                      key={idx}
                                      className="flex flex-col md:flex-row md:gap-6"
                                    >
                                      <div className="md:w-1/2">
                                        <div className="text-sm text-gray-600">
                                          {q?.text ||
                                            `Question #${ans.question}`}
                                        </div>
                                        {q?.group_name && (
                                          <div className="text-xs text-gray-400">
                                            Section: {q.group_name}
                                          </div>
                                        )}
                                      </div>
                                      <div className="md:flex-1 mt-1 md:mt-0">
                                        <div className="text-sm font-medium text-gray-900">
                                          {formatAnswer(q, ans)}
                                        </div>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ====== Inline questions (pending / draft) ====== */}
              {runForDay && runForDay.status !== "completed" && (
                <div className="p-6">
                  {!allowedNow || !activeWindow ? (
                    <div className="text-sm text-gray-600 mb-4">
                      You are outside the allowed window for this run.
                    </div>
                  ) : null}

                  <div className="space-y-6">
                    {checklist.questions.map((q) => (
                      <div key={q.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {q.text}
                            </div>
                            <div className="text-sm text-gray-500">
                              Type: {q.response_type}
                              {q.required ? " · required" : ""}{" "}
                              {q.allow_na ? " · NA allowed" : ""}
                              {q.min_value != null
                                ? ` · min ${q.min_value}`
                                : ""}
                              {q.max_value != null
                                ? ` · max ${q.max_value}`
                                : ""}
                            </div>
                          </div>
                          {q.allow_na && (
                            <label className="inline-flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={!!naByChecklist[checklist.id]?.[q.id]}
                                onChange={(e) =>
                                  setNA(checklist.id, q.id, e.target.checked)
                                }
                              />
                              Mark N/A
                            </label>
                          )}
                        </div>
                        <div className="mt-3">
                          {renderInput(checklist.id, q)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-6">
                    <button
                      className="px-4 py-2 rounded border bg-gray-50 hover:bg-gray-100"
                      onClick={() => handleSubmit(checklist, runForDay, false)}
                      disabled={!allowedNow || !activeWindow}
                      title={
                        !allowedNow || !activeWindow
                          ? "Not within allowed window"
                          : ""
                      }
                    >
                      Save draft
                    </button>
                    <button
                      className="px-4 py-2 rounded border bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-50"
                      onClick={() => handleSubmit(checklist, runForDay, true)}
                      disabled={!allowedNow || !activeWindow}
                      title={
                        !allowedNow || !activeWindow
                          ? "Not within allowed window"
                          : ""
                      }
                    >
                      <Send className="w-4 h-4" />
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default AssetChecklist;
