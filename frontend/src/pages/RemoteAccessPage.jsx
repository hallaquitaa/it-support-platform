import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Building2,
  Check,
  Copy,
  ExternalLink,
  History,
  Laptop,
  MapPin,
  Monitor,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
  User,
  Wifi,
  X,
} from 'lucide-react';
import AuraPageBackground from '../components/common/AuraPageBackground';
import remoteAccessService from '../services/remoteAccessService';
import api from '../services/api';

const EMPTY_FORM = {
  computer_name: '',
  anydesk_id: '',
  teamviewer_id: '',
  branch_id: '',
  responsible: '',
  department: '',
  location: '',
  priority: 'normal',
  status: 'registered',
  tagsText: '',
  notes: '',
};

const STATUS_OPTIONS = [
  { value: 'registered', label: 'Registrado' },
  { value: 'maintenance', label: 'En mantenimiento' },
  { value: 'retired', label: 'Retirado' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
];

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0b1220]/80 dark:text-slate-100 dark:placeholder:text-slate-500';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/75 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-400/[0.08] dark:hover:text-indigo-200';

function extractRecords(data, keys = []) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return null;
}

function statusLabel(value) {
  return STATUS_OPTIONS.find((item) => item.value === value)?.label || 'Registrado';
}

function priorityLabel(value) {
  return PRIORITY_OPTIONS.find((item) => item.value === value)?.label || 'Normal';
}

