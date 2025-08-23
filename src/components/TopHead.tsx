import React from "react";

interface Column {
  label: string;
  align?: "left" | "center" | "right";
}

interface TableHeadProps {
  columns: Column[];
}

const TableHead: React.FC<TableHeadProps> = ({ columns }) => {
  return (
    <thead>
      <tr className="bg-gray-100 text-gray-700">
        {columns.map((col, idx) => (
          <th
            key={idx}
            className={`p-3 border-b text-${col.align ?? "left"}`}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHead;
