import React, { useState } from "react";
import type { ReactNode } from "react";

type AvatarProps = {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | string;
  rounded?: boolean;
  className?: string;
  fallbackIcon?: ReactNode;
};

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name = "",
  size = "md",
  rounded = true,
  className = "",
  fallbackIcon,
}) => {
  const [hasError, setHasError] = useState(false);

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";

  const shape = rounded ? "rounded-full" : "rounded-md";
  const sizeClass = typeof size === "string" && (["sm", "md", "lg"] as const).includes(size as any)
    ? sizeMap[size as "sm" | "md" | "lg"]
    : size;

  return (
    <div
      className={`inline-flex items-center justify-center bg-gray-200 text-gray-700 font-semibold ${shape} ${sizeClass} ${className}`}
    >
      {!hasError && src ? (
        <img
          src={src}
          alt={alt}
          className={`object-cover ${shape} ${sizeClass}`}
          onError={() => setHasError(true)}
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        fallbackIcon || <span>?</span>
      )}
    </div>
  );
};

export default Avatar;
