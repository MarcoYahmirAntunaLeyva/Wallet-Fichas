import React from 'react';

interface BadgeProps {
  count: string;
  label: string;
}

export const Badge: React.FC<BadgeProps> = ({ count, label }) => {
  return (
    <div className="justify-center">
      <div className="badge">
        <span className="badge-dot"></span>
        {count} {label}
      </div>
    </div>
  );
};
