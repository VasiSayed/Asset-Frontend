import React from 'react';

interface SelectProps {
  required?: boolean;
  label?: string;
  disabled?: boolean;
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  placeholder?: string;
  error?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string; // ✅ added
}

const Select: React.FC<SelectProps> = ({
  required = false,
  label,
  disabled = false,
  options,
  value,
  onChange,
  name,
  placeholder = "Select an option",
  error,
  onClick,
  className = "", // ✅ default
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    onChange(e);
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm mb-1 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex-1">
        <select
          name={name}
          id={name}
          required={required}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          onClick={handleClick}
          onMouseDown={(e) => e.stopPropagation()}
          className={`w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option value={opt} key={opt} className="text-black">
              {opt}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default Select;
