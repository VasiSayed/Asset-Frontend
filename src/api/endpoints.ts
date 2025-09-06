import {
  AccountInstance,
  AssetInstance,
  OperationsInstance,
  VendorInstance,
} from "../api/axiosInstance";

export const GetBuildingsBySite = async (siteId: number) => {
  const url = `/global/buildings/by-site/${siteId}/`;
  const { data } = await AccountInstance.get(url);
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const GetFloorsByBuilding = async (buildingId: number) => {
  const url = `/global/floors/by-building/${buildingId}/`;
  const { data } = await AccountInstance.get(url);
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const GetUnitsByFloor = async (floorId: number) => {
  const url = `/global/units/by-floor/${floorId}/`;
  const { data } = await AccountInstance.get(url);
  return Array.isArray(data) ? data : data?.results ?? [];
};


export const GetBuildingsByID = async (id: number) => {
  if (id == null) return null;
  const { data } = await AccountInstance.get(`/global/buildings/${id}/`);
  return data;
};


export const GetFloorsByID = async (id: number) => {
  if (id == null) return null;
  const { data } = await AccountInstance.get(`/global/floors/${id}/`);
  return data;
};

export const GetUnitsByID = async (id: number) => {
  if (id == null) return null;
  const { data } = await AccountInstance.get(`/global/units/${id}/`);
  return data;
};


export const GlobalLocation = async (siteId: number) => {
  const url = `/Global-locations/by-site/${siteId}/`;
  const { data } = await AssetInstance.get(url);
  return Array.isArray(data) ? data : data?.results ?? [];
};


export const AllAssetBySite = async (
  
  siteId: number,
  queryParams: Record<string, any> = {}
) => {
  const queryString = new URLSearchParams(queryParams).toString();

  const url = `/all-assets/?site_id=${siteId}/${
    queryString ? `?${queryString}` : ""
  }`;

  const { data } = await AssetInstance.get(url);
  return Array.isArray(data) ? data : data?.results ?? [];
};



export const createBulkAsset = (data: any) => {
  return AssetInstance.post("/Bulk-Asset-Create/", data);
};


export const GetAssetTypes = async (siteId?: number) => {
  const url = siteId ? `/asset-types/?site_id=${siteId}` : "/asset-types/";
  const { data } = await AssetInstance.get(url);
  return Array.isArray(data) ? data : data?.results ?? [];
};


export const GetAssetCategories = async (assetTypeId?: number) => {
  const url = assetTypeId
    ? `/asset-categories/?asset_type_id=${assetTypeId}`
    : "/asset-categories/";
  const { data } = await AssetInstance.get(url);
  return Array.isArray(data) ? data : data?.results ?? [];
};


export const GetAssetGroups = async (categoryId?: number) => {
  const url = categoryId
    ? `/asset-groups/?category_id=${categoryId}`
    : "/asset-groups/";
  const { data } = await AssetInstance.get(url);
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const GetAssetSubgroups = async (groupId?: number) => {
  const url = groupId
    ? `/asset-subgroups/?group_id=${groupId}`
    : "/asset-subgroups/";
  const { data } = await AssetInstance.get(url);
  return Array.isArray(data) ? data : data?.results ?? [];
};



export const GetLocationsBySite = async (siteId: number) => {
  const url = `/Global-locations/by-site/${siteId}/`;
  const { data } = await AssetInstance.get(url);
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const GetAssetsByLocation = async (locationId: number) => {
  const url = `/assets/by-location/${locationId}/`;
  const { data } = await AssetInstance.get(url);
  return Array.isArray(data) ? data : data?.results ?? [];
};



export const CreateAMCInAsset = async (
  assetId: number,
  body: any,
  isMultipart = false
) => {
  const url = `/Create-AMC-inAsset/`;

  // Ensure 'asset' gets sent in the body for the new endpoint
  let finalBody: any;
  if (isMultipart) {
    // If caller already built a FormData, just append asset
    if (body instanceof FormData) {
      body.set("asset", String(assetId)); // serializer usually expects 'asset'
      finalBody = body;
    } else {
      const fd = new FormData();
      Object.entries(body || {}).forEach(([k, v]) => fd.append(k, v as any));
      fd.append("asset", String(assetId));
      finalBody = fd;
    }
  } else {
    finalBody = { ...(body || {}), asset: assetId };
  }

  const headers = isMultipart
    ? { "Content-Type": "multipart/form-data" }
    : undefined;

  const { data } = await AssetInstance.post(url, finalBody, { headers });
  return data;
};


export type AMCStatusParams = {
  site_id: number;
  status?: "expired" | "active" | "all";
  kind?: "amc" | "warranty" | "both";
  as?: "amcs" | "assets";
  date?: string;              
  search?: string;
  ordering?: string;        
  page?: number;
  page_size?: number;
};

export const getAMCStatus = async (params: AMCStatusParams) => {
  const { data } = await AssetInstance.get("/asset/status/", { params });
  return data;
};


export type AMCDueFilters = {
  building_id?: number;
  floor_id?: number;
  unit_id?: number;
  asset_type?: number;
  category?: number;
  group?: number;
  subgroup?: number;
  vendor?: string;
  amc_type?: string;
  under_warranty?: boolean | "1" | "0" | "true" | "false" | "yes" | "no";
};

export type AMCDueParams = AMCDueFilters & {
  site_id: number;
  days?: number; 
  as?: "assets" | "amcs"; 
  search?: string;
  ordering?: string; 
  page?: number;
  page_size?: number;
};

export const getAMCDueSoon = async (params: AMCDueParams) => {
  const { data } = await AssetInstance.get("/asset/amc-due/", { params });
  return data;
};

export const getGroup = async () => {
  const { data } = await OperationsInstance.get("/groups/");
  return Array.isArray(data) ? data : data?.results ?? data;
};

export const getSupplier = async () => {
  const { data } = await VendorInstance.get("/vendors/", {
    params: { party_type: "supplier" },
  });
  return Array.isArray(data) ? data : data?.results ?? data;
};

export const getSupervisor = async () => {
  const { data } = await VendorInstance.get("/vendors/", {
    params: { party_type: "vendor" },
  });
  return Array.isArray(data) ? data : data?.results ?? data;
};

export const postChecklistBundle = async (payload: any) => {
  const { data } = await OperationsInstance.post(
    "/checklists/bundle/",
    payload
  );
  return data;
};



export const GetChecklist = async () => {
  const { data } = await OperationsInstance.get(
    "/checklists/with-group-count/",
  );
  return Array.isArray(data) ? data : data?.results ?? data;
};





export const postChecklistAssociationsBulk = async (payload: any) =>
  (await OperationsInstance.post("/checklist-associations/bulk/", payload))
    .data;


export const getUsersWithPermission = async (
  moduleCodes: string | string[]
) => {
  const joined = Array.isArray(moduleCodes)
    ? moduleCodes.join(",")
    : moduleCodes;
  const { data } = await AccountInstance.get("/users/with-permission/", {
    params: { module_codes: joined },
  });
  return data?.users ?? [];
};


// --- Autofill (Google-backed) ---
export async function AutofillAsset(query: string) {
  const res = await AssetInstance.get("/api/assets/autofill/", {
    params: { q: query },
  });
  return res.data as {
    query: string;
    candidates: {
      brand: string;
      model: string;
      capacity_value: string;
      capacity_unit: string;
      purchase_cost: string;
      currency?: string;
      url?: string;
    }[];
  };
}


export const GetAssociationChecklist = async (checklistId: number) => {
  const { data } = await OperationsInstance.get(
    "/checklist-associations/by-checklist",
    { params: { checklist: checklistId } }
  );
  return Array.isArray(data) ? data : data?.results ?? data;
};

// --- measures list for an asset ---
export async function fetchAssetMeasures(
  assetId: number,
  params: { page?: number; page_size?: number } = {}
) {
  const { data } = await AssetInstance.get(`/assets/${assetId}/measures/`, {
    params: { page_size: 1000, ...params },
  });
  return data as {
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<{
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
    }>;
  };
}

// --- create ONE reading ---
export async function createMeasureReading(input: {
  measure: number;              // <-- backend expects `measure`
  reading_value: number;
}) {
  const { data } = await AssetInstance.post(`/measure-readings/`, input);
  return data as {
    id: number;
    measure: number;
    reading_value: string;
    created_at: string;
  };
}

// (optional but recommended) keep a backwards-compatible single-reading helper
// so old call sites that send { measure_id, reading_value } won't break
export const TakeReading = async (
  payload:
    | { measure: number; reading_value: number }
    | { measure_id: number; reading_value: number }
) => {
  const body =
    "measure" in payload
      ? payload
      : { measure: (payload as any).measure_id, reading_value: payload.reading_value };

  const { data } = await AssetInstance.post("/measure-readings/", body);
  return data;
};





export async function getChecklistsByScheduleRun(
  assetId: number,
  params?: { month?: string; date?: string; status?: string }
) {
  const { data } = await OperationsInstance.get(
    "/checklists/by-schedule-run/",
    {
      params: { asset_id: assetId, ...(params || {}) },
    }
  );
  return data;
}

export async function submitRunBulk(
  runId: number,
  payload: { answers: any[]; finalize?: boolean }
) {
  const { data } = await OperationsInstance.post(
    `/runs/${runId}/submit/bulk`,
    payload
  );
  return data;
}




