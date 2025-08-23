import React, { useState, useRef, type ReactNode } from "react";

interface TooltipProps {
  content: string;                              // Text shown inside the tooltip
  placement?: "top" | "bottom" | "left" | "right"; // Tooltip position relative to child
  trigger?: "hover" | "click" | "focus";        // Event that triggers the tooltip
  disabled?: boolean;                           // If true, tooltip is disabled
  showControls?: boolean;                       // If false, tooltip will not show
  delay?: number;                               // Delay (in ms) before showing tooltip
  className?: string;                           // Custom classes for tooltip styling
  children: ReactNode;                          // The element the tooltip wraps
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = "top",
  trigger = "hover",
  disabled = false,
  showControls = true,
  delay = 200,
  className = "text-xs bg-gray-700 text-white px-2 py-1 rounded",
  children,
}) => {
  const [visible, setVisible] = useState(false);           
  const timeoutRef = useRef<number | null>(null);         

  const showTooltip = () => {
    if (disabled || !showControls) return;
    timeoutRef.current = window.setTimeout(() => setVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const toggleTooltip = () => {
    if (disabled || !showControls) return;
    setVisible((prev) => {
      console.log(prev ? "Tooltip hidden" : "Tooltip shown"); 
      return !prev;
    });
  };

  const triggerProps =
    trigger === "hover"
      ? { onMouseEnter: showTooltip, onMouseLeave: hideTooltip }
      : trigger === "click"
      ? { onClick: toggleTooltip }
      : { onFocus: showTooltip, onBlur: hideTooltip };

  const getPosition = () => {
    switch (placement) {
      case "bottom":
        return "top-full mt-2 left-1/2 -translate-x-1/2";
      case "left":
        return "right-full mr-2 top-1/2 -translate-y-1/2";
      case "right":
        return "left-full ml-2 top-1/2 -translate-y-1/2";
      case "top":
      default:
        return "bottom-full mb-2 left-1/2 -translate-x-1/2";
    }
  };

  return (
    <div className="relative inline-block" {...triggerProps}>
      {children} {/* Wrapped target element (e.g. icon, button) */}
      {visible && (
        <div
          className={`absolute z-10 ${getPosition()} ${className} transition-opacity duration-300`}
        >
          {content} {/* Tooltip text */}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
