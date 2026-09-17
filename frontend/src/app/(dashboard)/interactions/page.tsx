'use client';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { MedicamentDropdown } from '@/components/ui/MedicamentDropdown';
import { useThemeStore } from '@/store/theme.store';
import { drugsApi, interactionsApi, unwrap } from '@/lib/api';
import toast from 'react-hot-toast';

const SEV: Record<number,{label:string;bg:string;border:string;color:string}> = {
  1:{label:'Précaution',      bg:'#f0fdf4',border:'#86efac',color:'#15803d'},
  2:{label:'À surveiller',    bg:'#fefce8',border:'#fde68a',color:'#a16207'},
  3:{label:'Déconseillé',     bg:'#fff7ed',border:'#fed7aa',color:'#c2410c'},
  4:{label:'Contre-indiqué',  bg:'#fee2e2',border:'#fecaca',color:'#dc2626'},
  5:{label:'Formellement CI', bg:'#fef2f2',border:'#fca5a5',color:'#991b1b'},
};
const EXAMPLES=[
  {mol1:'Paracétamol',mol2:'Ibuprofène',desc:'Antidouleurs courants'},
  {mol1:'Aspirine',mol2:'Warfarine',desc:'Risque hémorragique'},
  {mol1:'Amoxicilline',mol2:'Méthotrexate',desc:'Antibiotique + immunosuppresseur'},
  {mol1:'Metformine',mol2:'Alcool',desc:'Diabète type 2'},
];

