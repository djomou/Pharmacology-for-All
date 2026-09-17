'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

type Role = 'patient' | 'medecin';

const G = {
  bg:'#f0fdf4', white:'#ffffff', green900:'#14532d', green800:'#166534',
  green700:'#15803d', green600:'#16a34a', green500:'#22c55e', green400:'#4ade80',
  green200:'#bbf7d0', green100:'#dcfce7', green50:'#f0fdf4',
  gray50:'#f8fafc', gray200:'#e2e8f0', gray400:'#94a3b8', gray500:'#64748b', gray700:'#334155',
};

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuth } = useAuthStore();
  const [role,     setRole]     = useState<Role>('patient');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  // ★ FIX 1 : Si déjà connecté → dashboard immédiatement (empêche le "retour en arrière")
  useEffect(() => {
    try {
      const stored = localStorage.getItem('medoc-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.isAuth === true && parsed?.state?.token) {
          router.replace('/dashboard');
          return;
        }
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Remplissez tous les champs'); return; }
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const user  = res.user || res;
      const token = res.access_token;
      if (!token) throw new Error('Token manquant');
      setAuth(user, token);
      toast.success(`Bienvenue, ${user.firstName} !`);
      // ★ FIX 2 : router.replace (pas push) → supprime /login de l'historique
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Identifiants incorrects');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:G.bg }}>

      {/* Panneau gauche */}
      <div style={{ width:'45%', background:`linear-gradient(160deg,${G.green900} 0%,${G.green700} 100%)`, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'48px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid rgba(255,255,255,0.25)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:17, color:'white' }}>Pharmacology for All</div>
            <div style={{ fontSize:11, color:G.green400, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>Référentiel Pharmaceutique</div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize:42, fontWeight:900, color:'white', lineHeight:1.15, marginBottom:20 }}>
            La santé,<br/><span style={{ color:G.green400 }}>accessible</span><br/>à tous
          </h2>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:15, lineHeight:1.7, maxWidth:340 }}>
            Accédez à 106 000+ médicaments, vérifiez les interactions et recevez des conseils personnalisés.
          </p>
          <div style={{ marginTop:40 }}>
            <svg width="280" height="160" viewBox="0 0 280 160" fill="none">
              <rect x="20" y="30" width="80" height="100" rx="16" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              <rect x="32" y="58" width="56" height="8" rx="4" fill={G.green400}/>
              <rect x="32" y="74" width="40" height="6" rx="3" fill="rgba(255,255,255,0.3)"/>
              <rect x="32" y="87" width="48" height="6" rx="3" fill="rgba(255,255,255,0.3)"/>
              <rect x="32" y="100" width="32" height="6" rx="3" fill="rgba(255,255,255,0.3)"/>
              <circle cx="60" cy="44" r="10" fill="rgba(255,255,255,0.15)" stroke={G.green400} strokeWidth="1.5"/>
              <text x="60" y="49" textAnchor="middle" fontSize="12" fill={G.green400}>💊</text>
              <rect x="120" y="10" width="140" height="140" rx="16" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              <rect x="136" y="30" width="108" height="6" rx="3" fill="rgba(255,255,255,0.4)"/>
              <rect x="136" y="44" width="80" height="6" rx="3" fill="rgba(255,255,255,0.2)"/>
              <rect x="136" y="62" width="108" height="32" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
              <rect x="144" y="70" width="60" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
              <rect x="144" y="80" width="40" height="4" rx="2" fill="rgba(255,255,255,0.15)"/>
              <rect x="136" y="104" width="108" height="32" rx="8" fill={G.green500} opacity="0.2"/>
              <rect x="144" y="114" width="50" height="4" rx="2" fill={G.green400}/>
              <rect x="136" y="124" width="28" height="10" rx="5" fill={G.green400}/>
            </svg>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[['106K+','Médicaments'],['58 pays','Couverts'],['45K+','Posologies'],['530K+','Équivalents']].map(([v,l]) => (
            <div key={l} style={{ background:'rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px', border:'1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize:20, fontWeight:800, color:G.green400 }}>{v}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau droit - formulaire */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 48px' }}>
        <div style={{ width:'100%', maxWidth:420 }}>

          <div style={{ marginBottom:32 }}>
            <h1 style={{ fontSize:30, fontWeight:900, color:G.green900, marginBottom:6 }}>Connexion</h1>
            <p style={{ color:G.gray500, fontSize:14 }}>Accédez à votre espace personnel</p>
          </div>

          {/* Sélecteur de rôle */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:28, background:G.green50, borderRadius:14, padding:4, border:`1px solid ${G.green100}` }}>
            {([['patient','👤','Patient'],['medecin','🩺','Médecin']] as const).map(([r,icon,label]) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                style={{ padding:'10px', borderRadius:10, border:role===r?`1.5px solid ${G.green500}`:'1.5px solid transparent', background:role===r?G.white:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontWeight:role===r?700:500, color:role===r?G.green800:G.gray400, fontSize:14, transition:'all 0.2s', boxShadow:role===r?'0 2px 8px rgba(34,197,94,0.15)':'none' }}>
                <span style={{ fontSize:18 }}>{icon}</span> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:G.gray700, marginBottom:6 }}>Adresse email</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>📧</span>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com" autoComplete="email"
                  style={{ width:'100%', padding:'12px 14px 12px 40px', borderRadius:12, border:`1.5px solid ${G.green200}`, background:G.white, fontSize:14, color:G.green900, outline:'none', boxSizing:'border-box' }}
                  onFocus={e=>e.target.style.borderColor=G.green500}
                  onBlur={e=>e.target.style.borderColor=G.green200}/>
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:G.gray700, marginBottom:6 }}>Mot de passe</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>🔒</span>
                <input type={showPwd?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                  style={{ width:'100%', padding:'12px 44px 12px 40px', borderRadius:12, border:`1.5px solid ${G.green200}`, background:G.white, fontSize:14, color:G.green900, outline:'none', boxSizing:'border-box' }}
                  onFocus={e=>e.target.style.borderColor=G.green500}
                  onBlur={e=>e.target.style.borderColor=G.green200}/>
                <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, padding:4 }}>
                  {showPwd?'🙈':'👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'14px', borderRadius:12, background:loading?G.green200:`linear-gradient(135deg,${G.green800},${G.green600})`, color:'white', fontWeight:700, fontSize:15, border:'none', cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:loading?'none':'0 4px 14px rgba(34,197,94,0.35)' }}>
              {loading
                ? <span style={{ display:'inline-block', width:20, height:20, border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
                : <><span>Se connecter</span><span>→</span></>}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:G.gray500 }}>
            Pas encore de compte ?{' '}
            <Link href={`/auth/register?role=${role}`} style={{ color:G.green700, fontWeight:700, textDecoration:'none' }}>Créer un compte</Link>
          </p>

          {/* Comptes de test */}









        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
