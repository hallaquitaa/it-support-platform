import { useEffect, useMemo, useState } from 'react';
import {
  Calendar, CheckCircle2, ClipboardList, Plus, Search, Trash2, Wrench, X,
  Pencil, Play, Clock, Laptop, History, AlertCircle, RefreshCw, Check, Settings2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import AuraModal from '../components/common/AuraModal';
import AuraPageBackground from '../components/common/AuraPageBackground';
import api from '../services/api';
import maintenanceService from '../services/maintenanceService';

const emptyForm = { hardware_id: '', title: '', scheduled_date: '', type: 'preventive' };
const emptyLogForm = { hardware_id: '', scheduled_maintenance_id: '', description: '' };

const surface = (darkMode) => darkMode
  ? 'border-white/[0.08] bg-[#111827]/[0.78] shadow-black/20'
  : 'border-slate-200/70 bg-white/[0.76] shadow-slate-300/10';

const mutedText = (darkMode) => darkMode ? 'text-gray-400' : 'text-gray-500';

const fieldClass = (darkMode) => `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 ${darkMode
  ? 'border-gray-700 bg-[#0A101D]/90 text-gray-100 placeholder:text-gray-600 hover:border-gray-600'
  : 'border-gray-200 bg-white/90 text-gray-800 placeholder:text-gray-400 hover:border-gray-300'}`;

const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0';
const secondaryButton = (darkMode) => `inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${darkMode ? 'border-gray-700 bg-gray-900/50 text-gray-300 hover:border-gray-600 hover:bg-white/[0.04] hover:text-white' : 'border-gray-200 bg-white/75 text-gray-700 hover:border-gray-300 hover:bg-white'}`;

const statusMeta = (status, darkMode) => {
  if (status === 'completed') return { label: 'Completado', icon: CheckCircle2, cls: darkMode ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300' : 'border-emerald-200 bg-emerald-50/90 text-emerald-700' };
  if (status === 'in_progress') return { label: 'En curso', icon: Clock, cls: darkMode ? 'border-indigo-400/25 bg-indigo-400/[0.08] text-indigo-300' : 'border-indigo-200 bg-indigo-50/90 text-indigo-700' };
  return { label: 'Pendiente', icon: Calendar, cls: darkMode ? 'border-amber-400/20 bg-amber-400/[0.07] text-amber-300' : 'border-amber-200 bg-amber-50/90 text-amber-700' };
};

const getTodayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const formatDate = (value) => {
  if (!value) return 'Fecha pendiente';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function MaintenancePage() {
  const { darkMode } = useTheme();
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [hardware, setHardware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('schedule');
  const [showForm, setShowForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [logForm, setLogForm] = useState(emptyLogForm);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [scheduled, history, equipment] = await Promise.all([
        maintenanceService.getAll(), maintenanceService.getLogs(), api.get('/hardware'),
      ]);
      setItems(Array.isArray(scheduled) ? scheduled : []);
      setLogs(Array.isArray(history) ? history : []);
      setHardware(Array.isArray(equipment.data) ? equipment.data : []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo cargar el módulo. Comprueba la conexión e inténtalo de nuevo.');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const source = tab === 'schedule' ? items : logs;
    const q = query.trim().toLocaleLowerCase('es');
    if (!q) return source;
    return source.filter((item) => [
      item.title, item.description, item.brand_model, item.serial_number,
      item.branch_name, item.hardware_type, item.scheduled_date, item.performed_date,
    ].some((value) => String(value || '').toLocaleLowerCase('es').includes(q)));
  }, [items, logs, query, tab]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, scheduled_date: getTodayISO() });
    setError('');
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      hardware_id: item.hardware_id ? String(item.hardware_id) : '',
      title: item.title || '',
      scheduled_date: String(item.scheduled_date || '').slice(0, 10),
      type: item.type || 'preventive',
    });
    setError('');
    setShowForm(true);
  };

  const saveSchedule = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, hardware_id: form.hardware_id || null };
      if (editing) await maintenanceService.update(editing.id, payload);
      else await maintenanceService.create(payload);
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      setNotice(editing ? 'La programación se actualizó.' : 'El mantenimiento quedó programado.');
      await load(false);
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo guardar la programación.');
    } finally {
      setSaving(false);
    }
  };

  const saveLog = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await maintenanceService.createLog({
        ...logForm,
        hardware_id: logForm.hardware_id || null,
        scheduled_maintenance_id: logForm.scheduled_maintenance_id || null,
      });
      setShowLogForm(false);
      setLogForm(emptyLogForm);
      setNotice('La intervención se registró en el historial.');
      await load(false);
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo registrar la intervención.');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (item, status) => {
    setError('');
    try {
      await maintenanceService.update(item.id, { status });
      setNotice(status === 'in_progress' ? 'Mantenimiento marcado en curso.' : 'Estado actualizado.');
      await load(false);
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo cambiar el estado.');
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    try {
      await maintenanceService.delete(removeTarget.id);
      setRemoveTarget(null);
      setNotice('Programación eliminada.');
      await load(false);
    } catch (e) {
      setRemoveTarget(null);
      setError(e.response?.data?.error || 'No se pudo eliminar la programación.');
    }
  };

  const statCards = [
    { label: 'Programados', value: items.length, icon: Calendar, detail: 'Plan de mantenimiento', tint: 'text-indigo-400' },
    { label: 'Pendientes', value: items.filter((item) => item.status === 'pending').length, icon: Clock, detail: 'Requieren atención', tint: 'text-amber-400' },
    { label: 'Intervenciones', value: logs.length, icon: CheckCircle2, detail: 'Registradas en historial', tint: 'text-emerald-400' },
  ];

  const closeSchedule = () => { setShowForm(false); setEditing(null); setError(''); };
  const closeLog = () => { setShowLogForm(false); setError(''); };

  return (
    <main className={`relative isolate min-h-[calc(100vh-64px)] overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-[#080D18] text-gray-100' : 'bg-[#F5F7FC] text-gray-900'}`}>
      <AuraPageBackground />
      <div className="relative z-10 mx-auto w-full max-w-[1600px] p-4 sm:p-6 xl:p-8">
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className={`mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
              <span className="h-px w-6 bg-indigo-500" /> Operaciones IT
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-[1.8rem]">Mantenimiento</h1>
            <p className={`mt-1.5 max-w-xl text-sm leading-6 ${mutedText(darkMode)}`}>Programa tareas preventivas, registra intervenciones y consulta el historial de los equipos.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setError(''); setShowLogForm(true); }} className={secondaryButton(darkMode)}><ClipboardList size={15}/> Registrar intervención</button>
            <button type="button" onClick={openCreate} className={primaryButton}><Plus size={15}/> Programar</button>
          </div>
        </header>

        {error && !showForm && !showLogForm && <div role="alert" className={`mb-4 flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${darkMode ? 'border-rose-400/20 bg-rose-400/[0.07] text-rose-200' : 'border-rose-200 bg-rose-50/90 text-rose-700'}`}><AlertCircle size={17} className="mt-0.5 shrink-0"/><span className="flex-1">{error}</span><button onClick={() => setError('')} aria-label="Cerrar alerta"><X size={15}/></button></div>}
        {notice && <div className={`mb-4 flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${darkMode ? 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300' : 'border-emerald-200 bg-emerald-50/80 text-emerald-700'}`}><Check size={14}/><span className="flex-1">{notice}</span><button onClick={() => setNotice('')} aria-label="Cerrar aviso"><X size={14}/></button></div>}

        <section className="mb-5 grid gap-3 sm:grid-cols-3">
          {statCards.map(({ label, value, icon: Icon, detail, tint }) => (
            <article key={label} className={`relative overflow-hidden rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 ${surface(darkMode)}`}>
              <div className="flex items-start justify-between gap-3">
                <div><p className={`text-xs font-medium ${mutedText(darkMode)}`}>{label}</p><p className="mt-2 text-2xl font-bold tracking-tight">{value}</p><p className={`mt-1 text-[10px] ${mutedText(darkMode)}`}>{detail}</p></div>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-900/70' : 'border-gray-200 bg-white/80'} ${tint}`}><Icon size={17}/></span>
              </div>
              <span className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"/>
            </article>
          ))}
        </section>

        <section className={`overflow-hidden rounded-2xl border shadow-xl shadow-gray-900/[0.03] backdrop-blur-xl ${surface(darkMode)}`}>
          <div className={`flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between ${darkMode ? 'border-gray-800/90' : 'border-gray-200/80'}`}>
            <div className={`inline-flex w-fit items-center gap-1 rounded-xl border p-1 ${darkMode ? 'border-gray-800 bg-[#0A101D]/80' : 'border-gray-200 bg-gray-100/75'}`}>
              <button type="button" onClick={() => setTab('schedule')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${tab === 'schedule' ? (darkMode ? 'bg-indigo-500/15 text-indigo-200 shadow-sm' : 'bg-white text-indigo-700 shadow-sm') : mutedText(darkMode)}`}><Calendar size={14}/> Programación <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${tab === 'schedule' ? 'bg-indigo-500/10' : ''}`}>{items.length}</span></button>
              <button type="button" onClick={() => setTab('history')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${tab === 'history' ? (darkMode ? 'bg-indigo-500/15 text-indigo-200 shadow-sm' : 'bg-white text-indigo-700 shadow-sm') : mutedText(darkMode)}`}><History size={14}/> Historial <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${tab === 'history' ? 'bg-indigo-500/10' : ''}`}>{logs.length}</span></button>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72"><Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tab === 'schedule' ? 'Buscar programación...' : 'Buscar intervención...'} className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 ${darkMode ? 'border-gray-700 bg-[#0A101D]/80 text-gray-100 placeholder:text-gray-600' : 'border-gray-200 bg-white/80 text-gray-800 placeholder:text-gray-400'}`}/></div>
              <button type="button" onClick={() => load()} title="Actualizar" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-white/[0.04] hover:text-white' : 'border-gray-200 text-gray-500 hover:bg-white hover:text-indigo-600'}`}><RefreshCw size={14} className={loading ? 'animate-spin' : ''}/></button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-14"><RefreshCw size={22} className="animate-spin text-indigo-400"/><p className={`text-xs ${mutedText(darkMode)}`}>Cargando {tab === 'schedule' ? 'programación' : 'historial'}...</p></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <span className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-900/70 text-gray-500' : 'border-gray-200 bg-white/80 text-gray-400'}`}>{tab === 'schedule' ? <Calendar size={21}/> : <History size={21}/>}</span>
              <p className="text-sm font-semibold">{query ? 'No hay coincidencias' : tab === 'schedule' ? 'Aún no hay mantenimientos programados' : 'El historial está vacío'}</p>
              <p className={`mt-1 max-w-sm text-xs leading-5 ${mutedText(darkMode)}`}>{query ? 'Prueba con otro texto de búsqueda.' : tab === 'schedule' ? 'Programa la primera tarea preventiva o correctiva para empezar.' : 'Las intervenciones registradas se mostrarán aquí.'}</p>
              {!query && tab === 'schedule' && <button type="button" onClick={openCreate} className={`${primaryButton} mt-4`}><Plus size={14}/> Programar mantenimiento</button>}
            </div>
          ) : tab === 'schedule' ? (
            <div className={`divide-y ${darkMode ? 'divide-gray-800/90' : 'divide-gray-200/70'}`}>
              {filtered.map((item) => {
                const meta = statusMeta(item.status, darkMode);
                const StatusIcon = meta.icon;
                return (
                  <article key={item.id} className={`group flex flex-col gap-4 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-5 ${darkMode ? 'hover:bg-white/[0.025]' : 'hover:bg-white/60'}`}>
                    <div className="flex min-w-0 items-start gap-3.5">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${darkMode ? 'border-indigo-400/20 bg-indigo-500/[0.08] text-indigo-300' : 'border-indigo-200 bg-indigo-50/90 text-indigo-600'}`}><Wrench size={18}/></span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><h3 className="break-words text-sm font-semibold">{item.title}</h3><span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.cls}`}><StatusIcon size={11}/>{meta.label}</span></div>
                        <p className={`mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${mutedText(darkMode)}`}><span className="inline-flex items-center gap-1"><Laptop size={12}/>{[item.hardware_type, item.brand_model].filter(Boolean).join(' · ') || 'Sin equipo asociado'}</span>{item.serial_number && <span className="font-mono text-[10px]">S/N {item.serial_number}</span>}</p>
                        <p className={`mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}><span className="inline-flex items-center gap-1"><Calendar size={11}/>{formatDate(item.scheduled_date)}</span><span>·</span><span>{item.type === 'preventive' ? 'Preventivo' : 'Correctivo'}</span><span>·</span><span>{item.branch_name || 'Sucursal sin especificar'}</span></p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 pl-[54px] sm:pl-0">
                      {item.status === 'pending' && <button type="button" onClick={() => changeStatus(item, 'in_progress')} title="Iniciar mantenimiento" className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition ${darkMode ? 'border-indigo-400/20 text-indigo-300 hover:bg-indigo-500/10' : 'border-indigo-200 bg-white/80 text-indigo-700 hover:bg-indigo-50'}`}><Play size={12}/> Iniciar</button>}
                      {item.status !== 'completed' && <button type="button" onClick={() => { setLogForm({ ...emptyLogForm, hardware_id: item.hardware_id ? String(item.hardware_id) : '', scheduled_maintenance_id: String(item.id) }); setError(''); setShowLogForm(true); }} title="Registrar intervención" className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${darkMode ? 'border-gray-700 text-gray-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300' : 'border-gray-200 text-gray-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'}`}><CheckCircle2 size={14}/></button>}
                      <button type="button" onClick={() => openEdit(item)} title="Editar programación" className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-white/[0.05] hover:text-white' : 'border-gray-200 text-gray-500 hover:bg-white hover:text-indigo-600'}`}><Pencil size={14}/></button>
                      <button type="button" onClick={() => setRemoveTarget(item)} title="Eliminar programación" className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${darkMode ? 'border-gray-700 text-gray-500 hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-300' : 'border-gray-200 text-gray-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'}`}><Trash2 size={14}/></button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={`divide-y ${darkMode ? 'divide-gray-800/90' : 'divide-gray-200/70'}`}>
              {filtered.map((item) => (
                <article key={item.id} className={`flex items-start gap-3.5 px-4 py-4 sm:px-5 ${darkMode ? 'hover:bg-white/[0.025]' : 'hover:bg-white/60'}`}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${darkMode ? 'border-emerald-400/20 bg-emerald-500/[0.07] text-emerald-300' : 'border-emerald-200 bg-emerald-50/80 text-emerald-600'}`}><CheckCircle2 size={18}/></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="whitespace-pre-wrap break-words text-sm font-semibold">{item.description}</h3>
                    <p className={`mt-1.5 flex flex-wrap gap-x-2 text-xs ${mutedText(darkMode)}`}><span>{[item.hardware_type, item.brand_model].filter(Boolean).join(' · ') || 'Sin equipo asociado'}</span>{item.serial_number && <span className="font-mono text-[10px]">S/N {item.serial_number}</span>}</p>
                    <p className={`mt-1.5 inline-flex items-center gap-1 text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}><Clock size={11}/>{formatDate(item.performed_date)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
          {!loading && <footer className={`flex items-center justify-between border-t px-4 py-2.5 text-[10px] ${darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}><span>{filtered.length} {tab === 'schedule' ? (filtered.length === 1 ? 'programación' : 'programaciones') : (filtered.length === 1 ? 'intervención' : 'intervenciones')}</span><span className="inline-flex items-center gap-1"><Settings2 size={11}/> Vista filtrada</span></footer>}
        </section>
      </div>

      <AuraModal open={showForm} onClose={closeSchedule} title={editing ? 'Editar programación' : 'Programar mantenimiento'} description="Define el equipo, el tipo y la fecha de la intervención." icon={Calendar} maxWidthClass="max-w-md">
        <form onSubmit={saveSchedule} className="space-y-4 p-5">
          {error && <div role="alert" className={`rounded-xl border px-3 py-2 text-xs ${darkMode ? 'border-rose-400/20 bg-rose-400/[0.07] text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{error}</div>}
          <label className={`block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actividad
            <input required maxLength={180} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={`${fieldClass(darkMode)} mt-2`} placeholder="Ej. Limpieza preventiva de equipos" autoFocus/>
          </label>
          <label className={`block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Equipo
            <select value={form.hardware_id} onChange={(event) => setForm({ ...form, hardware_id: event.target.value })} className={`${fieldClass(darkMode)} mt-2`}><option value="">Sin equipo asociado</option>{hardware.map((item) => <option key={item.id} value={item.id}>{[item.type, item.brand_model, item.serial_number && `· ${item.serial_number}`].filter(Boolean).join(' ')}</option>)}</select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={`block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fecha programada
              <input required type="date" value={form.scheduled_date} onChange={(event) => setForm({ ...form, scheduled_date: event.target.value })} className={`${fieldClass(darkMode)} mt-2`}/>
            </label>
            <label className={`block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tipo
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className={`${fieldClass(darkMode)} mt-2`}><option value="preventive">Preventivo</option><option value="corrective">Correctivo</option></select>
            </label>
          </div>
          <div className={`flex justify-end gap-2 border-t pt-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <button type="button" onClick={closeSchedule} className={secondaryButton(darkMode)}>Cancelar</button>
            <button type="submit" disabled={saving} className={primaryButton}>{saving ? <RefreshCw size={14} className="animate-spin"/> : <Check size={14}/>} {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Programar'}</button>
          </div>
        </form>
      </AuraModal>

      <AuraModal open={showLogForm} onClose={closeLog} title="Registrar intervención" description="Documenta el trabajo realizado y actualiza el seguimiento." icon={ClipboardList} maxWidthClass="max-w-lg">
        <form onSubmit={saveLog} className="space-y-4 p-5">
          {error && <div role="alert" className={`rounded-xl border px-3 py-2 text-xs ${darkMode ? 'border-rose-400/20 bg-rose-400/[0.07] text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{error}</div>}
          <label className={`block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Equipo
            <select value={logForm.hardware_id} onChange={(event) => setLogForm({ ...logForm, hardware_id: event.target.value })} className={`${fieldClass(darkMode)} mt-2`}><option value="">Sin equipo asociado</option>{hardware.map((item) => <option key={item.id} value={item.id}>{[item.type, item.brand_model, item.serial_number && `· ${item.serial_number}`].filter(Boolean).join(' ')}</option>)}</select>
          </label>
          <label className={`block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Programación relacionada
            <select value={logForm.scheduled_maintenance_id} onChange={(event) => setLogForm({ ...logForm, scheduled_maintenance_id: event.target.value })} className={`${fieldClass(darkMode)} mt-2`}><option value="">Ninguna</option>{items.filter((item) => item.status !== 'completed').map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select>
          </label>
          <label className={`block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Trabajo realizado
            <textarea required rows={5} maxLength={5000} value={logForm.description} onChange={(event) => setLogForm({ ...logForm, description: event.target.value })} className={`${fieldClass(darkMode)} mt-2 resize-y leading-6`} placeholder="Describe las acciones realizadas, hallazgos y piezas sustituidas..."/>
          </label>
          <div className={`flex justify-end gap-2 border-t pt-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <button type="button" onClick={closeLog} className={secondaryButton(darkMode)}>Cancelar</button>
            <button type="submit" disabled={saving} className={primaryButton}>{saving ? <RefreshCw size={14} className="animate-spin"/> : <Check size={14}/>} {saving ? 'Guardando...' : 'Guardar intervención'}</button>
          </div>
        </form>
      </AuraModal>

      <AuraModal open={Boolean(removeTarget)} onClose={() => setRemoveTarget(null)} title="Eliminar programación" description="Esta acción no se puede deshacer." icon={Trash2} maxWidthClass="max-w-sm">
        <div className="space-y-4 p-5">
          <p className={`text-sm leading-6 ${mutedText(darkMode)}`}>¿Quieres eliminar <strong className={darkMode ? 'text-gray-100' : 'text-gray-900'}>{removeTarget?.title}</strong>? El historial de intervenciones existente no se elimina.</p>
          <div className={`flex justify-end gap-2 border-t pt-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <button type="button" onClick={() => setRemoveTarget(null)} className={secondaryButton(darkMode)}>Cancelar</button>
            <button type="button" onClick={confirmRemove} className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"><Trash2 size={14}/> Eliminar</button>
          </div>
        </div>
      </AuraModal>
    </main>
  );
}
