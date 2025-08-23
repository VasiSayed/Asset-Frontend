import React, { useState } from 'react';
import Select from '../components/Select';
import DatePicker from '../components/DatePicker';
import FileUpload from '../components/FileUpload';

interface AddAMCFormProps {
  onSubmit: (data: {
    vendor: string;
    location: string;
    startDate: string;
    endDate: string;
    file: File | null;
  }) => void;
  initialValues?: {
    vendor?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    file?: File | null;
  };
  title?: string;
}

const vendorOptions = ['Vendor A', 'Vendor B', 'Vendor C', 'Vinay'];
const locationOptions = ['Location A', 'Location B', 'Location C', 'Digi'];

const AddAMCForm: React.FC<AddAMCFormProps> = ({ onSubmit, initialValues, title }) => {
  const [formData, setFormData] = useState({
    vendor: initialValues?.vendor || '',
    location: initialValues?.location || '',
    startDate: initialValues?.startDate || '',
    endDate: initialValues?.endDate || '',
    file: initialValues?.file || null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files: FileList | null) => {
    setFormData(prev => ({ ...prev, file: files?.[0] || null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md shadow-md max-w-xl mx-auto" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      <h2 className="text-lg font-semibold mb-6 text-center border-b pb-2">
        {title || 'Add AMC'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Select
          label="Vendor"
          name="vendor"
          options={vendorOptions}
          value={formData.vendor}
          onChange={handleInputChange}
        />
        <DatePicker
          label="Start Date"
          name="startDate"
          value={formData.startDate}
          onChange={handleInputChange}
        />
        <Select
          label="Location"
          name="location"
          options={locationOptions}
          value={formData.location}
          onChange={handleInputChange}
        />
        <DatePicker
          label="End Date"
          name="endDate"
          value={formData.endDate}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Upload AMC Terms</label>
        <FileUpload onChange={handleFileChange} />
      </div>

      <div className="text-center">
        <button type="submit" className="bg-[#7991BB] text-white px-6 py-2 rounded">
          Submit
        </button>
      </div>
    </form>
  );
};

export default AddAMCForm;
