'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ background: '#f0fdf4', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: 'white', borderBottom: '1px solid #dcfce7', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 8px rgba(34,197,94,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#15803d,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#14532d', lineHeight: 1.1 }}>Pharmacology for All</div>
            <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Référentiel Pharmaceutique</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login" style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid #bbf7d0', color: '#15803d', fontWeight: 600, fontSize: 14, textDecoration: 'none', transition: 'all 0.2s' }}>Connexion</Link>
          <Link href="/auth/register" style={{ padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#15803d,#22c55e)', color: 'white', fontWeight: 600, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>Inscription gratuite</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 99, padding: '6px 16px', fontSize: 13, color: '#15803d', fontWeight: 600, marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
            106 283 médicaments référencés
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, color: '#0a3d1f', lineHeight: 1.1, marginBottom: 20 }}>
            La pharmacologie<br />
            <span style={{ background: 'linear-gradient(135deg,#15803d,#22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>accessible à tous</span>
          </h1>
          <p style={{ fontSize: 17, color: '#475569', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
            Recherchez des médicaments, vérifiez les interactions, consultez les posologies et recevez des conseils adaptés à vos symptômes — gratuitement.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/auth/register?role=patient" style={{ padding: '14px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#15803d,#22c55e)', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(34,197,94,0.35)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Je suis patient
            </Link>
            <Link href="/auth/register?role=medecin" style={{ padding: '14px 28px', borderRadius: 12, background: 'white', color: '#15803d', fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
              Je suis médecin
            </Link>
          </div>
        </div>

        {/* Hero illustration SVG */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width="400" height="360" viewBox="0 0 400 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="360" rx="24" fill="#dcfce7"/>
            {/* Background circles */}
            <circle cx="200" cy="180" r="140" fill="#bbf7d0" opacity="0.5"/>
            <circle cx="200" cy="180" r="100" fill="#86efac" opacity="0.4"/>
            {/* Medical cross */}
            <rect x="170" y="100" width="60" height="160" rx="12" fill="#15803d"/>
            <rect x="100" y="150" width="200" height="60" rx="12" fill="#15803d"/>
            <rect x="175" y="105" width="50" height="150" rx="10" fill="#22c55e"/>
            <rect x="105" y="155" width="190" height="50" rx="10" fill="#22c55e"/>
            {/* Pills */}
            <ellipse cx="80" cy="80" rx="28" ry="14" rx2="28" fill="#166534" transform="rotate(-30 80 80)"/>
            <ellipse cx="80" cy="80" rx="14" ry="14" fill="#4ade80" transform="rotate(-30 80 80)"/>
            <ellipse cx="320" cy="100" rx="28" ry="14" fill="#14532d" transform="rotate(20 320 100)"/>
            <ellipse cx="320" cy="100" rx="14" ry="14" fill="#86efac" transform="rotate(20 320 100)"/>
            <ellipse cx="60" cy="280" rx="24" ry="12" fill="#166534" transform="rotate(45 60 280)"/>
            <ellipse cx="60" cy="280" rx="12" ry="12" fill="#4ade80" transform="rotate(45 60 280)"/>
            <ellipse cx="340" cy="270" rx="24" ry="12" fill="#14532d" transform="rotate(-20 340 270)"/>
            <ellipse cx="340" cy="270" rx="12" ry="12" fill="#86efac" transform="rotate(-20 340 270)"/>
            {/* Stethoscope hint */}
            <circle cx="200" cy="180" r="22" fill="white" opacity="0.9"/>
            <text x="200" y="188" textAnchor="middle" fontSize="22" fill="#15803d">⚕</text>
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'linear-gradient(135deg,#0a3d1f,#15803d)', padding: '48px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
          {[['106 283','Médicaments'],['530 176','Équivalents intl.'],['45 000+','Posologies'],['58','Pays couverts']].map(([v,l]) => (
            <div key={l} style={{ padding: '24px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#86efac', marginBottom: 6 }}>{v}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0a3d1f', marginBottom: 12 }}>Tout ce qu'il vous faut</h2>
          <p style={{ color: '#64748b', fontSize: 16 }}>Une plateforme complète pour patients et professionnels de santé</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {[
            { icon:'💊', title:'Médicaments', desc:'106 000+ médicaments avec composition, forme et laboratoire', color:'#dcfce7', border:'#bbf7d0' },
            { icon:'⚠️', title:'Interactions', desc:'Vérifiez les risques entre deux substances actives en quelques secondes', color:'#fef9c3', border:'#fde68a' },
            { icon:'🌍', title:'Équivalences', desc:'Retrouvez les équivalents de n\'importe quel médicament dans 58 pays', color:'#dbeafe', border:'#bfdbfe' },
            { icon:'🤖', title:'Conseiller IA', desc:'Décrivez vos symptômes, recevez des suggestions médicamenteuses adaptées', color:'#f3e8ff', border:'#e9d5ff' },
            { icon:'📋', title:'Posologies', desc:'45 000+ posologies officielles avec phases et unités de dosage AMM', color:'#fce7f3', border:'#fbcfe8' },
            { icon:'🛡️', title:'Pharmacovigilance', desc:'Effets indésirables, alertes et précautions pour chaque médicament', color:'#ffedd5', border:'#fed7aa' },
          ].map((f,i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: '28px 24px', border: `1px solid ${f.border}`, transition: 'all 0.25s', cursor: 'default' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 32px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow='none'; }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, color: '#0a3d1f', marginBottom: 8, fontSize: 16 }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg,#0a3d1f,#166534)', margin: '0 32px 60px', borderRadius: 24, padding: '56px 48px', maxWidth: 1036, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 12 }}>Prêt à commencer ?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 32, fontSize: 16 }}>Créez votre compte gratuitement et accédez à toute la base pharmaceutique.</p>
        <Link href="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 12, background: '#22c55e', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 20px rgba(34,197,94,0.4)' }}>
          Créer un compte gratuit →
        </Link>
      </section>

      <footer style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: 13, borderTop: '1px solid #dcfce7' }}>
        © 2026 Pharmacology for All — Usage médical indicatif uniquement. Consultez toujours un professionnel de santé.
      </footer>
    </div>
  );
}
