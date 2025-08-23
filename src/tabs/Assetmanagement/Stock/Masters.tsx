import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import TopSearch from "../../../components/TopSearch";
import Pagination from "../../../components/Pagination";
import NoDataFound from "../../../components/NoDataFound";
import TableHead from "../../../components/TopHead";
import Addmasters from "../../../forms/Addmasters"; // Import the inline form

const Masters = () => {
  const [searchActive, setSearchActive] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submittedData, setSubmittedData] = useState<any[]>([]); // Shared state

  const handleAddData = (newData: any) => {
    setSubmittedData((prev) => [...prev, newData]);
    setShowAddForm(false); // Optionally hide form after submission
  };

  return (
    <div className="p-3" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 bg-white border px-3 py-1 rounded text-gray-700 text-sm hover:bg-gray-100"
          >
            <FiPlus className="text-base" /> Add
          </button>
          {!showAddForm && (
            <button className="bg-white border px-3 py-1 rounded text-gray-700 text-sm hover:bg-gray-100">
              Export
            </button>
          )}
        </div>

        {!showAddForm && (
          <Pagination
            currentPage={1}
            totalPages={1}
            totalItems={submittedData.length}
            onPageChange={() => {}}
          />
        )}
      </div>

      {/* Conditionally render form or table */}
      {showAddForm ? (
        <Addmasters onSubmit={handleAddData} />
      ) : (
        <table
          style={{ fontFamily: "'PT Sans', sans-serif" }}
          className="min-w-full text-center text-gray-600 border"
        >
          <TableHead
            columns={[
              { label: "Action", align: "center" },
              { label: "Name", align: "center" },
              { label: "Code", align: "center" },
              { label: "Serial Number", align: "center" },
              { label: "Type", align: "center" },
              { label: "Category", align: "center" },
              { label: "Expired Date", align: "center" },
              { label: "Status", align: "center" },
            ]}
          />
          <tbody>
            {submittedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8">
                  <NoDataFound message="" />
                </td>
              </tr>
            ) : (
              submittedData.map((entry, idx) => (
                <tr key={idx} className="even:bg-gray-50">
                  <td className="border px-2 py-1">-</td>
                  <td className="border px-2 py-1">{entry.name}</td>
                  <td className="border px-2 py-1">{entry.code}</td>
                  <td className="border px-2 py-1">{entry.serialNumber}</td>
                  <td className="border px-2 py-1">{entry.inventoryType}</td>
                  <td className="border px-2 py-1">{entry.category}</td>
                  <td className="border px-2 py-1">{entry.expiryDate}</td>
                  <td className="border px-2 py-1">Active</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Masters;
