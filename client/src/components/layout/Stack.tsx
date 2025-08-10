import { cn } from "@/lib/utils";

interface StackProps {
  children: React.ReactNode;
  className?: string;
  direction?: "row" | "col";
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

const gapClasses = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4", 
  lg: "gap-6",
  xl: "gap-8",
} as const;

const alignClasses = {
  start: "items-start",
  center: "items-center", 
  end: "items-end",
  stretch: "items-stretch",
} as const;

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end", 
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
} as const;

/**
 * Stack component for flexible layouts
 * Provides consistent spacing and alignment
 */
export function Stack({
  children,
  className,
  direction = "col",
  gap = "md",
  align,
  justify,
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        gapClasses[gap],
        align && alignClasses[align],
        justify && justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
}