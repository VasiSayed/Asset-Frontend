import React from "react";
import TextInput from "../components/TextInput";
import Select from "../components/Select";
import TextArea from "../components/TextArea";

interface AddStocksProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const AddStocks: React.FC<AddStocksProps> = ({ onSubmit, onCancel }) => {
  const [formState, setFormState] = React.useState({
    name: "",
    rate: "",
    availableQuantity: "",
    group: "",
    subGroup: "",
    maxStockLevel: "",
    minStockLevel: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
    setFormState({
      name: "",
      rate: "",
      availableQuantity: "",
      group: "",
      subGroup: "",
      maxStockLevel: "",
      minStockLevel: "",
      description: "",
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      <div className="bg-gray-200 px-4 py-2 mb-6">
        <h2 className="text-center font-semibold text-gray-700">Add Stock</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <TextInput label="Name:" name="name" value={formState.name} onChange={handleChange} />
          <TextInput label="Rate:" name="rate" value={formState.rate} onChange={handleChange} />
          <TextInput
            label="Available Quantity:"
            name="availableQuantity"
            value={formState.availableQuantity}
            onChange={handleChange}
          />
          <TextInput label="Group:" name="group" value={formState.group} onChange={handleChange} />
          <Select
            label="Sub Group:"
            name="subGroup"
            value={formState.subGroup}
            onChange={handleChange}
            options={["Group A", "Group B", "Group C"]}
          />
          <Select
            label="Min Stock Level:"
            name="minStockLevel"
            value={formState.minStockLevel}
            onChange={handleChange}
            options={["Low", "Medium", "High"]}
          />
          <TextInput
            label="Max Stock Level:"
            name="maxStockLevel"
            value={formState.maxStockLevel}
            onChange={handleChange}
          />
          <TextArea
            label="Description:"
            name="description"
            value={formState.description}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-center gap-4">
          <button
            type="submit"
            className="bg-[#7991BB] text-white px-8 py-2 rounded"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-8 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStocks;
