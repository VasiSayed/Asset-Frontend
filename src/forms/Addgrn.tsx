import React, { useState } from "react";
import TextInput from "../components/TextInput";
import Select from "../components/Select";
import FileUpload from "../components/FileUpload";

interface AddgrnProps {
  onSubmit: (data: any) => void;
}

const Addgrn: React.FC<AddgrnProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    purchaseOrder: "",
    supplier: "",
    paymentMode: "",
    invoiceNumber: "",
    relatedTo: "",
    invoiceAmount: "",
    invoiceDate: "",
    postingDate: "",
    otherExpense: "",
    loadingExpense: "",
    adjustmentAmount: "",
    notes: "",
    inventoryType: "",
    expectedQuantity: "",
    receivedQuantity: "",
    approvedQuantity: "",
    rejectedQuantity: "",
    rate: "",
    cgstRate: "",
    cgstAmount: "",
    sgstRate: "",
    sgstAmount: "",
    igstRate: "",
    igstAmount: "",
    amount: "",
    totalAmount: "",
    batchNo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      console.log("Uploaded files:", files);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData); // Send to GRN.tsx
  };

  return (
    <div className="p-4 space-y-6" style={{ fontFamily: "'PT Sans', sans-serif" }}>
      <div className="grid grid-cols-3 gap-4">
        <TextInput className="text-left" label="Purchase Order" name="purchaseOrder" value={formData.purchaseOrder} onChange={handleChange} />
        <Select className="text-left" label="Supplier" name="supplier" value={formData.supplier} onChange={handleChange} options={["Supplier A", "Supplier B"]} />
        <Select className="text-left" label="Payment Mode" name="paymentMode" value={formData.paymentMode} onChange={handleChange} options={["Cash", "Card", "Online"]} />

        <TextInput className="text-left" label="Invoice Number" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} />
        <TextInput className="text-left" label="Related To" name="relatedTo" value={formData.relatedTo} onChange={handleChange} />
        <TextInput className="text-left" label="Invoice Amount" name="invoiceAmount" value={formData.invoiceAmount} onChange={handleChange} />

        <TextInput className="text-left" label="Invoice Date" name="invoiceDate" type="date" value={formData.invoiceDate} onChange={handleChange} />
        <TextInput className="text-left" label="Posting Date" name="postingDate" type="date" value={formData.postingDate} onChange={handleChange} />
        <TextInput className="text-left" label="Other Expense" name="otherExpense" value={formData.otherExpense} onChange={handleChange} />

        <TextInput className="text-left" label="Loading Expense" name="loadingExpense" value={formData.loadingExpense} onChange={handleChange} />
        <TextInput className="text-left" label="Adjustment Amount" name="adjustmentAmount" value={formData.adjustmentAmount} onChange={handleChange} />
        <TextInput className="text-left" label="Notes" name="notes" value={formData.notes} onChange={handleChange} />
      </div>

      <div className="text-xl font-semibold text-center border-b pb-2 pt-6">Inventory Details</div>

      <div className="grid grid-cols-3 gap-4">
        <TextInput className="text-left" label="Inventory Type" name="inventoryType" value={formData.inventoryType} onChange={handleChange} />
        <Select className="text-left" label="Expected Quantity" name="expectedQuantity" value={formData.expectedQuantity} onChange={handleChange} options={["1", "2", "3"]} />
        <Select className="text-left" label="Received Quantity" name="receivedQuantity" value={formData.receivedQuantity} onChange={handleChange} options={["1", "2", "3"]} />

        <TextInput className="text-left" label="Approved Quantity" name="approvedQuantity" value={formData.approvedQuantity} onChange={handleChange} />
        <TextInput className="text-left" label="Rejected Quantity" name="rejectedQuantity" value={formData.rejectedQuantity} onChange={handleChange} />
        <TextInput className="text-left" label="Rate" name="rate" value={formData.rate} onChange={handleChange} />

        <TextInput className="text-left" label="CGST Rate" name="cgstRate" value={formData.cgstRate} onChange={handleChange} />
        <TextInput className="text-left" label="CGST Amount" name="cgstAmount" value={formData.cgstAmount} onChange={handleChange} />
        <TextInput className="text-left" label="SGST Rate" name="sgstRate" value={formData.sgstRate} onChange={handleChange} />

        <TextInput className="text-left" label="SGST Amount" name="sgstAmount" value={formData.sgstAmount} onChange={handleChange} />
        <TextInput className="text-left" label="IGST Rate" name="igstRate" value={formData.igstRate} onChange={handleChange} />
        <TextInput className="text-left" label="IGST Amount" name="igstAmount" value={formData.igstAmount} onChange={handleChange} />

        <TextInput className="text-left" label="Amount" name="amount" value={formData.amount} onChange={handleChange} />
        <TextInput className="text-left" label="Total Amount" name="totalAmount" value={formData.totalAmount} onChange={handleChange} />
        <TextInput className="text-left" label="Enter Batch No." name="batchNo" value={formData.batchNo} onChange={handleChange} />
      </div>

      <div className="flex gap-4 pt-4">
        <button className="bg-[#7991BB] text-white px-4 py-2 rounded">Add Batch</button>
        <button className="bg-red-600 text-white px-4 py-2 rounded">Delete Inventory</button>
      </div>

      <div className="pt-8">
        <div className="text-lg font-medium border-b pb-2">Attachments</div>
        <FileUpload
          label="Upload Files"
          accept=".pdf,.doc,.png,.jpg"
          multiple
          onChange={handleFileChange}
          fileSize="5MB"
        />
      </div>

      <div className="flex justify-center pt-6">
        <button onClick={handleSubmit} className="bg-[#7991BB] text-white px-6 py-2 rounded">Submit</button>
      </div>
    </div>
  );
};

export default Addgrn;