function getErrorMessage(error) {
  return error?.response?.data?.error || error?.message || 'Ocurrió un error inesperado.';
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

function StatusPill({ status }) {
  const styles = {
    registered: 'border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-700 dark:text-emerald-300',
    maintenance: 'border-amber-500/20 bg-amber-500/[0.07] text-amber-800 dark:text-amber-200',
    retired: 'border-slate-300 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400',
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${styles[status] || styles.registered}`}>{statusLabel(status)}</span>;
}

function PriorityPill({ priority }) {
  const styles = {
    low: 'text-slate-500 dark:text-slate-400',
    normal: 'text-indigo-600 dark:text-indigo-300',
    high: 'text-amber-700 dark:text-amber-300',
    critical: 'text-rose-700 dark:text-rose-300',
  };
  return <span className={`text-[10px] font-semibold uppercase tracking-wide ${styles[priority] || styles.normal}`}>{priorityLabel(priority)}</span>;
}

export default function RemoteAccessPage() {
  const [computers, setComputers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingComputer, setEditingComputer] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [historyModal, setHistoryModal] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadComputers = useCallback(async () => {
    try {
      const result = await remoteAccessService.getAll();
      const records = extractRecords(result, ['computers', 'items']);
      if (!records) throw new Error('El servidor devolvió un formato de equipos no reconocido.');
      setComputers(records);
      setError('');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }, []);

  const loadBranches = useCallback(async () => {
    try {
      const response = await api.get('/branches');
      const records = extractRecords(response.data, ['branches', 'items']);
      if (records) setBranches(records);
    } catch {
      // Branch is optional; existing remote records remain usable without it.
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadComputers(), loadBranches()]);
    setLoading(false);
  }, [loadBranches, loadComputers]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredComputers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return computers.filter((computer) => {
      const searchable = [
        computer.computer_name,
        computer.anydesk_id,
        computer.teamviewer_id,
        computer.responsible,
        computer.department,
        computer.location,
        computer.branch_name,
        computer.status,
        computer.priority,
        ...(Array.isArray(computer.tags) ? computer.tags : []),
        computer.notes,
      ].join(' ').toLocaleLowerCase();

      if (query && !searchable.includes(query)) return false;
      if (branchFilter && String(computer.branch_id || '') !== branchFilter) return false;
      if (statusFilter && computer.status !== statusFilter) return false;
      if (priorityFilter && computer.priority !== priorityFilter) return false;
      if (favoritesOnly && !computer.favorite) return false;
      return true;
    });
  }, [computers, search, branchFilter, statusFilter, priorityFilter, favoritesOnly]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openNewForm = () => {
    setEditingComputer(null);
    setForm(EMPTY_FORM);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const openEditForm = (computer) => {
    setEditingComputer(computer);
    setForm({
      ...EMPTY_FORM,
      computer_name: computer.computer_name || '',
      anydesk_id: computer.anydesk_id || '',
      teamviewer_id: computer.teamviewer_id || '',
      branch_id: computer.branch_id ? String(computer.branch_id) : '',
      responsible: computer.responsible || '',
      department: computer.department || '',
      location: computer.location || '',
      priority: computer.priority || 'normal',
      status: computer.status || 'registered',
      tagsText: Array.isArray(computer.tags) ? computer.tags.join(', ') : '',
      notes: computer.notes || '',
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingComputer(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      computer_name: form.computer_name.trim(),
      anydesk_id: form.anydesk_id.trim(),
      teamviewer_id: form.teamviewer_id.trim() || null,
      branch_id: form.branch_id || null,
      responsible: form.responsible.trim() || null,
      department: form.department.trim() || null,
      location: form.location.trim() || null,
      priority: form.priority,
      status: form.status,
      tags: form.tagsText.split(',').map((tag) => tag.trim()).filter(Boolean),
      notes: form.notes.trim() || null,
    };

    try {
      if (editingComputer) {
        await remoteAccessService.update(editingComputer.id, payload);
        setSuccess('Los datos del equipo se actualizaron correctamente.');
      } else {
        await remoteAccessService.create(payload);
        setSuccess('El equipo se registró correctamente.');
      }
      closeForm();
      await loadComputers();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const toggleFavorite = async (computer) => {
    setError('');
    try {
      await remoteAccessService.toggleFavorite(computer.id);
      await loadComputers();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const copyAnyDeskId = async (computer) => {
    try {
      await navigator.clipboard.writeText(String(computer.anydesk_id || ''));
      setSuccess(`ID de AnyDesk copiado: ${computer.anydesk_id}`);
    } catch {
      setError('No se pudo copiar el ID. Verifica los permisos del navegador.');
    }
  };

  const openAnyDesk = async (computer) => {
    if (!computer.anydesk_id) {
      setError('Este registro no tiene un ID de AnyDesk.');
      return;
    }

    try {
      await remoteAccessService.recordLaunchRequest(computer.id);
    } catch (requestError) {
      // A failed history write must not block the user's local AnyDesk launch.
      console.warn('No se pudo registrar la solicitud de apertura:', requestError);
    }

    window.location.href = `anydesk:${encodeURIComponent(computer.anydesk_id)}`;
  };

  const openHistory = async (computer) => {
    setHistoryLoading(true);
    setHistoryModal({ computer, entries: [] });
    try {
      const result = await remoteAccessService.getHistory(computer.id);
      setHistoryModal({ computer, entries: Array.isArray(result) ? result : [] });
    } catch (requestError) {
      setHistoryModal(null);
      setError(getErrorMessage(requestError));
    } finally {
      setHistoryLoading(false);
    }
  };

  const deleteComputer = async (computer) => {
    const confirmed = window.confirm(`¿Eliminar el acceso guardado de "${computer.computer_name}"? Esta acción no cerrará ni desconectará una sesión remota.`);
    if (!confirmed) return;

    setError('');
    try {
      await remoteAccessService.remove(computer.id);
      setComputers((current) => current.filter((item) => item.id !== computer.id));
      setSuccess('El registro del equipo fue eliminado.');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const favoritesCount = computers.filter((item) => item.favorite).length;
  const criticalCount = computers.filter((item) => item.priority === 'critical' && item.status !== 'retired').length;
  const activeRecords = computers.filter((item) => item.status !== 'retired').length;

  return (
    <main className="relative isolate aura-module-root min-h-[calc(100vh-64px)] overflow-hidden bg-[#f5f7fc] px-4 py-6 text-slate-900 dark:bg-[#080d18] dark:text-slate-100 sm:px-6 lg:px-8">
      <AuraPageBackground />
      <div className="aura-module-container relative mx-auto max-w-[1600px] space-y-5">
        <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
              <Wifi size={14} /> Centro de mando IT
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Remote Access</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Directorio visual de equipos y accesos. El estado indica la situación del registro, no la conexión remota en vivo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={refresh} disabled={loading} className={buttonClass}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Actualizar</button>
            <button type="button" onClick={openNewForm} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500"><Plus size={15} />Registrar equipo</button>
          </div>
        </header>

        {error && <div role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-xs text-rose-700 dark:text-rose-300">{error}</div>}
        {success && <div role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300">{success}</div>}

        <section aria-label="Resumen Remote Access" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            { label: 'Equipos registrados', value: computers.length, icon: Laptop },
            { label: 'Registros activos', value: activeRecords, icon: Monitor },
            { label: 'Favoritos', value: favoritesCount, icon: Star },
            { label: 'Prioridad crítica', value: criticalCount, icon: Activity },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="aura-panel rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  {item.label}
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/15 bg-indigo-500/[0.06] text-indigo-600 dark:text-indigo-300"><Icon size={17} /></span>
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums">{item.value}</p>
              </article>
            );
          })}
        </section>

        <section className="aura-panel space-y-3 rounded-2xl p-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-semibold">Directorio de equipos</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Busca por nombre, ID, responsable, departamento, sucursal, ubicación o etiquetas.</p>
            </div>
            <button type="button" onClick={() => setFavoritesOnly((value) => !value)} className={favoritesOnly ? 'inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-200' : buttonClass}>
              <Star size={14} fill={favoritesOnly ? 'currentColor' : 'none'} />{favoritesOnly ? 'Ver todos' : 'Solo favoritos'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            <label className="relative xl:col-span-2">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar equipos, personas, IDs o tags..." aria-label="Buscar equipos" className={`${inputClass} pl-9`} />
            </label>
            <select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)} aria-label="Filtrar por sucursal" className={inputClass}>
              <option value="">Todas las sucursales</option>
              {branches.map((branch) => <option key={branch.id} value={String(branch.id)}>{branch.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por estado" className={inputClass}>
              <option value="">Todos los estados</option>
              {STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} aria-label="Filtrar por prioridad" className={inputClass}>
              <option value="">Todas las prioridades</option>
              {PRIORITY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 md:col-span-2 xl:col-span-3">
              <span>Mostrando <strong className="text-slate-800 dark:text-slate-200">{filteredComputers.length}</strong> de {computers.length} equipos</span>
              {(search || branchFilter || statusFilter || priorityFilter || favoritesOnly) && <button type="button" onClick={() => { setSearch(''); setBranchFilter(''); setStatusFilter(''); setPriorityFilter(''); setFavoritesOnly(false); }} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">Limpiar filtros</button>}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-xs text-slate-500 dark:text-slate-400"><RefreshCw size={16} className="animate-spin" />Cargando equipos...</div>
        ) : filteredComputers.length === 0 ? (
          <div className="aura-panel flex min-h-[260px] flex-col items-center justify-center rounded-2xl px-6 py-12 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/15 bg-indigo-500/[0.06] text-indigo-500 dark:text-indigo-300"><Monitor size={22} /></span>
            <h2 className="text-sm font-semibold">No hay equipos para mostrar</h2>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">{computers.length ? 'Ajusta los filtros de búsqueda o cambia la vista de favoritos.' : 'Registra el primer equipo para crear el directorio de acceso remoto.'}</p>
            {!computers.length && <button type="button" onClick={openNewForm} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white"><Plus size={14} />Registrar equipo</button>}
          </div>
        ) : (
          <section aria-label="Tarjetas de equipos" className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredComputers.map((computer) => (
              <article key={computer.id} className="aura-panel group relative flex min-h-[260px] flex-col overflow-hidden rounded-2xl p-4 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400/30">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500/70 via-blue-500/45 to-violet-500/60" />
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/15 bg-indigo-500/[0.06] text-indigo-600 dark:text-indigo-300"><Laptop size={20} /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={computer.computer_name}>{computer.computer_name}</h3>
                    <p className="mt-1 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">AnyDesk · {computer.anydesk_id || 'Sin ID'}</p>
                  </div>
                  <button type="button" onClick={() => toggleFavorite(computer)} title={computer.favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'} aria-label={computer.favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'} className={computer.favorite ? 'rounded-lg p-2 text-amber-500 dark:text-amber-300' : 'rounded-lg p-2 text-slate-400 transition hover:bg-amber-500/10 hover:text-amber-500'}><Star size={16} fill={computer.favorite ? 'currentColor' : 'none'} /></button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 border-y border-slate-200/80 py-3 dark:border-white/[0.07]">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Responsable</p>
                    <p className="mt-0.5 truncate text-xs text-slate-700 dark:text-slate-200">{computer.responsible || 'Sin asignar'}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Departamento</p>
                    <p className="mt-0.5 truncate text-xs text-slate-700 dark:text-slate-200">{computer.department || 'Sin departamento'}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Sucursal</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-700 dark:text-slate-200"><Building2 size={11} className="shrink-0 text-slate-400" />{computer.branch_name || 'Sin sucursal'}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Ubicación</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-700 dark:text-slate-200"><MapPin size={11} className="shrink-0 text-slate-400" />{computer.location || 'Sin ubicación'}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill status={computer.status} />
                  <PriorityPill priority={computer.priority} />
                </div>

                {computer.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {computer.tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-indigo-500/15 bg-indigo-500/[0.05] px-2 py-1 text-[9px] text-indigo-700 dark:text-indigo-200"><Tag size={9} />{tag}</span>)}
                  </div>
                )}

                {computer.notes && <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{computer.notes}</p>}

                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <button type="button" onClick={() => openAnyDesk(computer)} disabled={!computer.anydesk_id || computer.status === 'retired'} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"><ExternalLink size={14} />Abrir AnyDesk</button>
                  <button type="button" onClick={() => copyAnyDeskId(computer)} className={buttonClass} title="Copiar ID"><Copy size={14} /></button>
                  <button type="button" onClick={() => openHistory(computer)} className={buttonClass} title="Historial"><History size={14} /></button>
                  <button type="button" onClick={() => openEditForm(computer)} className={buttonClass} title="Editar"><Pencil size={14} /></button>
                  <button type="button" onClick={() => deleteComputer(computer)} className="inline-flex items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2 text-xs text-rose-700 transition hover:bg-rose-500/[0.1] dark:text-rose-300" title="Eliminar"><Trash2 size={14} /></button>
                </div>
                <p className="mt-2 text-[9px] text-slate-400">Registro actualizado: {formatDate(computer.last_updated)}</p>
              </article>
            ))}
          </section>
        )}

        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
          <ShieldCheck size={13} className="text-indigo-500" />
          Abrir AnyDesk solo solicita iniciar el cliente local. No confirma que una conexión remota haya sido establecida.
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="remote-form-title" className="aura-panel my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white dark:bg-[#111827]">
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/95 p-5 backdrop-blur dark:border-white/[0.07] dark:bg-[#111827]/95">
              <div>
                <h2 id="remote-form-title" className="text-base font-semibold text-slate-900 dark:text-white">{editingComputer ? 'Editar equipo' : 'Registrar equipo'}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ficha de identificación y organización del acceso remoto.</p>
              </div>
              <button type="button" onClick={closeForm} disabled={saving} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06]" aria-label="Cerrar formulario"><X size={17} /></button>
            </header>

            <form onSubmit={handleSave} className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Nombre del equipo
                  <input className={inputClass} value={form.computer_name} onChange={(event) => updateField('computer_name', event.target.value)} placeholder="PC Administración" maxLength={150} required />
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">ID de AnyDesk
                  <input className={inputClass} value={form.anydesk_id} onChange={(event) => updateField('anydesk_id', event.target.value)} placeholder="Identificador del cliente" maxLength={100} required />
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">ID de TeamViewer (opcional)
                  <input className={inputClass} value={form.teamviewer_id} onChange={(event) => updateField('teamviewer_id', event.target.value)} maxLength={100} placeholder="ID alternativo" />
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Sucursal
                  <select className={inputClass} value={form.branch_id} onChange={(event) => updateField('branch_id', event.target.value)}>
                    <option value="">Sin sucursal</option>
                    {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                  </select>
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Responsable / usuario
                  <input className={inputClass} value={form.responsible} onChange={(event) => updateField('responsible', event.target.value)} maxLength={150} placeholder="Nombre de la persona responsable" />
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Departamento
                  <input className={inputClass} value={form.department} onChange={(event) => updateField('department', event.target.value)} maxLength={120} placeholder="Administración, ventas, IT..." />
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Ubicación
                  <input className={inputClass} value={form.location} onChange={(event) => updateField('location', event.target.value)} maxLength={200} placeholder="Piso, área o puesto" />
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Prioridad
                  <select className={inputClass} value={form.priority} onChange={(event) => updateField('priority', event.target.value)}>
                    {PRIORITY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Estado del registro
                  <select className={inputClass} value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                    {STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Etiquetas personalizadas
                  <input className={inputClass} value={form.tagsText} onChange={(event) => updateField('tagsText', event.target.value)} placeholder="Servidor, prioridad, caja 01" />
                </label>
              </div>
              <label className="block space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Observaciones
                <textarea className={inputClass} rows={3} maxLength={2000} value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Notas técnicas o instrucciones de acceso" />
              </label>
              <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-200/80 pt-4 dark:border-white/[0.07] sm:flex-row">
                <button type="button" onClick={closeForm} disabled={saving} className={buttonClass}>Cancelar</button>
                <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50">{saving && <RefreshCw size={13} className="animate-spin" />}{saving ? 'Guardando…' : editingComputer ? 'Guardar cambios' : 'Registrar equipo'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {historyModal && (
        <div className="fixed inset-0 z-[125] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="remote-history-title" className="aura-panel max-h-[80vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-[#111827]">
            <header className="flex items-center justify-between border-b border-slate-200/80 p-5 dark:border-white/[0.07]">
              <div>
                <h2 id="remote-history-title" className="text-sm font-semibold text-slate-900 dark:text-white">Historial · {historyModal.computer.computer_name}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Registro de cambios y solicitudes de apertura de AnyDesk.</p>
              </div>
              <button type="button" onClick={() => setHistoryModal(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06]" aria-label="Cerrar historial"><X size={17} /></button>
            </header>
            <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
              {historyLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-500"><RefreshCw size={14} className="animate-spin" />Cargando historial...</div>
              ) : historyModal.entries.length ? historyModal.entries.map((entry) => (
                <article key={entry.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/[0.08]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{({
                      record_created: 'Equipo registrado',
                      record_updated: 'Datos actualizados',
                      record_deleted: 'Registro eliminado',
                      client_launch_requested: 'Solicitud de apertura AnyDesk',
                    })[entry.action] || entry.action}</p>
                    <time className="text-[10px] text-slate-500 dark:text-slate-400">{formatDate(entry.created_at)}</time>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{entry.actor_name || entry.actor_username || 'Usuario no disponible'}</p>
                </article>
              )) : <p className="py-8 text-center text-xs text-slate-500">No hay eventos para este equipo todavía.</p>}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
