import { cn } from "@/lib/utils";

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  responsive?: boolean;
}

const colClasses = {
  1: "grid-cols-1",
  2: "grid-cols-2", 
  3: "grid-cols-3",
  4: "grid-cols-4",
  6: "grid-cols-6",
  12: "grid-cols-12",
} as const;

const gapClasses = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6", 
  xl: "gap-8",
} as const;

/**
 * Grid component for responsive layouts
 * Provides CSS Grid with consistent spacing
 */
export function Grid({
  children,
  className,
  cols = 1,
  gap = "md",
  responsive = true,
}: GridProps) {
  return (
    <div
      className={cn(
        "grid",
        responsive && cols > 1
          ? `grid-cols-1 sm:grid-cols-2 md:${colClasses[cols]}`
          : colClasses[cols],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}