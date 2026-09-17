'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { useRouter } from 'next/navigation';
import { drugsApi } from '@/lib/api';
import { usePersistedForm } from '@/hooks/usePersistedForm';

const STATUS: Record<number,{label:string;bg:string;color:string}> = {
  1:{label:'Commercialisé',  bg:'#dcfce7',color:'#166534'},
  0:{label:'Non commercialisé',bg:'#fef9c3',color:'#92400e'},
  2:{label:'Suspendu',       bg:'#fef9c3',color:'#92400e'},
  5:{label:'Retiré',         bg:'#fee2e2',color:'#b91c1c'},
};

function extractData(res: any) {
  const level1 = res?.data ?? res;
  if (Array.isArray(level1)) return { items:level1, total:level1.length };
  const level2 = level1?.data;
  if (Array.isArray(level2)) return { items:level2, total:Number(level1?.pagination?.total??level2.length)||0 };
  return { items:[], total:0 };
}

export default function MedicamentsPage() {
  const { token }   = useAuthStore();
  const { isDark }  = useThemeStore();
  const router      = useRouter();

  // ★ États persistés — survivent aux navigations (30 min, sessionStorage)
  const [query,    setQuery]    = usePersistedForm('med:query',    '');
  const [drugs,    setDrugs]    = usePersistedForm<any[]>('med:drugs',    []);
  const [total,    setTotal]    = usePersistedForm('med:total',    0);
  const [page,     setPage]     = usePersistedForm('med:page',     1);
  const [searched, setSearched] = usePersistedForm('med:searched', false);
  // loading reste local (état transitoire)
  const [loading,  setLoading]  = useState(false);
  const limit = 20;

  const G = {
    bg:     isDark?'#0b1120':'#f0fdf4',
    card:   isDark?'#111827':'#ffffff',
    border: isDark?'rgba(255,255,255,0.07)':'#dcfce7',
    border2:isDark?'rgba(255,255,255,0.12)':'#bbf7d0',
    text:   isDark?'#f1f5f9':'#14532d',
    text2:  isDark?'#94a3b8':'#64748b',
    green50:isDark?'rgba(34,197,94,0.06)':'#f0fdf4',
    green100:isDark?'rgba(34,197,94,0.12)':'#dcfce7',
    green800:isDark?'#4ade80':'#166534',
    green600:isDark?'#22c55e':'#16a34a',
  };

  const search = async (q: string, p = 1) => {
    if (!q.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const res: any = await drugsApi.search(q, p, limit, token||undefined);
      const { items, total: tot } = extractData(res);
      setDrugs(items); setTotal(tot); setPage(p);
    } catch { setDrugs([]); setTotal(0); }
    finally { setLoading(false); }
  };

  const totalPages = total > 0 ? Math.ceil(total/limit) : 0;

  return (
    <div style={{ minHeight:'100vh', background:G.bg, padding:'28px 36px', transition:'background 0.3s' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:G.text, margin:0 }}>💊 Médicaments</h1>
        <p style={{ color:G.text2, fontSize:14, margin:'4px 0 0' }}>
          {searched ? `${total.toLocaleString('fr-FR')} résultat${total>1?'s':''}` : 'Base de 106 000+ médicaments référencés'}
        </p>
      </div>

      <div style={{ background:G.card, borderRadius:20, padding:'24px 28px', border:`1px solid ${G.border}`, marginBottom:24, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display:'flex', gap:12 }}>
          <div style={{ flex:1, position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:18 }}>🔍</span>
            <input type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key==='Enter' && search(query,1)}
              placeholder="Doliprane, paracétamol, ibuprofène, Advil..."
              style={{ width:'100%', padding:'13px 14px 13px 44px', borderRadius:12, border:`1.5px solid ${G.border2}`, background:isDark?'#1a2332':G.card, fontSize:14, color:G.text, outline:'none', boxSizing:'border-box' }}
              onFocus={e => e.target.style.borderColor='#22c55e'}
              onBlur={e  => e.target.style.borderColor=G.border2}
            />
          </div>
          <button onClick={() => search(query,1)} disabled={loading||!query.trim()}
            style={{ padding:'13px 28px', borderRadius:12, background:!query.trim()?G.green50:`linear-gradient(135deg,${G.green800},${G.green600})`, color:!query.trim()?G.green800:'white', fontWeight:700, fontSize:14, border:'none', cursor:!query.trim()?'default':'pointer', display:'flex', alignItems:'center', gap:8 }}>
            {loading ? <span style={{ display:'inline-block',width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/> : '🔍'} Rechercher
          </button>
        </div>
        <div style={{ marginTop:14, display:'flex', flexWrap:'wrap', gap:8 }}>
          <span style={{ fontSize:12, color:G.text2, display:'flex', alignItems:'center', marginRight:4 }}>💡 Essayez :</span>
          {['Doliprane','Ibuprofène','Amoxicilline','Metformine','Paracétamol','Aspirine','Oméprazole'].map(s => (
            <button key={s} onClick={() => { setQuery(s); search(s,1); }}
              style={{ padding:'5px 14px', borderRadius:99, border:`1px solid ${G.border2}`, background:G.green50, color:G.green800, fontSize:12, fontWeight:600, cursor:'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background=G.green100; (e.currentTarget as HTMLElement).style.borderColor='#22c55e'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background=G.green50; (e.currentTarget as HTMLElement).style.borderColor=G.border2; }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'60px 0', gap:16 }}>
          <span style={{ display:'inline-block', width:40, height:40, border:`3px solid ${G.border2}`, borderTopColor:'#22c55e', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
          <p style={{ color:G.text2 }}>Recherche en cours...</p>
        </div>
      ) : searched && drugs.length===0 ? (
        <div style={{ background:G.card, borderRadius:20, padding:'48px', textAlign:'center', border:`1px solid ${G.border}` }}>
          <div style={{ fontSize:48, marginBottom:12 }}>💊</div>
          <p style={{ fontSize:16, fontWeight:700, color:G.text }}>Aucun médicament trouvé pour "{query}"</p>
          <p style={{ color:G.text2, fontSize:14, marginTop:6 }}>Essayez le nom générique ou vérifiez l'orthographe</p>
        </div>
      ) : drugs.length>0 ? (
        <>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {drugs.map((drug:any, i:number) => {
              const st = STATUS[drug.marketStatus]??{label:'Inconnu',bg:G.green50,color:G.text2};
              return (
                <div key={drug.productId??i}
                  onClick={() => router.push(`/medicaments/${drug.productId}`)}
                  style={{ background:G.card, borderRadius:14, padding:'14px 20px', border:`1px solid ${G.border}`, display:'flex', alignItems:'center', gap:16, cursor:'pointer', transition:'all 0.15s', animation:`fadeUp 0.3s ease-out ${Math.min(i*30,300)}ms both` }}
                  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='#22c55e'; el.style.boxShadow='0 4px 16px rgba(34,197,94,0.12)'; el.style.transform='translateY(-1px)'; }}
                  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor=G.border; el.style.boxShadow='none'; el.style.transform='none'; }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:G.green50, border:`1.5px solid ${G.border2}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>💊</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:15, fontWeight:700, color:G.text, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{drug.name}</p>
                    {drug.shortName && <p style={{ fontSize:12, color:G.text2, margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{drug.shortName}</p>}
                    {drug.commercialName && drug.commercialName!==drug.name && <p style={{ fontSize:11, color:G.text2, margin:'1px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{drug.commercialName}</p>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                    <span style={{ padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:st.bg, color:st.color }}>{st.label}</span>
                    <span style={{ fontSize:11, color:G.text2 }}>#{drug.productId}</span>
                    <span style={{ fontSize:16, color:'#22c55e' }}>→</span>
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages>1 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:24 }}>
              <button onClick={() => search(query,page-1)} disabled={page<=1}
                style={{ width:36,height:36,borderRadius:10,border:`1.5px solid ${G.border2}`,background:G.card,color:G.text,fontWeight:700,cursor:page<=1?'default':'pointer',opacity:page<=1?0.4:1,fontSize:16 }}>‹</button>
              {Array.from({length:Math.min(5,totalPages)},(_,i) => {
                const p = Math.max(1,Math.min(page-2,totalPages-4))+i;
                if (p<1||p>totalPages) return null;
                return <button key={p} onClick={() => search(query,p)}
                  style={{ width:36,height:36,borderRadius:10,border:`1.5px solid ${p===page?'#22c55e':G.border2}`,background:p===page?'#166534':G.card,color:p===page?'white':G.text,fontWeight:700,cursor:'pointer',fontSize:14 }}>{p}</button>;
              })}
              <button onClick={() => search(query,page+1)} disabled={page>=totalPages}
                style={{ width:36,height:36,borderRadius:10,border:`1.5px solid ${G.border2}`,background:G.card,color:G.text,fontWeight:700,cursor:page>=totalPages?'default':'pointer',opacity:page>=totalPages?0.4:1,fontSize:16 }}>›</button>
              <span style={{ fontSize:12, color:G.text2, marginLeft:8 }}>Page {page}/{totalPages} — {total.toLocaleString('fr-FR')} résultats</span>
            </div>
          )}
        </>
      ) : !searched ? (
        <div style={{ background:G.card, borderRadius:20, padding:'64px 48px', textAlign:'center', border:`1px solid ${G.border}` }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
          <p style={{ fontSize:18, fontWeight:800, color:G.text, marginBottom:8 }}>Recherchez un médicament</p>
          <p style={{ color:G.text2, fontSize:14 }}>Plus de 106 000 médicaments référencés</p>
        </div>
      ) : null}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
