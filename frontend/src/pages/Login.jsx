import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import HallITLogo from '../components/brand/HallITLogo';
import AuraPageBackground from '../components/common/AuraPageBackground';
import { Activity, ArrowRight, Eye, EyeOff, Fingerprint, Lock, Moon, ShieldCheck, Sun, User, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const success = await login(username.trim(), password);
      if (success) window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F7FC] px-4 py-8 text-slate-900 transition-colors duration-300 dark:bg-[#080D18] dark:text-white sm:px-6 lg:px-8">
      <AuraPageBackground />

      <button type="button" onClick={toggleDarkMode} aria-label={darkMode ? 'Activar tema claro' : 'Activar tema oscuro'} title={darkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'} className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-[#111827] dark:text-slate-300 dark:hover:border-blue-400/40 sm:right-6 sm:top-6">
        {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
      </button>

      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_28px_100px_-35px_rgba(15,23,42,.3)] transition-colors duration-300 dark:border-white/[0.09] dark:bg-[#0D1423] dark:shadow-[0_28px_100px_-35px_rgba(0,0,0,.9)] lg:min-h-[620px] lg:grid-cols-[1.04fr_.96fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden border-r border-slate-200/80 bg-slate-50 p-10 dark:border-white/[0.07] dark:bg-[#0A101D] lg:flex xl:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-20 h-80 w-80 rounded-full border border-blue-500/15" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 top-36 h-48 w-48 rounded-full border border-violet-500/15" />
          <div className="relative z-10">
            <HallITLogo darkMode={darkMode} showSlogan />
            <div className="mb-4 mt-16 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-blue-600 dark:text-blue-400">
              <span className="h-px w-7 bg-gradient-to-r from-blue-500 to-violet-500" /> Workspace · Acceso seguro
            </div>
            <h1 className="max-w-md text-4xl font-bold leading-[1.13] tracking-tight text-slate-900 dark:text-white xl:text-[2.8rem]">
              Todo tu soporte IT.
              <span className="mt-2 block bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">Bajo control.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-400">Gestiona equipos, incidencias y operaciones desde un único espacio de trabajo, diseñado para mantener tu infraestructura organizada.</p>
            <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
              <Feature icon={Activity} title="Operaciones" detail="Seguimiento centralizado" darkMode={darkMode} />
              <Feature icon={Fingerprint} title="Acceso protegido" detail="Solo personal autorizado" darkMode={darkMode} />
            </div>
          </div>
          <div className="relative z-10 mt-12 flex items-center justify-between border-t border-slate-200 pt-5 dark:border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,.55)]" /> Tu soporte, siempre activo.</div>
            <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400 dark:text-slate-600">ITSM</span>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-10 xl:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-10 lg:hidden"><HallITLogo darkMode={darkMode} compact showSlogan /></div>
            <div className="mb-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-violet-500/10 text-blue-600 dark:text-blue-300"><Lock size={21} strokeWidth={1.8} /></div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.22em] text-blue-600 dark:text-blue-400">Área restringida</p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[1.8rem]">Bienvenido de nuevo</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Ingresa tus credenciales para acceder al espacio de trabajo.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-username" className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">Usuario</label>
                <div className="group relative">
                  <User size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                  <input id="login-username" type="text" name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#080D18] dark:text-white dark:hover:border-white/20" placeholder="Tu nombre de usuario" required autoFocus />
                </div>
              </div>
              <div>
                <label htmlFor="login-password" className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">Contraseña</label>
                <div className="group relative">
                  <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                  <input id="login-password" type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#080D18] dark:text-white dark:hover:border-white/20" placeholder="Introduce tu contraseña" required />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:hover:text-slate-200">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </div>
              {error && <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] px-3.5 py-3 text-sm text-rose-600 dark:text-rose-300"><ShieldCheck size={17} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
              <button type="submit" disabled={loading} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-[0_8px_26px_-10px_rgba(59,130,246,.85)] transition duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <><Loader2 size={17} className="animate-spin" /> Verificando acceso...</> : <>Iniciar sesión <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" /></>}
              </button>
              <div className="flex items-center justify-center gap-2 pt-1 text-center text-[11px] text-slate-500"><Lock size={12} /> Acceso exclusivo para personal autorizado</div>
            </form>
            <div className="mt-9 border-t border-slate-200 pt-5 text-center dark:border-white/[0.07]"><p className="text-[10px] font-medium uppercase tracking-[.16em] text-slate-400 dark:text-slate-600">Hall-IT <span className="mx-1.5">·</span> Tu soporte, siempre activo.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, title, detail, darkMode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 transition-colors dark:border-white/[0.07] dark:bg-white/[0.025]">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/15 bg-gradient-to-br from-blue-500/10 to-violet-500/10 text-blue-600 dark:text-blue-400"><Icon size={18} strokeWidth={1.8} /></div>
    <p className={`text-xs font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{title}</p>
    <p className="mt-1 text-[11px] leading-5 text-slate-500">{detail}</p>
  </div>;
}
