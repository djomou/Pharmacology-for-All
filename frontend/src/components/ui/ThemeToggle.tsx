'use client';
import { useThemeStore } from '@/store/theme.store';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { isDark, toggle } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      style={{
        position: 'relative',
        width: 52, height: 28,
        borderRadius: 14,
        border: 'none',
        cursor: 'pointer',
        background: isDark
          ? 'linear-gradient(135deg,#1e1b4b,#312e81)'
          : 'linear-gradient(135deg,#fbbf24,#f59e0b)',
        boxShadow: isDark
          ? '0 0 0 1px rgba(99,102,241,0.4), 0 4px 16px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 0 0 1px rgba(251,191,36,0.4), 0 4px 16px rgba(251,191,36,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
      aria-label="Toggle theme"
    >
      {/* Étoiles (mode dark) */}
      {isDark && <>
        <span style={{ position:'absolute', width:2, height:2, borderRadius:'50%', background:'white', top:5, left:8, opacity:0.8, animation:'starTwinkle 1.5s 0.2s ease-in-out infinite' }} />
        <span style={{ position:'absolute', width:1.5, height:1.5, borderRadius:'50%', background:'white', top:10, left:14, opacity:0.5, animation:'starTwinkle 2s 0.5s ease-in-out infinite' }} />
        <span style={{ position:'absolute', width:1.5, height:1.5, borderRadius:'50%', background:'white', top:6, left:18, opacity:0.6, animation:'starTwinkle 1.8s 0.8s ease-in-out infinite' }} />
      </>}

      {/* Nuages (mode light) */}
      {!isDark && <>
        <span style={{ position:'absolute', width:8, height:5, borderRadius:3, background:'rgba(255,255,255,0.5)', top:6, right:8, animation:'cloudFloat 3s ease-in-out infinite' }} />
        <span style={{ position:'absolute', width:6, height:4, borderRadius:2, background:'rgba(255,255,255,0.35)', top:9, right:12, animation:'cloudFloat 4s 0.5s ease-in-out infinite' }} />
      </>}

      {/* Thumb */}
      <div style={{
        position: 'absolute',
        top: 4, left: isDark ? 28 : 4,
        width: 20, height: 20,
        borderRadius: '50%',
        background: isDark
          ? 'linear-gradient(135deg,#c7d2fe,#a5b4fc)'
          : 'linear-gradient(135deg,#fef3c7,#fde68a)',
        boxShadow: isDark
          ? '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
          : '0 2px 8px rgba(0,0,0,0.2), 0 0 8px rgba(251,191,36,0.5), inset 0 1px 0 rgba(255,255,255,0.8)',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11,
        overflow: 'hidden',
      }}>
        {isDark ? '🌙' : '☀️'}
      </div>

      <style>{`
        @keyframes starTwinkle { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes cloudFloat  { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-2px)} }
      `}</style>
    </button>
  );
}
