import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  /**
   * Padding size (default: 6)
   */
  padding?: 4 | 6 | 8 | 12;
  /**
   * Shadow variant (default: 'default')
   */
  shadow?: 'none' | 'sm' | 'default' | 'md' | 'lg';
  /**
   * Additional CSS classes
   */
  className?: string;
}

export default function Card({
  children,
  padding = 6,
  shadow = 'default',
  className = ''
}: CardProps) {
  const paddingClass = `p-${padding}`;
  const shadowClass = shadow === 'none' ? '' : shadow === 'default' ? 'shadow' : `shadow-${shadow}`;

  return (
    <div className={`bg-white rounded-lg ${shadowClass} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}
