'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

const NAV = [
  { href: '/dashboard',    icon: '🏠', label: 'Tableau de bord' },
  { href: '/medicaments',  icon: '💊', label: 'Médicaments' },
  { href: '/conseiller',   icon: '🤖', label: 'Conseiller Symptômes', badge: 'IA' },
  { href: '/interactions', icon: '⚠️', label: 'Interactions' },
  { href: '/indications',  icon: '📋', label: 'Indications' },
  { href: '/equivalences', icon: '🌍', label: 'Équivalences' },
  { href: '/securite',     icon: '🛡️', label: 'Sécurité' },
  { href: '/crud',         icon: '🗄️', label: 'Gestion du Médicaments', badge: 'Admin', hideForPatient: true },
  { href: '/profil',       icon: '👤', label: 'Mon profil' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 68 : 260;

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    router.push('/auth/login');
  };

  // Filtrer les items selon le rôle
  const navItems = NAV.filter(item => {
    if (item.hideForPatient && user?.role === 'patient') return false;
    return true;
  });

  return (
    <>
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: sidebarWidth,
          background: 'linear-gradient(180deg, #0a3d1f 0%, #052e16 100%)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
        }}
      >

        {/* Header */}
        <div
          style={{
            padding: collapsed ? '18px 14px' : '18px 16px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            flexShrink: 0,
          }}
        >
          {!collapsed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                <div
                  style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'linear-gradient(135deg,#22c55e,#4ade80)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(34,197,94,0.4)', flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 12, color: 'white', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                    Pharmacology for All
                  </div>
                  <div style={{ fontSize: 9, color: '#4ade80', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Référentiel Pharmaceutique
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg,#22c55e,#4ade80)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
          )}
        </div>

        {/* Expand Button */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            title="Développer"
            style={{
              margin: '8px auto',
              background: 'rgba(255,255,255,0.08)',
              border: 'none', cursor: 'pointer', borderRadius: 8,
              width: 36, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s', fontSize: 12,
            }}
          >
            ▶
          </button>
        )}

        {/* User */}
        {user && (
          <>
            {!collapsed ? (
              <div
                style={{
                  margin: '10px 10px 6px', padding: '11px 12px',
                  background: 'rgba(255,255,255,0.06)', borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#22c55e,#4ade80)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    <span style={{ color: '#052e16', fontWeight: 800, fontSize: 12 }}>{initials}</span>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.firstName} {user.lastName}
                    </div>
                    <div style={{ fontSize: 10, color: '#86efac', display: 'flex', alignItems: 'center', gap: 3, overflow: 'hidden' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px', flexShrink: 0 }}>
                <div
                  title={`${user.firstName} ${user.lastName}`}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#22c55e,#4ade80)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span style={{ color: '#052e16', fontWeight: 800, fontSize: 12 }}>{initials}</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            padding: collapsed ? '6px 8px' : '6px 10px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {!collapsed && (
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 4px 5px' }}>
              Navigation
            </div>
          )}

          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');

            if (collapsed) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 40, height: 40, borderRadius: 10,
                    marginBottom: 4, marginLeft: 'auto', marginRight: 'auto',
                    textDecoration: 'none', transition: 'all 0.15s',
                    background: active ? 'rgba(34,197,94,0.2)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(34,197,94,0.3)' : 'transparent'}`,
                    fontSize: 18,
                  }}
                >
                  {item.icon}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '9px 11px', borderRadius: 10, marginBottom: 2,
                  color: active ? 'white' : 'rgba(255,255,255,0.55)',
                  fontWeight: active ? 600 : 400, fontSize: 13,
                  textDecoration: 'none', transition: 'all 0.15s',
                  background: active ? 'rgba(34,197,94,0.15)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(34,197,94,0.25)' : 'transparent'}`,
                  whiteSpace: 'nowrap', overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: 9, fontWeight: 700, background: '#22c55e',
                      color: '#052e16', padding: '2px 5px', borderRadius: 99,
                      letterSpacing: '0.05em', flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span style={{ fontSize: 12, color: '#4ade80', flexShrink: 0 }}>›</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: collapsed ? '10px 8px' : '10px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleLogout}
            title="Déconnexion"
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 8, padding: collapsed ? '9px' : '9px 11px',
              borderRadius: 10, border: 'none',
              background: 'rgba(239,68,68,0.08)',
              color: 'rgba(252,165,165,0.8)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span style={{ flexShrink: 0 }}>🚪</span>
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Offset */}
      <style>{`
        .dashboard-main {
          margin-left: ${sidebarWidth}px;
          transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </>
  );
}
