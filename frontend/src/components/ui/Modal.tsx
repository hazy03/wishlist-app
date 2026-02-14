import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-charcoal dark:bg-darkBg bg-opacity-40 dark:bg-opacity-60 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        <div className={`inline-block align-bottom bg-white dark:bg-darkCard border border-warmGray dark:border-darkSurface text-left overflow-hidden shadow-soft-xl rounded-soft-xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]}`}>
          <div
            className="bg-white dark:bg-darkCard px-8 pt-8 pb-8 sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-warmGray dark:border-darkCard">
                <h3 className="text-soft-3xl font-display text-charcoal dark:text-darkText font-medium">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-gray dark:text-darkMuted hover:text-charcoal dark:hover:text-darkText focus:outline-none transition-colors duration-300 rounded-soft p-2 hover:bg-softGray dark:hover:bg-darkSurface"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

