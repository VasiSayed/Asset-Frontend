// AMCTab.tsx
import React, { useState } from "react";
import Tabs from "../../components/Tabs";
import AMCExperied from "../Assetmanagement/AMCExpiredAssets";
import AMCDays from "../Assetmanagement/AMCExpiringIn90Days";

const AMCTab: React.FC = () => {
  type SubTabType = "AMC Expired Asset" | "AMC Expiring in 90 Day";
  const [activeSubTab, setActiveSubTab] =
    useState<SubTabType>("AMC Expired Asset");

  // TODO: replace this with real site selection later
  const SITE_ID = 1;

  const subTabLabels: SubTabType[] = [
    "AMC Expired Asset",
    "AMC Expiring in 90 Day",
  ];
  const subTabItems = subTabLabels.map((label) => ({ label, key: label }));

  const handleSubTabChange = (key: string | number) => {
    if (typeof key === "string" && subTabLabels.includes(key as SubTabType)) {
      setActiveSubTab(key as SubTabType);
    }
  };

  const renderSubTabContent = (tab: string | number) => {
    if (typeof tab !== "string") return null;
    switch (tab as SubTabType) {
      case "AMC Expired Asset":
        return <AMCExperied siteId={SITE_ID} />;
      case "AMC Expiring in 90 Day":
        return <AMCDays siteId={SITE_ID} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: "'PT Sans', sans-serif" }}>
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
