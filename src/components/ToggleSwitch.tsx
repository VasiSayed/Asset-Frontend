import React from "react";
import { Bell } from "lucide-react"; 

interface ToggleSwitchProps {
  checked: boolean;                            
  onChange: (checked: boolean) => void;         
  disabled?: boolean;                           
  required?: boolean;                           
  name?: string;                               
}


const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  required = false,
  name = "",
}) => {
  

  const handleClick = () => {
    if (!disabled) {
      const newValue = !checked;
      onChange(newValue);                      
      console.log("Notification toggled:", newValue); 
    }
  };

  return (
    <div className="flex items-center gap-2">
      
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={checked}                 
        aria-required={required}               
        name={name}
        className="focus:outline-none"        
      >
        <div
          className={`p-1 rounded-full transition-colors duration-300
            ${checked
              ? "bg-green-500 text-white"       
              : "bg-transparent text-gray-500 border border-gray-400" 
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`} 
        >
          <Bell className="w-6 h-6" />    
        </div>
      </button>
    </div>
  );
};

export default ToggleSwitch;
