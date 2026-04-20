import React from 'react';
import { ShieldCheck, AlertCircle, BarChart3, Calculator } from 'lucide-react';

export default function ResultCard({ data }) {
  const { TruEstimate, Confidence, Range, TotalTransactions, FilteredCount, building } = data;

  const confColor = Confidence >= 70 ? 'text-accent' : Confidence >= 40 ? 'text-yellow-500' : 'text-danger';
  const confBg = Confidence >= 70 ? 'bg-accent shadow-[0_0_8px_#10B981]' 
                : Confidence >= 40 ? 'bg-yellow-500 shadow-[0_0_8px_#EAB308]' 
                : 'bg-danger shadow-[0_0_8px_#F43F5E]';
  const Icon = Confidence >= 70 ? ShieldCheck : AlertCircle;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Prime Estimate Card */}
      <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-[#1A2333] to-[#0F1420] border border-gray-700/50 rounded-2xl p-6 shadow-xl ring-1 ring-white/5 relative overflow-hidden group">
        <div className="absolute top-[-80px] right-[-80px] w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700 ease-out"></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <p className="text-xs font-semibold text-primary mb-1.5 uppercase tracking-widest">{building}</p>
            <p className="text-sm text-gray-400">Calculated TruEstimate PPSFT</p>
          </div>
          <div className="p-2 bg-gray-900/50 rounded-lg border border-gray-800">
            <Calculator className="text-gray-500 w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-4 relative z-10">
          <span className="text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300 tracking-tight">
            ₹{TruEstimate.toLocaleString()}
          </span>
          <span className="text-gray-500 text-sm font-medium">/ sq ft</span>
        </div>
      </div>

      <div className="col-span-1 bg-card border border-gray-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`w-4 h-4 ${confColor}`} />
          <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest">Confidence Score</p>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className={`text-4xl font-bold tracking-tight ${confColor}`}>{Confidence}%</span>
        </div>
        <div className="mt-4 w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
          <div className={`h-full duration-1000 ease-out ${confBg}`} style={{width: `${Confidence}%`}} />
        </div>
        <p className="text-xs text-gray-400 mt-4 font-medium">Using <span className="text-gray-200">{FilteredCount}</span> of {TotalTransactions} Txns</p>
      </div>

      <div className="col-span-1 bg-card border border-gray-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest">Price Range</p>
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-2xl font-bold text-white tracking-tight">₹{Range[0].toLocaleString()}</span>
          <span className="text-gray-500 text-xs font-semibold uppercase pl-1 my-1">To</span>
          <span className="text-2xl font-bold text-white tracking-tight">₹{Range[1].toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
