import { Container } from "./Container";
import { Stack } from "./Stack";
import { FadeIn } from "../common/Animations";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  showHeader?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  spacing?: "sm" | "md" | "lg" | "xl";
}

const spacingClasses = {
  sm: "py-4",
  md: "py-6",
  lg: "py-8", 
  xl: "py-12",
} as const;

/**
 * PageLayout component for consistent page structure
 * Provides container, spacing, and optional title/description
 */
export function PageLayout({
  children,
  className,
  title,
  description,
  showHeader = true,
  maxWidth = "sm",
  spacing = "lg",
}: PageLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-semantic-background", className)}>
      {showHeader && (
        <header className="bg-white border-b border-semantic-border sticky top-0 z-50">
          <Container size={maxWidth}>
            <div className="py-4">
              {/* Header content - can be customized */}
              <h1 className="text-xl font-semibold text-semantic-text-primary">
                Tournament Platform
              </h1>
            </div>
          </Container>
        </header>
      )}
      
      <main className={spacingClasses[spacing]}>
        <Container size={maxWidth}>
          <FadeIn>
            <Stack gap="lg">
              {title && (
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-semantic-text-primary mb-2">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-lg text-semantic-text-secondary">
                      {description}
                    </p>
                  )}
                </div>
              )}
              {children}
            </Stack>
          </FadeIn>
        </Container>
      </main>
    </div>
  );
}