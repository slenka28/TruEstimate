import React, { useState } from 'react';
import { Upload, Plus, Trash2, Calculator } from 'lucide-react';

export default function InputForm({ onCalculate, loading }) {
  const [mode, setMode] = useState('quick');
  const [quickText, setQuickText] = useState('10159, 9206, 10909, 21000, 5000, 10000');
  const [rows, setRows] = useState([
    { id: 1, price: 10159, is_recent: true, is_same_unit: false },
    { id: 2, price: 9206, is_recent: false, is_same_unit: true },
    { id: 3, price: 10909, is_recent: true, is_same_unit: true },
  ]);

  const handleQuickSubmit = () => {
    const parsed = quickText.split(/[\s,]+/).filter(Boolean).map(Number).filter(n => !isNaN(n));
    if (parsed.length === 0) return;
    
    onCalculate({
      prices: parsed,
      weights: parsed.map(() => 1.0)
    });
  };

  const handleDetailedSubmit = () => {
    const prices = [];
    const weights = [];
    rows.forEach(r => {
      if (!r.price || isNaN(r.price)) return;
      prices.push(Number(r.price));
      let w = 1.0;
      if (r.is_same_unit) w = Math.max(w, 2.0);
      else if (r.is_recent) w = Math.max(w, 1.5);
      weights.push(w);
    });
    
    if (prices.length === 0) return;
    onCalculate({ prices, weights });
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now(), price: '', is_recent: false, is_same_unit: false }]);
  };
  
  const removeRow = (id) => {
    setRows(rows.filter(r => r.id !== id));
  };
  
  const updateRow = (id, field, val) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  return (
    <div className="bg-card border border-gray-800 rounded-2xl p-6 shadow-xl ring-1 ring-white/5">
      <div className="flex bg-gray-900 rounded-lg p-1 mb-6">
        <button 
          onClick={() => setMode('quick')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'quick' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          Quick Paste
        </button>
        <button 
          onClick={() => setMode('detailed')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'detailed' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          Detailed Entry
        </button>
      </div>

      {mode === 'quick' ? (
        <div className="animate-in fade-in duration-300">
          <label className="block text-sm font-medium text-gray-300 mb-2">Paste Prices (comma or space separated)</label>
          <textarea 
            rows={8}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-gray-200 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
            placeholder="e.g. 10159, 9206, 10909"
            value={quickText}
            onChange={(e) => setQuickText(e.target.value)}
          />
          <button 
            disabled={loading}
            onClick={handleQuickSubmit}
            className="mt-4 w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Calculator size={18} />}
            Calculate TruEstimate
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-300">Transaction Rows</label>
            <button onClick={addRow} className="text-xs flex items-center gap-1 text-primary hover:text-indigo-400 transition-colors">
              <Plus size={14} /> Add Row
            </button>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-12 gap-3 items-center bg-gray-900/40 p-3 rounded-xl border border-gray-800/50">
                <div className="col-span-12 sm:col-span-5">
                  <input 
                    type="number"
                    placeholder="Price"
                    value={row.price}
                    onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:ring-1 focus:ring-primary placeholder-gray-600"
                  />
                </div>
                <div className="col-span-10 sm:col-span-6 flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer w-fit">
                    <input type="checkbox" checked={row.is_recent} onChange={(e) => updateRow(row.id, 'is_recent', e.target.checked)} className="rounded bg-gray-950 border-gray-700 text-primary focus:ring-primary/50" />
                    Recent (+1.5x)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer w-fit">
                    <input type="checkbox" checked={row.is_same_unit} onChange={(e) => updateRow(row.id, 'is_same_unit', e.target.checked)} className="rounded bg-gray-950 border-gray-700 text-primary focus:ring-primary/50" />
                    Same Unit (+2.0x)
                  </label>
                </div>
                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <button onClick={() => removeRow(row.id)} className="text-gray-500 hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            disabled={loading}
            onClick={handleDetailedSubmit}
            className="mt-6 w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Calculator size={18} />}
            Calculate TruEstimate
          </button>
        </div>
      )}
    </div>
  );
}
