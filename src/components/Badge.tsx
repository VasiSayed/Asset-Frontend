import React from "react";
import type { ReactNode } from "react";

type BadgeProps = {
  content: string;
  color?: string;
  variant?: "solid" | "outline" | "subtle";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: ReactNode;
};

const sizeMap = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
};

const Badge: React.FC<BadgeProps> = ({
  content,
  color = "bg-gray-200",
  variant = "solid",
  size = "md",
  className = "",
  icon,
}) => {
  const baseClasses = `inline-flex items-center font-medium rounded-full ${sizeMap[size] || ""} ${className}`;

  const variantClasses =
    variant === "solid"
      ? `${color} text-white`
      : variant === "outline"
      ? `border ${color} text-${color.split("-")[1]}-700`
      : `bg-${color.split("-")[1]}-100 text-${color.split("-")[1]}-700`;

  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {content}
    </span>
  );
};

export default Badge;
