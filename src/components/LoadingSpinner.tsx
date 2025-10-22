interface LoadingSpinnerProps {
  /**
   * The text to display below the spinner
   */
  text?: string;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Size of the spinner (default: 8)
   */
  size?: number;
}

export default function LoadingSpinner({
  text = 'Loading...',
  className = '',
  size = 8
}: LoadingSpinnerProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div
        className={`inline-block animate-spin rounded-full h-${size} w-${size} border-b-2 border-indigo-600`}
      ></div>
      {text && <p className="mt-2 text-gray-600">{text}</p>}
    </div>
  );
}
