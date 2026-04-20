import React from 'react';

export default function TransactionsTable({ transactions }) {
  if (!transactions || transactions.length === 0) return null;

  return (
    <div className="bg-card border border-gray-800/80 rounded-2xl shadow-xl flex flex-col overflow-hidden max-h-[450px]">
      <div className="p-5 border-b border-gray-700/50 bg-[#161F2E]">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center justify-between">
          Recent Transactions
          <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-1 rounded-full border border-primary/30">
            {transactions.length} Verified
          </span>
        </h3>
      </div>
      <div className="overflow-y-auto custom-scrollbar flex-1 relative">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] text-gray-500 sticky top-0 bg-[#0C111A] z-10 uppercase tracking-wider text-left shadow-sm">
            <tr>
              <th className="px-5 py-4 font-semibold border-b border-gray-800">Date</th>
              <th className="px-5 py-4 font-semibold border-b border-gray-800">Unit</th>
              <th className="px-5 py-4 font-semibold border-b border-gray-800">Config</th>
              <th className="px-5 py-4 font-semibold border-b border-gray-800">Floor</th>
              <th className="px-5 py-4 font-semibold border-b border-gray-800">Tower/Wing</th>
              <th className="px-5 py-4 font-semibold border-b border-gray-800">Area</th>
              <th className="px-5 py-4 font-semibold border-b border-gray-800">PPSFT</th>
              <th className="px-5 py-4 font-semibold border-b border-gray-800 text-right">Value (Est)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {transactions.map((txn, idx) => (
              <tr key={idx} className="hover:bg-gray-800/40 transition-colors group">
                <td className="px-5 py-3.5 text-gray-300 font-medium whitespace-nowrap">{txn.date
                  ? new Date(txn.date).toLocaleDateString("en-GB")
                  : "-"}</td>
                <td className="px-5 py-3.5 text-gray-400">{txn.unit_no || '-'}</td>
                <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">{txn.config || '-'}</td>
                <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">{txn.floor || '-'}</td>
                <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">
                  {(txn.tower || txn.wing) ? `${txn.tower || ''} ${txn.wing || ''}`.trim() : '-'}
                </td>
                <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">
                  {txn.area ? Math.round(txn.area) : '-'} <span className="text-[10px] text-gray-500 uppercase ml-0.5">sqft</span>
                </td>
                <td className="px-5 py-3.5 text-primary font-bold group-hover:text-white transition-colors whitespace-nowrap">
                  ₹{Math.round(txn.ppsft).toLocaleString('en-IN')}
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-right font-medium text-xs whitespace-nowrap">
                  {txn.value 
                    ? `₹${(txn.value / 100000).toFixed(2)}L` 
                    : (txn.ppsft && txn.area ? `₹${((txn.ppsft * txn.area) / 100000).toFixed(2)}L` : '-')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
