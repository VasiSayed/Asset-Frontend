// src/pages/AddAssetForm.tsx
import React, { useState, useEffect } from "react";
import { getAuthState } from "../services/loginService";
import Select from "../components/Select";
import TextInput from "../components/TextInput";
import RadioButton from "../components/RadioButton";
import FileUpload from "../components/FileUpload";
import ToggleSwitch from "../components/ToggleSwitch";
import Accordion from "../components/Accordion";
import DatePicker from "../components/DatePicker";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import Tabs from "../components/Tabs";

import {
  createBulkAsset,
  GetAssetTypes,
  GetAssetCategories,
  GetAssetGroups,
  GetAssetSubgroups,
  GetBuildingsBySite,
  GetFloorsByBuilding,
  GetUnitsByFloor,
  GlobalLocation,
} from "../api/endpoints";

import { showToast } from "../utils/toast";

type TabType = "Assets" | "AMC" | "Checklist" | "PPM" | "Stock Items";

interface AddAssetFormProps {
  initialData?: any;
  onClose?: () => void;
}

// ✅ keep only these simple placeholder lists (others are dynamic via state)
const vendorOptions = ["Vendor 1", "Vendor 2"];
const poOptions = ["PO 1", "PO 2"];
const specialOptions = ["Manual", "Choose"];

const departmentOptions = ["Department 1", "Department 2"];
const unitTypeOptions = ["Unit 1", "Unit 2"];

// ✅ NEW: backend needs site_id when using building/floor/unit
const SITE_ID = 1;

type RadioOption = { label: string; value: string };

type MeasureRow = {
  name: string;
  unitType: string;
  min: string;
  max: string;
  alertBelow: string;
  alertAbove: string;
  multiplier: string;
  checkPrevious: boolean;
  [key: string]: string | boolean;
};

type FileState = {
  invoice: FileList | null;
  insurance: FileList | null;
  manuals: FileList | null;
  other: FileList | null;
};

