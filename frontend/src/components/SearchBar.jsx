import React, { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      }
    };
    const timer = setTimeout(() => fetchResults(), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-xl z-50">
      <div className="relative flex items-center group">
        <Search className="absolute left-4 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
        <input 
          type="text"
          placeholder="Search for a building name (e.g. Prestige...)"
          className="w-full bg-card border border-card-border rounded-2xl py-4 pl-12 pr-4 text-textMain placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-3 bg-card border border-card-border rounded-2xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {results.map((bldg) => (
            <button
              key={bldg}
              className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-background-secondary transition-colors border-b border-card-border/50 last:border-0"
              onClick={() => {
                setQuery(bldg);
                setIsOpen(false);
                onSelect(bldg);
              }}
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-textMain font-medium">{bldg}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
