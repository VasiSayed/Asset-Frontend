import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextInput from '../components/TextInput';
import DatePicker from '../components/DatePicker';
import Select from '../components/Select';
import Checkbox from '../components/Checkbox';
import Tabs from '../components/Tabs';

type TabType = "Assets" | "AMC" | "Checklist" | "PPM" | "Stock Items";

interface ChecklistFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}


interface FormData {    
  name?: string;
  frequency?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  priorityLevel?: string;
  serviceSubGroups?: string;
  questionName?: string;
  selectGroup?: string;
  selectAnswerType?: string;
  mandatory?: boolean;
  reading?: boolean;
  helpText?: boolean;
  allowedTimeDay?: string;
  allowedTimeHours?: string;
  allowedTimeMinutes?: string;
  supervisors?: string;
  extensionTimeDay?: string;
  extensionTimeHours?: string;
  extensionTimeMinutes?: string;
  supplier?: string;
  lockOverdueTask?: string;
  cronDay?: string;
  cronHours?: string;
  cronMinutes?: string;
}

const Checklistform: React.FC<ChecklistFormProps> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialData || {});
  const [activeTab, setActiveTab] = useState<string>("Checklist");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handler for DatePicker which provides { target: { name, value } }
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Attempt to parse the date string, if it's valid, create a Date object, otherwise keep it null
    const dateValue = value ? new Date(value) : null;
    setFormData({ ...formData, [name]: dateValue });
  };

  // Handler for Checkbox which provides { target: { name, value } }
  const handleCheckboxChange = (e: { target: { name: string; value: boolean } }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTabChange = (key: string | number) => {
    setActiveTab(key.toString());
  };

  const handleSubmit = () => {
    // Perform any necessary data transformation before submitting
    onSubmit(formData);
    onClose(); // Close the form
    navigate('/assetmanagement'); // Navigate to checklist page
  };

  const handleClose = () => {
    onClose();
    navigate('/assetmanagement');
  };

  // Placeholder handlers for buttons within sections
  const handleAddQuestion = () => {
    console.log("Add Question clicked", formData.questionName, formData.selectGroup, formData.selectAnswerType, formData.mandatory, formData.reading, formData.helpText);
    // Add logic to add the question
  };

  const handleAddGroup = () => {
     console.log("Add Group clicked");
     // Add logic to add the current group/questions
  };

  const handleClearCronSetting = () => {
    setFormData({ ...formData, cronDay: '', cronHours: '', cronMinutes: '' });
    console.log("Clear Cron Setting clicked");
    // Add logic to clear cron setting
  };

  // Dummy data for Select components (replace with actual data)
  const groupOptions = ['Group 1', 'Group 2', 'Another Group'];
  const answerTypeOptions = ['Text', 'Number', 'Date', 'Dropdown', 'Checkbox'];
  const supervisorOptions = ['Supervisor A', 'Supervisor B', 'Supervisor C'];
  const supplierOptions = ['Supplier X', 'Supplier Y', 'Supplier Z'];
  const dayOptions = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']; // Corrected options for Day select
  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const tabs = [
    { key: "Assets", label: "Assets" },
    { key: "AMC", label: "AMC" },
    { key: "Checklist", label: "Checklist" },
    { key: "PPM", label: "PPM" },
    { key: "Stock Items", label: "Stock Items" }
  ];

  return (
    <div className="p-6 bg-white rounded shadow-md w-full h-full overflow-y-auto" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      <Tabs activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Top Section */}
        <TextInput
          label="Name:"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
        />
        <TextInput
          label="Frequency:"
          name="frequency"
          value={formData.frequency || ''}
          onChange={handleChange}
        />
        <DatePicker
          label="Start Date:"
          name="startDate"
          value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''} // Convert Date to string YYYY-MM-DD
          onChange={handleDateChange}
        />
        <DatePicker
          label="End Date:"
          name="endDate"
          value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''} // Convert Date to string YYYY-MM-DD
          onChange={handleDateChange}
        />
        <TextInput
          label="Priority Level:"
          name="priorityLevel"
          value={formData.priorityLevel || ''}
          onChange={handleChange}
        />
        <TextInput
          label="Service Sub Groups:"
          name="serviceSubGroups"
          value={formData.serviceSubGroups || ''}
          onChange={handleChange}
        />

        {/* Add New Group Section */}
        <div className="md:col-span-2 border p-4 rounded-md mt-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Group</h4>
          <TextInput
            label="Enter Question Name"
            name="questionName"
            value={formData.questionName || ''}
            onChange={handleChange}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Select
              label="Select Group"
              name="selectGroup"
              value={formData.selectGroup || ''}
              options={groupOptions}
              onChange={handleChange}
            />
            <Select
              label="Select Answer Type"
              name="selectAnswerType"
              value={formData.selectAnswerType || ''}
              options={answerTypeOptions}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Checkbox
              label="Mandatory"
              name="mandatory"
              checked={formData.mandatory || false}
              onChange={handleCheckboxChange}
            />
            <Checkbox
              label="Reading"
              name="reading"
              checked={formData.reading || false}
              onChange={handleCheckboxChange}
            />
            <Checkbox
              label="Help Text"
              name="helpText"
              checked={formData.helpText || false}
              onChange={handleCheckboxChange}
            />
          </div>
          <div className="flex gap-4 mt-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={handleAddQuestion}>Add Question</button>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition" onClick={handleAddGroup}>Add Group</button>
          </div>
        </div>

        {/* Schedules Section */}
        <div className="md:col-span-2 border p-4 rounded-md mt-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">Schedules</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Allowed time to submit</label>
              <div className="flex gap-2 mt-1">
                <TextInput label="" name="allowedTimeDay" value={formData.allowedTimeDay || ''} onChange={handleChange} />
                <TextInput label="" name="allowedTimeHours" value={formData.allowedTimeHours || ''} onChange={handleChange} />
                <TextInput label="" name="allowedTimeMinutes" value={formData.allowedTimeMinutes || ''} onChange={handleChange} />
              </div>
            </div>
            <Select
              label="Supervisors"
              name="supervisors"
              value={formData.supervisors || ''}
              options={supervisorOptions}
              onChange={handleChange}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">Extension Time</label>
              <div className="flex gap-2 mt-1">
                <TextInput label="" name="extensionTimeDay" value={formData.extensionTimeDay || ''} onChange={handleChange} />
                <TextInput label="" name="extensionTimeHours" value={formData.extensionTimeHours || ''} onChange={handleChange} />
                <TextInput label="" name="extensionTimeMinutes" value={formData.extensionTimeMinutes || ''} onChange={handleChange} />
              </div>
            </div>
            <Select
              label="Supplier"
              name="supplier"
              value={formData.supplier || ''}
              options={supplierOptions}
              onChange={handleChange}
            />
            <Select
              label="Lock Overdue Task"
              name="lockOverdueTask"
              value={formData.lockOverdueTask || ''}
              options={groupOptions}
              onChange={handleChange}
            />

            {/* Cron Setting */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cron Setting</label>
              <div className="flex items-center gap-2">
                <span className="text-sm">Every</span>
                <Select label="" name="cronDay" value={formData.cronDay || ''} options={dayOptions} onChange={handleChange} />
                <span className="text-sm">at</span>
                <Select label="" name="cronHours" value={formData.cronHours || ''} options={hourOptions} onChange={handleChange} />
                <span className="text-sm">:</span>
                <Select label="" name="cronMinutes" value={formData.cronMinutes || ''} options={minuteOptions} onChange={handleChange} />
                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition" onClick={handleClearCronSetting}>Clear</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save and Cancel Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          id="cancel-btn"
          className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={handleClose}
        >
          Cancel
        </button>
        <button
          id="save-btn"
          className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Checklistform;
