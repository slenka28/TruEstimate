import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function VillageComparisonChart({ data, villageName }) {
  if (!data || data.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-card-border p-3 rounded-xl shadow-xl backdrop-blur-sm">
          <p className="text-textMuted text-[10px] uppercase font-bold tracking-widest mb-1.5">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex justify-between items-center gap-4">
                <span className="text-[10px] font-bold text-textMuted uppercase">{entry.name}:</span>
                <span className="text-sm font-black text-textMain">₹{entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm flex flex-col min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-bold text-textMain uppercase tracking-widest">Village Benchmark</h3>
          <p className="text-xs text-textMuted font-medium mt-0.5">Project vs. {villageName || 'Village'} Median PPSFT</p>
        </div>
      </div>
      
      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="month" 
              stroke="#94A3B8"
              tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                const parts = val.split('-');
                return `${parts[1]}/${parts[0].substr(2,2)}`;
              }}
            />
            <YAxis 
              stroke="#94A3B8" 
              tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${val}`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '20px' }} />
            
            <Line 
              name="Project Median"
              type="monotone" 
              dataKey="project_median" 
              stroke="#22C55E" 
              strokeWidth={3}
              dot={{ r: 3, fill: '#22C55E', strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              connectNulls
            />
            <Line 
              name={`${villageName || 'Village'} Median`}
              type="monotone" 
              dataKey="village_median" 
              stroke="#94A3B8" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 2, fill: '#94A3B8', strokeWidth: 0 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
