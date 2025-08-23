import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 👉 Interface to define the props that Pagination component expects
interface PaginationProps {
  currentPage: number;                 // Current active page number
  totalPages: number;                  // Total number of available pages
  totalItems: number;                  // Total number of items (used for display only)
  onPageChange: (page: number) => void; // Callback when page is changed
  showControls?: boolean;             // Optional: Show/hide previous/next buttons
  className?: string;                 // Optional: Custom styling
}

// 👉 Pagination component
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  showControls = true, // default to showing controls
  className = "flex items-center gap-2 justify-end text-sm text-gray-600", // default styling
}) => {
  return (
    <div className={className}>
      
      {/* 👉 Display current page info — e.g., "2-2 of 50" */}
      <span>{`${currentPage}-${currentPage} of ${totalItems}`}</span>

      {/* 👉 Navigation Controls (Previous / Next) */}
      {showControls && (
        <>
          {/* 👉 Previous Page Button */}
          <button
            onClick={() => {
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            disabled={currentPage === 1}
            className="p-1 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* 👉 Next Page Button */}
          <button
            onClick={() => {
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            disabled={currentPage === totalPages}
            className="p-1 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default Pagination;
