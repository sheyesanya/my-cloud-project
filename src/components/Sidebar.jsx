import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOGO = '/favicon.png';

const CLIENT_NAV = [
  { label:'Dashboard',           to:'/dashboard'        },
  { label:'New Campaign',        to:'/create-booking'   },
  { label:'My Campaigns',        to:'/campaigns'        },
  { label:'My Bookings',         to:'/bookings'         },
  { label:'Media Inventory',     to:'/media'            },
  { label:'Analytics',           to:'/analytics'        },
  { label:'Brief Generator',     to:'/brief-generator'  },
  { label:'AI Assistant',        to:'/assistant'        },
  { label:'Proof of Performance',to:'/proof'            },
  { label:'Social & Music',      to:'/social-media'     },
  { label:'Subscription',        to:'/subscription'     },
];
const PROVIDER_NAV = [
  { label:'My Bookings',         to:'/provider'         },
  { label:'Proof of Performance',to:'/proof'            },
];
const ADMIN_NAV = [
  { label:'Admin Dashboard',     to:'/dashboard'        },
  { label:'Applications',        to:'/applications'     },
  { label:'Media',               to:'/media'            },
  { label:'Create Booking',      to:'/create-booking'   },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = (user?.role||'CLIENT').toUpperCase();
  const nav  = role==='ADMIN' ? ADMIN_NAV : role==='PROVIDER' ? PROVIDER_NAV : CLIENT_NAV;

  const handleLogout = async () => { await logout(); navigate('/'); };

  const Inner = () => (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'white',borderRight:'1px solid #e1e4f0'}}>
      <div style={{padding:'20px',borderBottom:'1px solid #e1e4f0'}}>
        <Link to={role==='PROVIDER'?'/provider':'/dashboard'} style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none'}}>
          <img src={LOGO} alt="BrandCasta" style={{width:26,height:26,objectFit:'contain'}}/>
          <div>
            <div style={{display:'flex'}}>
              <span style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:13,color:'#131b2e'}}>Brand</span>
              <span style={{fontFamily:'Manrope,sans-serif',fontWeight:800,fontSize:13,color:'#4d50d6'}}>Casta</span>
            </div>
            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:8,textTransform:'uppercase',letterSpacing:'0.14em',color:'#464554',marginTop:1}}>{role}</div>
          </div>
        </Link>
      </div>
      <nav style={{flex:1,padding:'8px 0',overflowY:'auto'}}>
        {nav.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to}
              onClick={()=>setMobileOpen?.(false)}
              style={{display:'flex',alignItems:'center',padding:'10px 20px',fontFamily:'IBM Plex Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.08em',textDecoration:'none',transition:'all 0.15s',borderLeft:active?'2px solid #4338ca':'2px solid transparent',background:active?'#f2f3ff':'transparent',color:active?'#4338ca':'#464554'}}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div style={{padding:'12px 16px',borderTop:'1px solid #e1e4f0'}}>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#464554',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</div>
        <button onClick={handleLogout} style={{width:'100%',padding:'7px',border:'1px solid #e1e4f0',fontFamily:'IBM Plex Mono,monospace',fontSize:9,textTransform:'uppercase',letterSpacing:'0.08em',color:'#464554',background:'transparent',cursor:'pointer'}}>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside style={{width:220,flexShrink:0,height:'100vh',position:'sticky',top:0,display:'none'}} className="md-sidebar">
        <Inner/>
      </aside>
      {mobileOpen && (
        <div style={{position:'fixed',inset:0,zIndex:50}}>
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)'}} onClick={()=>setMobileOpen(false)}/>
          <aside style={{position:'absolute',left:0,top:0,bottom:0,width:240,zIndex:10}}><Inner/></aside>
        </div>
      )}
    </>
  );
}