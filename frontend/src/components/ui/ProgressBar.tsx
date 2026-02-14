import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showLabel = true,
  className = '',
}) => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-charcoal dark:text-darkText font-medium">
            {current.toLocaleString('ru-RU')} ₽ / {total.toLocaleString('ru-RU')} ₽
          </span>
          <span className="text-sm text-sage dark:text-forest font-medium">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="w-full bg-warmGray dark:bg-darkSurface h-2 overflow-hidden rounded-full">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            percentage >= 100 ? 'bg-sage dark:bg-forest' : 'bg-charcoal dark:bg-darkText'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

