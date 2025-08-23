import React from "react";
import { ClipLoader, DotLoader } from "react-spinners";

// props interface for the loader component
interface LoaderProps {
  isLoading?: boolean;
  size?: number;
  color?: string;
  type?: "spinner" | "dots";
  message?: string;
  fullscreen?: boolean;
}

// Loader component function
const Loader: React.FC<LoaderProps> = ({
  isLoading = false,
  size = 40,
  color = "#000000",
  type = "spinner",
  message = "Loading, please wait...",
  fullscreen = false,
}) => {
  // If loader is not active, do not render anything
  if (!isLoading) return null;
  
  return (
    // Loader container can be fullscreen or inline 
    <div
      className={`flex flex-col items-center justify-center ${
        fullscreen ? "fixed inset-0 h-screen w-screen z-50" : "" 
      }`} 
    >
      {type === "spinner" ? (
        <ClipLoader color={color} size={size} />
      ) : (
        <DotLoader color={color} size={size} />
      )}
      {message && <p className="text-black mt-2">{message}</p>}
    </div>
  );
};

export default Loader;
