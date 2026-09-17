'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { Header } from '@/components/layout/Header';
import { drugsApi, safetyApi, interactionsApi, unwrap } from '@/lib/api';

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const { isDark }      = useThemeStore();
  const router          = useRouter();
  const [stats,  setStats]  = useState<any>(null);
  const [loading,setLoading]= useState(true);

  // Palette adaptative
  const G = {
    bg:     isDark ? '#0b1120' : '#f0fdf4',
    card:   isDark ? '#111827' : '#ffffff',
    card2:  isDark ? '#1a2332' : '#f0fdf4',
    border: isDark ? 'rgba(255,255,255,0.07)' : '#dcfce7',
    border2:isDark ? 'rgba(255,255,255,0.12)' : '#bbf7d0',
    text:   isDark ? '#f1f5f9' : '#14532d',
    text2:  isDark ? '#94a3b8' : '#64748b',
    text3:  isDark ? '#6b7280' : '#94a3b8',
    green:  '#22c55e',
    green700: isDark ? '#22c55e' : '#15803d',
    green800: isDark ? '#4ade80' : '#166534',
    green100: isDark ? 'rgba(34,197,94,0.12)' : '#dcfce7',
    green50:  isDark ? 'rgba(34,197,94,0.06)' : '#f0fdf4',
  };

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const isPatient = user?.role === 'patient';

  useEffect(() => {
    Promise.all([
      drugsApi.stats(token || undefined),
      safetyApi.stats(),
      interactionsApi.stats(),
    ]).then(([drugRes, safetyRes, interRes]) => {
      setStats({ drug: unwrap(drugRes), safety: unwrap(safetyRes), inter: unwrap(interRes) });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { value: stats?.drug?.total    ?? '—', label:'Médicaments',       icon:'💊', bg:G.green50,  border:G.border2,     color:G.green800, href:'/medicaments' },
    { value: stats?.drug?.actifs   ?? '—', label:'Commercialisés',    icon:'✅', bg:G.green50,  border:G.green,       color:G.green700, href:'/medicaments' },
    { value: stats?.safety?.sideEffects ?? '—', label:'Effets indésirables', icon:'🛡️', bg: isDark?'rgba(249,115,22,0.08)':'#fff7ed', border: isDark?'rgba(249,115,22,0.2)':'#fed7aa', color:'#c2410c', href:'/securite' },
    { value: stats?.inter?.interactions  ?? '—', label:'Interactions',       icon:'⚠️', bg: isDark?'rgba(234,179,8,0.08)':'#fefce8',  border: isDark?'rgba(234,179,8,0.2)':'#fde68a',  color:'#92400e', href:'/interactions' },
  ];

  const QUICK_ACTIONS = isPatient ? [
    { href:'/conseiller',  icon:'🤖', label:'Conseiller Symptômes', desc:'Décrivez vos maux',        color:'#7c3aed', badge:'IA' },
    { href:'/medicaments', icon:'💊', label:'Médicaments',          desc:'Rechercher',                color:G.green700 },
    { href:'/interactions',icon:'⚠️', label:'Interactions',         desc:'Vérifier un risque',        color:'#b45309' },
    { href:'/indications', icon:'📋', label:'Indications',          desc:'Par pathologie',             color:'#0369a1' },
  ] : [
    { href:'/medicaments', icon:'💊', label:'Médicaments',          desc:'Recherche rapide',          color:G.green700 },
    { href:'/interactions',icon:'⚡', label:'Interactions',         desc:'Vérifier un risque',        color:'#b45309' },
    { href:'/indications', icon:'📋', label:'Indications',          desc:'CIM-10 / ATC',              color:'#0369a1' },
    { href:'/equivalences',icon:'🌍', label:'Équivalences',         desc:'Médicaments internationaux',color:'#0e7490' },
  ];

  const initials = user ? `${user.firstName?.[0]||''}${user.lastName?.[0]||''}`.toUpperCase() : 'U';

  return (
    <div style={{ minHeight:'100vh', background:G.bg, transition:'background 0.3s'}}>
      <Header title="Tableau de bord" subtitle="Vue d'ensemble de votre espace" />
      <div style={{ padding:'24px', width:'100%' }}>

        {/* ── BANNIÈRE ── */}
        <div style={{ background:`linear-gradient(135deg,${isDark?'#052e16,#14532d':'#14532d,#16a34a'})`, borderRadius:20, padding:'28px 32px', marginBottom:28, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, boxShadow:'0 8px 32px rgba(22,101,52,0.25)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:60, height:60, borderRadius:16, background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:'white' }}>{initials}</div>
            <div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', margin:0 }}>{greeting} 👋</p>
              <p style={{ fontSize:24, fontWeight:900, color:'white', margin:'2px 0' }}>{user?.firstName} {user?.lastName}</p>
              <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
                <span style={{ padding:'3px 12px', borderRadius:99, fontSize:11, fontWeight:700, background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.25)' }}>{user?.role==='medecin'?'🩺 Médecin':'👤 Patient'}</span>
                <span style={{ padding:'3px 12px', borderRadius:99, fontSize:11, background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.8)' }}>{user?.email}</span>
                <span style={{ padding:'3px 12px', borderRadius:99, fontSize:11, background:'rgba(74,222,128,0.2)', color:'#4ade80', border:'1px solid rgba(74,222,128,0.3)' }}>● Connecté</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', margin:0 }}>Dernière connexion</p>
            <p style={{ fontSize:14, fontWeight:600, color:'white', margin:'3px 0' }}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>
        </div>

        {/* ── STATISTIQUES ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
          {STAT_CARDS.map((s, i) => (
            <div key={i} onClick={() => router.push(s.href)}
              style={{ background:s.bg, borderRadius:16, padding:'20px 22px', border:`1px solid ${s.border}`, cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='none'; }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
              <p style={{ fontSize:28, fontWeight:900, color:s.color, margin:0 }}>
                {loading ? '…' : (typeof s.value==='number' ? s.value.toLocaleString('fr-FR') : s.value)}
              </p>
              <p style={{ fontSize:13, color:G.text2, margin:'4px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── ACTIONS RAPIDES ── */}
        <div style={{ marginBottom:28 }}>
          <h2 style={{ fontSize:16, fontWeight:800, color:G.text, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>⭐ Actions rapides</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {QUICK_ACTIONS.map((a, i) => (
              <div key={i} onClick={() => router.push(a.href)}
                style={{ background:G.card, borderRadius:16, padding:'20px', border:`1px solid ${G.border}`, cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor=a.color; (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 8px 24px rgba(0,0,0,0.15)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor=G.border; (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='none'; }}>
                {a.badge && <span style={{ position:'absolute', top:12, right:12, padding:'2px 8px', borderRadius:99, fontSize:9, fontWeight:700, background:`${a.color}20`, color:a.color, border:`1px solid ${a.color}30` }}>{a.badge}</span>}
                <div style={{ fontSize:28, marginBottom:12 }}>{a.icon}</div>
                <p style={{ fontSize:14, fontWeight:800, color:a.color, margin:0 }}>{a.label}</p>
                <p style={{ fontSize:12, color:G.text2, margin:'4px 0 0' }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BAS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div style={{ background:G.card, borderRadius:20, padding:'24px', border:`1px solid ${G.border}` }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:G.text, margin:'0 0 16px', display:'flex', alignItems:'center', gap:8 }}>🕐 Médicaments courants</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { name:'Doliprane 1000mg',  sub:'Paracétamol · Antidouleur', id:5485 },
                { name:'Ibuprofène 400mg',  sub:'Anti-inflammatoire · AINS', id:null },
                { name:'Amoxicilline 500mg',sub:'Antibiotique · Pénicilline', id:null },
                { name:'Metformine 850mg',  sub:'Antidiabétique oral',        id:null },
              ].map((m, i) => (
                <div key={i} onClick={() => m.id ? router.push(`/medicaments/${m.id}`) : router.push('/medicaments')}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:12, background:G.green50, border:`1px solid ${G.border}`, cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor=G.green; (e.currentTarget as HTMLElement).style.background=G.green100; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor=G.border; (e.currentTarget as HTMLElement).style.background=G.green50; }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:G.card, border:`1px solid ${G.border2}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>💊</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:G.text, margin:0 }}>{m.name}</p>
                    <p style={{ fontSize:11, color:G.text2, margin:0 }}>{m.sub}</p>
                  </div>
                  <span style={{ fontSize:14, color:G.green }}>→</span>
                </div>
              ))}
            </div>
          </div>

          {isPatient ? (
            <div onClick={() => router.push('/conseiller')}
              style={{ background:'linear-gradient(135deg,#4c1d95,#7c3aed)', borderRadius:20, padding:'24px', cursor:'pointer', display:'flex', flexDirection:'column', gap:12, transition:'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 12px 32px rgba(124,58,237,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='none'; }}>
              <div style={{ width:52, height:52, borderRadius:16, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>🤖</div>
              <div>
                <h3 style={{ fontSize:18, fontWeight:800, color:'white', margin:0 }}>Conseiller Symptômes</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', margin:'6px 0 0', lineHeight:1.6 }}>Décrivez vos symptômes en langage naturel et recevez des suggestions adaptées.</p>
              </div>
              <div style={{ marginTop:'auto', color:'rgba(255,255,255,0.8)', fontSize:13, fontWeight:600 }}>Consulter le conseiller →</div>
            </div>
          ) : (
            <div onClick={() => router.push('/equivalences')}
              style={{ background:'linear-gradient(135deg,#0c4a6e,#0ea5e9)', borderRadius:20, padding:'24px', cursor:'pointer', display:'flex', flexDirection:'column', gap:12, transition:'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 12px 32px rgba(14,165,233,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='none'; }}>
              <div style={{ width:52, height:52, borderRadius:16, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>🌍</div>
              <div>
                <h3 style={{ fontSize:18, fontWeight:800, color:'white', margin:0 }}>Équivalences Internationales</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', margin:'6px 0 0', lineHeight:1.6 }}>Retrouvez les équivalents dans 58 pays avec codes CIP, GTIN, ATC.</p>
              </div>
              <div style={{ marginTop:'auto', color:'rgba(255,255,255,0.8)', fontSize:13, fontWeight:600 }}>Explorer →</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
