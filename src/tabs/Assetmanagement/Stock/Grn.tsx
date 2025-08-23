import React, { useState } from "react";
import TopSearch from "../../../components/TopSearch";
import TopHead from "../../../components/TopHead";
import NoDataFound from "../../../components/NoDataFound";
import Pagination from "../../../components/Pagination";
import Addgrn from "../../../forms/Addgrn";

const GRN: React.FC = () => {
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [grnList, setGrnList] = useState<any[]>([]); // ← Store added GRN records

  const totalItems = grnList.length;
  const totalPages = 1;

  const handleSearchToggle = () => setSearchActive((prev) => !prev);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleButtonClick = (label: string) => {
    if (label === "Add") {
      setShowAddForm(true);
    } else if (label === "Export") {
      console.log("Export clicked");
    }
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleAddGrn = (data: any) => {
    setGrnList((prev) => [...prev, data]);
    setShowAddForm(false); // Go back to table
  };

  const tableColumns = [
    { key: "purchaseOrder", label: "PO" },
    { key: "supplier", label: "Supplier" },
    { key: "invoiceNumber", label: "Invoice No" },
    { key: "invoiceDate", label: "Date" },
    { key: "invoiceAmount", label: "Amount" },
    { key: "paymentMode", label: "Payment Mode" },
  ];

  const filteredList = grnList.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchValue.toLowerCase())
    )
  );

  return (
    <div className="p-4" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      {!showAddForm ? (
        <>
          <TopSearch
            placeholder="Search GRN"
            searchActive={searchActive}
            onSearchToggle={handleSearchToggle}
            onButtonClick={handleButtonClick}
            buttons={["Add", "Export"]}
            value={searchValue}
            onChange={handleSearchChange}
          />

          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border">
              <TopHead columns={tableColumns} />
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={tableColumns.length}>
                      <NoDataFound />
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, index) => (
                    <tr key={index} className="text-center border-t">
                      {tableColumns.map((col) => (
                        <td key={col.key} className="p-2">
                          {item[col.key] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <Addgrn onSubmit={handleAddGrn} />
      )}
    </div>
  );
};

export default GRN;
