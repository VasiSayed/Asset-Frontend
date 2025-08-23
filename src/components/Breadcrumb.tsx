import React, { type ReactNode } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

// 👉 Defines a breadcrumb item structure
interface BreadcrumbItem {
  label: string; // Text to be shown
  href: string;  // Navigation URL (currently unused but can be helpful for future routing)
}

// 👉 Props accepted by the Breadcrumb component
interface BreadcrumbProps {
  items: BreadcrumbItem[];                     // List of breadcrumb items
  separator?: string | ReactNode;             // Optional separator between items (defaults to an icon)
  current?: string;                           // Optional current breadcrumb item (to highlight)
  onClick?: (item: BreadcrumbItem) => void;   // Click handler for navigable breadcrumb items
  onPrevious?: () => void;                    // Optional callback for previous button
  onNext?: () => void;                        // Optional callback for next button
  className?: string;                         // Optional custom styling
}

// 👉 Breadcrumb component
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4 mx-1" />, // Default separator
  current,
  onClick,
  onPrevious,
  onNext,
  className = "text-sm text-gray-500", // Default breadcrumb styling
}) => {
  return (
    <nav className={`flex items-center ${className}`} aria-label="Breadcrumb">
      
      {/* 👉 Optional Previous Button (on the far left) */}
        {onPrevious && (
        <button
          onClick={onPrevious}
          className="mr-2 p-1 hover:text-black"
          aria-label="Previous"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* 👉 Render breadcrumb items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCurrent = current ? item.label === current : isLast;

        return (
          <span key={index} className="flex items-center">
            {/* Add separator before each item except the first */}
            {index !== 0 && <span className="mx-1">{separator}</span>}

            {/* If it's the current item, highlight it; otherwise render as a button */}
            {isCurrent ? (
              <span className="font-medium text-gray-900">{item.label}</span>
            ) : (
              <button
                onClick={() => onClick?.(item)}
                className="hover:underline focus:outline-none"
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}

      {/* 👉 Optional Next Button (on the far right) */}
        {onNext && (
        <button
          onClick={onNext}
          className="ml-2 p-1 hover:text-black"
          aria-label="Next"
          type="button"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
};

export default Breadcrumb;
