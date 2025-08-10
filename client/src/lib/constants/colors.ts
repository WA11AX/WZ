/**
 * Design System Colors
 * Centralized color constants for consistent theming
 */

export const colors = {
  // Primary brand colors
  primary: {
    50: "#eff6ff",
    100: "#dbeafe", 
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },

  // Telegram brand colors
  telegram: {
    blue: "#0088cc",
    lightBlue: "#54a9eb",
    darkBlue: "#006bb3",
  },

  // Tournament specific colors
  tournament: {
    gold: "#ffd700",
    silver: "#c0c0c0", 
    bronze: "#cd7f32",
    trophy: "#ffb700",
  },

  // Status colors
  status: {
    success: "#10b981",
    warning: "#f59e0b", 
    error: "#ef4444",
    info: "#3b82f6",
  },

  // Semantic colors
  semantic: {
    background: "#f8fafc",
    surface: "#ffffff",
    border: "#e2e8f0",
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
      muted: "#94a3b8",
    },
  },

  // Gradient colors
  gradients: {
    blue: "from-blue-400 to-blue-600",
    green: "from-green-400 to-green-600", 
    orange: "from-orange-400 to-orange-600",
    purple: "from-purple-400 to-purple-600",
    tournament: "from-yellow-400 via-orange-500 to-red-500",
  },
} as const;

export type ColorKeys = keyof typeof colors;
export type ColorVariants = keyof typeof colors.primary;