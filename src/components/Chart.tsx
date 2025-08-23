import {
  LineChart,
  BarChart,
  PieChart,
  Pie,
  Cell,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import type { FC } from "react";

interface ChartProps {
  type: "line" | "bar" | "pie";
  data: any;
  options?: any;
  width?: number;
  height?: number;
  className?: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const Chart: FC<ChartProps> = ({
  type = "line",
  data,
  options = {
    responsive: true,
    plugins: { legend: { position: "top" } },
  },
  width = 400,
  height = 300,
  className = "w-full h-auto p-4 bg-white rounded shadow",
}) => {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-2 capitalize">{type} Chart</h2>

      {type === "line" && (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {type === "bar" && (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {type === "pie" && (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((_:any, index:any)=> (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Chart;
