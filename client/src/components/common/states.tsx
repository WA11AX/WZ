import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Empty state component for when there's no data to display
 */
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      {Icon && (
        <Icon className="w-12 h-12 text-gray-400 mb-4" />
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Loading state component with spinner
 */
export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4',
      className
    )}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
}

/**
 * Error state component with optional retry action
 */
export function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  retry, 
  className 
}: ErrorStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-red-600 text-xl">⚠</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm">
        {message}
      </p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}

interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  children: ReactNode;
  className?: string;
}

/**
 * Status badge component with different color variants
 */
export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const statusClasses = {
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      statusClasses[status],
      className
    )}>
      {children}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
  showPercentage?: boolean;
}

/**
 * Progress bar component
 */
export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  className,
  showPercentage = true 
}: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  icon?: LucideIcon;
  className?: string;
}

/**
 * Metric card component for displaying key statistics
 */
export function MetricCard({ title, value, change, icon: Icon, className }: MetricCardProps) {
  return (
    <div className={cn(
      'bg-white p-6 rounded-lg border border-gray-200 shadow-sm',
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={cn(
              'text-sm mt-1',
              change.value >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {change.value >= 0 ? '+' : ''}{change.value}% {change.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}