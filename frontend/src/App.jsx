import React, { useState } from 'react';
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
  List
} from 'lucide-react';
import SearchBar from './components/SearchBar';
import TruEstimateHero from './components/TruEstimateHero';
import TransactionsTable from './components/TransactionsTable';
import Chart from './components/Chart';
import GlobalAnalytics from './components/GlobalAnalytics';
import ProjectComparison from './components/ProjectComparison';
import VillageComparisonChart from './components/VillageComparisonChart';
import AllTransactionsTable from './components/AllTransactionsTable';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('global');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchBuildingData = async (buildingName) => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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

  const NavItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 py-3 px-4 transition-all duration-150 ${activeTab === id ? 'bg-background text-primary border-r-2 border-primary rounded-l-lg shadow-sm font-semibold' : 'text-textMuted hover:bg-background-secondary hover:text-primary rounded-lg font-medium'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-textMain font-sans flex text-base">
      {/* Side Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-card-border transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-card-border shrink-0 gap-3">
           <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded border border-primary/20">
             <Building2 className="w-5 h-5 text-primary-dark" />
           </div>
           <div>
             <h1 className="text-lg font-black tracking-tight text-primary-dark leading-none">TruEstimate</h1>
             <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-0.5">Institutional</p>
           </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
           <NavItem id="global" icon={LayoutDashboard} label="Global Dashboard" />
           <NavItem id="project" icon={Building2} label="Project Estimate" />
           <NavItem id="all_transactions" icon={List} label="All Transactions" />
           <NavItem id="compare" icon={ArrowRightLeft} label="Compare Assets" />
        </nav>
        
        <div className="p-4 border-t border-card-border space-y-1">
           <button className="w-full flex items-center gap-3 py-2 px-4 text-textMuted hover:bg-background-secondary hover:text-textMain rounded-lg transition-colors">
             <HelpCircle className="w-5 h-5" />
             <span className="text-sm font-medium">Support</span>
           </button>
           <button className="w-full flex items-center gap-3 py-2 px-4 text-textMuted hover:bg-background-secondary hover:text-textMain rounded-lg transition-colors">
             <Settings className="w-5 h-5" />
             <span className="text-sm font-medium">Settings</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 bg-background">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-card-border sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
           <div className="flex items-center gap-4">
              <button className="md:hidden p-2 -ml-2 text-textMuted hover:text-textMain" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:flex items-center relative">
                 <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                 <input 
                   type="text" 
                   placeholder="Search assets, locations..." 
                   className="pl-9 pr-4 py-2 bg-background-secondary border border-card-border rounded-lg text-sm text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all"
                 />
              </div>
           </div>
           
           <div className="flex items-center gap-3 sm:gap-4">
              <button className="p-2 text-textMuted hover:bg-background-secondary hover:text-primary rounded-full transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
                 <Briefcase className="w-4 h-4 text-primary-dark" />
              </div>
           </div>
        </header>

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
                 <div className="flex justify-center mb-4">
                   <SearchBar onSelect={fetchBuildingData} />
                 </div>

                 {loading && (
                   <div className="flex justify-center items-center py-20">
                     <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                   </div>
                 )}

                 {!loading && data && (
                   <div className="space-y-8">
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
                   <div className="text-center py-20 bg-white rounded-2xl border border-card-border shadow-sm">
                      <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-card-border">
                        <Search className="w-6 h-6 text-textMuted" />
                      </div>
                      <h3 className="text-lg font-bold text-textMain">Search TruEstimate</h3>
                      <p className="text-sm text-textMuted mt-1 max-w-sm mx-auto">Look up a specific project to view its intelligence-driven price adjustments and verify market entries.</p>
                   </div>
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
