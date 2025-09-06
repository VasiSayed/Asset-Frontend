// src/pages/AssociationBtn.tsx
import React, { useEffect, useMemo, useState } from "react";
import Select from "../components/Select";
import IconButton from "../components/IconButton";
import Pagination from "../components/Pagination";
import Tabs from "../components/Tabs";
import CronSettingOld, {
  type CronValue as CronOldValue,
} from "../components/CronSettingOld";

import {
  FiTrash2,
  FiPlus,
  FiCheckCircle,
  FiFileText,
  FiFilter,
  FiX,
  FiSearch,
  FiUser,
  FiUsers,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { showToast } from "../../src/utils/toast";

// APIs
import {
  AllAssetBySite,
  GetLocationsBySite,
  GetAssetTypes,
  GetAssetCategories,
  GetAssetGroups,
  GetAssetSubgroups,
  postChecklistAssociationsBulk,
  getUsersWithPermission,
  GetAssociationChecklist,
} from "../api/endpoints";

interface AssociationRow {
  id: number; // asset id
  assetName: string; // label
  assignedTo: string; // comma of selected user names (purely for table display)
}

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tooltip?: string }
> = ({ children, tooltip, ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 bg-[#7991BB] text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${
      props.className || ""
    }`}
    title={tooltip}
    type={props.type || "button"}
  >
    {children}
  </button>
);

const DatePicker = ({ label, name, value, onChange, min, max, error }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// Simple Multi-Select Dropdown Component
const MultiSelectDropdown: React.FC<{
  options: { id: number; label: string }[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}> = ({ options, selectedIds, onChange, placeholder = "Select users" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOptions = options.filter((option) =>
    selectedIds.includes(option.id)
  );

  const handleToggle = (id: number) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    onChange(newSelected);
  };

  return (
    <div className="relative">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <div className="flex items-center justify-between">
            <span
              className={selectedIds.length ? "text-gray-900" : "text-gray-500"}
            >
              {selectedIds.length
                ? `${selectedIds.length} user${
                    selectedIds.length !== 1 ? "s" : ""
                  } selected`
                : placeholder}
            </span>
            <FiChevronDown
              className={`text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedOptions.slice(0, 3).map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {option.label.split(" ")[0]}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(option.id);
                  }}
                  className="hover:bg-blue-200 rounded"
                >
                  <FiX size={10} />
                </button>
              </span>
            ))}
            {selectedOptions.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{selectedOptions.length - 3} more
              </span>
            )}
          </div>
        )}

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.id}
                className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                  selectedIds.includes(option.id) ? "bg-blue-50" : ""
                }`}
                onClick={() => handleToggle(option.id)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      selectedIds.includes(option.id)
                        ? "bg-[#7991BB] border-[#7991BB]"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedIds.includes(option.id) && (
                      <FiCheck size={10} className="text-white" />
                    )}
                  </div>
                  <span className="text-gray-900">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ===== Mapping helpers for CronSettingOld ===== */
const MONTHS12 = [
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
const MONTH_TO_INT: Record<string, number> = Object.fromEntries(
  MONTHS12.map((m, i) => [m, i + 1])
);
const INT_TO_MONTH = (n: number) => MONTHS12[n - 1];

// Old component uses MON=0..SUN=6
const DOW_MON0 = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DOW_TO_IDX_MON0: Record<string, number> = Object.fromEntries(
  DOW_MON0.map((d, i) => [d, i])
);
const IDX_TO_DOW_MON0 = (i: number) => DOW_MON0[i];

interface CronData {
  cronMonths?: string[];
  cronDays?: string[];
  cronWeeks?: string[];
  cronHours?: string[];
  cronMinutes?: string[];
  cronSeconds?: string[];
}

function formToOld(
  cronData: CronData,
  cronScope: "year" | "month" | "week" | "day" | "hour"
): CronOldValue {
  return {
    frequency: cronScope,
    months: cronData.cronMonths?.length
      ? cronData.cronMonths.map((m) => MONTH_TO_INT[m]).filter(Boolean)
      : null,
    dates: cronData.cronDays?.length
      ? cronData.cronDays.map((d) => Number(d))
      : null,
    weekdays: cronData.cronWeeks?.length
      ? cronData.cronWeeks
          .map((w) => DOW_TO_IDX_MON0[w])
          .filter((x) => x !== undefined)
      : null,
    hours: cronData.cronHours?.length
      ? cronData.cronHours.map((h) => Number(h))
      : null,
    minutes: cronData.cronMinutes?.length
      ? cronData.cronMinutes.map((m) => Number(m))
      : null,
    seconds: cronData.cronSeconds?.length
      ? cronData.cronSeconds.map((s) => Number(s))
      : null,
  };
}

function oldToForm(old: CronOldValue): CronData {
  return {
    cronMonths: old.months ? old.months.map(INT_TO_MONTH) : [],
    cronDays: old.dates ? old.dates.map(String) : [],
    cronWeeks: old.weekdays ? old.weekdays.map((i) => IDX_TO_DOW_MON0(i)) : [],
    cronHours: old.hours ? old.hours.map(String) : [],
    cronMinutes: old.minutes ? old.minutes.map(String) : [],
    cronSeconds: old.seconds ? old.seconds.map(String) : [],
  };
}

const AssociationBtn: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const checklistId = Number(id);
  if (!Number.isFinite(checklistId)) {
    return <div className="p-4 text-red-600">Invalid checklist id</div>;
  }

  const siteId =
    Number((window as any)?.site_id) ||
    Number(localStorage.getItem("site_id")) ||
    1;

  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>("Checklist");

  // Date state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateError, setDateError] = useState<string>("");

  // Cron state
  const [cronData, setCronData] = useState<CronData>({
    cronMonths: [],
    cronDays: [],
    cronWeeks: [],
    cronHours: ["9"],
    cronMinutes: ["0"],
    cronSeconds: [],
  });
  type CronScope = "year" | "month" | "week" | "day" | "hour";
  const [cronScope, setCronScope] = useState<CronScope>("week");

  // FILTER STATE (now lives in a modal)
  const [locationOpt, setLocationOpt] = useState<string>("");
  const [typeOpt, setTypeOpt] = useState<string>("");
  const [categoryOpt, setCategoryOpt] = useState<string>("");
  const [groupOpt, setGroupOpt] = useState<string>("");
  const [subgroupOpt, setSubgroupOpt] = useState<string>("");

  // Dropdown datasets
  const [locations, setLocations] = useState<any[]>([]);
  const [assetTypes, setAssetTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subgroups, setSubgroups] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  // USERS (multi-select)
  const [userOptions, setUserOptions] = useState<
    { id: number; label: string }[]
  >([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // rows
  const [associations, setAssociations] = useState<AssociationRow[]>([]);

  const [assetSelectValue, setAssetSelectValue] = useState<string>("");
  // UX
  const [loading, setLoading] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(associations.length / PAGE_SIZE) || 1;
  const paginatedAssociations = useMemo(
    () => associations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [associations, page]
  );

  // Date validation
  const validateDates = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "";

    if (start >= end) {
      return "End date must be after start date";
    }

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 366) {
      return "Date range cannot exceed 366 days";
    }

    return "";
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setStartDate(date);
    const error = validateDates(date, endDate);
    setDateError(error);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setEndDate(date);
    const error = validateDates(startDate, date);
    setDateError(error);
  };

  const handleTabChange = (key: string | number) => {
    const tabKey = String(key);
    setActiveTab(tabKey);

    // Navigation logic for different tabs
    switch (tabKey) {
      case "Assets":
        navigate("/Assetmanagement?tab=Assets");
        break;
      case "AMC":
        navigate("/Assetmanagement?tab=AMC");
        break;
      case "Checklist":
        navigate("/Assetmanagement?tab=Checklist");
        break;
      case "PPM":
        navigate("/Assetmanagement?tab=PPM");
        break;
      case "Stock Items":
        navigate("/Assetmanagement?tab=Stock+Items");
        break;
      default:
        break;
    }
  };

  // Helpers
  const parseIdLabel = (opt: string) => {
    if (!opt) return { id: null as number | null, label: "" };
    const [first, ...rest] = opt.split("|");
    const idNum = Number((first || "").trim());
    return {
      id: Number.isFinite(idNum) ? idNum : null,
      label: rest.join("|").trim(),
    };
  };

  const assetLabel = (a: any) =>
    a?.display_name ||
    a?.name ||
    a?.asset_name ||
    a?.code ||
    a?.tag ||
    `Asset ${a?.id ?? ""}`;

  const toOptionStrings = (arr: any[], labelKey = "name") =>
    arr.map((x) => `${x.id} | ${x[labelKey] ?? x.name ?? `#${x.id}`}`);

  // initial loads (locations, types, users)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [locs, types] = await Promise.all([
          GetLocationsBySite(siteId),
          GetAssetTypes(siteId),
        ]);
        if (!mounted) return;
        setLocations(Array.isArray(locs) ? locs : []);
        setAssetTypes(Array.isArray(types) ? types : []);
      } catch (err: any) {
        showToast(`Error Occured ${err?.message || "Request failed"}`, "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    (async () => {
      try {
        const users = await getUsersWithPermission("asset");
        const opts = (users || []).map((u: any) => ({
          id: u.id,
          label:
            (u.username),
        }));
        if (mounted) setUserOptions(opts);
      } catch (err: any) {
        showToast(`Error Occured ${err?.message || "Request failed"}`, "error");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [siteId]);

  // shape that your backend returns (for clarity)
  type AssocAPI = {
    id: number;
    checklist: number;
    asset_id: number;
    asset_name: string;
    user_id: number;
    username: string;
    created_at: string;
    updated_at: string;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!Number.isFinite(checklistId)) return;

        // 1) call your endpoint with the id in query string
        const data: AssocAPI[] = await GetAssociationChecklist(checklistId);

        // 2) group by asset, collect user names for display
        const byAsset = new Map<number, { name: string; users: Set<string> }>();

        for (const row of data || []) {
          if (!byAsset.has(row.asset_id)) {
            byAsset.set(row.asset_id, {
              name: row.asset_name || `Asset ${row.asset_id}`,
              users: new Set<string>(),
            });
          }
          byAsset
            .get(row.asset_id)!
            .users.add(row.username || `user:${row.user_id}`);
        }

        // 3) convert to your AssociationRow[]
        const rows: AssociationRow[] = Array.from(byAsset.entries()).map(
          ([assetId, v]) => ({
            id: assetId,
            assetName: v.name,
            assignedTo: Array.from(v.users).join(", ") || "-",
          })
        );

        if (mounted) setAssociations(rows);

        // (optional) pre-select users already assigned on this checklist:
        const userIds = Array.from(new Set((data || []).map((r) => r.user_id)));
        if (mounted && userIds.length) setSelectedUserIds(userIds);
      } catch (err: any) {
        showToast(
          `Failed to load associations: ${err?.message || "Request failed"}`,
          "error"
        );
      }
    })();
    return () => {
      mounted = false;
    };
  }, [checklistId]);

  // dependent filters
  useEffect(() => {
    setCategoryOpt("");
    setGroupOpt("");
    setSubgroupOpt("");
    setCategories([]);
    setGroups([]);
    setSubgroups([]);
    const typeId = parseIdLabel(typeOpt).id;
    if (!typeId) return;
    (async () => {
      try {
        const res = await GetAssetCategories(typeId);
        setCategories(Array.isArray(res) ? res : []);
      } catch (err: any) {
        showToast(`Error Occured ${err?.message || "Request failed"}`, "error");
      }
    })();
  }, [typeOpt]);

  useEffect(() => {
    setGroupOpt("");
    setSubgroupOpt("");
    setGroups([]);
    setSubgroups([]);
    const catId = parseIdLabel(categoryOpt).id;
    if (!catId) return;
    (async () => {
      try {
        const res = await GetAssetGroups(catId);
        setGroups(Array.isArray(res) ? res : []);
      } catch (err: any) {
        showToast(`Error Occured ${err?.message || "Request failed"}`, "error");
      }
    })();
  }, [categoryOpt]);

  useEffect(() => {
    setSubgroupOpt("");
    setSubgroups([]);
    const grpId = parseIdLabel(groupOpt).id;
    if (!grpId) return;
    (async () => {
      try {
        const res = await GetAssetSubgroups(grpId);
        setSubgroups(Array.isArray(res) ? res : []);
      } catch (err: any) {
        showToast(`Error Occured ${err?.message || "Request failed"}`, "error");
      }
    })();
  }, [groupOpt]);

  // assets refresh whenever filters change
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingAssets(true);
      try {
        const params: Record<string, any> = {};
        const locId = parseIdLabel(locationOpt).id;
        const typeId = parseIdLabel(typeOpt).id;
        const catId = parseIdLabel(categoryOpt).id;
        const grpId = parseIdLabel(groupOpt).id;
        const subId = parseIdLabel(subgroupOpt).id;
        if (locId) params.location_id = locId;
        if (typeId) params.asset_type = typeId;
        if (catId) params.category = catId;
        if (grpId) params.group = grpId;
        if (subId) params.subgroup = subId;

        const res = await AllAssetBySite(siteId, params);
        if (!mounted) return;
        setAssets(Array.isArray(res) ? res : []);
      } catch (err: any) {
        showToast(`Error Occured ${err?.message || "Request failed"}`, "error");
      } finally {
        if (mounted) setLoadingAssets(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [siteId, locationOpt, typeOpt, categoryOpt, groupOpt, subgroupOpt]);

  const handleDelete = (id: number) =>
    setAssociations((prev) => prev.filter((entry) => entry.id !== id));

  // Helper functions for cron rule generation
  const toISO = (d: Date) =>
    new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .slice(0, 10);

  const dowIndex = (d: string) =>
    (({ SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 } as any)[d]);

  const buildCronRule = (scope: CronScope, cronData: CronData) => {
    return {
      scope: scope.toUpperCase(),
      days_of_week: (cronData.cronWeeks || []).length
        ? (cronData.cronWeeks || [])
            .map(dowIndex)
            .filter((x) => x !== undefined)
        : [0, 1, 2, 3, 4, 5, 6],
      hours: (cronData.cronHours || [])
        .map((h) => parseInt(h))
        .filter((n) => !Number.isNaN(n)),
      minutes: (cronData.cronMinutes || [])
        .map((m) => parseInt(m))
        .filter((n) => !Number.isNaN(n)),
      timezone: "Asia/Kolkata",
      enabled: true,
    };
  };

  const handleCreateActivity = async () => {
    if (!checklistId || associations.length === 0) return;

    if (dateError) {
      showToast("Please fix date validation errors", "error");
      return;
    }

    const asset_ids = associations.map((a) => a.id);
    const asset_map = associations.reduce<Record<string, string>>((acc, a) => {
      acc[String(a.id)] = a.assetName;
      return acc;
    }, {});
    const user_ids = selectedUserIds;
    const user_map = userOptions
      .filter((u) => user_ids.includes(u.id))
      .reduce<Record<string, string>>((acc, u) => {
        acc[String(u.id)] = u.label;
        return acc;
      }, {});

    const payload = {
      checklist: checklistId,
      asset_ids,
      user_ids,
      asset_map,
      user_map,
      start_date: startDate ? toISO(startDate) : null,
      end_date: endDate ? toISO(endDate) : null,
      cron_rule: buildCronRule(cronScope, cronData),
    };

    try {
      await postChecklistAssociationsBulk(payload);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2500);
    } catch (err: any) {
      showToast(`Error Occured ${err?.message || "Request failed"}`, "error");
    }
  };

  const locationOptions = toOptionStrings(locations);
  const typeOptions = toOptionStrings(assetTypes);
  const categoryOptions = toOptionStrings(categories);
  const groupOptions = toOptionStrings(groups);
  const subgroupOptions = toOptionStrings(subgroups);
  const assetOptions = assets.map((a) => `${a.id} | ${assetLabel(a)}`);

  const userIdToName = (ids: number[]) =>
    userOptions.filter((u) => ids.includes(u.id)).map((u) => u.label);

  const addRow = (assetOpt: string) => {
    const { id: assetId, label } = parseIdLabel(assetOpt);
    if (!assetId) return;
    setAssociations((prev) => {
      if (prev.some((p) => p.id === assetId)) return prev;
      return [
        ...prev,
        {
          id: assetId,
          assetName: label || assetLabel(assets.find((a) => a.id === assetId)),
          assignedTo: userIdToName(selectedUserIds).join(", ") || "-",
        },
      ];
    });
  };

  const tabs = [
    { key: "Assets", label: "Assets" },
    { key: "AMC", label: "AMC" },
    { key: "Checklist", label: "Checklist" },
    { key: "PPM", label: "PPM" },
    { key: "Stock Items", label: "Stock Items" },
  ];

  // Active filters count
  const activeFiltersCount = [
    locationOpt,
    typeOpt,
    categoryOpt,
    groupOpt,
    subgroupOpt,
  ].filter(Boolean).length;

  return (
    <div
      className="p-4 space-y-4"
      style={{ fontFamily: "'PT Sans', sans-serif" }}
    >
      {/* Tabs */}
      <Tabs activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />

      {/* Top action row */}
      <div className="flex gap-2 mb-2">
        <Button>
          <FiPlus className="inline mr-2" />
          Add
        </Button>
        <Button>
          <FiFileText className="inline mr-2" />
          Export
        </Button>

        {/* Filter icon button */}
        <button
          type="button"
          onClick={() => setShowFiltersModal(true)}
          className="ml-auto px-3 py-2 border rounded hover:bg-gray-50 flex items-center gap-2 relative"
          title="Filters"
        >
          <FiFilter />
          <span className="text-sm">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Header with highlighted background */}
      <div className="bg-gray-200 text-center py-3 rounded">
        <h1 className="text-xl font-bold text-gray-800">Associate Checklist</h1>
      </div>

      {/* Date Range Section */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Schedule Duration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Start Date"
            name="startDate"
            value={startDate ? startDate.toISOString().split("T")[0] : ""}
            onChange={handleStartDateChange}
            error={dateError && startDate ? dateError : ""}
          />
          <DatePicker
            label="End Date"
            name="endDate"
            value={endDate ? endDate.toISOString().split("T")[0] : ""}
            onChange={handleEndDateChange}
            min={startDate ? startDate.toISOString().split("T")[0] : ""}
            error={dateError && endDate ? dateError : ""}
          />
        </div>
      </div>

      {/* Cron Settings Section */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Schedule Settings</h3>
        <CronSettingOld
          value={formToOld(cronData, cronScope)}
          onChange={(next: CronOldValue) => {
            const patch = oldToForm(next);
            setCronScope(next.frequency);
            setCronData(patch);
          }}
        />
      </div>

      {/* Selection row - properly aligned */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Asset select */}
        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Asset
          </label>
          <Select
            name="selectAsset"
            placeholder={loadingAssets ? "Loading assets..." : "Select Asset"}
            value={assetSelectValue}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const v = e.target.value;
              if (!v) return; // ignore if somehow empty
              addRow(v); // add to the table
              setAssetSelectValue(""); // reset so placeholder shows again
            }}
            options={assetOptions} // ← no ["", ...assetOptions]
          />
        </div>

        {/* Users multi-select */}
        <div className="md:col-span-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign to Users
          </label>
          <MultiSelectDropdown
            options={userOptions}
            selectedIds={selectedUserIds}
            onChange={setSelectedUserIds}
            placeholder="Select users to assign"
          />
        </div>

        <div className="md:col-span-3">
          <Button
            onClick={handleCreateActivity}
            tooltip="Create Association"
            className="w-full"
            disabled={associations.length === 0 || !!dateError}
          >
            Create Activity
          </Button>
        </div>
      </div>

      {/* Success message */}
      {showSuccessMessage && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white border border-blue-500 shadow-md px-4 py-2 rounded">
            <FiCheckCircle className="text-blue-600 text-xl" />
            <span className="text-blue-700 font-medium">
              Activity Created Successfully
            </span>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-end">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={associations.length}
          onPageChange={setPage}
          showControls={true}
        />
      </div>

      {/* Simple Grid Table */}
      <div className="border rounded">
        <div className="grid grid-cols-3 font-semibold bg-gray-100 p-3 border-b">
          <div>Action</div>
          <div>Asset</div>
          <div>Assigned To</div>
        </div>

        {paginatedAssociations.map((entry) => (
          <div
            key={entry.id}
            className="grid grid-cols-3 items-center p-3 border-b hover:bg-gray-50"
          >
            <div>
              <IconButton
                tooltip="Delete"
                onClick={() => handleDelete(entry.id)}
              >
                <FiTrash2 />
              </IconButton>
            </div>
            <div className="font-medium">{entry.assetName}</div>
            <div className="text-gray-600">
              {entry.assignedTo === "-" ? (
                <span className="text-gray-400 italic">No users assigned</span>
              ) : (
                entry.assignedTo
              )}
            </div>
          </div>
        ))}

        {associations.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FiUsers className="mx-auto text-4xl mb-2" />
            <p>No associations added yet.</p>
          </div>
        )}
      </div>

      {/* Filters Modal */}
      {showFiltersModal && (
        <Modal onClose={() => setShowFiltersModal(false)} title="Filters">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              name="location"
              placeholder="Location"
              value={locationOpt}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setLocationOpt(e.target.value)
              }
              options={["", ...locationOptions]}
            />
            <Select
              name="type"
              placeholder="Asset Type"
              value={typeOpt}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setTypeOpt(e.target.value)
              }
              options={["", ...typeOptions]}
            />
            <Select
              name="category"
              placeholder="Category"
              value={categoryOpt}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setCategoryOpt(e.target.value)
              }
              options={["", ...categoryOptions]}
            />
            <Select
              name="group"
              placeholder="Group"
              value={groupOpt}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setGroupOpt(e.target.value)
              }
              options={["", ...groupOptions]}
            />
            <Select
              name="subgroup"
              placeholder="Subgroup"
              value={subgroupOpt}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSubgroupOpt(e.target.value)
              }
              options={["", ...subgroupOptions]}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setLocationOpt("");
                setTypeOpt("");
                setCategoryOpt("");
                setGroupOpt("");
                setSubgroupOpt("");
              }}
              className="px-3 py-2 border rounded hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              onClick={() => setShowFiltersModal(false)}
              className="px-3 py-2 bg-[#7991BB] text-white rounded"
            >
              Apply
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AssociationBtn;

/* Simple Modal Component */
const Modal: React.FC<{
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative bg-white rounded shadow-xl w-[min(600px,92vw)] max-h-[85vh] overflow-auto p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          onClick={onClose}
          className="px-3 py-1.5 border rounded hover:bg-gray-50"
        >
          Close
        </button>
      </div>
      {children}
    </div>
  </div>
);
