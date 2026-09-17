'use client';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { MedicamentDropdown } from '@/components/ui/MedicamentDropdown';
import { useThemeStore } from '@/store/theme.store';
import { drugsApi, unwrap } from '@/lib/api';

const TABS=[
  {key:'indications',label:'📋 Indications',icon:'📋',iconBg:'#dbeafe',iconBdr:'#bfdbfe',desc:'Indications médicales',extract:(eco:any)=>eco?.indications||[]},
  {key:'cim10',      label:'🏥 CIM-10',     icon:'🏥',iconBg:'#fce7f3',iconBdr:'#fbcfe8',desc:'Codes CIM-10',        extract:(eco:any)=>eco?.cim10||[]},
  {key:'atc',        label:'🔬 ATC',         icon:'🔬',iconBg:'#f3e8ff',iconBdr:'#e9d5ff',desc:'Classes ATC',         extract:(eco:any)=>{const a=eco?.atcClass;if(!a)return[];return Array.isArray(a)?a:[a];}},
];

export default function IndicationsPage() {
  const { isDark }=useThemeStore();
  const [tab,setTab]=useState(TABS[0]);
  const [selDrug,setSelDrug]=useState('');
  const [results,setRes]=useState<any[]>([]);
  const [loading,setLoad]=useState(false);
  const [done,setDone]=useState(false);

  const G={
    bg:isDark?'#0b1120':'#f0fdf4', card:isDark?'#111827':'#ffffff',
    border:isDark?'rgba(255,255,255,0.07)':'#dcfce7', border2:isDark?'rgba(255,255,255,0.12)':'#bbf7d0',
    text:isDark?'#f1f5f9':'#14532d', text2:isDark?'#94a3b8':'#64748b', text3:isDark?'#6b7280':'#94a3b8',
    green:'#22c55e', green800:isDark?'#4ade80':'#166534', green600:isDark?'#22c55e':'#16a34a',
    green100:isDark?'rgba(34,197,94,0.12)':'#dcfce7', green50:isDark?'rgba(34,197,94,0.06)':'#f0fdf4',
    iconBg:(bg:string)=>isDark?'rgba(255,255,255,0.05)':bg,
    iconBdr:(bd:string)=>isDark?'rgba(255,255,255,0.1)':bd,
  };

  const loadFromEcosystem=async(drugName:string,drug:any)=>{
    if(!drug?.productId)return;
    setSelDrug(drugName);setLoad(true);setDone(false);setRes([]);
    try{const res:any=await drugsApi.getEcosystem(drug.productId);setRes(tab.extract(unwrap(res)));}
    catch{setRes([]);}
    finally{setLoad(false);setDone(true);}
  };

  const changeTab=(t:typeof TABS[0])=>{setTab(t);setRes([]);setSelDrug('');setDone(false);};

  return(
    <div style={{minHeight:'100vh',background:G.bg,transition:'background 0.3s'}}>
      <Header title="Indications & Classifications" subtitle="Indications, CIM-10 et ATC par médicament"/>
      <div style={{padding:'24px',width:'100%'}}>
        <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>changeTab(t)}
              style={{padding:'10px 18px',borderRadius:12,border:`1.5px solid ${tab.key===t.key?'#22c55e':G.border2}`,background:tab.key===t.key?`linear-gradient(135deg,${G.green800},${G.green600})`:G.card,color:tab.key===t.key?'white':G.text2,fontWeight:700,fontSize:13,cursor:'pointer'}}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{background:G.card,borderRadius:20,padding:'28px',border:`1px solid ${G.border}`,marginBottom:16,boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <div style={{width:44,height:44,borderRadius:12,background:G.iconBg(tab.iconBg),border:`1px solid ${G.iconBdr(tab.iconBdr)}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{tab.icon}</div>
            <div>
              <h2 style={{fontSize:18,fontWeight:800,color:G.text,margin:0}}>{tab.label}</h2>
              <p style={{fontSize:13,color:G.text2,margin:'2px 0 0'}}>Sélectionnez un médicament → ses {tab.desc.toLowerCase()} s'affichent</p>
            </div>
          </div>
          <MedicamentDropdown label="💊 Sélectionnez un médicament" value={selDrug} onChange={(name,drug)=>loadFromEcosystem(name,drug)} placeholder="Rechercher parmi 106 000+ médicaments..."/>
          {selDrug&&done&&(
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:10,background:G.green50,border:`1px solid ${G.border2}`,marginTop:12}}>
              <span>💊</span>
              <span style={{fontSize:13,fontWeight:700,color:G.text}}>{selDrug}</span>
              <span style={{marginLeft:'auto',fontSize:12,color:G.text3}}>{results.length} résultat{results.length>1?'s':''}</span>
            </div>
          )}
        </div>

        {loading?(
          <div style={{textAlign:'center',padding:'48px'}}>
            <span style={{display:'inline-block',width:36,height:36,border:`3px solid ${G.border2}`,borderTopColor:'#22c55e',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
            <p style={{color:G.text2,marginTop:12}}>Chargement pour « {selDrug} »...</p>
          </div>
        ):done&&results.length===0?(
          <div style={{textAlign:'center',padding:'48px',background:G.card,borderRadius:16,border:`1px solid ${G.border}`}}>
            <div style={{fontSize:40,marginBottom:12}}>{tab.icon}</div>
            <p style={{fontWeight:700,color:G.text}}>Aucun résultat pour « {selDrug} »</p>
            <p style={{fontSize:13,color:G.text2,marginTop:6}}>Essayez un autre médicament</p>
          </div>
        ):results.length>0?(
          <div style={{display:'flex',flexDirection:'column',gap:8,animation:'fadeUp 0.3s ease-out'}}>
            {results.map((r:any,i:number)=>(
              <div key={r.indicationId||r.cim10Id||r.atcClassId||i}
                style={{background:G.card,borderRadius:12,padding:'14px 16px',border:`1px solid ${G.border}`,display:'flex',alignItems:'center',gap:12,transition:'all 0.15s',animation:`fadeUp 0.25s ${Math.min(i*25,400)}ms both`}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='#22c55e';(e.currentTarget as HTMLElement).style.background=G.green50;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=G.border;(e.currentTarget as HTMLElement).style.background=G.card;}}>
                <div style={{width:36,height:36,borderRadius:10,background:G.iconBg(tab.iconBg),border:`1px solid ${G.iconBdr(tab.iconBdr)}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{tab.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:14,fontWeight:600,color:G.text,margin:0}}>{r.name||r.code||'—'}</p>
                  {r.code&&r.name&&r.code!==r.name&&<p style={{fontSize:11,color:'#7c3aed',fontFamily:'monospace',margin:'3px 0 0',fontWeight:700}}>{r.code}</p>}
                </div>
              </div>
            ))}
          </div>
        ):null}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
