/**
 * Design System
 * Central export for all design tokens and constants
 */

export { colors, type ColorKeys, type ColorVariants } from "./colors";
export { typography, type FontSizes, type FontWeights, type TextStyles } from "./typography";
export { spacing, type SpacingScale, type ComponentSpacing } from "./spacing";

// Animation constants
export const animations = {
  duration: {
    fast: "150ms",
    normal: "300ms", 
    slow: "500ms",
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
} as const;

// Border radius constants
export const borderRadius = {
  none: "0",
  sm: "0.125rem",   // 2px
  md: "0.375rem",   // 6px
  lg: "0.5rem",     // 8px
  xl: "0.75rem",    // 12px
  "2xl": "1rem",    // 16px
  "3xl": "1.5rem",  // 24px
  full: "9999px",
} as const;

// Shadow constants
export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  tournament: "0 4px 20px rgba(59, 130, 246, 0.3)",
  "tournament-hover": "0 8px 30px rgba(59, 130, 246, 0.4)",
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  sm: "640px",
  md: "768px", 
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export type AnimationDuration = keyof typeof animations.duration;
export type BorderRadius = keyof typeof borderRadius;
export type Shadows = keyof typeof shadows;
export type Breakpoints = keyof typeof breakpoints;