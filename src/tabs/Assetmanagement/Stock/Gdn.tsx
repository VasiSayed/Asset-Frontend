import React, { useState } from "react";
import TopSearch from "../../../components/TopSearch";
import TopHead from "../../../components/TopHead";
import NoDataFound from "../../../components/NoDataFound";
import Pagination from "../../../components/Pagination";
import Addgdn from "../../../forms/Addgdn";

const Gdn: React.FC = () => {
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [gdnData, setGdnData] = useState<any[]>([]); // ✅ store added rows

  const totalItems = gdnData.length;
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

  const handleAddGdn = (newData: any) => {
    setGdnData((prev) => [...prev, newData]); // ✅ add new entry
    setShowAddForm(false); // ✅ go back to table
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const tableColumns = [
    { key: "action", label: "Action" },
    { key: "gdnDate", label: "GDN Date" },
    { key: "description", label: "Description" },
    { key: "inventory", label: "Inventory" },
    { key: "quantity", label: "Quantity" },
    { key: "purpose", label: "Purpose" },
    { key: "comments", label: "Comments" },
  ];

  return (
    <div className="p-4" style={{ fontFamily: "'PT Sans', sans-serif",color: 'gray' }}>
      <TopSearch
        placeholder="Search GDN"
        searchActive={searchActive}
        onSearchToggle={handleSearchToggle}
        onButtonClick={handleButtonClick}
        buttons={["Add", "Export"]}
        value={searchValue}
        onChange={handleSearchChange}
      />

      {showAddForm ? (
        <Addgdn onSubmit={handleAddGdn} />
      ) : (
        <>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border">
              <TopHead columns={tableColumns} />
              <tbody>
                {gdnData.length === 0 ? (
                  <tr>
                    <td colSpan={tableColumns.length}>
                      <NoDataFound />
                    </td>
                  </tr>
                ) : (
                  gdnData.map((row, index) => (
                    <tr key={index} className="text-center border-t">
                      <td>
                        <button className="text-blue-600">Edit</button>
                      </td>
                      <td>{row.gdnDate}</td>
                      <td>{row.description}</td>
                      <td>{row.inventory}</td>
                      <td>{row.quantity}</td>
                      <td>{row.purpose}</td>
                      <td>{row.comments}</td>
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
      )}
    </div>
  );
};

export default Gdn;
