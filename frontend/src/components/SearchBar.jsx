import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';

export default function SearchBar({ onSelect, className = "" }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => fetchResults(), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (bldg) => {
    setQuery(bldg);
    setIsOpen(false);
    onSelect(bldg);
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-2xl ${className}`}>
      <div className="relative flex items-center bg-white/80 backdrop-blur-md border border-card-border rounded-full p-1.5 shadow-lg group focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
        <div className="flex-1 flex items-center px-4">
          <Search className="w-5 h-5 text-textMuted group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search for a building name..."
            className="w-full bg-transparent border-0 py-3 px-4 text-textMain placeholder-textMuted focus:outline-none focus:ring-0 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:bg-background-secondary rounded-full text-textMuted">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button 
          onClick={() => results.length > 0 && handleSelect(results[0])}
          className="bg-primary-dark text-white px-8 py-3 rounded-full font-bold hover:bg-primary transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Search</span>
        </button>
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-3 bg-white/95 backdrop-blur-md border border-card-border rounded-3xl shadow-2xl max-h-80 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[100]">
          <div className="p-2">
            <p className="px-4 py-2 text-[10px] font-bold text-textMuted uppercase tracking-widest">Suggestions</p>
            <div className="overflow-y-auto max-h-64">
              {results.map((bldg, idx) => (
                <button
                  key={bldg}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-4 hover:bg-primary/5 hover:text-primary transition-all group rounded-xl"
                  onClick={() => handleSelect(bldg)}
                >
                  <div className="w-8 h-8 rounded-lg bg-background-secondary flex items-center justify-center group-hover:bg-primary/10">
                    <MapPin className="w-4 h-4 text-textMuted group-hover:text-primary" />
                  </div>
                  <span className="text-textMain font-medium group-hover:text-primary">{bldg}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
