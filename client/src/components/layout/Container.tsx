import { cn } from "@/lib/utils";
import { spacing } from "@/lib/constants";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  centered?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",   // 384px
  md: "max-w-md",   // 448px  
  lg: "max-w-lg",   // 512px
  xl: "max-w-xl",   // 576px
  full: "max-w-full",
} as const;

/**
 * Container component for consistent page layouts
 * Provides responsive max-width and horizontal centering
 */
export function Container({ 
  children, 
  className, 
  size = "sm", 
  centered = true 
}: ContainerProps) {
  return (
    <div 
      className={cn(
        sizeClasses[size],
        centered && "mx-auto",
        "px-4",
        className
      )}
    >
      {children}
    </div>
  );
}