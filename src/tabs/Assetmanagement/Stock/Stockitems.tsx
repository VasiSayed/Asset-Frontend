import React, { useState } from "react";
import Masters from "./Masters";
import Stocks from "./Stocks";
import Grn from "./Grn";
import Gdn from "./Gdn";

const tabList = ["Masters", "Stocks", "GRN", "GDN"];

const Stockitems: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabList[0]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Masters":
        return <Masters />;
      case "Stocks":
        return <Stocks />;
      case "GRN":
        return <Grn />;
      case "GDN":
        return <Gdn />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      <div className="flex border-b mb-4">
        {tabList.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 -mb-px border-b-2 font-medium focus:outline-none transition-colors duration-200 ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-4">{renderTabContent()}</div>
    </div>
  );
};

export default Stockitems;
