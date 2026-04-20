import React from 'react';
import { ShieldCheck, Target, AlertCircle } from 'lucide-react';

export default function ResultsDisplay({ results, loading }) {
  if (loading) {
    return (
      <div className="bg-card border border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px] shadow-xl ring-1 ring-white/5">
        <div className="w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-medium animate-pulse text-sm">Running deterministic pipeline...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-card border border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px] shadow-xl ring-1 ring-white/5 text-center">
        <Target className="w-16 h-16 text-gray-800 mb-4" />
        <h3 className="text-xl font-medium text-gray-300">Awaiting Input</h3>
        <p className="text-gray-500 text-sm mt-2 max-w-sm leading-relaxed">Enter transaction prices on the left to compute a highly reliable TruEstimate.</p>
      </div>
    );
  }

  const { TruEstimate, Confidence, Filtered_Count, Total_Count } = results;

  const confidenceColor = Confidence >= 70 ? 'text-accent' : Confidence >= 40 ? 'text-yellow-500' : 'text-danger';
  const confidenceBg = Confidence >= 70 ? 'bg-accent/10 border-accent/20' : Confidence >= 40 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-danger/10 border-danger/20';
  const Icon = Confidence >= 70 ? ShieldCheck : AlertCircle;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Prime Estimate Card */}
      <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#1E2536] to-card border border-gray-700/50 rounded-2xl p-6 shadow-xl ring-1 ring-white/5 relative overflow-hidden group">
        <div className="absolute top-[-80px] right-[-80px] w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700 ease-out"></div>
        <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-widest">Final TruEstimate</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300 tracking-tight">
            ${TruEstimate.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-5 border-t border-gray-700/50 pt-4">
          Calculated via multi-step deterministic filtering.
        </p>
      </div>

      {/* Confidence Card */}
      <div className={`col-span-1 rounded-2xl p-6 shadow-xl border relative flex flex-col justify-center ${confidenceBg} transition-colors duration-500`}>
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`w-4 h-4 ${confidenceColor}`} />
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Confidence</p>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className={`text-4xl font-bold ${confidenceColor}`}>{Confidence}%</span>
        </div>
        <div className="mt-5 flex flex-col gap-1.5">
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div 
              className={`h-full duration-1000 ease-out ${Confidence >= 70 ? 'bg-accent shadow-[0_0_8px_#10B981]' : Confidence >= 40 ? 'bg-yellow-500 shadow-[0_0_8px_#EAB308]' : 'bg-danger shadow-[0_0_8px_#F43F5E]'}`} 
              style={{width: `${Confidence}%`}} 
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 flex justify-between">
            <span>Usable Points</span>
            <span className="text-gray-200 font-medium">{Filtered_Count} / {Total_Count}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
