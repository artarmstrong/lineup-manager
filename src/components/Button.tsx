import { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant
   */
  variant?: ButtonVariant;
  /**
   * Size of the button
   */
  size?: ButtonSize;
  /**
   * Whether the button should take full width
   */
  fullWidth?: boolean;
  /**
   * Loading state - shows loading text
   */
  loading?: boolean;
  /**
   * Text to show when loading
   */
  loadingText?: string;
  /**
   * Button content
   */
  children: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  loadingText,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (loadingText || 'Loading...') : children}
    </button>
  );
}
