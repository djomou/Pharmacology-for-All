'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { advisorApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';

const EXAMPLES = [
  { text:"J'ai des maux de tête depuis ce matin et un peu de fièvre", label:'🤕 Céphalée + Fièvre' },
  { text:"Je tousse beaucoup depuis 3 jours et j'ai mal à la gorge", label:'😷 Toux + Gorge' },
  { text:"J'ai des nausées et des douleurs au ventre", label:'🤢 Nausées + Ventre' },
  { text:"Des démangeaisons et des boutons sur la peau", label:'🔴 Allergie cutanée' },
  { text:"Je dors très mal depuis plusieurs jours, beaucoup de stress", label:'😴 Insomnie + Stress' },
  { text:"J'ai mal au dos et des courbatures dans tout le corps", label:'💪 Douleurs musculaires' },
];

export default function ConseillerPage() {
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();
  const router = useRouter();
  const [desc, setDesc] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoad] = useState(false);

  const G = {
    bg:     isDark?'#0b1120':'#f0fdf4',
    card:   isDark?'#111827':'#ffffff',
    card2:  isDark?'#1a2332':'#f0fdf4',
    border: isDark?'rgba(255,255,255,0.07)':'#dcfce7',
    border2:isDark?'rgba(255,255,255,0.12)':'#bbf7d0',
    text:   isDark?'#f1f5f9':'#14532d',
    text2:  isDark?'#94a3b8':'#64748b',
    text3:  isDark?'#6b7280':'#94a3b8',
    green:  '#22c55e',
    green800:isDark?'#4ade80':'#166534',
    green700:isDark?'#22c55e':'#15803d',
    green600:isDark?'#16a34a':'#16a34a',
    green100:isDark?'rgba(34,197,94,0.12)':'#dcfce7',
    green50: isDark?'rgba(34,197,94,0.06)':'#f0fdf4',
    green200:isDark?'rgba(34,197,94,0.2)':'#bbf7d0',
    green300:isDark?'rgba(34,197,94,0.3)':'#86efac',
    inputBg: isDark?'#1a2332':'#f0fdf4',
    warn:    isDark?'rgba(234,179,8,0.08)':'#fef9c3',
    warnBdr: isDark?'rgba(234,179,8,0.2)':'#fde68a',
    warnTxt: isDark?'#fbbf24':'#92400e',
    warnTxt2:isDark?'#d97706':'#a16207',
    ora:     isDark?'rgba(249,115,22,0.08)':'#fff7ed',
    oraBdr:  isDark?'rgba(249,115,22,0.2)':'#fed7aa',
    oraTxt:  isDark?'#fb923c':'#c2410c',
  };

  const analyze = async () => {
    if (desc.trim().length < 10) return;
    setLoad(true);
    try {
      const r: any = await advisorApi.analyze(desc, user?.id);
      setResult(r);
    } catch (error) {
      console.error('Erreur analyse:', error);
    } finally { setLoad(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:G.bg, transition:'background 0.3s' }}>
      <Header title="Conseiller Symptômes" subtitle="Décrivez vos symptômes — suggestions indicatives uniquement" />
      <div style={{ padding:'24px 28px' }}>

        {/* ── BOUTON "CONVERSER AVEC L'IA" ── */}
        <div style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(22,163,74,0.15), rgba(34,197,94,0.08))'
            : 'linear-gradient(135deg, #f0fdf4, #f0fdf4)',
          borderRadius: 20,
          padding: '24px 28px',
          border: isDark ? '1px solid rgba(34,197,94,0.25)' : '1px solid #bbf7d0',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
          boxShadow: isDark
            ? '0 4px 24px rgba(22,163,74,0.15)'
            : '0 4px 24px rgba(34,197,94,0.1)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            {/* Icône animée */}
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, flexShrink: 0,
              boxShadow: '0 4px 20px rgba(22,163,74,0.4)',
              position: 'relative',
            }}>
              🤖
              {/* Indicateur live */}
              <span style={{
                position: 'absolute', top: -3, right: -3,
                width: 14, height: 14, borderRadius: '50%',
                background: '#22c55e',
                border: isDark ? '2px solid #111827' : '2px solid #f0fdf4',
                boxShadow: '0 0 6px rgba(34,197,94,0.6)',
                animation: 'livePing 2s ease-out infinite',
              }} />
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 900, color: isDark ? '#86efac' : '#15803d', margin: '0 0 4px' }}>
                MedocAssistant IA
              </p>
              <p style={{ fontSize: 12, color: isDark ? '#4ade80' : '#16a34a', margin: 0, lineHeight: 1.5 }}>
                Discutez en temps réel avec notre IA médicale · Propulsé par <strong>Qwen2.5</strong>
              </p>
              <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                {['💊 106 000+ médicaments','🔒 100% local','⚡ Temps réel'].map((t,i) => (
                  <span key={i} style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background: isDark?'rgba(22,163,74,0.15)':'rgba(22,163,74,0.08)', color: isDark?'#86efac':'#15803d', border: isDark?'1px solid rgba(22,163,74,0.2)':'1px solid #bbf7d0' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/chat-ia')}
            style={{
              padding: '14px 32px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              color: 'white',
              fontWeight: 800,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 4px 20px rgba(22,163,74,0.45)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform='translateY(-2px) scale(1.02)';
              (e.currentTarget as HTMLElement).style.boxShadow='0 8px 28px rgba(22,163,74,0.55)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform='none';
              (e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(22,163,74,0.45)';
            }}>
            <span style={{ fontSize:18 }}>💬</span>
            Converser avec l'IA
            <span style={{ fontSize:16 }}>→</span>
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{ background:G.warn, borderRadius:14, padding:'14px 18px', border:`1px solid ${G.warnBdr}`, marginBottom:20, display:'flex', alignItems:'flex-start', gap:12 }}>
          <span style={{ fontSize:20, flexShrink:0 }}>⚠️</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:G.warnTxt, marginBottom:3 }}>Usage indicatif uniquement</div>
            <div style={{ fontSize:12, color:G.warnTxt2, lineHeight:1.6 }}>Les suggestions fournies sont à titre informatif et ne constituent pas un diagnostic médical. Consultez toujours un médecin ou un pharmacien avant de prendre tout médicament.</div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:20 }}>

          {/* Input panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:G.card, borderRadius:20, padding:'24px', border:`1px solid ${G.border}`, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:isDark?'rgba(168,85,247,0.12)':'#f3e8ff', border:isDark?'1px solid rgba(168,85,247,0.2)':'1px solid #e9d5ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🤖</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:G.text }}>Décrivez vos symptômes</div>
                  <div style={{ fontSize:11, color:G.text2 }}>En langage naturel, en français</div>
                </div>
              </div>
              <textarea
                value={desc}
                onChange={e=>setDesc(e.target.value)}
                placeholder="Ex: J'ai mal à la tête depuis ce matin, j'ai de la fièvre et je me sens très fatigué(e)..."
                rows={6}
                style={{ width:'100%', padding:'13px 14px', borderRadius:12, border:`1.5px solid ${G.border2}`, background:G.inputBg, fontSize:13, color:G.text, outline:'none', resize:'none', lineHeight:1.6, boxSizing:'border-box', fontFamily:'inherit' }}
                onFocus={e=>e.target.style.borderColor='#22c55e'}
                onBlur={e=>e.target.style.borderColor=G.border2}
              />
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8, marginBottom:14 }}>
                <span style={{ fontSize:11, color:desc.length<10?G.text3:G.green600, fontWeight:500 }}>{desc.length}/2000 caractères</span>
                {desc && <button onClick={()=>{setDesc('');setResult(null);}} style={{ fontSize:11, color:G.text3, background:'none', border:'none', cursor:'pointer', padding:'2px 6px', borderRadius:6 }}>✕ Effacer</button>}
              </div>
              <button onClick={analyze} disabled={loading||desc.trim().length<10}
                style={{ width:'100%', padding:'13px', borderRadius:12, background:desc.trim().length<10?G.green100:`linear-gradient(135deg,#7c3aed,#a855f7)`, color:desc.trim().length<10?G.green700:'white', fontWeight:700, fontSize:14, border:'none', cursor:desc.trim().length<10?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:desc.trim().length>=10?'0 4px 14px rgba(124,58,237,0.35)':'none' }}>
                {loading?<span style={{ display:'inline-block',width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>:'🤖'}
                Analyser mes symptômes
              </button>
            </div>

            {/* Examples */}
            <div style={{ background:G.card, borderRadius:16, padding:'18px 20px', border:`1px solid ${G.border}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.text3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>💡 Exemples — cliquez pour tester</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {EXAMPLES.map((ex,i) => (
                  <button key={i} onClick={()=>setDesc(ex.text)}
                    style={{ padding:'10px 14px', borderRadius:10, border:`1.5px solid ${G.border}`, background:G.card2, cursor:'pointer', textAlign:'left', transition:'all 0.2s', display:'flex', alignItems:'center', gap:10 }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=G.green300;(e.currentTarget as HTMLElement).style.background=G.green100;}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=G.border;(e.currentTarget as HTMLElement).style.background=G.card2;}}>
                    <span style={{ fontSize:12, fontWeight:700, color:G.green700, flexShrink:0 }}>{ex.label}</span>
                    <span style={{ fontSize:11, color:G.text2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results panel */}
          <div>
            {loading && (
              <div style={{ background:G.card, borderRadius:20, padding:'48px 24px', border:`1px solid ${G.border}`, textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize:48, marginBottom:16, animation:'spin 1s linear infinite', display:'inline-block' }}>🔍</div>
                <div style={{ fontWeight:700, color:G.green800, fontSize:15, marginBottom:6 }}>Analyse en cours...</div>
                <div style={{ fontSize:13, color:G.text2 }}>Recherche dans 106 000+ médicaments</div>
              </div>
            )}

            {!loading && result && (
              <div style={{ display:'flex', flexDirection:'column', gap:14, animation:'fadeUp 0.35s ease-out' }}>
                {result.emergencyMessage && (
                  <div style={{ background:isDark?'rgba(239,68,68,0.1)':'#fee2e2', borderRadius:14, padding:'14px 18px', border:isDark?'1px solid rgba(239,68,68,0.2)':'1px solid #fca5a5', display:'flex', gap:10 }}>
                    <span style={{ fontSize:20 }}>🚨</span>
                    <div style={{ fontSize:13, color:'#f87171', fontWeight:600, lineHeight:1.6 }}>{result.emergencyMessage}</div>
                  </div>
                )}
                {result.detectedSymptoms?.length > 0 && (
                  <div style={{ background:G.card, borderRadius:16, padding:'18px 20px', border:`1px solid ${G.border}` }}>
                    <div style={{ fontSize:11, fontWeight:700, color:G.text3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>✅ Symptômes détectés ({result.detectedSymptoms.length})</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {result.detectedSymptoms.map((s:string,i:number) => (
                        <span key={i} style={{ padding:'5px 12px', borderRadius:99, fontSize:12, fontWeight:600, background:isDark?'rgba(168,85,247,0.12)':'#f3e8ff', color:'#a855f7', border:isDark?'1px solid rgba(168,85,247,0.2)':'1px solid #e9d5ff', display:'flex', alignItems:'center', gap:5 }}>✓ {s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.suggestions?.length > 0 ? (
                  <div style={{ background:G.card, borderRadius:16, padding:'18px 20px', border:`1px solid ${G.border}` }}>
                    <div style={{ fontSize:11, fontWeight:700, color:G.text3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>💊 Médicaments suggérés ({result.suggestions.length})</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {result.suggestions.map((s:any,i:number) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12, background:G.green50, border:`1px solid ${G.border}` }}>
                          <div style={{ width:38, height:38, borderRadius:10, background:G.green100, border:`1px solid ${G.border2}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>💊</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:14, fontWeight:700, color:G.text }}>{s.name}</div>
                            {s.shortName && <div style={{ fontSize:11, color:G.text2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.shortName}</div>}
                            <div style={{ fontSize:10, color:G.text3, marginTop:2 }}>Correspondance : {s.matchedOn}</div>
                          </div>
                          <span style={{ padding:'3px 10px', borderRadius:99, fontSize:10, fontWeight:700, background:s.confidence==='élevée'?G.green100:s.confidence==='modérée'?G.warn:isDark?'rgba(59,130,246,0.12)':'#dbeafe', color:s.confidence==='élevée'?G.green800:s.confidence==='modérée'?G.warnTxt:'#1d4ed8', flexShrink:0 }}>{s.confidence}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : result.detectedSymptoms?.length > 0 ? (
                  <div style={{ background:G.card, borderRadius:16, padding:'24px', border:`1px solid ${G.border}`, textAlign:'center' }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>🔍</div>
                    <div style={{ color:G.text2, fontSize:13 }}>Aucune suggestion trouvée pour ces symptômes dans notre base.</div>
                  </div>
                ) : null}
                <div style={{ background:G.ora, borderRadius:14, padding:'16px 18px', border:`1px solid ${G.oraBdr}` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:G.oraTxt, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>⚠️ Avertissements importants</div>
                  <p style={{ margin:0, fontSize:12, color:G.oraTxt, lineHeight:1.6 }}>Les données suivantes ne sauraient faire office de référence absolue ; nous vous invitons par conséquent à solliciter promptement un établissement de santé en cas d&apos;urgence.</p>
                </div>
                <div style={{ background:G.green50, borderRadius:12, padding:'14px 16px', border:`1px solid ${G.border}` }}>
                  <p style={{ margin:0, fontSize:12, color:G.green700, lineHeight:1.6 }}>Consulter un spécialiste.</p>
                </div>
              </div>
            )}

            {!loading && !result && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* CTA vers le chat IA */}
                <div style={{ background:G.card, borderRadius:20, padding:'32px 24px', border:`1px solid ${isDark?'rgba(34,197,94,0.15)':'#bbf7d0'}`, textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', cursor:'pointer', transition:'all 0.2s' }}
                  onClick={() => router.push('/chat-ia')}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 28px rgba(22,163,74,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='0 2px 12px rgba(0,0,0,0.08)'; }}>
                  <div style={{ width:72, height:72, borderRadius:20, background:isDark?'rgba(34,197,94,0.12)':'#f0fdf4', border:isDark?'1px solid rgba(34,197,94,0.2)':'1px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 16px' }}>🤖</div>
                  <div style={{ fontWeight:800, color:G.text, fontSize:17, marginBottom:8 }}>Votre conseiller symptômes</div>
                  <div style={{ fontSize:13, color:G.text2, lineHeight:1.7, maxWidth:280, margin:'0 auto 16px' }}>
                    Remplissez le formulaire à gauche ou cliquez ci-dessous pour une conversation interactive avec l'IA.
                  </div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, background:'linear-gradient(135deg,#16a34a,#22c55e)', color:'white', fontWeight:700, fontSize:13 }}>
                    💬 Démarrer une conversation IA →
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes livePing { 0%{opacity:0.9;transform:scale(1)} 100%{opacity:0;transform:scale(2.8)} }
      `}</style>
    </div>
  );
}
