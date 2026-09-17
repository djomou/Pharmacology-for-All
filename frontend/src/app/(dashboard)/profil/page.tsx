'use client';
import { Header } from '@/components/layout/Header';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useThemeStore } from '@/store/theme.store';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const ROLE_LABELS: Record<string,{label:string;icon:string;color:string;bg:string}> = {
  patient:    { label:'Patient',    icon:'👤', color:'#166534', bg:'#dcfce7' },
  medecin:    { label:'Médecin',    icon:'🩺', color:'#1d4ed8', bg:'#dbeafe' },
  pharmacien: { label:'Pharmacien', icon:'💊', color:'#7c3aed', bg:'#f3e8ff' },
  admin:      { label:'Admin',      icon:'⚙️', color:'#b91c1c', bg:'#fee2e2' },
};

function Field({ icon, label, value, dark }: { icon:string; label:string; value:string; dark:boolean }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:14, padding:'14px 16px',
      borderRadius:12,
      background: dark ? 'rgba(255,255,255,0.04)' : '#f0fdf4',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#dcfce7'}`,
    }}>
      <div style={{ width:38, height:38, borderRadius:10, background: dark?'rgba(255,255,255,0.08)':'#dcfce7', border:`1px solid ${dark?'rgba(255,255,255,0.1)':'#bbf7d0'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, color: dark?'#64748b':'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:14, fontWeight:600, color: dark?'#f1f5f9':'#14532d', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value || '—'}</div>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  const { user }  = useAuthStore();
  const { isDark } = useThemeStore();

  const roleInfo = ROLE_LABELS[user?.role || 'patient'];
  const initials = user ? `${user.firstName?.[0]||''}${user.lastName?.[0]||''}`.toUpperCase() : 'U';
  const joinDate = new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });

  const card  = isDark ? '#111827' : '#ffffff';
  const card2 = isDark ? '#1a2332' : '#f0fdf4';
  const text  = isDark ? '#f1f5f9' : '#14532d';
  const sub   = isDark ? '#94a3b8' : '#64748b';
  const brd   = isDark ? 'rgba(255,255,255,0.07)' : '#dcfce7';

  return (
    <div style={{ background: isDark?'#0b1120':'#f0fdf4', minHeight:'100vh', transition:'background 0.4s' }}>
      <Header title="Mon profil" subtitle="Informations de votre compte" />
      <div style={{ padding:'24px', width:'100%' }}>

        {/* ── HERO ── */}
        <div style={{
          background: isDark
            ? 'linear-gradient(135deg,#0f172a,#1e1b4b,#1e3a5f)'
            : 'linear-gradient(135deg,#14532d,#15803d,#166534)',
          borderRadius:24, padding:'32px', marginBottom:20,
          position:'relative', overflow:'hidden',
          boxShadow: isDark
            ? '0 8px 40px rgba(99,102,241,0.2)'
            : '0 8px 40px rgba(22,163,74,0.25)',
        }}>
          {/* Cercles décoratifs */}
          {[{t:-60,r:-60,s:220},{t:null,b:-80,r:40,s:180},{t:20,l:'40%',s:100}].map((c,i) => (
            <div key={i} style={{ position:'absolute', width:c.s, height:c.s, borderRadius:'50%', background:'rgba(255,255,255,0.03)', top:c.t??undefined, right:(c.r as any)??undefined, bottom:(c as any).b??undefined, left:(c as any).l??undefined, pointerEvents:'none' }}/>
          ))}

          <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', position:'relative' }}>
            {/* Avatar */}
            <div style={{ position:'relative' }}>
              <div style={{ width:88, height:88, borderRadius:22, background:'rgba(255,255,255,0.15)', border:'2.5px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize:34, fontWeight:900, color:'white' }}>{initials}</span>
              </div>
              <div style={{ position:'absolute', bottom:-4, right:-4, width:22, height:22, borderRadius:'50%', background:'#22c55e', border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>✓</div>
            </div>

            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:28, fontWeight:900, color:'white', marginBottom:6 }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginBottom:10 }}>{user?.email}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                <span style={{ padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:700, background:'rgba(255,255,255,0.12)', color:'white', border:'1px solid rgba(255,255,255,0.2)' }}>
                  {roleInfo.icon} {roleInfo.label}
                </span>
                <span style={{ padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:700, background:'rgba(74,222,128,0.15)', color:'#86efac', border:'1px solid rgba(74,222,128,0.25)' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block', marginRight:5 }}/>Actif
                </span>
              </div>
            </div>

            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:2 }}>Membre depuis</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:600 }}>{joinDate}</div>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

          {/* ── INFOS PERSONNELLES ── */}
          <div style={{ background:card, borderRadius:20, padding:'22px', border:`1px solid ${brd}`, boxShadow: isDark?'0 4px 20px rgba(0,0,0,0.3)':'0 2px 8px rgba(34,197,94,0.05)' }}>
            <div style={{ fontSize:13, fontWeight:800, color:text, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>👤</span> Informations personnelles
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <Field icon="🔤" label="Prénom"        value={user?.firstName||''} dark={isDark}/>
              <Field icon="🔤" label="Nom"           value={user?.lastName||''}  dark={isDark}/>
              <Field icon="📧" label="Adresse email" value={user?.email||''}     dark={isDark}/>
              <Field icon={roleInfo.icon} label="Rôle" value={roleInfo.label}    dark={isDark}/>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* ── APPARENCE (THEME) ── */}
            <div style={{ background:card, borderRadius:20, padding:'22px', border:`1px solid ${brd}`, boxShadow: isDark?'0 4px 20px rgba(0,0,0,0.3)':'0 2px 8px rgba(34,197,94,0.05)' }}>
              <div style={{ fontSize:13, fontWeight:800, color:text, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>🎨</span> Apparence
              </div>

              {/* Toggle principal */}
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'16px 18px', borderRadius:14,
                background: isDark
                  ? 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(129,140,248,0.04))'
                  : 'linear-gradient(135deg,rgba(251,191,36,0.08),rgba(245,158,11,0.04))',
                border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(251,191,36,0.25)'}`,
                marginBottom:10,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background: isDark?'rgba(99,102,241,0.15)':'rgba(251,191,36,0.12)', border:`1px solid ${isDark?'rgba(99,102,241,0.3)':'rgba(251,191,36,0.3)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                    {isDark ? '🌙' : '☀️'}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:text }}>
                      {isDark ? 'Mode sombre' : 'Mode clair'}
                    </div>
                    <div style={{ fontSize:11, color:sub, marginTop:2 }}>
                      {isDark ? 'Interface sombre pour réduire la fatigue' : 'Interface claire et lumineuse'}
                    </div>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              {/* Aperçu des deux modes */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  { dark:false, label:'Mode Clair', icon:'☀️', active:!isDark },
                  { dark:true,  label:'Mode Sombre', icon:'🌙', active:isDark },
                ].map(m => (
                  <div key={m.label}
                    style={{
                      padding:'12px', borderRadius:12, cursor:'pointer',
                      border:`2px solid ${m.active ? (isDark?'rgba(99,102,241,0.5)':'#22c55e') : brd}`,
                      background: m.dark
                        ? (m.active?'rgba(99,102,241,0.1)':'rgba(0,0,0,0.15)')
                        : (m.active?'rgba(34,197,94,0.08)':'rgba(255,255,255,0.5)'),
                      transition:'all 0.2s',
                      boxShadow: m.active ? (isDark?'0 0 16px rgba(99,102,241,0.2)':'0 0 16px rgba(34,197,94,0.15)') : 'none',
                    }}
                    onClick={() => { if (!m.active) { useThemeStore.getState().toggle(); } }}>
                    {/* Mini preview */}
                    <div style={{ height:32, borderRadius:8, marginBottom:8, overflow:'hidden', background: m.dark?'#0b1120':'#f0fdf4', border:`1px solid ${m.dark?'rgba(255,255,255,0.06)':'#dcfce7'}`, display:'flex', alignItems:'center', padding:'0 6px', gap:4 }}>
                      {[1,2,3].map(j => <div key={j} style={{ height:4, flex:j===1?2:1, borderRadius:2, background: m.dark?'rgba(255,255,255,0.15)':'rgba(22,163,74,0.2)' }}/>)}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:14 }}>{m.icon}</span>
                      <span style={{ fontSize:11, fontWeight:700, color: m.active?(isDark?'#818cf8':'#15803d'):sub }}>{m.label}</span>
                      {m.active && <span style={{ marginLeft:'auto', fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:99, background: isDark?'rgba(99,102,241,0.15)':'rgba(34,197,94,0.12)', color: isDark?'#818cf8':'#15803d' }}>Actif</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SÉCURITÉ ── */}
            <div style={{ background:card, borderRadius:20, padding:'22px', border:`1px solid ${brd}`, boxShadow: isDark?'0 4px 20px rgba(0,0,0,0.3)':'0 2px 8px rgba(34,197,94,0.05)' }}>
              <div style={{ fontSize:13, fontWeight:800, color:text, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>🔒</span> Sécurité
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, background:card2, border:`1px solid ${brd}` }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:text }}>Mot de passe</div>
                    <div style={{ fontSize:11, color:sub, marginTop:2 }}>Dernière modification inconnue</div>
                  </div>
                  <button onClick={() => toast('Fonctionnalité à venir', {icon:'🔜'})}
                    style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${brd}`, background:'transparent', color:text, fontWeight:600, fontSize:12, cursor:'pointer' }}>
                    Modifier
                  </button>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, background: isDark?'rgba(34,197,94,0.06)':'#dcfce7', border:`1px solid ${isDark?'rgba(34,197,94,0.15)':'#bbf7d0'}` }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:text }}>Session active</div>
                    <div style={{ fontSize:11, color: isDark?'#4ade80':'#15803d', marginTop:2 }}>JWT — Expire dans 24h</div>
                  </div>
                  <span style={{ padding:'3px 10px', borderRadius:99, background: isDark?'rgba(34,197,94,0.12)':'#bbf7d0', color: isDark?'#4ade80':'#15803d', fontSize:11, fontWeight:700 }}>✓ Actif</span>
                </div>
              </div>
            </div>

            {/* ── STATS ── */}
            <div style={{ background:`linear-gradient(135deg,${isDark?'#0f172a':'#dcfce7'},${isDark?'#1a2332':'#f0fdf4'})`, borderRadius:20, padding:'22px', border:`1px solid ${brd}` }}>
              <div style={{ fontSize:13, fontWeight:800, color:text, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>📊</span> Statistiques
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  {v:'106K+',l:'Médicaments',e:'💊'},
                  {v:'58',   l:'Pays',        e:'🌍'},
                  {v:'12',   l:'Services',    e:'⚙️'},
                  {v:'24/7', l:'Disponible',  e:'✅'},
                ].map((s,i) => (
                  <div key={i} style={{ background:card, borderRadius:12, padding:'12px', textAlign:'center', border:`1px solid ${brd}`, boxShadow: isDark?'0 2px 8px rgba(0,0,0,0.2)':undefined }}>
                    <div style={{ fontSize:18, marginBottom:4 }}>{s.e}</div>
                    <div style={{ fontSize:18, fontWeight:800, color: isDark?'#818cf8':'#15803d' }}>{s.v}</div>
                    <div style={{ fontSize:10, color:sub }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
