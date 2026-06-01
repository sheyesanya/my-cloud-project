import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const TYPE_META = {
  BOOKING_REQUEST:     { icon:'📋', color:'var(--amber)',  label:'New Booking'          },
  BOOKING_CONFIRMED:   { icon:'✅', color:'#4ade80',       label:'Booking Confirmed'     },
  BOOKING_REJECTED:    { icon:'✕',  color:'#fca5a5',       label:'Booking Declined'      },
  PAYMENT_RECEIVED:    { icon:'₦',  color:'#4ade80',       label:'Payment Received'      },
  PROOF_SUBMITTED:     { icon:'📎', color:'var(--amber)',  label:'Proof Uploaded'        },
  PROOF_APPROVED:      { icon:'✅', color:'#4ade80',       label:'Proof Approved'        },
  PROOF_REJECTED:      { icon:'⚠', color:'#fca5a5',       label:'Proof Rejected'        },
  PAYOUT_RELEASED:     { icon:'💚', color:'#4ade80',       label:'Payout Released'       },
  APPLICATION_APPROVED:{ icon:'🎉', color:'#5eead4',       label:'Application Approved'  },
  APPLICATION_REJECTED:{ icon:'✕',  color:'#fca5a5',       label:'Application Rejected'  },
  CAMPAIGN_LIVE:       { icon:'▶',  color:'#5eead4',       label:'Campaign Live'         },
  CAMPAIGN_COMPLETED:  { icon:'◎',  color:'#4ade80',       label:'Campaign Completed'    },
  SUBSCRIPTION_ACTIVE: { icon:'◈',  color:'var(--amber)',  label:'Subscription Active'   },
  GENERAL:             { icon:'◉',  color:'var(--text3)',  label:'Notification'          },
};

const timeAgo = (d) => {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 604800) return `${Math.floor(s/86400)}d ago`;
  return new Date(d).toLocaleDateString('en-NG', { day:'2-digit', month:'short' });
};

export default function NotificationBell() {
  const { notifications, unread, markRead, markAllRead, deleteNotification, fetchNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const [tab, setTab]   = useState('all');
  const ref             = useRef(null);
  const navigate        = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = tab === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const handleClick = async (n) => {
    if (!n.read) await markRead(n.id);
    if (n.link) { navigate(n.link); setOpen(false); }
  };

  return (
    <div ref={ref} style={{ position:'relative', flexShrink:0 }}>

      {/* Bell button */}
      <button onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        style={{ position:'relative', background:'none', border:'1px solid var(--border)', width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'border-color 0.15s', color:'var(--text3)', fontSize:15 }}
        onMouseEnter={e => e.currentTarget.style.borderColor='var(--amber-border)'}
        onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
        aria-label="Notifications">
        🔔
        {unread > 0 && (
          <motion.span initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:500, damping:20 }}
            style={{ position:'absolute', top:-4, right:-4, minWidth:16, height:16, background:'var(--amber)', color:'#0a0a0f', fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:9, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', letterSpacing:0 }}>
            {unread > 99 ? '99+' : unread}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.97 }}
            transition={{ duration:0.2, ease:[0.22,1,0.36,1] }}
            style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:340, maxHeight:480, background:'#111120', border:'1px solid var(--border)', boxShadow:'0 8px 32px rgba(0,0,0,0.5)', zIndex:500, display:'flex', flexDirection:'column', overflow:'hidden' }}>

            {/* Header */}
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div>
                <p style={{ fontFamily:'Manrope,sans-serif', fontWeight:700, fontSize:13, color:'var(--text)' }}>Notifications</p>
                {unread > 0 && <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', marginTop:1 }}>{unread} unread</p>}
              </div>
              {unread > 0 && (
                <button onClick={markAllRead}
                  style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)', background:'none', border:'none', cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase', padding:'3px 8px', transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='var(--amber)'}
                  onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}>
                  Mark all read
                </button>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
              {[['all','All'], ['unread','Unread']].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  style={{ flex:1, padding:'7px', background:'none', border:'none', cursor:'pointer', fontFamily:'IBM Plex Mono,monospace', fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase',
                    color: tab===key ? 'var(--amber)' : 'var(--text3)',
                    borderBottom: tab===key ? '2px solid var(--amber)' : '2px solid transparent',
                    marginBottom:-1, transition:'all 0.15s' }}>
                  {label}{key==='unread' && unread > 0 ? ` (${unread})` : ''}
                </button>
              ))}
            </div>

            {/* List */}
            <div style={{ overflowY:'auto', flex:1 }}>
              {filtered.length === 0 ? (
                <div style={{ padding:'36px 16px', textAlign:'center' }}>
                  <p style={{ fontSize:24, marginBottom:8 }}>🔔</p>
                  <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                    {tab === 'unread' ? 'All caught up!' : 'No notifications yet'}
                  </p>
                </div>
              ) : (
                filtered.map((n, i) => {
                  const meta = TYPE_META[n.type] || TYPE_META.GENERAL;
                  return (
                    <motion.div key={n.id || i}
                      initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.03 }}
                      style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'11px 16px', borderBottom:'1px solid var(--border2)', cursor: n.link ? 'pointer' : 'default', transition:'background 0.15s', background: n.read ? 'transparent' : 'rgba(99,102,241,0.04)', borderLeft:`2px solid ${n.read ? 'transparent' : 'var(--amber)'}` }}
                      onClick={() => handleClick(n)}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background= n.read ? 'transparent' : 'rgba(99,102,241,0.04)'}>

                      {/* Icon */}
                      <div style={{ width:28, height:28, background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0, marginTop:1 }}>
                        {meta.icon}
                      </div>

                      {/* Text */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                          <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, color:meta.color, letterSpacing:'0.1em', textTransform:'uppercase', flexShrink:0 }}>{meta.label}</p>
                          {!n.read && <span style={{ width:5, height:5, background:'var(--amber)', flexShrink:0 }}/>}
                        </div>
                        <p style={{ fontSize:12, color:'var(--text)', lineHeight:1.5, marginBottom:3 }}>{n.message}</p>
                        <p style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--text3)' }}>{timeAgo(n.createdAt)}</p>
                      </div>

                      {/* Delete */}
                      <button onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                        style={{ background:'none', border:'none', color:'var(--text4)', cursor:'pointer', fontSize:12, padding:'2px 4px', flexShrink:0, transition:'color 0.15s', lineHeight:1 }}
                        onMouseEnter={e=>e.currentTarget.style.color='#fca5a5'}
                        onMouseLeave={e=>e.currentTarget.style.color='var(--text4)'}
                        aria-label="Dismiss">✕</button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{ padding:'10px 16px', borderTop:'1px solid var(--border)', flexShrink:0, textAlign:'center' }}>
                <button onClick={() => { navigate('/notifications'); setOpen(false); }}
                  style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'var(--amber)', background:'none', border:'none', cursor:'pointer', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  View all notifications →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}