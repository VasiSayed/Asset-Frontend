// src/pages/Assetmanagement/AMCExpiringIn90Days.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import NoDataFound from "../../components/NoDataFound";
import TableHead from "../../components/TopHead";
import Pagination from "../../components/Pagination";
import IconButton from "../../components/IconButton";
import AddAMCForm from "../../forms/AddAMCForm";
import { getAMCDueSoon } from "../../api/endpoints";
import type { AMCDueFilters } from "../../api/endpoints";

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
};

interface Props {
  siteId?: number; // defaults to 1
  days?: number; // defaults to 90
  filters?: AMCDueFilters; 
}

const AMCExpiringIn90Days: React.FC<Props> = ({
  siteId = 1,
  days = 90,
  filters = {},
}) => {
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<any | null>(null);

  const [rows, setRows] = useState<AMCRow[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(count / PAGE_SIZE);
  const today = useMemo(() => new Date(), []);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const data = await getAMCDueSoon({
        site_id: siteId,
        days,
        as: "amcs", // get AMC rows so we have amc_start/amc_end
        search: searchValue || undefined,
        ordering: "amc_end", // soonest first
        page,
        page_size: PAGE_SIZE,
        ...filters, // supports all backend filters without changing UI
      });
      setRows(data?.results ?? []);
      setCount(data?.count ?? 0);
    } catch (e) {
      console.error("amc-due fetch failed:", e);
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, days, page, JSON.stringify(filters)]); // search triggers fetch via Enter/Go below

  const handleAddAMCSubmit = (submittedData: any) => {
    // keep UI behavior same as your version
    setShowForm(false);
    setEditIndex(null);
    setFormData(null);
    // refresh list after add/edit
    fetchRows();
  };

  const handleEdit = (index: number) => {
    const item = rows[index];
    setFormData({
      vendor: "", // vendor not shown in this table; keep your original shape
      location: [
        item.site_name,
        item.building_name,
        item.floor_name,
        item.unit_name,
      ]
        .filter(Boolean)
        .join(" / "),
      startDate: item.amc_start || "",
      endDate: item.amc_end || "",
      file: null,
    });
    setEditIndex(index);
    setShowForm(true);
  };

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

  // For "Expiring in 90 Days" → show days remaining until AMC end (keep label "Expired Day" unchanged)
  const getDaysRemaining = (row: AMCRow) => {
    const endStr = row?.amc_end;
    if (!endStr) return "-";
    const end = new Date(endStr);
    const diffMs = end.getTime() - today.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days >= 0 ? String(days) : "0";
  };

  return (
    <div
      className="p-4 bg-white rounded-md shadow-md"
      style={{ fontFamily: "'PT Sans', sans-serif" }}
    >
      {showForm ? (
        <AddAMCForm
          onSubmit={handleAddAMCSubmit}
          initialValues={formData}
          title={editIndex !== null ? "Edit AMC" : "Add AMC"}
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
                onClick={() => {
                  setShowForm(true);
                  setFormData(null);
                  setEditIndex(null);
                }}
              >
                + Add AMC
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
                        {idx === columns.length - 1 ? (
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
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                setPage(1);
                                fetchRows();
                              }
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
                  rows.map((item, idx) => (
                    <tr key={item.id ?? idx} className="hover:bg-gray-50">
                      {columns.map((col, colIdx) => {
                        switch (col) {
                          case "Action":
                            return (
                              <td key={colIdx} className="p-2 border-b">
                                <span className="inline-flex items-center gap-2">
                                  <IconButton
                                    tooltip="Edit"
                                    onClick={() => handleEdit(idx)}
                                  >
                                    <FiEdit />
                                  </IconButton>
                                  <IconButton
                                    tooltip="Delete"
                                    onClick={() => {}}
                                  >
                                    <FiTrash2 />
                                  </IconButton>
                                  <IconButton tooltip="View" onClick={() => {}}>
                                    <FiEye />
                                  </IconButton>
                                </span>
                              </td>
                            );
                          case "Name":
                            return (
                              <td key={colIdx} className="p-2 border-b">
                                {item.asset_name || "-"}
                              </td>
                            );
                          case "Location":
                            return (
                              <td key={colIdx} className="p-2 border-b">
                                {locationString(item)}
                              </td>
                            );
                          case "Expired Day":
                            return (
                              <td key={colIdx} className="p-2 border-b">
                                {getDaysRemaining(item)}
                              </td>
                            );
                          case "AMC Start Date":
                            return (
                              <td key={colIdx} className="p-2 border-b">
                                {item.amc_start || "-"}
                              </td>
                            );
                          case "AMC End Date":
                            return (
                              <td key={colIdx} className="p-2 border-b">
                                {item.amc_end || "-"}
                              </td>
                            );
                          default:
                            return (
                              <td key={colIdx} className="p-2 border-b">
                                -
                              </td>
                            );
                        }
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

export default AMCExpiringIn90Days;
