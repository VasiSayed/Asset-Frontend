import React, { useState } from 'react';
import { FiSearch, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import NoDataFound from '../../components/NoDataFound';
import TableHead from '../../components/TopHead';
import Pagination from '../../components/Pagination';
import IconButton from '../../components/IconButton';
import { useNavigate } from 'react-router-dom';
import AddAMCForm from '../../forms/AddAMCForm';

const PAGE_SIZE = 10;

const AMCExpiredAssets: React.FC = () => {
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([
    {
      name: 'Printer',
      location: 'Office',
      expiredday: '20',
      amcstartdate: '2023-01-01',
      amcenddate: '2024-01-01',
    },
  ]);

  const handleAddAMCSubmit = (formData: any) => {
    console.log('Submitted:', formData);
    const newAsset = {
      name: 'New Asset',
      location: formData.location,
      expiredday: '30',
      amcstartdate: formData.startDate,
      amcenddate: formData.endDate,
    };
    setData(prev => [...prev, newAsset]);
    setShowForm(false);
  };

  const columns = ['Action', 'Name', 'Location', 'Expired Day', 'AMC Start Date', 'AMC End Date'];

  const filteredData = data.filter(item =>
    Object.values(item).some(val => String(val).toLowerCase().includes(searchValue.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-4 bg-white rounded-md shadow-md" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      {showForm ? (
        <AddAMCForm onSubmit={handleAddAMCSubmit} />

      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex gap-2 items-center">
              <button
                aria-label="Search"
                className="text-xl"
                onClick={() => setSearchActive(!searchActive)}
              >
                <FiSearch />
              </button>
              <button
                className="bg-[#7991BB] text-white px-3 py-1 rounded transition"
                onClick={() => setShowForm(true)}
              >
                + Add AMC
              </button>
              <button className="bg-gray-100 px-3 py-1 rounded border">QR Code</button>
              {/* <button className="bg-gray-100 px-3 py-1 rounded border">Hide Columns</button>
              <button className="bg-gray-100 px-3 py-1 rounded border">Import</button> */}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filteredData.length}
              onPageChange={setPage}
              showControls={true}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <TableHead columns={columns.map(label => ({ label }))} />
              <thead>
                {searchActive && (
                  <tr>
                    {columns.map((col, idx) => (
                      <td key={col} className="border px-2 py-1">
                        {idx === columns.length - 1 ? (
                          <button className="bg-gray-200 text-sm px-2 py-1 rounded" disabled>
                            Go
                          </button>
                        ) : (
                          <input
                            type="text"
                            className="w-full border rounded px-1 py-0.5 text-sm"
                            placeholder={`Search ${col}`}
                            onChange={e => setSearchValue(e.target.value)}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className="p-2 border-b">
                          {col === 'Action' ? (
                            <span className="inline-flex items-center gap-2">
                              <IconButton tooltip="Edit" onClick={() => {}}>
                                <FiEdit />
                              </IconButton>
                              <IconButton tooltip="Delete" onClick={() => {}}>
                                <FiTrash2 />
                              </IconButton>
                              <IconButton tooltip="View" onClick={() => {}}>
                                <FiEye />
                              </IconButton>
                            </span>
                          ) : (
                            item[col.toLowerCase().replace(/\s/g, '')] || '-'
                          )}
                        </td>
                      ))}
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
        </>
      )}
    </div>
  );
};

export default AMCExpiredAssets;
