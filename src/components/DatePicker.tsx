import React from "react";

export interface DatePickerProps {
  label: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  type?: "date" | "datetime-local" | "month" | "time";
  minDate?: string | Date;
  maxDate?: string | Date;
  value: string | Date;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  name,
  required = false,
  disabled = false,
  type = "date",
  minDate,
  maxDate,
  value,
  onChange,
  error,
}) => {
  // ✅ Normalize value to string acceptable by <input type="date">
  const formatDate = (val: string | Date): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (val instanceof Date && !isNaN(val.getTime())) {
      if (type === "datetime-local") {
        return val.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
      } else if (type === "month") {
        return val.toISOString().slice(0, 7); // yyyy-MM
      } else if (type === "time") {
        return val.toTimeString().slice(0, 5); // HH:mm
      }
      return val.toISOString().split("T")[0]; // yyyy-MM-dd
    }
    return "";
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        min={minDate ? formatDate(minDate) : undefined}
        max={maxDate ? formatDate(maxDate) : undefined}
        value={formatDate(value)}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default DatePicker;
