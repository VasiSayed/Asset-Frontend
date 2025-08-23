import React, { useState } from 'react';
import { FiEye, FiEdit, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import NoDataFound from '../../components/NoDataFound';
import TableHead from '../../components/TopHead';
import Pagination from '../../components/Pagination';
import Checklistform from '../../forms/Checklistform';
import IconButton from '../../components/IconButton';

const PAGE_SIZE = 10;

const ChecklistTab: React.FC = () => {
  const [searchActive, setSearchActive] = useState(false);
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);

  // Added id field for routing
  const [data] = useState([
    {
      id: 1,
      name: 'Checklist',
      startDate: '26/11/2024',
      endDate: '26/11/2024',
      groupCount: 2,
      frequency: 'Daily',
      priority: 'High',
    },
    {
      id: 2,
      name: 'User',
      startDate: '15/10/2024',
      endDate: '15/10/2024',
      groupCount: 2,
      frequency: 'Half Yearly',
      priority: 'Medium',
    },
    {
      id: 3,
      name: 'Test',
      startDate: '11/10/2024',
      endDate: '11/10/2024',
      groupCount: 2,
      frequency: 'Daily',
      priority: 'Akshat Shrawat',
    },
  ]);

  const columns = [
    'Action',
    'Name',
    'Start Date',
    'End Date',
    'No. Of Group',
    'Frequency',
    'Priority Level',
    'Associations',
  ];

  // Filtering logic based on single searchValue across relevant columns
  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchValue.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-4 bg-white rounded-md shadow-md" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      {/* Top Buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          {/* Search Icon to toggle search row */}
          <button
            aria-label="Toggle Search"
            className="text-xl text-gray-600 hover:text-gray-800"
            onClick={() => setSearchActive(!searchActive)}
          >
            <FiSearch />
          </button>

          <button
            className="bg-[#7991BB] text-white px-3 py-1 rounded transition"
            onClick={() => navigate('/addchecklist')}
          >
            + Add
          </button>
          <button className="bg-gray-100 px-3 py-1 rounded border">Export</button>
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredData.length}
          onPageChange={setPage}
          showControls={true}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-200">
          <TableHead columns={columns.map((label) => ({ label }))} />
          {/* Search input row, toggled by searchActive */}
          <thead>
            {searchActive && (
              <tr>
                {/* Add empty td for Action column */}
                <td className="p-2 border-b"></td>
                {/* Add input for searchable columns */}
                {[
                  'Name',
                  'Start Date',
                  'End Date',
                  'No. Of Group',
                  'Frequency',
                  'Priority Level',
                  'Associations',
                ].map((col) => (
                  <td key={col} className="border px-2 py-1">
                    {/* Render input only for searchable columns */}
                    {['Name', 'Start Date', 'End Date', 'Frequency', 'Priority Level'].includes(col) ? (
                      <input
                        type="text"
                        className="w-full border rounded px-1 py-0.5 text-sm"
                        placeholder={`Search`}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                    ) : (
                      <div className="h-full"></div>
                    )}
                  </td>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 text-sm">
                  <td className="p-2 border-b">
                    <div className="flex gap-2">
                      <IconButton tooltip="View">
                        <FiEye />
                      </IconButton>
                      <IconButton
                        tooltip="Edit"
                        onClick={() => navigate('/add-checklist', { state: { initialData: item } })}
                      >
                        <FiEdit />
                      </IconButton>
                    </div>
                  </td>
                  <td className="p-2 border-b">{item.name}</td>
                  <td className="p-2 border-b">{item.startDate}</td>
                  <td className="p-2 border-b">{item.endDate}</td>
                  <td className="p-2 border-b">{item.groupCount}</td>
                  <td className="p-2 border-b">{item.frequency}</td>
                  <td className="p-2 border-b">{item.priority}</td>
                  <td className="p-2 border-b">
                    <button
                      className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs"
                      onClick={() => navigate(`/checklist/${item.id}/associations`)}
                    >
                      Associations
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                  <NoDataFound />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChecklistTab;
