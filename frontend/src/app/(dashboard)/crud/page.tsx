'use client';
import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { unwrap } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import toast from 'react-hot-toast';

const FIELDS = [
  { key:'name',             label:'Nom du médicament',            icon:'💊', required:true,  type:'text',     placeholder:'Ex: DOLIPRANE 1000 mg comprimé', group:'required' },
  { key:'activePrinciples', label:'Principes actifs (DCI)',        icon:'🧬', required:true,  type:'text',     placeholder:'Ex: paracétamol, ibuprofène', group:'required' },
  { key:'shortName',        label:'Nom court / Abréviation',      icon:'🏷️', required:false, type:'text',     placeholder:'Ex: DOLIPRANE 1000mg Cpr', group:'identity' },
  { key:'commercialName',   label:'Nom commercial',               icon:'🏭', required:false, type:'text',     placeholder:'Ex: DOLIPRANE', group:'identity' },
  { key:'posology',         label:'Posologie',                    icon:'💉', required:false, type:'textarea', placeholder:'Ex: 1 comprimé toutes les 6h, max 3g/j', group:'clinical' },
  { key:'indications',      label:'Indications',                  icon:'🏥', required:false, type:'textarea', placeholder:'Ex: Douleurs, fièvre, céphalées', group:'clinical' },
  { key:'contraindications',label:'Contre-indications',           icon:'🚫', required:false, type:'textarea', placeholder:'Ex: Insuffisance hépatique sévère', group:'clinical' },
  { key:'cim10',            label:'Code(s) CIM-10',               icon:'📋', required:false, type:'text',     placeholder:'Ex: R51, M54.5, R50', group:'classification' },
  { key:'atcClassification',label:'Classification ATC',           icon:'🔬', required:false, type:'text',     placeholder:'Ex: N02BE01', group:'classification' },
  { key:'sideEffects',      label:'Effets indésirables',          icon:'🩺', required:false, type:'textarea', placeholder:'Ex: Nausées, éruption cutanée', group:'safety' },
  { key:'interactions',     label:'Interactions médicamenteuses', icon:'⚡', required:false, type:'textarea', placeholder:'Ex: Warfarine (potentialisation)', group:'safety' },
  { key:'foodInteractions', label:'Interactions alimentaires',    icon:'🥗', required:false, type:'textarea', placeholder:'Ex: Jus de pamplemousse', group:'safety' },
  { key:'allergies',        label:'Allergies / Hypersensibilités',icon:'🌿', required:false, type:'textarea', placeholder:'Ex: Hypersensibilité aux pénicillines', group:'safety' },
  { key:'warnings',         label:'Alertes et mises en garde',    icon:'⚠️', required:false, type:'textarea', placeholder:'Ex: Ne pas dépasser 3g/j', group:'safety' },
  { key:'precautions',      label:'Précautions d\'emploi',        icon:'🛡️', required:false, type:'textarea', placeholder:'Ex: Réduire la dose chez le sujet âgé', group:'safety' },
  { key:'excipients',       label:'Excipients à effet notoire',   icon:'⚗️', required:false, type:'textarea', placeholder:'Ex: Saccharose, lactose', group:'composition' },
  { key:'notes',            label:'Notes complémentaires',        icon:'📝', required:false, type:'textarea', placeholder:'Toute information utile supplémentaire', group:'other' },
];

type TabKey = 'add'|'edit'|'delete';
type FormData = Record<string,string>;
const EMPTY_FORM: FormData = Object.fromEntries(FIELDS.map(f=>[f.key,'']));

