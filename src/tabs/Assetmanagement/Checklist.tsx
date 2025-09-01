// src/pages/ChecklistTab.tsx
import React, { useEffect, useMemo, useState } from "react";
import { FiEye, FiEdit, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import NoDataFound from "../../components/NoDataFound";
import TableHead from "../../components/TopHead";
import Pagination from "../../components/Pagination";
import IconButton from "../../components/IconButton";
import { GetChecklist } from "../../api/endpoints";
import { showToast } from "../../../src/utils/toast";

const PAGE_SIZE = 10;

type ApiChecklist = {
  id: number;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  priority: number;
  frequency: string;
  created_at: string;
  updated_at: string;
  group_count: number;
};

type Row = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  groupCount: number;
  frequency: string;
  priority: string;
};

const PRIORITY_LABEL: Record<number, string> = {
  1: "Low",
  2: "Mid",
  3: "High",
};
const humanize = (s?: string) =>
  !s
    ? ""
    : s
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (m) => m.toUpperCase());
const formatDDMMYYYY = (iso: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-GB");
};

const ChecklistTab: React.FC = () => {
  const navigate = useNavigate();

  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  const columns = [
    "Action",
    "Name",
    "Start Date",
    "End Date",
    "No. Of Group",
    "Frequency",
    "Priority Level",
    "Associations",
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data: ApiChecklist[] = await GetChecklist();
        const mapped: Row[] = (
          Array.isArray(data) ? data : data?.results ?? []
        ).map((c) => ({
          id: c.id,
          name: c.name,
          startDate: formatDDMMYYYY(c.start_date),
          endDate: formatDDMMYYYY(c.end_date),
          groupCount: c.group_count ?? 0,
          frequency: humanize(c.frequency),
          priority: PRIORITY_LABEL[c.priority] ?? String(c.priority),
        }));
        if (mounted) setRows(mapped);
      } catch (err: any) {
        showToast(`Error Occured ${err?.message || "Request failed"}`, "error");
        if (mounted) setRows([]); // keep UI consistent (empty table => NoDataFound)
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredData = useMemo(() => {
    const needle = searchValue.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((item) =>
      [
        item.name,
        item.startDate,
        item.endDate,
        String(item.groupCount),
        item.frequency,
        item.priority,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [rows, searchValue]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE) || 1;
  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => setPage(1), [searchValue]);

  return (
    <div
      className="p-4 bg-white rounded-md shadow-md"
      style={{ fontFamily: "'PT Sans', sans-serif" }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <button
            aria-label="Toggle Search"
            className="text-xl text-gray-600 hover:text-gray-800"
            onClick={() => setSearchActive(!searchActive)}
          >
            <FiSearch />
          </button>

          <button
            className="bg-[#7991BB] text-white px-3 py-1 rounded transition"
            onClick={() => navigate("/addchecklist")}
          >
            + Add
          </button>
          <button className="bg-gray-100 px-3 py-1 rounded border">
            Export
          </button>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredData.length}
          onPageChange={setPage}
          showControls={true}
        />
      </div>

      {loading && (
        <div className="py-12 text-center text-gray-500">Loading…</div>
      )}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <TableHead columns={columns.map((label) => ({ label }))} />
            <thead>
              {searchActive && (
                <tr>
                  <td className="p-2 border-b"></td>
                  {[
                    "Name",
                    "Start Date",
                    "End Date",
                    "No. Of Group",
                    "Frequency",
                    "Priority Level",
                    "Associations",
                  ].map((col) => (
                    <td key={col} className="border px-2 py-1">
                      {[
                        "Name",
                        "Start Date",
                        "End Date",
                        "Frequency",
                        "Priority Level",
                      ].includes(col) ? (
                        <input
                          type="text"
                          className="w-full border rounded px-1 py-0.5 text-sm"
                          placeholder="Search"
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                      ) : (
                        <div className="h-full"></div>
                      )}
                    </td>
                  ))}
                </tr>
              )}
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 text-sm">
                    <td className="p-2 border-b">
                      <div className="flex gap-2">
                        <IconButton tooltip="View">
                          <FiEye />
                        </IconButton>
                        <IconButton
                          tooltip="Edit"
                          onClick={() =>
                            navigate("/add-checklist", {
                              state: { initialData: item },
                            })
                          }
                        >
                          <FiEdit />
                        </IconButton>
                      </div>
                    </td>
                    <td className="p-2 border-b">{item.name}</td>
                    <td className="p-2 border-b">{item.startDate}</td>
                    <td className="p-2 border-b">{item.endDate}</td>
                    <td className="p-2 border-b">{item.groupCount}</td>
                    <td className="p-2 border-b">{item.frequency}</td>
                    <td className="p-2 border-b">{item.priority}</td>
                    <td className="p-2 border-b">
                      <button
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs"
                        onClick={() =>
                          navigate(`/checklist/${item.id}/associations`)
                        }
                      >
                        Associations
                      </button>
                    </td>
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
      )}
    </div>
  );
};

export default ChecklistTab;
