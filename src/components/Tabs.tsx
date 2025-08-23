import React, { type ReactNode } from "react";

interface Tab {
  label: string;
  key: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string | number;
  onTabChange: (key: string | number) => void;
  disabledTabs?: (string | number)[];
  renderContent?: (activeTab: string | number) => ReactNode;
  orientation?: "horizontal" | "vertical";
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  disabledTabs = [],
  renderContent,
  orientation = "horizontal",
}) => {
  const isVertical = orientation === "vertical";

  return (
    <div className={`flex ${isVertical ? "flex-row" : "flex-col"}`}>
      <div
        role="tablist"
        aria-orientation={isVertical ? "vertical" : "horizontal"}
        className={`${isVertical ? "flex flex-col w-40 space-y-2 mr-4" : "flex flex-row border-b space-x-2 mb-4"
          }`}
      >
        {tabs.map((tab) => {
          const isDisabled = disabledTabs.includes(tab.key);
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={tab.key === activeTab}
              aria-disabled={isDisabled}
              className={`px-4 py-2 text-sm border-b-2
                ${isDisabled
                  ? "text-gray-400 cursor-not-allowed"
                  : tab.key === activeTab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-blue-600"
                }`}
              onClick={() => !isDisabled && onTabChange(tab.key)}
              disabled={isDisabled}
              tabIndex={isDisabled ? -1 : 0}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 w-full" role="tabpanel">
        {renderContent ? renderContent(activeTab) : null}
      </div>
    </div>
  );
};

export default Tabs;
