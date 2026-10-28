import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertCircle, ArrowDownUp, ArrowLeft, Battery, Box, Building2, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronRight, AlertTriangle, ClipboardList, Cpu,
  Edit3, Eye, FileText, Filter, HardDrive, Laptop, List, Loader2, Monitor, Network,
  Package, Plus, Printer, RefreshCw, Search, Server, ShieldCheck, SlidersHorizontal,
  Trash2, Wifi, X, Zap, Grid2X2, MapPin, Hash, Wrench, CalendarClock, Tag,
  Smartphone, Camera, Mic, Headphones, Watch, Truck, Home, Coffee, ShoppingBag,
  Gift, Heart, Star, Cloud, Lock, Shield, User, Users, Globe, Book, Video, Music,
  File, Image as ImageIcon, MessageCircle
} from 'lucide-react';
import hardwareService from '../services/hardwareService';
import branchService from '../services/branchService';
import InventoryAdvancedPanel from '../components/inventory/InventoryAdvancedPanel';
import AuraPageBackground from '../components/common/AuraPageBackground';

const DEFAULT_CATEGORIES = [
  { name: 'Fiscal Printer', icon: Printer, color: 'from-emerald-500 to-teal-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', defaultSpecs: [{ key: 'connection', label: 'Conexión', type: 'select', options: ['USB', 'Ethernet', 'Serial', 'Wi-Fi'] }, { key: 'paper_width', label: 'Ancho de papel', type: 'select', options: ['57 mm', '80 mm'] }] },
  { name: 'Desktop', icon: Monitor, color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', defaultSpecs: [{ key: 'processor', label: 'Procesador', type: 'text' }, { key: 'ram', label: 'Memoria RAM', type: 'text' }, { key: 'storage', label: 'Almacenamiento', type: 'text' }, { key: 'operating_system', label: 'Sistema operativo', type: 'text' }] },
  { name: 'Laptop', icon: Laptop, color: 'from-indigo-500 to-violet-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20', defaultSpecs: [{ key: 'processor', label: 'Procesador', type: 'text' }, { key: 'ram', label: 'Memoria RAM', type: 'text' }, { key: 'storage', label: 'Almacenamiento', type: 'text' }, { key: 'operating_system', label: 'Sistema operativo', type: 'text' }] },
  { name: 'Server', icon: Server, color: 'from-violet-500 to-purple-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20', defaultSpecs: [{ key: 'processor', label: 'Procesador', type: 'text' }, { key: 'ram', label: 'Memoria RAM', type: 'text' }, { key: 'storage', label: 'Almacenamiento', type: 'text' }, { key: 'os', label: 'Sistema operativo', type: 'text' }] },
  { name: 'Network Device', icon: Wifi, color: 'from-cyan-500 to-sky-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', defaultSpecs: [{ key: 'ports', label: 'Puertos', type: 'text' }, { key: 'speed', label: 'Velocidad', type: 'text' }, { key: 'management_ip', label: 'IP de gestión', type: 'text' }] },
  { name: 'POS', icon: Smartphone, color: 'from-amber-500 to-orange-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', defaultSpecs: [{ key: 'connection', label: 'Conexión', type: 'select', options: ['Ethernet', 'Wi-Fi', 'USB'] }, { key: 'operating_system', label: 'Sistema operativo', type: 'text' }] },
];

const AVAILABLE_ICONS = {
  Monitor, Laptop, Printer, Server, Wifi, Smartphone, Camera, Mic, Headphones, Watch,
  Battery, Truck, Home, Coffee, ShoppingBag, Gift, Heart, Star, Zap, Cloud, Lock,
  Shield, User, Users, Globe, Book, Video, Music, File, Image: ImageIcon,
  MessageCircle, Cpu, HardDrive, Network, Package, Box, Activity,
};

const CATEGORY_COLORS = [
  { label: 'Esmeralda', value: 'from-emerald-500 to-teal-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  { label: 'Azul', value: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  { label: 'Índigo', value: 'from-indigo-500 to-violet-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20' },
  { label: 'Cian', value: 'from-cyan-500 to-sky-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
  { label: 'Ámbar', value: 'from-amber-500 to-orange-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  { label: 'Violeta', value: 'from-violet-500 to-purple-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20' },
  { label: 'Rosa', value: 'from-pink-500 to-rose-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
  { label: 'Gris', value: 'from-slate-400 to-slate-500', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/20' },
];

const EMPTY_FORM = {
  type: '', brand_model: '', serial_number: '', service_tag: '', ip_address: '', mac_address: '',
  status: 'active', branch_id: '', purchase_date: '', warranty_end: '', notes: '', specs: [],
};

const cn = (...classes) => classes.filter(Boolean).join(' ');
const getErrorMessage = (error) => error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Ocurrió un error inesperado.';

function readCustomCategories() {
  try {
    const stored = JSON.parse(localStorage.getItem('customCategories') || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function StatusBadge({ status }) {
  const styles = {
    active: { label: 'Operativo', className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400', icon: CheckCircle2 },
    repair: { label: 'En reparación', className: 'border-amber-500/20 bg-amber-500/10 text-amber-400', icon: Wrench },
    damaged: { label: 'Dañado', className: 'border-rose-500/20 bg-rose-500/10 text-rose-400', icon: AlertTriangle },
  };
  const config = styles[status] || { label: status || 'Sin estado', className: 'border-slate-500/20 bg-slate-500/10 text-slate-400', icon: Activity };
  const Icon = config.icon;
  return <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold', config.className)}><Icon size={12} />{config.label}</span>;
}

function IconTile({ category, size = 'normal' }) {
  const Icon = category?.icon || Package;
  return <div className={cn('flex shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br text-white shadow-lg shadow-black/10', category?.color || 'from-emerald-500 to-teal-400', category?.borderColor || 'border-emerald-500/20', size === 'small' ? 'h-9 w-9' : 'h-11 w-11')}><Icon size={size === 'small' ? 17 : 20} strokeWidth={1.8} /></div>;
}

function StatCard({ label, value, detail, icon: Icon, accent = 'emerald' }) {
  const accents = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/15',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/15',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/15',
  };
  return <div className="group min-w-0 rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-md dark:border-white/[0.07] dark:bg-[#111827]/90 dark:shadow-black/10 dark:hover:shadow-emerald-950/20">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p></div><span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border', accents[accent] || accents.emerald)}><Icon size={17} strokeWidth={1.8} /></span></div>
    {detail && <p className="mt-2 truncate text-xs text-slate-500 dark:text-slate-400">{detail}</p>}
  </div>;
}

function ModalShell({ title, subtitle, icon: Icon = Package, onClose, children, size = 'max-w-2xl' }) {
  return <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/20 p-3 backdrop-blur-xl sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" className={cn('my-auto w-full overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/96 border-slate-200 shadow-slate-300/30 dark:border-white/[0.09] dark:bg-[#111827]/98 dark:shadow-black/40', size)}>
      <header className="flex items-start justify-between gap-4 border-b border-slate-200/80 px-5 py-4 dark:border-white/[0.07] sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"><Icon size={19} /></span><div className="min-w-0"><h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">{title}</h2>{subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}</div></div><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.07] dark:hover:text-white"><X size={18} /></button></header>
      {children}
    </section>
  </div>;
}

function Field({ label, children, className = '' }) {
  return <label className={cn('block min-w-0 space-y-1.5', className)}><span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{label}</span>{children}</label>;
}

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.09] dark:bg-[#0A0E17]/80 dark:text-slate-100 dark:placeholder:text-slate-600';
const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-950/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white/75 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/70 dark:border-white/[0.09] dark:bg-white/[0.035] dark:text-slate-200 dark:hover:bg-white/[0.07]';

export default function InventoryPage() {
  const [hardware, setHardware] = useState([]);
  const [stats, setStats] = useState({});
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [actionError, setActionError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [customCategories, setCustomCategories] = useState(readCustomCategories);
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'Package', color: CATEGORY_COLORS[0].value });
  const [formData, setFormData] = useState(EMPTY_FORM);

  const categories = useMemo(() => [
    ...DEFAULT_CATEGORIES,
    ...customCategories.map((category) => ({ ...category, icon: AVAILABLE_ICONS[category.iconName] || Package })),
  ], [customCategories]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const [hardwareResult, statsResult, branchResult] = await Promise.all([
        hardwareService.getAll(), hardwareService.getStats(), branchService.getAll(),
      ]);
      setHardware(Array.isArray(hardwareResult) ? hardwareResult : hardwareResult?.items || hardwareResult?.data || []);
      setStats(statsResult && typeof statsResult === 'object' ? statsResult : {});
      setBranches(Array.isArray(branchResult) ? branchResult : branchResult?.items || branchResult?.data || []);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredHardware = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    return hardware.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const searchable = [item.type, item.brand_model, item.serial_number, item.service_tag, item.ip_address, item.mac_address, item.branch_name, item.notes]
        .filter(Boolean).join(' ').toLocaleLowerCase();
      return matchesCategory && matchesStatus && (!query || searchable.includes(query));
    });
  }, [hardware, searchTerm, selectedCategory, statusFilter]);

  const countForCategory = (categoryName) => hardware.filter((item) => item.type === categoryName).length;
  const activeCount = hardware.filter((item) => item.status === 'active').length;
  const repairCount = hardware.filter((item) => item.status === 'repair').length;
  const damagedCount = hardware.filter((item) => item.status === 'damaged').length;

  const openCreateForm = (type = '') => {
    setActionError('');
    setEditingItem(null);
    const category = categories.find((item) => item.name === type);
    setFormData({ ...EMPTY_FORM, type, specs: (category?.defaultSpecs || []).map((spec) => ({ ...spec, value: spec.value ?? '' })) });
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setActionError('');
    setEditingItem(item);
    const category = categories.find((entry) => entry.name === item.type);
    const defaults = (category?.defaultSpecs || []).map((spec) => ({ ...spec, value: spec.value ?? '' }));
    const existing = Array.isArray(item.specs) ? item.specs : [];
    const normalizedExisting = existing.map((spec) => ({
      key: spec.key ?? spec.spec_key ?? spec.name ?? '',
      label: spec.label ?? spec.spec_label ?? spec.key ?? spec.spec_key ?? spec.name ?? 'Especificación',
      type: spec.type || 'text',
      options: spec.options,
      value: spec.value ?? spec.spec_value ?? '',
    })).filter((spec) => spec.key);
    const mergedSpecs = defaults.map((spec) => {
      const match = normalizedExisting.find((entry) => entry.key === spec.key);
      return match ? { ...spec, ...match, value: match.value } : spec;
    });
    normalizedExisting.forEach((spec) => { if (!mergedSpecs.some((entry) => entry.key === spec.key)) mergedSpecs.push(spec); });
    setFormData({ ...EMPTY_FORM, ...item, branch_id: item.branch_id == null ? '' : String(item.branch_id), specs: mergedSpecs });
    setShowForm(true);
  };

  const handleTypeChange = (type) => {
    const category = categories.find((item) => item.name === type);
    setFormData((previous) => ({ ...previous, type, specs: (category?.defaultSpecs || []).map((spec) => ({ ...spec, value: spec.value ?? '' })) }));
  };

  const updateSpec = (index, value) => setFormData((previous) => ({
    ...previous,
    specs: previous.specs.map((spec, specIndex) => specIndex === index ? { ...spec, value } : spec),
  }));

  const addSpec = () => setFormData((previous) => ({ ...previous, specs: [...previous.specs, { key: `custom_${Date.now()}`, label: '', type: 'text', value: '' }] }));
  const removeSpec = (index) => setFormData((previous) => ({ ...previous, specs: previous.specs.filter((_, specIndex) => specIndex !== index) }));
  const renameSpec = (index, label) => setFormData((previous) => ({ ...previous, specs: previous.specs.map((spec, specIndex) => specIndex === index ? { ...spec, label, key: spec.key.startsWith('custom_') ? label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || spec.key : spec.key } : spec) }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setActionError('');
    if (!formData.type || !formData.brand_model?.trim()) {
      setActionError('Selecciona una categoría e indica la marca o modelo del equipo.');
      return;
    }
    setSaving(true);
    const payload = {
      ...formData,
      branch_id: formData.branch_id === '' ? null : formData.branch_id,
      specs: (formData.specs || []).filter((spec) => spec.key && spec.key.trim() && spec.value !== '' && spec.value !== null && spec.value !== undefined)
        .map((spec) => ({ key: spec.key, value: String(spec.value) })),
    };
    try {
      if (editingItem) await hardwareService.update(editingItem.id, payload);
      else await hardwareService.create(payload);
      setShowForm(false);
      setEditingItem(null);
      await loadData();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const label = item.brand_model || item.serial_number || 'este equipo';
    if (!window.confirm(`¿Seguro que deseas eliminar ${label}? Esta acción no se puede deshacer.`)) return;
    setActionError('');
    setDeletingId(item.id);
    try {
      await hardwareService.delete(item.id);
      setSelectedItem((current) => current?.id === item.id ? null : current);
      await loadData();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddCategory = (event) => {
    event.preventDefault();
    const name = newCategory.name.trim();
    if (!name) return;
    if (categories.some((category) => category.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setActionError('Ya existe una categoría con ese nombre.');
      return;
    }
    const color = CATEGORY_COLORS.find((item) => item.value === newCategory.color) || CATEGORY_COLORS[0];
    const category = {
      name, iconName: newCategory.icon, color: color.value, bgColor: color.bgColor,
      borderColor: color.borderColor, defaultSpecs: [], key: name.replace(/\s+/g, '_'),
    };
    const updated = [...customCategories, category];
    setCustomCategories(updated);
    try { localStorage.setItem('customCategories', JSON.stringify(updated)); } catch { /* La categoría queda disponible durante esta sesión. */ }
    setSelectedCategory(name);
    setNewCategory({ name: '', icon: 'Package', color: CATEGORY_COLORS[0].value });
    setShowCategoryForm(false);
    setActionError('');
  };

  const removeCustomCategory = (categoryName) => {
    const categoryHasHardware = hardware.some((item) => item.type === categoryName);
    const message = categoryHasHardware
      ? `La categoría «${categoryName}» tiene equipos asociados. ¿Quieres quitarla de la lista de categorías? Los equipos existentes no se eliminarán.`
      : `¿Eliminar la categoría «${categoryName}»?`;
    if (!window.confirm(message)) return;
    const updated = customCategories.filter((category) => category.name !== categoryName);
    setCustomCategories(updated);
    try { localStorage.setItem('customCategories', JSON.stringify(updated)); } catch { /* Se mantiene el cambio en memoria. */ }
    if (selectedCategory === categoryName) setSelectedCategory('all');
  };

  const categoryFor = (item) => categories.find((category) => category.name === item.type) || { name: item.type || 'Equipo', icon: Package, color: 'from-emerald-500 to-teal-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' };
  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const EquipmentCard = ({ item }) => {
    const category = categoryFor(item);
    const Icon = category.icon || Package;
    const specEntries = (Array.isArray(item.specs) ? item.specs : []).filter((spec) => (spec.value ?? spec.spec_value) !== '' && (spec.value ?? spec.spec_value) != null).slice(0, 2);
    return <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-950/5 dark:border-white/[0.07] dark:bg-[#111827]/90 dark:hover:border-emerald-500/25 dark:hover:shadow-emerald-950/20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start gap-3 p-4"><IconTile category={category} /><div className="min-w-0 flex-1 pt-0.5"><p className="truncate text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500 dark:text-slate-500">{item.type || 'Equipo'}</p><h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">{item.brand_model || 'Equipo sin modelo'}</h3><div className="mt-2"><StatusBadge status={item.status} /></div></div><div className="flex items-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"><button onClick={() => setSelectedItem(item)} title="Ver detalles" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-white/[0.07] dark:hover:text-emerald-400"><Eye size={15} /></button><button onClick={() => openEditForm(item)} title="Editar" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-white/[0.07] dark:hover:text-blue-400"><Edit3 size={15} /></button></div></div>
      <div className="mx-4 border-t border-slate-200/80 dark:border-white/[0.06]" />
      <div className="grid grid-cols-2 gap-3 px-4 py-3"><div className="min-w-0"><p className="text-[10px] uppercase tracking-wider text-slate-400">Serial</p><p className="mt-1 truncate font-mono text-xs text-slate-600 dark:text-slate-300">{item.serial_number || 'No registrado'}</p></div><div className="min-w-0"><p className="text-[10px] uppercase tracking-wider text-slate-400">Sede</p><p className="mt-1 flex min-w-0 items-center gap-1 truncate text-xs text-slate-600 dark:text-slate-300"><MapPin size={12} className="shrink-0 text-slate-400" />{item.branch_name || 'Sin asignar'}</p></div></div>
      {specEntries.length > 0 && <div className="mx-4 mb-3 flex flex-wrap gap-1.5">{specEntries.map((spec, index) => <span key={`${spec.key || spec.spec_key || index}`} className="max-w-full truncate rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.025] dark:text-slate-400">{spec.label || spec.key || spec.spec_key}: {spec.value ?? spec.spec_value}</span>)}</div>}
      <footer className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200/70 bg-slate-50/70 px-4 py-3 dark:border-white/[0.05] dark:bg-white/[0.015]"><span className="truncate text-[11px] text-slate-500">{item.ip_address || 'Sin IP asignada'}</span><button onClick={() => setSelectedItem(item)} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400">Ver ficha <ChevronRight size={14} /></button></footer>
    </article>;
  };

  return <div className="relative isolate min-h-[calc(100vh-64px)] overflow-hidden bg-[#F5F7FC] text-slate-900 transition-colors duration-300 dark:bg-[#080D18] dark:text-slate-100">
    <AuraPageBackground />
    <div className="relative z-10 mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6 xl:p-8">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-white/[0.07] md:flex-row md:items-center"><div className="min-w-0"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.19em] text-slate-400 dark:text-slate-500"><span>IT SUPPORT PLATFORM</span><ChevronRight size={12} /><span className="text-emerald-600 dark:text-emerald-400">Inventario</span></div><div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500"><Package size={22} strokeWidth={1.7} /></span><div><h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-[28px]">Inventario de equipos</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Control centralizado de activos, sedes y especificaciones técnicas.</p></div></div></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setShowAdvancedPanel((value) => !value)} className={secondaryButton}><Activity size={15} />{showAdvancedPanel ? 'Ocultar gestión avanzada' : 'Gestión avanzada'}</button><button type="button" onClick={() => { setActionError(''); setShowCategoryForm(true); }} className={secondaryButton}><Plus size={15} />Categoría</button><button type="button" onClick={() => openCreateForm(selectedCategory !== 'all' ? selectedCategory : '')} className={primaryButton}><Plus size={16} />Agregar equipo</button></div></header>

      {pageError && <div className="flex flex-col gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4 text-sm text-rose-600 dark:text-rose-300 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><AlertCircle size={17} /><span>No se pudo cargar el inventario: {pageError}</span></div><button onClick={loadData} className={secondaryButton}><RefreshCw size={14} />Reintentar</button></div>}
      {actionError && !showForm && !showCategoryForm && <div className="flex items-start justify-between gap-3 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-sm text-rose-600 dark:text-rose-300"><span className="flex items-center gap-2"><AlertCircle size={16} />{actionError}</span><button onClick={() => setActionError('')} aria-label="Cerrar aviso"><X size={16} /></button></div>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Activos registrados" value={loading ? '—' : (stats.total ?? hardware.length)} detail="Equipos en inventario" icon={Package} accent="emerald" /><StatCard label="Operativos" value={loading ? '—' : (stats.active ?? activeCount)} detail="En funcionamiento" icon={CheckCircle2} accent="emerald" /><StatCard label="En reparación" value={loading ? '—' : (stats.repair ?? repairCount)} detail="Requieren atención" icon={Wrench} accent="amber" /><StatCard label="Con incidencias" value={loading ? '—' : (stats.damaged ?? damagedCount)} detail="Dañados o fuera de servicio" icon={AlertCircle} accent="rose" /></section>

      {showAdvancedPanel && <InventoryAdvancedPanel hardware={hardware} branches={branches} onRefresh={loadData} />}

      <section className="rounded-xl border border-slate-200/80 bg-white/75 p-3 shadow-sm dark:border-white/[0.07] dark:bg-[#0F172A]/75 sm:p-4"><div className="flex flex-col gap-3 xl:flex-row xl:items-center"><div className="relative min-w-0 flex-1"><Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar por modelo, serial, etiqueta, IP o sede..." className={cn(inputClass, 'border-transparent bg-slate-100/80 pl-10 focus:border-emerald-500/50 dark:border-transparent dark:bg-[#0A0E17]/80')} /><span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 text-[10px] text-slate-500 2xl:block">{filteredHardware.length} resultados</span></div><div className="flex flex-wrap items-center gap-2"><label className="relative"><span className="sr-only">Filtrar por estado</span><Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={cn(inputClass, 'w-full appearance-none py-2.5 pl-8 pr-8 text-xs sm:w-auto sm:min-w-[155px]')}><option value="all">Todos los estados</option><option value="active">Operativo</option><option value="repair">En reparación</option><option value="damaged">Dañado</option></select><ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" /></label><div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-white/[0.08] dark:bg-[#0A0E17]"><button type="button" onClick={() => setViewMode('grid')} aria-label="Vista de cuadrícula" title="Cuadrícula" className={cn('rounded-md p-2 transition', viewMode === 'grid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')}><Grid2X2 size={16} /></button><button type="button" onClick={() => setViewMode('list')} aria-label="Vista de lista" title="Lista" className={cn('rounded-md p-2 transition', viewMode === 'list' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')}><List size={17} /></button></div><button type="button" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSelectedCategory('all'); }} className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white">Limpiar filtros</button></div></div></section>

      <section className="space-y-3"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-sm font-semibold text-slate-900 dark:text-white">Categorías de equipos</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Filtra los activos por tipo de dispositivo.</p></div><p className="text-xs text-slate-500 dark:text-slate-500">{categories.length} categorías disponibles</p></div><div className="flex gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => setSelectedCategory('all')} className={cn('flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition', selectedCategory === 'all' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 bg-white/80 text-slate-500 hover:border-emerald-500/20 dark:border-white/[0.07] dark:bg-[#111827]/70 dark:text-slate-400')}><Box size={14} />Todos <span className="rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[10px] dark:bg-white/[0.07]">{hardware.length}</span></button>{categories.map((category) => { const Icon = category.icon || Package; const isSelected = selectedCategory === category.name; const custom = customCategories.some((entry) => entry.name === category.name); return <div key={category.name} className="group/chip relative flex shrink-0 items-center"><button type="button" onClick={() => setSelectedCategory(category.name)} className={cn('flex items-center gap-2 rounded-lg border py-2 pl-3 pr-3 text-xs font-semibold transition', isSelected ? cn(category.bgColor, category.borderColor, 'text-slate-800 dark:text-slate-100') : 'border-slate-200 bg-white/80 text-slate-500 hover:border-slate-300 dark:border-white/[0.07] dark:bg-[#111827]/70 dark:text-slate-400 dark:hover:border-white/[0.14]')}><Icon size={14} className={isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />{category.name}<span className="rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[10px] dark:bg-white/[0.07]">{countForCategory(category.name)}</span></button>{custom && <button type="button" onClick={() => removeCustomCategory(category.name)} title={`Eliminar categoría ${category.name}`} className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-sm hover:bg-rose-50 hover:text-rose-500 group-hover/chip:flex dark:border-slate-700 dark:bg-[#111827]"><X size={10} /></button>}</div>; })}</div></section>

      <section className="space-y-3"><div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-slate-900 dark:text-white">{selectedCategory === 'all' ? 'Todos los equipos' : selectedCategory}</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{filteredHardware.length} {filteredHardware.length === 1 ? 'equipo encontrado' : 'equipos encontrados'}</p></div><button type="button" onClick={loadData} disabled={loading} title="Actualizar inventario" className={cn(secondaryButton, 'px-2.5 py-2 text-xs')}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Actualizar</button></div>
        {loading ? <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 dark:border-white/10 dark:bg-[#111827]/40"><Loader2 size={25} className="animate-spin text-emerald-500" /><p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">Cargando inventario...</p><p className="mt-1 text-xs text-slate-400">Consultando activos y sedes</p></div>
          : filteredHardware.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 px-5 text-center dark:border-white/10 dark:bg-[#111827]/40"><span className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-500"><Search size={21} /></span><h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No hay equipos para mostrar</h3><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">Prueba con otra búsqueda o limpia los filtros. También puedes registrar un equipo nuevo.</p><button type="button" onClick={() => openCreateForm(selectedCategory !== 'all' ? selectedCategory : '')} className={cn(primaryButton, 'mt-4')}><Plus size={15} />Agregar equipo</button></div>
          : viewMode === 'grid' ? <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">{filteredHardware.map((item) => <EquipmentCard key={item.id} item={item} />)}</div>
          : <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 dark:border-white/[0.07] dark:bg-[#111827]/90"><div className="overflow-x-auto"><table className="w-full min-w-[780px] border-collapse text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-[0.13em] text-slate-500 dark:bg-white/[0.025] dark:text-slate-500"><tr><th className="px-4 py-3 font-bold">Equipo</th><th className="px-4 py-3 font-bold">Serial / etiqueta</th><th className="px-4 py-3 font-bold">Sede</th><th className="px-4 py-3 font-bold">Estado</th><th className="px-4 py-3 text-right font-bold">Acciones</th></tr></thead><tbody>{filteredHardware.map((item) => { const category = categoryFor(item); const Icon = category.icon || Package; return <tr key={item.id} className="border-t border-slate-200/70 transition hover:bg-slate-50/80 dark:border-white/[0.05] dark:hover:bg-white/[0.025]"><td className="px-4 py-3"><div className="flex items-center gap-3"><IconTile category={category} size="small" /><div className="min-w-0"><p className="max-w-xs truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.brand_model || 'Equipo sin modelo'}</p><p className="mt-0.5 text-[11px] text-slate-500">{item.type}</p></div></div></td><td className="px-4 py-3"><p className="font-mono text-xs text-slate-600 dark:text-slate-300">{item.serial_number || '—'}</p><p className="mt-0.5 text-[11px] text-slate-400">{item.service_tag || 'Sin etiqueta'}</p></td><td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">{item.branch_name || 'Sin asignar'}</td><td className="px-4 py-3"><StatusBadge status={item.status} /></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button type="button" onClick={() => setSelectedItem(item)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-white/[0.07] dark:hover:text-emerald-400" title="Detalles"><Eye size={15} /></button><button type="button" onClick={() => openEditForm(item)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-white/[0.07] dark:hover:text-blue-400" title="Editar"><Edit3 size={15} /></button><button type="button" onClick={() => handleDelete(item)} disabled={deletingId === item.id} className="rounded-lg p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50" title="Eliminar"><Trash2 size={15} /></button></div></td></tr>; })}</tbody></table></div></div>}
      </section>
      <footer className="flex flex-col gap-1 border-t border-slate-200/70 pt-4 text-[10px] text-slate-400 dark:border-white/[0.06] dark:text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span>IT SUPPORT PLATFORM <span className="px-1.5">/</span> GESTIÓN DE ACTIVOS</span><span>Inventario actualizado desde el sistema central</span></footer>
    </div>

    {showCategoryForm && <ModalShell title="Nueva categoría" subtitle="Personaliza cómo se agrupan tus activos." icon={Tag} onClose={() => setShowCategoryForm(false)} size="max-w-lg"><form onSubmit={handleAddCategory} className="space-y-5 p-5 sm:p-6"><Field label="Nombre de la categoría"><input autoFocus required maxLength={50} value={newCategory.name} onChange={(event) => setNewCategory((current) => ({ ...current, name: event.target.value }))} placeholder="Ej. Tabletas, UPS, Cámaras..." className={inputClass} /></Field><Field label="Icono"><div className="grid grid-cols-6 gap-2 sm:grid-cols-8">{Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => <button key={name} type="button" onClick={() => setNewCategory((current) => ({ ...current, icon: name }))} title={name} className={cn('flex h-10 items-center justify-center rounded-lg border transition', newCategory.icon === name ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-white/[0.08] dark:text-slate-400 dark:hover:border-white/20')}><Icon size={17} /></button>)}</div></Field><Field label="Color de identificación"><div className="flex flex-wrap gap-2">{CATEGORY_COLORS.map((color) => <button key={color.value} type="button" title={color.label} onClick={() => setNewCategory((current) => ({ ...current, color: color.value }))} className={cn('h-8 w-8 rounded-full border-2 bg-gradient-to-br transition', color.value, newCategory.color === color.value ? 'border-slate-900 ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-white dark:border-white dark:ring-offset-[#0F172A]' : 'border-transparent')} />)}</div></Field>{actionError && <p className="flex items-center gap-2 text-xs text-rose-500"><AlertCircle size={14} />{actionError}</p>}<div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 dark:border-white/[0.07] sm:flex-row sm:justify-end"><button type="button" onClick={() => setShowCategoryForm(false)} className={secondaryButton}>Cancelar</button><button type="submit" className={primaryButton}><Plus size={15} />Crear categoría</button></div></form></ModalShell>}

    {showForm && <ModalShell title={editingItem ? 'Editar equipo' : 'Registrar equipo'} subtitle={editingItem ? 'Actualiza los datos del activo seleccionado.' : 'Añade un activo al inventario de IT.'} icon={editingItem ? Edit3 : Plus} onClose={() => { setShowForm(false); setEditingItem(null); setActionError(''); }} size="max-w-3xl"><form onSubmit={handleSubmit} className="max-h-[calc(100dvh-7rem)] overflow-y-auto"><div className="space-y-5 p-5 sm:p-6"><div><h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-slate-500"><ClipboardList size={14} className="text-emerald-500" />Información general</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Categoría *"><select required value={formData.type} onChange={(event) => handleTypeChange(event.target.value)} disabled={Boolean(editingItem)} className={cn(inputClass, 'disabled:cursor-not-allowed disabled:opacity-60')}><option value="">Selecciona una categoría</option>{categories.map((category) => <option key={category.name} value={category.name}>{category.name}</option>)}</select></Field><Field label="Marca / modelo *"><input required value={formData.brand_model || ''} onChange={(event) => setFormData((current) => ({ ...current, brand_model: event.target.value }))} placeholder="Ej. Dell OptiPlex 7090" className={inputClass} /></Field><Field label="Número de serie"><input value={formData.serial_number || ''} onChange={(event) => setFormData((current) => ({ ...current, serial_number: event.target.value }))} placeholder="Serial del fabricante" className={inputClass} /></Field><Field label="Etiqueta de servicio"><input value={formData.service_tag || ''} onChange={(event) => setFormData((current) => ({ ...current, service_tag: event.target.value }))} placeholder="Service tag / código interno" className={inputClass} /></Field><Field label="Sede asignada"><select value={formData.branch_id ?? ''} onChange={(event) => setFormData((current) => ({ ...current, branch_id: event.target.value }))} className={inputClass}><option value="">Sin asignar</option>{branches.map((branch) => <option key={branch.id} value={String(branch.id)}>{branch.name}</option>)}</select></Field><Field label="Estado"><select value={formData.status || 'active'} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))} className={inputClass}><option value="active">Operativo</option><option value="repair">En reparación</option><option value="damaged">Dañado</option></select></Field></div></div>
        <div><h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-slate-500"><Network size={14} className="text-emerald-500" />Conectividad</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Dirección IP"><input value={formData.ip_address || ''} onChange={(event) => setFormData((current) => ({ ...current, ip_address: event.target.value }))} placeholder="192.168.1.100" className={inputClass} /></Field><Field label="Dirección MAC"><input value={formData.mac_address || ''} onChange={(event) => setFormData((current) => ({ ...current, mac_address: event.target.value }))} placeholder="00:1A:2B:3C:4D:5E" className={inputClass} /></Field></div></div>
        <div><div className="mb-3 flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-slate-500"><Cpu size={14} className="text-emerald-500" />Especificaciones técnicas</h3><button type="button" onClick={addSpec} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"><Plus size={13} />Añadir campo</button></div>{!formData.type ? <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-xs text-slate-500 dark:border-white/10">Selecciona una categoría para configurar sus especificaciones.</p> : formData.specs.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-xs text-slate-500 dark:border-white/10">No hay especificaciones definidas. Puedes añadir campos personalizados.</p> : <div className="space-y-2">{formData.specs.map((spec, index) => <div key={`${spec.key}-${index}`} className="grid grid-cols-1 items-end gap-2 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-white/[0.06] dark:bg-white/[0.02] sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_auto]">{String(spec.key).startsWith('custom_') ? <Field label="Nombre del campo"><input value={spec.label || ''} onChange={(event) => renameSpec(index, event.target.value)} placeholder="Ej. Capacidad" className={inputClass} /></Field> : <div className="pb-2"><p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{spec.label || spec.key}</p><p className="mt-1 truncate text-xs font-medium text-slate-700 dark:text-slate-200">{spec.label || spec.key}</p></div>}{spec.type === 'select' && Array.isArray(spec.options) ? <Field label="Valor"><select value={spec.value ?? ''} onChange={(event) => updateSpec(index, event.target.value)} className={inputClass}><option value="">Seleccionar...</option>{spec.options.map((option) => <option key={option} value={option}>{option}</option>)}</select></Field> : spec.type === 'boolean' ? <Field label="Valor"><select value={String(spec.value ?? '')} onChange={(event) => updateSpec(index, event.target.value)} className={inputClass}><option value="">Sin definir</option><option value="true">Sí</option><option value="false">No</option></select></Field> : <Field label="Valor"><input value={spec.value ?? ''} onChange={(event) => updateSpec(index, event.target.value)} placeholder="Introducir valor" className={inputClass} /></Field>}<button type="button" onClick={() => removeSpec(index)} title="Quitar especificación" className="mb-0.5 rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500"><Trash2 size={15} /></button></div>)}</div>}</div>
        <div><h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-slate-500"><CalendarDays size={14} className="text-emerald-500" />Compra y garantía</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Fecha de compra"><input type="date" value={formData.purchase_date || ''} onChange={(event) => setFormData((current) => ({ ...current, purchase_date: event.target.value }))} className={inputClass} /></Field><Field label="Fin de garantía"><input type="date" value={formData.warranty_end || ''} onChange={(event) => setFormData((current) => ({ ...current, warranty_end: event.target.value }))} className={inputClass} /></Field></div></div>
        <Field label="Notas / observaciones"><textarea rows={3} value={formData.notes || ''} onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))} placeholder="Detalles adicionales, ubicación física, incidencias..." className={cn(inputClass, 'resize-y')} /></Field>
        {actionError && <p className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] p-3 text-xs text-rose-500"><AlertCircle size={15} className="mt-0.5 shrink-0" />{actionError}</p>}
      </div><div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-sm dark:border-white/[0.07] dark:bg-[#0F172A]/95 sm:flex-row sm:justify-end sm:px-6"><button type="button" onClick={() => { setShowForm(false); setEditingItem(null); }} className={secondaryButton}>Cancelar</button><button type="submit" disabled={saving} className={primaryButton}>{saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}{saving ? 'Guardando...' : editingItem ? 'Guardar cambios' : 'Registrar equipo'}</button></div></form></ModalShell>}

    {selectedItem && (() => { const item = selectedItem; const category = categoryFor(item); const Icon = category.icon || Package; const specs = Array.isArray(item.specs) ? item.specs : []; return <ModalShell title="Ficha del equipo" subtitle="Información detallada del activo." icon={Icon} onClose={() => setSelectedItem(null)} size="max-w-2xl"><div className="max-h-[calc(100dvh-8rem)] space-y-5 overflow-y-auto p-5 sm:p-6"><div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/[0.06] dark:bg-white/[0.025] sm:flex-row sm:items-center"><IconTile category={category} /><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{item.type}</p><h3 className="mt-1 break-words text-lg font-semibold text-slate-900 dark:text-white">{item.brand_model || 'Equipo sin modelo'}</h3><div className="mt-2"><StatusBadge status={item.status} /></div></div><button type="button" onClick={() => { setSelectedItem(null); openEditForm(item); }} className={secondaryButton}><Edit3 size={14} />Editar</button></div>
        <div><h3 className="mb-3 text-xs font-bold uppercase tracking-[0.13em] text-slate-500">Identificación y ubicación</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{[{ label: 'Número de serie', value: item.serial_number }, { label: 'Etiqueta de servicio', value: item.service_tag }, { label: 'Sede', value: item.branch_name }, { label: 'Dirección IP', value: item.ip_address }, { label: 'Dirección MAC', value: item.mac_address }, { label: 'Fecha de compra', value: formatDate(item.purchase_date) }, { label: 'Fin de garantía', value: formatDate(item.warranty_end) }].map((field) => <div key={field.label} className="min-w-0 rounded-lg border border-slate-200/80 px-3 py-2.5 dark:border-white/[0.06]"><p className="text-[10px] font-semibold text-slate-500">{field.label}</p><p className="mt-1 break-words text-sm text-slate-800 dark:text-slate-200">{field.value || '—'}</p></div>)}</div></div>
        {specs.length > 0 && <div><h3 className="mb-3 text-xs font-bold uppercase tracking-[0.13em] text-slate-500">Especificaciones técnicas</h3><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{specs.map((spec, index) => <div key={`${spec.key || spec.spec_key || index}`} className="rounded-lg border border-slate-200/80 px-3 py-2.5 dark:border-white/[0.06]"><p className="text-[10px] font-semibold text-slate-500">{spec.label || spec.key || spec.spec_key || 'Especificación'}</p><p className="mt-1 break-words text-sm text-slate-800 dark:text-slate-200">{spec.value ?? spec.spec_value ?? '—'}</p></div>)}</div></div>}
        {item.notes && <div><h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-slate-500"><FileText size={14} />Notas</h3><p className="whitespace-pre-wrap break-words rounded-lg border border-slate-200/80 p-3 text-sm leading-6 text-slate-700 dark:border-white/[0.06] dark:text-slate-300">{item.notes}</p></div>}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 dark:border-white/[0.07] sm:flex-row sm:justify-between"><button type="button" onClick={() => handleDelete(item)} disabled={deletingId === item.id} className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-500/20 px-3 py-2.5 text-sm font-medium text-rose-500 transition hover:bg-rose-500/10 disabled:opacity-50"><Trash2 size={15} />{deletingId === item.id ? 'Eliminando...' : 'Eliminar equipo'}</button><button type="button" onClick={() => setSelectedItem(null)} className={secondaryButton}>Cerrar ficha</button></div>
      </div></ModalShell>; })()}
  </div>;
}
