/**
 * Design System Typography
 * Centralized typography scale and font definitions
 */

export const typography = {
  // Font families
  fonts: {
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "Consolas", "monospace"],
    display: ["Inter", "system-ui", "sans-serif"],
  },

  // Font sizes with line heights
  size: {
    xs: { fontSize: "0.75rem", lineHeight: "1rem" }, // 12px
    sm: { fontSize: "0.875rem", lineHeight: "1.25rem" }, // 14px
    base: { fontSize: "1rem", lineHeight: "1.5rem" }, // 16px
    lg: { fontSize: "1.125rem", lineHeight: "1.75rem" }, // 18px
    xl: { fontSize: "1.25rem", lineHeight: "1.75rem" }, // 20px
    "2xl": { fontSize: "1.5rem", lineHeight: "2rem" }, // 24px
    "3xl": { fontSize: "1.875rem", lineHeight: "2.25rem" }, // 30px
    "4xl": { fontSize: "2.25rem", lineHeight: "2.5rem" }, // 36px
    "5xl": { fontSize: "3rem", lineHeight: "1" }, // 48px
    "6xl": { fontSize: "3.75rem", lineHeight: "1" }, // 60px
  },

  // Font weights
  weight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Text styles for common use cases
  styles: {
    h1: {
      fontSize: "2.25rem",
      fontWeight: 700,
      lineHeight: "2.5rem",
      letterSpacing: "-0.025em",
    },
    h2: {
      fontSize: "1.875rem", 
      fontWeight: 600,
      lineHeight: "2.25rem",
      letterSpacing: "-0.025em",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: "2rem",
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: "1.75rem",
    },
    body: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: "1.5rem",
    },
    caption: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: "1.25rem",
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: "1.25rem",
    },
  },
} as const;

export type FontSizes = keyof typeof typography.size;
export type FontWeights = keyof typeof typography.weight;
export type TextStyles = keyof typeof typography.styles;