// toast.tsx
import React from "react";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
} from "react-icons/fa";

export type ToastType = "success" | "error" | "info";

type TypeStyle = {
  accent: string;
  icon: React.ReactNode;
  text: string; // Tailwind text classes
};

/**
 * @param msg   
 * @param type  
 * @param durationMs Toast duration in ms (default 3000)
 */
export const showToast = (
  msg: string,
  type: ToastType = "info",
  durationMs: number = 3000
): void => {
  const typeStyles: Record<ToastType, TypeStyle> = {
    success: {
      accent: "linear-gradient(135deg, #22c55e 0%, #7cf19e 100%)",
      icon: <FaCheckCircle className="text-green-500 text-lg" />,
      text: "text-green-900 dark:text-green-200",
    },
    error: {
      accent: "linear-gradient(135deg, #ea3d22 0%, #ffd6d6 100%)",
      icon: <FaExclamationCircle className="text-red-500 text-lg" />,
      text: "text-red-900 dark:text-red-200",
    },
    info: {
      accent: "linear-gradient(135deg, #ea6822 0%, #ffd600 100%)",
      icon: <FaInfoCircle className="text-yellow-500 text-lg" />,
      text: "text-gray-900 dark:text-yellow-100",
    },
  };

  const { accent, icon, text } = typeStyles[type];

  toast.custom(
    (t) => (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border border-gray-200 dark:border-yellow-500/20 bg-white dark:bg-[#23232e] min-w-[250px] max-w-xs relative animate-fade-in"
        style={{
          boxShadow:
            "0 6px 24px 0 rgba(34, 34, 80, 0.12), 0 1.5px 6px 0 rgba(34, 34, 80, 0.18)",
        }}
      >
        {/* Left accent bar */}
        <span
          className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
          style={{ background: accent }}
        />
        <span className="pl-1">{icon}</span>
        <span className={`flex-1 ${text} pl-1`}>{msg}</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-xl text-gray-400 hover:text-red-500 font-bold px-2 transition-colors"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    ),
    { duration: durationMs }
  );
};
