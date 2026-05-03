import React from 'react';

interface IconProps {
  type: string;
  active: boolean;
}

export default function CustomMuhuratIcon({ type, active }: IconProps) {
  const renderIcon = () => {
    switch (type) {
      case 'Vivah':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                  fill={active ? "currentColor" : "url(#grad_vivah)"} />
            <defs>
              <linearGradient id="grad_vivah" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F43F5E" />
                <stop offset="1" stopColor="#FB7185" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 'Griha Pravesh':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" fill={active ? "currentColor" : "url(#grad_home)"} />
            <path d="M9 22V12h6v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="grad_home" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10B981" />
                <stop offset="1" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 'Vehicle':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2" fill={active ? "currentColor" : "url(#grad_car)"} />
            <circle cx="7" cy="17" r="2" fill={active ? "white" : "#3B82F6"} />
            <circle cx="17" cy="17" r="2" fill={active ? "white" : "#3B82F6"} />
            <defs>
              <linearGradient id="grad_car" x1="3" y1="7" x2="22" y2="17" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" />
                <stop offset="1" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 'Business':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="7" width="20" height="14" rx="2" fill={active ? "currentColor" : "url(#grad_biz)"} />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="white" strokeWidth="2" />
            <defs>
              <linearGradient id="grad_biz" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="1" stopColor="#FBBF24" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 'Namkaran':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill={active ? "currentColor" : "url(#grad_baby)"} />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1.5" fill="white" />
            <circle cx="15" cy="9" r="1.5" fill="white" />
            <defs>
              <linearGradient id="grad_baby" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`transition-transform duration-500 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'hover:scale-105'}`}>
      {renderIcon()}
    </div>
  );
}
