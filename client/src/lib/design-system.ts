import { COLORS, ANIMATIONS, BREAKPOINTS } from '../constants';

/**
 * Design System Configuration
 * Provides consistent styling utilities and theme definitions
 */

// Typography scale following modular scale
export const TYPOGRAPHY = {
  FONT_FAMILY: {
    SANS: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    MONO: '"JetBrains Mono", "Fira Code", Consolas, monospace',
  },
  FONT_SIZE: {
    XS: '0.75rem',    // 12px
    SM: '0.875rem',   // 14px
    BASE: '1rem',     // 16px
    LG: '1.125rem',   // 18px
    XL: '1.25rem',    // 20px
    '2XL': '1.5rem',  // 24px
    '3XL': '1.875rem', // 30px
    '4XL': '2.25rem', // 36px
  },
  FONT_WEIGHT: {
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
    EXTRABOLD: '800',
  },
  LINE_HEIGHT: {
    TIGHT: '1.25',
    SNUG: '1.375',
    NORMAL: '1.5',
    RELAXED: '1.625',
    LOOSE: '2',
  },
} as const;

// Spacing scale based on 4px grid
export const SPACING = {
  '0': '0',
  '1': '0.25rem',  // 4px
  '2': '0.5rem',   // 8px
  '3': '0.75rem',  // 12px
  '4': '1rem',     // 16px
  '5': '1.25rem',  // 20px
  '6': '1.5rem',   // 24px
  '8': '2rem',     // 32px
  '10': '2.5rem',  // 40px
  '12': '3rem',    // 48px
  '16': '4rem',    // 64px
  '20': '5rem',    // 80px
  '24': '6rem',    // 96px
} as const;

// Shadow system
export const SHADOWS = {
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2XL': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  INNER: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  TOURNAMENT: '0 8px 32px rgba(0, 136, 204, 0.15)',
  TOURNAMENT_HOVER: '0 12px 40px rgba(0, 136, 204, 0.25)',
} as const;

// Border radius scale
export const BORDER_RADIUS = {
  NONE: '0',
  SM: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  MD: '0.375rem',   // 6px
  LG: '0.5rem',     // 8px
  XL: '0.75rem',    // 12px
  '2XL': '1rem',    // 16px
  '3XL': '1.5rem',  // 24px
  FULL: '9999px',
} as const;

// Component variants
export const COMPONENT_VARIANTS = {
  BUTTON: {
    PRIMARY: {
      background: COLORS.GRADIENTS.BLUE,
      color: 'white',
      border: 'none',
      shadow: SHADOWS.MD,
      hover: {
        transform: 'translateY(-1px)',
        shadow: SHADOWS.LG,
      },
    },
    SECONDARY: {
      background: 'white',
      color: COLORS.PRIMARY.BLUE,
      border: `1px solid ${COLORS.PRIMARY.BLUE}`,
      shadow: SHADOWS.SM,
      hover: {
        background: COLORS.PRIMARY.BLUE,
        color: 'white',
      },
    },
    GHOST: {
      background: 'transparent',
      color: COLORS.PRIMARY.BLUE,
      border: 'none',
      hover: {
        background: 'rgba(0, 136, 204, 0.1)',
      },
    },
  },
  CARD: {
    DEFAULT: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: BORDER_RADIUS['2XL'],
      shadow: SHADOWS.DEFAULT,
      hover: {
        shadow: SHADOWS.MD,
        transform: 'translateY(-2px)',
      },
    },
    TOURNAMENT: {
      background: 'white',
      border: 'none',
      borderRadius: BORDER_RADIUS['2XL'],
      shadow: SHADOWS.TOURNAMENT,
      hover: {
        shadow: SHADOWS.TOURNAMENT_HOVER,
        transform: 'scale(1.02)',
      },
    },
  },
} as const;

// Animation utilities
export const createTransition = (
  property: string = 'all',
  duration: string = ANIMATIONS.DURATION.NORMAL,
  easing: string = ANIMATIONS.EASING.EASE_OUT
) => {
  return `${property} ${duration} ${easing}`;
};

// Responsive utilities
export const mediaQueries = {
  sm: `@media (min-width: ${BREAKPOINTS.SM})`,
  md: `@media (min-width: ${BREAKPOINTS.MD})`,
  lg: `@media (min-width: ${BREAKPOINTS.LG})`,
  xl: `@media (min-width: ${BREAKPOINTS.XL})`,
  '2xl': `@media (min-width: ${BREAKPOINTS['2XL']})`,
} as const;

// Utility functions for consistent styling
export const designSystem = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  shadows: SHADOWS,
  borderRadius: BORDER_RADIUS,
  animations: ANIMATIONS,
  breakpoints: BREAKPOINTS,
  components: COMPONENT_VARIANTS,
  utils: {
    createTransition,
    mediaQueries,
  },
} as const;

export default designSystem;