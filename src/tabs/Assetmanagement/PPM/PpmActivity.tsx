import React, { useState } from "react";
import { FiEye } from "react-icons/fi";
import IconButton from "../../../components/IconButton";
import TopSearch from "../../../components/TopSearch";
import TableHead from "../../../components/TopHead";
import Pagination from "../../../components/Pagination";

const PpmActivity: React.FC = () => {
  const [searchActive, setSearchActive] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    assetName: "",
    checklist: "",
    startDate: "",
    status: "",
    assignedTo: "",
  });

  const data = [
    {
      id: 1,
      assetName: "Checklist",
      checklist: "ABC",
      startDate: "26/11/2024",
      status: "",
      assignedTo: "Ram Technician",
    },
  ];

  const filteredData = data.filter((item) =>
    Object.entries(columnFilters).every(([key, value]) => {
      if (!value) return true;
      const itemValue = String((item as any)[key]).toLowerCase();
      return itemValue.includes(value.toLowerCase());
    })
  );

  const handleFilterChange = (key: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="p-3" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      <div className="overflow-x-auto ">
        <div className="flex items-center justify-between mb-2">
          <TopSearch
            searchActive={searchActive}
            onSearchToggle={() => setSearchActive(!searchActive)}
            onButtonClick={() => {}}
            buttons={[]}
            value=""
            onChange={() => {}}
            placeholder=""
            showInput={false}
          />
          <Pagination
            currentPage={1}
            totalPages={1}
            totalItems={filteredData.length}
            onPageChange={() => {}}
          />
        </div>
        <table
          style={{ fontFamily: "'PT Sans', sans-serif" }}
          className="min-w-full text-center text-gray-600 border"
        >
          <TableHead
            columns={[
              { label: "Action", align: "center" },
              { label: "Asset Name", align: "center" },
              { label: "Checklist", align: "center" },
              { label: "Start Date", align: "center" },
              { label: "Status", align: "center" },
              { label: "Assigned to", align: "center" },
            ]}
          />
          {searchActive && (
            <thead>
              <tr className="bg-white">
                <td></td>
                <td>
                  <input
                    value={columnFilters.assetName}
                    onChange={(e) => handleFilterChange("assetName", e.target.value)}
                    placeholder="Search Asset Name"
                    className="text-xs px-2 py-2 border rounded w-full"
                  />
                </td>
                <td>
                  <input
                    value={columnFilters.checklist}
                    onChange={(e) => handleFilterChange("checklist", e.target.value)}
                    placeholder="Search Checklist"
                    className="text-xs px-2 py-2 border rounded w-full"
                  />
                </td>
                <td>
                  <input
                    value={columnFilters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    placeholder="Search Start Date"
                    className="text-xs px-2 py-2 border rounded w-full"
                  />
                </td>
                <td></td>
                <td>
                  <input
                    value={columnFilters.assignedTo}
                    onChange={(e) => handleFilterChange("assignedTo", e.target.value)}
                    placeholder="Search Assigned To"
                    className="text-xs px-2 py-2 border rounded w-full"
                  />
                </td>
              </tr>
            </thead>
          )}
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 text-sm text-center"
                >
                  <td className="py-2">
                    <IconButton tooltip="View">
                      <FiEye />
                    </IconButton>
                  </td>
                  <td>{item.assetName}</td>
                  <td>{item.checklist}</td>
                  <td>{item.startDate}</td>
                  <td>
                    {/* Status toggle placeholder */}
                    <input type="checkbox" className="toggle" />
                  </td>
                  <td>{item.assignedTo}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PpmActivity; 