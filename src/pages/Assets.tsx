import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Tabs from "../components/Tabs";
import AssetsTab from "../tabs/Assetmanagement/AssetsList";
import { AllAssetBySite } from "../api/endpoints";
import AMCTab from "../tabs/Assetmanagement/Amctab";
import ChecklistTab from "../tabs/Assetmanagement/Checklist";
import PPMTab from "../tabs/Assetmanagement/PPM/Ppm";
import StockItemsTab from "../tabs/Assetmanagement/Stock/Stockitems";
import { showToast } from "../utils/toast";
import { getAuthState } from "../services/loginService";

type TabType = "Assets" | "AMC" | "Checklist" | "PPM" | "Stock Items";

// header filter keys (match your UI placeholders)
export type Filters = {
  action?: string; // just UI
  asset_name?: string; // "Search Assets"
  building?: string; // "Search Building"  (id or name as your API accepts)
  floor?: string; // "Search Floor"
  unit?: string; // "Search Unit"
  asset_no?: string; // "Search Assets N"
  equipment_id?: string; // "Search Equipment"
  oem_name?: string; // "Search OEM Na"
  serial?: string; // "Serial"
};

const Assets = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("Assets");
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  const tabLabels: TabType[] = [
    "Assets",
    "AMC",
    "Checklist",
    "PPM",
    "Stock Items",
  ];
  const tabItems = tabLabels.map((label) => ({ label, key: label }));

  // read ?tab=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam && tabLabels.includes(tabParam as TabType)) {
      setActiveTab(tabParam as TabType);
    }
  }, [location.search]);

  // wait for token
  const [tokenReady, setTokenReady] = useState(!!getAuthState()?.access_token);
  useEffect(() => {
    if (tokenReady) return;
    const id = setInterval(() => {
      if (getAuthState()?.access_token) {
        setTokenReady(true);
        clearInterval(id);
      }
    }, 150);
    return () => clearInterval(id);
  }, [tokenReady]);

  // OPTIONAL: rename UI filter keys -> API param names (edit if your API needs different names)
  const apiParamMap: Record<keyof Filters, string> = {
    action: "action",
    asset_name: "asset_name",
    building: "building",
    floor: "floor",
    unit: "unit",
    asset_no: "asset_no",
    equipment_id: "equipment_id",
    oem_name: "oem_name",
    serial: "serial",
  };

  const buildParams = (q: Filters) => {
    const out: Record<string, any> = {};
    (Object.keys(q) as (keyof Filters)[]).forEach((k) => {
      const v = q[k];
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        out[apiParamMap[k]] = v;
      }
    });
    return out;
  };

  async function fetchAssets(q: Filters = {}) {
    setLoading(true);
    try {
      const rows = await AllAssetBySite(1, buildParams(q)); // site_id=1
      setAssets(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      console.error(err);
      showToast(`Error Occured ${err?.message || "Request failed"}`, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!tokenReady) return;
    if (activeTab !== "Assets") return;
    fetchAssets(filters);
    
  }, [tokenReady, activeTab]);

  const handleTabChange = (key: string | number) => {
    if (typeof key === "string" && tabLabels.includes(key as TabType)) {
      setActiveTab(key as TabType);
      const next = new URLSearchParams(location.search);
      next.set("tab", key as string);
      navigate({ search: next.toString() }, { replace: true });
    }
  };

  return (
    <div
      style={{ fontFamily: "'PT Sans', sans-serif", color: "gray" }}
      className="min-h-screen w-full px-6 py-6"
    >
      <Tabs
        tabs={tabItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        renderContent={(tab) => {
          if (tab !== "Assets") {
            if (tab === "AMC") return <AMCTab />;
            if (tab === "Checklist") return <ChecklistTab />;
            if (tab === "PPM") return <PPMTab />;
            if (tab === "Stock Items") return <StockItemsTab />;
            return null;
          }
          // Keep SAME UI; columns labels are the ones in your screenshot
          const columns = [
            { key: "asset_name", label: "Assets" },
            {
              key: "building_name",
              label: "Building",
              fallback: "building_id",
            },
            { key: "floor_name", label: "Floor", fallback: "floor_id" },
            { key: "unit_name", label: "Unit", fallback: "unit_id" },
            { key: "asset_no", label: "Assets No." },
            { key: "equipment_id", label: "Equipment ID" },
            { key: "oem_name", label: "OEM Name" },
            { key: "serial", label: "Serial Number" },
          ];
          return (
            <AssetsTab
              assets={assets}
              loading={loading}
              filters={filters}
              onChangeFilters={setFilters}
              onSearch={() => fetchAssets(filters)} // ← Go button triggers API
              columns={columns}
            />
          );
        }}
        orientation="horizontal"
      />
    </div>
  );
};

export default Assets;
