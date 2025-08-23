import React, { useState } from 'react';
import Tabs from '../../components/Tabs'; 
import AMCExperied from "../Assetmanagement/AMCExpiredAssets";
import AMCDays from "../Assetmanagement/AMCExpiringIn90Days";


const AMCTab: React.FC = () => {
  type SubTabType = "AMC Expired Asset" | "AMC Expiring in 90 Day";
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>("AMC Expired Asset");

  const subTabLabels: SubTabType[] = ["AMC Expired Asset", "AMC Expiring in 90 Day"];

  const subTabItems = subTabLabels.map((label) => ({
    label,
    key: label,
  }));

  const handleSubTabChange = (key: string | number) => {
    if (typeof key === "string" && subTabLabels.includes(key as SubTabType)) {
      setActiveSubTab(key as SubTabType);
    }
  };

  const renderSubTabContent = (tab: string | number) => {
    if (typeof tab !== "string") return null;

    switch (tab as SubTabType) {
    case "AMC Expired Asset":
      return <AMCExperied />; // <-- ✅ Use actual component
    case "AMC Expiring in 90 Day":
      return <AMCDays />; // <-- ✅ Use actual component
    default:
      return null;
    }
  };
  

  return (
    <div style={{ fontFamily: "'PT Sans', sans-serif" }}>
      {/* <h2 className="text-xl font-semibold mb-4">AMC Management</h2> */}
      <Tabs
        tabs={subTabItems}
        activeTab={activeSubTab}
        onTabChange={handleSubTabChange}
        renderContent={renderSubTabContent}
        orientation="horizontal"
      />
    </div>
  );
};

export default AMCTab;
