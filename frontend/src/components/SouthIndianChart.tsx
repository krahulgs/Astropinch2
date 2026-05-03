import React from 'react';

interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
}

interface SouthIndianChartProps {
  planets: Planet[];
  ascendant: {
    sign: string;
    degree: number;
    house: number;
  };
}

const SouthIndianChart: React.FC<SouthIndianChartProps> = ({ planets, ascendant }) => {
  const signMap: Record<string, number> = {
    'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
    'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
    'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
  };

  // Group planets by sign
  const signPlanets: Record<number, string[]> = {};
  planets.forEach(p => {
    const s = signMap[p.sign];
    if (s) {
      if (!signPlanets[s]) signPlanets[s] = [];
      signPlanets[s].push(p.name.substring(0, 2));
    }
  });

  const ascSignNum = signMap[ascendant.sign] || 1;

  // Grid layout for 12 signs in South Indian Chart
  // Fixed positions: 
  // Top: 12 (Pisces), 1 (Aries), 2 (Taurus), 3 (Gemini)
  // Left: 11 (Aquarius), 10 (Capricorn)
  // Right: 4 (Cancer), 5 (Leo)
  // Bottom: 9 (Sagittarius), 8 (Scorpio), 7 (Libra), 6 (Virgo)
  const boxes = [
    { sign: 12, x: 0, y: 0 }, { sign: 1, x: 100, y: 0 }, { sign: 2, x: 200, y: 0 }, { sign: 3, x: 300, y: 0 },
    { sign: 11, x: 0, y: 100 },                                                       { sign: 4, x: 300, y: 100 },
    { sign: 10, x: 0, y: 200 },                                                       { sign: 5, x: 300, y: 200 },
    { sign: 9, x: 0, y: 300 }, { sign: 8, x: 100, y: 300 }, { sign: 7, x: 200, y: 300 }, { sign: 6, x: 300, y: 300 }
  ];

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-surface rounded-3xl border border-border p-4">
      <svg viewBox="0 0 400 400" className="w-full h-full stroke-foreground/20 fill-none">
        {/* Outer Square */}
        <rect x="0" y="0" width="400" height="400" strokeWidth="2" />
        
        {/* Internal grid lines */}
        <line x1="100" y1="0" x2="100" y2="400" strokeWidth="2" />
        <line x1="200" y1="0" x2="200" y2="100" strokeWidth="2" />
        <line x1="200" y1="300" x2="200" y2="400" strokeWidth="2" />
        <line x1="300" y1="0" x2="300" y2="400" strokeWidth="2" />
        
        <line x1="0" y1="100" x2="400" y2="100" strokeWidth="2" />
        <line x1="0" y1="200" x2="100" y2="200" strokeWidth="2" />
        <line x1="300" y1="200" x2="400" y2="200" strokeWidth="2" />
        <line x1="0" y1="300" x2="400" y2="300" strokeWidth="2" />

        {/* Center empty box (no outline needed since we drew full grid lines where appropriate, but let's clear it) */}
        <rect x="100" y="100" width="200" height="200" stroke="none" fill="none" />

        {/* Labels and Planets */}
        {boxes.map(box => {
          const cx = box.x + 50;
          const cy = box.y + 50;
          return (
            <React.Fragment key={box.sign}>
              {/* Ascendant Marker */}
              {box.sign === ascSignNum && (
                <text x={box.x + 10} y={box.y + 20} className="fill-secondary/80 text-[10px] font-bold">
                  ASC
                </text>
              )}
              {/* Sign Number / Symbol (Optional, maybe small) */}
              <text x={box.x + 90} y={box.y + 90} textAnchor="end" className="fill-foreground/20 text-[10px] font-bold">
                {box.sign}
              </text>
              {/* Planets */}
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[14px] font-medium">
                {signPlanets[box.sign]?.join(' ')}
              </text>
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};

export default SouthIndianChart;
