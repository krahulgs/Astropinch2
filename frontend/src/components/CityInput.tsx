import React, { useState, useEffect, useRef } from 'react';

interface CityInputProps {
  value: string;
  onChange: (place: string, lat: number, lon: number) => void;
  label: string;
  placeholder?: string;
}

const CityInput: React.FC<CityInputProps> = ({ value, onChange, label, placeholder = "Search for a city or taluka in India..." }) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchCity = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/geo/search?q=${encodeURIComponent(query)}`, {
        signal: abortControllerRef.current.signal
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      
      // Handle the case where backend returns an error object
      if (data.error) {
        console.error("Backend geo search error:", data.error);
        setSearchResults([]);
      } else {
        setSearchResults(data);
        setShowDropdown(true);
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error("City search failed", e);
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val, 0, 0);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      searchCity(val);
    }, 300);
  };

  const selectPlace = (place: any) => {
    onChange(
      place.display_name.split(',')[0],
      parseFloat(place.lat),
      parseFloat(place.lon)
    );
    setShowDropdown(false);
  };

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary ml-3 block">{label}</label>
      <input
        required
        type="text"
        placeholder={placeholder}
        className="w-full h-10 px-5 rounded-xl bg-foreground/5 border border-transparent focus:border-primary focus:bg-transparent outline-none transition-all text-xs text-foreground placeholder:text-text-secondary/50 shadow-sm"
        value={value}
        onChange={handleInputChange}
        onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
      />
      
      {showDropdown && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {searchResults.map((result: any, idx: number) => (
            <div 
              key={idx}
              className="px-5 py-2.5 hover:bg-foreground/5 cursor-pointer border-b border-border/50 last:border-0 transition-colors"
              onClick={() => selectPlace(result)}
            >
              <p className="text-foreground text-[11px] font-medium">{result.display_name.split(',')[0]}</p>
              <p className="text-[9px] text-text-secondary/80 truncate mt-0.5">{result.display_name}</p>
            </div>
          ))}
        </div>
      )}
      {isSearching && (
        <div className="absolute right-4 top-[1.9rem]">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default CityInput;
