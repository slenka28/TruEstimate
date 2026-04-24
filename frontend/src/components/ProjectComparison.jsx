import React from 'react';
import { 
  Building2, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Download,
  Plus
} from 'lucide-react';

export default function ProjectComparison() {
  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-textMain mb-2">Project Comparison</h1>
          <p className="text-textSecondary text-sm max-w-2xl">
            Compare institutional-grade real estate assets across key performance indicators, market liquidity, and localized price premiums.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-card border border-card-border rounded-lg text-sm flex items-center gap-2 hover:border-primary transition-all text-textMain font-medium">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      {/* Comparison Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-card-border border border-card-border rounded-xl overflow-hidden shadow-sm">
        
        {/* Attribute Column (Sticky on Desktop) */}
        <div className="lg:col-span-3 bg-background hidden lg:block">
          <div className="h-64 flex items-end p-6 border-b border-card-border">
            <span className="text-[10px] font-bold tracking-widest uppercase text-textMuted">Asset Parameters</span>
          </div>
          <div className="divide-y divide-card-border">
            <div className="h-24 flex items-center px-6 text-sm font-medium text-textSecondary bg-white">TruEstimate Price</div>
            <div className="h-32 flex items-center px-6 text-sm font-medium text-textSecondary bg-white">3-Month Price Trend</div>
            <div className="h-40 flex items-center px-6 text-sm font-medium text-textSecondary bg-white">Liquidity Score</div>
            <div className="h-24 flex items-center px-6 text-sm font-medium text-textSecondary bg-white">Floor Premium</div>
            <div className="h-24 flex items-center px-6 text-sm font-medium text-textSecondary bg-white">Facing Premium</div>
            <div className="h-24 flex items-center px-6 text-sm font-medium text-textSecondary bg-white">Median vs Village</div>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-card-border">
          
          {/* Card 1 */}
          <div className="bg-card group transition-all duration-300 hover:bg-background-secondary">
            <div className="p-6 h-64 flex flex-col border-b border-card-border relative overflow-hidden bg-white">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mt-auto relative z-10">
                <span className="bg-primary/10 text-primary-dark text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block border border-primary/20">Premium Core</span>
                <h3 className="text-xl font-black text-textMain">The Apex Heights</h3>
                <p className="text-xs text-textMuted mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Business District, Sector 12</p>
              </div>
            </div>
            <div className="divide-y divide-card-border">
              {/* Price */}
              <div className="h-24 p-6 flex flex-col justify-center bg-white">
                <div className="text-2xl font-black text-primary-dark">₹ 4.25 Cr</div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Estimated Value</div>
              </div>
              {/* Trend */}
              <div className="h-32 p-6 flex flex-col justify-center bg-white">
                <div className="w-full h-12 flex items-end gap-1">
                  <div className="flex-1 bg-primary/20 h-[40%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary/20 h-[55%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary/20 h-[45%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary/20 h-[70%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary/20 h-[65%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary/20 h-[85%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary/20 h-[95%] rounded-t-sm"></div>
                  <div className="flex-1 bg-primary h-full rounded-t-sm shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-textMuted uppercase font-bold">
                  <span>Oct 23</span>
                  <span className="text-primary-dark flex items-center"><ArrowUpRight className="w-3 h-3"/> 12.4%</span>
                  <span>Jan 24</span>
                </div>
              </div>
              {/* Liquidity */}
              <div className="h-40 p-6 flex items-center gap-4 bg-white">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="stroke-background-secondary stroke-[3]" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"></path>
                    <path className="stroke-primary stroke-[3]" strokeLinecap="round" strokeDasharray="88, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-textMain">88%</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-textMain">Very High</span>
                  <p className="text-[10px] text-textMuted leading-relaxed mt-1">Average exit within 18 days in current market volatility.</p>
                </div>
              </div>
              {/* Premiums */}
              <div className="h-24 p-6 flex items-center justify-between bg-white">
                <span className="text-sm font-black text-primary-dark">+8.5%</span>
                <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Floors 40+</span>
              </div>
              <div className="h-24 p-6 flex items-center justify-between bg-white">
                <span className="text-sm font-black text-primary-dark">+4.2%</span>
                <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Skyline View</span>
              </div>
              {/* Median */}
              <div className="h-24 p-6 flex items-center bg-white">
                <div className="w-full bg-background-secondary h-1.5 rounded-full relative">
                  <div className="absolute top-1/2 left-[70%] -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white z-10 shadow-sm"></div>
                  <div className="absolute top-full mt-2 left-[50%] -translate-x-1/2 text-[10px] text-textMuted font-medium whitespace-nowrap">Village Median</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-card group transition-all duration-300 hover:bg-background-secondary">
            <div className="p-6 h-64 flex flex-col border-b border-card-border relative overflow-hidden bg-white">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mt-auto relative z-10">
                <span className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">Sustainable</span>
                <h3 className="text-xl font-black text-textMain">Emerald Garden</h3>
                <p className="text-xs text-textMuted mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Eco-District, Zone A</p>
              </div>
            </div>
            <div className="divide-y divide-card-border">
              {/* Price */}
              <div className="h-24 p-6 flex flex-col justify-center bg-white">
                <div className="text-2xl font-black text-textMain">₹ 2.89 Cr</div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Estimated Value</div>
              </div>
              {/* Trend */}
              <div className="h-32 p-6 flex flex-col justify-center bg-white">
                <div className="w-full h-12 flex items-end gap-1">
                  <div className="flex-1 bg-blue-500/20 h-[60%] rounded-t-sm"></div>
                  <div className="flex-1 bg-blue-500/20 h-[55%] rounded-t-sm"></div>
                  <div className="flex-1 bg-blue-500/20 h-[50%] rounded-t-sm"></div>
                  <div className="flex-1 bg-blue-500/20 h-[45%] rounded-t-sm"></div>
                  <div className="flex-1 bg-blue-500/20 h-[40%] rounded-t-sm"></div>
                  <div className="flex-1 bg-blue-500/20 h-[45%] rounded-t-sm"></div>
                  <div className="flex-1 bg-blue-500/20 h-[52%] rounded-t-sm"></div>
                  <div className="flex-1 bg-blue-500 h-[58%] rounded-t-sm"></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-textMuted uppercase font-bold">
                  <span>Oct 23</span>
                  <span className="text-danger flex items-center"><ArrowDownRight className="w-3 h-3"/> 1.2%</span>
                  <span>Jan 24</span>
                </div>
              </div>
              {/* Liquidity */}
              <div className="h-40 p-6 flex items-center gap-4 bg-white">
                 <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="stroke-background-secondary stroke-[3]" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"></path>
                    <path className="stroke-blue-500 stroke-[3]" strokeLinecap="round" strokeDasharray="62, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-textMain">62%</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-textMain">Moderate</span>
                  <p className="text-[10px] text-textMuted leading-relaxed mt-1">Seasonal fluctuations impacting current velocity.</p>
                </div>
              </div>
              {/* Premiums */}
              <div className="h-24 p-6 flex items-center justify-between bg-white">
                <span className="text-sm font-black text-blue-600">+3.1%</span>
                <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Balcony Size</span>
              </div>
              <div className="h-24 p-6 flex items-center justify-between bg-white">
                <span className="text-sm font-black text-blue-600">+12.8%</span>
                <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Park Facing</span>
              </div>
              {/* Median */}
              <div className="h-24 p-6 flex items-center bg-white">
                <div className="w-full bg-background-secondary h-1.5 rounded-full relative">
                  <div className="absolute top-1/2 left-[45%] -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white z-10 shadow-sm"></div>
                  <div className="absolute top-full mt-2 left-[50%] -translate-x-1/2 text-[10px] text-textMuted font-medium whitespace-nowrap">Village Median</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-card group transition-all duration-300 hover:bg-background-secondary lg:border-r-0">
            <div className="p-6 h-64 flex flex-col border-b border-card-border relative overflow-hidden bg-white">
              <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mt-auto relative z-10">
                <span className="bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">Value Add</span>
                <h3 className="text-xl font-black text-textMain">Ironwood Lofts</h3>
                <p className="text-xs text-textMuted mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Arts District, Heritage Zone</p>
              </div>
            </div>
            <div className="divide-y divide-card-border">
              {/* Price */}
              <div className="h-24 p-6 flex flex-col justify-center bg-white">
                <div className="text-2xl font-black text-textMain">₹ 1.42 Cr</div>
                <div className="text-[10px] text-textMuted uppercase tracking-wider font-semibold">Estimated Value</div>
              </div>
              {/* Trend */}
              <div className="h-32 p-6 flex flex-col justify-center bg-white">
                <div className="w-full h-12 flex items-end gap-1">
                  <div className="flex-1 bg-orange-500/20 h-[30%] rounded-t-sm"></div>
                  <div className="flex-1 bg-orange-500/20 h-[40%] rounded-t-sm"></div>
                  <div className="flex-1 bg-orange-500/20 h-[35%] rounded-t-sm"></div>
                  <div className="flex-1 bg-orange-500/20 h-[42%] rounded-t-sm"></div>
                  <div className="flex-1 bg-orange-500/20 h-[45%] rounded-t-sm"></div>
                  <div className="flex-1 bg-orange-500/20 h-[48%] rounded-t-sm"></div>
                  <div className="flex-1 bg-orange-500/20 h-[52%] rounded-t-sm"></div>
                  <div className="flex-1 bg-orange-500 h-[55%] rounded-t-sm"></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-textMuted uppercase font-bold">
                  <span>Oct 23</span>
                  <span className="text-orange-600 flex items-center"><ArrowUpRight className="w-3 h-3" /> 4.8%</span>
                  <span>Jan 24</span>
                </div>
              </div>
              {/* Liquidity */}
              <div className="h-40 p-6 flex items-center gap-4 bg-white">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="stroke-background-secondary stroke-[3]" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"></path>
                    <path className="stroke-orange-500 stroke-[3]" strokeLinecap="round" strokeDasharray="45, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-textMain">45%</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-textMain">Low Velocity</span>
                  <p className="text-[10px] text-textMuted leading-relaxed mt-1">Niche buyer segment, requires longer listing window.</p>
                </div>
              </div>
              {/* Premiums */}
              <div className="h-24 p-6 flex items-center justify-between bg-white">
                <span className="text-sm font-black text-orange-600">+1.5%</span>
                <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Corner Unit</span>
              </div>
              <div className="h-24 p-6 flex items-center justify-between bg-white">
                <span className="text-sm font-black text-orange-600">+6.0%</span>
                <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Vaulted Ceiling</span>
              </div>
              {/* Median */}
              <div className="h-24 p-6 flex items-center bg-white">
                <div className="w-full bg-background-secondary h-1.5 rounded-full relative">
                  <div className="absolute top-1/2 left-[25%] -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full border-2 border-white z-10 shadow-sm"></div>
                  <div className="absolute top-full mt-2 left-[50%] -translate-x-1/2 text-[10px] text-textMuted font-medium whitespace-nowrap">Village Median</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
