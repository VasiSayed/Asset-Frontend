import React from "react";
import type { ReactNode } from "react";

type AlertProps = {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  dismissible?: boolean;
  onClose?: () => void;
  icon?: ReactNode;
  className?: string;
};

const alertStyles = {
  success: "bg-green-50 text-green-800 border border-green-200",
  error: "bg-red-50 text-red-800 border border-red-200",
  warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  info: "bg-blue-50 text-blue-800 border border-blue-200",
};

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  dismissible = false,
  onClose,
  icon,
  className = "",
}) => {
  return (
    <div
      className={`p-4 rounded flex items-start space-x-3 ${alertStyles[type]} ${className}`}
    >
      {icon && <div className="mt-1">{icon}</div>}
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm ml-8">{message}</p>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-lg font-bold px-2 hover:opacity-60"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
