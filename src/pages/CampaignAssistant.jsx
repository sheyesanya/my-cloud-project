import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTitle from '../components/PageTitle';
import Layout from '../components/Layout';
import { auth } from '../lib/firebase';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

const SUGGESTED = [
  "What's the best radio mix for a Lagos product launch with ₦2M budget?",
  "Compare TV vs influencer for reaching 18–35 urban professionals",
  "How do I structure a 4-week OOH campaign across Lagos and Abuja?",
  "What KPIs should I track for a podcast sponsorship?",
  "Explain how BrandCasta FlashSpots work",
];

const SYSTEM_PROMPT = `You are the BrandCasta Campaign Assistant — an expert Nigerian media buying strategist. You help brands plan, optimize and understand media campaigns across TV, radio, billboard/OOH, podcasts and influencers on the BrandCasta platform.

Key facts:
- BrandCasta has 184+ verified Nigerian media providers across 9 categories
- Categories: Television, Radio/Audio, Out-of-Home, Podcasts, Influencers, Social Media, Music Promotion, Live Streaming, Print Media
- FlashSpots: subsidized 5s and 15s spots at arithmetically proportional rates (e.g. 5s = 1/6 of 30s price)
- Volume discounts: 3-4 runs=5%, 5-9=10%, 10-19=15%, 20+=25%
- Platform commission: 15%, payout to provider: 85%
- Payment via Paystack, campaigns book in minutes

Always give specific, actionable advice with Nigerian market context. Reference real providers (Cool FM, Channels TV, XL Billboards, Toke Makinwa, I Said What I Said etc.) when relevant. Be concise — use monospace-friendly formatting with clear sections. Never use markdown headers or asterisks.`;

export default function CampaignAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello. I\'m your Campaign Assistant — briefed on every provider, format and market on BrandCasta.\n\nAsk me anything about planning a campaign, choosing media, estimating reach, or understanding pricing.'
    }
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const messagesEndRef           = useRef(null);
  const inputRef                 = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');

    const userMsg = { role: 'user', content };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      const headers = { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) };
      const prompt = `${SYSTEM_PROMPT}\n\nConversation history:\n${history.slice(-8).map(m => `${m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${m.content}`).join('\n\n')}\n\nRespond as the assistant:`;
      const res = await axios.post(`${API}/ai/generate`, { prompt, max_tokens:800 }, { headers });
      setMessages(prev => [...prev, { role:'assistant', content: res.data?.text || 'Sorry, I could not generate a response.' }]);
    } catch(e) {
      setMessages(prev => [...prev, { role:'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      <PageTitle title="Campaign Assistant" description="AI-powered campaign planning assistant for Nigerian media buying."/>
      <Layout title="Campaign Assistant" subtitle="Media Intelligence">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 440px', gap:0, height:'calc(100vh - 120px)', maxHeight:720, border:'1px solid var(--border)' }}>

          {/* Left panel — context */}
          <div style={{ padding:'32px', background:'var(--bg)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom:16 }}>Media Intelligence Layer</div>
              <h2 style={{ fontFamily:'Playfair Display,serif', fontWeight:700, fontStyle:'italic', fontSize:26, lineHeight:1.2, color:'var(--text)', marginBottom:14, letterSpacing:'-0.4px' }}>
                Your campaign<br/>strategy partner.
              </h2>
              <p style={{ fontSize:12, color:'var(--text3)', lineHeight:1.8, maxWidth:320 }}>
                Ask about media mix, budgets, audience reach, Nigerian market context, or any campaign strategy question. The assistant knows every provider on BrandCasta.
              </p>

              <div style={{ marginTop:28, borderTop:'1px solid var(--border)', paddingTop:20 }}>
                <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text4)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:12 }}>
                  Suggested Questions
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {SUGGESTED.map((q,i) => (
                    <button key={i} onClick={() => send(q)}
                      className="suggest-btn"
                      style={{ textAlign:'left', padding:'8px 12px', background:'none', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.28)', fontSize:11, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", lineHeight:1.5, transition:'all 0.15s', borderLeft:'2px solid transparent', display:'block', width:'100%' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
              <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text4)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Platform Stats</div>
              <div style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:22, color:'var(--amber)', letterSpacing:'-0.5px' }}>184+</div>
              <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--text3)' }}>verified Nigerian media providers</div>
            </div>
          </div>

          {/* Right panel — chat */}
          <div style={{ display:'flex', flexDirection:'column', background:'var(--bg2)', height:'100%' }}>

            {/* Chat header */}
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 6px var(--green)', flexShrink:0, animation:'pulse 2s infinite' }}/>
              <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--text)', letterSpacing:'0.1em', textTransform:'uppercase', flex:1 }}>Campaign Assistant</div>
              <button onClick={() => setMessages([{ role:'assistant', content:'Conversation cleared. How can I help you plan your next campaign?' }])}
                style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', background:'none', border:'none', cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                Clear
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:'20px' }}>
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity:0, y:8 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
                    style={{ marginBottom:20 }}>
                    {msg.role === 'assistant' ? (
                      <div style={{ borderLeft:'2px solid var(--amber)', paddingLeft:14 }}>
                        <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, color:'var(--amber)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:6 }}>
                          Assistant
                        </div>
                        <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:11, color:'var(--text2)', lineHeight:1.85, whiteSpace:'pre-wrap' }}>
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div style={{ paddingLeft:14 }}>
                        <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, color:'var(--text3)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:6 }}>
                          You
                        </div>
                        <div style={{ fontSize:12, color:'var(--text)', lineHeight:1.7 }}>
                          {msg.content}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {loading && (
                <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                  style={{ borderLeft:'2px solid var(--amber-border)', paddingLeft:14, marginBottom:16 }}>
                  <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, color:'var(--amber)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8, opacity:0.5 }}>
                    Assistant
                  </div>
                  <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:5, height:5, borderRadius:'50%', background:'var(--amber)',
                        animation:'typingPulse 1.2s infinite', animationDelay:`${i*0.2}s` }}/>
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef}/>
            </div>

            {/* Input */}
            <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
              <div className="input-bar">
                <input ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Ask about media, budgets, or campaign strategy…"
                  style={{ flex:1, background:'none', border:'none', fontSize:12, color:'var(--text)', fontFamily:'DM Sans,sans-serif', outline:'none' }}/>
                <button onClick={() => send()} disabled={!input.trim() || loading}
                  style={{ background:'none', border:'none', color: input.trim() && !loading ? 'var(--amber)' : 'var(--text4)', fontSize:16, cursor:'pointer', transition:'color 0.2s', fontFamily:'monospace', padding:0 }}>
                  →
                </button>
              </div>
              <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, color:'var(--text4)', marginTop:8, letterSpacing:'0.06em' }}>
                ENTER to send · Powered by Gemini via BrandCasta
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
          @keyframes typingPulse { 0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1)} }
          .input-bar { display:flex; align-items:center; gap:10px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px; transition:border-color 0.2s; }
          .input-bar:focus-within { border-bottom-color: #D4A843; }
          .suggest-btn:hover { border-left-color:#D4A843 !important; color:rgba(255,255,255,0.55) !important; background:rgba(212,168,67,0.08) !important; }
        `}</style>
      </Layout>
    </>
  );
}