import { useCallback, useMemo, useState } from 'react';
import { Check, Copy, RefreshCw, ShieldCheck, X } from 'lucide-react';

const GROUPS = {
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lower: 'abcdefghijkmnopqrstuvwxyz',
  numbers: '23456789',
  symbols: '!@#$%^&*()-_=+[]{}:,.?',
};

function secureIndex(max) {
  if (!window.crypto?.getRandomValues) {
    throw new Error('Este navegador no dispone de un generador criptográfico seguro.');
  }

  const range = 256;
  const ceiling = Math.floor(range / max) * max;
  const buffer = new Uint8Array(1);

  do {
    window.crypto.getRandomValues(buffer);
  } while (buffer[0] >= ceiling);

  return buffer[0] % max;
}

function secureShuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = secureIndex(index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function generatePassword(length, enabledGroups) {
  const groups = Object.keys(GROUPS).filter((key) => enabledGroups[key]);
  if (!groups.length) throw new Error('Selecciona al menos un conjunto de caracteres.');
  if (length < groups.length) throw new Error('Aumenta la longitud para incluir todos los conjuntos seleccionados.');

  const characters = groups.map((key) => GROUPS[key]);
  const allCharacters = characters.join('');
  const result = characters.map((group) => group[secureIndex(group.length)]);

  while (result.length < length) {
    result.push(allCharacters[secureIndex(allCharacters.length)]);
  }

  return secureShuffle(result).join('');
}

function evaluateStrength(password) {
  if (!password) return { label: 'Sin generar', score: 0, color: 'bg-slate-400' };

  let score = 0;
  if (password.length >= 12) score += 30;
  if (password.length >= 16) score += 15;
  if (/[a-z]/.test(password)) score += 12;
  if (/[A-Z]/.test(password)) score += 12;
  if (/\d/.test(password)) score += 12;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  if (!/(.)\1{3,}/.test(password)) score += 4;

  const finalScore = Math.min(score, 100);
  if (finalScore >= 85) return { label: 'Muy fuerte', score: finalScore, color: 'bg-emerald-500' };
  if (finalScore >= 65) return { label: 'Fuerte', score: finalScore, color: 'bg-indigo-500' };
  if (finalScore >= 45) return { label: 'Media', score: finalScore, color: 'bg-amber-500' };
  return { label: 'Débil', score: finalScore, color: 'bg-rose-500' };
}

const toggleClass = 'flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300';

export default function PasswordGeneratorPanel({ onUse, onClose }) {
  const [length, setLength] = useState(20);
  const [groups, setGroups] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const strength = useMemo(() => evaluateStrength(password), [password]);

  const handleGenerate = useCallback(() => {
    setError('');
    setCopied(false);
    try {
      setPassword(generatePassword(length, groups));
    } catch (generationError) {
      setError(generationError.message);
    }
  }, [groups, length]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setError('No se pudo copiar. Verifica los permisos del navegador.');
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="password-generator-title" className="aura-panel w-full max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-[#111827]">
        <header className="flex items-center justify-between border-b border-slate-200/70 p-5 dark:border-white/[0.07]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/15 bg-indigo-500/[0.07] text-indigo-600 dark:text-indigo-300"><ShieldCheck size={19} /></span>
            <div>
              <h2 id="password-generator-title" className="text-base font-semibold text-slate-900 dark:text-white">Generador de contraseñas</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Aleatoriedad criptográfica del navegador</p>
            </div>
          </div>
          <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06]" onClick={onClose} aria-label="Cerrar generador"><X size={17} /></button>
        </header>

        <div className="space-y-5 p-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-[#0b1220]">
            <div className="flex items-center justify-between gap-3">
              <code className="min-w-0 flex-1 break-all text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">{password || 'Genera una contraseña segura'}</code>
              <button type="button" onClick={handleCopy} disabled={!password} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-indigo-600 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300" aria-label="Copiar contraseña"><Copy size={15} /></button>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Fortaleza estimada</span><strong className="font-semibold">{strength.label}</strong>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className={`h-full rounded-full transition-[width] duration-200 ${strength.color}`} style={{ width: `${strength.score}%` }} /></div>
            {copied && <p className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-300"><Check size={12} />Copiada al portapapeles</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300"><label htmlFor="vault-password-length">Longitud</label><span className="font-mono">{length} caracteres</span></div>
            <input id="vault-password-length" type="range" min="12" max="64" value={length} onChange={(event) => setLength(Number(event.target.value))} className="w-full accent-indigo-500" />
            <div className="mt-1 flex justify-between text-[10px] text-slate-400"><span>12</span><span>64</span></div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              ['upper', 'Mayúsculas (A-Z)'],
              ['lower', 'Minúsculas (a-z)'],
              ['numbers', 'Números (0-9)'],
              ['symbols', 'Símbolos'],
            ].map(([key, label]) => (
              <label key={key} className={toggleClass}>
                <input type="checkbox" checked={groups[key]} onChange={(event) => setGroups((current) => ({ ...current, [key]: event.target.checked }))} className="accent-indigo-500" />
                {label}
              </label>
            ))}
          </div>

          {error && <p role="alert" className="text-xs text-rose-600 dark:text-rose-300">{error}</p>}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={handleGenerate} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500"><RefreshCw size={14} />Generar otra</button>
            <button type="button" disabled={!password} onClick={() => onUse(password)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07] px-4 py-2.5 text-xs font-semibold text-indigo-700 disabled:opacity-40 dark:text-indigo-200"><Check size={14} />Usar en credencial</button>
          </div>
        </div>
      </section>
    </div>
  );
}
