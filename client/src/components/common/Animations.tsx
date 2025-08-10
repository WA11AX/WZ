import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
}

const directionVariants = {
  up: { y: 20 },
  down: { y: -20 },
  left: { x: 20 },
  right: { x: -20 },
};

/**
 * FadeIn animation component
 * Provides smooth fade-in effects with optional directional movement
 */
export function FadeIn({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.3,
  direction = "up" 
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        ...directionVariants[direction] 
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  );
}

interface SlideInProps {
  children: React.ReactNode;
  className?: string;
  direction: "left" | "right" | "up" | "down";
  delay?: number;
  duration?: number;
}

const slideVariants = {
  left: { x: -100 },
  right: { x: 100 },
  up: { y: -100 },
  down: { y: 100 },
};

/**
 * SlideIn animation component
 * Provides slide-in effects from specified direction
 */
export function SlideIn({ 
  children, 
  className, 
  direction, 
  delay = 0, 
  duration = 0.4 
}: SlideInProps) {
  return (
    <motion.div
      className={className}
      initial={slideVariants[direction]}
      animate={{ x: 0, y: 0 }}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  scale?: number;
}

/**
 * ScaleIn animation component
 * Provides scale-in effect with spring animation
 */
export function ScaleIn({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.3,
  scale = 0.8 
}: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        scale 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1 
      }}
      transition={{ 
        duration, 
        delay,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

/**
 * StaggerContainer animation component
 * Staggers animations of child elements
 */
export function StaggerContainer({ 
  children, 
  className, 
  staggerDelay = 0.1 
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface PulseProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}

/**
 * Pulse animation component
 * Provides gentle pulsing effect
 */
export function Pulse({ 
  children, 
  className, 
  scale = 1.05, 
  duration = 2 
}: PulseProps) {
  return (
    <motion.div
      className={className}
      animate={{ 
        scale: [1, scale, 1] 
      }}
      transition={{ 
        duration, 
        repeat: Infinity,
        ease: "easeInOut" 
      }}
    >
      {children}
    </motion.div>
  );
}