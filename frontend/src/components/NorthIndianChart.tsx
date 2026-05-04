import React from 'react';

interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
}

interface NorthIndianChartProps {
  planets: Planet[];
  ascendant: {
    sign: string;
    degree: number;
    house: number;
  };
}

const NorthIndianChart: React.FC<NorthIndianChartProps> = ({ planets, ascendant }) => {
  // Map signs to numbers (1-12)
  const signMap: Record<string, number> = {
    'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
    'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
    'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
  };

  const ascSignNum = signMap[ascendant.sign] || 1;

  // Function to get the sign number for a house
  const getHouseSign = (houseNum: number) => {
    let s = (ascSignNum + houseNum - 1) % 12;
    return s === 0 ? 12 : s;
  };

  // Group planets by house
  const housePlanets: Record<number, string[]> = {};
  planets.forEach(p => {
    if (!housePlanets[p.house]) housePlanets[p.house] = [];
    housePlanets[p.house].push(p.name.substring(0, 2));
  });

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-surface rounded-3xl border border-border p-4">
      <svg viewBox="0 0 400 400" className="w-full h-full stroke-foreground/20 fill-none">
        {/* Main Square */}
        <rect x="0" y="0" width="400" height="400" strokeWidth="2" />
        {/* Diagonals */}
        <line x1="0" y1="0" x2="400" y2="400" strokeWidth="2" />
        <line x1="400" y1="0" x2="0" y2="400" strokeWidth="2" />
        {/* Inner Diamond */}
        <polygon points="200,0 400,200 200,400 0,200" strokeWidth="2" />

        {/* House Labels and Planets */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => {
          let x = 0, y = 0, tx = 0, ty = 0;
          
          // Define coordinates for each house center
          if (house === 1) { x = 200; y = 140; tx = 200; ty = 100; }
          if (house === 2) { x = 100; y = 60; tx = 100; ty = 30; }
          if (house === 3) { x = 60; y = 100; tx = 30; ty = 100; }
          if (house === 4) { x = 140; y = 200; tx = 100; ty = 200; }
          if (house === 5) { x = 60; y = 300; tx = 30; ty = 300; }
          if (house === 6) { x = 100; y = 340; tx = 100; ty = 370; }
          if (house === 7) { x = 200; y = 260; tx = 200; ty = 300; }
          if (house === 8) { x = 300; y = 340; tx = 300; ty = 370; }
          if (house === 9) { x = 340; y = 300; tx = 370; ty = 300; }
          if (house === 10) { x = 260; y = 200; tx = 300; ty = 200; }
          if (house === 11) { x = 340; y = 100; tx = 370; ty = 100; }
          if (house === 12) { x = 300; y = 60; tx = 300; ty = 30; }

          return (
            <React.Fragment key={house}>
              {/* House Number */}
              <text x={tx} y={ty - 10} textAnchor="middle" dominantBaseline="middle" className="fill-foreground/40 text-[10px] font-medium tracking-wider">
                H{house}
              </text>
              {/* Sign Number */}
              <text x={tx} y={ty + 6} textAnchor="middle" dominantBaseline="middle" className="fill-secondary/80 text-[14px] font-bold">
                {getHouseSign(house)}
              </text>
              {/* Planets */}
              <text x={x} y={y} textAnchor="middle" className="fill-foreground text-[12px] font-medium">
                {housePlanets[house]?.join(' ')}
              </text>
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};

export default NorthIndianChart;