const AddAssetForm: React.FC<AddAssetFormProps> = ({
  initialData,
  onClose,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("Assets");
  const [assetTypeOptions, setAssetTypeOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [subGroupOptions, setSubGroupOptions] = useState<string[]>([]);

  const [buildingOptions, setBuildingOptions] = useState<string[]>([]);
  const [floorOptions, setFloorOptions] = useState<string[]>([]);
  const [unitOptions, setUnitOptions] = useState<string[]>([]);

  const [form, setForm] = useState({
    building: "",
    floor: "",
    unit: "",
    vendor: "",
    po: "",
    latitude: "0",
    longitude: "0",
    altitude: "0",
    breakdown: false,
    inUse: false,
    assetName: "",
    brand: "",
    model: "",
    serial: "",
    assetType: "",
    category: "",
    group: "",
    subGroup: "",
    capacity: "",
    capacityUnit: "",
    department: "",
    critical: "No",
    assetReading: "No",
    compliance: "No",
    locationName: "",
  });

  const [files, setFiles] = useState<FileState>({
    invoice: null,
    insurance: null,
    manuals: null,
    other: null,
  });

  const [purchase, setPurchase] = useState({
    cost: "",
    poNumber: "",
    purchaseDate: "",
    endOfLife: "",
    vendorName: "",
  });

  const [warranty, setWarranty] = useState({
    warrantyType: "",
    warrantyStart: "",
    warrantyEnd: "",
    underWarranty: "",
    amcType: "",
    amcStart: "",
    amcEnd: "",
    amcProvider: "",
  });

  const [additional, setAdditional] = useState({
    maintainedBy: "",
    monitoredBy: "",
    managedBy: "",
  });

  const [consumptionMeasures, setConsumptionMeasures] = useState<MeasureRow[]>([
    {
      name: "",
      unitType: "",
      min: "",
      max: "",
      alertBelow: "",
      alertAbove: "",
      multiplier: "",
      checkPrevious: false,
    },
  ]);
  const [nonConsumptionMeasures, setNonConsumptionMeasures] = useState<
    MeasureRow[]
  >([
    {
      name: "",
      unitType: "",
      min: "",
      max: "",
      alertBelow: "",
      alertAbove: "",
      multiplier: "",
      checkPrevious: false,
    },
  ]);

  const yesNoToBool = (v: string) => v === "Yes";
  const emptyToNull = (v: string) => (v?.trim() ? v : null);
  const numOrNull = (v: string) => (v?.trim() ? Number(v) : null);

  const labelToId = (v: string): number | null => {
    if (!v) return null;
    const m = v.match(/\d+/);
    return m ? Number(m[0]) : null;
  };
  const mustId = (label: string, fieldLabel: string): number => {
    const id = labelToId(label);
    if (!id) throw new Error(`${fieldLabel} is required`);
    return id;
  };

  // ------------------ useEffects ------------------
  useEffect(() => {
    (async () => {
      try {
        const data = await GetAssetTypes(SITE_ID);
        setAssetTypeOptions(data.map((t: any) => `${t.id} - ${t.name}`));
      } catch (err) {
        showToast("❌ Failed to load Asset Types", "error");
        console.error(err);
      }
    })();
  }, []);

  useEffect(() => {
    if (form.assetType) {
      (async () => {
        try {
          const id = labelToId(form.assetType);
          const data = await GetAssetCategories(id!);
          setCategoryOptions(data.map((c: any) => `${c.id} - ${c.name}`));
        } catch {
          showToast("❌ Failed to load Categories", "error");
        }
      })();
    } else {
      setCategoryOptions([]);
    }
  }, [form.assetType]);

  useEffect(() => {
    if (form.category) {
      (async () => {
        try {
          const id = labelToId(form.category);
          const data = await GetAssetGroups(id!);
          setGroupOptions(data.map((g: any) => `${g.id} - ${g.name}`));
        } catch {
          showToast("❌ Failed to load Groups", "error");
        }
      })();
    } else {
      setGroupOptions([]);
    }
  }, [form.category]);

  useEffect(() => {
    if (form.group) {
      (async () => {
        try {
          const id = labelToId(form.group);
          const data = await GetAssetSubgroups(id!);
          setSubGroupOptions(data.map((sg: any) => `${sg.name}`));
          
        } catch {
          showToast("❌ Failed to load Subgroups", "error");
        }
      })();
    } else {
      setSubGroupOptions([]);
    }
  }, [form.group]);

  // Optional: allow "Choose" to fetch GlobalLocation list (kept logic, UI unchanged)
  useEffect(() => {
    if (form.building === "Choose") {
      (async () => {
        try {
          const data = await GlobalLocation(SITE_ID);
          setBuildingOptions([
            ...specialOptions,
            ...data.map((loc: any) => `${loc.id} - ${loc.name}`),
          ]);
        } catch {
          showToast("❌ Failed to load Global Locations", "error");
        }
      })();
    }
  }, [form.building]);

  useEffect(() => {
    (async () => {
      try {
        const data = await GetBuildingsBySite(SITE_ID);
        const opts = data.map((b: any) => `${b.id} - ${b.name}`);
        setBuildingOptions([...specialOptions, ...opts]);
      } catch {
        showToast("❌ Failed to load Buildings", "error");
      }
    })();
  }, []);

  // load floors when building selected
  useEffect(() => {
    if (form.building) {
      (async () => {
        try {
          const buildingId = labelToId(form.building)!;
          const data = await GetFloorsByBuilding(buildingId);
          setFloorOptions(data.map((f: any) => `${f.id} - ${f.name}`));
        } catch {
          showToast("❌ Failed to load Floors", "error");
        }
      })();
    } else setFloorOptions([]);
  }, [form.building]);

  // load units when floor selected
  useEffect(() => {
    if (form.floor) {
      (async () => {
        try {
          const floorId = labelToId(form.floor)!;
          const data = await GetUnitsByFloor(floorId);
          setUnitOptions(data.map((u: any) => `${u.id} - ${u.name}`));
        } catch {
          showToast("❌ Failed to load Units", "error");
        }
      })();
    } else setUnitOptions([]);
  }, [form.floor]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" && "checked" in e.target
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleRadio = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (name: keyof FileState, fileList: FileList | null) => {
    setFiles((prev) => ({ ...prev, [name]: fileList }));
  };

  const handleMeasureChange = (
    type: "consumption" | "nonConsumption",
    idx: number,
    field: string,
    value: any
  ) => {
    if (type === "consumption") {
      const updated = [...consumptionMeasures];
      updated[idx][field] = value;
      setConsumptionMeasures(updated);
    } else {
      const updated = [...nonConsumptionMeasures];
      updated[idx][field] = value;
      setNonConsumptionMeasures(updated);
    }
  };

  const addMeasureRow = (type: "consumption" | "nonConsumption") => {
    const newRow: MeasureRow = {
      name: "",
      unitType: "",
      min: "",
      max: "",
      alertBelow: "",
      alertAbove: "",
      multiplier: "",
      checkPrevious: false,
    };
    if (type === "consumption")
      setConsumptionMeasures([...consumptionMeasures, newRow]);
    else setNonConsumptionMeasures([...nonConsumptionMeasures, newRow]);
  };

  const removeMeasureRow = (
    type: "consumption" | "nonConsumption",
    idx: number
  ) => {
    if (type === "consumption") {
      setConsumptionMeasures(consumptionMeasures.filter((_, i) => i !== idx));
    } else {
      setNonConsumptionMeasures(
        nonConsumptionMeasures.filter((_, i) => i !== idx)
      );
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // ✅ add location validation so we don't submit incomplete location
  const validateForm = () => {
    if (!form.assetName.trim()) return "Asset Name is required";
    if (!labelToId(form.assetType)) return "Asset Type is required";
    if (!labelToId(form.category)) return "Category is required";
    if (!labelToId(form.group)) return "Group is required";
    if (!labelToId(form.subGroup)) return "Subgroup is required";
    if (!form.department.trim()) return "Department is required";

    if (
      !labelToId(form.building) ||
      !labelToId(form.floor) ||
      !labelToId(form.unit)
    ) {
      return "Location is required: select Building, Floor, and Unit";
    }

    if (!form.serial.trim()) return "Serial Number is required";
    const serialRegex = /^[A-Z0-9\-]{5,20}$/i;
    if (!serialRegex.test(form.serial.trim())) {
      return "Serial Number must be 5–20 characters, letters/numbers/dashes only";
    }
    return null;
  };

  // ---------- submit ----------
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      showToast(errorMsg, "error");
      return;
    }

    const auth = getAuthState();
    const perms = auth?.permissions?.asset;
    if (!perms || !(perms.all || perms.add)) {
      showToast(
        `🚫 User "${
          auth?.tenant?.username || "unknown"
        }" is not permitted to add assets.`,
        "error"
      );
      return;
    }

    try {
      const assetTypeId = mustId(form.assetType, "Asset Type");
      const categoryId = mustId(form.category, "Category");
      const groupId = mustId(form.group, "Group");
      const subGroupId = mustId(form.subGroup, "Subgroup");
      const departmentName = form.department.trim();

      const Asset = {
        // ✅ include site_id to satisfy backend location requirement
        site_id: SITE_ID,

        building_id: labelToId(form.building),
        floor_id: labelToId(form.floor),
        unit_id: labelToId(form.unit),
        vendor_id: labelToId(form.vendor),
        po_id: labelToId(form.po),

        latitude: emptyToNull(form.latitude || ""),
        longitude: emptyToNull(form.longitude || ""),
        altitude: emptyToNull(form.altitude || ""),

        location_name: emptyToNull(form.locationName),

        asset_name: form.assetName,
        brand: emptyToNull(form.brand),
        model: emptyToNull(form.model),
        serial: emptyToNull(form.serial),

        asset_type: assetTypeId,
        category: categoryId,
        group: groupId,
        subgroup: subGroupId,

        capacity: emptyToNull(form.capacity),
        capacity_unit: emptyToNull(form.capacityUnit),

        department: departmentName,

        critical: yesNoToBool(form.critical),
        asset_reading: yesNoToBool(form.assetReading),
        compliance: yesNoToBool(form.compliance),
        breakdown: !!form.breakdown,
        in_use: !!form.inUse,

        maintained_by: numOrNull(additional.maintainedBy),
        monitored_by: numOrNull(additional.monitoredBy),
        managed_by: numOrNull(additional.managedBy),
      };

      const AssetPurchaseInfo =
        purchase.cost ||
        purchase.poNumber ||
        purchase.purchaseDate ||
        purchase.endOfLife ||
        purchase.vendorName
          ? {
              cost: purchase.cost ? Number(purchase.cost) : 0,
              po_number: purchase.poNumber,
              purchase_date: emptyToNull(purchase.purchaseDate),
              end_of_life: emptyToNull(purchase.endOfLife),
              vendor_name: emptyToNull(purchase.vendorName),
            }
          : null;

      const AssetWarrantyAMC =
        warranty.warrantyType ||
        warranty.warrantyStart ||
        warranty.warrantyEnd ||
        warranty.underWarranty ||
        warranty.amcType ||
        warranty.amcStart ||
        warranty.amcEnd ||
        warranty.amcProvider
          ? {
              warranty_type: emptyToNull(warranty.warrantyType),
              warranty_start: emptyToNull(warranty.warrantyStart),
              warranty_end: emptyToNull(warranty.warrantyEnd),
              under_warranty: yesNoToBool(warranty.underWarranty),
              amc_type: emptyToNull(warranty.amcType),
              amc_start: emptyToNull(warranty.amcStart),
              amc_end: emptyToNull(warranty.amcEnd),
              amc_provider: emptyToNull(warranty.amcProvider),
            }
          : null;

      const mapRow = (r: MeasureRow) => ({
        name: r.name,
        unit_type: r.unitType,
        min_value: emptyToNull(r.min),
        max_value: emptyToNull(r.max),
        alert_below: emptyToNull(r.alertBelow),
        alert_above: emptyToNull(r.alertAbove),
        multiplier: emptyToNull(r.multiplier),
        check_previous: !!r.checkPrevious,
      });

      const consumption = consumptionMeasures
        .filter((m) => m.name || m.unitType)
        .map(mapRow);
      const non_consumption = nonConsumptionMeasures
        .filter((m) => m.name || m.unitType)
        .map(mapRow);

      const AssetMeasure =
        consumption.length || non_consumption.length
          ? { consumption, non_consumption }
          : null;

      const AssetAttachment: any[] = [];

      const payload: any = { Asset };
      if (AssetPurchaseInfo) payload.AssetPurchaseInfo = AssetPurchaseInfo;
      if (AssetWarrantyAMC) payload.AssetWarrantyAMC = AssetWarrantyAMC;
      if (AssetMeasure) payload.AssetMeasure = AssetMeasure;
      if (AssetAttachment.length) payload.AssetAttachment = AssetAttachment;

      const resp = await createBulkAsset(payload);
      showToast("Asset created successfully.", "success");
      navigate("/assetmanagement");
      onClose?.();
    } catch (err: any) {
      if (
        typeof err?.message === "string" &&
        err.message.includes("required")
      ) {
        showToast(err.message, "error");
        return;
      }
      const data = err?.response?.data;
      const detail =
        data?.detail || data?.message || err?.message || "Request failed";
      const stage = data?.stage ? ` (${data.stage})` : "";
      showToast(`Error: ${detail}${stage}`, "error");
      console.error("❌ Create asset failed:", err);
    }
  };

  const yesNoOptions: RadioOption[] = [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
  ];

  const accordionItems = [
    {
      title: "Asset Info",
      content: (
        <div
          className="bg-white p-4"
          style={{ fontFamily: "'PT Sans', sans-serif" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput
              label="Asset Name"
              name="assetName"
              value={form.assetName}
              onChange={handleChange}
            />
            <TextInput
              label="Brand"
              name="brand"
              value={form.brand}
              onChange={handleChange}
            />
            <TextInput
              label="Model"
              name="model"
              value={form.model}
              onChange={handleChange}
            />
            <TextInput
              label="Serial Number"
              name="serial"
              value={form.serial}
              onChange={handleChange}
            />
            <Select
              label="Asset Type"
              name="assetType"
              options={assetTypeOptions}
              value={form.assetType}
              onChange={handleChange}
            />
            <Select
              label="Category"
              name="category"
              options={categoryOptions}
              value={form.category}
              onChange={handleChange}
            />
            <Select
              label="Group"
              name="group"
              options={groupOptions}
              value={form.group}
              onChange={handleChange}
            />
            <Select
              label="Sub Group"
              name="subGroup"
              options={subGroupOptions}
              value={form.subGroup}
              onChange={handleChange}
            />
            <TextInput
              label="Capacity"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
            />
            <TextInput
              label="Capacity Unit"
              name="capacityUnit"
              value={form.capacityUnit}
              onChange={handleChange}
            />
            <Select
              label="Department"
              name="department"
              options={departmentOptions}
              value={form.department}
              onChange={handleChange}
            />
            <RadioButton
              label="Critical Asset"
              name="critical"
              options={yesNoOptions}
              value={form.critical}
              onChange={({ target }) => handleRadio("critical", target.value)}
            />
            <RadioButton
              label="Asset Reading"
              name="assetReading"
              options={yesNoOptions}
              value={form.assetReading}
              onChange={({ target }) =>
                handleRadio("assetReading", target.value)
              }
            />
            <RadioButton
              label="Compliance"
              name="compliance"
              options={yesNoOptions}
              value={form.compliance}
              onChange={({ target }) => handleRadio("compliance", target.value)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Purchase Information",
      content: (
        <div
          className="bg-white p-4"
          style={{ fontFamily: "'PT Sans', sans-serif" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextInput
              label="Purchase Cost"
              name="cost"
              value={purchase.cost}
              onChange={(e) =>
                setPurchase({ ...purchase, cost: e.target.value })
              }
            />
            <TextInput
              label="PO Number"
              name="poNumber"
              value={purchase.poNumber}
              onChange={(e) =>
                setPurchase({ ...purchase, poNumber: e.target.value })
              }
            />
            <DatePicker
              label="Purchase Date"
              name="purchaseDate"
              value={purchase.purchaseDate}
              onChange={(e) =>
                setPurchase({ ...purchase, purchaseDate: e.target.value })
              }
            />
            <TextInput
              label="End of Life"
              name="endOfLife"
              value={purchase.endOfLife}
              onChange={(e) =>
                setPurchase({ ...purchase, endOfLife: e.target.value })
              }
            />
            <div className="col-span-2">
              <TextInput
                label="Vendor Name"
                name="vendorName"
                value={purchase.vendorName}
                onChange={(e) =>
                  setPurchase({ ...purchase, vendorName: e.target.value })
                }
              />
            </div>
            <div className="col-span-2 flex items-end">
              <button
                type="button"
                className="bg-blue-400 text-white px-4 py-2 rounded"
              >
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "AMC Warranty Information",
      content: (
        <div
          className="bg-white p-4"
          style={{ fontFamily: "'PT Sans', sans-serif" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextInput
              label="Warranty Type"
              name="warrantyType"
              value={warranty.warrantyType}
              onChange={(e) =>
                setWarranty({ ...warranty, warrantyType: e.target.value })
              }
            />
            <DatePicker
              label="Warranty Start Date"
              name="warrantyStart"
              value={warranty.warrantyStart}
              onChange={(e) =>
                setWarranty({ ...warranty, warrantyStart: e.target.value })
              }
            />
            <DatePicker
              label="Warranty End Date"
              name="warrantyEnd"
              value={warranty.warrantyEnd}
              onChange={(e) =>
                setWarranty({ ...warranty, warrantyEnd: e.target.value })
              }
            />
            <RadioButton
              label="Under Warranty"
              name="underWarranty"
              options={yesNoOptions}
              value={warranty.underWarranty}
              onChange={({ target }) =>
                setWarranty({ ...warranty, underWarranty: target.value })
              }
            />
            <TextInput
              label="AMC Type"
              name="amcType"
              value={warranty.amcType}
              onChange={(e) =>
                setWarranty({ ...warranty, amcType: e.target.value })
              }
            />
            <DatePicker
              label="AMC Start Date"
              name="amcStart"
              value={warranty.amcStart}
              onChange={(e) =>
                setWarranty({ ...warranty, amcStart: e.target.value })
              }
            />
            <DatePicker
              label="AMC End Date"
              name="amcEnd"
              value={warranty.amcEnd}
              onChange={(e) =>
                setWarranty({ ...warranty, amcEnd: e.target.value })
              }
            />
            <TextInput
              label="AMC Provider Company Name"
              name="amcProvider"
              value={warranty.amcProvider}
              onChange={(e) =>
                setWarranty({ ...warranty, amcProvider: e.target.value })
              }
            />
          </div>
        </div>
      ),
    },
    {
      title: "Maintenance Information",
      content: (
        <div
          className="bg-white p-4"
          style={{ fontFamily: "'PT Sans', sans-serif" }}
        >
          <div className="mb-4">
            <div className="font-semibold mb-2">Consumption Asset Measure:</div>
            {consumptionMeasures.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-9 gap-2 items-center mb-2"
              >
                <TextInput
                  label="Name"
                  name="name"
                  value={row.name as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "consumption",
                      idx,
                      "name",
                      e.target.value
                    )
                  }
                />
                <Select
                  label="Select Unit:"
                  name="unit"
                  options={unitOptions}
                  value={row.unitType as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "consumption",
                      idx,
                      "unitType",
                      e.target.value
                    )
                  }
                />
                {/* <Select
                  label="Unit Type"
                  name="unitType"
                  options={unitTypeOptions}
                  value={row.unitType as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "consumption",
                      idx,
                      "unitType",
                      e.target.value
                    )
                  }
                /> */}
                <TextInput
                  label="Min"
                  name="min"
                  value={row.min as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "consumption",
                      idx,
                      "min",
                      e.target.value
                    )
                  }
                />
                <TextInput
                  label="Max"
                  name="max"
                  value={row.max as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "consumption",
                      idx,
                      "max",
                      e.target.value
                    )
                  }
                />
                <TextInput
                  label="Alert Below Value"
                  name="alertBelow"
                  value={row.alertBelow as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "consumption",
                      idx,
                      "alertBelow",
                      e.target.value
                    )
                  }
                />
                <TextInput
                  label="Alert Above Value"
                  name="alertAbove"
                  value={row.alertAbove as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "consumption",
                      idx,
                      "alertAbove",
                      e.target.value
                    )
                  }
                />
                <TextInput
                  label="Multiplier Factor"
                  name="multiplier"
                  value={row.multiplier as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "consumption",
                      idx,
                      "multiplier",
                      e.target.value
                    )
                  }
                />
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={row.checkPrevious as boolean}
                    onChange={(e) =>
                      handleMeasureChange(
                        "consumption",
                        idx,
                        "checkPrevious",
                        e.target.checked
                      )
                    }
                  />
                  <span className="ml-1 text-xs">Check Previous Reading</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeMeasureRow("consumption", idx)}
                  className="text-red-500 text-lg"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addMeasureRow("consumption")}
              className="text-blue-500 text-xl"
            >
              ＋
            </button>
          </div>
          <div>
            <div className="font-semibold mb-2">
              Non Consumption Asset Measure:
            </div>
            {nonConsumptionMeasures.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-9 gap-2 items-center mb-2"
              >
                <TextInput
                  label="Name"
                  name="name"
                  value={row.name as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "nonConsumption",
                      idx,
                      "name",
                      e.target.value
                    )
                  }
                />
                <Select
                  label="Unit Type"
                  name="unitType"
                  options={unitTypeOptions}
                  value={row.unitType as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "nonConsumption",
                      idx,
                      "unitType",
                      e.target.value
                    )
                  }
                />
                <TextInput
                  label="Min"
                  name="min"
                  value={row.min as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "nonConsumption",
                      idx,
                      "min",
                      e.target.value
                    )
                  }
                />
                <TextInput
                  label="Max"
                  name="max"
                  value={row.max as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "nonConsumption",
                      idx,
                      "max",
                      e.target.value
                    )
                  }
                />
                <TextInput
                  label="Alert Below Value"
                  name="alertBelow"
                  value={row.alertBelow as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "nonConsumption",
                      idx,
                      "alertBelow",
                      e.target.value
                    )
                  }
                />
                <TextInput
                  label="Alert Above Value"
                  name="alertAbove"
                  value={row.alertAbove as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "nonConsumption",
                      idx,
                      "alertAbove",
                      e.target.value
                    )
                  }
                />
                <TextInput
                  label="Multiplier Factor"
                  name="multiplier"
                  value={row.multiplier as string}
                  onChange={(e) =>
                    handleMeasureChange(
                      "nonConsumption",
                      idx,
                      "multiplier",
                      e.target.value
                    )
                  }
                />
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={row.checkPrevious as boolean}
                    onChange={(e) =>
                      handleMeasureChange(
                        "nonConsumption",
                        idx,
                        "checkPrevious",
                        e.target.checked
                      )
                    }
                  />
                  <span className="ml-1 text-xs">Check Previous Reading</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeMeasureRow("nonConsumption", idx)}
                  className="text-red-500 text-lg"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addMeasureRow("nonConsumption")}
              className="text-blue-500 text-xl"
            >
              ＋
            </button>
          </div>
        </div>
      ),
    },
    {
      title: "Additional Information",
      content: (
        <div
          className="bg-white p-4"
          style={{ fontFamily: "'PT Sans', sans-serif" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput
              label="Maintained By"
              name="maintainedBy"
              value={additional.maintainedBy}
              onChange={(e) =>
                setAdditional({ ...additional, maintainedBy: e.target.value })
              }
            />
            <TextInput
              label="Monitored By"
              name="monitoredBy"
              value={additional.monitoredBy}
              onChange={(e) =>
                setAdditional({ ...additional, monitoredBy: e.target.value })
              }
            />
            <TextInput
              label="Managed By"
              name="managedBy"
              value={additional.managedBy}
              onChange={(e) =>
                setAdditional({ ...additional, managedBy: e.target.value })
              }
            />
          </div>
        </div>
      ),
    },
    {
      title: "Attachments",
      content: (
        <div
          className="bg-white p-4"
          style={{ fontFamily: "'PT Sans', sans-serif" }}
        >
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="mb-2 font-medium">Purchase Invoice</div>
                <FileUpload
                  name="invoice"
                  label=""
                  onChange={(files) => handleFile("invoice", files)}
                />
              </div>
              <div>
                <div className="mb-2 font-medium">Insurance Details</div>
                <FileUpload
                  name="insurance"
                  label=""
                  onChange={(files) => handleFile("insurance", files)}
                />
              </div>
              <div>
                <div className="mb-2 font-medium">Manuals</div>
                <FileUpload
                  name="manuals"
                  label=""
                  onChange={(files) => handleFile("manuals", files)}
                />
              </div>
              <div>
                <div className="mb-2 font-medium">Other Files</div>
                <FileUpload
                  name="other"
                  label=""
                  onChange={(files) => handleFile("other", files)}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      className="bg-white p-6 rounded shadow-md w-full max-w-6xl mx-auto"
    >
      {!initialData && (
        <div className="mb-4">
          <Tabs
            tabs={[
              { label: "Assets", key: "Assets" },
              { label: "AMC", key: "AMC" },
              { label: "Checklist", key: "Checklist" },
              { label: "PPM", key: "PPM" },
              { label: "Stock Items", key: "Stock Items" },
            ]}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as TabType)}
          />
        </div>
      )}

      {/* Debug Section - Remove in production */}
      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">
          Debug Info (Remove in production)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>Asset Type:</strong> {form.assetType || "Not selected"}
            <br />
            <strong>Options:</strong> {assetTypeOptions.length}
          </div>
          <div>
            <strong>Category:</strong> {form.category || "Not selected"}
            <br />
            <strong>Options:</strong> {categoryOptions.length}
          </div>
          <div>
            <strong>Group:</strong> {form.group || "Not selected"}
            <br />
            <strong>Options:</strong> {groupOptions.length}
          </div>
          <div>
            <strong>Subgroup:</strong> {form.subGroup || "Not selected"}
            <br />
            <strong>Options:</strong> {subGroupOptions.length}
          </div>
        </div>
      </div>

      <div
        className="mb-4 border-b-4 border-gray-300 pb-2"
        style={{ fontFamily: "'PT Sans', sans-serif" }}
      >
        <h2 className="text-lg font-semibold text-center bg-gray-200 py-1 mb-4">
          Location Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div onClick={handleDropdownClick}>
            <Select
              label="Select Building:"
              name="building"
              options={buildingOptions}
              value={form.building}
              onChange={handleChange}
            />
          </div>
          <div onClick={handleDropdownClick}>
            <Select
              label="Select Floor:"
              name="floor"
              options={floorOptions}
              value={form.floor}
              onChange={handleChange}
            />
          </div>
          <div onClick={handleDropdownClick}>
            <Select
              label="Select Unit:"
              name="unit"
              options={unitOptions}
              value={form.unit}
              onChange={handleChange}
            />
          </div>
          <TextInput
            label="Location Name"
            name="locationName"
            value={form.locationName}
            onChange={handleChange}
          />
          <TextInput
            label="Latitude:"
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
          />
          <TextInput
            label="Longitude:"
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
          />
          <TextInput
            label="Altitude:"
            name="altitude"
            value={form.altitude}
            onChange={handleChange}
          />
          <div onClick={handleDropdownClick}>
            <Select
              label="Existing Vendor"
              name="vendor"
              options={vendorOptions}
              value={form.vendor}
              onChange={handleChange}
            />
          </div>
          <div onClick={handleDropdownClick}>
            <Select
              label="PO Number:"
              name="po"
              options={poOptions}
              value={form.po}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-8 mt-4">
          <div className="flex items-center gap-2">
            <span>Breakdown</span>
            <ToggleSwitch
              checked={form.breakdown}
              onChange={(checked) =>
                setForm((f) => ({ ...f, breakdown: checked }))
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <span>In Use</span>
            <ToggleSwitch
              checked={form.inUse}
              onChange={(checked) => setForm((f) => ({ ...f, inUse: checked }))}
            />
          </div>
        </div>
      </div>

      <Accordion items={accordionItems} />

      <div
        className="mt-8 flex justify-center"
        style={{ fontFamily: "'PT Sans', sans-serif" }}
      >
        <button
          type="button"
          onClick={handleFormSubmit}
          className="submit-button bg-[#7991BB] text-white text-xl px-16 py-3 rounded hover:bg-blue-500 transition-colors"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default AddAssetForm;
