import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X, Settings2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Shared AURA dialog shell used by maintenance and snippets.
 * Keep TaskPage's existing implementation independent.
 */
export default function AuraModal({
  open,
  onClose,
  title,
  description,
  icon: Icon = Settings2,
  maxWidthClass = 'max-w-md',
  children,
  zIndexClass = 'z-[1100]',
}) {
  const { darkMode } = useTheme();
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4 ${darkMode ? 'bg-black/20' : 'bg-slate-950/10'} animate-[auraOverlayIn_180ms_ease-out]`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        className={`w-full ${maxWidthClass} max-h-[calc(100vh-48px)] overflow-y-auto overflow-x-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${darkMode ? 'border-gray-700/80 bg-[#111827]/98 shadow-black/40' : 'border-gray-200 bg-white/96 shadow-gray-300/40'} animate-[auraPanelIn_180ms_cubic-bezier(.16,1,.3,1)]`}
      >
        <header className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex min-w-0 items-start gap-3">
            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${darkMode ? 'border-indigo-400/20 bg-indigo-500/10 text-indigo-300' : 'border-indigo-200 bg-indigo-50 text-indigo-600'}`}>
              <Icon size={17} strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className={`text-base font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
              {description && <p className={`mt-1 text-[11px] leading-5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{description}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className={`shrink-0 rounded-lg p-2 transition-colors ${darkMode ? 'text-gray-500 hover:bg-white/5 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
          >
            <X size={16} />
          </button>
        </header>
        {children}
      </section>
    </div>,
    document.body
  );
}
