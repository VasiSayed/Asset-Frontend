import React, { useState } from "react";
import { FiEye } from "react-icons/fi";
import IconButton from "../../../components/IconButton";
import TopSearch from "../../../components/TopSearch";
import TableHead from "../../../components/TopHead";
import Pagination from "../../../components/Pagination";

const RoutineTask: React.FC = () => {
  const [searchActive, setSearchActive] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    name: "",
    startDate: "",
    endDate: "",
    groupCount: "",
    frequency: "",
    priority: "",
  });

  const data = [
    {
      id: 1,
      name: "ABC",
      startDate: "26/11/2024",
      endDate: "26/11/2024",
      groupCount: 2,
      frequency: "Daily",
      priority: "High",
    },
    {
      id: 2,
      name: "XYZ",
      startDate: "01/01/2025",
      endDate: "31/01/2025",
      groupCount: 1,
      frequency: "Weekly",
      priority: "Medium",
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
      {/* Table */}
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
              { label: "Name", align: "center" },
              { label: "Start Date", align: "center" },
              { label: "End Date", align: "center" },
              { label: "No. Of Group", align: "center" },
              { label: "Frequency", align: "center" },
              { label: "Priority Level", align: "center" },
              { label: "Associations", align: "center" },
            ]}
          />
          {searchActive && (
            <thead>
              <tr className="bg-white">
                <td></td>
                <td>
                  <input
                    value={columnFilters.name}
                    onChange={(e) => handleFilterChange("name", e.target.value)}
                    placeholder="Search Name"
                    className="text-xs px-2 py-1 border rounded w-full"
                  />
                </td>
                <td>
                  <input
                    value={columnFilters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    placeholder="Search Start Date"
                    className="text-xs px-2 py-1 border rounded w-full"
                  />
                </td>
                <td>
                  <input
                    value={columnFilters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    placeholder="Search End Date"
                    className="text-xs px-2 py-1 border rounded w-full"
                  />
                </td>
                <td>
                  <input
                    value={columnFilters.groupCount}
                    onChange={(e) => handleFilterChange("groupCount", e.target.value)}
                    placeholder="Search Groups"
                    className="text-xs px-2 py-1 border rounded w-full"
                  />
                </td>
                <td>
                  <input
                    value={columnFilters.frequency}
                    onChange={(e) => handleFilterChange("frequency", e.target.value)}
                    placeholder="Search Frequency"
                    className="text-xs px-2 py-1 border rounded w-full"
                  />
                </td>
                <td>
                  <input
                    value={columnFilters.priority}
                    onChange={(e) => handleFilterChange("priority", e.target.value)}
                    placeholder="Search Priority"
                    className="text-xs px-2 py-1 border rounded w-full"
                  />
                </td>
                <td></td>
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
                  <td>{item.name}</td>
                  <td>{item.startDate}</td>
                  <td>{item.endDate}</td>
                  <td>{item.groupCount}</td>
                  <td>{item.frequency}</td>
                  <td>{item.priority}</td>
                  <td>
                    <button className="bg-indigo-200 text-indigo-700 text-xs px-3 py-1 rounded">
                      Associations
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-400">
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

export default RoutineTask;
