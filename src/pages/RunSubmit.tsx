import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { submitRunBulk } from "../api/endpoints";
import { showToast } from "../utils/toast";
import { ArrowLeft, Send } from "lucide-react";

type Question = {
  id: number;
  text: string;
  response_type: string;
  required: boolean;
  allow_na: boolean;
  options: Array<{ value: string; name: string }>;
  group: number | null;
};

type ChecklistState = {
  id: number;
  name: string;
  questions: Question[];
  cron_settings?: { allowed_time_to_submit?: string; extension_time?: string };
};

type RunState = {
  run_id: number;
  scheduled_for: string;
  status: string;
};

type WindowState = { start: string; end_exclusive: string };

function parseDurationMs(s?: string): number {
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
}

const RunSubmit: React.FC = () => {
  const navigate = useNavigate();
  const { runId } = useParams();
  const { state } = useLocation() as any;

  // cache state so hard refresh won't lose data
  useEffect(() => {
    if (state?.checklist && state?.run) {
      sessionStorage.setItem(
        `run.${runId}`,
        JSON.stringify({
          checklist: state.checklist,
          run: state.run,
          window: state.window,
        })
      );
    }
  }, [state, runId]);

  const cached = !state ? sessionStorage.getItem(`run.${runId}`) : null;
  const parsed = cached ? JSON.parse(cached) : null;

  const checklist = (state?.checklist ?? parsed?.checklist) as
    | ChecklistState
    | undefined;
  const run = (state?.run ?? parsed?.run) as RunState | undefined;
  const windowInfo = (state?.window ?? parsed?.window) as
    | WindowState
    | undefined;

  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [na, setNa] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const due = useMemo(() => {
    if (!run || !checklist) return null;
    const sched = new Date(run.scheduled_for);
    const allowMs = parseDurationMs(
      checklist.cron_settings?.allowed_time_to_submit
    );
    if (!allowMs) return null;
    return new Date(sched.getTime() + allowMs);
  }, [run, checklist]);

  const grace = useMemo(() => {
    if (!due || !checklist) return null;
    const extMs = parseDurationMs(checklist.cron_settings?.extension_time);
    if (!extMs) return due;
    return new Date(due.getTime() + extMs);
  }, [due, checklist]);

  const now = new Date();
  const allowedNow = useMemo(() => {
    if (!run) return false;
    const sched = new Date(run.scheduled_for);
    if (!grace) return now >= sched;
    return now >= sched && now <= grace;
  }, [run, grace]);

  useEffect(() => {
    if (!checklist || !run) {
      showToast("Missing data for run.", "error");
      navigate(-1);
    }
  }, [checklist, run, navigate]);

  const renderInput = (q: Question) => {
    if (na[q.id]) return <em className="text-gray-500">Marked N/A</em>;
    const rt = (q.response_type || "").toLowerCase();

    if (rt === "text") {
      return (
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Enter text"
          value={answers[q.id]?.text || ""}
          onChange={(e) =>
            setAnswers((s) => ({ ...s, [q.id]: { text: e.target.value } }))
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
          value={answers[q.id]?.number ?? ""}
          onChange={(e) =>
            setAnswers((s) => ({
              ...s,
              [q.id]: {
                number: e.target.value === "" ? "" : Number(e.target.value),
              },
            }))
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
              name={`q-${q.id}`}
              checked={answers[q.id]?.bool === true}
              onChange={() =>
                setAnswers((s) => ({ ...s, [q.id]: { bool: true } }))
              }
            />
            <span>Yes</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name={`q-${q.id}`}
              checked={answers[q.id]?.bool === false}
              onChange={() =>
                setAnswers((s) => ({ ...s, [q.id]: { bool: false } }))
              }
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
          value={answers[q.id]?.value ?? ""}
          onChange={(e) =>
            setAnswers((s) => ({ ...s, [q.id]: { value: e.target.value } }))
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
      const selected: string[] = answers[q.id]?.values ?? [];
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
                  setAnswers((s) => {
                    const arr: string[] = s[q.id]?.values ?? [];
                    const next = on
                      ? arr.filter((v) => v !== String(op.value))
                      : [...arr, String(op.value)];
                    return { ...s, [q.id]: { values: next } };
                  });
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
        onChange={(e) => setAnswers((s) => ({ ...s, [q.id]: e.target.value }))}
      />
    );
  };

  const onSubmit = async (finalize = true) => {
    if (!runId || !checklist || !run) return;
    if (!allowedNow) {
      showToast("You are outside the allowed window for this run.", "warning");
      return;
    }
    const payload = checklist.questions.map((q) => {
      const val = answers[q.id];
      const isNA = !!na[q.id];
      return { question: q.id, value: val ?? {}, is_na: isNA };
    });

    setSubmitting(true);
    try {
      const res = await submitRunBulk(Number(runId), {
        answers: payload,
        finalize,
      });
      showToast(res.finalized ? "Run submitted" : "Saved as draft", "success");
      // go back and force the list to reload
      navigate(-1, { state: { refresh: true } });
    } catch (e: any) {
      const msg = e?.detail || "Submit failed";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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
              <h1 className="text-2xl font-bold text-gray-900">
                {checklist?.name || "Run"}
              </h1>
              <p className="text-gray-600">
                Scheduled:{" "}
                {run ? new Date(run.scheduled_for).toLocaleString() : "—"}
                {due && <> · Due: {due.toLocaleString()}</>}
                {grace && <> · Grace: {grace.toLocaleString()}</>}
              </p>
              <p
                className={`text-sm mt-1 ${
                  allowedNow ? "text-green-700" : "text-gray-500"
                }`}
              >
                {allowedNow
                  ? "Within allowed window"
                  : "Outside allowed window"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded border bg-gray-50 hover:bg-gray-100"
              onClick={() => onSubmit(false)}
              disabled={submitting || !allowedNow}
              title={!allowedNow ? "Not within allowed window" : ""}
            >
              Save draft
            </button>
            <button
              className="px-4 py-2 rounded border bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-50"
              onClick={() => onSubmit(true)}
              disabled={submitting || !allowedNow}
              title={!allowedNow ? "Not within allowed window" : ""}
            >
              <Send className="w-4 h-4" />
              Submit
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-6">
          {checklist?.questions?.map((q: Question) => (
            <div key={q.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900">{q.text}</div>
                  <div className="text-sm text-gray-500">
                    Type: {q.response_type} {q.required ? "· required" : ""}{" "}
                    {q.allow_na ? "· NA allowed" : ""}
                  </div>
                </div>
                {q.allow_na && (
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!na[q.id]}
                      onChange={(e) =>
                        setNa((s) => ({ ...s, [q.id]: e.target.checked }))
                      }
                    />
                    Mark N/A
                  </label>
                )}
              </div>
              <div className="mt-3">{renderInput(q)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RunSubmit;
