
interface TextAreaProps {
  required?: boolean;
  minimum_length?: number;
  maximum_length?: number;
  regex?: string;
  label?: string;
  disabled?: boolean;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  name: string;
  rows?: number;
  placeholder?: string;
  error?:string;
}

const TextArea: React.FC<TextAreaProps> = ({
  required ,
  minimum_length,
  maximum_length,
  regex,
  label,
  disabled = false,
  value,
  onChange,
  name,
  rows = 5,
  placeholder = "Enter your text...",
  error
}) => {
  


  return (
    // <div className="flex flex-col items-start gap-2 bg-[rgb(37,54,84)] p-4 rounded-md text-white">
      <div className="mb-4">
       <label className="block text-sm  mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
   
      <textarea
        name={name}
        id={name}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        minLength={minimum_length}
        maxLength={maximum_length}
        //className={`w-full p-3 rounded-md border${error ? 'border-red-500' : 'border-gray-300'}  text-white focus:outline-none focus:ring-2 focus:ring-blue-500 "bg-[rgb(37,54,84)]"`}
        className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}  ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}

      ></textarea>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
     
    </div>
  );
};

export default TextArea;
