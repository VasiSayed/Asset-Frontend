import React, { useState } from 'react';
import Select from '../components/Select';
import IconButton from '../components/IconButton';
import Pagination from '../components/Pagination';
import Tabs from '../components/Tabs';
import {  FiTrash2,FiPlus,FiCheckCircle,FiFileText} from 'react-icons/fi';



interface Association {
  id: number;
  serviceName: string;
  assignedTo: string;
}

// Local Button component inside this file
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { tooltip?: string }> = ({
  children,
  tooltip,
  ...props
}) => {
  return (
    <button
      {...props}
      className={`px-4 py-2 bg-[#7991BB] text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${
        props.className || ''
      }`}
      title={tooltip}
      type={props.type || 'button'}
    >
      {children}
    </button>
  );
};

const AssociationBtn: React.FC = () => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>("Checklist");
  const [associations, setAssociations] = useState<Association[]>([
    {
      id: 1,
      serviceName: 'Cobweb',
      assignedTo: 'Akshat Shrawat, Test User 2 Testing, Vibe User',
    },
    {
      id: 2,
      serviceName: 'Washroom',
      assignedTo: 'Akshat Shrawat, Test User 2 Testing, Vibe User',
    },
  ]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(associations.length / PAGE_SIZE);
  const paginatedAssociations = associations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (key: string | number) => {
    setActiveTab(key.toString());
  };

  const tabs = [
    { key: "Assets", label: "Assets" },
    { key: "AMC", label: "AMC" },
    { key: "Checklist", label: "Checklist" },
    { key: "PPM", label: "PPM" },
    { key: "Stock Items", label: "Stock Items" }
  ];

  const handleCreateActivity = () => {
    if (selectedService && selectedUser) {
      const newEntry: Association = {
        id: Date.now(),
        serviceName: selectedService,
        assignedTo: selectedUser,
      };
      setAssociations(prev => [...prev, newEntry]);
      setSelectedService('');
      setSelectedUser('');
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  };

  const handleDelete = (id: number) => {
    setAssociations(prev => prev.filter(entry => entry.id !== id));
  };

  return (
    <div className="p-4 space-y-4" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      {/* Tabs Component */}
      <Tabs activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
      {/* Add and Export Buttons */}
      <div className="flex gap-2 mb-2">
        <Button>
          <FiPlus className="inline mr-2" />
          Add
        </Button>
        <Button>
          <FiFileText className="inline mr-2" />
          Export
        </Button>
      </div>


      {/* Header with title and pagination */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl mb-7 mt-7 font-bold">Associate Checklist</h1>
        {/* Pagination Controls */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={associations.length}
          onPageChange={setPage}
          showControls={true}
        />
      </div>

      <div className="flex items-center gap-4">
        <Select
          name="selectAsset"
          placeholder="Select Services"
          value={selectedService}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedService(e.target.value)}
          options={['Cobweb', 'Washroom', 'Lift', 'Lobby']}
        />

        <Select
          name="selectUser"
          placeholder="Select Users"
          value={selectedUser}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedUser(e.target.value)}
          options={[
            'Akshat Shrawat, Test User 2 Testing, Vibe User',
            'Another User, Test Role',
          ]}
        />

        <Button onClick={handleCreateActivity} tooltip="Create Association">
          Create Activity
        </Button>
      </div>

      {/* Success message box */}
      {showSuccessMessage && (
        <div className="flex items-center justify-center mt-4">
          <div className="flex items-center gap-2 bg-white border border-blue-500 shadow-md px-4 py-2 rounded">
            <FiCheckCircle className="text-blue-600 text-xl" />
            <span className="text-blue-700 font-medium">Activity Created Successfully</span>
          </div>
        </div>
      )}

      <div className="border rounded mt-4">
        <div className="grid grid-cols-3 font-semibold bg-gray-100 p-2 border-b">
          <div>Action</div>
          <div>Service Name</div>
          <div>Assigned To</div>
        </div>
        {paginatedAssociations.map(entry => (
          <div key={entry.id} className="grid grid-cols-3 items-center p-2 border-b">
            <div>
              <IconButton tooltip="Delete" onClick={() => handleDelete(entry.id)}>
                <FiTrash2 />
              </IconButton>
            </div>
            <div>{entry.serviceName}</div>
            <div>{entry.assignedTo}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssociationBtn;
