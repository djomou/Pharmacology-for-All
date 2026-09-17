'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const G = { green900:'#14532d',green800:'#166534',green700:'#15803d',green600:'#16a34a',green500:'#22c55e',green400:'#4ade80',green200:'#bbf7d0',green100:'#dcfce7',green50:'#f0fdf4',white:'#ffffff',gray400:'#94a3b8',gray500:'#64748b',gray700:'#334155' };
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Props {
  label?: string;
  value: string;
  onChange: (name: string, drug?: any) => void;
  placeholder?: string;
}

export function MedicamentDropdown({ label, value, onChange, placeholder = 'Tapez le nom du médicament...' }: Props) {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total,   setTotal]   = useState(0);
  const ref    = useRef<HTMLDivElement>(null);
  const timer  = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Recherche dynamique avec debounce
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/drugs?q=${encodeURIComponent(q)}&page=1&limit=50`);
      const json = await res.json();
      // Gérer les deux formes : {success,data:{data:[],pagination}} ou {data:{data:[]}}
      const inner = json?.data ?? json;
      const list  = inner?.data ?? (Array.isArray(inner) ? inner : []);
      const pag   = inner?.pagination ?? {};
      setResults(list);
      setTotal(Number(pag.total ?? list.length) || 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    if (query.length >= 2) {
      timer.current = setTimeout(() => doSearch(query), 280);
    } else {
      setResults([]);
      setTotal(0);
    }
    return () => clearTimeout(timer.current);
  }, [query, doSearch]);

  const handleOpen = () => {
    setOpen(true);
    // Focus l'input après ouverture
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (drug: any) => {
    onChange(drug.name, drug);
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', undefined);
    setQuery('');
    setResults([]);
  };

  return (
    <div ref={ref} style={{ position: 'relative', marginBottom: 8 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: G.gray700, marginBottom: 8 }}>
          {label}
        </label>
      )}

      {/* Bouton principal — affiche la valeur sélectionnée */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={handleOpen}
          style={{
            width: '100%', padding: '13px 44px 13px 16px', borderRadius: 12,
            border: `1.5px solid ${open ? G.green500 : G.green200}`,
            background: G.white, fontSize: 14,
            color: value ? G.green900 : G.gray400,
            cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center',
            boxSizing: 'border-box',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            transition: 'border-color 0.2s',
          }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value || placeholder}
          </span>
        </button>
        {/* Icône droite */}
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 4, pointerEvents: value ? 'auto' : 'none' }}>
          {value && (
            <button onClick={handleClear} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: G.gray400, padding: '2px 4px', lineHeight: 1 }} title="Effacer">
              ×
            </button>
          )}
          <span style={{ fontSize: 11, color: G.gray400 }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Dropdown ouvert */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000,
          background: G.white, borderRadius: 14,
          border: `1.5px solid ${G.green200}`,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}>
          {/* Barre de recherche dans le dropdown */}
          <div style={{ padding: '12px', borderBottom: `1px solid ${G.green100}`, background: G.green50 }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tapez au moins 2 lettres..."
                style={{
                  width: '100%', padding: '10px 12px 10px 38px',
                  borderRadius: 10, border: `1.5px solid ${G.green200}`,
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  background: G.white, color: G.green900,
                }}
                onFocus={e => e.target.style.borderColor = G.green500}
                onBlur={e  => e.target.style.borderColor = G.green200}
              />
              {loading && (
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'inline-block', width: 16, height: 16, border: `2px solid ${G.green200}`, borderTopColor: G.green600, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              )}
            </div>
          </div>

          {/* Contenu de la liste */}
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {query.length < 2 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>💊</div>
                <p style={{ color: G.gray400, fontSize: 13, margin: 0 }}>
                  Tapez au moins 2 caractères pour rechercher parmi<br />
                  <strong style={{ color: G.green700 }}>106 000+ médicaments</strong>
                </p>
              </div>
            ) : loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: G.gray400, fontSize: 13 }}>
                Recherche en cours...
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: G.gray400, fontSize: 13 }}>
                Aucun médicament pour « {query} »
              </div>
            ) : (
              results.map((drug: any, i: number) => (
                <button
                  key={drug.productId || i}
                  type="button"
                  onClick={() => handleSelect(drug)}
                  style={{
                    width: '100%', padding: '11px 16px',
                    textAlign: 'left', border: 'none',
                    borderBottom: `1px solid ${G.green50}`,
                    background: value === drug.name ? G.green50 : 'transparent',
                    cursor: 'pointer', fontSize: 13, color: G.green900,
                    display: 'flex', alignItems: 'center', gap: 10,
                    boxSizing: 'border-box', transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = G.green50}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = value === drug.name ? G.green50 : 'transparent'}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: G.green50, border: `1px solid ${G.green200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>💊</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: G.green900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drug.name}</div>
                    {drug.shortName && <div style={{ fontSize: 11, color: G.gray400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drug.shortName}</div>}
                  </div>
                  {value === drug.name && <span style={{ fontSize: 16, color: G.green500, flexShrink: 0 }}>✓</span>}
                </button>
              ))
            )}
          </div>

          {/* Pied : compteur */}
          {results.length > 0 && (
            <div style={{ padding: '8px 16px', borderTop: `1px solid ${G.green100}`, background: G.green50, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: G.gray400 }}>
                {results.length} résultats affichés
              </span>
              <span style={{ fontSize: 11, color: G.gray400 }}>
                {total > results.length ? `sur ${total.toLocaleString('fr-FR')} correspondances` : ''}
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
