import React, { useRef, useEffect } from "react";
import type { ReactNode } from "react";

type DropdownItem = {
  label: string;
  onClick: () => void;
};

type DropdownMenuProps = {
  items: DropdownItem[];
  trigger: ReactNode;
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  open: boolean;
  onToggle: (open: boolean) => void;
  className?: string;
  disabled?: boolean;
};

const positionClassMap = {
  "bottom-left": "top-full left-0",
  "bottom-right": "top-full right-0",
  "top-left": "bottom-full left-0",
  "top-right": "bottom-full right-0",
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  trigger,
  position = "bottom-left",
  open,
  onToggle,
  className = "",
  disabled = false,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onToggle(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onToggle(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onToggle]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!disabled) onToggle(!open);
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <div
        onClick={() => !disabled && onToggle(!open)}
        onKeyDown={handleTriggerKeyDown}
        tabIndex={0}
        role="button"
        aria-haspopup="true"
        aria-expanded={open}
        className={disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      >
        {trigger}
      </div>

      {open && (
        <div
          className={`absolute ${positionClassMap[position]} mt-2 bg-white shadow-md rounded-md z-50 transition-all duration-200 ease-out ${className}`}
          role="menu"
          aria-hidden={!open}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              role="menuitem"
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              onClick={() => {
                item.onClick();
                onToggle(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
