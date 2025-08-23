import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Tabs from '../components/Tabs';

const AssetManagementLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current route
  const activeTab = location.pathname.split('/')[1] || 'assetmanagement';

  const tabs = [
    { key: 'assetmanagement', label: 'Assets' },
    { key: 'amcexpiredassets', label: 'AMC' },
    { key: 'checklist', label: 'Checklist' },
    { key: 'ppm', label: 'PPM' },
    { key: 'stockitems', label: 'Stock Items' }
  ];

  const handleTabChange = (tabKey: string | number) => {
    navigate(`/${tabKey}`);
  };

  return (
    <div className="asset-management-layout">
      {/* You might have header/sidebar components here */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <div className="content">
        <Outlet /> {/* This is where the nested route components will render */}
      </div>
    </div>
  );
};

export default AssetManagementLayout; 