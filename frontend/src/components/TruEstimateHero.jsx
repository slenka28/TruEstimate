import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, Building, Calculator, ChevronDown, TrendingUp, Verified } from 'lucide-react';

export default function TruEstimateHero({ data }) {
  const { TruEstimate, Confidence, Range, TotalTransactions, FilteredCount, building } = data;

  const [floor, setFloor] = useState(0);
  const [facing, setFacing] = useState('South');
  const [lakeFacing, setLakeFacing] = useState(false);
  
  const [floorPremium, setFloorPremium] = useState(0);
  const [facingPremium, setFacingPremium] = useState(0);
  const [lakePremium, setLakePremium] = useState(0);
  const [finalPrice, setFinalPrice] = useState(TruEstimate);

  useEffect(() => {
    // Floor logic
    let tempFloorPremium = 0;
    if (floor <= 4) {
      tempFloorPremium = floor * 20;
    } else if (floor <= 10) {
      tempFloorPremium = 4 * 20 + (floor - 4) * 55;
    } else {
      tempFloorPremium = 4 * 20 + 6 * 55 + (floor - 10) * 70;
    }
    setFloorPremium(tempFloorPremium);

    // Facing logic calculated from base TruEstimate
    let tempFacingPremium = 0;
    if (facing === 'West') tempFacingPremium = TruEstimate * 0.02;
    if (facing === 'North') tempFacingPremium = TruEstimate * 0.05;
    if (facing === 'East') tempFacingPremium = TruEstimate * 0.07;
    setFacingPremium(tempFacingPremium);

    // Lake Facing logic calculated from base TruEstimate
    let tempLakePremium = 0;
    if (lakeFacing) tempLakePremium = TruEstimate * 0.15;
    setLakePremium(tempLakePremium);

    setFinalPrice(TruEstimate + tempFloorPremium + tempFacingPremium + tempLakePremium);
  }, [floor, facing, lakeFacing, TruEstimate]);

  const confColor = Confidence >= 70 ? 'text-primary' : Confidence >= 40 ? 'text-yellow-600' : 'text-danger';
  const Icon = Confidence >= 70 ? ShieldCheck : AlertCircle;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
      
      {/* LEFT COLUMN: Price Header & Interactive Adjustments */}
      <div className="col-span-1 xl:col-span-7 space-y-6">
        
        {/* Prime Estimate Header */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
             <ShieldCheck className="w-48 h-48 text-primary" />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10 w-full">
            <div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Building className="w-5 h-5 text-primary/60" />
                  <h1 className="text-xl md:text-2xl font-bold text-textMain tracking-tight">{building}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-textMuted bg-background-secondary border border-card-border px-2 py-0.5 rounded">TruEstimate</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-primary-dark tracking-tighter mb-2">
                 ₹{Math.floor(TruEstimate).toLocaleString()}
              </h2>
              <div className="flex items-center gap-4 text-textSecondary">
                 <span className="flex items-center gap-1 text-sm font-medium">
                   <TrendingUp className="w-4 h-4 text-textMuted" />
                   Range: ₹{Range[0].toLocaleString()} - ₹{Range[1].toLocaleString()}
                 </span>
                 <span className="flex items-center gap-1 text-sm font-medium">
                   <Verified className="w-4 h-4 text-textMuted" />
                   Confidence: {Confidence}%
                 </span>
              </div>
            </div>

            <div className="bg-background-secondary border border-card-border rounded-xl p-3 text-center min-w-[100px]">
               <div className="text-2xl font-black text-primary-dark mb-0 leading-none">{TotalTransactions}</div>
               <div className="text-[10px] uppercase text-textMuted font-bold mt-1 tracking-widest">Total Txns</div>
            </div>
          </div>
        </div>

        {/* Interactive Adjustments Panel */}
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="mb-6">
             <h3 className="text-sm font-bold text-textMain uppercase tracking-widest mb-1">Price Adjustments</h3>
          </div>

          <div className="space-y-8 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Facing Dropdown */}
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest block">Unit Facing Premium</label>
                 <div className="relative">
                   <select 
                     value={facing} 
                     onChange={(e) => setFacing(e.target.value)}
                     className="w-full bg-background-secondary border border-card-border text-textMain text-sm rounded-lg py-2.5 px-3 appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                   >
                     <option value="South">South (Base)</option>
                     <option value="West">West (+2%)</option>
                     <option value="North">North (+5%)</option>
                     <option value="East">East (+7%)</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-textSecondary pointer-events-none" />
                 </div>
              </div>

              {/* Lake Facing Toggle */}
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest block">Lake Facing View</label>
                 <div className="bg-background-secondary border border-card-border rounded-lg p-2.5 flex items-center justify-between">
                   <span className="text-sm font-medium text-textMain ml-1">Lake Premium (+15%)</span>
                   <button 
                     onClick={() => setLakeFacing(!lakeFacing)}
                     className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-white ${lakeFacing ? 'bg-primary' : 'bg-card-border'}`}
                   >
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${lakeFacing ? 'translate-x-6' : 'translate-x-1'}`} />
                   </button>
                 </div>
              </div>
            </div>

            {/* Floor Slider */}
            <div className="space-y-2 pt-2 border-t border-card-border/50">
              <div className="flex justify-between items-end mb-4 mt-2">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Floor Elevation Level</label>
                <span className="text-primary-dark font-bold text-sm">
                  {floor === 0 ? 'Ground' : `Floor ${floor}`} <span className="text-xs text-textMuted font-medium ml-1">(+₹{floor <= 4 ? floor*20 : (floor<=10 ? (4*20+(floor-4)*55) : (4*20+6*55+(floor-10)*70))}/sqft)</span>
                </span>
              </div>
              <div>
                <input 
                  type="range" min="0" max="30" value={floor} 
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="w-full h-1.5 bg-card-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="flex justify-between text-[10px] text-textMuted font-bold uppercase tracking-widest mt-2">
                <span>G - 4</span>
                <span>5 - 10</span>
                <span className="text-primary-dark">10+ Premium</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Breakdown & Alert */}
      <div className="col-span-1 xl:col-span-5 space-y-6">
        
        {/* Live Valuation Breakdown Card */}
        <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
           <h3 className="text-lg font-bold text-textMain mb-5">Live Valuation Breakdown</h3>
           
           <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-card-border/50">
                <span className="text-sm font-medium text-textSecondary">Base Project Value</span>
                <span className="text-base font-bold text-textMain">₹{Math.floor(TruEstimate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-card-border/50">
                <span className="text-sm font-medium text-textSecondary">Floor Adjustment (Floor {floor})</span>
                <span className="text-base font-bold text-primary-dark">+ ₹{Math.floor(floorPremium).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-card-border/50">
                <span className="text-sm font-medium text-textSecondary">Facing Premium ({facing})</span>
                <span className="text-base font-bold text-primary-dark">+ ₹{Math.floor(facingPremium).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-card-border/50">
                <span className="text-sm font-medium text-textSecondary">View Premium (Lake)</span>
                <span className="text-base font-bold text-primary-dark">+ ₹{Math.floor(lakePremium).toLocaleString()}</span>
              </div>
              
              <div className="mt-8 pt-4 border-t-2 border-card-border">
                 <div className="text-[10px] text-textMuted uppercase font-bold tracking-widest mb-1">Final Adjusted Valuation</div>
                 <div className="text-3xl lg:text-4xl font-black text-primary-dark tracking-tighter">₹{Math.floor(finalPrice).toLocaleString()}</div>
                 <div className="text-xs text-textMuted mt-2 leading-relaxed italic font-medium">Institutional adjustments calculated in real-time based on local demand supply metrics.</div>
              </div>
           </div>
        </div>
        
      </div>

    </div>
  );
}
