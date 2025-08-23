import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";
import TopSearch from "../../../components/TopSearch";
import Pagination from "../../../components/Pagination";
import NoDataFound from "../../../components/NoDataFound";
import TableHead from "../../../components/TopHead";
import AddStocks from "../../../forms/Addstocks";

const Stocks = () => {
  const [searchActive, setSearchActive] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submittedData, setSubmittedData] = useState<any[]>([]);

  const handleAddData = (data: any) => {
    setSubmittedData((prev) => [...prev, data]);
    setShowAddForm(false); // Hide form after submit
  };

  return (
    <div className="p-3" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TopSearch
            searchActive={searchActive}
            onSearchToggle={() => setSearchActive(!searchActive)}
            onButtonClick={() => {}}
            buttons={[]}
            value=""
            onChange={() => {}}
            placeholder="Search..."
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

      {/* Form or Table */}
     {showAddForm ? (
  <AddStocks
    onSubmit={(data) => {
      setSubmittedData((prev) => [...prev, data]);
      setShowAddForm(false);
    }}
    onCancel={() => setShowAddForm(false)}
  />
) : (
        <table
          className="min-w-full text-center text-gray-600 border"
          style={{ fontFamily: "'PT Sans', sans-serif" }}
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
              submittedData.map((item, index) => (
                <tr key={index} className="even:bg-gray-50">
                  <td className="border px-2 py-1">-</td>
                  <td className="border px-2 py-1">{item.name}</td>
                  <td className="border px-2 py-1">{item.code}</td>
                  <td className="border px-2 py-1">{item.serialNumber}</td>
                  <td className="border px-2 py-1">{item.inventoryType}</td>
                  <td className="border px-2 py-1">{item.category}</td>
                  <td className="border px-2 py-1">{item.expiryDate}</td>
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

export default Stocks;
