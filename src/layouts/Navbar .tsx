import React from "react";
import { Bell, Settings, User } from "lucide-react";
import LogoutButton from "../components/LogoutButton"; // ✅ import logout

const Navbar: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-screen z-50">
      <div
        className="relative flex items-center justify-between shadow-lg"
        style={{
          backgroundColor: "#0A2E6D", // Solid dark royal blue
          clipPath: "polygon(1.5% 0%, 98.5% 0%, 97% 100%, 3% 100%)",
          padding: "1rem 2.5rem",
        }}
      >
        {/* Left side - Profile and Title */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center overflow-hidden border border-white shadow-sm">
            <User className="w-6 h-6 text-blue-700" />
          </div>

          <h1 className="text-white text-xl font-semibold tracking-wide">
            Vibe Connect
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2.5 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-105">
            <Bell className="w-5 h-5 text-white" />
          </button>

          <button className="p-2.5 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-105">
            <Settings className="w-5 h-5 text-white" />
          </button>

          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
