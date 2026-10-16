/**
 * Hall-IT brand component. Symbol geometry preserved from the original Hall-IT identity package.
 * Usage: <HallITLogo darkMode={darkMode} showSlogan />
 */
export default function HallITLogo({ darkMode = true, compact = false, showSlogan = false, className = '' }) {
  const word = darkMode ? '#F8FAFC' : '#0F172A';
  const muted = darkMode ? '#94A3B8' : '#64748B';
  const size = compact ? 48 : 60;
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Hall-IT" className="shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
  <linearGradient id="hallit-blue" x1="8" y1="5" x2="42" y2="57" gradientUnits="userSpaceOnUse"><stop stopColor="#22D3EE"/><stop offset="0.52" stopColor="#168BFF"/><stop offset="1" stopColor="#3730FF"/></linearGradient>
  <linearGradient id="hallit-violet" x1="38" y1="5" x2="58" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#C026D3"/><stop offset="0.55" stopColor="#7C3AED"/><stop offset="1" stopColor="#4F46E5"/></linearGradient>
</defs>
<path d="M9 17.5C9 16.4 9.6 15.4 10.6 14.8L25.2 6.4V25.5L9 34.8V17.5Z" fill="url(#hallit-blue)"/>
<path d="M9 34.8L25.2 25.5V57.7L10.6 49.2C9.6 48.6 9 47.6 9 46.5V34.8Z" fill="url(#hallit-violet)"/>
<path d="M39 6.4L53.4 14.8C54.4 15.4 55 16.4 55 17.5V34.8L39 25.5V6.4Z" fill="url(#hallit-violet)"/>
<path d="M39 25.5L55 34.8V46.5C55 47.6 54.4 48.6 53.4 49.2L39 57.7V25.5Z" fill="url(#hallit-blue)"/>
<path d="M25.2 25.5L39 33.5V47.1L25.2 39.1V25.5Z" fill="#168BFF"/>
<path d="M25.2 25.5L39 33.5V39.8L25.2 31.8V25.5Z" fill="#22D3EE"/>
      </svg>
      <div className="min-w-0">
        <div className="flex items-baseline whitespace-nowrap leading-none">
          <span className="text-[1.75rem] font-bold tracking-[-0.065em]" style={{ color: word }}>Hall-</span>
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-[1.75rem] font-extrabold tracking-[-0.065em] text-transparent">IT</span>
        </div>
        <p className="mt-1.5 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.23em]" style={{ color: muted }}>IT Support Platform</p>
        {showSlogan && <p className="mt-2 text-xs" style={{ color: muted }}>Tu soporte, siempre activo.</p>}
      </div>
    </div>
  );
}
