import React, { useEffect, useState } from "react";
import Select from "../components/Select";
import DatePicker from "../components/DatePicker";
import FileUpload from "../components/FileUpload";
import { showToast } from "../utils/toast";
import {
  GetLocationsBySite,
  GetAssetsByLocation,
  CreateAMCInAsset,
} from "../api/endpoints";

type Option = string; // keep "id - label" pattern for Select

const labelToId = (v: string): number | null => {
  if (!v) return null;
  const m = v.match(/^(\d+)\s*-/);
  return m ? Number(m[1]) : null;
};

interface AddAMCFormProps {
  siteId: number; // comes from parent
  onSuccess?: (result?: any) => void;
  onCancel?: () => void;
  title?: string;
}

// 🔹 Static vendor dropdown (same Select component/size)
const vendorOptions = ["Vendor A", "Vendor B", "Vendor C", "Vinay"];

const AddAMCForm: React.FC<AddAMCFormProps> = ({
  siteId,
  onSuccess,
  onCancel,
  title,
}) => {
  const [locations, setLocations] = useState<Option[]>([]);
  const [assets, setAssets] = useState<Option[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const [formData, setFormData] = useState({
    vendor: "", // UI field (required) -> sent as amc_provider
    location: "", // "id - name"
    asset: "", // "id - asset_name"
    startDate: "", // amc_start (required)
    endDate: "", // amc_end   (required)
    file: null as File | null, // amc_terms (optional)
  });

  useEffect(() => {
    (async () => {
      try {
        const locs = await GetLocationsBySite(siteId);
        const opts: Option[] = (locs || []).map(
          (r: any) => `${r.id} - ${r.name}`
        );
        setLocations(opts);
      } catch (e) {
        showToast("Failed to load locations", "error");
        console.error(e);
      }
    })();
  }, [siteId]);

  // load assets when location changes
  useEffect(() => {
    const locId = labelToId(formData.location);
    if (!locId) {
      setAssets([]);
      setFormData((prev) => ({ ...prev, asset: "" }));
      return;
    }
    (async () => {
      try {
        setLoadingAssets(true);
        const rows = await GetAssetsByLocation(locId);
        const opts: Option[] = (rows || []).map(
          (a: any) => `${a.id} - ${a.asset_name}`
        );
        setAssets(opts);
      } catch (e) {
        showToast("Failed to load assets for location", "error");
        console.error(e);
      } finally {
        setLoadingAssets(false);
      }
    })();
  }, [formData.location]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files: FileList | null) => {
    setFormData((prev) => ({ ...prev, file: files?.[0] || null }));
  };

  const validate = (): string | null => {
    if (!formData.vendor.trim()) return "Vendor is required";
    const assetId = labelToId(formData.asset);
    if (!assetId) return "Asset is required";
    if (!formData.startDate) return "AMC Start Date is required";
    if (!formData.endDate) return "AMC End Date is required";
    if (formData.endDate < formData.startDate)
      return "End Date must be after or equal to Start Date";
    return null;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const err = validate();
  if (err) {
    showToast(err, "error");
    return;
  }

  try {
    const assetId = labelToId(formData.asset)!;

    // Build body: multipart if file is present. 'asset' is appended by the endpoint helper.
    let body: any;
    let isMultipart = false;
    if (formData.file) {
      isMultipart = true;
      const fd = new FormData();
      fd.append("amc_provider", formData.vendor); // renamed UI -> backend key
      fd.append("amc_start", formData.startDate);
      fd.append("amc_end", formData.endDate);
      fd.append("amc_terms", formData.file);
      body = fd;
    } else {
      body = {
        amc_provider: formData.vendor,
        amc_start: formData.startDate,
        amc_end: formData.endDate,
      };
    }

    const result = await CreateAMCInAsset(assetId, body, isMultipart);
    showToast("AMC created successfully.", "success");
    onSuccess?.(result);
  } catch (error: any) {
    const msg =
      error?.response?.data?.detail || error?.message || "Request failed";
    showToast(msg, "error");
    console.error(error);
  }
};



  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-md shadow-md max-w-2xl mx-auto"
      style={{ fontFamily: "'PT Sans', sans-serif" }}
    >
      <h2 className="text-lg font-semibold mb-6 text-center border-b pb-2">
        {title || "Add AMC"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Select
          label="Location"
          name="location"
          options={locations}
          value={formData.location}
          onChange={handleInputChange}
        />

        <Select
          label={loadingAssets ? "Assets (loading...)" : "Asset"}
          name="asset"
          options={assets}
          value={formData.asset}
          onChange={handleInputChange}
        />

        {/* 🔹 Renamed to Vendor (static dropdown), same Select size */}
        <Select
          label="Vendor"
          name="vendor"
          options={vendorOptions}
          value={formData.vendor}
          onChange={handleInputChange}
        />

        <DatePicker
          label="Start Date"
          name="startDate"
          value={formData.startDate}
          onChange={handleInputChange}
        />
        <DatePicker
          label="End Date"
          name="endDate"
          value={formData.endDate}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Upload AMC Terms (optional)
        </label>
        <FileUpload onChange={handleFileChange} />
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[#7991BB] text-white px-6 py-2 rounded"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default AddAMCForm;
