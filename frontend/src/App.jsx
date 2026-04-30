import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe2,
  Search,
  Bell,
  HelpCircle,
  LayoutDashboard,
  ArrowRightLeft,
  Briefcase,
  Settings,
  Menu,
  List,
  Lock
} from 'lucide-react';
import SearchBar from './components/SearchBar';
import TruEstimateHero from './components/TruEstimateHero';
import TransactionsTable from './components/TransactionsTable';
import Chart from './components/Chart';
import GlobalAnalytics from './components/GlobalAnalytics';
import ProjectComparison from './components/ProjectComparison';
import VillageComparisonChart from './components/VillageComparisonChart';
import AllTransactionsTable from './components/AllTransactionsTable';
import LandingHero from './components/LandingHero';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('global');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    const fetchGlobalStats = async (attempt = 1) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/global/analytics`);
        if (response.ok) {
          const result = await response.json();
          setGlobalStats(result.KPIs);
        } else if (attempt < 3) {
          // Server may be mid-reload — retry after 2s
          setTimeout(() => fetchGlobalStats(attempt + 1), 2000);
        }
      } catch (error) {
        if (attempt < 3) {
          setTimeout(() => fetchGlobalStats(attempt + 1), 2000);
        }
      }
    };
    fetchGlobalStats();
  }, []);


  const fetchBuildingData = async (buildingName) => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      console.log("API CHECk", apiUrl)
      const response = await fetch(`${apiUrl}/building/${encodeURIComponent(buildingName)}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setActiveTab('project');
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

  const NavItem = ({ id, icon: Icon, label, disabled = false }) => (
    <button
      onClick={() => { if (!disabled) { setActiveTab(id); setMobileMenuOpen(false); } }}
      disabled={disabled}
      title={disabled ? "Coming Soon 😉" : ""}
      className={`w-full flex items-center gap-3 py-3 px-4 transition-all duration-150 ${disabled ? 'opacity-50 cursor-not-allowed' : (activeTab === id ? 'bg-background text-primary border-r-2 border-primary rounded-l-lg shadow-sm font-semibold' : 'text-textMuted hover:bg-background-secondary hover:text-primary rounded-lg font-medium')}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm tracking-wide flex-1 text-left">{label}</span>
      {disabled && <Lock className="w-3 h-3 opacity-50" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-textMain font-sans flex text-base">
      {/* Side Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-card-border transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-card-border shrink-0 gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded border border-card-border overflow-hidden p-1.5 shadow-sm">
            <img src="/favicon.png" alt="TruEstimate Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-primary-dark leading-none">TruEstimate</h1>
            <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1.5">Engine</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavItem id="global" icon={LayoutDashboard} label="Global Dashboard" />
          <NavItem id="project" icon={Building2} label="TruEstimate" />
          <NavItem id="all_transactions" icon={List} label="All Transactions" />
          <NavItem id="compare" icon={ArrowRightLeft} label="Compare Assets" disabled={true} />
        </nav>

        {/* Footer removed */}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 bg-background">

        {/* Top Navbar removed */}
        {mobileMenuOpen === false && (
          <button className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-card-border rounded-lg shadow-sm text-textMuted hover:text-textMain" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Dynamic Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'global' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <GlobalAnalytics />
            </div>
          )}

          {activeTab === 'all_transactions' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AllTransactionsTable />
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProjectComparison />
            </div>
          )}

          {activeTab === 'project' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8">
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}

              {!loading && data && (
                <div className="space-y-8">
                  <div className="flex justify-center mb-4">
                    <SearchBar onSelect={fetchBuildingData} />
                  </div>
                  <TruEstimateHero data={data} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                    <Chart data={data} />
                    <VillageComparisonChart data={data.VillageComparison} villageName={data.village} />
                    <div className="lg:col-span-2">
                      <TransactionsTable transactions={data.Transactions} />
                    </div>
                  </div>
                </div>
              )}

              {!loading && !data && (
                <LandingHero
                  onSearch={fetchBuildingData}
                  totalProperties={globalStats?.total_properties}
                  totalTransactions={globalStats?.total_transactions}
                />
              )}
            </div>
          )}
        </main>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}
      </div>
    </div>
  );
}
