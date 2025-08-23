import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react"; // optional: if using Lucide icons

type AccordionItemType = {
  title: string;
  content: ReactNode;
};

type AccordionProps = {
  items: AccordionItemType[];
  allowMultiple?: boolean;
  defaultOpen?: number | number[];
  onToggle?: (index: number) => void;
  className?: string;
  icon?: ReactNode;
};

export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  onToggle,
  className = "border rounded shadow-sm divide-y bg-white",
  icon = <ChevronDownIcon className="w-4 h-4" />,
}: AccordionProps) {
  const initialOpen = Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
  const [openIndexes, setOpenIndexes] = useState<number[]>(initialOpen);

  const toggleItem = (index: number) => {
    let newOpen: number[];
    const isOpen = openIndexes.includes(index);

    if (allowMultiple) {
      newOpen = isOpen
        ? openIndexes.filter((i) => i !== index)
        : [...openIndexes, index];
    } else {
      newOpen = isOpen ? [] : [index];
    }

    setOpenIndexes(newOpen);
    onToggle?.(index);
  };

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);
        return (
          <div key={index} className="p-2">
            <button
              className="flex items-center justify-between w-full font-medium"
              onClick={() => toggleItem(index)}
            >
              {item.title}
              <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
                {icon}
              </span>
            </button>
            {isOpen && (
              <div className="mt-2 text-sm text-gray-700">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
