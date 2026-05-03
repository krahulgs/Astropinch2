import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const baseClasses = "animate-pulse bg-surface-dark/20 dark:bg-surface-light/10 rounded-lg";
  const variantClasses = {
    text: "h-4 w-full",
    rect: "h-full w-full",
    circle: "rounded-full h-12 w-12",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export default Skeleton;
