'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { drugsApi } from '@/lib/api';

interface Props {
  onSelect?: (drug: any) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ onSelect, placeholder = 'Rechercher un médicament...', className = '' }: Props) {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const timer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await drugsApi.autocomplete(query);
        setResults(Array.isArray(data) ? data : data?.data || []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
  }, [query]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="input-dark w-full pl-11 pr-10 py-3 rounded-xl text-sm font-body"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
            className="absolute right-3 text-slate-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full glass border border-white/10 rounded-xl overflow-hidden z-50 shadow-deep">
          {results.map((r, i) => (
            <button key={i} onClick={() => { onSelect?.(r); setQuery(r.label || r.name); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-navy-900 text-xs font-bold">💊</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{r.label || r.name}</p>
                {r.subtitle && <p className="text-xs text-slate-400">{r.subtitle}</p>}
              </div>
              <span className="ml-auto tag tag-gold">{r.type || 'drug'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