// ── COMPOSANT PRINCIPAL ─────────────────────────────────────
export default function CrudPage() {
  const { token } = useAuthStore();
  const { isDark } = useThemeStore();
  const [tab, setTab] = useState<TabKey>('add');

  const G = {
    bg:    isDark?'#0b1120':'#f0fdf4',
    card:  isDark?'#111827':'#ffffff',
    border:isDark?'rgba(255,255,255,0.07)':'#dcfce7',
    border2:isDark?'rgba(255,255,255,0.12)':'#bbf7d0',
    text:  isDark?'#f1f5f9':'#14532d',
    text2: isDark?'#94a3b8':'#64748b',
    text3: isDark?'#6b7280':'#94a3b8',
    green800:isDark?'#4ade80':'#166534',
    green700:isDark?'#22c55e':'#15803d',
    green600:isDark?'#22c55e':'#16a34a',
    green100:isDark?'rgba(34,197,94,0.12)':'#dcfce7',
    green50: isDark?'rgba(34,197,94,0.06)':'#f0fdf4',
    green200:isDark?'rgba(34,197,94,0.2)':'#bbf7d0',
    inputBg: isDark?'#1a2332':'#ffffff',
    inputClr:isDark?'#f1f5f9':'#334155',
  };

  const TABS = [
    { key:'add'    as TabKey, label:'Ajouter un médicament',   icon:'➕', color:G.green700,  bg:G.green100,  activeBdr:'#22c55e' },
    { key:'edit'   as TabKey, label:'Modifier un médicament',  icon:'✏️', color:'#2563eb',   bg:isDark?'rgba(37,99,235,0.1)':'#eff6ff',  activeBdr:'#2563eb' },
    { key:'delete' as TabKey, label:'Supprimer un médicament', icon:'🗑️', color:'#dc2626',   bg:isDark?'rgba(220,38,38,0.1)':'#fef2f2',  activeBdr:'#dc2626' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:G.bg, transition:'background 0.3s' }}>
      <Header title="CRUD Médicaments" subtitle="Gérer le catalogue pharmaceutique" />
      <div style={{ padding:'24px 32px', maxWidth:1100 }}>

        {/* Tabs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding:'16px', borderRadius:16, border:`2px solid ${tab===t.key?t.activeBdr:G.border2}`, background:tab===t.key?t.bg:G.card, cursor:'pointer', transition:'all 0.2s', textAlign:'left', boxShadow:tab===t.key?`0 4px 16px ${t.activeBdr}22`:'none' }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{t.icon}</div>
              <p style={{ fontSize:14, fontWeight:800, color:tab===t.key?t.color:G.text2, margin:0 }}>{t.label}</p>
            </button>
          ))}
        </div>

        {tab==='add'    && <AddTab    token={token||''} isDark={isDark} G={G}/>}
        {tab==='edit'   && <EditTab   token={token||''} isDark={isDark} G={G}/>}
        {tab==='delete' && <DeleteTab token={token||''} isDark={isDark} G={G}/>}
      </div>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

// ── ONGLET AJOUT ────────────────────────────────────────────
function AddTab({ token, isDark, G }: any) {
  const [form,setForm]=useState<FormData>(EMPTY_FORM);
  const [loading,setLoading]=useState(false);
  const [success,setSuccess]=useState<any>(null);
  const [errors,setErrors]=useState<Record<string,string>>({});

  const validate=()=>{ const e:Record<string,string>={};
    if(!form.name?.trim()) e.name='Le nom est obligatoire';
    if(!form.activePrinciples?.trim()) e.activePrinciples='Les principes actifs sont obligatoires';
    setErrors(e); return Object.keys(e).length===0; };

  const handleSubmit=async()=>{
    if(!validate()){toast.error('Remplissez les champs obligatoires');return;}
    setLoading(true);
    try{
      const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000'}/api/drugs`,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(form)});
      const json=await res.json(); const data=unwrap(json);
      if(!res.ok) throw new Error(data?.message||'Erreur création');
      setSuccess(data); setForm(EMPTY_FORM);
      toast.success(`✅ "${form.name}" ajouté !`);
    }catch(e:any){toast.error(e.message);}finally{setLoading(false);}
  };

  return(
    <div style={{animation:'fadeUp 0.3s ease-out'}}>
      {success&&(
        <div style={{background:G.green50,border:`1px solid ${G.green200}`,borderRadius:16,padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:28}}>✅</span>
          <div>
            <p style={{fontWeight:800,color:G.green800,margin:0,fontSize:15}}>Médicament ajouté avec succès !</p>
            <p style={{fontSize:13,color:G.green700,margin:'3px 0 0'}}>ID #{success.productId} · {success.name}</p>
          </div>
          <button onClick={()=>setSuccess(null)} style={{marginLeft:'auto',padding:'6px 16px',borderRadius:9,border:`1px solid ${G.green200}`,background:G.card,color:G.green700,fontWeight:700,cursor:'pointer',fontSize:13}}>Ajouter un autre</button>
        </div>
      )}
      <FormFields form={form} setForm={setForm} errors={errors} isDark={isDark} G={G}/>
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:24,gap:12}}>
        <button onClick={()=>{setForm(EMPTY_FORM);setErrors({});}} style={{padding:'13px 28px',borderRadius:12,border:`1.5px solid ${G.border2}`,background:G.card,color:G.text2,fontWeight:700,fontSize:14,cursor:'pointer'}}>Réinitialiser</button>
        <button onClick={handleSubmit} disabled={loading} style={{padding:'13px 32px',borderRadius:12,background:loading?G.green100:`linear-gradient(135deg,${G.green800},${G.green600})`,color:'white',fontWeight:700,fontSize:14,border:'none',cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:10,boxShadow:loading?'none':'0 4px 16px rgba(22,163,74,0.35)',minWidth:180}}>
          {loading?<><span style={{display:'inline-block',width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>Enregistrement...</>:<><span style={{fontSize:16}}>➕</span>Ajouter le médicament</>}
        </button>
      </div>
    </div>
  );
}

// ── ONGLET MODIFICATION ─────────────────────────────────────
function EditTab({ token, isDark, G }: any) {
  const [searchQ,setSearchQ]=useState('');
  const [options,setOptions]=useState<any[]>([]);
  const [selected,setSelected]=useState<any>(null);
  const [form,setForm]=useState<FormData>(EMPTY_FORM);
  const [loading,setLoading]=useState(false);
  const [searching,setSearching]=useState(false);
  const [open,setOpen]=useState(false);
  const [errors,setErrors]=useState<Record<string,string>>({});
  const dropRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{const h=(e:MouseEvent)=>{if(dropRef.current&&!dropRef.current.contains(e.target as Node))setOpen(false);};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[]);

  useEffect(()=>{
    if(searchQ.length<2){setOptions([]);return;}
    const t=setTimeout(async()=>{setSearching(true);
      try{const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000'}/api/drugs?q=${encodeURIComponent(searchQ)}&limit=30`);const json=await res.json();const inner=json?.data?.data||json?.data||[];setOptions(Array.isArray(inner)?inner:[]);setOpen(true);}
      catch{setOptions([]);}finally{setSearching(false);}},350);
    return()=>clearTimeout(t);
  },[searchQ]);

  const selectDrug=async(drug:any)=>{setOpen(false);setSearchQ(drug.name);setLoading(true);
    try{const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000'}/api/drugs/${drug.productId}`);const json=await res.json();const data=unwrap(json);setSelected(data);
      const meta=data.metadata||{};setForm({name:data.name||'',activePrinciples:meta.activePrinciples||'',shortName:data.shortName||'',commercialName:data.commercialName||'',posology:meta.posology||'',indications:meta.indications||'',contraindications:meta.contraindications||'',cim10:meta.cim10||'',atcClassification:meta.atcClassification||'',sideEffects:meta.sideEffects||'',interactions:meta.interactions||'',foodInteractions:meta.foodInteractions||'',allergies:meta.allergies||'',warnings:meta.warnings||'',precautions:meta.precautions||'',excipients:meta.excipients||'',notes:meta.notes||''});
    }catch{toast.error('Erreur chargement');}finally{setLoading(false);};};

  const handleUpdate=async()=>{
    if(!selected){toast.error('Sélectionnez un médicament');return;}
    if(!form.name?.trim()){toast.error('Le nom est obligatoire');return;}
    setLoading(true);
    try{const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000'}/api/drugs/${selected.productId}`,{method:'PUT',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(form)});
      const json=await res.json();if(!res.ok)throw new Error(unwrap(json)?.message||'Erreur');
      toast.success(`✅ "${form.name}" modifié !`);setSelected(null);setForm(EMPTY_FORM);setSearchQ('');
    }catch(e:any){toast.error(e.message);}finally{setLoading(false);};};

  return(
    <div style={{animation:'fadeUp 0.3s ease-out'}}>
      <CrudSearchDropdown value={searchQ} onChange={setSearchQ} options={options} open={open} onSelect={selectDrug} searching={searching} dropRef={dropRef} placeholder="Tapez le nom du médicament à modifier..." color='#2563eb' G={G} isDark={isDark}/>
      {loading&&!selected&&<div style={{display:'flex',justifyContent:'center',padding:'32px'}}><span style={{display:'inline-block',width:36,height:36,border:`3px solid ${G.border2}`,borderTopColor:'#22c55e',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/></div>}
      {selected&&!loading&&(<>
        <div style={{background:isDark?'rgba(37,99,235,0.08)':'#eff6ff',border:'1px solid #bfdbfe',borderRadius:12,padding:'12px 16px',marginBottom:20,display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:20}}>✏️</span>
          <div><p style={{fontWeight:700,color:'#2563eb',margin:0,fontSize:14}}>Modification de : {selected.name}</p><p style={{fontSize:12,color:G.text3,margin:0}}>ID #{selected.productId}</p></div>
        </div>
        <FormFields form={form} setForm={setForm} errors={errors} isDark={isDark} G={G}/>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:24,gap:12}}>
          <button onClick={()=>{setSelected(null);setForm(EMPTY_FORM);setSearchQ('');}} style={{padding:'13px 28px',borderRadius:12,border:`1.5px solid ${G.border2}`,background:G.card,color:G.text2,fontWeight:700,fontSize:14,cursor:'pointer'}}>Annuler</button>
          <button onClick={handleUpdate} disabled={loading} style={{padding:'13px 32px',borderRadius:12,background:'linear-gradient(135deg,#2563eb,#1d4ed8)',color:'white',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 16px rgba(37,99,235,0.35)',minWidth:180}}>
            {loading?<><span style={{display:'inline-block',width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>Enregistrement...</>:<><span>✏️</span>Enregistrer les modifications</>}
          </button>
        </div>
      </>)}
    </div>
  );
}

// ── ONGLET SUPPRESSION ──────────────────────────────────────
function DeleteTab({ token, isDark, G }: any) {
  const [searchQ,setSearchQ]=useState('');
  const [options,setOptions]=useState<any[]>([]);
  const [selected,setSelected]=useState<any>(null);
  const [loading,setLoading]=useState(false);
  const [searching,setSearching]=useState(false);
  const [open,setOpen]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const dropRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{const h=(e:MouseEvent)=>{if(dropRef.current&&!dropRef.current.contains(e.target as Node))setOpen(false);};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[]);

  useEffect(()=>{
    if(searchQ.length<2){setOptions([]);return;}
    const t=setTimeout(async()=>{setSearching(true);
      try{const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000'}/api/drugs?q=${encodeURIComponent(searchQ)}&limit=30`);const json=await res.json();const inner=json?.data?.data||json?.data||[];setOptions(Array.isArray(inner)?inner:[]);setOpen(true);}
      catch{setOptions([]);}finally{setSearching(false);}},350);
    return()=>clearTimeout(t);
  },[searchQ]);

  const selectDrug=async(drug:any)=>{setOpen(false);setSearchQ(drug.name);setLoading(true);setConfirm(false);
    try{const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000'}/api/drugs/${drug.productId}`);const json=await res.json();setSelected(unwrap(json));}
    catch{toast.error('Erreur chargement');}finally{setLoading(false);};};

  const handleDelete=async()=>{if(!selected)return;setLoading(true);
    try{const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:3000'}/api/drugs/${selected.productId}`,{method:'DELETE',headers:token?{Authorization:`Bearer ${token}`}:{}});
      const json=await res.json();if(!res.ok)throw new Error(unwrap(json)?.message||'Erreur');
      toast.success(`🗑️ "${selected.name}" retiré du marché`);setSelected(null);setConfirm(false);setSearchQ('');
    }catch(e:any){toast.error(e.message);}finally{setLoading(false);};};

  const MKT:Record<number,{label:string;c:string}>={1:{label:'Commercialisé',c:'#16a34a'},0:{label:'Non commercialisé',c:'#ca8a04'},2:{label:'Suspendu',c:'#ca8a04'},5:{label:'Déjà retiré',c:'#dc2626'}};
  const redBg=isDark?'rgba(220,38,38,0.08)':'#fef2f2';
  const redBdr=isDark?'rgba(220,38,38,0.2)':'#fecaca';

  return(
    <div style={{animation:'fadeUp 0.3s ease-out'}}>
      <div style={{background:redBg,border:`1px solid ${redBdr}`,borderRadius:12,padding:'14px 18px',marginBottom:24,display:'flex',gap:12}}>
        <span style={{fontSize:22,flexShrink:0}}>⚠️</span>
        <div>
          <p style={{fontWeight:700,color:'#991b1b',margin:0,fontSize:14}}>Suppression logique</p>
          <p style={{fontSize:13,color:'#dc2626',margin:'3px 0 0',lineHeight:1.6}}>La suppression retire le médicament du marché sans effacer les données. L'action est réversible par un administrateur.</p>
        </div>
      </div>
      <CrudSearchDropdown value={searchQ} onChange={setSearchQ} options={options} open={open} onSelect={selectDrug} searching={searching} dropRef={dropRef} placeholder="Tapez le nom du médicament à supprimer..." color='#dc2626' G={G} isDark={isDark}/>
      {loading&&!selected&&<div style={{display:'flex',justifyContent:'center',padding:'32px'}}><span style={{display:'inline-block',width:36,height:36,border:`3px solid ${G.border2}`,borderTopColor:'#22c55e',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/></div>}
      {selected&&!loading&&(
        <div style={{animation:'fadeUp 0.3s ease-out'}}>
          <div style={{background:G.card,border:`2px solid ${redBdr}`,borderRadius:16,padding:'24px',marginBottom:20}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:16,marginBottom:16}}>
              <div style={{width:56,height:56,borderRadius:14,background:redBg,border:`1px solid ${redBdr}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>💊</div>
              <div style={{flex:1}}>
                <h2 style={{fontSize:18,fontWeight:800,color:G.text,margin:0}}>{selected.name}</h2>
                {selected.shortName&&<p style={{fontSize:13,color:G.text2,margin:'3px 0 0'}}>{selected.shortName}</p>}
                <div style={{display:'flex',gap:8,marginTop:8}}>
                  <span style={{padding:'3px 12px',borderRadius:99,fontSize:11,fontWeight:700,background:G.green100,color:G.green800}}>ID #{selected.productId}</span>
                  <span style={{padding:'3px 12px',borderRadius:99,fontSize:11,fontWeight:700,background:G.green100,color:(MKT[selected.marketStatus]||MKT[0]).c}}>{(MKT[selected.marketStatus]||{label:'Inconnu'}).label}</span>
                </div>
              </div>
            </div>
            {!confirm?(
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 18px',background:redBg,borderRadius:12,border:`1px solid ${redBdr}`}}>
                <p style={{fontSize:14,fontWeight:600,color:'#991b1b',margin:0}}>Êtes-vous sûr de vouloir retirer <strong>"{selected.name}"</strong> ?</p>
                <div style={{display:'flex',gap:10}}>
                  <button onClick={()=>{setSelected(null);setSearchQ('');}} style={{padding:'10px 20px',borderRadius:10,border:`1px solid ${G.border2}`,background:G.card,color:G.text2,fontWeight:700,cursor:'pointer',fontSize:13}}>Annuler</button>
                  <button onClick={()=>setConfirm(true)} style={{padding:'10px 20px',borderRadius:10,background:'linear-gradient(135deg,#991b1b,#dc2626)',color:'white',fontWeight:700,fontSize:13,border:'none',cursor:'pointer',boxShadow:'0 4px 12px rgba(220,38,38,0.3)'}}>Confirmer la suppression</button>
                </div>
              </div>
            ):(
              <div style={{padding:'20px',background:redBg,borderRadius:14,border:`2px solid #dc2626`,textAlign:'center'}}>
                <p style={{fontSize:16,fontWeight:800,color:'#991b1b',marginBottom:6}}>⚠️ CONFIRMATION FINALE</p>
                <p style={{fontSize:14,color:'#dc2626',marginBottom:20}}>Retirer <strong>"{selected.name}"</strong> du marché ?<br/><span style={{fontSize:12,opacity:0.8}}>Réversible par un administrateur.</span></p>
                <div style={{display:'flex',justifyContent:'center',gap:12}}>
                  <button onClick={()=>setConfirm(false)} style={{padding:'12px 24px',borderRadius:12,border:`1.5px solid ${G.border2}`,background:G.card,color:G.text2,fontWeight:700,cursor:'pointer'}}>Non, annuler</button>
                  <button onClick={handleDelete} disabled={loading} style={{padding:'12px 28px',borderRadius:12,background:'linear-gradient(135deg,#991b1b,#dc2626)',color:'white',fontWeight:700,border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 12px rgba(220,38,38,0.4)'}}>
                    {loading?<span style={{display:'inline-block',width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>:'🗑️'}Oui, retirer du marché
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── FORMULAIRE ──────────────────────────────────────────────
function FormFields({ form, setForm, errors, isDark, G }: any) {
  const update=(key:string,value:string)=>setForm((prev:any)=>({...prev,[key]:value}));
  const GROUPS=[
    {key:'required',      label:'🔴 Champs obligatoires',         color:'#dc2626', bg:isDark?'rgba(220,38,38,0.06)':'#fef2f2', bdr:isDark?'rgba(220,38,38,0.2)':'#fecaca'},
    {key:'identity',      label:'🏷️ Identification',               color:'#2563eb', bg:isDark?'rgba(37,99,235,0.06)':'#eff6ff',  bdr:isDark?'rgba(37,99,235,0.2)':'#bfdbfe'},
    {key:'clinical',      label:'🏥 Données cliniques',            color:G.green700,bg:G.green50,                               bdr:G.border2},
    {key:'classification',label:'🔬 Classification',               color:'#7c3aed', bg:isDark?'rgba(124,58,237,0.06)':'#f5f3ff', bdr:isDark?'rgba(124,58,237,0.2)':'#ddd6fe'},
    {key:'safety',        label:'🛡️ Sécurité & Pharmacovigilance', color:'#ea580c', bg:isDark?'rgba(234,88,12,0.06)':'#fff7ed',  bdr:isDark?'rgba(234,88,12,0.2)':'#fed7aa'},
    {key:'composition',   label:'⚗️ Composition',                  color:'#0e7490', bg:isDark?'rgba(14,116,144,0.06)':'#ecfeff', bdr:isDark?'rgba(14,116,144,0.2)':'#a5f3fc'},
    {key:'other',         label:'📝 Divers',                       color:G.text2,  bg:G.card, bdr:G.border},
  ];
  return(
    <div style={{display:'flex',flexDirection:'column',gap:28}}>
      {GROUPS.map(group=>{
        const groupFields=FIELDS.filter(f=>f.group===group.key);
        return(
          <div key={group.key}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,paddingBottom:10,borderBottom:`2px solid ${group.bdr}`}}>
              <h3 style={{fontSize:14,fontWeight:800,color:group.color,margin:0}}>{group.label}</h3>
              {group.key==='required'&&<span style={{fontSize:11,color:'#dc2626',background:isDark?'rgba(220,38,38,0.08)':'#fef2f2',padding:'2px 8px',borderRadius:99,border:`1px solid ${isDark?'rgba(220,38,38,0.2)':'#fecaca'}`,fontWeight:600}}>Champs obligatoires *</span>}
            </div>
            <div style={{display:'grid',gridTemplateColumns:group.key==='required'?'1fr 1fr':'1fr',gap:12}}>
              {groupFields.map(field=>(
                <div key={field.key}>
                  <label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:700,color:field.required?'#dc2626':G.text2,marginBottom:6}}>
                    <span>{field.icon}</span>{field.label}{field.required&&<span style={{color:'#dc2626',fontSize:14}}>*</span>}
                  </label>
                  {field.type==='textarea'?(
                    <textarea value={form[field.key]||''} onChange={e=>update(field.key,e.target.value)} placeholder={field.placeholder} rows={3}
                      style={{width:'100%',padding:'11px 14px',borderRadius:10,border:`1.5px solid ${errors[field.key]?'#f87171':G.border2}`,background:G.inputBg,fontSize:13,color:G.inputClr,resize:'vertical',lineHeight:1.6,boxSizing:'border-box',fontFamily:'inherit',transition:'border-color 0.2s'}}
                      onFocus={e=>e.target.style.borderColor='#22c55e'} onBlur={e=>e.target.style.borderColor=errors[field.key]?'#f87171':G.border2}/>
                  ):(
                    <input type="text" value={form[field.key]||''} onChange={e=>update(field.key,e.target.value)} placeholder={field.placeholder}
                      style={{width:'100%',padding:'12px 14px',borderRadius:10,border:`1.5px solid ${errors[field.key]?'#f87171':G.border2}`,background:G.inputBg,fontSize:13,color:G.inputClr,boxSizing:'border-box',transition:'border-color 0.2s'}}
                      onFocus={e=>e.target.style.borderColor='#22c55e'} onBlur={e=>e.target.style.borderColor=errors[field.key]?'#f87171':G.border2}/>
                  )}
                  {errors[field.key]&&<p style={{fontSize:11,color:'#f87171',margin:'4px 0 0',display:'flex',alignItems:'center',gap:4}}>⚠️ {errors[field.key]}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── DROPDOWN RECHERCHE ──────────────────────────────────────
function CrudSearchDropdown({ value, onChange, options, open, onSelect, searching, dropRef, placeholder, color, G, isDark }: any) {
  const MKT:Record<number,{label:string;c:string}>={1:{label:'Commercialisé',c:'#16a34a'},0:{label:'Non commercialisé',c:'#ca8a04'},2:{label:'Suspendu',c:'#ca8a04'},5:{label:'Retiré',c:'#dc2626'}};
  return(
    <div ref={dropRef} style={{position:'relative',marginBottom:24}}>
      <label style={{display:'block',fontSize:14,fontWeight:700,color:color,marginBottom:8}}>🔍 Rechercher un médicament</label>
      <div style={{position:'relative'}}>
        <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          style={{width:'100%',padding:'14px 48px 14px 18px',borderRadius:12,border:`2px solid ${color}40`,background:isDark?'#1a2332':'#ffffff',fontSize:14,color:G.text,outline:'none',boxSizing:'border-box'}}
          onFocus={e=>e.target.style.borderColor=color} onBlur={e=>e.target.style.borderColor=`${color}40`}/>
        <div style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)'}}>
          {searching?<span style={{display:'inline-block',width:16,height:16,border:`2px solid ${G.border2}`,borderTopColor:'#22c55e',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>:<span style={{color:G.text3,fontSize:16}}>💊</span>}
        </div>
      </div>
      <p style={{fontSize:11,color:G.text3,margin:'4px 0 0'}}>Tapez au moins 2 caractères · {options.length>0?`${options.length} résultat(s)`:'Saisissez pour rechercher...'}</p>
      {open&&options.length>0&&(
        <div style={{position:'absolute',top:'100%',left:0,right:0,background:G.card,border:`1px solid ${G.border2}`,borderRadius:12,zIndex:50,maxHeight:320,overflowY:'auto',boxShadow:'0 8px 32px rgba(0,0,0,0.2)',marginTop:4}}>
          {options.map((d:any,i:number)=>{const st=MKT[d.marketStatus]||{label:'Inconnu',c:G.text3};return(
            <div key={i} onClick={()=>onSelect(d)}
              style={{padding:'12px 16px',borderBottom:i<options.length-1?`1px solid ${G.border}`:' none',cursor:'pointer',display:'flex',alignItems:'center',gap:12,transition:'background 0.15s'}}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=G.green50}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=G.card}>
              <span style={{fontSize:20,flexShrink:0}}>💊</span>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:700,color:G.text,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</p>
                {d.shortName&&<p style={{fontSize:11,color:G.text2,margin:'1px 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.shortName}</p>}
              </div>
              <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3}}>
                <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:99,background:G.green100,color:st.c}}>{st.label}</span>
                <span style={{fontSize:10,color:G.text3}}>#{d.productId}</span>
              </div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}
