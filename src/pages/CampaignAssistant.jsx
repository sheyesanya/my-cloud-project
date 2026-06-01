import { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const h = async () => { const t = await auth.currentUser?.getIdToken(); return t?{Authorization:`Bearer ${t}`,'Content-Type':'application/json'}:{}; };

const LOGO = 'https://res.cloudinary.com/dehap9dpe/image/upload/v1780240711/BrandCasta_offffff_new_w3n72w.png';

const SUGGESTED = ['What radio stations cover Lagos?','Best OOH markets for FMCG?','How do I track campaign delivery?','What are the 5Sec Ad-Spots?','Cheapest TV slots in Nigeria?'];

const SYSTEM = `You are BrandCasta's Campaign Assistant — an expert Nigerian media strategist. You know all about TV, radio, OOH, podcasts, influencers, print and digital advertising in Nigeria. You help brands plan, book and optimise their campaigns. Be specific, practical and concise. Always relate answers to the Nigerian media landscape.`;

export default function CampaignAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

  const send = async text => {
    const msg = text||input.trim();
    if(!msg||loading)return;
    setInput('');
    const newMessages = [...messages,{role:'user',content:msg}];
    setMessages(newMessages);
    setLoading(true);
    try {
      const hd = await h();
      const prompt = `${SYSTEM}\n\nConversation so far:\n${newMessages.map(m=>`${m.role==='user'?'User':'Assistant'}: ${m.content}`).join('\n')}\n\nRespond as the Assistant:`;
      const res = await axios.post(`${API}/ai/generate`,{prompt,max_tokens:800},{headers:hd});
      setMessages(prev=>[...prev,{role:'assistant',content:res.data?.text||'I could not generate a response. Please try again.'}]);
    } catch(e){
      setMessages(prev=>[...prev,{role:'assistant',content:'Sorry, I encountered an error. Please try again.'}]);
    }
    finally{setLoading(false);}
  };

  return (
    <Layout title="Campaign Assistant" subtitle="AI Media Strategist">
      <div style={{display:'grid',gridTemplateRows:'1fr auto',height:'calc(100vh - 120px)',maxHeight:700,background:'white',border:'1px solid #e1e4f0'}}>

        {/* Messages */}
        <div style={{overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:16}}>
          {messages.length===0&&(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,gap:16,padding:'40px 20px'}}>
              <img src={LOGO} alt="BrandCasta" style={{width:40,height:40,objectFit:'contain'}}/>
              <div style={{fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:16,color:'#131b2e',textAlign:'center'}}>Campaign Assistant</div>
              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#777586',textTransform:'uppercase',letterSpacing:'0.08em',textAlign:'center'}}>Your AI Nigerian media strategist</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',maxWidth:500,marginTop:8}}>
                {SUGGESTED.map(s=>(
                  <button key={s} onClick={()=>send(s)}
                    style={{padding:'8px 14px',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.06em',background:'#faf8ff',cursor:'pointer',color:'#4338ca',transition:'all 0.15s'}}
                    onMouseEnter={e=>{e.currentTarget.style.background='#eef2ff';e.currentTarget.style.borderColor='#c7d2fe';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='#faf8ff';e.currentTarget.style.borderColor='#e1e4f0';}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m,i)=>(
            <div key={i} style={{display:'flex',gap:12,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-start'}}>
              <div style={{width:28,height:28,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:m.role==='user'?'#4338ca':'#f2f3ff',overflow:'hidden'}}>
                {m.role==='user'?<span style={{color:'white',fontFamily:'Manrope,sans-serif',fontWeight:700,fontSize:11}}>U</span>:<img src={LOGO} alt="BC" style={{width:20,height:20,objectFit:'contain'}}/>}
              </div>
              <div style={{maxWidth:'75%',padding:'12px 14px',background:m.role==='user'?'#4338ca':'#f8f9ff',border:m.role==='user'?'none':'1px solid #e1e4f0'}}>
                <p style={{fontFamily:'Inter,sans-serif',fontSize:13,color:m.role==='user'?'white':'#131b2e',lineHeight:1.7,margin:0,whiteSpace:'pre-wrap'}}>{m.content}</p>
              </div>
            </div>
          ))}
          {loading&&(
            <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{width:28,height:28,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#f2f3ff'}}><img src={LOGO} alt="BC" style={{width:20,height:20,objectFit:'contain'}}/></div>
              <div style={{padding:'12px 14px',background:'#f8f9ff',border:'1px solid #e1e4f0'}}>
                <div style={{display:'flex',gap:4}}>
                  {[0,1,2].map(i=><div key={i} style={{width:6,height:6,background:'#4338ca',borderRadius:'50%',animation:`bounce 1s ${i*0.15}s infinite`}}/>)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{padding:'14px 20px',borderTop:'1px solid #e1e4f0',display:'flex',gap:10}}>
          <input type="text" placeholder="Ask about Nigerian media, campaign strategy, pricing…" value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey)send();}}
            style={{flex:1,border:'1px solid #e1e4f0',padding:'10px 14px',fontFamily:'Inter,sans-serif',fontSize:13,outline:'none',background:'#faf8ff'}}/>
          <button onClick={()=>send()} disabled={!input.trim()||loading}
            style={{padding:'10px 20px',background:!input.trim()||loading?'#e1e4f0':'#4338ca',color:!input.trim()||loading?'#777586':'white',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',border:'none',cursor:!input.trim()||loading?'not-allowed':'pointer',flexShrink:0}}>
            Send
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
    </Layout>
  );
}
