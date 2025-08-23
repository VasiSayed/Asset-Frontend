import { AccountInstance, AssetInstance } from "../api/axiosInstance";

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


