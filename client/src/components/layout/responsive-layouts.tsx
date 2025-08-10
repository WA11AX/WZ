import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Mobile-first responsive layout that adapts to different screen sizes
 */
export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  return (
    <div className={cn(
      'min-h-screen bg-gray-50',
      // Mobile layout
      'px-4 py-2',
      // Tablet layout  
      'md:px-6 md:py-4',
      // Desktop layout
      'lg:px-8 lg:py-6',
      // Large desktop
      'xl:px-12 xl:py-8',
      className
    )}>
      <div className="max-w-sm mx-auto md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        {children}
      </div>
    </div>
  );
}

interface TournamentGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Responsive grid for tournament cards
 */
export function TournamentGrid({ children, className }: TournamentGridProps) {
  return (
    <div className={cn(
      'grid gap-4',
      // Mobile: 1 column
      'grid-cols-1',
      // Tablet: 2 columns
      'md:grid-cols-2 md:gap-6',
      // Desktop: 2-3 columns based on screen size
      'lg:grid-cols-2 lg:gap-8',
      'xl:grid-cols-3',
      // Extra large: up to 4 columns
      '2xl:grid-cols-4',
      className
    )}>
      {children}
    </div>
  );
}

interface SidebarLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  className?: string;
}

/**
 * Responsive sidebar layout that collapses on mobile
 */
export function SidebarLayout({ sidebar, main, className }: SidebarLayoutProps) {
  return (
    <div className={cn(
      'flex flex-col lg:flex-row min-h-screen',
      className
    )}>
      {/* Sidebar - full width on mobile, fixed width on desktop */}
      <aside className={cn(
        'bg-white border-b lg:border-b-0 lg:border-r border-gray-200',
        'w-full lg:w-64 xl:w-72',
        'flex-shrink-0'
      )}>
        {sidebar}
      </aside>
      
      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-4 lg:p-6 xl:p-8">
        {main}
      </main>
    </div>
  );
}

interface HeaderLayoutProps {
  header: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Layout with sticky header
 */
export function HeaderLayout({ header, children, className }: HeaderLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Sticky header */}
      <div className="sticky top-0 z-50">
        {header}
      </div>
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

interface CardLayoutProps {
  children: ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

/**
 * Responsive card layout with proper spacing
 */
export function CardLayout({ children, className, spacing = 'normal' }: CardLayoutProps) {
  const spacingClasses = {
    tight: 'space-y-3 md:space-y-4',
    normal: 'space-y-4 md:space-y-6 lg:space-y-8', 
    loose: 'space-y-6 md:space-y-8 lg:space-y-12',
  };

  return (
    <div className={cn(
      'w-full',
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl';
}

/**
 * Responsive text component that scales with screen size
 */
export function ResponsiveText({ children, className, size = 'base' }: ResponsiveTextProps) {
  const sizeClasses = {
    sm: 'text-sm md:text-base',
    base: 'text-base md:text-lg', 
    lg: 'text-lg md:text-xl lg:text-2xl',
    xl: 'text-xl md:text-2xl lg:text-3xl xl:text-4xl',
  };

  return (
    <div className={cn(sizeClasses[size], className)}>
      {children}
    </div>
  );
}

interface StackedLayoutProps {
  children: ReactNode;
  className?: string;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  horizontal?: boolean;
}

/**
 * Responsive stacked layout that can switch between vertical and horizontal
 */
export function StackedLayout({ 
  children, 
  className, 
  spacing = 'md',
  horizontal = false 
}: StackedLayoutProps) {
  const spacingClasses = {
    xs: horizontal ? 'space-x-1 md:space-x-2' : 'space-y-1 md:space-y-2',
    sm: horizontal ? 'space-x-2 md:space-x-3' : 'space-y-2 md:space-y-3',
    md: horizontal ? 'space-x-3 md:space-x-4 lg:space-x-6' : 'space-y-3 md:space-y-4 lg:space-y-6',
    lg: horizontal ? 'space-x-4 md:space-x-6 lg:space-x-8' : 'space-y-4 md:space-y-6 lg:space-y-8',
    xl: horizontal ? 'space-x-6 md:space-x-8 lg:space-x-12' : 'space-y-6 md:space-y-8 lg:space-y-12',
  };

  return (
    <div className={cn(
      horizontal ? 'flex flex-row items-center' : 'flex flex-col',
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  );
}