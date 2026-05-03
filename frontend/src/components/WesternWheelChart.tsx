import React from 'react';

interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  longitude?: number;
}

interface WesternWheelChartProps {
  planets: Planet[];
  ascendant: {
    sign: string;
    degree: number;
    longitude?: number;
  };
  title?: string;
}

const WesternWheelChart: React.FC<WesternWheelChartProps> = ({ planets, ascendant, title }) => {
  const radius = 150;
  const centerX = 200;
  const centerY = 200;

  const getCoordinates = (angle: number, r: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: centerX + r * Math.cos(rad),
      y: centerY + r * Math.sin(rad)
    };
  };

  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  // Rotate chart so Ascendant is on the left (180 degrees)
  const rotationOffset = 180 - (ascendant.longitude || 0);

  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto bg-surface/30 rounded-full border border-border/50 p-4 backdrop-blur-sm group hover:border-secondary/30 transition-all duration-700">
      <div className="absolute inset-0 bg-secondary/5 rounded-full blur-3xl -z-10 group-hover:bg-secondary/10 transition-all duration-700"></div>
      
      {title && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary whitespace-nowrap">
          {title}
        </div>
      )}

      <svg viewBox="0 0 400 400" className="w-full h-full fill-none">
        {/* Outer Circle */}
        <circle cx={centerX} cy={centerY} r={radius + 30} className="stroke-border/30 print:stroke-gray-300" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r={radius} className="stroke-foreground/20 print:stroke-gray-400" strokeWidth="2" />
        <circle cx={centerX} cy={centerY} r={radius - 40} className="stroke-border/20 print:stroke-gray-200" strokeWidth="1" />

        {/* Zodiac Signs */}
        {signs.map((sign, i) => {
          const startAngle = (i * 30 + rotationOffset) % 360;
          const endAngle = ((i + 1) * 30 + rotationOffset) % 360;
          const midAngle = (i * 30 + 15 + rotationOffset) % 360;
          
          const p1 = getCoordinates(startAngle, radius);
          const p2 = getCoordinates(startAngle, radius + 30);
          const textPos = getCoordinates(midAngle, radius + 15);

          return (
            <g key={sign}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="stroke-border/30 print:stroke-gray-300" strokeWidth="1" />
              <text 
                x={textPos.x} 
                y={textPos.y} 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="fill-text-secondary print:fill-gray-600 text-[8px] font-bold"
                transform={`rotate(${midAngle + 90}, ${textPos.x}, ${textPos.y})`}
              >
                {sign.substring(0, 3).toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* Planets */}
        {planets.map((p, i) => {
          const angle = ((p.longitude || 0) + rotationOffset) % 360;
          const pos = getCoordinates(angle, radius - 20);
          const lineStart = getCoordinates(angle, radius);
          const lineEnd = getCoordinates(angle, radius - 10);

          return (
            <g key={i} className="group/planet">
              <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} className="stroke-secondary print:stroke-black" strokeWidth="2" />
              <circle cx={pos.x} cy={pos.y} r="4" className="fill-secondary shadow-lg print:fill-black print:shadow-none" />
              <text 
                x={pos.x} 
                y={pos.y - 12} 
                textAnchor="middle" 
                className="fill-foreground text-[10px] font-bold print:opacity-100 opacity-0 group-hover/planet:opacity-100 transition-opacity"
              >
                {p.name.substring(0, 2)}
              </text>
            </g>
          );
        })}

        {/* Center Point */}
        <circle cx={centerX} cy={centerY} r="5" className="fill-foreground/20" />
      </svg>
    </div>
  );
};

export default WesternWheelChart;
