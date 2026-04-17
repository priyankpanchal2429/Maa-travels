import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width, 
  height, 
  borderRadius, 
  className = '', 
  variant = 'rect',
  style: externalStyle = {}
}) => {
  const style: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: variant === 'circle' ? '50%' : borderRadius,
    ...externalStyle
  };

  return (
    <div 
      className={`${styles.skeleton} ${styles[variant]} ${className}`} 
      style={style}
    />
  );
};

export default Skeleton;
