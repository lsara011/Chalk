
import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
  };

  return (
    <div 
      className={`${sizes[size]} bg-chalk-blue rounded-lg flex items-center justify-center relative shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)] transition-transform active:scale-95`}
    >
      <div className="absolute inset-1 rounded-sm bg-white/15 flex items-center justify-center">
        <span className="font-extrabold text-black/10 select-none">C</span>
      </div>
    </div>
  );
};

export default Logo;
