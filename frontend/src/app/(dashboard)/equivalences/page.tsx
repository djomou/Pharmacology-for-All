'use client';
import { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/theme.store';

const FLAG_MAP: Record<string,string> = {
  FR:'🇫🇷',DE:'🇩🇪',GB:'🇬🇧',US:'🇺🇸',ES:'🇪🇸',IT:'🇮🇹',BE:'🇧🇪',CH:'🇨🇭',PT:'🇵🇹',NL:'🇳🇱',AU:'🇦🇺',CA:'🇨🇦',JP:'🇯🇵',CN:'🇨🇳',BR:'🇧🇷',IN:'🇮🇳',MA:'🇲🇦',DZ:'🇩🇿',TN:'🇹🇳',SA:'🇸🇦',AR:'🇦🇷',KR:'🇰🇷',GR:'🇬🇷',AT:'🇦🇹',HR:'🇭🇷',DK:'🇩🇰',EG:'🇪🇬',AE:'🇦🇪',EC:'🇪🇨',FI:'🇫🇮',HU:'🇭🇺',CY:'🇨🇾',CO:'🇨🇴',BO:'🇧🇴',CL:'🇨🇱',CR:'🇨🇷',BG:'🇧🇬',LT:'🇱🇹',IE:'🇮🇪',IR:'🇮🇷',IS:'🇮🇸',
};
const EXAMPLES = [
  {label:'Doliprane',sub:'Paracétamol'},{label:'Advil',sub:'Ibuprofène'},{label:'Augmentin',sub:'Amoxicilline + clavulanique'},{label:'Metformine',sub:'Antidiabétique oral'},{label:'Codoliprane',sub:'Paracétamol + Codéine'},
];
const API_URL = process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000';

export default function EquivalencesPage() {
  const { isDark } = useThemeStore();
  const [query,setQuery]=useState('');
  const [items,setItems]=useState<any[]>([]);
  const [pagination,setPagination]=useState<any>(null);
  const [countries,setCountries]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);
  const [searched,setSearched]=useState(false);
  const [sourceQ,setSourceQ]=useState('');
  const [error,setError]=useState('');

  const G = {
    bg:    isDark?'#0b1120':'#f0fdf4',
    card:  isDark?'#111827':'#ffffff',
    card2: isDark?'#1a2332':'#f0fdf4',
    border:isDark?'rgba(255,255,255,0.07)':'#dcfce7',
    border2:isDark?'rgba(255,255,255,0.12)':'#bbf7d0',
    text:  isDark?'#f1f5f9':'#14532d',
    text2: isDark?'#94a3b8':'#64748b',
    text3: isDark?'#6b7280':'#94a3b8',
    green: '#22c55e',
    green800:isDark?'#4ade80':'#166534',
    green600:isDark?'#22c55e':'#16a34a',
    green100:isDark?'rgba(34,197,94,0.12)':'#dcfce7',
    green50: isDark?'rgba(34,197,94,0.06)':'#f0fdf4',
  };

  useEffect(() => {
    fetch(`${API_URL}/api/international/countries`).then(r=>r.json()).then(d=>{
      let list:any[]=[];
      if(Array.isArray(d)) list=d;
      else if(Array.isArray(d?.data)) list=d.data;
      setCountries(list);
    }).catch(()=>{});
  },[]);

  const search = async (q?: string) => {
    const searchQ=(q!==undefined?q:query).trim();
    if(!searchQ) return;
    if(q!==undefined) setQuery(q);
    setLoading(true); setSearched(true); setItems([]); setError('');
    try {
      const res=await fetch(`${API_URL}/api/international/search?q=${encodeURIComponent(searchQ)}&page=1`);
      if(!res.ok){setError(`Erreur HTTP ${res.status}`);return;}
      const json=await res.json();
      let data:any[]=[],pag:any=null,sq=searchQ;
      if(Array.isArray(json)){data=json;}
      else if(json?.success===true&&json?.data){const inner=json.data;if(Array.isArray(inner)){data=inner;}else if(inner?.data&&Array.isArray(inner.data)){data=inner.data;pag=inner.pagination||null;sq=inner.sourceQuery||searchQ;}}
      else if(json?.data&&Array.isArray(json.data)){data=json.data;pag=json.pagination||null;sq=json.sourceQuery||searchQ;}
      else{const arrays=Object.values(json).filter(v=>Array.isArray(v));if(arrays.length>0)data=arrays[0] as any[];}
      setItems(data);setPagination(pag);setSourceQ(sq);
    } catch(err:any){setError('Erreur : '+(err?.message||'inconnue'));setItems([]);}
    finally{setLoading(false);}
  };

  const byCountry:Record<string,any[]>=items.reduce((acc,fp)=>{const cc=fp.countryCode||fp.code||'??';if(!acc[cc])acc[cc]=[];acc[cc].push(fp);return acc;},{});
  const countryKeys=Object.keys(byCountry).sort();

  return (
    <div style={{ minHeight:'100vh', background:G.bg, padding:'28px 36px', transition:'background 0.3s' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:900, color:G.text, margin:0 }}>🌍 Équivalences Internationales</h1>
        <p style={{ color:G.text2, fontSize:14, margin:'4px 0 0' }}>{countries.length>0?`${countries.length} pays couverts dans notre base`:'Base internationale'}</p>
      </div>

      <div style={{ background:G.card, borderRadius:20, padding:'24px 28px', border:`1px solid ${G.border}`, marginBottom:24, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize:13, color:G.text2, margin:'0 0 14px' }}>Entrez le nom commercial ou la DCI (substance active)</p>
        <div style={{ display:'flex', gap:12, marginBottom:16 }}>
          <div style={{ flex:1, position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:18 }}>💊</span>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}
              placeholder="Doliprane, Ibuprofène, Amoxicilline..."
              style={{ width:'100%', padding:'13px 14px 13px 44px', borderRadius:12, border:`1.5px solid ${G.border2}`, background:isDark?'#1a2332':G.card, fontSize:14, color:G.text, outline:'none', boxSizing:'border-box' }}
              onFocus={e=>e.target.style.borderColor='#22c55e'} onBlur={e=>e.target.style.borderColor=G.border2}
            />
          </div>
          <button onClick={()=>search()} disabled={loading||!query.trim()}
            style={{ padding:'13px 28px', borderRadius:12, background:!query.trim()?G.green50:`linear-gradient(135deg,${G.green800},${G.green600})`, color:!query.trim()?G.green800:'white', fontWeight:700, fontSize:14, border:'none', cursor:!query.trim()?'default':'pointer', display:'flex', alignItems:'center', gap:8 }}>
            {loading?<span style={{ display:'inline-block',width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>:'🌍'} Rechercher
          </button>
        </div>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:G.text3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>💡 ESSAYEZ DIRECTEMENT</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {EXAMPLES.map((ex,i)=>(
              <button key={i} onClick={()=>search(ex.label)}
                style={{ padding:'7px 14px', borderRadius:99, border:`1px solid ${G.border2}`, background:G.green50, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=G.green100;(e.currentTarget as HTMLElement).style.borderColor='#22c55e';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=G.green50;(e.currentTarget as HTMLElement).style.borderColor=G.border2;}}>
                <span style={{ fontSize:14 }}>💊</span>
                <span style={{ fontSize:13, fontWeight:700, color:G.green800 }}>{ex.label}</span>
                <span style={{ fontSize:11, color:G.text3 }}>({ex.sub})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error&&<div style={{ background:'#fee2e2', borderRadius:12, padding:'12px 20px', marginBottom:16, border:'1px solid #fca5a5', color:'#b91c1c', fontSize:13, fontWeight:600 }}>⚠️ {error}</div>}

      {!searched&&countries.length>0&&(
        <div style={{ background:G.card, borderRadius:20, padding:'20px 28px', border:`1px solid ${G.border}`, marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:G.text3, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>📍 PAYS DISPONIBLES</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {countries.map((c:any)=>(
              <span key={c.countryId} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:99, background:G.green50, border:`1px solid ${G.border}`, fontSize:12, color:G.green800, fontWeight:600 }}>
                {FLAG_MAP[c.code]||'🌐'} {c.code}
              </span>
            ))}
          </div>
        </div>
      )}

      {loading&&(
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'60px 0', gap:16 }}>
          <span style={{ display:'inline-block', width:40, height:40, border:`3px solid ${G.border2}`, borderTopColor:'#22c55e', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
          <p style={{ color:G.text2, fontSize:14 }}>Recherche dans {countries.length||'58'} pays...</p>
        </div>
      )}

      {!loading&&searched&&(
        items.length===0?(
          <div style={{ background:G.card, borderRadius:20, padding:'48px', textAlign:'center', border:`1px solid ${G.border}` }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🌍</div>
            <p style={{ fontSize:16, fontWeight:700, color:G.text, marginBottom:6 }}>Aucun équivalent trouvé</p>
            <p style={{ color:G.text2, fontSize:14 }}>Essayez le nom générique (DCI) ou vérifiez l'orthographe</p>
          </div>
        ):(
          <div style={{ animation:'fadeUp 0.3s ease-out both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <p style={{ fontSize:15, fontWeight:700, color:G.text, margin:0 }}>
                {pagination?.total||items.length} équivalent{(pagination?.total||items.length)>1?'s':''} trouvé{(pagination?.total||items.length)>1?'s':''}
                {sourceQ&&<span style={{ color:G.text2, fontWeight:400 }}> pour « {sourceQ} »</span>}
              </p>
              <span style={{ padding:'4px 12px', borderRadius:99, background:G.green100, color:G.green800, fontSize:12, fontWeight:700 }}>{countryKeys.length} pays</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {countryKeys.map(cc=>(
                <div key={cc} style={{ background:G.card, borderRadius:16, border:`1px solid ${G.border}`, overflow:'hidden' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 20px', background:G.green50, borderBottom:`1px solid ${G.border}` }}>
                    <span style={{ fontSize:22 }}>{FLAG_MAP[cc]||'🌐'}</span>
                    <span style={{ fontWeight:800, color:G.text, fontSize:14 }}>{cc}</span>
                    {byCountry[cc][0]?.countryName&&<span style={{ color:G.text2, fontSize:13 }}>— {byCountry[cc][0].countryName}</span>}
                    <span style={{ marginLeft:'auto', padding:'2px 10px', borderRadius:99, background:G.green100, color:G.green800, fontSize:11, fontWeight:700 }}>{byCountry[cc].length} produit{byCountry[cc].length>1?'s':''}</span>
                  </div>
                  <div>
                    {byCountry[cc].map((fp:any,i:number)=>(
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 20px', borderBottom:i<byCountry[cc].length-1?`1px solid ${G.card2}`:' none', transition:'background 0.15s' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=G.green50}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=G.card}>
                        <div style={{ width:32, height:32, borderRadius:8, background:G.green50, border:`1px solid ${G.border2}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>💊</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:14, fontWeight:600, color:G.text, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fp.name}</p>
                          {fp.localName&&fp.localName!==fp.name&&<p style={{ fontSize:12, color:G.text2, margin:'1px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fp.localName}</p>}
                          {fp.companyName&&<p style={{ fontSize:11, color:G.text3, margin:'1px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>🏭 {fp.companyName}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {pagination&&pagination.totalPages>1&&<p style={{ textAlign:'center', color:G.text3, fontSize:12, marginTop:16 }}>Page {pagination.page}/{pagination.totalPages} — {pagination.total} résultats</p>}
          </div>
        )
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
