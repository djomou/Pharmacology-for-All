'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { drugsApi, unwrap } from '@/lib/api';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useThemeStore } from '@/store/theme.store';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, token } = useAuthStore();
  const { isDark } = useThemeStore();
  const router = useRouter();

  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const timer = useState<NodeJS.Timeout|null>(null);

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  useEffect(() => {
    if (timer[0]) clearTimeout(timer[0]);
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res: any = await drugsApi.search(q.trim(), 1, 8, token || undefined);
        const inner = res?.data ?? res;
        const list  = inner?.data ?? (Array.isArray(inner) ? inner : []);
        setSuggestions(list);
        setOpen(list.length > 0);
      } catch { setSuggestions([]); }
      finally { setSearching(false); }
    }, 250);
    (timer as any)[0] = t;
    return () => clearTimeout(t);
  }, [q]);

  const bg      = isDark ? '#111827' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.06)' : '#dcfce7';
  const text    = isDark ? '#f1f5f9' : '#14532d';
  const sub     = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#1a2332' : '#f0fdf4';
  const dropBg  = isDark ? '#111827' : '#ffffff';
  const hoverBg = isDark ? '#1f2d40' : '#f0fdf4';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 28px', background: bg,
      borderBottom: `1px solid ${border}`,
      boxShadow: isDark
        ? '0 4px 24px rgba(0,0,0,0.3)'
        : '0 2px 12px rgba(34,197,94,0.06)',
      position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(12px)',
      transition: 'all 0.4s ease',
    }}>
      {/* Titre page */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: text, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: sub, margin: '2px 0 0' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Barre de recherche rapide */}
        <div style={{ position: 'relative', width: 240 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none', opacity: 0.5 }}>🔍</span>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => q.length >= 2 && suggestions.length > 0 && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 180)}
              placeholder="Rechercher un médicament..."
              style={{
                width: '100%', padding: '8px 10px 8px 32px', borderRadius: 10,
                border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#bbf7d0'}`,
                background: inputBg, fontSize: 13, color: text, outline: 'none',
                boxSizing: 'border-box', transition: 'all 0.2s',
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && suggestions.length > 0) {
                  router.push(`/medicaments/${suggestions[0].productId}`);
                  setOpen(false); setQ('');
                }
              }}
            />
            {searching && (
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'inline-block', width: 12, height: 12, border: '2px solid #bbf7d0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            )}
          </div>

          {/* Suggestions */}
          {open && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: dropBg, borderRadius: 12,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#dcfce7'}`,
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.12)',
              zIndex: 200, marginTop: 4, overflow: 'hidden',
            }}>
              {suggestions.map((drug: any, i: number) => (
                <div key={drug.productId}
                  onMouseDown={() => { router.push(`/medicaments/${drug.productId}`); setOpen(false); setQ(''); }}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 10,
                    borderBottom: i < suggestions.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : '#f0fdf4'}` : 'none',
                    color: text, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <span style={{ fontSize: 16 }}>💊</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drug.name}</div>
                    {drug.shortName && <div style={{ fontSize: 11, color: sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drug.shortName}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ★ TOGGLE THÈME */}
        <ThemeToggle />

        {/* Avatar utilisateur */}
        <div onClick={() => router.push('/profil')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 12px 6px 6px', borderRadius: 12,
            background: isDark ? 'rgba(255,255,255,0.05)' : '#f0fdf4',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#dcfce7'}`,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.09)' : '#dcfce7';
            (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(129,140,248,0.3)' : '#86efac';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f0fdf4';
            (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#dcfce7';
          }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'linear-gradient(135deg,#166534,#22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: 'white',
            boxShadow: '0 2px 8px rgba(22,163,74,0.35)',
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: text, lineHeight: 1.2 }}>
              {user?.firstName || 'Utilisateur'}
            </div>
            <div style={{ fontSize: 10, color: sub, lineHeight: 1.2, textTransform: 'capitalize' }}>
              {user?.role === 'medecin' ? '🩺 Médecin' : '👤 Patient'}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
