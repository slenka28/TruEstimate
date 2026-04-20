import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function VisualizationChart({ results }) {
  if (!results || !results.details || results.details.length === 0) return null;

  const formattedData = results.details.map((d, index) => ({
    x: index + 1,
    y: d.price,
    status: d.status,
    z: 1 
  }));

  const accepted = formattedData.filter(d => d.status === "Accepted");
  const filtered = formattedData.filter(d => d.status !== "Accepted");
  const trueEstimate = results.TruEstimate;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-xl shadow-2xl">
          <p className="text-white font-semibold mb-1 tracking-wide">Price: ${data.y.toLocaleString()}</p>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${data.status === 'Accepted' ? 'bg-accent' : 'bg-danger'}`}></div>
            <p className={`text-xs ${data.status === 'Accepted' ? 'text-accent' : 'text-danger'}`}>
              {data.status}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-gray-800 rounded-2xl p-6 shadow-xl ring-1 ring-white/5">
      <h3 className="text-sm font-semibold text-gray-300 mb-6 uppercase tracking-wider flex items-center justify-between">
        Data Distribution Spread
        <span className="text-[10px] font-medium text-gray-500 bg-gray-900/80 py-1 px-2.5 rounded-md border border-gray-800">1D Visual Scatter</span>
      </h3>
      
      <div className="h-[280px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#1F2937" vertical={false} />
            <XAxis dataKey="x" type="number" hide domain={['dataMin - 1', 'dataMax + 1']} />
            <YAxis 
               dataKey="y" 
               type="number" 
               stroke="#6B7280" 
               tickFormatter={(val) => `$${val.toLocaleString()}`}
               tick={{ fill: '#6B7280', fontSize: 11 }}
               axisLine={false}
               tickLine={false}
               domain={['auto', 'auto']}
               tickMargin={12}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#374151', strokeWidth: 1 }} />
            
            <ReferenceLine 
                y={trueEstimate} 
                stroke="#3B82F6" 
                strokeDasharray="4 4" 
                strokeOpacity={0.8}
                label={{ position: 'insideTopLeft', value: 'TruEstimate', fill: '#3B82F6', fontSize: 11, fontWeight: 600, dy: -8 }} 
            />

            <Scatter name="Filtered" data={filtered} fill="#F43F5E" shape="circle" />
            <Scatter name="Accepted" data={accepted} fill="#10B981" shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center flex-wrap gap-6 mt-4 pt-5 border-t border-gray-800/50 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_#10B981]"></div>
          <span className="text-gray-400 font-medium">Inside Bounds (Accepted)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-danger shadow-[0_0_8px_#F43F5E]"></div>
          <span className="text-gray-400 font-medium">Outlier / Filtered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-[2px] bg-primary border-b border-primary/50 border-dashed"></div>
          <span className="text-gray-400 font-medium">Final Estimate Line</span>
        </div>
      </div>
    </div>
  );
}
