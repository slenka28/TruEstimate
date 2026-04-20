import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function Chart({ data }) {
  if (!data || !data.Transactions) return null;

  const chartData = useMemo(() => {
    return [...data.Transactions].sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [data.Transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0C111A]/95 border border-gray-700/80 p-3.5 rounded-xl shadow-[0_10px_20px_-10px_rgba(0,0,0,1)] backdrop-blur-sm">
          <p className="text-gray-400 text-[10px] uppercase font-semibold tracking-wider mb-1.5">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-white font-bold tracking-tight text-lg">
              ₹{payload[0].value.toLocaleString()} <span className="text-xs text-gray-500 font-normal">/ sqft</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-gray-800/80 rounded-2xl p-6 shadow-xl flex flex-col min-h-[450px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          PPSFT Trend Analysis
        </h3>
        <span className="text-[10px] bg-gray-900 text-gray-400 px-2.5 py-1 rounded-md border border-gray-800">
          Time-Series
        </span>
      </div>
      
      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="colorPpsft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis 
               dataKey="date" 
               stroke="#4B5563"
               tick={{ fill: '#6B7280', fontSize: 10 }}
               tickMargin={12}
               minTickGap={30}
               axisLine={false}
               tickLine={false}
               tickFormatter={(val) => {
                 const d = new Date(val);
                 return `${d.toLocaleString('default', {month:'short'})} ${d.getFullYear().toString().substr(2,2)}`;
               }}
            />
            <YAxis 
               dataKey="ppsft" 
               stroke="#4B5563" 
               tickFormatter={(val) => `₹${val.toLocaleString()}`}
               tick={{ fill: '#6B7280', fontSize: 11 }}
               axisLine={false}
               tickLine={false}
               domain={['auto', 'auto']}
               tickMargin={10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#374151', strokeWidth: 1 }} />
            
            <ReferenceLine 
                y={data.TruEstimate} 
                stroke="#10B981" 
                strokeDasharray="4 4" 
                strokeOpacity={0.8}
                label={{ position: 'insideTopLeft', value: 'TruEstimate', fill: '#10B981', fontSize: 10, fontWeight: 700, dy: -5 }} 
            />

            <Area 
              type="monotone" 
              dataKey="ppsft" 
              stroke="#3B82F6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPpsft)"
              activeDot={{ r: 6, fill: '#3B82F6', stroke: '#0C111A', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
