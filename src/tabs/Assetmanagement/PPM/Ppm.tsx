import React, { useState } from 'react';
import Tabs from '../../../components/Tabs';
import RoutineTask from './Routine';
import PpmActivity from './PpmActivity';

const Ppm: React.FC = () => {
  type SubTabType = "Routine Task" | "PPM Activity";
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>("Routine Task");

  const subTabLabels: SubTabType[] = ["Routine Task", "PPM Activity"];

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
      case "Routine Task":
        return <RoutineTask />;
      case "PPM Activity":
        return <PpmActivity />;
      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: "'PT Sans', sans-serif" }}>
      {/* <h2 className="text-xl font-semibold mb-4">PPM Management</h2> */}
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

export default Ppm;
