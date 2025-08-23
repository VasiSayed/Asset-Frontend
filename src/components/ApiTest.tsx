import React, { useState, useEffect } from 'react';
import { 
  GetAssetTypes, 
  GetAssetCategories, 
  GetAssetGroups, 
  GetAssetSubgroups 
} from '../api/endpoints';

const ApiTest: React.FC = () => {
  const [assetTypes, setAssetTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subgroups, setSubgroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testAssetTypes = async () => {
    setLoading(true);
    try {
      console.log('Testing Asset Types API...');
      const response: any = await GetAssetTypes(1);
      console.log('Asset Types Response:', response);
      setAssetTypes(response.results || response);
    } catch (error) {
      console.error('Asset Types Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCategories = async (assetTypeId: number) => {
    setLoading(true);
    try {
      console.log('Testing Categories API for asset type:', assetTypeId);
      const response: any = await GetAssetCategories(assetTypeId);
      console.log('Categories Response:', response);
      setCategories(response.results || response);
    } catch (error) {
      console.error('Categories Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testGroups = async (categoryId: number) => {
    setLoading(true);
    try {
      console.log('Testing Groups API for category:', categoryId);
      const response: any = await GetAssetGroups(categoryId);
      console.log('Groups Response:', response);
      setGroups(response.results || response);
    } catch (error) {
      console.error('Groups Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSubgroups = async (groupId: number) => {
    setLoading(true);
    try {
      console.log('Testing Subgroups API for group:', groupId);
      const response: any = await GetAssetSubgroups(groupId);
      console.log('Subgroups Response:', response);
      setSubgroups(response.results || response);
    } catch (error) {
      console.error('Subgroups Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAssetTypes();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">API Test Component</h2>
      
      <div className="space-y-6">
        {/* Asset Types */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Asset Types (site_id=1)</h3>
          <button 
            onClick={testAssetTypes}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test Asset Types'}
          </button>
          <div className="mt-2">
            {assetTypes.map((type: any) => (
              <div key={type.id} className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {type.id} - {type.name}
                </span>
                <button
                  onClick={() => testCategories(type.id)}
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                >
                  Test Categories
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <div className="mt-2">
              {categories.map((category: any) => (
                <div key={category.id} className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {category.id} - {category.name}
                  </span>
                  <button
                    onClick={() => testGroups(category.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Test Groups
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groups */}
        {groups.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Groups</h3>
            <div className="mt-2">
              {groups.map((group: any) => (
                <div key={group.id} className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {group.id} - {group.name}
                  </span>
                  <button
                    onClick={() => testSubgroups(group.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Test Subgroups
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subgroups */}
        {subgroups.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Subgroups</h3>
            <div className="mt-2">
              {subgroups.map((subgroup: any) => (
                <div key={subgroup.id} className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {subgroup.id} - {subgroup.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTest;
