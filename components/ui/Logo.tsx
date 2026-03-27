import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="logo">
      <div className="logo-symbol">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 7L12 12L20 7L12 2Z" fill="#00F580" />
          <path d="M4 12L12 17L20 12" stroke="#00F580" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 17L12 22L20 17" stroke="#00F580" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="logo-name">Regnum <span>Casino</span></h1>
      <span className="logo-tagline">Donde la fortuna encuentra la elegancia</span>
    </div>
  );
};
