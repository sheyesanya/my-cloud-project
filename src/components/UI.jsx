/* ─── Spinner ─────────────────────────────────────── */
export function Spinner({ size = 18, className = '', color = 'var(--accent-light)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" className={`animate-spin ${className}`}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── LoadingBlock ────────────────────────────────── */
export function LoadingBlock({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Spinner size={22}/>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{message}</span>
    </div>
  );
}

/* ─── ErrorBlock ──────────────────────────────────── */
export function ErrorBlock({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" fill="none" stroke="#fca5a5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
      </div>
      <div className="text-center">
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Something went wrong</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, maxWidth: 280 }}>{message}</p>
      </div>
      {onRetry && <button onClick={onRetry} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>Try again</button>}
    </div>
  );
}

/* ─── EmptyBlock ──────────────────────────────────── */
export function EmptyBlock({ message = 'Nothing here yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 13h4"/></svg>
      </div>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{message}</span>
    </div>
  );
}

/* ─── StatusBadge ─────────────────────────────────── */
export function StatusBadge({ status }) {
  const s = status?.toUpperCase().replace(' ', '_') || 'PENDING';
  const map = {
    PENDING:                     'badge-pending',
    PENDING_PROVIDER_CONFIRMATION:'badge-pending',
    APPROVED:                    'badge-approved',
    REJECTED:                    'badge-rejected',
    PAID:                        'badge-paid',
    PAYMENT_PENDING:             'badge-pending',
    IN_PROGRESS:                 'badge-in-progress',
    PENDING_REVIEW:              'badge-in-progress',
    COMPLETED:                   'badge-completed',
  };
  const cls = map[s] || 'badge-pending';
  const dots = {
    'badge-pending':'#fcd34d','badge-approved':'#a5b4fc','badge-rejected':'#fca5a5',
    'badge-paid':'#5eead4','badge-in-progress':'#d8b4fe','badge-completed':'#86efac',
  };
  return (
    <span className={cls}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dots[cls], display: 'inline-block' }}/>
      {status?.replaceAll('_', ' ')}
    </span>
  );
}

/* ─── Toast ───────────────────────────────────────── */
export function Toast({ type = 'success', message, onClose }) {
  const styles = {
    success: { bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)',   color: '#86efac' },
    error:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   color: '#fca5a5' },
    info:    { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)',  color: '#a5b4fc' },
  }[type] || {};
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
      style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.color, backdropFilter: 'blur(12px)', animation: 'fadeSlideIn 0.2s ease-out', minWidth: 240 }}
    >
      {message}
      <button onClick={onClose} style={{ marginLeft: 'auto', opacity: 0.6 }}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  );
}

/* ─── StatCard ────────────────────────────────────── */
export function StatCard({ label, value, sub, color = 'purple' }) {
  const colors = {
    purple: { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)',  val: '#a5b4fc' },
    teal:   { bg: 'rgba(20,184,166,0.1)',  border: 'rgba(20,184,166,0.2)',  val: '#5eead4' },
    amber:  { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  val: '#fcd34d' },
    green:  { bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)',   val: '#86efac' },
    coral:  { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   val: '#fca5a5' },
  }[color] || colors.purple;

  return (
    <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{label}</p>
      <p style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 28, color: colors.val, letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

/* ─── SectionHeader ───────────────────────────────── */
export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
        {description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{description}</p>}
      </div>
      {action}
    </div>
  );
}