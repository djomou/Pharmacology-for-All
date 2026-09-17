'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

const G = { bg:'#f0fdf4',white:'#ffffff',green900:'#14532d',green800:'#166534',green700:'#15803d',green600:'#16a34a',green500:'#22c55e',green400:'#4ade80',green200:'#bbf7d0',green100:'#dcfce7',green50:'#f0fdf4',gray200:'#e2e8f0',gray400:'#94a3b8',gray500:'#64748b',gray700:'#334155' };

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();
  const [role, setRole]       = useState<'patient'|'medecin'>((params.get('role') as any) || 'patient');
  const [firstName, setFN]    = useState('');
  const [lastName,  setLN]    = useState('');
  const [email,     setEmail] = useState('');
  const [password,  setPwd]   = useState('');
  const [loading,   setLoad]  = useState(false);

  const strength = password.length >= 8 ? (/[A-Z]/.test(password) && /[0-9]/.test(password) ? 3 : 2) : password.length > 0 ? 1 : 0;
  const strengthLabel = ['','Faible','Moyen','Fort'][strength];
  const strengthColor = [G.white,'#ef4444','#f59e0b',G.green500][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) { toast.error('Tous les champs sont requis'); return; }
    if (password.length < 6) { toast.error('Mot de passe trop court'); return; }
    setLoad(true);
    try {
      await authApi.register({ firstName, lastName, email, password, role });
      const res = await authApi.login(email, password);
      setAuth(res.user || res, res.access_token);
      toast.success(`Compte créé ! Bienvenue, ${firstName} !`);
      router.push('/dashboard');
    } catch (err: any) { toast.error(err.message || 'Erreur lors de l\'inscription'); }
    finally { setLoad(false); }
  };

  const input = (label: string, value: string, onChange: any, type = 'text', placeholder = '', half = false) => (
    <div style={{ flex: half ? '1 1 48%' : '1 1 100%' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: G.gray700, marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${G.green200}`, background: G.white, fontSize: 14, color: G.green900, outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => e.target.style.borderColor = G.green500}
        onBlur={e => e.target.style.borderColor = G.green200}
      />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: G.bg }}>
      {/* Left panel */}
      <div style={{ width: '42%', background: `linear-gradient(160deg, ${G.green900}, ${G.green700})`, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20 }}>⚕️</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'white' }}>Pharmacology for All</div>
        </div>
        <div>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: 24 }}>
            Rejoignez<br /><span style={{ color: G.green400 }}>la communauté</span><br />médicale
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['✅ Accès gratuit à 106 000+ médicaments','✅ Vérification des interactions','✅ Conseiller symptômes intelligent','✅ Gestion de vos ordonnances'].map(t => (
              <div key={t} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>{t}</div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Usage indicatif. Consultez toujours un professionnel de santé.</p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: G.green900, marginBottom: 6 }}>Créer un compte</h1>
            <p style={{ color: G.gray500, fontSize: 14 }}>Rejoignez Pharmacology for All gratuitement</p>
          </div>

          {/* Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24, background: G.green50, borderRadius: 14, padding: 4, border: `1px solid ${G.green100}` }}>
            {([['patient','👤','Patient'],['medecin','🩺','Médecin']] as const).map(([r,icon,label]) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                style={{ padding: '10px', borderRadius: 10, border: role === r ? `1.5px solid ${G.green500}` : '1.5px solid transparent', background: role === r ? G.white : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: role === r ? 700 : 500, color: role === r ? G.green800 : G.gray400, fontSize: 14 }}>
                <span style={{ fontSize: 18 }}>{icon}</span> {label}
                {role === r && <span style={{ fontSize: 12 }}>✓</span>}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              {input('Prénom', firstName, setFN, 'text', 'Jean', true)}
              {input('Nom', lastName, setLN, 'text', 'Dupont', true)}
            </div>
            <div style={{ marginBottom: 14 }}>{input('Email', email, setEmail, 'email', 'vous@exemple.com')}</div>
            <div style={{ marginBottom: 8 }}>{input('Mot de passe', password, setPwd, 'password', 'Min. 6 caractères')}</div>

            {password && (
              <div style={{ display: 'flex', gap: 4, marginBottom: 20, alignItems: 'center' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ height: 4, flex: 1, borderRadius: 99, background: i <= strength ? strengthColor : G.green100, transition: 'background 0.3s' }} />
                ))}
                <span style={{ fontSize: 11, fontWeight: 600, color: strengthColor, marginLeft: 6, minWidth: 40 }}>{strengthLabel}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: `linear-gradient(135deg, ${G.green800}, ${G.green600})`, color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(34,197,94,0.35)', opacity: loading ? 0.7 : 1 }}>
              {loading ? <span style={{ display: 'inline-block', width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <><span>Créer mon compte</span><span>→</span></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: G.gray500 }}>
            Déjà un compte ?{' '}
            <Link href="/auth/login" style={{ color: G.green700, fontWeight: 700, textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
