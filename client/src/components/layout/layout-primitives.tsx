import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  center?: boolean;
}

/**
 * Container component that provides consistent max-width and padding
 * across different screen sizes following mobile-first approach
 */
export function Container({ 
  children, 
  className, 
  size = 'md',
  center = true 
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-sm',      // 384px
    md: 'max-w-md',      // 448px  
    lg: 'max-w-4xl',     // 896px
    xl: 'max-w-6xl',     // 1152px
    full: 'max-w-none',
  };

  return (
    <div 
      className={cn(
        'w-full px-4',
        sizeClasses[size],
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
}

interface FlexProps {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: number | string;
}

/**
 * Flexible layout component with common flexbox utilities
 */
export function Flex({ 
  children, 
  className,
  direction = 'row',
  align,
  justify,
  wrap = false,
  gap 
}: FlexProps) {
  const directionClass = `flex-${direction}`;
  const alignClass = align ? `items-${align}` : '';
  const justifyClass = justify ? `justify-${justify}` : '';
  const wrapClass = wrap ? 'flex-wrap' : '';
  const gapClass = gap ? (typeof gap === 'number' ? `gap-${gap}` : gap) : '';

  return (
    <div 
      className={cn(
        'flex',
        directionClass,
        alignClass,
        justifyClass,
        wrapClass,
        gapClass,
        className
      )}
    >
      {children}
    </div>
  );
}

interface GridProps {
  children: ReactNode;
  className?: string;
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | string;
  autoRows?: string;
}

/**
 * Grid layout component with responsive column support
 */
export function Grid({ 
  children, 
  className,
  cols = 1,
  gap = 4,
  autoRows 
}: GridProps) {
  let gridClass = '';
  
  if (typeof cols === 'number') {
    gridClass = `grid-cols-${cols}`;
  } else {
    // Responsive grid columns
    const responsiveClasses = [];
    if (cols.sm) responsiveClasses.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) responsiveClasses.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) responsiveClasses.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) responsiveClasses.push(`xl:grid-cols-${cols.xl}`);
    gridClass = responsiveClasses.join(' ');
  }

  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap;
  const autoRowsClass = autoRows ? `auto-rows-${autoRows}` : '';

  return (
    <div 
      className={cn(
        'grid',
        gridClass,
        gapClass,
        autoRowsClass,
        className
      )}
    >
      {children}
    </div>
  );
}

interface StackProps {
  children: ReactNode;
  className?: string;
  space?: number | string;
  horizontal?: boolean;
}

/**
 * Stack component for consistent spacing between elements
 */
export function Stack({ 
  children, 
  className,
  space = 4,
  horizontal = false 
}: StackProps) {
  const spaceClass = typeof space === 'number' ? 
    (horizontal ? `space-x-${space}` : `space-y-${space}`) : space;

  return (
    <div 
      className={cn(
        horizontal ? 'flex' : 'flex flex-col',
        spaceClass,
        className
      )}
    >
      {children}
    </div>
  );
}

interface CenterProps {
  children: ReactNode;
  className?: string;
  axis?: 'both' | 'horizontal' | 'vertical';
}

/**
 * Center component for centering content along different axes
 */
export function Center({ 
  children, 
  className,
  axis = 'both' 
}: CenterProps) {
  const centerClasses = {
    both: 'flex items-center justify-center',
    horizontal: 'flex justify-center',
    vertical: 'flex items-center',
  };

  return (
    <div className={cn(centerClasses[axis], className)}>
      {children}
    </div>
  );
}