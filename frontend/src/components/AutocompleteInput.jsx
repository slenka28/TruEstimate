import React, { useState, useEffect, useRef } from 'react';

export default function AutocompleteInput({ 
  value, 
  onChange, 
  onSelect, 
  placeholder, 
  endpoint, 
  icon: Icon, 
  className,
  onSubmit
}) {
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!value || value.trim().length === 0) {
        setResults([]);
        return;
      }
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}${endpoint}?query=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const timer = setTimeout(() => fetchResults(), 300);
    return () => clearTimeout(timer);
  }, [value, endpoint]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsOpen(false);
      if (onSubmit) onSubmit(e);
    }
  };

  return (
    <div className={`relative flex items-center ${className}`} ref={wrapperRef}>
      {Icon && <Icon className="w-4 h-4 text-textMuted absolute left-3 z-10" />}
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value}
        onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 rounded-lg border border-card-border text-sm focus:outline-none focus:border-primary transition-colors bg-white text-textMain`}
      />
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-card-border rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
          {results.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left px-4 py-2 text-sm text-textMain hover:bg-background-secondary transition-colors border-b border-card-border/50 last:border-0"
              onClick={() => {
                onChange(item);
                setIsOpen(false);
                if (onSelect) onSelect(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
