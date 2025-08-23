// components/IconButton.tsx
import Tooltip  from './Tooltip'; 
import type { ReactNode } from 'react';

interface IconButtonProps {
  tooltip: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const IconButton = ({ tooltip, children, className = '', onClick }: IconButtonProps) => {
  return (
    <Tooltip content={tooltip} placement="top" trigger="hover" >
      <button onClick={onClick} className={`text-gray-600 hover:text-blue-600 ${className}`}>
        {children}
      </button>
    </Tooltip>
  );
};

export default IconButton;