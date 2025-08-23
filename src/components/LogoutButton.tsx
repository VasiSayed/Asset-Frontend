import { logout } from "../services/loginService";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast("👋 Logged out successfully", "success");
    navigate("/assetmanagement"); 
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
