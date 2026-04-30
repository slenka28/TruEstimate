import React, { useState, useEffect, useMemo } from 'react';
import { Activity, CircleDollarSign, TrendingUp, BarChart3, ChevronDown, Filter, ArrowUp, ArrowDown, Lightbulb } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const FilterCombobox = ({ options, value, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredOptions = useMemo(() => {
    return options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  return (
    <div className="relative">
      <div
        className={`bg-background-secondary border border-card-border text-sm text-textMain rounded-lg px-3 py-2 flex items-center justify-between min-w-[160px] cursor-pointer transition-colors hover:border-primary/50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="truncate max-w-[120px] font-medium">{value || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-textMuted ml-2 shrink-0" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); setQuery(''); }}></div>
          <div className="absolute top-full left-0 z-50 w-full mt-1 bg-card border border-card-border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
            <div className="p-2 border-b border-card-border z-50 relative bg-card">
              <input
                type="text"
                className="w-full bg-background border border-card-border rounded px-2 py-1.5 text-xs text-textMain focus:outline-none focus:border-primary placeholder-textMuted"
                placeholder="Search..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto relative z-50 bg-card custom-scrollbar">
              <div
                className="px-3 py-2 text-xs text-textSecondary hover:bg-background-secondary hover:text-textMain cursor-pointer border-b border-card-border/50 font-bold tracking-wide"
                onClick={() => { onChange(''); setIsOpen(false); setQuery(''); }}
              >
                Clear Selection
              </div>
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-xs text-textMuted text-center font-medium">No results</div>
              ) : (
                filteredOptions.map(opt => (
                  <div
                    key={opt}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-background-secondary truncate transition-colors ${value === opt ? 'text-primary font-bold bg-primary/5' : 'text-textMain font-medium'}`}
                    onClick={() => { onChange(opt); setIsOpen(false); setQuery(''); }}
                  >
                    {opt}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function GlobalAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [hierarchy, setHierarchy] = useState({});

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Fetch hierarchy
    fetch(`${apiUrl}/locations/hierarchy`)
      .then(res => res.json())
      .then(data => setHierarchy(data))
      .catch(err => {
        console.error("Error fetching hierarchy:", err);
      });
  }, [apiUrl]);

  useEffect(() => {
    const fetchGlobalData = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (filters.district) queryParams.append('district', filters.district);
        if (filters.taluka) queryParams.append('taluka', filters.taluka);
        if (filters.hobli) queryParams.append('hobli', filters.hobli);
        if (filters.village) queryParams.append('village', filters.village);

        const response = await fetch(`${apiUrl}/global/analytics?${queryParams.toString()}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          throw new Error(`Server responded with ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching global analytics", error);
        setError("Failed to load dashboard data. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalData();
  }, [filters, apiUrl]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-card-border p-3 rounded-xl shadow-xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
          <p className="text-textMuted text-[10px] uppercase font-bold mb-1">{label}</p>
          <p className="text-textMain font-black text-xl">₹{Math.round(payload[0].value).toLocaleString()}</p>
          {payload[1] && <p className="text-textSecondary text-xs mt-1">{payload[1].value} Transactions</p>}
        </div>
      );
    }
    return null;
  };

  const handleFilterChange = (level, value) => {
    const newFilters = { ...filters };
    if (!value) {
      delete newFilters[level];
    } else {
      newFilters[level] = value;
    }

    if (level === 'district') {
      delete newFilters.taluka; delete newFilters.hobli; delete newFilters.village;
    } else if (level === 'taluka') {
      delete newFilters.hobli; delete newFilters.village;
    } else if (level === 'hobli') {
      delete newFilters.village;
    }
    setFilters(newFilters);
  };

  const districts = useMemo(() => Object.keys(hierarchy).sort(), [hierarchy]);

  const talukas = useMemo(() => {
    let set = new Set();
    Object.entries(hierarchy).forEach(([dName, d]) => {
      if (!filters.district || filters.district === dName) {
        Object.keys(d).forEach(t => set.add(t));
      }
    });
    return Array.from(set).sort();
  }, [hierarchy, filters.district]);

  const hoblis = useMemo(() => {
    let set = new Set();
    Object.entries(hierarchy).forEach(([dName, d]) => {
      if (!filters.district || filters.district === dName) {
        Object.entries(d).forEach(([tName, t]) => {
          if (!filters.taluka || filters.taluka === tName) {
            Object.keys(t).forEach(h => set.add(h));
          }
        })
      }
    });
    return Array.from(set).sort();
  }, [hierarchy, filters.district, filters.taluka]);

  const villages = useMemo(() => {
    let set = new Set();
    Object.entries(hierarchy).forEach(([dName, d]) => {
      if (!filters.district || filters.district === dName) {
        Object.entries(d).forEach(([tName, t]) => {
          if (!filters.taluka || filters.taluka === tName) {
            Object.entries(t).forEach(([hName, h]) => {
              if (!filters.hobli || filters.hobli === hName) {
                h.forEach(v => set.add(v));
              }
            })
          }
        })
      }
    });
    return Array.from(set).sort();
  }, [hierarchy, filters.district, filters.taluka, filters.hobli]);

  return (
    <div className="w-full space-y-8">

      {/* Header */}
      <header className="mb-2">
        <h1 className="text-3xl font-black text-textMain mb-1">Institutional Overview</h1>
        <p className="text-sm font-medium text-textMuted">Last updated: Today • Market Session: Open</p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-card border border-card-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mr-2">
          <Filter className="w-4 h-4 text-textMuted" />
          <span className="text-xs font-bold text-textSecondary uppercase tracking-widest">Filters</span>
        </div>

        <FilterCombobox
          options={districts}
          value={filters.district}
          onChange={(val) => handleFilterChange('district', val)}
          placeholder="All Districts"
        />

        <FilterCombobox
          options={talukas}
          value={filters.taluka}
          onChange={(val) => handleFilterChange('taluka', val)}
          placeholder="All Talukas"
        />

        <FilterCombobox
          options={hoblis}
          value={filters.hobli}
          onChange={(val) => handleFilterChange('hobli', val)}
          placeholder="All Hoblis"
        />

        <FilterCombobox
          options={villages}
          value={filters.village}
          onChange={(val) => handleFilterChange('village', val)}
          placeholder="All Villages"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card border border-card-border rounded-xl shadow-sm">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-textMuted">Compiling market intelligence...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-danger/20 shadow-sm">
          <div className="w-16 h-16 bg-danger/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-danger/10">
            <Activity className="w-6 h-6 text-danger" />
          </div>
          <h3 className="text-lg font-bold text-textMain">Connection Error</h3>
          <p className="text-sm text-textMuted mt-1 max-w-sm mx-auto text-center px-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-card-border shadow-sm">
          <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-card-border">
            <BarChart3 className="w-6 h-6 text-textMuted" />
          </div>
          <h3 className="text-lg font-bold text-textMain">No Data Available</h3>
          <p className="text-sm text-textMuted mt-1">We couldn't find any transactions matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm group hover:shadow-md transition-shadow">
              <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-2">Total Transactions</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-textMain">{data.KPIs.total_transactions.toLocaleString()}</span>
                <span className="text-primary font-bold text-xs mb-1 flex items-center"><ArrowUp className="w-3 h-3" /> 12%</span>
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm group hover:shadow-md transition-shadow">
              <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-2">Median PPSF</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-textMain">₹{data.KPIs.median_ppsft.toLocaleString()}</span>
                <span className="text-primary font-bold text-xs mb-1 flex items-center"><ArrowUp className="w-3 h-3" /> 4.3%</span>
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm group hover:shadow-md transition-shadow">
              <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-2">Unique Properties</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-textMain">{data.KPIs.total_properties.toLocaleString()}</span>
                <span className="text-primary font-bold text-xs mb-1 flex items-center">Verified</span>
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm group hover:shadow-md transition-shadow">
              <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-2">Total Value (Cr)</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-textMain">₹{(data.KPIs.total_value / 10000000).toFixed(2)}</span>
                <span className="text-danger font-bold text-xs mb-1 flex items-center"><ArrowDown className="w-3 h-3" /> 0.8%</span>
              </div>
            </div>
          </div>

          {/* Chart & Top Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-card border border-card-border rounded-xl p-6 shadow-sm min-h-[350px] flex flex-col">
              <h3 className="text-lg font-bold text-textMain mb-1">Price Trends</h3>
              <p className="text-xs text-textMuted font-medium mb-6">Comparative PPSF movement across trends</p>

              <div className="flex-1 w-full relative mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.Trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="macroPpsft" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="avg_price" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }} tickLine={false} axisLine={false} tickFormatter={val => `₹${val}`} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#94A3B8' }} />
                    <Area type="monotone" dataKey="avg_price" stroke="#22C55E" strokeWidth={3} fill="url(#macroPpsft)" activeDot={{ r: 6, fill: '#22C55E', stroke: '#fff', strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <p className="text-primary bg-primary/5 p-3 rounded-lg border-l-2 border-primary text-xs font-semibold flex items-center italic">
                <Lightbulb className="w-4 h-4 mr-2" />
                Insight: Prices have shown positive variance indicating a steady upward trajectory.
              </p>
            </div>

            <div className="lg:col-span-5 bg-card border border-card-border rounded-xl p-6 shadow-sm flex flex-col min-h-[350px]">
              <h3 className="text-lg font-bold text-textMain mb-1">Top Value Deals</h3>
              <p className="text-xs text-textMuted font-medium mb-6">Highest recorded registries</p>

              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                {data.TopTransactions.map((t, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-background-secondary border border-card-border hover:border-primary/50 transition-colors">
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm font-bold text-textMain truncate">{t.building_name}</p>
                      <p className="text-[10px] text-textMuted font-medium mt-0.5">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary-dark">₹{(t.value / 10000000).toFixed(2)} Cr</p>
                      <p className="text-[10px] text-textMuted uppercase tracking-widest font-bold">{t.area} sqft</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
