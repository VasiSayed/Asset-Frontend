import PhoneInputLib from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface PhoneInputProps {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  error: string;
}

const PhoneInput = ({
  label,
  name,
  required,
  disabled,
  value,
  onChange,
  error
}: PhoneInputProps) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <PhoneInputLib
        country={'us'}
        value={value}
        onChange={(phone) => onChange({ target: { name, value: phone } })}
        disabled={disabled}
        inputClass={`!pl-14 !pr-3 !py-2 !h-[40px] !rounded-md !border ${error ? '!border-red-500' : '!border-gray-300'} !w-full !focus:outline-none`}
        containerClass={`!w-full ${disabled ? 'opacity-75 cursor-not-allowed' : ''}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default PhoneInput;