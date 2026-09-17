'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { Header } from '@/components/layout/Header';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Message {
  id:           string;
  role:         'user'|'assistant';
  content:      string;
  timestamp:    Date;
  isTyping?:    boolean;
  suggestedDrugs?: string[];
  isEmergency?: boolean;
}

const SUGGESTIONS = [
  { text:"J'ai des maux de tête depuis 2 jours",         icon:'🤕' },
  { text:"Je souffre d'un rhume avec fièvre",            icon:'🤒' },
  { text:"Quels sont les effets du paracétamol ?",       icon:'💊' },
  { text:"J'ai mal à la gorge depuis hier",              icon:'😮' },
  { text:"Que prendre pour des nausées ?",               icon:'🤢' },
  { text:"Interactions entre ibuprofène et aspirine ?",  icon:'⚡' },
];

function TypingIndicator({ color }: { color: string }) {
  return (
    <div style={{ display:'flex', gap:4, alignItems:'center', padding:'4px 0' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:color, animation:`typingDot 1.4s ${i*0.2}s ease-in-out infinite` }} />
      ))}
    </div>
  );
}

export default function ChatIAPage() {
  const { user, token }       = useAuthStore();
  const { isDark }            = useThemeStore();
  const router                = useRouter();
  const [messages, setMsgs]   = useState<Message[]>([]);
  const [input,    setInput]   = useState('');
  const [loading,  setLoading] = useState(false);
  const [aiStatus, setAiStatus]= useState<'checking'|'ready'|'offline'>('checking');
  const [convId,   setConvId]  = useState<number|undefined>(undefined);
  const [history,  setHistory] = useState<{role:string;content:string}[]>([]);
  const [showSugg, setShowSugg]= useState(true);
  const bottomRef              = useRef<HTMLDivElement>(null);
  const textareaRef            = useRef<HTMLTextAreaElement>(null);

  // Palette dynamique dark/light
  const G = {
    bg:        isDark?'#0b1120':'#f0fdf4',
    card:      isDark?'#111827':'#ffffff',
    card2:     isDark?'#1a2332':'#f0fdf4',
    chatBg:    isDark?'#0d1424':'#ffffff',
    border:    isDark?'rgba(255,255,255,0.07)':'#dcfce7',
    border2:   isDark?'rgba(255,255,255,0.12)':'#bbf7d0',
    text:      isDark?'#f1f5f9':'#14532d',
    text2:     isDark?'#94a3b8':'#64748b',
    text3:     isDark?'#6b7280':'#94a3b8',
    green:     '#22c55e',
    green800:  isDark?'#4ade80':'#166534',
    green700:  isDark?'#22c55e':'#15803d',
    green600:  isDark?'#16a34a':'#16a34a',
    green100:  isDark?'rgba(34,197,94,0.12)':'#dcfce7',
    green50:   isDark?'rgba(34,197,94,0.06)':'#f0fdf4',
    green200:  isDark?'rgba(34,197,94,0.2)':'#bbf7d0',
    green300:  isDark?'rgba(34,197,94,0.3)':'#86efac',
    green400:  isDark?'rgba(34,197,94,0.4)':'#4ade80',
    inputBg:   isDark?'#1a2332':'#ffffff',
    msgUser:   isDark?'linear-gradient(135deg,#166534,#16a34a)':'linear-gradient(135deg,#166534,#16a34a)',
    msgBot:    isDark?'#1a2332':'#f0fdf4',
    msgBotBdr: isDark?'rgba(34,197,94,0.15)':'#bbf7d0',
    bubbleFoot:isDark?'rgba(13,20,36,0.9)':'rgba(240,253,244,0.9)',
    gray400:   '#94a3b8',
    gray700:   isDark?'#e2e8f0':'#334155',
  };

  // Vérifier l'IA
  useEffect(() => {
    fetch(`${API}/api/chat/health`)
      .then(r => r.json())
      .then(d => { const data=d?.data??d; setAiStatus(data?.available?'ready':'offline'); })
      .catch(() => setAiStatus('offline'));
  }, []);

  // Message de bienvenue
  useEffect(() => {
    if (messages.length === 0) {
      const hour = new Date().getHours();
      const greet = hour<12?'Bonjour':hour<18?'Bon après-midi':'Bonsoir';
      setMsgs([{
        id:        'welcome',
        role:      'assistant',
        content:   `${greet} ${user?.firstName||''} ! 👋\n\nJe suis **MedocAssistant**, votre assistant médical intelligent. Je suis connecté à une base de données de plus de **106 000 médicaments** référencés.\n\nComment vous sentez-vous aujourd'hui ? Décrivez vos symptômes ou posez-moi vos questions — je suis là pour vous aider ! 😊\n\n*Mes suggestions sont indicatives et ne remplacent pas l'avis d'un médecin.*`,
        timestamp: new Date(),
      }]);
    }
  }, [user]);

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const adjustTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text||input).trim();
    if (!msg || loading) return;
    setInput(''); setShowSugg(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMsgId = `u_${Date.now()}`;
    setMsgs(prev => [...prev, { id:userMsgId, role:'user', content:msg, timestamp:new Date() }]);

    const typingId = `t_${Date.now()}`;
    setMsgs(prev => [...prev, { id:typingId, role:'assistant', content:'', isTyping:true, timestamp:new Date() }]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) },
        body:JSON.stringify({ message:msg, userId:user?.id, userRole:user?.role||'patient', userName:user?.firstName||'utilisateur', conversationId:convId, history:history.slice(-10) }),
      });
      const json = await res.json();
      const data = json?.data ?? json;
      if (!res.ok) throw new Error(data?.message||'Erreur IA');

      const newHistory = [...history, {role:'user',content:msg}, {role:'assistant',content:data.response}].slice(-20);
      setHistory(newHistory);
      if (data.conversationId) setConvId(data.conversationId);

      setMsgs(prev => prev.map(m => m.id===typingId ? {
        id:typingId, role:'assistant' as const, content:data.response, timestamp:new Date(),
        isTyping:false, suggestedDrugs:data.suggestedDrugs||[], isEmergency:data.isEmergency,
      } : m));
    } catch {
      setMsgs(prev => prev.map(m => m.id===typingId ? {
        id:typingId, role:'assistant' as const, timestamp:new Date(), isTyping:false,
        content: aiStatus==='offline'
          ? '⚠️ Le service IA est hors ligne. Vérifiez qu\'Ollama est démarré sur la VM (`ollama serve`).'
          : 'Je suis désolé, une erreur s\'est produite. Veuillez réessayer.',
      } : m));
      toast.error('Erreur IA');
    } finally { setLoading(false); }
  }, [input, loading, history, convId, user, token, aiStatus]);

  const clearConversation = () => {
    setMsgs([]); setHistory([]); setConvId(undefined); setShowSugg(true);
    setTimeout(() => setMsgs([{ id:'welcome_new', role:'assistant', content:'Conversation réinitialisée ! 🔄\n\nComment puis-je vous aider ?', timestamp:new Date() }]), 100);
  };

  const formatContent = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/\n/g,'<br/>');

  const statusCfg = {
    checking:{ label:'Vérification...', bg:isDark?'rgba(234,179,8,0.1)':'#fef9c3', c:isDark?'#fbbf24':'#92400e', dot:'#f59e0b' },
    ready:   { label:'IA opérationnelle', bg:G.green100, c:G.green800, dot:'#22c55e' },
    offline: { label:'IA hors ligne',    bg:isDark?'rgba(239,68,68,0.1)':'#fef2f2', c:isDark?'#f87171':'#b91c1c', dot:'#ef4444' },
  }[aiStatus];

  return (
    <div style={{ minHeight:'100vh', background:G.bg, display:'flex', flexDirection:'column', transition:'background 0.3s' }}>
      <Header title="MedocAssistant" subtitle="Assistant médical IA — Propulsé par Qwen2.5" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', padding: '0 20px 20px', boxSizing: 'border-box' }}>

        {/* ── BANDEAU STATUT ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Bouton retour */}
            <button onClick={() => router.push('/conseiller')}
              style={{ padding:'7px 14px', borderRadius:10, border:`1px solid ${G.border2}`, background:G.card, color:G.text2, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='#22c55e'; (e.currentTarget as HTMLElement).style.color=G.green800; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor=G.border2; (e.currentTarget as HTMLElement).style.color=G.text2; }}>
              ← Retour
            </button>
            <div style={{ width:1, height:20, background:G.border2 }} />
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#15803d,#22c55e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:`0 4px 16px rgba(22,163,74,0.35)`, position:'relative' }}>
              🤖
              <span style={{ position:'absolute', top:-2, right:-2, width:10, height:10, borderRadius:'50%', background:statusCfg.dot, border:`2px solid ${G.bg}`, animation:aiStatus==='ready'?'livePing 2s ease-out infinite':'none' }} />
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:800, color:G.text, margin:0 }}>MedocAssistant</p>
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 8px', borderRadius:99, fontSize:10, fontWeight:700, background:statusCfg.bg, color:statusCfg.c, border:`1px solid ${statusCfg.dot}25` }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:statusCfg.dot, display:'inline-block' }} />
                {statusCfg.label}
              </span>
            </div>
          </div>

          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['🧠 Qwen2.5:1.5b','💊 106K+ médicaments','🔒 Local'].map((t,i)=>(
              <span key={i} style={{ padding:'3px 10px', borderRadius:99, fontSize:10, fontWeight:700, background:G.green50, color:G.green700, border:`1px solid ${G.border2}` }}>{t}</span>
            ))}
            {messages.length > 1 && (
              <button onClick={clearConversation}
                style={{ padding:'3px 10px', borderRadius:99, fontSize:10, fontWeight:700, background:G.card, color:G.text3, border:`1px solid ${G.border}`, cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#ef4444'; (e.currentTarget as HTMLElement).style.borderColor='#fca5a5'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color=G.text3; (e.currentTarget as HTMLElement).style.borderColor=G.border; }}>
                🗑️ Effacer
              </button>
            )}
          </div>
        </div>

        {/* ── DISCLAIMER ── */}
        <div style={{ display:'flex', gap:10, padding:'10px 14px', borderRadius:12, background:isDark?'rgba(234,179,8,0.08)':'#fffbeb', border:isDark?'1px solid rgba(234,179,8,0.2)':'1px solid #fde68a', marginBottom:16 }}>
          <span style={{ fontSize:16, flexShrink:0 }}>⚕️</span>
          <p style={{ fontSize:11.5, color:isDark?'#fbbf24':'#92400e', margin:0, lineHeight:1.6 }}>
            <strong>Usage indicatif uniquement.</strong> MedocAssistant ne remplace pas un médecin ou pharmacien. Pour toute urgence médicale, appelez le <strong>15 (SAMU)</strong>.
          </p>
        </div>

        {/* ── ZONE CHAT ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', background:G.chatBg, borderRadius:20, border:`1px solid ${G.border2}`, overflow:'hidden', boxShadow:isDark?'0 4px 24px rgba(0,0,0,0.4)':'0 4px 24px rgba(22,163,74,0.08)', transition:'background 0.3s, border-color 0.3s' }}>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:16, minHeight:400, maxHeight:'calc(100vh - 360px)' }}>

            {messages.map((msg, idx) => (
              <div key={msg.id}
                style={{ display:'flex', flexDirection:msg.role==='user'?'row-reverse':'row', alignItems:'flex-start', gap:10, animation:`msgAppear 0.35s ${idx===0?0:50}ms cubic-bezier(0.34,1.56,0.64,1) both` }}>

                {/* Avatar */}
                <div style={{ width:36, height:36, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:msg.role==='user'?14:18, fontWeight:700,
                  background:msg.role==='user'?'linear-gradient(135deg,#166534,#16a34a)':G.card,
                  color:msg.role==='user'?'white':G.green700,
                  border:msg.role==='assistant'?`2px solid ${G.border2}`:'none',
                  boxShadow:msg.role==='user'?'0 2px 8px rgba(22,163,74,0.3)':isDark?'0 2px 8px rgba(0,0,0,0.3)':'0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  {msg.role==='user'?(user?.firstName?.[0]||'U'):'🤖'}
                </div>

                {/* Bulle */}
                <div style={{ maxWidth:'75%', display:'flex', flexDirection:'column', gap:4 }}>
                  <div style={{
                    padding:'13px 16px',
                    borderRadius:msg.role==='user'?'20px 6px 20px 20px':'6px 20px 20px 20px',
                    background:msg.role==='user'?G.msgUser:G.msgBot,
                    color:msg.role==='user'?'white':G.gray700,
                    border:msg.role==='assistant'?`1px solid ${G.msgBotBdr}`:'none',
                    fontSize:13.5, lineHeight:1.75, fontWeight:400,
                    boxShadow:msg.role==='user'?'0 4px 16px rgba(22,163,74,0.25)':isDark?'0 2px 8px rgba(0,0,0,0.3)':'0 2px 8px rgba(16,185,129,0.06)',
                  }}>
                    {msg.isTyping ? (
                      <TypingIndicator color={G.green700} />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                    )}

                    {/* Médicaments suggérés */}
                    {msg.suggestedDrugs && msg.suggestedDrugs.length > 0 && (
                      <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${G.border2}` }}>
                        <p style={{ fontSize:10, color:G.green700, fontWeight:700, margin:'0 0 5px', textTransform:'uppercase', letterSpacing:'0.06em' }}>💊 Mentionnés dans ma réponse</p>
                        <div>{msg.suggestedDrugs.map((d,i)=>(
                          <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:G.green100, color:G.green800, border:`1px solid ${G.border2}`, margin:'2px 3px 2px 0', verticalAlign:'middle' }}>💊 {d}</span>
                        ))}</div>
                      </div>
                    )}
                  </div>

                  {/* Urgence */}
                  {msg.isEmergency && (
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, background:isDark?'rgba(239,68,68,0.1)':'#fff1f2', border:isDark?'1.5px solid rgba(239,68,68,0.3)':'1.5px solid #f87171', marginTop:4 }}>
                      <span style={{ fontSize:20, flexShrink:0 }}>🚨</span>
                      <p style={{ fontSize:12, color:isDark?'#f87171':'#b91c1c', margin:0, fontWeight:600, lineHeight:1.5 }}>En cas d'urgence médicale, appelez le <strong>15 (SAMU)</strong> ou le <strong>18 (Pompiers)</strong></p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p style={{ fontSize:10, color:G.gray400, margin:'0 4px', textAlign:msg.role==='user'?'right':'left' }}>
                    {msg.timestamp.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}

            {/* Suggestions initiales */}
            {showSugg && messages.length <= 1 && (
              <div style={{ marginTop:8 }}>
                <p style={{ fontSize:12, color:G.text3, fontWeight:600, marginBottom:10, textAlign:'center', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  💡 Questions fréquentes — cliquez pour commencer
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
                  {SUGGESTIONS.map((s,i) => (
                    <button key={i} onClick={()=>sendMessage(s.text)}
                      style={{ padding:'11px 14px', borderRadius:12, border:`1.5px solid ${G.border2}`, background:G.card2, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:8, transition:'all 0.2s', animation:`fadeInUp 0.3s ${i*60}ms both` }}
                      onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#22c55e'; (e.currentTarget as HTMLElement).style.background=G.green100; (e.currentTarget as HTMLElement).style.transform='translateY(-1px)'; }}
                      onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=G.border2; (e.currentTarget as HTMLElement).style.background=G.card2; (e.currentTarget as HTMLElement).style.transform='none'; }}>
                      <span style={{ fontSize:18, flexShrink:0 }}>{s.icon}</span>
                      <span style={{ fontSize:12, color:G.text, fontWeight:600, lineHeight:1.4 }}>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── ZONE DE SAISIE ── */}
          <div style={{ padding:'16px', borderTop:`1px solid ${G.border}`, background:G.bubbleFoot, backdropFilter:'blur(8px)' }}>
            <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
              <div style={{ flex:1, position:'relative' }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e=>{ setInput(e.target.value); adjustTextarea(); }}
                  onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();} }}
                  placeholder={aiStatus==='offline'?'⚠️ IA hors ligne — démarrez Ollama (`ollama serve`)':'Décrivez vos symptômes ou posez une question... (Entrée pour envoyer)'}
                  disabled={loading||aiStatus==='offline'}
                  rows={1}
                  style={{ width:'100%', padding:'12px 16px', borderRadius:14, border:`1.5px solid ${loading?G.green300:input?G.green400:G.border2}`, background:aiStatus==='offline'?isDark?'rgba(239,68,68,0.08)':'#fef2f2':G.inputBg, fontSize:13.5, color:G.text, resize:'none', outline:'none', lineHeight:1.6, transition:'border-color 0.2s, box-shadow 0.2s', boxSizing:'border-box', fontFamily:'inherit', boxShadow:input?`0 0 0 3px ${G.green50}`:'none', cursor:aiStatus==='offline'?'not-allowed':'text' }}
                />
                {input.length > 100 && (
                  <span style={{ position:'absolute', bottom:8, right:12, fontSize:10, color:input.length>1800?'#ef4444':G.gray400, fontWeight:600 }}>{input.length}/2000</span>
                )}
              </div>

              {/* Bouton envoyer */}
              <button onClick={()=>sendMessage()} disabled={loading||!input.trim()||aiStatus==='offline'}
                style={{ width:48, height:48, borderRadius:14, border:'none', cursor:!input.trim()||loading||aiStatus==='offline'?'not-allowed':'pointer',
                  background:!input.trim()||loading||aiStatus==='offline'?G.green100:`linear-gradient(135deg,#166534,#16a34a)`,
                  color:!input.trim()||loading||aiStatus==='offline'?G.green700:'white',
                  fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', flexShrink:0,
                  boxShadow:input.trim()&&!loading&&aiStatus!=='offline'?'0 4px 16px rgba(22,163,74,0.4)':'none',
                }}
                onMouseEnter={e=>{ if(input.trim()&&!loading&&aiStatus!=='offline')(e.currentTarget as HTMLElement).style.transform='scale(1.08)'; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform='scale(1)'; }}>
                {loading?<span style={{ width:20, height:20, border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'currentColor', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />:'➤'}
              </button>
            </div>

            <p style={{ fontSize:10.5, color:G.gray400, margin:'8px 0 0', textAlign:'center' }}>
              {loading?'⏳ MedocAssistant réfléchit... (8-25 secondes sur CPU)':'Entrée pour envoyer · Shift+Entrée pour nouvelle ligne · 0 données envoyées à l\'extérieur'}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes msgAppear { from{opacity:0;transform:translateY(10px) scale(0.96)} to{opacity:1;transform:none} }
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes livePing  { 0%{opacity:0.9;transform:scale(1)} 100%{opacity:0;transform:scale(2.8)} }
        @keyframes typingDot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1.1);opacity:1} }
      `}</style>
    </div>
  );
}
