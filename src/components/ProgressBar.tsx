interface ProgressProps {
  value: number;
  label?: string;
  showLabel?: boolean;
  color?: string;
  animated?: boolean;
  max?: number;
}

export function Progress({
  value,
  label = "",
  showLabel = true,
  color = "blue",
  animated = true,
  max = 100,
}: ProgressProps) {
  const widthPercent = Math.min((value / max) * 100, 100);

  const colorClass = {
    blue: "bg-blue-500",
    red: "bg-red-500",
    green: "bg-green-500",
    yellow: "bg-yellow-400",
    gray: "bg-gray-500",
  }[color.toLowerCase()] || "bg-blue-500";

  return (
    <div className="relative w-full rounded bg-gray-200 h-6 overflow-hidden">
      <div
        className={`${colorClass} h-full transition-all duration-500 ease-in-out ${animated ? "animate-progress" : ""
          }`}
        style={{ width: `${widthPercent}%` }}
      />
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white select-none">
          {label || `${Math.round(widthPercent)}%`}
        </div>
      )}

    </div>
  );
}

export default function ProgressBar() {
  return (
    <div className="w-full max-w-sm">
      <h2 className="text-lg font-semibold mb-2">Progress</h2>
      <Progress
        value={70}
        label="Uploading..."
        showLabel={true}
        color="red"
        animated={true}
        max={100}
      />
    </div>
  );
}
