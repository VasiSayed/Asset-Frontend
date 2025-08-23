import React from "react";
import TextInput from "../components/TextInput";
import Select from "../components/Select";
import RadioButton from "../components/RadioButton";

interface FormData {
  inventoryType: string;
  criticality: string;
  minOrderLevel: string;
  unit: string;
  expiryDate: string;
  category: string;
  assetName: string;
  name: string;
  code: string;
  serialNumber: string;
  group: string;
  subgroup: string;
  quantity: string;
  minStockLevel: string;
  sacHsnCode: string;
  cost: string;
  sgstRate: string;
  cgstRate: string;
  igstRate: string;
}

interface AddMastersProps {
  onSubmit: (data: FormData) => void;
}

const initialState: FormData = {
  inventoryType: "",
  criticality: "",
  minOrderLevel: "",
  unit: "",
  expiryDate: "",
  category: "",
  assetName: "",
  name: "",
  code: "",
  serialNumber: "",
  group: "",
  subgroup: "",
  quantity: "",
  minStockLevel: "",
  sacHsnCode: "",
  cost: "",
  sgstRate: "",
  cgstRate: "",
  igstRate: "",
};

const Addmasters: React.FC<AddMastersProps> = ({ onSubmit }) => {
  const [formState, setFormState] = React.useState<FormData>(initialState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState); // Send data up to Masters
    setFormState(initialState); // Clear form
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-6xl mx-auto mt-4" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      {/* Basic Information Header */}
      <div className="bg-gray-200 px-4 py-2 mb-4" style={{ fontFamily: "'PT Sans', sans-serif" }}>
        <h2 className="text-center font-semibold text-gray-700">Basic Information</h2>
      </div>

      {/* Basic Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm mb-11 font-medium text-gray-700 whitespace-nowrap">
            Inventory Type:
          </label>
          <RadioButton
            name="inventoryType"
            label=""
            value={formState.inventoryType}
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ]}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm mb-11 font-medium text-gray-700 whitespace-nowrap">
            Criticality:
          </label>
          <RadioButton
            name="criticality"
            label=""
            value={formState.criticality}
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ]}
            onChange={handleChange}
          />
        </div>

        <TextInput label="Min. Order Level:" name="minOrderLevel" value={formState.minOrderLevel} onChange={handleChange} />
        <TextInput label="Select Unit:" name="unit" value={formState.unit} onChange={handleChange} />
        <TextInput label="Expiry Date:" name="expiryDate" type="date" value={formState.expiryDate} onChange={handleChange} />
        <TextInput label="Selected Category:" name="category" value={formState.category} onChange={handleChange} />
      </div>

      {/* Tax Section Header */}
      <div className="bg-gray-200 px-4 py-2 mb-4">
        <h2 className="text-center font-semibold text-gray-700">Tax Section</h2>
      </div>

      {/* Tax Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <TextInput label="Asset Name:" name="assetName" value={formState.assetName} onChange={handleChange} />
        <TextInput label="Name:" name="name" value={formState.name} onChange={handleChange} />
        <TextInput label="Code:" name="code" value={formState.code} onChange={handleChange} />

        <TextInput label="Serial Number:" name="serialNumber" value={formState.serialNumber} onChange={handleChange} />
        <Select
          label="Group:"
          name="group"
          value={formState.group}
          onChange={handleChange}
          options={["Group 1", "Group 2"]}
        />
        <TextInput label="Subgroup:" name="subgroup" value={formState.subgroup} onChange={handleChange} />

        <TextInput label="Quantity:" name="quantity" value={formState.quantity} onChange={handleChange} />
        <TextInput label="Min. Stock Level:" name="minStockLevel" value={formState.minStockLevel} onChange={handleChange} />
        <TextInput label="SAC/HSN Code:" name="sacHsnCode" value={formState.sacHsnCode} onChange={handleChange} />

        <TextInput label="Cost:" name="cost" value={formState.cost} onChange={handleChange} />
        <Select
          label="SGST Rate:"
          name="sgstRate"
          value={formState.sgstRate}
          onChange={handleChange}
          options={["5%", "12%", "18%"]}
        />
        <TextInput label="CGST Rate:" name="cgstRate" value={formState.cgstRate} onChange={handleChange} />

        <TextInput label="IGST Rate:" name="igstRate" value={formState.igstRate} onChange={handleChange} />
      </div>

      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className="bg-indigo-400 hover:bg-indigo-500 text-white px-10 py-2 rounded"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default Addmasters;
