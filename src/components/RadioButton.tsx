import React from "react";

export interface RadioOption {
  label: string;
  value: string;
}

interface RadioButtonProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  options: RadioOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  required = false,
  disabled = false,
  options,
  value,
  onChange,
  name,
  error,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className="ml-2 text-sm text-gray-900"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default RadioButton;
