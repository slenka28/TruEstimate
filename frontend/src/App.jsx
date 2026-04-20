import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import TransactionsTable from './components/TransactionsTable';
import Chart from './components/Chart';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchBuildingData = async (buildingName) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/building/${encodeURIComponent(buildingName)}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error("Building not found");
        setData(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-textMain p-4 md:p-8 relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary opacity-20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col gap-6">
        <header className="flex flex-col items-center justify-center text-center mt-12 mb-6">
          <div className="p-4 bg-card border border-gray-800 rounded-2xl shadow-xl ring-1 ring-white/5 mb-4">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
            TruEstimate Platform
          </h1>
          <p className="text-textMuted text-sm max-w-xl mx-auto leading-relaxed">
            Search for a project to view its intelligence-driven price per sq ft (PPSFT) estimate derived directly from verified market entries.
          </p>
        </header>

        <div className="flex justify-center mb-6">
          <SearchBar onSelect={fetchBuildingData} />
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ResultCard data={data} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Chart data={data} />
               <TransactionsTable transactions={data.Transactions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
