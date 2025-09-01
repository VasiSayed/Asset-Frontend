// src/pages/AssociationBtn.tsx
import React, { useEffect, useMemo, useState } from "react";
import Select from "../components/Select";
import IconButton from "../components/IconButton";
import Pagination from "../components/Pagination";
import Tabs from "../components/Tabs";

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

const AssociationBtn: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const checklistId = Number(id);

  const siteId =
    Number((window as any)?.site_id) ||
    Number(localStorage.getItem("site_id")) ||
    1;

  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>("Checklist");

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
        // Add PPM navigation if needed
        navigate("/Assetmanagement?tab=PPM");
        break;
      case "Stock Items":
        // Add Stock Items navigation if needed
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
            (u.first_name || u.last_name
              ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
              : u.username) + (u.role_name ? ` • ${u.role_name}` : ""),
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

  const handleCreateActivity = async () => {
    if (!checklistId || associations.length === 0) return;

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
            value={""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              addRow(e.target.value)
            }
            options={["", ...assetOptions]}
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
            disabled={associations.length === 0}
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
