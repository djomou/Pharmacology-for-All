'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { drugsApi } from '@/lib/api';

const G = {
  bg: '#f0fdf4', white: '#ffffff', green900: '#14532d', green800: '#166534',
  green700: '#15803d', green600: '#16a34a', green500: '#22c55e', green400: '#4ade80',
  green200: '#bbf7d0', green100: '#dcfce7', green50: '#f0fdf4',
  gray50: '#f8fafc', gray200: '#e2e8f0', gray400: '#94a3b8', gray500: '#64748b', gray700: '#334155',
};

const STATUS_LABELS: Record<number, { label: string; bg: string; color: string }> = {
  1: { label: 'Commercialisé', bg: G.green100, color: G.green800 },
  0: { label: 'Non commercialisé', bg: '#fef9c3', color: '#92400e' },
  2: { label: 'Suspendu', bg: '#fef9c3', color: '#92400e' },
  5: { label: 'Retiré', bg: '#fee2e2', color: '#b91c1c' },
};

export default function MedicamentsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [drugs, setDrugs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const limit = 20;

  const search = async (q: string, p = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res: any = await drugsApi.search(q, p, limit, token || undefined);
      const list = Array.isArray(res) ? res : (res?.data || []);
      const pag = res?.pagination || {};
      setDrugs(list);
      setTotal(pag.total || list.length);
      setPage(p);
    } catch {
      setDrugs([]);
      setTotal(0);
    } finally { setLoading(false); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ minHeight: '100vh', background: G.bg, padding: '28px 36px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: G.green900, margin: 0 }}>💊 Médicaments</h1>
        <p style={{ color: G.gray500, fontSize: 14, margin: '4px 0 0' }}>
          {searched ? `${total.toLocaleString('fr-FR')} résultat${total > 1 ? 's' : ''}` : 'Base de 106 000+ médicaments référencés'}
        </p>
      </div>

      {/* Search card */}
      <div style={{ background: G.white, borderRadius: 20, padding: '24px 28px', border: `1px solid ${G.green100}`, marginBottom: 24, boxShadow: '0 2px 12px rgba(34,197,94,0.06)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
            <input
              type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search(query, 1)}
              placeholder="Doliprane, paracétamol, ibuprofène, Advil..."
              style={{ width: '100%', padding: '13px 14px 13px 44px', borderRadius: 12, border: `1.5px solid ${G.green200}`, background: G.white, fontSize: 14, color: G.green900, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = G.green500}
              onBlur={e => e.target.style.borderColor = G.green200}
            />
          </div>
          <button
            onClick={() => search(query, 1)}
            disabled={loading || !query.trim()}
            style={{ padding: '13px 28px', borderRadius: 12, background: !query.trim() ? G.green100 : `linear-gradient(135deg, ${G.green800}, ${G.green600})`, color: !query.trim() ? G.green700 : 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: !query.trim() ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
            {loading
              ? <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : '🔍'} Rechercher
          </button>
        </div>

        {/* Quick suggestions */}
        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: G.gray400, display: 'flex', alignItems: 'center', marginRight: 4 }}>💡 Essayez :</span>
          {['Doliprane', 'Ibuprofène', 'Amoxicilline', 'Metformine', 'Paracétamol', 'Aspirine'].map(s => (
            <button key={s} type="button" onClick={() => { setQuery(s); search(s, 1); }}
              style={{ padding: '5px 14px', borderRadius: 99, border: `1px solid ${G.green200}`, background: G.green50, color: G.green700, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = G.green100; (e.currentTarget as HTMLElement).style.borderColor = G.green500; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = G.green50; (e.currentTarget as HTMLElement).style.borderColor = G.green200; }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 16 }}>
          <span style={{ display: 'inline-block', width: 40, height: 40, border: `3px solid ${G.green200}`, borderTopColor: G.green600, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: G.gray500, fontSize: 14 }}>Recherche en cours...</p>
        </div>
      ) : searched && drugs.length === 0 ? (
        <div style={{ background: G.white, borderRadius: 20, padding: '48px', textAlign: 'center', border: `1px solid ${G.green100}` }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💊</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: G.green900, marginBottom: 6 }}>Aucun médicament trouvé</p>
          <p style={{ color: G.gray500, fontSize: 14 }}>Essayez le nom générique ou vérifiez l'orthographe</p>
        </div>
      ) : drugs.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {drugs.map((drug: any, i: number) => {
              const status = STATUS_LABELS[drug.marketStatus] || { label: 'Inconnu', bg: G.green50, color: G.gray500 };
              return (
                <div key={drug.productId}
                  onClick={() => router.push(`/medicaments/${drug.productId}`)}
                  style={{ background: G.white, borderRadius: 14, padding: '14px 20px', border: `1px solid ${G.green100}`, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.15s', animation: `fadeUp 0.3s ease-out ${Math.min(i * 30, 300)}ms both` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = G.green400; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(34,197,94,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = G.green100; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                  {/* Icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: G.green50, border: `1.5px solid ${G.green200}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>💊</div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: G.green900, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drug.name}</p>
                    {drug.shortName && <p style={{ fontSize: 12, color: G.gray500, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drug.shortName}</p>}
                    {drug.commercialName && drug.commercialName !== drug.name && (
                      <p style={{ fontSize: 11, color: G.gray400, margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drug.commercialName}</p>
                    )}
                  </div>
                  {/* Status + ID */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: status.bg, color: status.color }}>{status.label}</span>
                    <span style={{ fontSize: 11, color: G.gray400 }}>#{drug.productId}</span>
                    <span style={{ fontSize: 16, color: G.green400 }}>→</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <button onClick={() => search(query, page - 1)} disabled={page <= 1}
                style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${G.green200}`, background: G.white, color: G.green700, fontWeight: 700, cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? 0.4 : 1, fontSize: 16 }}>‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} onClick={() => search(query, p)}
                    style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${p === page ? G.green600 : G.green200}`, background: p === page ? G.green700 : G.white, color: p === page ? 'white' : G.green700, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => search(query, page + 1)} disabled={page >= totalPages}
                style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${G.green200}`, background: G.white, color: G.green700, fontWeight: 700, cursor: page >= totalPages ? 'default' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, fontSize: 16 }}>›</button>
              <span style={{ fontSize: 12, color: G.gray400, marginLeft: 8 }}>Page {page}/{totalPages} — {total.toLocaleString('fr-FR')} résultats</span>
            </div>
          )}
        </>
      ) : (
        <div style={{ background: G.white, borderRadius: 20, padding: '64px 48px', textAlign: 'center', border: `1px solid ${G.green100}` }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
          <p style={{ fontSize: 18, fontWeight: 800, color: G.green900, marginBottom: 8 }}>Recherchez un médicament</p>
          <p style={{ color: G.gray500, fontSize: 14 }}>Plus de 106 000 médicaments référencés dans notre base</p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
