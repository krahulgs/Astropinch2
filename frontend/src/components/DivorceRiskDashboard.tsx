import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { AlertTriangle, Shield, Calendar, Info, CheckCircle, XCircle, FileText, ChevronDown } from 'lucide-react';

interface DivorceRiskData {
  score: number;
  band: string;
  doshas_found: Record<string, any>;
  cancellations_applied: string[];
  risk_periods: string[];
  stability_factors: string[];
  statistical_comparison: string;
  remedies: { title: string; desc: string; icon: string }[];
  narrative: string;
}

interface Props {
  data: DivorceRiskData;
}

const DivorceRiskDashboard: React.FC<Props> = ({ data }) => {
  const gaugeData = [
    { name: 'Risk', value: data.score },
    { name: 'Safety', value: 100 - data.score },
  ];

  const COLORS = [
    data.score > 60 ? '#dc2626' : data.score > 40 ? '#f97316' : '#6366f1',
    'rgba(255, 255, 255, 0.05)'
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Risk Meter Header */}
      <div className="p-12 rounded-[4rem] bg-surface border border-red-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 text-red-500/5"><AlertTriangle size={120} /></div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h2 className="text-4xl font-serif italic text-foreground">Divorce Risk Indicator</h2>
            <div className="inline-block px-6 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest">
              {data.band}
            </div>
            <p className="text-xl text-text-secondary font-light italic leading-relaxed">
              "{data.statistical_comparison}"
            </p>
          </div>
          
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-4">
              <span className="text-6xl font-serif italic text-foreground leading-none">{data.score}</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mt-2">Risk Index</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dosha Breakdown */}
      <div className="grid md:grid-cols-3 gap-8">
        {Object.entries(data.doshas_found).map(([key, val]: [string, any], i) => (
          <div key={i} className="p-8 rounded-[2.5rem] bg-surface border border-border group hover:border-red-500/30 transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
                <AlertTriangle size={20} />
              </div>
              <span className="text-xl font-serif italic text-red-500">+{val.points}</span>
            </div>
            <h4 className="text-lg font-serif italic text-foreground capitalize mb-2">{key.replace('_', ' ')}</h4>
            <p className="text-xs text-text-secondary font-light leading-relaxed">
              {val.cancelled ? 'Significant cancellations detected in your profile.' : 'Direct affliction with no mitigating factors found.'}
            </p>
          </div>
        ))}
      </div>

      {/* Risk Timeline */}
      <div className="space-y-8">
        <h3 className="text-xl font-serif italic text-foreground flex items-center gap-3">
          <Calendar className="text-secondary" /> High-Stress Windows
        </h3>
        <div className="flex flex-wrap md:flex-nowrap gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {data.risk_periods.map((period, i) => (
            <div key={i} className="flex-shrink-0 w-64 p-8 rounded-[2rem] bg-surface border border-border space-y-4">
              <span className="text-secondary font-serif italic text-2xl">0{i+1}</span>
              <p className="text-sm font-bold text-foreground">{period}</p>
              <p className="text-xs text-text-secondary font-light leading-relaxed">Celestial transit alignment suggesting heightened emotional friction.</p>
            </div>
          ))}
        </div>
      </div>

      {/* Remedies Engine */}
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h3 className="text-xl font-serif italic text-foreground flex items-center gap-3">
            <Shield className="text-highlight" /> Cosmic Safeguards
          </h3>
          <div className="space-y-4">
            {data.remedies.map((rem, i) => (
              <div key={i} className="p-6 rounded-[2rem] bg-surface border border-border group hover:border-highlight/30 transition-all">
                <div className="flex gap-4 items-start">
                  <span className="text-2xl">{rem.icon}</span>
                  <div className="space-y-2">
                    <h5 className="font-bold text-foreground">{rem.title}</h5>
                    <p className="text-xs text-text-secondary font-light leading-relaxed">{rem.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-10 rounded-[3rem] bg-surface border border-border space-y-8">
          <h3 className="text-xl font-serif italic text-foreground flex items-center gap-3">
            <Info className="text-secondary" /> Relationship Synthesis
          </h3>
          <p className="text-base text-text-secondary font-light leading-relaxed italic">
            {data.narrative}
          </p>
          <div className="pt-6 border-t border-border space-y-4">
            <h6 className="text-[10px] font-black uppercase tracking-widest text-secondary">Mitigating Factors</h6>
            <div className="flex flex-wrap gap-2">
              {data.stability_factors.map((factor, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-highlight/5 border border-highlight/20 text-highlight text-[9px] font-bold uppercase tracking-wider">
                  {factor}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .overflow-x-auto { overflow: visible !important; flex-wrap: wrap !important; }
          .flex-shrink-0 { flex-shrink: 1 !important; width: calc(33.33% - 1.5rem) !important; min-width: 0 !important; }
          .w-64 { width: auto !important; }
          .p-12, .p-8 { padding: 1.5rem !important; }
          .rounded-[4rem], .rounded-[2.5rem] { border-radius: 12px !important; }
          .h-64 { height: 180px !important; }
        }
      `}</style>
    </div>
  );
};

export default DivorceRiskDashboard;
