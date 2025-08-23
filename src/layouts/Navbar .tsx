import React from "react";
import { Bell, Settings, User } from "lucide-react";

const Navbar: React.FC = () => {
  return (
    <div className="w-full fixed top-0 left-0 z-50">
      <div
        className="relative bg-gradient-to-r from-blue-700 to-blue-800 px-8 py-4 flex items-center justify-between shadow-lg max-w-full"
        style={{
          clipPath: "polygon(2% 0%, 98% 0%, 96% 100%, 4% 100%)",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center overflow-hidden border border-white shadow-sm">
            <User className="w-6 h-6 text-blue-700" />
          </div>

          <h1 className="text-white text-xl font-semibold tracking-wide">
            Vibe Connect
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 hover:bg-blue-700/40 rounded-full transition-all duration-200 hover:scale-105">
            <Bell className="w-5 h-5 text-white" />
          </button>

          <button className="p-2.5 hover:bg-blue-700/40 rounded-full transition-all duration-200 hover:scale-105">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;