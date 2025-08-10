import { ANIMATIONS } from './constants';

/**
 * Animation utilities for consistent motion design
 */

// CSS-in-JS animation definitions
export const animations = {
  // Entrance animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  slideInUp: {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInDown: {
    from: { transform: 'translateY(-20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInLeft: {
    from: { transform: 'translateX(-20px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  slideInRight: {
    from: { transform: 'translateX(20px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  scaleIn: {
    from: { transform: 'scale(0.9)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },

  // Exit animations
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideOutUp: {
    from: { transform: 'translateY(0)', opacity: 1 },
    to: { transform: 'translateY(-20px)', opacity: 0 },
  },
  slideOutDown: {
    from: { transform: 'translateY(0)', opacity: 1 },
    to: { transform: 'translateY(20px)', opacity: 0 },
  },
  scaleOut: {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.9)', opacity: 0 },
  },

  // Loading animations
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  bounce: {
    '0%, 20%, 53%, 100%': { transform: 'translate3d(0,0,0)' },
    '40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
    '70%': { transform: 'translate3d(0, -15px, 0)' },
    '90%': { transform: 'translate3d(0, -4px, 0)' },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },

  // Hover animations
  float: {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-6px)' },
  },
  glow: {
    '0%, 100%': { boxShadow: '0 0 5px rgba(0, 136, 204, 0.5)' },
    '50%': { boxShadow: '0 0 20px rgba(0, 136, 204, 0.8)' },
  },
  shimmer: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
} as const;

// Transition presets
export const transitions = {
  default: `all ${ANIMATIONS.DURATION.NORMAL} ${ANIMATIONS.EASING.EASE_OUT}`,
  fast: `all ${ANIMATIONS.DURATION.FAST} ${ANIMATIONS.EASING.EASE_OUT}`,
  slow: `all ${ANIMATIONS.DURATION.SLOW} ${ANIMATIONS.EASING.EASE_OUT}`,
  bounce: `all ${ANIMATIONS.DURATION.NORMAL} ${ANIMATIONS.EASING.BOUNCE}`,
  smooth: `all ${ANIMATIONS.DURATION.NORMAL} ${ANIMATIONS.EASING.EASE_IN_OUT}`,
} as const;

// Animation utility functions
export const createAnimation = (
  keyframes: Record<string, Record<string, string>>,
  duration: string = ANIMATIONS.DURATION.NORMAL,
  easing: string = ANIMATIONS.EASING.EASE_OUT,
  iterations: number | 'infinite' = 1
) => ({
  animation: `${duration} ${easing} ${iterations}`,
  keyframes,
});

export const createTransition = (
  properties: string[] = ['all'],
  duration: string = ANIMATIONS.DURATION.NORMAL,
  easing: string = ANIMATIONS.EASING.EASE_OUT,
  delay: string = '0s'
) => {
  return properties
    .map(prop => `${prop} ${duration} ${easing} ${delay}`)
    .join(', ');
};

// CSS classes for common animations (to be used with Tailwind)
export const animationClasses = {
  // Entrance
  'animate-fade-in': 'animate-[fadeIn_0.3s_ease-out]',
  'animate-slide-in-up': 'animate-[slideInUp_0.3s_ease-out]',
  'animate-slide-in-down': 'animate-[slideInDown_0.3s_ease-out]',
  'animate-slide-in-left': 'animate-[slideInLeft_0.3s_ease-out]',
  'animate-slide-in-right': 'animate-[slideInRight_0.3s_ease-out]',
  'animate-scale-in': 'animate-[scaleIn_0.3s_ease-out]',

  // Loading
  'animate-pulse-slow': 'animate-[pulse_2s_ease-in-out_infinite]',
  'animate-bounce-gentle': 'animate-[bounce_1s_ease-in-out_infinite]',
  'animate-float': 'animate-[float_3s_ease-in-out_infinite]',
  'animate-glow': 'animate-[glow_2s_ease-in-out_infinite]',
  'animate-shimmer': 'animate-[shimmer_2s_ease-in-out_infinite]',

  // Hover states (to be used with hover:)
  'hover-lift': 'hover:transform hover:-translate-y-1 hover:shadow-lg',
  'hover-scale': 'hover:transform hover:scale-105',
  'hover-glow': 'hover:shadow-[0_0_20px_rgba(0,136,204,0.3)]',
} as const;

// Framer Motion variants for page transitions
export const pageTransitions = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const cardTransitions = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const listItemTransitions = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

// Stagger animation for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default {
  animations,
  transitions,
  createAnimation,
  createTransition,
  animationClasses,
  pageTransitions,
  cardTransitions,
  listItemTransitions,
  staggerContainer,
};