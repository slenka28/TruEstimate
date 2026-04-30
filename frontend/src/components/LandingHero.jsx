import React from 'react';
import { ShieldCheck, Zap, Target, Search } from 'lucide-react';
import SearchBar from './SearchBar';

export default function LandingHero({ onSearch, totalProperties, totalTransactions }) {
  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 overflow-hidden rounded-[3rem] bg-background-cream border border-card-border shadow-inner">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      
      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-4xl text-center space-y-12">
        <div className="space-y-6">
          <h1 className="text-7xl md:text-8xl font-serif text-primary-dark tracking-tight animate-in fade-in slide-in-from-top-8 duration-700">
            TruEstimate
          </h1>
        </div>

        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 ml-1">
            Intelligence-Driven Valuation
          </p>
          <SearchBar onSelect={onSearch} className="shadow-2xl shadow-primary/10" />
        </div>

        {/* Hero Footer Stats */}
        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-1000 delay-500">
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-white border border-card-border shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-textMain">
              {totalProperties?.toLocaleString() || '...'} <span className="text-textMuted font-normal">Projects Valued</span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-white border border-card-border shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-textMain">
              98% <span className="text-textMuted font-normal">Valuation Accuracy</span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-white border border-card-border shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-textMain">
              {totalTransactions?.toLocaleString() || '...'} <span className="text-textMuted font-normal">Real Registrations</span>
            </p>
          </div>
        </div>
      </div>

      {/* Floating UI Elements (Abstract) */}
      <div className="absolute top-1/4 left-10 opacity-20 hidden lg:block">
        <div className="bg-white p-3 rounded-xl border border-card-border shadow-sm rotate-12">
            <div className="w-8 h-2 bg-card-border rounded mb-1"></div>
            <div className="w-12 h-2 bg-card-border rounded"></div>
        </div>
      </div>
      <div className="absolute bottom-1/4 right-10 opacity-20 hidden lg:block">
        <div className="bg-white p-3 rounded-xl border border-card-border shadow-sm -rotate-12">
            <div className="w-12 h-2 bg-card-border rounded mb-1"></div>
            <div className="w-8 h-2 bg-card-border rounded"></div>
        </div>
      </div>
    </div>
  );
}
