import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckSquare,
  Code2,
  Home,
  KeyRound,
  LogOut,
  Moon,
  Search,
  Server,
  Sun,
  Wifi,
  Command,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const modules = [
  { name: 'Dashboard', number: '01', label: 'CENTRO DE MANDO', description: 'Resumen de la operación, actividad y prioridades del equipo.', path: '/', icon: Home, tone: 'indigo', layout: 'xl:col-span-3 min-h-[190px]' },
  { name: 'Sucursales', number: '02', label: 'INFRAESTRUCTURA', description: 'Sedes, ubicaciones y organización del soporte.', path: '/branches', icon: Building2, tone: 'amber', layout: 'xl:col-span-3 min-h-[190px]' },
  { name: 'Bóveda', number: '03', label: 'ACCESO SEGURO', description: 'Credenciales y accesos protegidos en un solo lugar.', path: '/vault', icon: KeyRound, tone: 'cyan', layout: 'xl:col-span-3 min-h-[190px]' },
  { name: 'Tareas', number: '04', label: 'PRODUCTIVIDAD', description: 'Pendientes, fechas límite, subtareas y progreso.', path: '/tasks', icon: CheckSquare, tone: 'indigo', layout: 'xl:col-span-3 min-h-[190px]' },
  { name: 'Inventario', number: '05', label: 'ACTIVOS IT', description: 'Equipos informáticos y control de activos.', path: '/inventory', icon: Server, tone: 'emerald', layout: 'xl:col-span-3 min-h-[190px]' },
  { name: 'Mantenimiento', number: '06', label: 'PLANIFICACIÓN', description: 'Un punto de acceso para las rutinas de mantenimiento.', path: '/maintenance', icon: CalendarDays, tone: 'amber', layout: 'xl:col-span-3 min-h-[190px]' },
  { name: 'Remote Access', number: '07', label: 'CONECTIVIDAD', description: 'Directorio de equipos y accesos de asistencia remota.', path: '/remote', icon: Wifi, tone: 'cyan', layout: 'xl:col-span-3 min-h-[190px]' },
  { name: 'Snippets', number: '08', label: 'HERRAMIENTAS', description: 'Biblioteca de comandos y fragmentos reutilizables.', path: '/snippets', icon: Code2, tone: 'slate', layout: 'xl:col-span-3 min-h-[190px]' },
];

