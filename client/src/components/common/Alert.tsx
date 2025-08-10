import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  title?: string;
}

const variantStyles = {
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: "text-blue-500",
    IconComponent: Info,
  },
  success: {
    container: "bg-green-50 border-green-200 text-green-800", 
    icon: "text-green-500",
    IconComponent: CheckCircle,
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: "text-yellow-500", 
    IconComponent: AlertTriangle,
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: "text-red-500",
    IconComponent: XCircle,
  },
} as const;

/**
 * Alert component for displaying messages
 * Supports different variants and dismissible functionality
 */
export function Alert({
  children,
  variant = "info",
  className,
  dismissible = false,
  onDismiss,
  title,
}: AlertProps) {
  const styles = variantStyles[variant];
  const { IconComponent } = styles;

  return (
    <div
      className={cn(
        "flex gap-3 p-4 border rounded-lg",
        styles.container,
        className
      )}
    >
      <IconComponent className={cn("w-5 h-5 flex-shrink-0 mt-0.5", styles.icon)} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-medium mb-1">{title}</h4>
        )}
        <div className="text-sm">{children}</div>
      </div>

      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 text-current hover:bg-black/10"
          onClick={onDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}