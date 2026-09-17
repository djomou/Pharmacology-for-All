'use client';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { MedicamentDropdown } from '@/components/ui/MedicamentDropdown';
import { useThemeStore } from '@/store/theme.store';
import { drugsApi, unwrap } from '@/lib/api';

const TABS=[
  {key:'se',label:'🩺 Effets indésirables',icon:'🩺',bg:'#fee2e2',bdr:'#fca5a5',txt:'#b91c1c',extract:(eco:any)=>eco?.sideEffects||[]},
  {key:'wa',label:'⚠️ Alertes',            icon:'⚠️',bg:'#fef9c3',bdr:'#fde68a',txt:'#92400e',extract:(eco:any)=>eco?.warnings||[]},
  {key:'pr',label:'🛡️ Précautions',        icon:'🛡️',bg:'#dbeafe',bdr:'#bfdbfe',txt:'#1d4ed8',extract:(eco:any)=>eco?.precautions||[]},
];

export default function SecuritePage() {
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
    green:'#22c55e', green800:isDark?'#4ade80':'#166534',
    green100:isDark?'rgba(34,197,94,0.12)':'#dcfce7', green50:isDark?'rgba(34,197,94,0.06)':'#f0fdf4',
    tabBg:(t:typeof TABS[0])=>isDark?`rgba(255,255,255,0.03)`:t.bg,
    tabBdr:(t:typeof TABS[0])=>isDark?'rgba(255,255,255,0.1)':t.bdr,
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
      <Header title="Sécurité & Pharmacovigilance" subtitle="Effets indésirables, alertes et précautions par médicament"/>
      <div style={{padding:'24px',width:'100%'}}>
        <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>changeTab(t)}
              style={{padding:'10px 18px',borderRadius:12,border:`1.5px solid ${tab.key===t.key?t.bdr:G.border2}`,background:tab.key===t.key?G.tabBg(t):G.card,color:tab.key===t.key?t.txt:G.text2,fontWeight:700,fontSize:13,cursor:'pointer'}}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{background:G.card,borderRadius:20,padding:'28px',border:`1px solid ${G.border}`,marginBottom:16,boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <div style={{width:44,height:44,borderRadius:12,background:G.tabBg(tab),border:`1px solid ${G.tabBdr(tab)}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{tab.icon}</div>
            <div>
              <h2 style={{fontSize:18,fontWeight:800,color:G.text,margin:0}}>{tab.label}</h2>
              <p style={{fontSize:13,color:G.text2,margin:'2px 0 0'}}>Choisissez un médicament → {tab.key==='se'?'ses effets indésirables':tab.key==='wa'?'ses alertes':'ses précautions'} s'affichent</p>
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
            <p style={{fontSize:13,color:G.text2,marginTop:6}}>Essayez le nom générique (ex: paracétamol)</p>
          </div>
        ):results.length>0?(
          <div style={{animation:'fadeUp 0.3s ease-out'}}>
            <p style={{fontSize:13,fontWeight:600,color:G.text2,marginBottom:14}}>
              {results.length} {tab.key==='se'?'effet(s) indésirable(s)':tab.key==='wa'?'alerte(s)':'précaution(s)'} pour « {selDrug} »
            </p>
            {tab.key==='se'?(
              <div style={{background:G.card,borderRadius:14,padding:'20px 24px',border:`1px solid ${isDark?'rgba(239,68,68,0.2)':tab.bdr}`}}>
                <p style={{fontSize:12,fontWeight:700,color:tab.txt,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:14}}>🩺 {results.length} effet{results.length>1?'s':''} identifié{results.length>1?'s':''}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {results.map((r:any,i:number)=>(
                    <span key={r.sideEffectId||i}
                      style={{padding:'7px 16px',borderRadius:99,fontSize:12,fontWeight:600,background:isDark?'rgba(239,68,68,0.1)':tab.bg,color:tab.txt,border:`1px solid ${isDark?'rgba(239,68,68,0.2)':tab.bdr}`,animation:`fadeUp 0.2s ${Math.min(i*20,500)}ms both`}}>
                      {tab.icon} {r.name}
                    </span>
                  ))}
                </div>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {results.map((r:any,i:number)=>(
                  <div key={r.warningId||r.precautionId||i}
                    style={{background:G.card,borderRadius:12,padding:'14px 16px',border:`1px solid ${isDark?'rgba(255,255,255,0.08)':tab.bdr}`,display:'flex',alignItems:'flex-start',gap:12,animation:`fadeUp 0.25s ${Math.min(i*30,400)}ms both`}}>
                    <div style={{width:36,height:36,borderRadius:10,background:isDark?'rgba(255,255,255,0.05)':tab.bg,border:`1px solid ${isDark?'rgba(255,255,255,0.1)':tab.bdr}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{tab.icon}</div>
                    <div style={{flex:1}}>
                      <p style={{fontSize:14,fontWeight:700,color:G.text,margin:0}}>{r.name}</p>
                      {(r.comment||r.description)&&<p style={{fontSize:13,color:G.text2,margin:'4px 0 0',lineHeight:1.6}}>{r.comment||r.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ):null}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
