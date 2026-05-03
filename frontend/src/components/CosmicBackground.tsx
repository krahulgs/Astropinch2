import React from 'react';

const CosmicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-background overflow-hidden">
      {/* Stars Layer - Only visible in dark mode */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-0 dark:opacity-30 animate-pulse-slow"></div>
      
      {/* Nebula 1 - Only visible in dark mode */}
      <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-indigo-900/30 rounded-full blur-[120px] mix-blend-screen animate-float-slow"></div>
      
      {/* Nebula 2 - Only visible in dark mode */}
      <div className="hidden dark:block absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[100px] mix-blend-screen animate-reverse-float"></div>
      
      {/* Radial Gradient Overlay - Themed */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_80%)]"></div>
    </div>
  );
};

export default CosmicBackground;
