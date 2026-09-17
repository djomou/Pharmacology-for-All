'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { drugsApi, unwrap } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';

const SIZE = 820, CX = SIZE/2, CY = SIZE/2;
const R1 = 235, R2 = 108, R3 = 68, MAX_SUB = 5;

const MKT: Record<number,{label:string;c:string;glow:string}> = {
  1:{label:'Commercialisé',    c:'#22c55e', glow:'rgba(34,197,94,0.6)'},
  0:{label:'Non commercialisé',c:'#eab308', glow:'rgba(234,179,8,0.6)'},
  2:{label:'Suspendu',         c:'#eab308', glow:'rgba(234,179,8,0.6)'},
  5:{label:'Retiré',           c:'#ef4444', glow:'rgba(239,68,68,0.6)'},
};

const SEV: Record<number,{label:string;color:string}> = {
  1:{label:'Précaution',      color:'#22c55e'},
  2:{label:'À surveiller',    color:'#eab308'},
  3:{label:'Déconseillé',     color:'#f97316'},
  4:{label:'Contre-indiqué',  color:'#ef4444'},
  5:{label:'Formellement CI', color:'#dc2626'},
};

const DOMAINS = [
  { key:'composition',   icon:'🧬', label:'Composition',        color:'#10b981', glow:'rgba(16,185,129,0.5)',  dark:'#064e3b', bd:'#6ee7b7', idle:'idleA' },
  { key:'posologie',     icon:'💊', label:'Posologie',           color:'#3b82f6', glow:'rgba(59,130,246,0.5)',  dark:'#1e3a8a', bd:'#93c5fd', idle:'idleB' },
  { key:'interactions',  icon:'⚡', label:'Interactions',        color:'#f59e0b', glow:'rgba(245,158,11,0.5)',  dark:'#78350f', bd:'#fcd34d', idle:'idleC' },
  { key:'contrindic',    icon:'🚫', label:'Contre-indications',  color:'#ef4444', glow:'rgba(239,68,68,0.5)',   dark:'#7f1d1d', bd:'#fca5a5', idle:'idleD' },
  { key:'allergies',     icon:'🌿', label:'Allergies & États',   color:'#a855f7', glow:'rgba(168,85,247,0.5)',  dark:'#4c1d95', bd:'#d8b4fe', idle:'idleE' },
  { key:'indications',   icon:'🏥', label:'Indications',         color:'#06b6d4', glow:'rgba(6,182,212,0.5)',   dark:'#164e63', bd:'#67e8f9', idle:'idleF' },
  { key:'securite',      icon:'🛡️', label:'Sécurité',            color:'#f43f5e', glow:'rgba(244,63,94,0.5)',   dark:'#881337', bd:'#fda4af', idle:'idleG' },
  { key:'presentations', icon:'📦', label:'Présentations',       color:'#8b5cf6', glow:'rgba(139,92,246,0.5)',  dark:'#1e293b', bd:'#94a3b8', idle:'idleH' },
];

function domPos(i: number) {
  const a = (i * 360 / DOMAINS.length - 90) * Math.PI / 180;
  return { x: CX + R1 * Math.cos(a), y: CY + R1 * Math.sin(a) };
}
function subPositions(domI: number, total: number) {
  const dp = domPos(domI);
  const baseA = Math.atan2(dp.y - CY, dp.x - CX);
  const spread = Math.min(150, total * 28) * Math.PI / 180;
  return Array.from({ length: total }, (_, j) => {
    const a = total === 1 ? baseA : baseA - spread/2 + j * spread / (total - 1);
    return { x: dp.x + R2 * Math.cos(a), y: dp.y + R2 * Math.sin(a) };
  });
}
function microPositions(subX: number, subY: number, total: number) {
  return Array.from({ length: total }, (_, j) => {
    const a = (j * 360 / total - 90) * Math.PI / 180;
    return { x: subX + R3 * Math.cos(a), y: subY + R3 * Math.sin(a) };
  });
}

function getSubcats(key: string, eco: any) {
  const c    = eco?.composition || {};
  const poso = eco?.posology    || [];
  const inter= eco?.interactions|| {};
  const ci   = eco?.contraindications || [];
  const al   = eco?.allergies   || [];
  const ind  = eco?.indications || [];
  const cim  = eco?.cim10       || [];
  const atc  = eco?.atcClass    || [];
  const se   = eco?.sideEffects || [];
  const wa   = eco?.warnings    || [];
  const pr   = eco?.precautions || [];
  const has  = [...(eco?.smr||[]),...(eco?.asmr||[])];
  const pkg  = eco?.packages    || [];
  const rt   = eco?.routes      || [];
  const sub  = (label: string, icon: string, color: string, items: any[], extra?: any) =>
    ({ label, icon, color, items, count: items.length, ...extra });
  switch (key) {
    case 'composition': return [
      sub('Principes actifs','🧪','#10b981', c.activeIngredients||[]),
      sub('Excipients',      '⚗️','#f59e0b', c.excipients||[]),
      sub('Voies d\'admin.', '💉','#3b82f6', rt),
    ].filter(s => s.count > 0);
    case 'posologie': return [
      sub('Adulte',    '👤','#3b82f6', poso.filter((p:any)=>p.dest_ad)),
      sub('Sujet âgé', '👴','#a855f7', poso.filter((p:any)=>p.dest_ge)),
      sub('Enfant',    '👧','#06b6d4', poso.filter((p:any)=>p.dest_je)),
      sub('Nourisson', '👶','#f59e0b', poso.filter((p:any)=>p.dest_no)),
    ].filter(s => s.count > 0);
    case 'interactions': return [
      sub('Médicaments', '💊','#f59e0b', inter.drug||[]),
      sub('Alimentaires','🥗','#10b981', inter.food||[]),
      sub('Mode de vie', '🚭','#64748b', inter.lifestyle||[]),
    ].filter(s => s.count > 0);
    case 'contrindic': {
      if (!ci.length) return [];
      const shown = ci.slice(0, MAX_SUB).map((c: any) =>
        sub(c.name?.substring(0,16)+(c.name?.length>16?'…':''),'🚫','#ef4444',[c],{isLeaf:true})
      );
      if (ci.length > MAX_SUB) shown.push(sub(`+${ci.length-MAX_SUB} autres`,'📋','#64748b',ci,{isMore:true}));
      return shown;
    }
    case 'allergies': return [
      sub(`Allergies (${al.length})`,'🌿','#a855f7',al),
      sub('Grossesse',  '🤰','#f43f5e',[{name:'Consulter un médecin avant toute prise'}],{isLeaf:true}),
      sub('Allaitement','🤱','#ec4899',[{name:'Évaluation bénéfice/risque requise'}],{isLeaf:true}),
      sub('Pers. âgées','👴','#64748b',[{name:'Adapter la posologie selon la fonction rénale'}],{isLeaf:true}),
      sub('Enfants',    '👧','#06b6d4',[{name:'Vérifier l\'indication pédiatrique'}],{isLeaf:true}),
    ];
    case 'indications': return [
      sub('Indications','🏥','#06b6d4', ind),
      sub('CIM-10',     '📋','#3b82f6', cim),
      sub('ATC',        '🔬','#a855f7', atc),
    ].filter(s => s.count > 0);
    case 'securite': return [
      sub('Effets indés.','🩺','#f43f5e', se),
      sub('Alertes',      '⚠️','#f59e0b', wa),
      sub('Précautions',  '🛡️','#3b82f6', pr),
      sub('Éval. HAS',    '📊','#10b981', has),
    ].filter(s => s.count > 0);
    case 'presentations': {
      if (!pkg.length) return [];
      const shown = pkg.slice(0, MAX_SUB).map((p: any) =>
        sub((p.shortName||p.name||'Présentation')?.substring(0,14)+'…','📦','#8b5cf6',[p],{isLeaf:true})
      );
      if (pkg.length > MAX_SUB) shown.push(sub(`+${pkg.length-MAX_SUB} autres`,'📋','#64748b',pkg,{isMore:true}));
      return shown;
    }
    default: return [];
  }
}