export default function InteractionsPage() {
  const { isDark } = useThemeStore();
  const [tab,setTab]=useState<'check'|'ci'|'allergies'>('check');
  const [mol1,setMol1]=useState('');
  const [mol2,setMol2]=useState('');
  const [result,setResult]=useState<any>(null);
  const [checking,setChecking]=useState(false);
  const [selDrug,setSelDrug]=useState('');
  const [listData,setListData]=useState<any[]>([]);
  const [listLoad,setListLoad]=useState(false);
  const [listDone,setListDone]=useState(false);

  const G={
    bg:isDark?'#0b1120':'#f0fdf4', card:isDark?'#111827':'#ffffff',
    card2:isDark?'#1a2332':'#f0fdf4', border:isDark?'rgba(255,255,255,0.07)':'#dcfce7',
    border2:isDark?'rgba(255,255,255,0.12)':'#bbf7d0',
    text:isDark?'#f1f5f9':'#14532d', text2:isDark?'#94a3b8':'#64748b', text3:isDark?'#6b7280':'#94a3b8',
    green:'#22c55e', green800:isDark?'#4ade80':'#166534', green600:isDark?'#22c55e':'#16a34a',
    green100:isDark?'rgba(34,197,94,0.12)':'#dcfce7', green50:isDark?'rgba(34,197,94,0.06)':'#f0fdf4',
  };

  const checkInteractions=async()=>{
    if(!mol1||!mol2){toast.error('Sélectionnez les deux médicaments');return;}
    setChecking(true);setResult(null);
    try{const res:any=await interactionsApi.checkByName(mol1,mol2);setResult(res?.data??res);}
    catch{toast.error('Erreur lors de la vérification');}
    finally{setChecking(false);}
  };

  const loadFromEcosystem=async(drugName:string,drug:any)=>{
    if(!drug?.productId)return;
    setSelDrug(drugName);setListLoad(true);setListDone(false);setListData([]);
    try{
      const res:any=await drugsApi.getEcosystem(drug.productId);
      const eco=unwrap(res);
      setListData(tab==='ci'?eco?.contraindications||[]:eco?.allergies||[]);
    }catch{setListData([]);}
    finally{setListLoad(false);setListDone(true);}
  };

  const resetTab=(t:'check'|'ci'|'allergies')=>{
    setTab(t);setResult(null);setListData([]);setSelDrug('');setListDone(false);
    if(t==='check'){setMol1('');setMol2('');}
  };

  return(
    <div style={{minHeight:'100vh',background:G.bg,transition:'background 0.3s'}}>
      <Header title="Interactions médicamenteuses" subtitle="Vérifiez les risques entre substances actives"/>
      <div style={{padding:'24px',width:'100%'}}>

        <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
          {[{k:'check',l:'⚡ Vérificateur'},{k:'ci',l:'🚫 Contre-indications'},{k:'allergies',l:'🌿 Allergies'}].map(t=>(
            <button key={t.k} onClick={()=>resetTab(t.k as any)}
              style={{padding:'10px 20px',borderRadius:12,fontSize:13,fontWeight:700,border:`1.5px solid ${tab===t.k?'#22c55e':G.border2}`,background:tab===t.k?G.green100:G.card,color:tab===t.k?G.green800:G.text2,cursor:'pointer'}}>
              {t.l}
            </button>
          ))}
        </div>

        {tab==='check'&&(
          <div style={{background:G.card,borderRadius:20,padding:'28px',border:`1px solid ${G.border}`,marginBottom:24,boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
              <div style={{width:44,height:44,borderRadius:12,background:isDark?'rgba(234,179,8,0.12)':'#fef9c3',border:`1px solid ${isDark?'rgba(234,179,8,0.2)':'#fde68a'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>⚠️</div>
              <div>
                <h2 style={{fontSize:18,fontWeight:800,color:G.text,margin:0}}>Vérificateur d'interactions</h2>
                <p style={{fontSize:13,color:G.text2,margin:'2px 0 0'}}>Sélectionnez deux médicaments et vérifiez leurs interactions</p>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:16,alignItems:'flex-end',marginBottom:20}}>
              <MedicamentDropdown label="💊 Médicament 1" value={mol1} onChange={v=>setMol1(v)} placeholder="Rechercher médicament 1..."/>
              <div style={{paddingBottom:14,fontSize:24,color:'#86efac',textAlign:'center'}}>⚡</div>
              <MedicamentDropdown label="💊 Médicament 2" value={mol2} onChange={v=>setMol2(v)} placeholder="Rechercher médicament 2..."/>
            </div>
            {(mol1||mol2)&&(
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:12,background:G.green50,border:`1px solid ${G.border2}`,marginBottom:20}}>
                <span style={{fontSize:14,fontWeight:700,color:mol1?G.text:G.text3}}>{mol1||'Non sélectionné'}</span>
                <span style={{color:'#22c55e',fontWeight:900,fontSize:20}}>↔</span>
                <span style={{fontSize:14,fontWeight:700,color:mol2?G.text:G.text3}}>{mol2||'Non sélectionné'}</span>
              </div>
            )}
            <button onClick={checkInteractions} disabled={checking||!mol1||!mol2}
              style={{padding:'13px 32px',borderRadius:12,background:!mol1||!mol2?G.green50:`linear-gradient(135deg,${G.green800},${G.green600})`,color:!mol1||!mol2?G.green800:'white',fontWeight:700,fontSize:14,border:'none',cursor:!mol1||!mol2?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:8,marginBottom:24}}>
              {checking?<span style={{display:'inline-block',width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>:'🔍'}
              {checking?'Vérification...':'Vérifier les interactions'}
            </button>
            <div style={{fontSize:11,fontWeight:700,color:G.text3,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>💡 Exemples rapides</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:8}}>
              {EXAMPLES.map((ex,i)=>(
                <button key={i} onClick={()=>{setMol1(ex.mol1);setMol2(ex.mol2);setResult(null);}}
                  style={{padding:'10px 12px',borderRadius:10,border:`1px solid ${G.border2}`,background:G.green50,cursor:'pointer',textAlign:'left'}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='#22c55e';(e.currentTarget as HTMLElement).style.background=G.green100;}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=G.border2;(e.currentTarget as HTMLElement).style.background=G.green50;}}>
                  <div style={{fontSize:12,fontWeight:700,color:G.green800}}>{ex.mol1} + {ex.mol2}</div>
                  <div style={{fontSize:11,color:G.text2,marginTop:2}}>{ex.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab==='ci'&&(
          <div style={{background:G.card,borderRadius:20,padding:'28px',border:`1px solid ${G.border}`,marginBottom:20,boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <div style={{width:44,height:44,borderRadius:12,background:isDark?'rgba(239,68,68,0.12)':'#fee2e2',border:`1px solid ${isDark?'rgba(239,68,68,0.2)':'#fecaca'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🚫</div>
              <div><h2 style={{fontSize:18,fontWeight:800,color:G.text,margin:0}}>Contre-indications</h2><p style={{fontSize:13,color:G.text2,margin:'2px 0 0'}}>Sélectionnez un médicament → ses contre-indications s'affichent</p></div>
            </div>
            <MedicamentDropdown label="💊 Choisissez un médicament" value={selDrug} onChange={(name,drug)=>loadFromEcosystem(name,drug)} placeholder="Rechercher parmi 106 000+ médicaments..."/>
          </div>
        )}

        {tab==='allergies'&&(
          <div style={{background:G.card,borderRadius:20,padding:'28px',border:`1px solid ${G.border}`,marginBottom:20,boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <div style={{width:44,height:44,borderRadius:12,background:G.green100,border:`1px solid ${G.border2}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🌿</div>
              <div><h2 style={{fontSize:18,fontWeight:800,color:G.text,margin:0}}>Allergies connues</h2><p style={{fontSize:13,color:G.text2,margin:'2px 0 0'}}>Sélectionnez un médicament → ses allergies s'affichent</p></div>
            </div>
            <MedicamentDropdown label="💊 Choisissez un médicament" value={selDrug} onChange={(name,drug)=>loadFromEcosystem(name,drug)} placeholder="Rechercher parmi 106 000+ médicaments..."/>
          </div>
        )}

        {tab==='check'&&result&&!checking&&(
          <div style={{background:G.card,borderRadius:16,padding:'24px',border:`1px solid ${result.count>0?'#fde68a':G.border2}`,animation:'fadeUp 0.3s ease-out'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
              <h3 style={{fontSize:16,fontWeight:700,color:G.text,margin:0}}>{mol1} <span style={{color:'#22c55e'}}>↔</span> {mol2}</h3>
              <span style={{padding:'5px 14px',borderRadius:99,fontSize:12,fontWeight:700,background:result.count>0?'#fef9c3':G.green100,color:result.count>0?'#92400e':G.green800}}>
                {result.count||0} interaction{(result.count||0)!==1?'s':''} trouvée{(result.count||0)!==1?'s':''}
              </span>
            </div>
            {result.info&&<div style={{padding:'12px',borderRadius:12,marginBottom:16,background:'#fef9c3',border:'1px solid #fde68a',fontSize:13,color:'#92400e'}}>ℹ️ {result.info}</div>}
            {(result.count||0)===0?(
              <div style={{textAlign:'center',padding:'28px',background:G.green50,borderRadius:12}}>
                <div style={{fontSize:40,marginBottom:10}}>✅</div>
                <div style={{fontWeight:700,color:'#22c55e',fontSize:15}}>Aucune interaction connue</div>
                <div style={{fontSize:12,color:G.text2,marginTop:8}}>⚠️ Consultez toujours un professionnel de santé.</div>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {result.interactions?.map((inter:any,i:number)=>{
                  const sev=SEV[inter.severity]||SEV[2];
                  return(
                    <div key={i} style={{padding:'14px',borderRadius:12,background:isDark?'rgba(234,179,8,0.06)':sev.bg,border:`1px solid ${isDark?'rgba(234,179,8,0.15)':sev.border}`}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                        <span>⚠️</span>
                        <span style={{fontSize:13,fontWeight:700,color:G.text}}>{inter.class1Name&&inter.class2Name?`${inter.class1Name} ↔ ${inter.class2Name}`:`Interaction #${inter.interactionId}`}</span>
                        {inter.severityLabel&&<span style={{padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700,background:isDark?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.5)',color:sev.color,border:`1px solid ${sev.border}`}}>{inter.severityLabel}</span>}
                      </div>
                      {inter.riskComment&&<p style={{fontSize:13,color:G.text2,margin:'0 0 4px',lineHeight:1.6}}><strong style={{color:'#f59e0b'}}>Risque :</strong> {inter.riskComment}</p>}
                      {inter.precautionComment&&<p style={{fontSize:13,color:G.text2,margin:0,lineHeight:1.6}}><strong style={{color:'#22c55e'}}>Précaution :</strong> {inter.precautionComment}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(tab==='ci'||tab==='allergies')&&selDrug&&(
          <>
            {listLoad?(
              <div style={{textAlign:'center',padding:'48px'}}>
                <span style={{display:'inline-block',width:36,height:36,border:`3px solid ${G.border2}`,borderTopColor:'#22c55e',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
                <p style={{color:G.text2,marginTop:12}}>Chargement pour « {selDrug} »...</p>
              </div>
            ):listDone&&listData.length===0?(
              <div style={{textAlign:'center',padding:'48px',background:G.card,borderRadius:16,border:`1px solid ${G.border}`}}>
                <div style={{fontSize:40,marginBottom:12}}>{tab==='ci'?'🚫':'🌿'}</div>
                <p style={{fontWeight:700,color:G.text}}>Aucun{tab==='ci'?'e contre-indication':'e allergie'} répertorié{tab==='ci'?'e':''}</p>
                <p style={{fontSize:13,color:G.text2,marginTop:6}}>pour « {selDrug} »</p>
              </div>
            ):listData.length>0?(
              <div style={{background:G.card,borderRadius:16,padding:'20px',border:`1px solid ${G.border}`,animation:'fadeUp 0.3s ease-out'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <h3 style={{fontSize:15,fontWeight:800,color:G.text,margin:0}}>{tab==='ci'?'🚫 Contre-indications':'🌿 Allergies'} — {selDrug}</h3>
                  <span style={{padding:'3px 12px',borderRadius:99,fontSize:12,fontWeight:700,background:G.green100,color:G.green800}}>{listData.length} résultat{listData.length>1?'s':''}</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {listData.map((item:any,i:number)=>(
                    <div key={item.contraIndicationId||item.allergyId||i}
                      style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 14px',borderRadius:12,background:tab==='ci'?isDark?'rgba(239,68,68,0.06)':'#fff5f5':G.green50,border:`1px solid ${tab==='ci'?isDark?'rgba(239,68,68,0.15)':'#fecaca':G.border}`,animation:`fadeUp 0.25s ${Math.min(i*30,400)}ms both`}}>
                      <div style={{width:32,height:32,borderRadius:9,background:tab==='ci'?isDark?'rgba(239,68,68,0.12)':'#fee2e2':G.green100,border:`1px solid ${tab==='ci'?isDark?'rgba(239,68,68,0.2)':'#fecaca':G.border2}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0,marginTop:1}}>
                        {tab==='ci'?'🚫':'🌿'}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:600,color:G.text}}>{item.name}</div>
                        {item.comment&&<div style={{fontSize:12,color:G.text2,marginTop:4,lineHeight:1.5}}>{item.comment}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ):null}
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
