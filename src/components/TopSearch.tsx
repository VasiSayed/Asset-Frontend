import React from "react";
import { FiSearch } from "react-icons/fi";

interface TopSearchProps {
  searchActive: boolean;
  onSearchToggle: () => void;
  onButtonClick: (type: string) => void;
  buttons: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
 
  showInput?: boolean; // add this
}

const TopSearch: React.FC<TopSearchProps> = ({
  searchActive,
  onSearchToggle,
  onButtonClick,
  buttons,
  value,
  onChange,
  placeholder = "Search...",
  showInput = true, // default to true
  
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-start items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onSearchToggle}
          className={`p-2 ${searchActive ? "text-blue-600" : "text-gray-600"} hover:text-blue-600`}
        >
          <FiSearch size={20} />
        </button>
        {searchActive && showInput && (
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => onButtonClick(btn)}
            className="bg-white text-[#5E5E5E] px-3 py-2 rounded-md border border-[#9E9E9E] transition cursor-pointer"
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopSearch;
