import React from 'react';

const AnimatedZodiacBackground = () => {
  return (
    <div className="absolute top-0 inset-x-0 h-screen z-0 overflow-hidden pointer-events-none opacity-[0.15] dark:opacity-[0.25] flex items-start justify-center -mt-32 md:-mt-64">
      <svg
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[150vw] h-[150vw] md:w-[100vw] md:h-[100vw] max-w-[1400px] max-h-[1400px] animate-[spin_120s_linear_infinite]"
        stroke="currentColor"
        fill="none"
      >
        {/* Outer Ring */}
        <circle cx="500" cy="500" r="480" strokeWidth="1" strokeDasharray="5, 10" className="text-primary" />
        
        {/* Zodiac Divisions */}
        <g className="text-secondary" strokeWidth="0.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1="500"
              y1="20"
              x2="500"
              y2="100"
              transform={`rotate(${i * 30} 500 500)`}
            />
          ))}
        </g>

        {/* Second Ring */}
        <circle cx="500" cy="500" r="400" strokeWidth="0.5" className="text-foreground" />
        
        {/* Constellation Nodes (Abstract) */}
        <g className="text-primary" strokeWidth="0.5" fill="currentColor">
          {[
            [300, 200], [700, 300], [800, 700], [250, 750], 
            [500, 150], [850, 500], [500, 850], [150, 500]
          ].map(([x, y], i) => (
            <circle key={`node-${i}`} cx={x} cy={y} r="4" className="animate-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
        </g>

        {/* Connection Lines */}
        <polygon points="300,200 700,300 800,700 250,750" strokeWidth="0.2" className="text-text-secondary" />
        <polygon points="500,150 850,500 500,850 150,500" strokeWidth="0.2" className="text-text-secondary" />

        {/* Inner Mandala Structure */}
        <g strokeWidth="0.3" className="text-foreground">
          {Array.from({ length: 24 }).map((_, i) => (
            <path
              key={`mandala-${i}`}
              d="M 500 500 Q 550 400 500 300 Q 450 400 500 500"
              transform={`rotate(${i * 15} 500 500)`}
            />
          ))}
        </g>

        {/* Center Eye / Sun */}
        <circle cx="500" cy="500" r="100" strokeWidth="0.5" strokeDasharray="2, 4" className="text-secondary animate-[spin_60s_linear_infinite_reverse]" />
        <circle cx="500" cy="500" r="80" strokeWidth="1" className="text-primary" />
        <circle cx="500" cy="500" r="20" fill="currentColor" className="text-primary animate-pulse" />

      </svg>
    </div>
  );
};

export default AnimatedZodiacBackground;
