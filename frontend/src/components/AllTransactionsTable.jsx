import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Info, Search, Filter, ArrowUpDown, RotateCcw } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';

export default function AllTransactionsTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Filters and Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [village, setVillage] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchTransactions(page);
  }, [page, searchVal, village, fromDate, toDate, sortBy, sortOrder]);

  const fetchTransactions = async (pageToFetch) => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const queryParams = new URLSearchParams({
        page: pageToFetch,
        page_size: pageSize,
      });
      if (searchVal) queryParams.append('search', searchVal);
      if (village) queryParams.append('village', village);
      if (fromDate) queryParams.append('from_date', fromDate);
      if (toDate) queryParams.append('to_date', toDate);
      if (sortBy) {
        queryParams.append('sort_by', sortBy);
        queryParams.append('sort_order', sortOrder);
      }

      const response = await fetch(`${apiUrl}/transactions?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setTotal(data.total);
      } else {
        console.error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchVal(searchQuery);
  };

  const hasFilters = searchVal || village || fromDate || toDate || sortBy;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSearchVal('');
    setVillage('');
    setFromDate('');
    setToDate('');
    setSortBy('');
    setSortOrder('asc');
    setPage(1);
  };

  return (
    <div className="bg-card border border-card-border rounded-xl shadow-sm flex flex-col h-[calc(100vh-140px)]">
      <div className="p-4 border-b border-card-border bg-card flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-textMain tracking-tight">
            All Transactions
            <span className="ml-3 text-xs bg-primary/10 text-primary-dark px-3 py-1 rounded-full border border-primary/20 font-bold">
              {total.toLocaleString('en-IN')} Total
            </span>
          </h3>
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2 rounded-lg border border-card-border hover:bg-background-secondary disabled:opacity-50 transition-colors text-textMuted"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-textMain px-2">
              Page {page} of {totalPages || 1}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-2 rounded-lg border border-card-border hover:bg-background-secondary disabled:opacity-50 transition-colors text-textMuted"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-background-secondary p-3 rounded-lg border border-card-border">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] flex items-center gap-2 relative">
            <AutocompleteInput 
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={(val) => { setSearchQuery(val); setSearchVal(val); setPage(1); }}
              placeholder="Search Project Name..."
              endpoint="/search"
              icon={Search}
              className="flex-1"
            />
            <button type="submit" className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap">
              Search
            </button>
          </form>

          <div className="flex items-center gap-2">
            <AutocompleteInput 
              value={village}
              onChange={(val) => { setVillage(val); setPage(1); }}
              onSelect={(val) => { setVillage(val); setPage(1); }}
              placeholder="Village..."
              endpoint="/search_village"
              icon={Filter}
              className="w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-card-border text-sm focus:outline-none focus:border-primary transition-colors bg-white text-textMain"
            />
            <span className="text-textMuted text-sm">to</span>
            <input 
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-card-border text-sm focus:outline-none focus:border-primary transition-colors bg-white text-textMain"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {hasFilters ? (
              <button 
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors mr-2 whitespace-nowrap"
                title="Clear Filters"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Filters
              </button>
            ) : null}
            <ArrowUpDown className="w-4 h-4 text-textMuted" />
            <select 
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const val = e.target.value;
                if (!val || val === '-') {
                  setSortBy('');
                  setSortOrder('asc');
                } else {
                  const [b, o] = val.split('-');
                  setSortBy(b);
                  setSortOrder(o);
                }
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-card-border text-sm focus:outline-none focus:border-primary transition-colors bg-white text-textMain cursor-pointer"
            >
              <option value="-">Sort By...</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="name-asc">Name (A to Z)</option>
              <option value="name-desc">Name (Z to A)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto overflow-x-auto custom-scrollbar flex-1 relative bg-white">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="text-[11px] text-textMuted sticky top-0 bg-background-secondary z-10 uppercase tracking-widest border-b border-card-border">
              <tr>
                <th className="px-5 py-4 font-bold">Unit No</th>
                <th className="px-5 py-4 font-bold">Project Name</th>
                <th className="px-5 py-4 font-bold">Date of Execution</th>
                <th className="px-5 py-4 font-bold text-right">PPSF</th>
                <th className="px-5 py-4 font-bold text-right">SBUA (SqFt)</th>
                <th className="px-5 py-4 font-bold">Village</th>
                <th className="px-5 py-4 font-bold text-center w-32 shrink-0">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/50">
              {transactions.map((txn, idx) => (
                <tr key={idx} className="hover:bg-background-secondary transition-colors group">
                  <td className="px-5 py-4 text-textMain font-bold whitespace-nowrap">{txn.unit_no || '-'}</td>
                  <td className="px-5 py-4 text-textMain whitespace-nowrap">{txn.building_name || '-'}</td>
                  <td className="px-5 py-4 text-textSecondary whitespace-nowrap">
                    {txn.transaction_date ? new Date(txn.transaction_date).toLocaleDateString("en-GB") : "-"}
                  </td>
                  <td className="px-5 py-4 text-textMain font-black text-right whitespace-nowrap">
                    {txn.ppsft ? `₹${Math.round(txn.ppsft).toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="px-5 py-4 text-textSecondary text-right whitespace-nowrap font-medium">
                    {txn.area ? Math.round(txn.area) : '-'}
                  </td>
                  <td className="px-5 py-4 text-textSecondary whitespace-normal break-words min-w-[150px] max-w-[250px]">{txn.village || '-'}</td>
                  <td className="px-5 py-4 text-center w-32 shrink-0">
                    <button 
                      onClick={() => setSelectedTxn(txn)}
                      className="text-xs font-bold text-primary hover:text-primary-dark hover:underline transition-all flex items-center justify-center gap-1 mx-auto"
                    >
                      <Info className="w-3 h-3" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-textMuted">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Details */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-card-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-card-border flex justify-between items-center bg-background-secondary">
              <h3 className="text-lg font-black text-textMain">Transaction Details</h3>
              <button 
                onClick={() => setSelectedTxn(null)}
                className="p-1.5 rounded-lg hover:bg-black/5 text-textMuted hover:text-textMain transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                {Object.entries(selectedTxn)
                  .filter(([key]) => key !== 'id')
                  .map(([key, value]) => {
                  // Format some values specifically
                  let displayValue = value;
                  if (value === null || value === undefined || value === '') {
                    displayValue = '-';
                  } else if (key === 'transaction_date' || key === 'date') {
                    displayValue = new Date(value).toLocaleDateString("en-GB");
                  } else if (key === 'ppsft' || key === 'value') {
                    displayValue = `₹${Math.round(value).toLocaleString('en-IN')}`;
                  } else if (key === 'area') {
                    displayValue = `${Math.round(value)} sqft`;
                  }

                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-textMuted tracking-widest mb-1">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-medium text-textMain break-words">
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 border-t border-card-border bg-background-secondary text-right">
              <button 
                onClick={() => setSelectedTxn(null)}
                className="px-4 py-2 bg-white border border-card-border text-textMain text-sm font-bold rounded-lg hover:bg-background transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
