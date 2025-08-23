import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import NoDataFound from "../../components/NoDataFound";
import TableHead from "../../components/TopHead";
import Pagination from "../../components/Pagination";
import AddAssetForm from "../../forms/AddAssetForm";
import IconButton from "../../components/IconButton";
import { useNavigate } from "react-router-dom";
import {
  GetBuildingsByID,
  GetFloorsByID,
  GetUnitsByID,
} from "../../api/endpoints";

const PAGE_SIZE = 10;

type Props = { assets: any[]; loading?: boolean };

// normalize header label → object key: e.g. "Asset No." -> "assetno"
const keyFromLabel = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]/g, "");

const AssetsTab: React.FC<Props> = ({ assets, loading = false }) => {
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const navigate = useNavigate();

  // ORDER EXACTLY AS REQUESTED (removed Equipment ID & OEM Name)
  const columns = [
    "Action",
    "Asset No.",
    "Assets",
    "Building",
    "Floor",
    "Unit",
    "Serial Number",
  ];

  // caches for id→name
  const [buildingNameById, setBuildingNameById] = useState<
    Record<string, string>
  >({});
  const [floorNameById, setFloorNameById] = useState<Record<string, string>>(
    {}
  );
  const [unitNameById, setUnitNameById] = useState<Record<string, string>>({});

  function onView(row: any) {
    sessionStorage.setItem("asset.view", JSON.stringify(row)); // survive refresh
    navigate("/assets/view", { state: { asset: row } });
  }
  // collect unique IDs present
  const need = useMemo(() => {
    const b = new Set<string>(),
      f = new Set<string>(),
      u = new Set<string>();
    (assets ?? []).forEach((r: any) => {
      if (r?.building_id != null) b.add(String(r.building_id));
      if (r?.floor_id != null) f.add(String(r.floor_id));
      if (r?.unit_id != null) u.add(String(r.unit_id));
    });
    return { b, f, u };
  }, [assets]);

  // fetch missing building names
  useEffect(() => {
    const missing = [...need.b].filter((id) => !(id in buildingNameById));
    if (!missing.length) return;
    (async () => {
      const pairs = await Promise.all(
        missing.map(async (id) => {
          try {
            const d = await GetBuildingsByID(Number(id));
            return [id, d?.name ?? id] as const;
          } catch {
            return [id, id] as const;
          }
        })
      );
      setBuildingNameById((prev) =>
        Object.assign({}, prev, Object.fromEntries(pairs))
      );
    })();
  }, [need.b, buildingNameById]);

  // fetch missing floor names
  useEffect(() => {
    const missing = [...need.f].filter((id) => !(id in floorNameById));
    if (!missing.length) return;
    (async () => {
      const pairs = await Promise.all(
        missing.map(async (id) => {
          try {
            const d = await GetFloorsByID(Number(id));
            return [id, d?.name ?? id] as const;
          } catch {
            return [id, id] as const;
          }
        })
      );
      setFloorNameById((prev) =>
        Object.assign({}, prev, Object.fromEntries(pairs))
      );
    })();
  }, [need.f, floorNameById]);

  // fetch missing unit names
  useEffect(() => {
    const missing = [...need.u].filter((id) => !(id in unitNameById));
    if (!missing.length) return;
    (async () => {
      const pairs = await Promise.all(
        missing.map(async (id) => {
          try {
            const d = await GetUnitsByID(Number(id));
            return [id, d?.name ?? id] as const;
          } catch {
            return [id, id] as const;
          }
        })
      );
      setUnitNameById((prev) =>
        Object.assign({}, prev, Object.fromEntries(pairs))
      );
    })();
  }, [need.u, unitNameById]);

  // normalize each API row to what the renderer expects
  const displayData = useMemo(() => {
    return (assets ?? []).map((r: any) => {
      const bId = r?.building_id != null ? String(r.building_id) : undefined;
      const fId = r?.floor_id != null ? String(r.floor_id) : undefined;
      const uId = r?.unit_id != null ? String(r.unit_id) : undefined;

      const building =
        r.building_name ??
        (bId ? buildingNameById[bId] : undefined) ??
        bId ??
        "-";
      const floor =
        r.floor_name ?? (fId ? floorNameById[fId] : undefined) ?? fId ?? "-";
      const unit =
        r.unit_name ?? (uId ? unitNameById[uId] : undefined) ?? uId ?? "-";

      return {
        assetno: r.id ?? "-", // "Asset No." shows id
        assets: r.asset_name ?? "-",
        building,
        floor,
        unit,
        serialnumber: r.serial ?? "-",
        __raw: r,
      };
    });
  }, [assets, buildingNameById, floorNameById, unitNameById]);

  // client-side search (unchanged)
  const filteredData = useMemo(() => {
    if (!searchValue) return displayData;
    const q = searchValue.toLowerCase();
    return displayData.filter((row) =>
      Object.values(row).some(
        (v) => typeof v === "string" && v.toLowerCase().includes(q)
      )
    );
  }, [displayData, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div
      className="p-4 bg-white rounded-md shadow-md"
      style={{ fontFamily: "'PT Sans', sans-serif" }} 
    >
      {editingAsset ? (
        <div className="mb-4">
          <AddAssetForm
            initialData={editingAsset}
            onClose={() => setEditingAsset(null)}
          />
        </div>
      ) : (
        <>
          {/* Toolbar — unchanged */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex gap-2 items-center">
              <button
                aria-label="Search"
                className="text-xl"
                onClick={() => setSearchActive(!searchActive)}
              >
                <FiSearch />
              </button>
              <button
                className="bg-[#7991BB] text-white px-3 py-1 rounded transition"
                onClick={() => navigate("/addasset")}
              >
                + Add Assets
              </button>
              <button className="bg-gray-100 px-3 py-1 rounded border">
                QR Code
              </button>
              {/* <button className="bg-gray-100 px-3 py-1 rounded border">
                Hide Columns
              </button>
              <button className="bg-gray-100 px-3 py-1 rounded border">
                Import
              </button> */}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredData.length}
              onPageChange={setPage}
              showControls
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200 assets-table">
              <TableHead columns={columns.map((label) => ({ label }))} />

              <thead>
                {searchActive && (
                  <tr>
                    {columns.map((col, idx) => (
                      <td key={col} className="border px-2 py-1">
                        {idx === columns.length - 1 ? (
                          <button
                            className="bg-gray-200 text-sm px-2 py-1 rounded"
                            disabled
                          >
                            Go
                          </button>
                        ) : (
                          <input
                            type="text"
                            className="w-full border rounded px-1 py-0.5 text-sm"
                            placeholder={`Search ${col}`}
                            onChange={(e) => {
                              setSearchValue(e.target.value);
                              setPage(1);
                            }}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                )}
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-6 text-gray-500"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item, idx) => (
                    <tr
                      key={item.__raw?.id ?? idx}
                      className="hover:bg-gray-50"
                    >
                      {columns.map((col, colIdx) => {
                        if (col === "Action") {
                          return (
                            <td key={colIdx} className="p-2 border-b">
                              <span className="inline-flex items-center gap-2">
                                <IconButton
                                  tooltip="Edit"
                                  onClick={() =>
                                    setEditingAsset(item.__raw || item)
                                  }
                                >
                                  <FiEdit />
                                </IconButton>
                                <IconButton
                                  tooltip="Delete"
                                  onClick={() => {
                                    /* handle delete */
                                  }}
                                >
                                  <FiTrash2 />
                                </IconButton>
                                <IconButton
                                  tooltip="View"
                                  onClick={() => onView(item.__raw || item)}
                                >
                                  <FiEye />
                                </IconButton>
                              </span>
                            </td>
                          );
                        }
                        const k = keyFromLabel(col);
                        return (
                          <td key={colIdx} className="p-2 border-b">
                            {(item as any)[k] ?? "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-6 text-gray-500"
                    >
                      <NoDataFound />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AssetsTab;
