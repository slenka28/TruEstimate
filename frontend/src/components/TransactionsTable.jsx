import React from 'react';

export default function TransactionsTable({ transactions }) {
  if (!transactions || transactions.length === 0) return null;

  return (
    <div className="bg-card border border-card-border rounded-xl shadow-sm flex flex-col overflow-hidden max-h-[400px]">
      <div className="p-5 border-b border-card-border bg-card">
        <h3 className="text-sm font-bold text-textMain uppercase tracking-widest flex items-center justify-between">
          Recent Registries
          <span className="text-[10px] bg-primary/10 text-primary-dark px-3 py-1 rounded-full border border-primary/20 font-bold">
            {transactions.length} Verified
          </span>
        </h3>
      </div>
      <div className="overflow-y-auto custom-scrollbar flex-1 relative bg-white">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] text-textMuted sticky top-0 bg-background-secondary z-10 uppercase tracking-widest border-b border-card-border">
            <tr>
              <th className="px-5 py-4 font-bold">Date</th>
              <th className="px-5 py-4 font-bold">Unit / Floor</th>
              <th className="px-5 py-4 font-bold">Config</th>
              <th className="px-5 py-4 font-bold">Area</th>
              <th className="px-5 py-4 font-bold">PPSFT</th>
              <th className="px-5 py-4 font-bold text-right">Value (Cr)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/50">
            {transactions.map((txn, idx) => (
              <tr key={idx} className="hover:bg-background-secondary transition-colors group cursor-default">
                <td className="px-5 py-4 text-textMain font-bold whitespace-nowrap">{txn.date
                  ? new Date(txn.date).toLocaleDateString("en-GB")
                  : "-"}</td>
                <td className="px-5 py-4 text-textSecondary whitespace-nowrap">
                  <span className="text-textMain font-bold">{txn.unit_no || '-'}</span>
                  {txn.floor && <span className="text-[10px] uppercase font-bold tracking-widest ml-2 text-textMuted hidden sm:inline-block">Fl: {txn.floor}</span>}
                </td>
                <td className="px-5 py-4 text-textSecondary font-medium whitespace-nowrap">{txn.config || '-'}</td>
                <td className="px-5 py-4 text-textSecondary whitespace-nowrap font-medium">
                  {txn.area ? Math.round(txn.area) : '-'} <span className="text-[9px] text-textMuted uppercase ml-1 font-bold">sqft</span>
                </td>
                <td className="px-5 py-4 text-textMain font-black group-hover:text-primary transition-colors whitespace-nowrap">
                  ₹{Math.round(txn.ppsft).toLocaleString('en-IN')}
                </td>
                <td className="px-5 py-4 text-textMuted text-right font-black text-sm whitespace-nowrap">
                  <span className="text-primary-dark">
                  {txn.value 
                    ? `₹${(txn.value / 10000000).toFixed(2)}` 
                    : (txn.ppsft && txn.area ? `₹${((txn.ppsft * txn.area) / 10000000).toFixed(2)}` : '-')}
                  </span>
                  <span className="text-[10px] ml-1 uppercase">Cr</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
