import React, { useEffect } from "react";
import type { ReactNode } from "react";

type ToasterProps = {
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  position?: string;
  isVisible: boolean;
  onClose: () => void;
  icon?: ReactNode;
  className?: string;
};

const typeStyles = {
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-100 text-blue-800",
};

const NotificationToaster: React.FC<ToasterProps> = ({
  message,
  type,
  duration = 3000,
  position = "top-right",
  isVisible,
  onClose,
  icon,
  className = "",
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const positionClass = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  }[position] || "top-4 right-4";

  return (
    <div
      className={`fixed z-50 ${positionClass} px-4 py-2 rounded shadow transition-opacity duration-300 ${typeStyles[type]} ${className}`}
    >
      <div className="flex items-center space-x-2">
        {icon && <span>{icon}</span>}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default NotificationToaster;
