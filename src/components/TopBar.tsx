import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

interface TopBarProps {
  onSearch: (query: string) => void;
  onButtonClick: (type: string) => void;
  buttons: string[];
}

const TopBar: React.FC<TopBarProps> = ({ onSearch, onButtonClick, buttons }) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchClick = () => {
    setSearchVisible((prev) => !prev);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="flex flex-col md:flex-row justify-start items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={handleSearchClick}
          className="p-2 text-gray-600 hover:text-blue-600"
        >
          <FiSearch size={20} />
        </button>

        {searchVisible && (
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search..."
            className="p-2 border rounded-md w-[200px] transition-all duration-300"
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

export default TopBar;


