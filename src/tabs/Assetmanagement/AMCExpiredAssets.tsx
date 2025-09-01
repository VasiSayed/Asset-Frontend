// AMCExpiredAssets.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import NoDataFound from "../../components/NoDataFound";
import TableHead from "../../components/TopHead";
import Pagination from "../../components/Pagination";
import IconButton from "../../components/IconButton";
import { useNavigate } from "react-router-dom";
import AddAMCForm from "../../forms/AddAMCForm";
import { getAMCStatus } from "../../api/endpoints";

const PAGE_SIZE = 10;

type AMCRow = {
  id: number;
  asset_id: number | null;
  asset_name: string | null;

  site_name?: string | null;
  building_name?: string | null;
  floor_name?: string | null;
  unit_name?: string | null;

  amc_start?: string | null;
  amc_end?: string | null;
  warranty_end?: string | null;
  created_at?: string | null;
};

interface Props {
  siteId?: number; // default to 1 if not provided
}

const AMCExpiredAssets: React.FC<Props> = ({ siteId = 1 }) => {
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const [rows, setRows] = useState<AMCRow[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const today = useMemo(() => new Date(), []);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const data = await getAMCStatus({
        site_id: siteId,
        status: "expired", // only expired
        kind: "both", // AMC or Warranty
        as: "amcs",
        search: searchValue || undefined,
        ordering: "-amc_end",
        page,
        page_size: PAGE_SIZE,
      });
      setRows(data?.results ?? []);
      setCount(data?.count ?? 0);
    } catch (e) {
      console.error("AMC status fetch failed:", e);
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, page]);

  const handleAddAMCSubmit = () => {
    setShowForm(false);
    fetchRows();
  };

  // Same "Expired Day" meaning as before — days since end date (prefer AMC, fallback to Warranty)
  const getExpiredDays = (row: AMCRow) => {
    const endStr = row?.amc_end || row?.warranty_end;
    if (!endStr) return "-";
    const end = new Date(endStr);
    const diffMs = today.getTime() - end.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? String(days) : "0";
  };

  // Same columns as before
  const columns = [
    "Action",
    "Name",
    "Location",
    "Expired Day",
    "AMC Start Date",
    "AMC End Date",
  ];

  const locationString = (row: AMCRow) =>
    [row.site_name, row.building_name, row.floor_name, row.unit_name]
      .filter(Boolean)
      .join(" / ") || "-";

  return (
    <div
      className="p-4 bg-white rounded-md shadow-md"
      style={{ fontFamily: "'PT Sans', sans-serif" }}
    >
      {showForm ? (
        <AddAMCForm
          siteId={siteId}
          onSuccess={handleAddAMCSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
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
                onClick={() => setShowForm(true)}
              >
                + Add AMC
              </button>
              <button className="bg-gray-100 px-3 py-1 rounded border">
                QR Code
              </button>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={count}
              onPageChange={setPage}
              showControls={true}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <TableHead columns={columns.map((label) => ({ label }))} />

              <thead>
                {searchActive && (
                  <tr>
                    {columns.map((col, idx) => (
                      <td key={col} className="border px-2 py-1">
                        {col === "Action" ? (
                          // Keep a simple Go button here, mirroring your old layout
                          <button
                            className="bg-gray-200 text-sm px-2 py-1 rounded"
                            onClick={() => {
                              setPage(1);
                              fetchRows();
                            }}
                          >
                            Go
                          </button>
                        ) : (
                          <input
                            type="text"
                            className="w-full border rounded px-1 py-0.5 text-sm"
                            placeholder={`Search ${col}`}
                            value={searchValue}
                            onChange={(e) => {
                              setSearchValue(e.target.value);
                              setPage(1);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") fetchRows();
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
                      Loading...
                    </td>
                  </tr>
                ) : rows.length > 0 ? (
                  rows.map((row, idx) => (
                    <tr key={row.id ?? idx} className="hover:bg-gray-50">
                      {/* Action */}
                      <td className="p-2 border-b">
                        <span className="inline-flex items-center gap-2">
                          <IconButton tooltip="Edit" onClick={() => {}}>
                            <FiEdit />
                          </IconButton>
                          <IconButton tooltip="Delete" onClick={() => {}}>
                            <FiTrash2 />
                          </IconButton>
                          <IconButton tooltip="View" onClick={() => {}}>
                            <FiEye />
                          </IconButton>
                        </span>
                      </td>

                      {/* Name */}
                      <td className="p-2 border-b">{row.asset_name || "-"}</td>

                      {/* Location */}
                      <td className="p-2 border-b">{locationString(row)}</td>

                      {/* Expired Day */}
                      <td className="p-2 border-b">{getExpiredDays(row)}</td>

                      {/* AMC Start Date */}
                      <td className="p-2 border-b">{row.amc_start || "-"}</td>

                      {/* AMC End Date */}
                      <td className="p-2 border-b">{row.amc_end || "-"}</td>
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

export default AMCExpiredAssets;
