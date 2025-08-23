// src/pages/AssetDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Asset = Record<string, any>;
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-xs uppercase tracking-wide text-gray-500">
    {children}
  </div>
);
const Value: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm text-gray-900">{children ?? "-"}</div>
);
const KV: React.FC<{ label: string; value?: any }> = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <Label>{label}</Label>
    <Value>{value ?? "-"}</Value>
  </div>
);
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="bg-white rounded-2xl shadow p-4 md:p-6">
    <div className="mb-4 text-base md:text-lg font-semibold">{title}</div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);
const pick = (obj: Asset, keys: string[], fallback = "-") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim?.() !== "") return v;
  }
  return fallback;
};

const AssetDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [row, setRow] = useState<Asset | null>(null);

  useEffect(() => {
    const fromState: Asset | null = location?.state?.asset ?? null;
    if (fromState) {
      setRow(fromState);
      sessionStorage.setItem("asset.view", JSON.stringify(fromState));
      return;
    }
    // Fallback on hard refresh:
    const cached = sessionStorage.getItem("asset.view");
    if (cached) {
      try {
        setRow(JSON.parse(cached));
      } catch {
        /* ignore */
      }
    }
  }, [location?.state]);

  const title = useMemo(() => {
    if (!row) return "Asset";
    return pick(row, ["asset_name", "name", "title"], "Asset");
  }, [row]);

  if (!row) {
    return (
      <div className="min-h-screen w-screen px-4 md:px-8 py-6 -mx-4 md:-mx-8">
        <div className="bg-white rounded-2xl shadow p-6">
          No data to show. Open this page via the list’s “View” action.
          <div className="mt-3">
            <button
              className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-screen px-4 md:px-8 py-6 -mx-4 md:-mx-8"
      style={{ fontFamily: "'PT Sans', sans-serif", color: "gray" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
          {title}
        </h1>
        <button
          className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <Section title="General">
          <KV
            label="Asset No."
            value={pick(row, ["asset_no", "assetNo", "number"])}
          />
          <KV
            label="Asset Name"
            value={pick(row, ["asset_name", "name", "title"])}
          />
          <KV
            label="Equipment ID"
            value={pick(row, ["equipment_id", "equipmentId"])}
          />
          <KV
            label="Serial Number"
            value={pick(row, ["serial", "serial_number", "serialNumber"])}
          />
          <KV
            label="OEM / Manufacturer"
            value={pick(row, ["oem_name", "manufacturer", "manufacturer_name"])}
          />
          <KV label="Status" value={pick(row, ["status", "state"])} />
        </Section>

        <Section title="Location">
          <KV label="Site" value={pick(row, ["site_name", "site"])} />
          <KV
            label="Building"
            value={pick(row, ["building_name", "building"])}
          />
          <KV label="Floor" value={pick(row, ["floor_name", "floor"])} />
          <KV
            label="Unit / Room"
            value={pick(row, ["unit_name", "unit", "room"])}
          />
        </Section>

        <Section title="Classification & Specs">
          <KV
            label="Category"
            value={pick(row, ["category_name", "category"])}
          />
          <KV label="Type" value={pick(row, ["type_name", "type"])} />
          <KV label="Group" value={pick(row, ["group_name", "group"])} />
          <KV
            label="Subgroup"
            value={pick(row, ["subgroup_name", "subgroup"])}
          />
          <KV label="Make" value={pick(row, ["make"])} />
          <KV label="Model" value={pick(row, ["model"])} />
        </Section>

        <Section title="Procurement & Warranty">
          <KV
            label="Supplier"
            value={pick(row, ["supplier_name", "supplier"])}
          />
          <KV label="Purchase Date" value={pick(row, ["purchase_date"])} />
          <KV
            label="Purchase Cost"
            value={pick(row, ["purchase_cost", "cost"])}
          />
          <KV
            label="Warranty Upto"
            value={pick(row, ["warranty_upto", "warranty_expiry"])}
          />
          <KV
            label="AMC Vendor"
            value={pick(row, ["amc_vendor", "amc_vendor_name"])}
          />
          <KV
            label="AMC Upto"
            value={pick(row, ["amc_upto", "amc_end_date"])}
          />
        </Section>

        {pick(row, ["description", "remarks", "notes"], "") !== "-" && (
          <Section title="Notes">
            <div className="md:col-span-3 whitespace-pre-wrap text-sm text-gray-800">
              {pick(row, ["description", "remarks", "notes"])}
            </div>
          </Section>
        )}

        {Array.isArray(row?.attachments || row?.files) && (
          <Section title="Attachments">
            {(row?.attachments ?? row?.files).map((f: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <a
                  href={f.url ?? f.file ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {f.name ?? f.filename ?? `File ${idx + 1}`}
                </a>
                {f.size && (
                  <span className="text-xs text-gray-500">({f.size})</span>
                )}
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
};

export default AssetDetails;