const toneStyles = {
  indigo: { icon: 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-400/25 dark:bg-indigo-400/10 dark:text-indigo-300', dot: 'bg-indigo-400', label: 'text-indigo-600 dark:text-indigo-300', hover: 'group-hover:border-indigo-300 dark:group-hover:border-indigo-400/40' },
  amber: { icon: 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300', dot: 'bg-amber-400', label: 'text-amber-700 dark:text-amber-300', hover: 'group-hover:border-amber-300 dark:group-hover:border-amber-400/40' },
  cyan: { icon: 'border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-300', dot: 'bg-cyan-400', label: 'text-cyan-700 dark:text-cyan-300', hover: 'group-hover:border-cyan-300 dark:group-hover:border-cyan-400/40' },
  emerald: { icon: 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300', dot: 'bg-emerald-400', label: 'text-emerald-700 dark:text-emerald-300', hover: 'group-hover:border-emerald-300 dark:group-hover:border-emerald-400/40' },
  slate: { icon: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300', dot: 'bg-slate-400', label: 'text-slate-600 dark:text-slate-300', hover: 'group-hover:border-slate-300 dark:group-hover:border-slate-400/40' },
};

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
  }, [user, loading, navigate]);

  const visibleModules = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return modules;
    return modules.filter((module) => `${module.name} ${module.label} ${module.description}`.toLocaleLowerCase().includes(query));
  }, [search]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-[#0b0d12] dark:text-slate-400"><span className="font-mono text-xs tracking-[0.18em]">INICIANDO IT SUPPORT PLATFORM...</span></div>;
  }
  if (!user) return null;

  const displayName = user?.full_name || user?.username || 'Administrador';
  const initial = String(displayName).trim().charAt(0).toUpperCase() || 'A';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f6fb] text-slate-800 transition-colors duration-300 dark:bg-[#0b0d12] dark:text-slate-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-44 h-[520px] w-[520px] rounded-full bg-indigo-300/15 blur-3xl dark:bg-indigo-500/[0.08]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-40 h-[460px] w-[460px] rounded-full bg-cyan-300/10 blur-3xl dark:bg-cyan-500/[0.05]" />

      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0d1017]/90">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-400/25 dark:bg-indigo-400/10 dark:text-indigo-300"><Command size={20} strokeWidth={1.7} /></div>
            <div className="min-w-0"><p className="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">Centro de Mando IT</p><p className="mt-0.5 font-mono text-[9px] tracking-[0.2em] text-slate-500 dark:text-slate-400 sm:text-[10px]">IT SUPPORT PLATFORM <span className="text-indigo-500">/ WORKSPACE</span></p></div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => navigate('/profile')} title="Abrir perfil de usuario" className="hidden items-center gap-2 border-r border-slate-200 pr-3 text-left dark:border-white/10 sm:flex"><div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">{initial}</div><div><p className="text-[10px] text-slate-500 dark:text-slate-400">Usuario</p><p className="max-w-[150px] truncate text-xs font-medium text-slate-800 dark:text-slate-100">{displayName}</p></div></button>
            <button type="button" onClick={toggleDarkMode} title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-indigo-400/50 dark:hover:text-indigo-300">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button type="button" onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión" className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-400/20 dark:bg-rose-400/[0.07] dark:text-rose-300 dark:hover:bg-rose-400/[0.14]"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 pb-4 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pt-5">
        <section className="mb-4 flex flex-col justify-between gap-3 sm:mb-4 sm:flex-row sm:items-end">
          <div><div className="mb-1.5 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.10)]" /><p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-indigo-600 dark:text-indigo-300">ACCESO A HERRAMIENTAS</p></div><h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white sm:text-[30px]">Módulos de trabajo<span className="text-indigo-500">.</span></h1><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Cada herramienta, a un paso de distancia.</p></div>
          <label className="flex h-9 w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white/90 px-3.5 text-slate-400 shadow-sm transition focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:focus-within:border-indigo-400/40 sm:w-[260px]"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar módulo..." aria-label="Buscar módulo" className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500" /></label>
        </section>

        <section aria-label="Módulos de la plataforma" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12 xl:gap-3">
          {visibleModules.map((module) => {
            const Icon = module.icon;
            const tone = toneStyles[module.tone];
            const featured = module.name === 'Dashboard';
            return <button key={module.name} type="button" onClick={() => navigate(module.path)} aria-label={`Abrir módulo ${module.name}`} className={`group relative flex w-full flex-col overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f6fb] dark:focus-visible:ring-offset-[#0b0d12] sm:p-4 ${module.layout} ${featured ? 'border-indigo-200/90 bg-gradient-to-br from-white via-white to-indigo-50/70 shadow-[0_8px_28px_rgba(49,65,120,0.07)] hover:shadow-[0_16px_36px_rgba(49,65,120,0.12)] dark:border-indigo-400/25 dark:from-[#171b28] dark:via-[#121620] dark:to-indigo-950/25 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:hover:border-indigo-400/40' : `border-slate-200/90 bg-white/90 shadow-[0_3px_12px_rgba(20,30,50,0.035)] hover:shadow-[0_14px_30px_rgba(20,30,50,0.08)] dark:border-white/[0.09] dark:bg-[#11151d]/95 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] dark:hover:border-white/[0.16]`} ${tone.hover}`}>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90 dark:via-white/10" />
              <div className="flex items-start justify-between gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-[1.04] ${tone.icon}`}><Icon size={21} strokeWidth={1.6} /></div><div className="flex items-center gap-3"><span className="font-mono text-[10px] tracking-[0.18em] text-slate-400 dark:text-slate-500">{module.number}</span><ArrowUpRight size={18} strokeWidth={1.7} className="text-slate-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-300" /></div></div>
              <div className="mt-auto pt-4"><p className={`font-mono text-[9px] font-semibold tracking-[0.2em] ${tone.label}`}>{module.label}</p><h2 className={`mt-2 font-semibold tracking-tight text-slate-800 dark:text-slate-100 ${featured ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>{module.name}</h2><p className="mt-1.5 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">{module.description}</p></div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-white/[0.07]"><span className="font-mono text-[9px] font-medium tracking-[0.17em] text-slate-400 dark:text-slate-500">ABRIR MÓDULO</span><span className={`h-1.5 w-1.5 rounded-full ${tone.dot} transition-transform duration-300 group-hover:scale-125`} /></div>
            </button>;
          })}
          {visibleModules.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-white/15"><p className="font-medium text-slate-700 dark:text-slate-200">No se encontraron módulos</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Prueba con otro nombre o término de búsqueda.</p></div>}
        </section>

        <footer className="mt-4 flex flex-col gap-2 border-t border-slate-200/80 pt-5 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="font-mono text-[9px] tracking-[0.16em] text-slate-500 dark:text-slate-400">WORKSPACE / {String(visibleModules.length).padStart(2, '0')} MÓDULOS</span></div><p className="text-xs text-slate-400 dark:text-slate-500">Gestión, seguridad y soporte en un solo lugar.</p></footer>
      </main>
    </div>
  );
}
