import React, { useState } from "react";
import TextInput from "../components/TextInput";
import Select from "../components/Select"; 
import TableHead from "../components/TopHead";


interface AddgdnProps {
  onSubmit: (data: any) => void;
}

const Addgdn: React.FC<AddgdnProps> = ({ onSubmit }) => {
  const [headerData, setHeaderData] = useState({
    gdnDate: "",
    description: "",
  });

  const [inventoryEntry, setInventoryEntry] = useState({
    inventory: "",
    quantity: "",
    purpose: "",
    comments: "",
  });

  const [inventoryList, setInventoryList] = useState<any[]>([]);

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHeaderData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInventoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInventoryEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInventory = () => {
    if (inventoryEntry.inventory && inventoryEntry.quantity) {
      setInventoryList((prev) => [...prev, inventoryEntry]);
      setInventoryEntry({ inventory: "", quantity: "", purpose: "", comments: "" });
    } else {
      alert("Inventory and Quantity are required");
    }
  };

  const handleSubmit = () => {
    if (!headerData.gdnDate) {
      alert("GDN Date is required");
      return;
    }
    if (inventoryList.length === 0) {
      alert("Add at least one inventory item");
      return;
    }

    const payload = {
      ...headerData,
      inventories: inventoryList,
    };

    onSubmit(payload);

    // Clear everything
    setHeaderData({ gdnDate: "", description: "" });
    setInventoryEntry({ inventory: "", quantity: "", purpose: "", comments: "" });
    setInventoryList([]);
  };

  return (
    <div className="p-4 space-y-6" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      <div className="text-center font-semibold text-lg border-b pb-2" style={{ fontFamily: "'PT Sans', sans-serif" }}>
        Add GDN
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="GDN Date"
          name="gdnDate"
          type="date"
          value={headerData.gdnDate}
          onChange={handleHeaderChange}
        />
        <TextInput
          label="Description"
          name="description"
          value={headerData.description}
          onChange={handleHeaderChange}
        />
      </div>

      <div className="text-center font-semibold text-lg border-b pb-2 pt-6">
        Add GDN
      </div>

      <div className="grid grid-cols-3 gap-4">
        <TextInput
          label="Inventory"
          name="inventory"
          value={inventoryEntry.inventory}
          onChange={handleInventoryChange}
        />
        <TextInput
          label="Quantity"
          name="quantity"
          value={inventoryEntry.quantity}
          onChange={handleInventoryChange}
        />
        <Select
          label="Purpose"
          name="purpose"
          value={inventoryEntry.purpose}
          onChange={handleInventoryChange}
          options={["Issue", "Transfer", "Repair"]}
        />
        <Select
          label="Comments"
          name="comments"
          value={inventoryEntry.comments}
          onChange={handleInventoryChange}
          options={["OK", "Needs Service", "Other"]}
        />
      </div>

      <div className="pt-4">
        <button
          onClick={handleAddInventory}
          className="bg-[#7991BB] text-white px-4 py-2 rounded"
        >
          Add Inventory
        </button>
      </div>

      {/* Optional Preview List */}
      {inventoryList.length > 0 && (
  <div className="pt-4">
    <table className="w-full border mt-2 text-left">
      <TableHead
        columns={[
          { label: "Inventory", align: "left" },
          { label: "Quantity", align: "left" },
          { label: "Purpose", align: "left" },
          { label: "Comments", align: "left" },
        ]}
      />
      <tbody>
        {inventoryList.map((inv, index) => (
          <tr key={index} className="border-b">
            <td className="p-2 border">{inv.inventory}</td>
            <td className="p-2 border">{inv.quantity}</td>
            <td className="p-2 border">{inv.purpose}</td>
            <td className="p-2 border">{inv.comments}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

      <div className="flex justify-center pt-6">
        <button onClick={handleSubmit} className="bg-[#7991BB] text-white px-6 py-2 rounded">
          Submit
        </button>
      </div>
    </div>
  );
};

export default Addgdn;
