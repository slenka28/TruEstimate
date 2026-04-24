import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function Chart({ data }) {
  if (!data || !data.Transactions) return null;

  const chartData = useMemo(() => {
    return [...data.Transactions].sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [data.Transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-card-border p-3 rounded-xl shadow-xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
          <p className="text-textMuted text-[10px] uppercase font-bold tracking-widest mb-1.5">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-textMain font-black tracking-tight text-xl">
              ₹{payload[0].value.toLocaleString()} <span className="text-[10px] text-textSecondary font-medium lowercase">/ sqft</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm flex flex-col min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-textMain">Price Trend vs TruEstimate</h3>
        <span className="text-[10px] bg-background-secondary text-primary px-3 py-1 rounded-full border border-primary/20 font-semibold tracking-wider uppercase">
          Dynamic
        </span>
      </div>
      
      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="colorPpsft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
               dataKey="date" 
               stroke="#94A3B8"
               tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }}
               tickMargin={12}
               minTickGap={30}
               axisLine={false}
               tickLine={false}
               tickFormatter={(val) => {
                 const d = new Date(val);
                 return `${d.toLocaleString('default', {month:'short'})} '${d.getFullYear().toString().substr(2,2)}`;
               }}
            />
            <YAxis 
               dataKey="ppsft" 
               stroke="#94A3B8" 
               tickFormatter={(val) => `₹${val}`}
               tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }}
               axisLine={false}
               tickLine={false}
               domain={['auto', 'auto']}
               tickMargin={10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#94A3B8', strokeWidth: 1 }} />
            
            <ReferenceLine 
                y={data.TruEstimate} 
                stroke="#22C55E" 
                strokeDasharray="4 4" 
                strokeOpacity={0.8}
                label={{ position: 'insideTopLeft', value: 'TRUESTIMATE BASE', fill: '#22C55E', fontSize: 9, fontWeight: 800, dy: -5, tracking: 'widest' }} 
            />

            <Area 
              type="monotone" 
              dataKey="ppsft" 
              stroke="#22C55E" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPpsft)"
              activeDot={{ r: 6, fill: '#22C55E', stroke: '#ffffff', strokeWidth: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
