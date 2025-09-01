import React, { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { logout } from "../services/loginService";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";

type Props = { className?: string };

const LogoutIconButton: React.FC<Props> = ({ className }) => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    if (busy) return;
    try {
      setBusy(true);
      await logout();
      showToast("Logged out successfully", "success");
      navigate("/assetmanagement");
    } catch {
      showToast("Couldn’t log out. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={busy}
      aria-label="Logout"
      title="Logout"
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60 ${
        className || ""
      }`}
    >
      <FiLogOut className="w-5 h-5" />
    </button>
  );
};

export default LogoutIconButton;