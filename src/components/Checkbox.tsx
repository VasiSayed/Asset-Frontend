interface CheckboxProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  checked: boolean;
  onChange: (e: { target: { name: string; value: boolean } }) => void;
  name: string;
  error?:boolean;
}

const Checkbox = ({
  label,
  required = false,
  disabled = false,
  checked,
  onChange,
  name,
  error
}: CheckboxProps) => {
  return (
    <>
    <div className="mb-4 flex items-center">
      <input
        type="checkbox"
        id={name}
        checked={checked}
        onChange={(e) => onChange({ target: { name, value: e.target.checked } })}
        disabled={disabled}
        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
     {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
     </>
  );
};

export default Checkbox;