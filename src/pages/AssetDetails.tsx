import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";
import { fetchAssetMeasures, createMeasureReading } from "../api/endpoints";
import {
  ArrowLeft,
  Gauge,
  CheckSquare,
  MapPin,
  Calendar,
  Settings,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";

type Asset = Record<string, any>;

const pick = (obj: Asset, keys: string[], fallback = "-") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim?.() !== "") return v;
  }
  return fallback;
};

type Measure = {
  id: number;
  asset: number;
  measure_type: "consumption" | "nonConsumption";
  name: string;
  unit_type: string;
  min_value: string | null;
  max_value: string | null;
  alert_below: string | null;
  alert_above: string | null;
  multiplier: string | null;
  check_previous: boolean;
  created_at: string;
};

/** ───────────────────────── Modal: Multi-measure reading ───────────────────────── */
const MultiReadingModal: React.FC<{
  isOpen: boolean;
  assetId: number;
  onClose: () => void;
  onSaved?: (latestISO?: string) => void;
}> = ({ isOpen, assetId, onClose, onSaved }) => {
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [values, setValues] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [loadErr, setLoadErr] = useState<string | null>(null);

  // load measures when opened
  useEffect(() => {
    if (!isOpen || !assetId) return;
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      setLoadErr(null);
      setMeasures([]);
      setValues({});
      setErrors({});
      try {
        const data = await fetchAssetMeasures(assetId);
        if (cancelled) return;
        const list = data.results || [];
        setMeasures(list);
        // init empty inputs
        const init: Record<number, string> = {};
        list.forEach((m) => (init[m.id] = ""));
        setValues(init);
      } catch (e: any) {
        if (!cancelled)
          setLoadErr(e?.response?.data?.detail || "Failed to load measures.");
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, assetId]);

  const closeAll = () => {
    if (saving) return;
    onClose();
  };

  const parseNum = (s: string) => (s === "" || s == null ? NaN : Number(s));

  // simple validations: required + min/max (if present)
  const validateAll = (): boolean => {
    const nextErr: Record<number, string> = {};
    measures.forEach((m) => {
      const raw = values[m.id] ?? "";
      if (raw.trim() === "") {
        nextErr[m.id] = "Required";
        return;
      }
      const n = Number(raw);
      if (Number.isNaN(n)) {
        nextErr[m.id] = "Must be a number";
        return;
      }
      if (
        m.min_value != null &&
        m.min_value !== "" &&
        n < Number(m.min_value)
      ) {
        nextErr[m.id] = `Min ${m.min_value}`;
        return;
      }
      if (
        m.max_value != null &&
        m.max_value !== "" &&
        n > Number(m.max_value)
      ) {
        nextErr[m.id] = `Max ${m.max_value}`;
        return;
      }
    });
    setErrors(nextErr);
    return Object.keys(nextErr).length === 0;
  };

  const handleSave = async () => {
    if (!validateAll()) {
      showToast("Please fix the highlighted readings.", "error");
      return;
    }
    setSaving(true);
    try {
      const payloads = measures.map((m) => ({
        measure: m.id,
        reading_value: Math.round(parseNum(values[m.id]) * 10000) / 10000,
      }));

      const results = await Promise.allSettled(
        payloads.map((p) => createMeasureReading(p))
      );

      const ok = results.filter(
        (r) => r.status === "fulfilled"
      ) as PromiseFulfilledResult<{
        id: number;
        measure: number;
        reading_value: string;
        created_at: string;
      }>[];

      const fails = results.filter((r) => r.status === "rejected");

      if (ok.length) {
        const latestISO = ok
          .map((r) => r.value.created_at)
          .sort()
          .slice(-1)[0];
        showToast(
          `Saved ${ok.length}/${measures.length} readings${
            fails.length ? ` (${fails.length} failed)` : ""
          }`,
          fails.length ? "warning" : "success"
        );
        onSaved?.(latestISO);
      } else {
        showToast("No readings were saved.", "error");
      }

      if (!fails.length) onClose();
    } catch (e: any) {
      showToast(e?.response?.data?.detail || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Gauge className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Take Readings
            </h2>
          </div>
          <button
            onClick={closeAll}
            className="p-2 rounded-lg hover:bg-gray-100"
            disabled={saving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {loadingList && (
            <div className="text-center text-gray-600 py-8">
              Loading measures…
            </div>
          )}

          {loadErr && !loadingList && (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
              {loadErr}
            </div>
          )}

          {!loadingList && !loadErr && measures.length === 0 && (
            <div className="text-center text-gray-600 py-8">
              No measures configured for this asset.
            </div>
          )}

          {!loadingList && measures.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4">
                {measures.map((m) => {
                  const err = errors[m.id];
                  const min = m.min_value ?? "";
                  const max = m.max_value ?? "";
                  return (
                    <div
                      key={m.id}
                      className={`border rounded-lg p-4 ${
                        err ? "border-red-300" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm text-gray-500">
                            {m.measure_type === "consumption"
                              ? "Consumption"
                              : "Non-consumption"}
                          </div>
                          <div className="text-base font-semibold text-gray-900">
                            {m.name}
                            {m.unit_type ? (
                              <span className="ml-2 text-gray-500 font-normal">
                                ({m.unit_type})
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {min !== "" ? `Min ${min}` : "Min —"} ·{" "}
                            {max !== "" ? `Max ${max}` : "Max —"}{" "}
                            {m.alert_below ? `· Alert < ${m.alert_below}` : ""}{" "}
                            {m.alert_above ? `· Alert > ${m.alert_above}` : ""}
                            {m.multiplier ? ` · x${m.multiplier}` : ""}
                          </div>
                        </div>
                        <div className="w-40">
                          <input
                            type="number"
                            step="any"
                            value={values[m.id] ?? ""}
                            onChange={(e) =>
                              setValues((s) => ({
                                ...s,
                                [m.id]: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-2 ${
                              err
                                ? "border-red-300 focus:ring-red-300"
                                : "border-gray-300 focus:ring-blue-300"
                            }`}
                            placeholder="value"
                            disabled={saving}
                          />
                          {err && (
                            <div className="mt-1 text-xs text-red-600">
                              {err}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={closeAll}
                  className="px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-2"
                  disabled={saving || measures.length === 0}
                >
                  {saving ? "Saving…" : "Save Readings"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/** ───────────────────────────────── AssetDetails page ───────────────────────────────── */
const InfoCard: React.FC<{
  label: string;
  value: any;
  icon?: React.ReactNode;
  className?: string;
}> = ({ label, value, icon, className = "" }) => (
  <div
    className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
  >
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
    </div>
    <div className="text-lg font-semibold text-gray-900">{value || "-"}</div>
  </div>
);

const StatusBadge: React.FC<{
  status: boolean;
  label: string;
  variant?: "success" | "warning" | "info" | "default";
}> = ({ status, label, variant = "default" }) => {
  const getVariantClasses = () => {
    if (!status) return "bg-gray-100 text-gray-700 border-gray-200";
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-700 border-green-200";
      case "warning":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "info":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getVariantClasses()}`}
    >
      <div
        className={`w-2 h-2 rounded-full mr-2 ${
          status
            ? variant === "success"
              ? "bg-green-500"
              : variant === "warning"
              ? "bg-orange-500"
              : variant === "info"
              ? "bg-blue-500"
              : "bg-gray-500"
            : "bg-gray-400"
        }`}
      />
      {label}
    </div>
  );
};

const AssetDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [row, setRow] = useState<Asset | null>(null);
  const [showMulti, setShowMulti] = useState(false);

  useEffect(() => {
    const fromState: Asset | null = location?.state?.asset ?? null;
    if (fromState) {
      setRow(fromState);
      sessionStorage.setItem("asset.view", JSON.stringify(fromState));
      return;
    }
    const cached = sessionStorage.getItem("asset.view");
    if (cached) {
      try {
        setRow(JSON.parse(cached));
      } catch {}
    }
  }, [location?.state]);

  const title = useMemo(() => {
    if (!row) return "Asset";
    return pick(row, ["asset_name", "name", "title"], "Asset");
  }, [row]);

  const handleChecklist = () => {
    navigate(`/assets/${row?.id}/checklist`, { state: { asset: row } });
  };

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <p className="text-gray-600 mt-1">
                    Asset ID: {pick(row || {}, ["id", "asset_no", "number"])}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {row?.asset_reading && (
                  <button
                    onClick={() => setShowMulti(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={!row?.id}
                  >
                    <Gauge className="w-4 h-4" />
                    Take Reading
                  </button>
                )}

                <button
                  onClick={handleChecklist}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  disabled={!row?.id}
                >
                  <CheckSquare className="w-4 h-4" />
                  Checklist
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                status={!!row?.critical}
                label="Critical"
                variant="warning"
              />
              <StatusBadge
                status={!!row?.asset_reading}
                label="Reading Enabled"
                variant="info"
              />
              <StatusBadge
                status={!!row?.compliance}
                label="Compliance"
                variant="success"
              />
              <StatusBadge
                status={!!row?.in_use}
                label="In Use"
                variant="success"
              />
              {row?.breakdown && (
                <StatusBadge
                  status={!!row?.breakdown}
                  label="Breakdown"
                  variant="warning"
                />
              )}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard
                label="Asset Name"
                value={pick(row || {}, ["asset_name", "name"])}
              />
              <InfoCard
                label="Brand"
                value={pick(row || {}, ["brand", "manufacturer"])}
              />
              <InfoCard label="Model" value={pick(row || {}, ["model"])} />
              <InfoCard
                label="Serial Number"
                value={pick(row || {}, ["serial", "serial_number"])}
              />
              <InfoCard
                label="Department"
                value={pick(row || {}, ["department"])}
              />
              <InfoCard
                label="Created"
                value={
                  row?.created_at
                    ? new Date(row.created_at).toLocaleDateString()
                    : "-"
                }
                icon={<Calendar className="w-4 h-4 text-gray-400" />}
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard
                label="Site"
                value={pick(row || {}, ["site_name", "site"])}
              />
              <InfoCard
                label="Building"
                value={pick(row || {}, ["building_name", "building"])}
              />
              <InfoCard
                label="Floor"
                value={pick(row || {}, ["floor_name", "floor"])}
              />
              <InfoCard
                label="Unit / Room"
                value={pick(row || {}, ["unit_name", "unit", "room"])}
              />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Classification
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard
                label="Asset Type"
                value={pick(row || {}, ["asset_type_name", "asset_type"])}
              />
              <InfoCard
                label="Category"
                value={pick(row || {}, ["category_name", "category"])}
              />
              <InfoCard
                label="Group"
                value={pick(row || {}, ["group_name", "group"])}
              />
              <InfoCard
                label="Subgroup"
                value={pick(row || {}, ["subgroup_name", "subgroup"])}
              />
            </div>
          </div>
        </div>

        {/* Latest Reading */}
        {(row?.last_reading || row?.last_reading_date) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Latest Reading
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Reading Value" value={row?.last_reading} />
                <InfoCard
                  label="Reading Date"
                  value={
                    row?.last_reading_date
                      ? new Date(row.last_reading_date).toLocaleString()
                      : "-"
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Multi-measure Reading Modal */}
      {row?.id && (
        <MultiReadingModal
          isOpen={showMulti}
          assetId={row.id}
          onClose={() => setShowMulti(false)}
          onSaved={(latestISO) => {
            // optionally reflect something in the page
            if (latestISO) {
              setRow((prev) =>
                prev ? { ...prev, last_reading_date: latestISO } : prev
              );
            }
          }}
        />
      )}
    </>
  );
};

export default AssetDetails;
