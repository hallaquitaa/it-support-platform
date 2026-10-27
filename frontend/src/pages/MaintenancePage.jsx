import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, ClipboardList, Plus, Search, Trash2, Wrench, X } from 'lucide-react';
import api from '../services/api';
import maintenanceService from '../services/maintenanceService';

const emptyForm = { hardware_id: '', title: '', scheduled_date: '', type: 'preventive' };
const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export default function MaintenancePage() {
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [hardware, setHardware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('schedule');
  const [showForm, setShowForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [logForm, setLogForm] = useState({ hardware_id: '', scheduled_maintenance_id: '', description: '' });
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [scheduled, history, equipment] = await Promise.all([
        maintenanceService.getAll(), maintenanceService.getLogs(), api.get('/hardware')
      ]);
      setItems(Array.isArray(scheduled) ? scheduled : []);
      setLogs(Array.isArray(history) ? history : []);
      setHardware(Array.isArray(equipment.data) ? equipment.data : []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo cargar el módulo. Comprueba la conexión e inténtalo de nuevo.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const source = tab === 'schedule' ? items : logs;
    if (!q) return source;
    return source.filter(x => [x.title, x.description, x.brand_model, x.serial_number, x.branch_name, x.hardware_type].some(v => String(v || '').toLowerCase().includes(q)));
  }, [items, logs, query, tab]);

  const saveSchedule = async (e) => {
    e.preventDefault();
    try {
      await maintenanceService.create({ ...form, hardware_id: form.hardware_id || null });
      setShowForm(false); setForm(emptyForm); await load();
    } catch (e) { setError(e.response?.data?.error || 'No se pudo programar el mantenimiento.'); }
  };

  const saveLog = async (e) => {
    e.preventDefault();
    try {
      await maintenanceService.createLog({ ...logForm, hardware_id: logForm.hardware_id || null, scheduled_maintenance_id: logForm.scheduled_maintenance_id || null });
      setShowLogForm(false); setLogForm({ hardware_id: '', scheduled_maintenance_id: '', description: '' }); await load();
    } catch (e) { setError(e.response?.data?.error || 'No se pudo registrar la intervención.'); }
  };

  const remove = async (item) => {
    if (!window.confirm(`¿Eliminar la programación "${item.title}"?`)) return;
    try { await maintenanceService.delete(item.id); await load(); }
    catch (e) { setError(e.response?.data?.error || 'No se pudo eliminar.'); }
  };

  const stat = (label, value, Icon) => <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">{label}</span><Icon size={18} className="text-slate-400" /></div><div className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{value}</div></div>;

  return <main className="min-h-[calc(100vh-64px)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:p-7">
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><Wrench size={14}/> Operaciones IT</div><h1 className="text-3xl font-semibold tracking-tight">Mantenimiento</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Programa mantenimientos y conserva el historial de intervenciones.</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={() => setShowLogForm(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900"><ClipboardList size={16}/> Registrar intervención</button><button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"><Plus size={16}/> Programar</button></div>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">{stat('Programados', items.length, CalendarClock)}{stat('Pendientes', items.filter(x => x.status === 'pending').length, Wrench)}{stat('Intervenciones', logs.length, CheckCircle2)}</div>
      {error && <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-950"><button onClick={() => setTab('schedule')} className={`rounded-lg px-3 py-2 text-sm ${tab === 'schedule' ? 'bg-white font-semibold shadow-sm dark:bg-slate-800' : 'text-slate-500'}`}>Programación</button><button onClick={() => setTab('history')} className={`rounded-lg px-3 py-2 text-sm ${tab === 'history' ? 'bg-white font-semibold shadow-sm dark:bg-slate-800' : 'text-slate-500'}`}>Historial</button></div>
          <div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar equipo o actividad..." className={`${fieldClass} pl-9`}/></div>
        </div>
        {loading ? <div className="p-12 text-center text-sm text-slate-500">Cargando mantenimiento...</div> : filtered.length === 0 ? <div className="p-12 text-center"><CalendarClock className="mx-auto mb-3 text-slate-400" size={30}/><p className="font-medium">No hay registros para mostrar</p><p className="mt-1 text-sm text-slate-500">Añade una programación o registra una intervención.</p></div> : tab === 'schedule' ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{filtered.map(x => <article key={x.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 gap-3"><div className="mt-0.5 rounded-xl border border-slate-200 p-2.5 dark:border-slate-700"><Wrench size={18}/></div><div className="min-w-0"><h3 className="font-medium">{x.title}</h3><p className="mt-1 text-sm text-slate-500">{[x.hardware_type, x.brand_model, x.serial_number && `S/N ${x.serial_number}`].filter(Boolean).join(' · ') || 'Sin equipo asociado'}</p><p className="mt-1 text-xs text-slate-400">{x.branch_name || 'Sucursal sin especificar'} · {x.type === 'preventive' ? 'Preventivo' : 'Correctivo'} · {x.scheduled_date}</p></div></div><div className="flex items-center gap-3"><span className={`rounded-full border px-2.5 py-1 text-xs ${x.status === 'completed' ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300' : 'border-amber-300 text-amber-700 dark:text-amber-300'}`}>{x.status === 'completed' ? 'Completado' : x.status === 'in_progress' ? 'En curso' : 'Pendiente'}</span><button title="Eliminar programación" onClick={() => remove(x)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"><Trash2 size={16}/></button></div></article>)}</div> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{filtered.map(x => <article key={x.id} className="flex gap-3 p-4"><div className="mt-0.5 rounded-xl border border-slate-200 p-2.5 dark:border-slate-700"><CheckCircle2 size={18}/></div><div><h3 className="font-medium">{x.description}</h3><p className="mt-1 text-sm text-slate-500">{[x.hardware_type, x.brand_model, x.serial_number && `S/N ${x.serial_number}`].filter(Boolean).join(' · ') || 'Sin equipo asociado'}</p><p className="mt-1 text-xs text-slate-400">{x.performed_date || 'Fecha no disponible'}</p></div></article>)}</div>}
      </section>
    </div>
    {showForm && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={saveSchedule} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">Programar mantenimiento</h2><button type="button" onClick={() => setShowForm(false)}><X size={20}/></button></div><div className="space-y-4"><label className="block text-sm">Actividad<input required value={form.title} onChange={e => setForm({...form,title:e.target.value})} className={`${fieldClass} mt-1`} placeholder="Ej. Limpieza preventiva"/></label><label className="block text-sm">Equipo<select value={form.hardware_id} onChange={e => setForm({...form,hardware_id:e.target.value})} className={`${fieldClass} mt-1`}><option value="">Sin equipo asociado</option>{hardware.map(h => <option key={h.id} value={h.id}>{[h.type,h.brand_model,h.serial_number && `· ${h.serial_number}`].filter(Boolean).join(' ')}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm">Fecha<input required type="date" value={form.scheduled_date} onChange={e => setForm({...form,scheduled_date:e.target.value})} className={`${fieldClass} mt-1`}/></label><label className="block text-sm">Tipo<select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className={`${fieldClass} mt-1`}><option value="preventive">Preventivo</option><option value="corrective">Correctivo</option></select></label></div></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Cancelar</button><button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900">Guardar programación</button></div></form></div>}
    {showLogForm && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={saveLog} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">Registrar intervención</h2><button type="button" onClick={() => setShowLogForm(false)}><X size={20}/></button></div><div className="space-y-4"><label className="block text-sm">Equipo<select value={logForm.hardware_id} onChange={e => setLogForm({...logForm,hardware_id:e.target.value})} className={`${fieldClass} mt-1`}><option value="">Sin equipo asociado</option>{hardware.map(h => <option key={h.id} value={h.id}>{[h.type,h.brand_model,h.serial_number].filter(Boolean).join(' · ')}</option>)}</select></label><label className="block text-sm">Programación relacionada<select value={logForm.scheduled_maintenance_id} onChange={e => setLogForm({...logForm,scheduled_maintenance_id:e.target.value})} className={`${fieldClass} mt-1`}><option value="">Ninguna</option>{items.filter(x => x.status !== 'completed').map(x => <option key={x.id} value={x.id}>{x.title}</option>)}</select></label><label className="block text-sm">Trabajo realizado<textarea required rows={4} value={logForm.description} onChange={e => setLogForm({...logForm,description:e.target.value})} className={`${fieldClass} mt-1`} placeholder="Describe la intervención, hallazgos y acciones realizadas..."/></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShowLogForm(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Cancelar</button><button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900">Guardar intervención</button></div></form></div>}
  </main>;
}