function itemLabel(item: any): string {
  const s = item?.moleculeName||item?.name||item?.code||item?.shortName||item?.comment||'';
  return s.substring(0,14)+(s.length>14?'…':'');
}

export default function DrugEcosystemPage() {
  const { id }     = useParams() as { id:string };
  const router     = useRouter();
  const { token }  = useAuthStore();
  const { isDark } = useThemeStore();

  const [eco,       setEco]       = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [actDomain, setActDomain] = useState<string|null>(null);
  const [actSubIdx, setActSubIdx] = useState<number|null>(null);
  const [sidebar,   setSidebar]   = useState<any>(null);
  const [ripple,    setRipple]    = useState<string|null>(null);
  const [mounted,   setMounted]   = useState(false);

  // Thème adaptatif : dark cosmique / light vert pâle
  const THEME = isDark ? {
    pageBg:      'linear-gradient(135deg, #020617 0%, #0a1628 30%, #04081a 60%, #080314 100%)',
    gridColor:   'rgba(99,102,241,0.04)',
    headerBg:    'rgba(3,7,18,0.92)',
    headerBdr:   'rgba(99,102,241,0.15)',
    headerShadow:'0 4px 32px rgba(0,0,0,0.6)',
    sidebarBg:   'rgba(3,7,18,0.9)',
    sidebarBdr:  'rgba(99,102,241,0.12)',
    sidebarShadow:'-8px 0 40px rgba(99,102,241,0.06)',
    sidebarHdrBg:'rgba(3,7,18,0.95)',
    sidebarHdrBdr:'rgba(99,102,241,0.1)',
    sidebarItemBg:'rgba(255,255,255,0.03)',
    sidebarItemBdr:'rgba(255,255,255,0.06)',
    domainBg:    'rgba(10,20,40,0.9)',
    domainBgAct: 'rgba(15,30,55,0.95)',
    subBubbleBg: 'rgba(8,16,32,0.9)',
    subBubbleBAct:'rgba(12,24,48,0.95)',
    microBg:     'rgba(5,10,25,0.92)',
    textPrimary: '#f1f5f9',
    textSecond:  '#94a3b8',
    textMuted:   '#64748b',
    orbitLine:   'rgba(99,102,241,0.15)',
    orbitLine2:  'rgba(99,102,241,0.06)',
    btnBg:       'rgba(255,255,255,0.06)',
    btnBdr:      'rgba(255,255,255,0.1)',
    btnClr:      '#e2e8f0',
    hintBg:      'rgba(3,7,18,0.7)',
    hintBdr:     'rgba(99,102,241,0.2)',
    hintClr:     '#a5b4fc',
    nebula:      true,
  } : {
    pageBg:      'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)',
    gridColor:   'rgba(16,185,129,0.06)',
    headerBg:    'rgba(240,253,244,0.88)',
    headerBdr:   'rgba(16,185,129,0.15)',
    headerShadow:'0 4px 24px rgba(16,185,129,0.08)',
    sidebarBg:   'rgba(255,255,255,0.88)',
    sidebarBdr:  'rgba(16,185,129,0.15)',
    sidebarShadow:'-8px 0 40px rgba(16,185,129,0.06)',
    sidebarHdrBg:'rgba(255,255,255,0.92)',
    sidebarHdrBdr:'rgba(16,185,129,0.1)',
    sidebarItemBg:'rgba(240,253,244,0.8)',
    sidebarItemBdr:'rgba(16,185,129,0.12)',
    domainBg:    'rgba(255,255,255,0.92)',
    domainBgAct: 'rgba(255,255,255,0.96)',
    subBubbleBg: 'rgba(255,255,255,0.9)',
    subBubbleBAct:'rgba(255,255,255,0.98)',
    microBg:     'rgba(255,255,255,0.95)',
    textPrimary: '#14532d',
    textSecond:  '#64748b',
    textMuted:   '#94a3b8',
    orbitLine:   'rgba(16,185,129,0.1)',
    orbitLine2:  'rgba(16,185,129,0.04)',
    btnBg:       'rgba(16,185,129,0.06)',
    btnBdr:      'rgba(16,185,129,0.25)',
    btnClr:      '#166534',
    hintBg:      'rgba(255,255,255,0.7)',
    hintBdr:     'rgba(16,185,129,0.2)',
    hintClr:     '#15803d',
    nebula:      false,
  };

  useEffect(() => {
    setMounted(true);
    const pid = parseInt(id);
    if (!pid) { setError('ID invalide'); setLoading(false); return; }
    drugsApi.getEcosystem(pid, token||undefined)
      .then((res:any) => setEco(unwrap(res)))
      .catch(() => setError('Médicament introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDomainClick = useCallback((key: string) => {
    if (actDomain === key) { setActDomain(null); setActSubIdx(null); setSidebar(null); return; }
    setActDomain(key); setActSubIdx(null);
    setRipple(key); setTimeout(() => setRipple(null), 1400);
    if (key === 'posologie' && eco) {
      setSidebar({ title:'Posologie', icon:'💊', type:'posologie', data: eco.posology || [] });
    } else { setSidebar(null); }
  }, [actDomain, eco]);

  const handleSubClick = useCallback((idx: number, sub: any) => {
    if (actDomain === 'interactions' && sub.label === 'Médicaments') {
      setSidebar({ title:'Interactions médicamenteuses', icon:'⚡', type:'drug-interactions', data: eco?.interactions?.drug || [] });
      setActSubIdx(null); return;
    }
    if (actDomain === 'indications' && sub.label === 'ATC') {
      setSidebar({ title:'Classification ATC', icon:'🔬', type:'atc', data: eco?.atcClass || [] });
      setActSubIdx(null); return;
    }
    if (sub.isMore) { setSidebar({ title: sub.label, icon: sub.icon, items: sub.items || [] }); setActSubIdx(null); return; }
    if (actSubIdx === idx) { setActSubIdx(null); setSidebar(null); return; }
    setActSubIdx(idx);
    if (sub.items?.length > MAX_SUB) { setSidebar({ title: sub.label, icon: sub.icon, items: sub.items }); setActSubIdx(null); }
  }, [actSubIdx, actDomain, eco]);

  const handleMicroClick = useCallback((item: any, subLabel: string, subIcon: string) => {
    setSidebar({ title: subLabel, icon: subIcon, items: [item], single: true });
  }, []);

  // ── LOADER ──
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#020617 0%,#0a1628 40%,#041020 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:28 }}>
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        {Array.from({length:40}).map((_,i) => (
          <div key={i} style={{ position:'absolute', width:i%5===0?3:1.5, height:i%5===0?3:1.5, borderRadius:'50%', background:'white', opacity:Math.random()*0.7+0.1, left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, animation:`twinkle ${1.5+Math.random()*3}s ${Math.random()*3}s ease-in-out infinite` }} />
        ))}
        {/* Nébuleuses */}
        <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)', left:'5%', top:'10%', animation:'nebulaDrift 20s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.06) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)', right:'10%', bottom:'15%', animation:'nebulaDrift 15s 5s ease-in-out infinite reverse' }} />
        <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(244,63,94,0.05) 0%, transparent 70%)', left:'40%', bottom:'20%', animation:'nebulaDrift 18s 2s ease-in-out infinite' }} />
      </div>
      <div style={{ position:'relative', width:160, height:160 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ position:'absolute', inset:i*18, borderRadius:'50%', border:`1.5px solid rgba(${i===0?'99,102,241':i===1?'139,92,246':i===2?'16,185,129':'6,182,212'},${0.2+i*0.08})`, animation:`orbitSpin ${3-i*0.5}s linear ${i%2===0?'':'reverse'} infinite` }} />
        ))}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6,#10b981)', boxShadow:'0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(139,92,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, animation:'centerPulse 2s ease-in-out infinite' }}>💊</div>
        </div>
      </div>
      <div style={{ textAlign:'center' }}>
        <p style={{ background:'linear-gradient(90deg,#818cf8,#22c55e,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontSize:14, fontWeight:700, margin:0, letterSpacing:'0.15em', textTransform:'uppercase' }}>Chargement de l'écosystème</p>
        <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:12 }}>
          {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:`hsl(${220+i*30},80%,70%)`, animation:`dotBounce 1.2s ${i*0.2}s ease-in-out infinite` }} />)}
        </div>
      </div>
      <style>{`
        @keyframes orbitSpin{to{transform:rotate(360deg)}}
        @keyframes centerPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes dotBounce{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-8px);opacity:1}}
        @keyframes twinkle{0%,100%{opacity:0.1;transform:scale(0.8)}50%{opacity:0.9;transform:scale(1.3)}}
        @keyframes nebulaDrift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(20px,-15px) scale(1.05)}66%{transform:translate(-15px,20px) scale(0.96)}}
      `}</style>
    </div>
  );

  if (error || !eco) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#020617,#0a1628)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <div style={{ width:100, height:100, borderRadius:'50%', background:'rgba(239,68,68,0.15)', border:'2px solid rgba(239,68,68,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:44 }}>❌</div>
      <p style={{ color:'#fca5a5', fontWeight:700, fontSize:20, margin:0 }}>Médicament introuvable</p>
      <button onClick={() => router.back()} style={{ padding:'12px 28px', borderRadius:12, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', fontWeight:700, fontSize:14, border:'none', cursor:'pointer', boxShadow:'0 4px 20px rgba(99,102,241,0.4)' }}>← Retour</button>
    </div>
  );

  const { product } = eco;
  const mkt       = MKT[product?.marketStatus] ?? { label:'Inconnu', c:'#94a3b8', glow:'rgba(148,163,184,0.4)' };
  const actDomIdx = actDomain ? DOMAINS.findIndex(d => d.key === actDomain) : -1;
  const subcats   = actDomain ? getSubcats(actDomain, eco) : [];
  const subPos_   = actDomIdx >= 0 ? subPositions(actDomIdx, subcats.length) : [];
  const actSubcat = actSubIdx !== null ? subcats[actSubIdx] : null;
  const microItems= actSubcat && !actSubcat.isMore && actSubcat.items?.length <= MAX_SUB ? actSubcat.items : [];
  const actSubPos = actSubIdx !== null ? subPos_[actSubIdx] : null;
  const microPos_ = actSubPos && microItems.length > 0 ? microPositions(actSubPos.x, actSubPos.y, microItems.length) : [];
  const actDomObj = DOMAINS.find(d => d.key === actDomain);

  return (
    <div style={{ minHeight:'100vh', background:THEME.pageBg, display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', transition:'background 0.5s' }}>

      {/* ── FOND COSMIQUE / GRILLE ── */}
      <div style={{ position:'fixed', inset:0, backgroundImage:`radial-gradient(circle at 1px 1px, ${THEME.gridColor} 1px, transparent 0)`, backgroundSize:'32px 32px', pointerEvents:'none', zIndex:0 }} />

      {/* Nébuleuses (dark uniquement) */}
      {THEME.nebula && mounted && (
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
          <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)', left:'-5%', top:'-10%', animation:'nebulaDrift 25s ease-in-out infinite' }} />
          <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.06) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)', right:'0%', top:'20%', animation:'nebulaDrift 18s 4s ease-in-out infinite reverse' }} />
          <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(244,63,94,0.04) 0%, rgba(168,85,247,0.03) 40%, transparent 70%)', left:'30%', bottom:'-10%', animation:'nebulaDrift 22s 8s ease-in-out infinite' }} />
          <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)', right:'20%', bottom:'10%', animation:'nebulaDrift 14s 2s ease-in-out infinite reverse' }} />
          {/* Étoiles */}
          {Array.from({length:60}).map((_,i) => (
            <div key={i} style={{ position:'absolute', width:i%7===0?2.5:i%3===0?1.5:1, height:i%7===0?2.5:i%3===0?1.5:1, borderRadius:'50%', background:i%5===0?'#818cf8':i%4===0?'#22c55e':i%3===0?'#06b6d4':'white', opacity:Math.random()*0.6+0.1, left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, animation:`twinkle ${2+Math.random()*4}s ${Math.random()*4}s ease-in-out infinite`, boxShadow:i%7===0?`0 0 4px rgba(129,140,248,0.8)`:'none' }} />
          ))}
          {/* Trainées lumineuses */}
          {Array.from({length:3}).map((_,i) => (
            <div key={`streak-${i}`} style={{ position:'absolute', width:1, height:120+i*40, borderRadius:1, background:`linear-gradient(to bottom, transparent, rgba(${i===0?'99,102,241':i===1?'16,185,129':'6,182,212'},0.3), transparent)`, left:`${20+i*30}%`, top:`${10+i*20}%`, transform:`rotate(${-30+i*20}deg)`, animation:`streakFade ${3+i}s ${i*2}s ease-in-out infinite` }} />
          ))}
        </div>
      )}

      {/* Particules flottantes (light) */}
      {!THEME.nebula && mounted && (
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
          {Array.from({length:12}).map((_,i) => (
            <div key={i} style={{ position:'absolute', width:3+Math.random()*4, height:3+Math.random()*4, borderRadius:'50%', background:`rgba(16,185,129,${0.1+Math.random()*0.15})`, left:`${10+Math.random()*80}%`, top:`${10+Math.random()*80}%`, animation:`float ${4+Math.random()*6}s ${Math.random()*4}s ease-in-out infinite` }} />
          ))}
          <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.04) 0%,transparent 70%)', left:'10%', top:'10%', animation:'ambientDrift 12s ease-in-out infinite' }} />
          <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,0.04) 0%,transparent 70%)', right:'10%', bottom:'15%', animation:'ambientDrift 10s 3s ease-in-out infinite reverse' }} />
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center', gap:12, padding:'12px 24px', background:THEME.headerBg, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:`1px solid ${THEME.headerBdr}`, boxShadow:THEME.headerShadow, transition:'all 0.4s' }}>

        <button onClick={() => router.back()}
          style={{ padding:'8px 18px', borderRadius:10, border:`1px solid ${THEME.btnBdr}`, background:THEME.btnBg, color:THEME.btnClr, fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'all 0.2s', backdropFilter:'blur(8px)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background=isDark?'rgba(99,102,241,0.15)':'rgba(16,185,129,0.14)'; (e.currentTarget as HTMLElement).style.transform='translateX(-2px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background=THEME.btnBg; (e.currentTarget as HTMLElement).style.transform='none'; }}>
          ← Retour
        </button>

        <div style={{ width:1, height:24, background:isDark?'linear-gradient(to bottom,transparent,rgba(99,102,241,0.4),transparent)':'linear-gradient(to bottom,transparent,rgba(16,185,129,0.3),transparent)' }} />

        {/* Statut */}
        <div style={{ position:'relative' }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:mkt.c, boxShadow:`0 0 8px ${mkt.glow}, 0 0 20px ${mkt.glow}` }} />
          <div style={{ position:'absolute', inset:-3, borderRadius:'50%', border:`1px solid ${mkt.c}`, opacity:0.4, animation:'statusPing 2s ease-out infinite' }} />
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:16, fontWeight:900, color:THEME.textPrimary, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            ...(isDark ? { background:'linear-gradient(90deg,#e2e8f0,#a5b4fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' } : { background:`linear-gradient(90deg,#14532d,#15803d)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' })
          }}>
            {product?.name}
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
            <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:`${mkt.c}20`, color:mkt.c, border:`1px solid ${mkt.c}30`, letterSpacing:'0.04em' }}>{mkt.label}</span>
            <span style={{ fontSize:10, color:THEME.textMuted }}>#{product?.productId}</span>
            {product?.shortName && <span style={{ fontSize:10, color:THEME.textSecond, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>· {product.shortName}</span>}
          </div>
        </div>

        {/* Raccourcis domaines */}
        <div style={{ display:'flex', gap:4, flexShrink:0, padding:'4px 6px', borderRadius:12, background:isDark?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.6)', border:`1px solid ${THEME.headerBdr}`, backdropFilter:'blur(8px)' }}>
          {DOMAINS.map(d => (
            <button key={d.key} title={d.label} onClick={() => handleDomainClick(d.key)}
              style={{ width:30, height:30, borderRadius:8, border:`1.5px solid ${actDomain===d.key ? d.color : isDark?'rgba(255,255,255,0.08)':'rgba(16,185,129,0.15)'}`, background:actDomain===d.key ? `${d.color}20` : 'transparent', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', boxShadow:actDomain===d.key ? `0 0 12px ${d.glow}` : 'none', transform:actDomain===d.key ? 'scale(1.12)' : 'scale(1)' }}>
              {d.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── CANVAS + SIDEBAR ── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden', position:'relative', zIndex:1 }}>

        <div style={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'20px', overflow:'auto', minHeight:'100vh', position:'sticky', top:0 }}>
          <div style={{ position:'relative', width:SIZE, height:SIZE, flexShrink:0 }}>

            {/* ── SVG ORBITES ── */}
            <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              <defs>
                <filter id="glowF" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="b1"/>
                  <feComposite in="SourceGraphic" in2="b1" operator="over"/>
                </filter>
                <filter id="glowStrong" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="6" result="b2"/>
                  <feComposite in="SourceGraphic" in2="b2" operator="over"/>
                </filter>
                <radialGradient id="orbitGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor={isDark?'rgba(99,102,241,0)':'rgba(16,185,129,0)'} />
                  <stop offset="80%"  stopColor={isDark?'rgba(99,102,241,0.06)':'rgba(16,185,129,0.06)'} />
                  <stop offset="100%" stopColor={isDark?'rgba(99,102,241,0)':'rgba(16,185,129,0)'} />
                </radialGradient>
              </defs>

              <circle cx={CX} cy={CY} r={R1+4} fill="url(#orbitGrad)" stroke="none"/>
              <circle cx={CX} cy={CY} r={R1} fill="none" stroke={THEME.orbitLine} strokeWidth="1" strokeDasharray="3 12"/>
              <circle cx={CX} cy={CY} r={R1-20} fill="none" stroke={THEME.orbitLine2} strokeWidth="1"/>

              {DOMAINS.map((d, i) => {
                const dp    = domPos(i);
                const isAct = actDomain === d.key;
                const isRip = ripple === d.key;
                return (
                  <g key={d.key}>
                    <line x1={CX} y1={CY} x2={dp.x} y2={dp.y}
                      stroke={isAct ? d.color : THEME.orbitLine}
                      strokeWidth={isAct ? 2 : 1}
                      strokeDasharray={isAct ? 'none' : '3 10'}
                      style={{ transition:'all 0.4s' }}/>
                    {isAct && <>
                      <line x1={CX} y1={CY} x2={dp.x} y2={dp.y} stroke={d.color} strokeWidth="2.5" filter="url(#glowF)" opacity="0.6"/>
                      <line x1={CX} y1={CY} x2={dp.x} y2={dp.y} stroke={d.color} strokeWidth="1.5" strokeDasharray="8 14" style={{ animation:'dashFlow 1.5s linear infinite' }} opacity="0.8"/>
                      <circle r="5" fill={d.color} filter="url(#glowStrong)" opacity="1">
                        <animateMotion dur="1.8s" repeatCount="indefinite"><mpath href={`#path_${d.key}`}/></animateMotion>
                      </circle>
                      <path id={`path_${d.key}`} d={`M${CX},${CY} L${dp.x},${dp.y}`} fill="none"/>
                    </>}
                    {isRip && <>
                      <circle cx={dp.x} cy={dp.y} r="0" fill="none" stroke={d.color} strokeWidth="3" style={{ animation:'rippleWave 1.4s ease-out forwards' }}/>
                      <circle cx={dp.x} cy={dp.y} r="0" fill="none" stroke={d.color} strokeWidth="1.5" opacity="0.4" style={{ animation:'rippleWave 1.4s 0.3s ease-out forwards' }}/>
                    </>}
                    {isAct && subPos_.map((sp, si) => (
                      <g key={si}>
                        <line x1={dp.x} y1={dp.y} x2={sp.x} y2={sp.y}
                          stroke={subcats[si]?.color || d.color} strokeWidth="1.5"
                          strokeDasharray={actSubIdx===si ? 'none':'4 7'} strokeOpacity="0.7"
                          style={{ animation:`fadeIn 0.35s ${si*60}ms both` }} filter="url(#glowF)"/>
                        {actSubIdx===si && (
                          <circle r="3" fill={subcats[si]?.color||d.color} opacity="0.9">
                            <animateMotion dur="1.2s" repeatCount="indefinite"><mpath href={`#subpath_${si}`}/></animateMotion>
                          </circle>
                        )}
                        <path id={`subpath_${si}`} d={`M${dp.x},${dp.y} L${sp.x},${sp.y}`} fill="none"/>
                      </g>
                    ))}
                    {isAct && actSubPos && microPos_.map((mp, mi) => (
                      <line key={mi} x1={actSubPos.x} y1={actSubPos.y} x2={mp.x} y2={mp.y}
                        stroke={actSubcat?.color||d.color} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="2 5"
                        style={{ animation:`fadeIn 0.25s ${mi*40}ms both` }}/>
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* ── BULLE CENTRALE ── */}
            <div style={{ position:'absolute', left:CX-72, top:CY-72, width:144, height:144, zIndex:20 }}>
              {[36,26,16,6].map((pad, pi) => (
                <div key={pi} style={{ position:'absolute', inset:-pad, borderRadius:'50%', border:`1px solid ${isDark?`rgba(99,102,241,${0.08+pi*0.08})`:`rgba(16,185,129,${0.06+pi*0.06})`}`, animation:`ring ${2.5+pi*0.6}s ease-in-out ${pi*0.5}s infinite` }} />
              ))}
              <div style={{ position:'absolute', inset:-20, borderRadius:'50%', background:isDark?'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)':'radial-gradient(circle,rgba(16,185,129,0.12) 0%,transparent 70%)', animation:'haloBreath 3s ease-in-out infinite' }} />
              <div style={{
                width:144, height:144, borderRadius:'50%',
                background:isDark
                  ? 'linear-gradient(145deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)'
                  : 'linear-gradient(145deg,#166534 0%,#15803d 40%,#16a34a 70%,#22c55e 100%)',
                border:isDark?'2px solid rgba(129,140,248,0.5)':'2px solid rgba(74,222,128,0.4)',
                boxShadow:isDark
                  ? '0 0 0 4px rgba(99,102,241,0.1), 0 0 50px rgba(99,102,241,0.4), 0 0 100px rgba(139,92,246,0.2), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : '0 0 0 4px rgba(16,185,129,0.08), 0 0 40px rgba(16,185,129,0.25), 0 8px 40px rgba(22,163,74,0.3)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5,
                position:'relative', overflow:'hidden',
              }}>
                <div style={{ position:'absolute', top:-20, left:-20, width:80, height:80, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)' }} />
                <span style={{ fontSize:38, filter:`drop-shadow(0 2px 12px ${isDark?'rgba(99,102,241,0.6)':'rgba(0,0,0,0.3)'})`, position:'relative', zIndex:1 }}>💊</span>
                <div style={{ textAlign:'center', padding:'0 8px', position:'relative', zIndex:1 }}>
                  <p style={{ fontSize:9.5, fontWeight:800, color:'white', margin:0, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:114, textShadow:isDark?'0 0 12px rgba(129,140,248,0.8)':'0 1px 4px rgba(0,0,0,0.3)' }}>
                    {product?.name?.length > 18 ? product.name.substring(0,18)+'…' : product?.name}
                  </p>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, marginTop:3 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:mkt.c, boxShadow:`0 0 6px ${mkt.glow}` }} />
                    <p style={{ fontSize:9, color:'rgba(255,255,255,0.85)', margin:0, fontWeight:600 }}>{mkt.label}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BULLES DOMAINES ── */}
            {DOMAINS.map((d, i) => {
              const dp    = domPos(i);
              const isAct = actDomain === d.key;
              const BR    = 52;
              const sc    = getSubcats(d.key, eco);
              const tot   = sc.reduce((a:number,s:any)=>a+(s.items?.length||0),0);
              return (
                <div key={d.key} onClick={() => handleDomainClick(d.key)}
                  style={{
                    position:'absolute', left:dp.x-BR, top:dp.y-BR, width:BR*2, height:BR*2, borderRadius:'50%',
                    background: isAct
                      ? (isDark ? `linear-gradient(145deg,rgba(15,25,50,0.98),rgba(20,35,70,0.95))` : `linear-gradient(145deg,rgba(255,255,255,0.96),rgba(255,255,255,0.88))`)
                      : (isDark ? 'rgba(8,15,30,0.9)' : 'rgba(255,255,255,0.92)'),
                    border:`2px solid ${isAct ? d.color : isDark ? d.color+'40' : d.bd+'80'}`,
                    boxShadow: isAct
                      ? `0 0 0 3px ${d.color}25, 0 0 30px ${d.glow}, 0 0 60px ${d.glow.replace('0.5','0.2')}, inset 0 1px 0 rgba(255,255,255,0.1)`
                      : isDark ? `0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)` : '0 4px 16px rgba(0,0,0,0.06)',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
                    cursor:'pointer', zIndex:8, userSelect:'none',
                    animation:`${d.idle} ${2.2+i*0.2}s ${i*0.25}s ease-in-out infinite`,
                    transition:'background 0.3s, border-color 0.3s, box-shadow 0.3s',
                    backdropFilter:'blur(12px)',
                  }}
                  onMouseEnter={e => { if (!isAct) (e.currentTarget as HTMLElement).style.boxShadow=`0 0 24px ${d.glow}, 0 8px 32px rgba(0,0,0,0.3)`; }}
                  onMouseLeave={e => { if (!isAct) (e.currentTarget as HTMLElement).style.boxShadow=isDark?'0 4px 20px rgba(0,0,0,0.5)':'0 4px 16px rgba(0,0,0,0.06)'; }}>

                  {isAct && <div style={{ position:'absolute', inset:-8, borderRadius:'50%', background:`radial-gradient(circle,${d.glow} 0%,transparent 70%)`, animation:'domainGlow 2s ease-in-out infinite' }} />}
                  <span style={{ fontSize:22, lineHeight:1, filter:isAct?`drop-shadow(0 0 8px ${d.color})`:'none', transition:'filter 0.3s', position:'relative', zIndex:1 }}>{d.icon}</span>
                  <p style={{ fontSize:8.5, fontWeight:800, color:isAct ? d.color : THEME.textSecond, margin:0, textAlign:'center', lineHeight:1.2, padding:'0 4px', textTransform:'uppercase', letterSpacing:'0.04em', transition:'color 0.3s', position:'relative', zIndex:1 }}>
                    {d.label}
                  </p>
                  {tot > 0 && (
                    <span style={{ position:'absolute', top:3, right:3, minWidth:18, height:18, borderRadius:9, background:`linear-gradient(135deg,${d.color},${d.dark})`, color:'white', fontSize:8, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', boxShadow:`0 2px 8px ${d.glow}`, zIndex:2 }}>
                      {tot > 99 ? '99+' : tot}
                    </span>
                  )}
                </div>
              );
            })}

            {/* ── SOUS-BULLES ── */}
            {actDomain && subcats.map((sub: any, si: number) => {
              const sp  = subPos_[si];
              if (!sp) return null;
              const SR  = 36;
              const isAS= actSubIdx === si;
              return (
                <div key={si} onClick={() => handleSubClick(si, sub)}
                  style={{
                    position:'absolute', left:sp.x-SR, top:sp.y-SR, width:SR*2, height:SR*2, borderRadius:'50%',
                    background: isAS
                      ? (isDark ? `rgba(15,25,50,0.98)` : `rgba(255,255,255,0.98)`)
                      : (isDark ? 'rgba(8,15,30,0.9)' : 'rgba(255,255,255,0.9)'),
                    border:`2px solid ${isAS ? sub.color : sub.color+'50'}`,
                    boxShadow: isAS
                      ? `0 0 0 3px ${sub.color}20, 0 0 24px ${sub.color}50, 0 4px 20px rgba(0,0,0,0.3)`
                      : isDark ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.06)',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
                    cursor:'pointer', zIndex:12, backdropFilter:'blur(12px)',
                    animation:`fadeInUp 0.35s ${si*60}ms cubic-bezier(0.34,1.56,0.64,1) both, subIdle${(si%4)+1} ${1.8+si*0.2}s ${si*0.15}s ease-in-out infinite`,
                    transition:'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='scale(1.08)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 0 24px ${sub.color}60, 0 4px 20px rgba(0,0,0,0.3)`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.boxShadow=isAS ? `0 0 0 3px ${sub.color}20, 0 0 24px ${sub.color}50` : isDark?'0 2px 12px rgba(0,0,0,0.5)':'0 2px 10px rgba(0,0,0,0.06)'; }}>
                  <span style={{ fontSize:16, filter:isAS?`drop-shadow(0 0 6px ${sub.color})`:'none', transition:'filter 0.3s' }}>{sub.icon}</span>
                  <p style={{ fontSize:7.5, fontWeight:700, color:isAS ? sub.color : THEME.textSecond, margin:0, textAlign:'center', lineHeight:1.2, padding:'0 3px', transition:'color 0.2s' }}>
                    {sub.label?.length > 10 ? sub.label.substring(0,10)+'…' : sub.label}
                  </p>
                  {!sub.isLeaf && sub.count > 0 && (
                    <span style={{ fontSize:7, fontWeight:800, color:sub.color, background:`${sub.color}18`, padding:'1px 6px', borderRadius:99, border:`1px solid ${sub.color}30` }}>{sub.count}</span>
                  )}
                  {sub.isMore && (
                    <span style={{ fontSize:7, fontWeight:800, color:'white', background:`linear-gradient(135deg,${sub.color},${sub.color}cc)`, padding:'1px 6px', borderRadius:99 }}>+</span>
                  )}
                </div>
              );
            })}

            {/* ── MICRO-BULLES ── */}
            {microItems.length > 0 && microPos_.map((mp: any, mi: number) => {
              const MR = 24;
              return (
                <div key={mi} onClick={() => handleMicroClick(microItems[mi], actSubcat?.label, actSubcat?.icon)}
                  style={{
                    position:'absolute', left:mp.x-MR, top:mp.y-MR, width:MR*2, height:MR*2, borderRadius:'50%',
                    background:isDark?'rgba(8,15,30,0.92)':'rgba(255,255,255,0.95)',
                    border:`1.5px solid ${actSubcat?.color||'#22c55e'}50`,
                    boxShadow:`0 2px 10px rgba(0,0,0,0.2), 0 0 10px ${actSubcat?.color||'#22c55e'}25`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    cursor:'pointer', zIndex:15, overflow:'hidden', backdropFilter:'blur(8px)',
                    animation:`fadeInUp 0.25s ${mi*45}ms cubic-bezier(0.34,1.56,0.64,1) both`,
                    transition:'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='scale(1.15)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 4px 16px rgba(0,0,0,0.3), 0 0 16px ${actSubcat?.color||'#22c55e'}40`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.boxShadow=`0 2px 10px rgba(0,0,0,0.2)`; }}>
                  <p style={{ fontSize:6.5, fontWeight:700, color:actSubcat?.color||THEME.textPrimary, margin:0, textAlign:'center', padding:'0 3px', lineHeight:1.2 }}>
                    {itemLabel(microItems[mi])}
                  </p>
                </div>
              );
            })}

            {/* ── HINT ── */}
            {!actDomain && (
              <div style={{ position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)', pointerEvents:'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:99, background:THEME.hintBg, border:`1px solid ${THEME.hintBdr}`, backdropFilter:'blur(12px)', boxShadow:isDark?'0 4px 20px rgba(99,102,241,0.1)':'0 4px 16px rgba(16,185,129,0.08)' }}>
                  <span style={{ animation:'arrowLeft 1.5s ease-in-out infinite', display:'inline-block', color:THEME.hintClr }}>←</span>
                  <p style={{ fontSize:11, color:THEME.hintClr, fontWeight:600, margin:0, letterSpacing:'0.04em' }}>Cliquez sur un domaine pour explorer</p>
                  <span style={{ animation:'arrowRight 1.5s ease-in-out infinite', display:'inline-block', color:THEME.hintClr }}>→</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        {sidebar && (
          <div style={{ width:400, borderLeft:`1px solid ${THEME.sidebarBdr}`, background:THEME.sidebarBg, overflowY:'auto', animation:'slideInRight 0.4s cubic-bezier(0.34,1.56,0.64,1)', flexShrink:0, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', boxShadow:THEME.sidebarShadow, transition:'background 0.4s, border-color 0.4s' }}>
            <div style={{ padding:'18px 20px', borderBottom:`1px solid ${THEME.sidebarHdrBdr}`, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:THEME.sidebarHdrBg, zIndex:20, backdropFilter:'blur(16px)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                {sidebar.icon && (
                  <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${actDomObj?.color||'#22c55e'}18,${actDomObj?.color||'#22c55e'}35)`, border:`1.5px solid ${actDomObj?.color||'#22c55e'}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:`0 4px 16px ${actDomObj?.glow||'rgba(16,185,129,0.3)'}` }}>
                    {sidebar.icon}
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize:15, fontWeight:800, margin:0, background:isDark?`linear-gradient(90deg,#e2e8f0,${actDomObj?.color||'#a5b4fc'})`:`linear-gradient(90deg,#14532d,${actDomObj?.color||'#15803d'})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{sidebar.title}</h3>
                  {(sidebar.data?.length > 0 || sidebar.items?.length > 0) && (
                    <p style={{ fontSize:11, color:THEME.textMuted, margin:'2px 0 0', display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ width:4, height:4, borderRadius:'50%', background:actDomObj?.color||'#22c55e', display:'inline-block' }} />
                      {(sidebar.data||sidebar.items||[]).length} élément{(sidebar.data||sidebar.items||[]).length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setSidebar(null)}
                style={{ width:30, height:30, borderRadius:9, border:`1px solid ${THEME.btnBdr}`, background:THEME.btnBg, color:THEME.textMuted, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, transition:'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.12)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(239,68,68,0.35)'; (e.currentTarget as HTMLElement).style.color='#ef4444'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background=THEME.btnBg; (e.currentTarget as HTMLElement).style.borderColor=THEME.btnBdr; (e.currentTarget as HTMLElement).style.color=THEME.textMuted; }}>
                ×
              </button>
            </div>
            <div style={{ padding:'16px' }}>
              {sidebar.type === 'posologie'         && <PosologySidebar      data={sidebar.data} color={actDomObj?.color||'#22c55e'} glow={actDomObj?.glow||'rgba(16,185,129,0.3)'} isDark={isDark} THEME={THEME} />}
              {sidebar.type === 'drug-interactions' && <DrugInteractionsSidebar data={sidebar.data} color={actDomObj?.color||'#22c55e'} isDark={isDark} THEME={THEME} />}
              {sidebar.type === 'atc'               && <ATCSidebar           data={sidebar.data} isDark={isDark} THEME={THEME} />}
              {!sidebar.type && sidebar.single      && <SidebarItemDetail    item={sidebar.items?.[0]} color={actDomObj?.color||'#22c55e'} isDark={isDark} THEME={THEME} />}
              {!sidebar.type && !sidebar.single     && sidebar.items?.map((item: any, i: number) => (
                <div key={i} style={{ padding:'12px 14px', borderRadius:12, background:THEME.sidebarItemBg, border:`1px solid ${THEME.sidebarItemBdr}`, marginBottom:8, animation:`fadeInUp 0.25s ${i*30}ms both`, backdropFilter:'blur(4px)' }}>
                  <SidebarItemDetail item={item} color={actDomObj?.color||'#22c55e'} isDark={isDark} THEME={THEME} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin          { to { transform: rotate(360deg) } }
        @keyframes ring          { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.03)} }
        @keyframes haloBreath    { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
        @keyframes domainGlow    { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes statusPing    { 0%{opacity:0.9;transform:scale(1)} 100%{opacity:0;transform:scale(2.8)} }
        @keyframes fadeIn        { from{opacity:0} to{opacity:1} }
        @keyframes fadeInUp      { from{opacity:0;transform:translateY(14px) scale(0.8)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes slideInRight  { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes dashFlow      { from{stroke-dashoffset:100} to{stroke-dashoffset:0} }
        @keyframes rippleWave    { 0%{r:0;opacity:0.9;stroke-width:3} 100%{r:90;opacity:0;stroke-width:0.5} }
        @keyframes float         { 0%,100%{transform:translateY(0) scale(1);opacity:0.15} 50%{transform:translateY(-20px) scale(1.1);opacity:0.35} }
        @keyframes ambientDrift  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,30px) scale(0.96)} }
        @keyframes nebulaDrift   { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(25px,-18px) scale(1.04)} 66%{transform:translate(-18px,25px) scale(0.97)} }
        @keyframes streakFade    { 0%,100%{opacity:0;transform:scaleY(0)} 50%{opacity:0.4;transform:scaleY(1)} }
        @keyframes twinkle       { 0%,100%{opacity:0.1;transform:scale(0.7)} 50%{opacity:0.9;transform:scale(1.4)} }
        @keyframes arrowLeft     { 0%,100%{transform:translateX(0);opacity:0.5} 50%{transform:translateX(-5px);opacity:1} }
        @keyframes arrowRight    { 0%,100%{transform:translateX(0);opacity:0.5} 50%{transform:translateX(5px);opacity:1} }
        @keyframes idleA { 0%,100%{transform:translateY(0) rotate(0) scale(1)} 15%{transform:translateY(-5px) rotate(-1deg) scale(1.02)} 55%{transform:translateY(-6px) rotate(1.2deg) scale(1.025)} 75%{transform:translateY(-2px) rotate(-0.3deg) scale(1.01)} }
        @keyframes idleB { 0%,100%{transform:translateY(0) rotate(0) scale(1)} 20%{transform:translateY(-6px) rotate(-1.5deg) scale(1.03)} 60%{transform:translateY(-5px) rotate(1.4deg) scale(1.025)} }
        @keyframes idleC { 0%,100%{transform:translateY(0) rotate(0) scale(1)} 10%{transform:translateY(-7px) rotate(-2deg) scale(1.04)} 45%{transform:translateY(-8px) rotate(2.2deg) scale(1.045)} 70%{transform:translateY(-3px) rotate(-1deg) scale(1.015)} }
        @keyframes idleD { 0%,100%{transform:translateY(0) rotate(0) scale(1)} 40%{transform:translateY(-4px) rotate(0.5deg) scale(1.015)} 65%{transform:translateY(-5px) rotate(-1.2deg) scale(1.022)} }
        @keyframes idleE { 0%,100%{transform:translateY(0) rotate(0) scale(1)} 35%{transform:translateY(-5px) rotate(-1.2deg) scale(1.025)} 70%{transform:translateY(-6px) rotate(1.5deg) scale(1.03)} }
        @keyframes idleF { 0%,100%{transform:translateY(0) rotate(0) scale(1)} 30%{transform:translateY(-4px) rotate(-0.8deg) scale(1.02)} 60%{transform:translateY(-7px) rotate(1.2deg) scale(1.035)} }
        @keyframes idleG { 0%,100%{transform:translateY(0) rotate(0) scale(1)} 12%{transform:translateY(-8px) rotate(-2deg) scale(1.045)} 50%{transform:translateY(-9px) rotate(2.8deg) scale(1.05)} 80%{transform:translateY(-3px) rotate(-1deg) scale(1.015)} }
        @keyframes idleH { 0%,100%{transform:translateY(0) rotate(0) scale(1)} 45%{transform:translateY(-3px) rotate(0.5deg) scale(1.01)} 70%{transform:translateY(-5px) rotate(-0.6deg) scale(1.015)} }
        @keyframes subIdle1 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-4px) scale(1.03)} }
        @keyframes subIdle2 { 0%,100%{transform:translateY(-2px) rotate(0.6deg)} 50%{transform:translateY(2px) rotate(-0.7deg) scale(1.02)} }
        @keyframes subIdle3 { 0%,100%{transform:translateY(0) rotate(-0.9deg)} 42%{transform:translateY(-5px) rotate(0.9deg) scale(1.03)} }
        @keyframes subIdle4 { 0%,100%{transform:translateY(-1px) scale(1.005)} 50%{transform:translateY(-5px) scale(1.025)} }
        @keyframes orbitSpin{to{transform:rotate(360deg)}}
        @keyframes centerPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes dotBounce{0%,100%{transform:translateY(0);opacity:0.4}50%{transform:translateY(-8px);opacity:1}}
      `}</style>
    </div>
  );
}

// ── SIDEBAR : POSOLOGIE ──────────────────────────────────────
function PosologySidebar({ data, color, glow, isDark, THEME }: any) {
  const targets = [
    { k:'dest_ad', label:'Adulte',     icon:'👤', color:'#3b82f6', bg:isDark?'rgba(59,130,246,0.08)':'#eff6ff', bd:isDark?'rgba(59,130,246,0.2)':'#bfdbfe' },
    { k:'dest_ge', label:'Sujet âgé',  icon:'👴', color:'#a855f7', bg:isDark?'rgba(168,85,247,0.08)':'#faf5ff', bd:isDark?'rgba(168,85,247,0.2)':'#e9d5ff' },
    { k:'dest_je', label:'Enfant',     icon:'👧', color:'#06b6d4', bg:isDark?'rgba(6,182,212,0.08)':'#ecfeff',  bd:isDark?'rgba(6,182,212,0.2)':'#a5f3fc' },
    { k:'dest_no', label:'Nouveau-né', icon:'👶', color:'#f59e0b', bg:isDark?'rgba(245,158,11,0.08)':'#fffbeb', bd:isDark?'rgba(245,158,11,0.2)':'#fde68a' },
  ];
  if (!data.length) return (
    <div style={{ textAlign:'center', padding:'40px 20px' }}>
      <div style={{ width:60, height:60, borderRadius:'50%', background:isDark?'rgba(99,102,241,0.1)':'rgba(16,185,129,0.08)', border:`1px solid ${isDark?'rgba(99,102,241,0.2)':'rgba(16,185,129,0.15)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 12px' }}>💊</div>
      <p style={{ fontSize:13, color:THEME.textMuted }}>Aucune posologie disponible</p>
    </div>
  );
  return (
    <div>
      {targets.map(t => {
        const items = data.filter((p: any) => p[t.k]);
        if (!items.length) return null;
        return (
          <div key={t.k} style={{ marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:t.bg, border:`1px solid ${t.bd}`, marginBottom:8 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:isDark?'rgba(255,255,255,0.06)':'white', border:`1px solid ${t.bd}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:`0 2px 8px ${t.color}25` }}>{t.icon}</div>
              <h4 style={{ fontSize:14, fontWeight:800, color:t.color, margin:0, flex:1 }}>{t.label}</h4>
              <span style={{ fontSize:11, padding:'2px 9px', borderRadius:99, background:isDark?'rgba(255,255,255,0.06)':'white', color:t.color, border:`1px solid ${t.bd}`, fontWeight:700 }}>{items.length}</span>
            </div>
            {items.map((p: any, i: number) => (
              <div key={i} style={{ background:isDark?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.7)', borderRadius:12, padding:'14px', border:`1px solid ${t.bd}60`, marginBottom:8, animation:`fadeInUp 0.25s ${i*40}ms both`, backdropFilter:'blur(4px)' }}>
                {p.posoFixe ? (
                  <p style={{ fontSize:12, color:THEME.textSecond, margin:0, lineHeight:1.8 }}>{p.posoFixe}</p>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                    {[
                      { label:'DOSE',      value:p.dosage  ? `${p.dosage} ${p.uniDos||p.unitAbbr||''}`.trim() : null },
                      { label:'MOYENNE',   value:p.posoMoy ? `${p.posoMoy} ${p.unitAbbr||p.uniDos||''}`.trim() : null },
                      { label:'MAXIMUM',   value:p.posoMax ? `${p.posoMax} ${p.unitAbbr||p.uniDos||''}`.trim() : null },
                      { label:'FRÉQUENCE', value:p.freqAd  ? `${p.freqAd}x/${p.freqType||'j'}` : null },
                      { label:'DURÉE',     value:p.durAd   ? `${p.durAd} ${p.durType||'j'}` : null },
                      { label:'ÂGE',       value:p.ageMin!=null&&p.ageMax!=null ? `${p.ageMin}–${p.ageMax} ans` : null },
                    ].filter(f => f.value).map((f, fi) => (
                      <div key={fi} style={{ padding:'8px', borderRadius:8, background:t.bg, border:`1px solid ${t.bd}50` }}>
                        <p style={{ fontSize:8, color:THEME.textMuted, margin:0, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:700 }}>{f.label}</p>
                        <p style={{ fontSize:12, fontWeight:800, color:t.color, margin:'3px 0 0' }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── SIDEBAR : INTERACTIONS ───────────────────────────────────
function DrugInteractionsSidebar({ data, color, isDark, THEME }: any) {
  const SEV_LOCAL: Record<number,{label:string;color:string}> = {
    1:{label:'Précaution',     color:'#22c55e'},
    2:{label:'À surveiller',   color:'#eab308'},
    3:{label:'Déconseillé',    color:'#f97316'},
    4:{label:'Contre-indiqué', color:'#ef4444'},
    5:{label:'Formellement CI',color:'#dc2626'},
  };
  if (!data.length) return (
    <div style={{ textAlign:'center', padding:'40px 20px' }}>
      <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 12px' }}>⚡</div>
      <p style={{ fontSize:13, color:THEME.textMuted }}>Aucune interaction répertoriée</p>
    </div>
  );
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {data.map((inter: any, i: number) => {
        const sev = SEV_LOCAL[inter.severity];
        return (
          <div key={i} style={{ background:THEME.sidebarItemBg, borderRadius:14, padding:'14px 16px', border:`1px solid ${sev ? sev.color+'30' : THEME.sidebarItemBdr}`, animation:`fadeInUp 0.25s ${i*35}ms both`, backdropFilter:'blur(4px)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, flexWrap:'wrap', gap:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:0 }}>
                {inter.substance1 && <span style={{ fontSize:12, fontWeight:800, color:THEME.textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inter.substance1}</span>}
                {inter.substance1 && inter.substance2 && <span style={{ fontSize:16, color:isDark?'rgba(99,102,241,0.5)':'rgba(16,185,129,0.4)', flexShrink:0 }}>↔</span>}
                {inter.substance2 && <span style={{ fontSize:12, fontWeight:800, color:THEME.textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inter.substance2}</span>}
              </div>
              {sev && <span style={{ fontSize:10, padding:'3px 10px', borderRadius:99, background:`${sev.color}15`, color:sev.color, border:`1px solid ${sev.color}30`, fontWeight:700, flexShrink:0 }}>{sev.label}</span>}
            </div>
            {inter.riskComment && (
              <div style={{ padding:'8px 12px', borderRadius:8, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', marginBottom:6 }}>
                <p style={{ fontSize:10, fontWeight:700, color:'#f59e0b', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.05em' }}>⚠️ Risque</p>
                <p style={{ fontSize:11, color:THEME.textSecond, margin:0, lineHeight:1.6 }}>{inter.riskComment}</p>
              </div>
            )}
            {inter.precautionComment && (
              <div style={{ padding:'8px 12px', borderRadius:8, background:isDark?'rgba(16,185,129,0.06)':'rgba(16,185,129,0.05)', border:isDark?'1px solid rgba(16,185,129,0.15)':'1px solid rgba(16,185,129,0.15)' }}>
                <p style={{ fontSize:10, fontWeight:700, color:'#22c55e', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.05em' }}>🛡️ Précaution</p>
                <p style={{ fontSize:11, color:THEME.textSecond, margin:0, lineHeight:1.6 }}>{inter.precautionComment}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── SIDEBAR : ATC ────────────────────────────────────────────
function ATCSidebar({ data, isDark, THEME }: any) {
  const items = Array.isArray(data) ? data : (data ? [data] : []);
  if (!items.length) return (
    <div style={{ textAlign:'center', padding:'40px 20px' }}>
      <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 12px' }}>🔬</div>
      <p style={{ fontSize:13, color:THEME.textMuted }}>Aucune classification ATC</p>
    </div>
  );
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {items.map((atc: any, i: number) => (
        <div key={i} style={{ background:THEME.sidebarItemBg, borderRadius:14, padding:'14px 16px', border:isDark?'1px solid rgba(168,85,247,0.2)':'1px solid rgba(168,85,247,0.15)', display:'flex', alignItems:'center', gap:14, animation:`fadeInUp 0.25s ${i*35}ms both` }}>
          <div style={{ width:56, height:56, borderRadius:14, background:'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(168,85,247,0.25))', border:'1.5px solid rgba(168,85,247,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(168,85,247,0.2)' }}>
            <span style={{ fontSize:11, fontWeight:800, color:'#a855f7', fontFamily:'monospace', textAlign:'center', lineHeight:1.3 }}>{atc.code?.substring(0,7) || '—'}</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:700, color:THEME.textPrimary, margin:0, lineHeight:1.3 }}>{atc.name || '—'}</p>
            <p style={{ fontSize:11, color:'#a855f7', margin:'4px 0 0', fontFamily:'monospace', fontWeight:700 }}>{atc.code}</p>
            {atc.parentId && <p style={{ fontSize:10, color:THEME.textMuted, margin:'2px 0 0' }}>Classe parente : {atc.parentId}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── SIDEBAR : DÉTAIL GÉNÉRIQUE ───────────────────────────────
function SidebarItemDetail({ item, color, isDark, THEME }: any) {
  if (!item) return null;
  const fields = [
    { k:'moleculeName',      label:'Molécule',    icon:'🧪', c:'#10b981' },
    { k:'name',              label:'Nom',          icon:'📌', c:color },
    { k:'code',              label:'Code',         icon:'🔑', c:'#a855f7' },
    { k:'shortName',         label:'Abréviation',  icon:'🏷️', c:THEME.textMuted },
    { k:'description',       label:'Description',  icon:'📝', c:THEME.textSecond },
    { k:'comment',           label:'Commentaire',  icon:'💬', c:THEME.textSecond },
    { k:'riskComment',       label:'Risque',       icon:'⚠️', c:'#f59e0b' },
    { k:'precautionComment', label:'Précaution',   icon:'🛡️', c:'#3b82f6' },
    { k:'perVolume',         label:'Dosage',       icon:'⚗️', c:'#06b6d4' },
    { k:'cip',               label:'CIP',          icon:'🔢', c:THEME.textMuted },
    { k:'cip13',             label:'CIP13',        icon:'🔢', c:THEME.textMuted },
  ].filter(f => item[f.k] !== undefined && item[f.k] !== null && item[f.k] !== '');

  if (!fields.length) return <p style={{ fontSize:12, color:THEME.textMuted, margin:0, padding:4 }}>{String(item).substring(0,120)}</p>;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {fields.map((f, idx) => (
        <div key={f.k} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:10, background:THEME.sidebarItemBg, border:`1px solid ${THEME.sidebarItemBdr}`, animation:`fadeInUp 0.2s ${idx*30}ms both` }}>
          <div style={{ width:28, height:28, borderRadius:8, background:`${f.c}18`, border:`1px solid ${f.c}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>{f.icon}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:9, color:THEME.textMuted, margin:0, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:700 }}>{f.label}</p>
            <p style={{ fontSize:12, color:THEME.textSecond, margin:'2px 0 0', fontWeight:600, lineHeight:1.5, wordBreak:'break-word' }}>
              {String(item[f.k]).substring(0,200)}{String(item[f.k]).length > 200 ? '…' : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
