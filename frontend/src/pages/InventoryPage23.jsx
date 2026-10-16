
import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Server, Monitor, Laptop, Wifi, Printer,
  Edit, Trash2, Eye, Grid2X2, List, Package, AlertCircle,
  CheckCircle, Wrench, Folder, ChevronRight, ChevronDown,
  Cpu, HardDrive, Network, Smartphone, Tag, MapPin, Calendar,
  Save, X, PlusCircle, Trash as TrashIcon, Camera, Mic,
  Headphones, Watch, Battery, Truck, Home, Coffee, ShoppingBag,
  Gift, Heart, Star, Zap, Cloud, Lock, Shield, User, Users,
  Globe, Book, Video, Music, File, Image, MessageCircle,
  ArrowUpRight, RefreshCw, MonitorCheck, Boxes, SearchX,
  Clock3, Building2, Fingerprint, CalendarDays, SlidersHorizontal
} from 'lucide-react';
import hardwareService from '../services/hardwareService';
import branchService from '../services/branchService';

const AVAILABLE_ICONS = [
  { name: 'Monitor', icon: Monitor },
  { name: 'Laptop', icon: Laptop },
  { name: 'Printer', icon: Printer },
  { name: 'Server', icon: Server },
  { name: 'Wifi', icon: Wifi },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Camera', icon: Camera },
  { name: 'Mic', icon: Mic },
  { name: 'Headphones', icon: Headphones },
  { name: 'Watch', icon: Watch },
  { name: 'Battery', icon: Battery },
  { name: 'Truck', icon: Truck },
  { name: 'Home', icon: Home },
  { name: 'Coffee', icon: Coffee },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Gift', icon: Gift },
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'Zap', icon: Zap },
  { name: 'Cloud', icon: Cloud },
  { name: 'Lock', icon: Lock },
  { name: 'Shield', icon: Shield },
  { name: 'User', icon: User },
  { name: 'Users', icon: Users },
  { name: 'Globe', icon: Globe },
  { name: 'Book', icon: Book },
  { name: 'Video', icon: Video },
  { name: 'Music', icon: Music },
  { name: 'File', icon: File },
  { name: 'Image', icon: Image },
  { name: 'MessageCircle', icon: MessageCircle },
  { name: 'Cpu', icon: Cpu },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Network', icon: Network },
  { name: 'Package', icon: Package }
];

const DEFAULT_CATEGORIES = {
  'Fiscal Printer': {
    name: 'Impresoras fiscales',
    icon: 'Printer',
    color: 'from-orange-500 to-red-500',
    accent: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    defaultSpecs: [
      { key: 'brand', label: 'Marca', type: 'text', placeholder: 'Epson, Hasar, etc.' },
      { key: 'model', label: 'Modelo', type: 'text', placeholder: 'Modelo del equipo' },
      { key: 'firmware', label: 'Versión de firmware', type: 'text', placeholder: 'v1.2.3' },
      { key: 'port', label: 'Puerto', type: 'select', options: ['USB', 'Serial', 'Ethernet', 'Bluetooth'] },
      { key: 'has_display', label: 'Tiene display', type: 'boolean' },
      { key: 'has_barcode', label: 'Lector de código de barras', type: 'boolean' },
      { key: 'paper_width', label: 'Ancho de papel', type: 'text', placeholder: '80 mm, 58 mm' }
    ]
  },
  Desktop: {
    name: 'Computadoras de escritorio',
    icon: 'Monitor',
    color: 'from-blue-500 to-cyan-500',
    accent: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    defaultSpecs: [
      { key: 'cpu', label: 'Procesador', type: 'text', placeholder: 'Intel Core i5-12400' },
      { key: 'ram', label: 'Memoria RAM', type: 'text', placeholder: '16 GB DDR4' },
      { key: 'storage', label: 'Almacenamiento', type: 'text', placeholder: '512 GB SSD' },
      { key: 'os', label: 'Sistema operativo', type: 'text', placeholder: 'Windows 11 Pro' }
    ]
  },
  Laptop: {
    name: 'Laptops',
    icon: 'Laptop',
    color: 'from-emerald-500 to-teal-500',
    accent: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    defaultSpecs: [
      { key: 'cpu', label: 'Procesador', type: 'text', placeholder: 'Intel Core i7' },
      { key: 'ram', label: 'Memoria RAM', type: 'text', placeholder: '16 GB DDR5' },
      { key: 'storage', label: 'Almacenamiento', type: 'text', placeholder: '1 TB SSD NVMe' },
      { key: 'os', label: 'Sistema operativo', type: 'text', placeholder: 'Windows 11 Pro' }
    ]
  },
  Server: {
    name: 'Servidores',
    icon: 'Server',
    color: 'from-violet-500 to-indigo-500',
    accent: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    defaultSpecs: [
      { key: 'cpu', label: 'Procesador', type: 'text', placeholder: 'Intel Xeon' },
      { key: 'ram', label: 'Memoria RAM', type: 'text', placeholder: '64 GB ECC' },
      { key: 'storage', label: 'Almacenamiento', type: 'text', placeholder: '2 × 1 TB SSD RAID 1' },
      { key: 'os', label: 'Sistema operativo', type: 'text', placeholder: 'Windows Server 2022' }
    ]
  },
  'Network Device': {
    name: 'Equipos de red',
    icon: 'Wifi',
    color: 'from-cyan-500 to-blue-500',
    accent: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    defaultSpecs: [
      { key: 'device_type', label: 'Tipo de equipo', type: 'select', options: ['Router', 'Switch', 'Access Point', 'Firewall', 'Modem'] },
      { key: 'firmware', label: 'Versión de firmware', type: 'text', placeholder: 'v1.0.0' },
      { key: 'ports', label: 'Puertos', type: 'text', placeholder: '24 puertos Gigabit' }
    ]
  },
  POS: {
    name: 'Puntos de venta (POS)',
    icon: 'Smartphone',
    color: 'from-pink-500 to-rose-500',
    accent: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    defaultSpecs: [
      { key: 'pos_software', label: 'Software POS', type: 'text', placeholder: 'Software instalado' },
      { key: 'touchscreen', label: 'Pantalla táctil', type: 'boolean' }
    ]
  }
};

const COLOR_OPTIONS = [
  'from-red-500 to-orange-500',
  'from-orange-500 to-yellow-500',
  'from-green-500 to-teal-500',
  'from-teal-500 to-cyan-500',
  'from-cyan-500 to-blue-500',
  'from-blue-500 to-indigo-500',
  'from-indigo-500 to-violet-500',
  'from-violet-500 to-purple-500',
  'from-purple-500 to-pink-500',
  'from-pink-500 to-rose-500',
  'from-slate-500 to-gray-500'
];

const EMPTY_FORM = {
  type: '',
  brand_model: '',
  serial_number: '',
  service_tag: '',
  ip_address: '',
  mac_address: '',
  status: 'active',
  branch_id: '',
  purchase_date: '',
  warranty_end: '',
  notes: '',
  specs: []
};

const SURFACE = 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/[0.08]';
const MUTED = 'text-slate-500 dark:text-slate-400';
const HEADING = 'text-slate-900 dark:text-slate-100';
const INPUT = 'w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1220] px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60';

function readCustomCategories() {
  try {
    const saved = localStorage.getItem('customCategories');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function normalizeSpecs(specs = []) {
  return specs.map(spec => ({
    key: spec.key ?? spec.spec_key ?? '',
    value: spec.value ?? spec.spec_value ?? '',
    label: spec.label ?? spec.key ?? spec.spec_key ?? '',
    type: spec.type ?? 'text',
    options: spec.options ?? [],
    placeholder: spec.placeholder ?? '',
    isCustom: spec.isCustom ?? false
  }));
}

function StatusBadge({ status }) {
  const config = {
    active: {
      label: 'Activo',
      icon: CheckCircle,
      classes: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    repair: {
      label: 'En reparación',
      icon: Wrench,
      classes: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    damaged: {
      label: 'Dañado',
      icon: AlertCircle,
      classes: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
    }
  };

  const item = config[status] || config.active;
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${item.classes}`}>
      <Icon size={12} />
      {item.label}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {children}
    </label>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone, description }) {
  const tones = {
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
  };

  return (
    <div className={`${SURFACE} rounded-xl p-4 transition duration-200 hover:border-indigo-500/25`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-medium ${MUTED}`}>{label}</p>
          <p className={`mt-2 text-2xl font-bold tracking-tight ${HEADING}`}>{value ?? 0}</p>
          {description && <p className={`mt-1 text-[11px] ${MUTED}`}>{description}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${tones[tone] || tones.indigo}`}>
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [hardware, setHardware] = useState([]);
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customCategories, setCustomCategories] = useState(readCustomCategories);

  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'Package',
    color: 'from-slate-500 to-gray-500'
  });

  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const allCategories = useMemo(
    () => ({ ...DEFAULT_CATEGORIES, ...customCategories }),
    [customCategories]
  );

  const loadData = async () => {
    setLoadError('');

    try {
      const [hardwareData, statsData, branchesData] = await Promise.all([
        hardwareService.getAll(),
        hardwareService.getStats(),
        branchService.getAll()
      ]);

      setHardware(Array.isArray(hardwareData) ? hardwareData : []);
      setStats(statsData || null);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
    } catch (error) {
      console.error('Error loading hardware:', error);
      setLoadError(
        error.response?.data?.error ||
        'No se pudo cargar el inventario. Comprueba la conexión e inténtalo nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return hardware.filter(item => {
      const matchesCategory = !selectedCategory || item.type === selectedCategory;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      const searchable = [
        item.type,
        item.brand_model,
        item.serial_number,
        item.service_tag,
        item.ip_address,
        item.mac_address,
        item.branch_name,
        item.notes,
        ...(item.specs || []).flatMap(spec => [
          spec.spec_key,
          spec.spec_value,
          spec.key,
          spec.value
        ])
      ].filter(Boolean).join(' ').toLowerCase();

      return matchesCategory && matchesStatus && (!query || searchable.includes(query));
    });
  }, [hardware, selectedCategory, statusFilter, searchTerm]);

  const getCategoryIcon = (categoryName) => {
    const iconName = allCategories[categoryName]?.icon || 'Package';
    return AVAILABLE_ICONS.find(icon => icon.name === iconName)?.icon || Package;
  };

  const getItemCountByCategory = (category) =>
    hardware.filter(item => item.type === category).length;

  const resetForm = () => setFormData({ ...EMPTY_FORM, specs: [] });

  const openCreateForm = () => {
    setEditingItem(null);
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);

    const category = allCategories[item.type];
    const savedSpecs = normalizeSpecs(item.specs || []);

    // Mantiene las especificaciones definidas por la categoría, incluso
    // cuando algún valor todavía no se ha guardado.
    const categorySpecs = (category?.defaultSpecs || []).map(spec => {
      const saved = savedSpecs.find(entry => entry.key === spec.key);

      return {
        ...spec,
        value: saved?.value ?? '',
        isCustom: false
      };
    });

    const extraSpecs = savedSpecs.filter(
      spec => !categorySpecs.some(entry => entry.key === spec.key)
    ).map(spec => ({
      ...spec,
      label: spec.label || spec.key,
      isCustom: true
    }));

    setFormData({
      ...EMPTY_FORM,
      ...item,
      branch_id: item.branch_id == null ? '' : String(item.branch_id),
      specs: [...categorySpecs, ...extraSpecs]
    });

    setSelectedItem(null);
    setShowForm(true);
  };

  const handleTypeChange = (type) => {
    const category = allCategories[type];

    const specs = (category?.defaultSpecs || []).map(spec => ({
      ...spec,
      value: '',
      isCustom: false
    }));

    setFormData(current => ({ ...current, type, specs }));
  };

  const handleSpecChange = (index, value) => {
    setFormData(current => ({
      ...current,
      specs: current.specs.map((spec, i) =>
        i === index ? { ...spec, value } : spec
      )
    }));
  };

  const addCustomSpec = () => {
    setFormData(current => ({
      ...current,
      specs: [
        ...current.specs,
        { key: '', value: '', label: '', type: 'text', isCustom: true }
      ]
    }));
  };

  const updateSpecKey = (index, key) => {
    setFormData(current => ({
      ...current,
      specs: current.specs.map((spec, i) =>
        i === index ? { ...spec, key, label: key } : spec
      )
    }));
  };

  const removeSpec = (index) => {
    setFormData(current => ({
      ...current,
      specs: current.specs.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.type) {
      alert('Selecciona un tipo de equipo.');
      return;
    }

    if (!formData.brand_model?.trim()) {
      alert('Ingresa la marca o modelo del equipo.');
      return;
    }

    const customSpecWithoutKey = formData.specs.some(
      spec => spec.isCustom && spec.value !== '' && !spec.key.trim()
    );

    if (customSpecWithoutKey) {
      alert('Completa el nombre de cada especificación personalizada que tenga un valor.');
      return;
    }

    setSaving(true);

    try {
      const specs = formData.specs
        .filter(spec => spec.key?.trim() && spec.value !== '' && spec.value != null)
        .map(spec => ({
          key: spec.key.trim(),
          value: String(spec.value)
        }));

      const dataToSave = {
        ...formData,
        brand_model: formData.brand_model.trim(),
        branch_id: formData.branch_id === '' ? null : formData.branch_id,
        specs
      };

      if (editingItem) {
        await hardwareService.update(editingItem.id, dataToSave);
      } else {
        await hardwareService.create(dataToSave);
      }

      await loadData();
      setShowForm(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving hardware:', error);
      alert(
        'No se pudo guardar el equipo: ' +
        (error.response?.data?.error || error.message || 'Error desconocido')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este equipo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await hardwareService.delete(id);

      if (selectedItem?.id === id) setSelectedItem(null);

      await loadData();
    } catch (error) {
      console.error('Error deleting hardware:', error);
      alert(error.response?.data?.error || 'No se pudo eliminar el equipo.');
    }
  };

  const addCustomCategory = () => {
    const name = newCategory.name.trim();

    if (!name) {
      alert('Ingresa un nombre para la categoría.');
      return;
    }

    const categoryKey = name.replace(/\s+/g, '_');

    if (allCategories[categoryKey]) {
      alert('Ya existe una categoría con esa clave. Prueba con otro nombre.');
      return;
    }

    const updated = {
      ...customCategories,
      [categoryKey]: {
        name,
        icon: newCategory.icon,
        color: newCategory.color,
        accent: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/20',
        defaultSpecs: []
      }
    };

    setCustomCategories(updated);
    localStorage.setItem('customCategories', JSON.stringify(updated));
    setShowCategoryForm(false);
    setNewCategory({
      name: '',
      icon: 'Package',
      color: 'from-slate-500 to-gray-500'
    });
  };

  const deleteCustomCategory = (categoryKey) => {
    const category = customCategories[categoryKey];

    if (!category) return;

    const categoryCount = getItemCountByCategory(categoryKey);

    const message = categoryCount > 0
      ? `La categoría "${category.name}" tiene ${categoryCount} equipo(s). Se eliminará la categoría, pero los equipos existentes no serán borrados. ¿Continuar?`
      : `¿Eliminar la categoría "${category.name}"?`;

    if (!window.confirm(message)) return;

    const updated = { ...customCategories };
    delete updated[categoryKey];

    setCustomCategories(updated);
    localStorage.setItem('customCategories', JSON.stringify(updated));

    if (selectedCategory === categoryKey) setSelectedCategory(null);
  };

  const getBranchName = (item) => {
    if (item.branch_name) return item.branch_name;

    const branch = branches.find(b => String(b.id) === String(item.branch_id));
    return branch?.name || '';
  };

  const total = stats?.total ?? hardware.length;
  const active = stats?.active ?? hardware.filter(i => i.status === 'active').length;
  const repair = stats?.repair ?? hardware.filter(i => i.status === 'repair').length;
  const damaged = stats?.damaged ?? hardware.filter(i => i.status === 'damaged').length;

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[1600px] items-center justify-center p-6">
        <div className={`${SURFACE} flex items-center gap-3 rounded-xl px-5 py-4 shadow-sm`}>
          <RefreshCw size={18} className="animate-spin text-indigo-500" />
          <span className={`text-sm ${MUTED}`}>Cargando inventario de hardware...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6">
      {/* Cabecera */}
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-400">
            <Package size={24} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={`text-2xl font-bold tracking-tight ${HEADING}`}>
                Inventario de hardware
              </h1>
              <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                IT Assets
              </span>
            </div>
            <p className={`mt-1 max-w-2xl text-sm ${MUTED}`}>
              Control centralizado de equipos, infraestructura, sucursales y garantías.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCategoryForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.07]"
          >
            <Folder size={16} />
            <span>Nueva categoría</span>
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-[0.98]"
          >
            <Plus size={17} />
            Agregar equipo
          </button>
        </div>
      </header>

      {/* Indicadores */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard
          label="Total de equipos"
          value={total}
          icon={Boxes}
          tone="indigo"
          description="Activos registrados"
        />
        <StatCard
          label="En funcionamiento"
          value={active}
          icon={MonitorCheck}
          tone="emerald"
          description="Estado activo"
        />
        <StatCard
          label="En reparación"
          value={repair}
          icon={Wrench}
          tone="amber"
          description="Requieren atención"
        />
        <StatCard
          label="Dañados"
          value={damaged}
          icon={AlertCircle}
          tone="rose"
          description="Fuera de servicio"
        />
        <StatCard
          label="Sucursales"
          value={branches.length}
          icon={Building2}
          tone="cyan"
          description="Ubicaciones disponibles"
        />
      </section>

      {/* Mensaje de error */}
      {loadError && (
        <div className="flex flex-col gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle size={19} className="mt-0.5 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                No se pudo actualizar el inventario
              </p>
              <p className={`mt-1 text-sm ${MUTED}`}>{loadError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-rose-500/20 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-500/10 sm:self-center"
          >
            <RefreshCw size={14} />
            Reintentar
          </button>
        </div>
      )}

      {/* Inventario */}
      <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
        {/* Categorías */}
        <aside className={`${SURFACE} overflow-hidden rounded-xl`}>
          <div className="border-b border-slate-200 p-4 dark:border-white/[0.07]">
            <div className="flex items-center justify-between gap-2">
              <h2 className={`text-sm font-semibold ${HEADING}`}>Categorías</h2>
              <span className={`text-xs ${MUTED}`}>{Object.keys(allCategories).length}</span>
            </div>
            <p className={`mt-1 text-xs ${MUTED}`}>Filtra por tipo de equipo.</p>
          </div>

          <div className="space-y-1 p-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                selectedCategory === null
                  ? 'bg-indigo-500/10 font-semibold text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.04]'
              }`}
            >
              <Boxes size={17} />
              <span className="flex-1">Todos los equipos</span>
              <span className={`rounded-md px-1.5 py-0.5 text-xs ${
                selectedCategory === null
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400'
              }`}>
                {hardware.length}
              </span>
            </button>

            {Object.entries(allCategories).map(([key, category]) => {
              const Icon = getCategoryIcon(key);
              const selected = selectedCategory === key;
              const count = getItemCountByCategory(key);

              return (
                <div key={key} className="group/category">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(selected ? null : key)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      selected
                        ? 'bg-indigo-500/10 font-semibold text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon size={17} className={selected ? 'text-indigo-500' : MUTED} />
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                    <span className={`text-xs ${MUTED}`}>{count}</span>
                    {selected && <ChevronRight size={14} />}
                  </button>

                  {customCategories[key] && (
                    <div className="flex justify-end px-3 pb-1 opacity-100 transition sm:opacity-0 sm:group-hover/category:opacity-100">
                      <button
                        type="button"
                        onClick={() => deleteCustomCategory(key)}
                        className="text-[11px] text-rose-500 transition hover:text-rose-600"
                      >
                        Eliminar categoría
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 p-3 dark:border-white/[0.07]">
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-white/[0.03]">
              <Shield size={15} className="mt-0.5 shrink-0 text-indigo-500" />
              <p className={`text-[11px] leading-relaxed ${MUTED}`}>
                Las categorías personalizadas se guardan en este navegador. Los equipos permanecen registrados en el backend.
              </p>
            </div>
          </div>
        </aside>

        {/* Panel principal */}
        <div className="min-w-0 space-y-4">
          {/* Búsqueda y controles */}
          <div className={`${SURFACE} flex flex-col gap-3 rounded-xl p-3 sm:flex-row sm:items-center`}>
            <div className="relative min-w-0 flex-1">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Buscar por equipo, modelo, serial, IP o sucursal..."
                className={`${INPUT} pl-9`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <SlidersHorizontal size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={event => setStatusFilter(event.target.value)}
                  className={`${INPUT} min-w-[145px] pl-8`}
                  aria-label="Filtrar por estado"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="repair">En reparación</option>
                  <option value="damaged">Dañado</option>
                </select>
              </div>

              <div className="flex items-center rounded-lg border border-slate-200 p-1 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Vista de tarjetas"
                  aria-label="Vista de tarjetas"
                  className={`rounded-md p-2 transition ${
                    viewMode === 'grid'
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <Grid2X2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  title="Vista de lista"
                  aria-label="Vista de lista"
                  className={`rounded-md p-2 transition ${
                    viewMode === 'list'
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <List size={17} />
                </button>
              </div>
            </div>
          </div>

          {/* Título de resultados */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className={`text-base font-semibold ${HEADING}`}>
                {selectedCategory ? allCategories[selectedCategory]?.name : 'Todos los activos'}
              </h2>
              <p className={`mt-0.5 text-xs ${MUTED}`}>
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                {searchTerm ? ` para "${searchTerm}"` : ''}
              </p>
            </div>

            {(selectedCategory || searchTerm || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-xs font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Cuadrícula */}
          {filtered.length > 0 ? (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3'
              : 'flex flex-col gap-2'
            }>
              {filtered.map(item => {
                const category = allCategories[item.type];
                const Icon = getCategoryIcon(item.type);
                const specs = item.specs || [];
                const branchName = getBranchName(item);

                if (viewMode === 'list') {
                  return (
                    <article
                      key={item.id}
                      className={`${SURFACE} group flex flex-col gap-3 rounded-xl p-4 transition hover:border-indigo-500/30 sm:flex-row sm:items-center`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className={`shrink-0 rounded-lg border p-3 ${category?.bgColor || 'bg-slate-500/10'} ${category?.borderColor || 'border-slate-500/20'}`}>
                          <Icon size={21} className={category?.accent || 'text-slate-500'} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-semibold ${HEADING}`}>
                            {item.brand_model || 'Sin modelo'}
                          </p>
                          <p className={`mt-1 truncate text-xs ${MUTED}`}>
                            {category?.name || item.type}
                            {branchName ? ` · ${branchName}` : ''}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.serial_number && (
                              <span className={`font-mono text-[11px] ${MUTED}`}>
                                S/N: {item.serial_number}
                              </span>
                            )}
                            {item.ip_address && (
                              <span className={`font-mono text-[11px] ${MUTED}`}>
                                IP: {item.ip_address}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-white/[0.06] sm:border-0 sm:pt-0">
                        <StatusBadge status={item.status} />
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setSelectedItem(item)} title="Ver detalles" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-500 dark:hover:bg-white/[0.06]">
                            <Eye size={16} />
                          </button>
                          <button type="button" onClick={() => openEditForm(item)} title="Editar equipo" className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-500/10 hover:text-indigo-500">
                            <Edit size={16} />
                          </button>
                          <button type="button" onClick={() => handleDelete(item.id)} title="Eliminar equipo" className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }

                return (
                  <article
                    key={item.id}
                    className={`${SURFACE} group relative overflow-hidden rounded-xl transition duration-200 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-950/[0.04]`}
                  >
                    <div className={`h-1 bg-gradient-to-r ${category?.color || 'from-slate-500 to-slate-600'}`} />

                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 rounded-xl border p-3 ${category?.bgColor || 'bg-slate-500/10'} ${category?.borderColor || 'border-slate-500/20'}`}>
                          <Icon size={23} className={category?.accent || 'text-slate-500'} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-semibold ${HEADING}`} title={item.brand_model}>
                            {item.brand_model || 'Sin modelo'}
                          </p>
                          <p className={`mt-1 truncate text-xs ${MUTED}`}>
                            {category?.name || item.type}
                          </p>
                          {branchName && (
                            <p className={`mt-1.5 flex items-center gap-1 truncate text-xs ${MUTED}`}>
                              <MapPin size={12} className="shrink-0" />
                              {branchName}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          title="Ver detalles"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-500/10 hover:text-indigo-500"
                        >
                          <Eye size={16} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <StatusBadge status={item.status} />
                        {item.serial_number && (
                          <span className={`max-w-[130px] truncate font-mono text-[10px] ${MUTED}`} title={item.serial_number}>
                            S/N {item.serial_number}
                          </span>
                        )}
                      </div>

                      <div className="my-3 border-t border-slate-100 dark:border-white/[0.07]" />

                      <div className="min-h-[68px] space-y-2">
                        {specs.slice(0, 3).map((spec, index) => {
                          const key = spec.spec_key ?? spec.key;
                          const value = spec.spec_value ?? spec.value;

                          if (!value) return null;

                          return (
                            <div key={`${key}-${index}`} className="flex items-start justify-between gap-3 text-xs">
                              <span className={`shrink-0 ${MUTED}`}>
                                {key || 'Especificación'}
                              </span>
                              <span className={`max-w-[65%] truncate text-right font-medium ${HEADING}`} title={String(value)}>
                                {String(value)}
                              </span>
                            </div>
                          );
                        })}

                        {specs.filter(spec => spec.spec_value ?? spec.value).length === 0 && (
                          <p className={`text-xs italic ${MUTED}`}>
                            Sin especificaciones adicionales
                          </p>
                        )}
                      </div>

                      {(item.ip_address || item.service_tag) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.ip_address && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-600 dark:bg-white/[0.05] dark:text-slate-300">
                              <Network size={11} />
                              {item.ip_address}
                            </span>
                          )}
                          {item.service_tag && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-600 dark:bg-white/[0.05] dark:text-slate-300">
                              <Fingerprint size={11} />
                              {item.service_tag}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/[0.07]">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
                        >
                          Ver detalles
                          <ArrowUpRight size={13} />
                        </button>

                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => openEditForm(item)} title="Editar equipo" className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-500/10 hover:text-indigo-500">
                            <Edit size={15} />
                          </button>
                          <button type="button" onClick={() => handleDelete(item.id)} title="Eliminar equipo" className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={`${SURFACE} flex min-h-[280px] flex-col items-center justify-center rounded-xl px-5 py-12 text-center`}>
              <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/[0.04]">
                {searchTerm ? (
                  <SearchX size={28} className="text-slate-400" />
                ) : (
                  <Package size={28} className="text-slate-400" />
                )}
              </div>

              <h3 className={`mt-4 text-base font-semibold ${HEADING}`}>
                {searchTerm || statusFilter !== 'all'
                  ? 'No encontramos equipos'
                  : 'Esta categoría está vacía'}
              </h3>

              <p className={`mt-1 max-w-sm text-sm ${MUTED}`}>
                {searchTerm || statusFilter !== 'all'
                  ? 'Prueba con otro término o modifica los filtros.'
                  : 'Registra un equipo para comenzar a organizar tus activos.'}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(searchTerm || statusFilter !== 'all' || selectedCategory) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setSelectedCategory(null);
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                  >
                    Limpiar filtros
                  </button>
                )}
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  <Plus size={15} />
                  Agregar equipo
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal de categoría */}
      {showCategoryForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowCategoryForm(false);
          }}
        >
          <div className={`${SURFACE} my-auto w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl`}>
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-white/[0.08]">
              <div>
                <h2 className={`text-lg font-semibold ${HEADING}`}>Nueva categoría</h2>
                <p className={`mt-1 text-xs ${MUTED}`}>Personaliza cómo organizas tus equipos.</p>
              </div>
              <button type="button" onClick={() => setShowCategoryForm(false)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/[0.06]">
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <Field label="Nombre de la categoría">
                <input
                  autoFocus
                  value={newCategory.name}
                  onChange={event => setNewCategory(current => ({ ...current, name: event.target.value }))}
                  placeholder="Ej. Lectores de código de barras"
                  className={INPUT}
                  maxLength={60}
                />
              </Field>

              <Field label="Selecciona un icono">
                <div className="grid max-h-40 grid-cols-6 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-white/10">
                  {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      aria-label={`Seleccionar icono ${name}`}
                      onClick={() => setNewCategory(current => ({ ...current, icon: name }))}
                      className={`flex aspect-square items-center justify-center rounded-lg transition ${
                        newCategory.icon === name
                          ? 'bg-indigo-500/15 text-indigo-600 ring-1 ring-indigo-500/40 dark:text-indigo-400'
                          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <Icon size={19} />
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Color de la categoría">
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      type="button"
                      title={color}
                      aria-label={`Seleccionar color ${color}`}
                      onClick={() => setNewCategory(current => ({ ...current, color }))}
                      className={`h-9 rounded-lg bg-gradient-to-r ${color} transition hover:scale-105 ${
                        newCategory.color === color
                          ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-[#111827]'
                          : ''
                      }`}
                    />
                  ))}
                </div>
              </Field>

              <div className="flex gap-2 border-t border-slate-200 pt-4 dark:border-white/[0.08]">
                <button type="button" onClick={() => setShowCategoryForm(false)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]">
                  Cancelar
                </button>
                <button type="button" onClick={addCustomCategory} className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
                  <Plus size={15} className="mr-1.5 inline" />
                  Crear categoría
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación y edición */}
      {showForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
              setEditingItem(null);
              resetForm();
            }
          }}
        >
          <div className={`${SURFACE} my-auto flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl shadow-2xl`}>
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-4 sm:p-5 dark:border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-500">
                  {editingItem ? <Edit size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${HEADING}`}>
                    {editingItem ? 'Editar equipo' : 'Registrar equipo'}
                  </h2>
                  <p className={`mt-0.5 text-xs ${MUTED}`}>
                    {editingItem ? `Editando activo #${editingItem.id}` : 'Completa la información del activo.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-6 p-4 sm:p-6">
                {/* Identificación */}
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <Package size={16} className="text-indigo-500" />
                    <h3 className={`text-sm font-semibold ${HEADING}`}>Identificación del activo</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Tipo de equipo *" className="sm:col-span-2">
                      <select
                        value={formData.type}
                        onChange={event => handleTypeChange(event.target.value)}
                        className={INPUT}
                        required
                        disabled={Boolean(editingItem)}
                      >
                        <option value="">Seleccionar categoría...</option>
                        {Object.entries(allCategories).map(([key, category]) => (
                          <option key={key} value={key}>{category.name}</option>
                        ))}
                      </select>
                      {editingItem && (
                        <p className={`mt-1.5 text-[11px] ${MUTED}`}>
                          El tipo de un activo existente no se cambia desde este formulario.
                        </p>
                      )}
                    </Field>

                    <Field label="Marca / modelo *">
                      <input
                        value={formData.brand_model || ''}
                        onChange={event => setFormData(current => ({ ...current, brand_model: event.target.value }))}
                        className={INPUT}
                        placeholder="Ej. Dell OptiPlex 7090"
                        required
                      />
                    </Field>

                    <Field label="Número de serie">
                      <input
                        value={formData.serial_number || ''}
                        onChange={event => setFormData(current => ({ ...current, serial_number: event.target.value }))}
                        className={`${INPUT} font-mono`}
                        placeholder="Número de serie"
                      />
                    </Field>

                    <Field label="Service Tag">
                      <input
                        value={formData.service_tag || ''}
                        onChange={event => setFormData(current => ({ ...current, service_tag: event.target.value }))}
                        className={`${INPUT} font-mono`}
                        placeholder="Dell, HP, etc."
                      />
                    </Field>

                    <Field label="Estado">
                      <select
                        value={formData.status || 'active'}
                        onChange={event => setFormData(current => ({ ...current, status: event.target.value }))}
                        className={INPUT}
                      >
                        <option value="active">Activo</option>
                        <option value="repair">En reparación</option>
                        <option value="damaged">Dañado</option>
                      </select>
                    </Field>
                  </div>
                </section>

                <div className="border-t border-slate-200 dark:border-white/[0.07]" />

                {/* Red y ubicación */}
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <Network size={16} className="text-cyan-500" />
                    <h3 className={`text-sm font-semibold ${HEADING}`}>Red y ubicación</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Dirección IP">
                      <input
                        value={formData.ip_address || ''}
                        onChange={event => setFormData(current => ({ ...current, ip_address: event.target.value }))}
                        className={`${INPUT} font-mono`}
                        placeholder="192.168.1.100"
                      />
                    </Field>

                    <Field label="Dirección MAC">
                      <input
                        value={formData.mac_address || ''}
                        onChange={event => setFormData(current => ({ ...current, mac_address: event.target.value }))}
                        className={`${INPUT} font-mono`}
                        placeholder="AA:BB:CC:DD:EE:FF"
                      />
                    </Field>

                    <Field label="Sucursal">
                      <select
                        value={formData.branch_id ?? ''}
                        onChange={event => setFormData(current => ({ ...current, branch_id: event.target.value }))}
                        className={INPUT}
                      >
                        <option value="">Sin sucursal asignada</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </section>

                <div className="border-t border-slate-200 dark:border-white/[0.07]" />

                {/* Fechas */}
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <CalendarDays size={16} className="text-violet-500" />
                    <h3 className={`text-sm font-semibold ${HEADING}`}>Compra y garantía</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Fecha de compra">
                      <input
                        type="date"
                        value={formData.purchase_date || ''}
                        onChange={event => setFormData(current => ({ ...current, purchase_date: event.target.value }))}
                        className={INPUT}
                      />
                    </Field>

                    <Field label="Fin de garantía">
                      <input
                        type="date"
                        value={formData.warranty_end || ''}
                        onChange={event => setFormData(current => ({ ...current, warranty_end: event.target.value }))}
                        className={INPUT}
                      />
                    </Field>
                  </div>
                </section>

                {/* Especificaciones */}
                {formData.type && (
                  <>
                    <div className="border-t border-slate-200 dark:border-white/[0.07]" />

                    <section>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className={`text-sm font-semibold ${HEADING}`}>Especificaciones técnicas</h3>
                          <p className={`mt-1 text-xs ${MUTED}`}>
                            Campos adaptados al tipo de equipo.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={addCustomSpec}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-500/10 dark:text-indigo-400"
                        >
                          <PlusCircle size={14} />
                          Añadir campo
                        </button>
                      </div>

                      {formData.specs.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-200 p-5 text-center dark:border-white/10">
                          <Cpu size={22} className="mx-auto text-slate-400" />
                          <p className={`mt-2 text-xs ${MUTED}`}>
                            No hay especificaciones definidas. Puedes añadir campos personalizados.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formData.specs.map((spec, index) => (
                            <div key={`${spec.key}-${index}`} className="grid grid-cols-1 items-start gap-2 rounded-lg border border-slate-200 p-3 dark:border-white/[0.08] sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]">
                              <div>
                                {spec.isCustom ? (
                                  <input
                                    value={spec.key}
                                    onChange={event => updateSpecKey(index, event.target.value)}
                                    placeholder="Nombre del campo"
                                    className={INPUT}
                                  />
                                ) : (
                                  <p className={`py-2.5 text-sm font-medium ${HEADING}`}>
                                    {spec.label || spec.key}
                                  </p>
                                )}
                              </div>

                              <div>
                                {spec.type === 'select' ? (
                                  <select
                                    value={spec.value ?? ''}
                                    onChange={event => handleSpecChange(index, event.target.value)}
                                    className={INPUT}
                                  >
                                    <option value="">Seleccionar...</option>
                                    {(spec.options || []).map(option => (
                                      <option key={option} value={option}>{option}</option>
                                    ))}
                                  </select>
                                ) : spec.type === 'boolean' ? (
                                  <label className="flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-200 px-3 dark:border-white/10">
                                    <input
                                      type="checkbox"
                                      checked={spec.value === 'true' || spec.value === true}
                                      onChange={event => handleSpecChange(index, event.target.checked ? 'true' : 'false')}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className={`text-sm ${HEADING}`}>
                                      {spec.value === 'true' || spec.value === true ? 'Sí' : 'No'}
                                    </span>
                                  </label>
                                ) : (
                                  <input
                                    value={spec.value ?? ''}
                                    onChange={event => handleSpecChange(index, event.target.value)}
                                    placeholder={spec.placeholder || 'Valor'}
                                    className={INPUT}
                                  />
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => removeSpec(index)}
                                title="Quitar especificación"
                                className="justify-self-end rounded-lg p-2.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500 sm:mt-0.5"
                              >
                                <TrashIcon size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </>
                )}

                <div className="border-t border-slate-200 dark:border-white/[0.07]" />

                <Field label="Notas y observaciones">
                  <textarea
                    value={formData.notes || ''}
                    onChange={event => setFormData(current => ({ ...current, notes: event.target.value }))}
                    rows={3}
                    className={`${INPUT} resize-y`}
                    placeholder="Mantenimiento, particularidades, ubicación física exacta..."
                  />
                </Field>
              </div>

              <div className="sticky bottom-0 flex gap-2 border-t border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#111827] sm:px-6">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? 'Guardando...' : editingItem ? 'Guardar cambios' : 'Registrar equipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setSelectedItem(null);
          }}
        >
          <div className={`${SURFACE} my-auto max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl shadow-2xl`}>
            {(() => {
              const item = selectedItem;
              const category = allCategories[item.type];
              const Icon = getCategoryIcon(item.type);
              const specs = item.specs || [];
              const branchName = getBranchName(item);

              return (
                <>
                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 p-4 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#111827]/95 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl border p-3 ${category?.bgColor || 'bg-slate-500/10'} ${category?.borderColor || 'border-slate-500/20'}`}>
                        <Icon size={22} className={category?.accent || 'text-slate-500'} />
                      </div>
                      <div className="min-w-0">
                        <h2 className={`text-base font-semibold ${HEADING}`}>Detalles del equipo</h2>
                        <p className={`mt-0.5 truncate text-xs ${MUTED}`}>
                          {item.brand_model || item.type}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedItem(null)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/[0.06]">
                      <X size={19} />
                    </button>
                  </div>

                  <div className="space-y-5 p-4 sm:p-5">
                    <div className={`rounded-xl border p-4 ${category?.bgColor || 'bg-indigo-500/5'} ${category?.borderColor || 'border-indigo-500/20'}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className={`text-xs ${MUTED}`}>Categoría</p>
                          <h3 className={`mt-1 text-lg font-bold ${HEADING}`}>
                            {category?.name || item.type}
                          </h3>
                          <p className={`mt-1 text-xs ${MUTED}`}>
                            Identificador: #{item.id}
                          </p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>

                    <section>
                      <h3 className={`mb-3 text-sm font-semibold ${HEADING}`}>Información general</h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                          { label: 'Marca / modelo', value: item.brand_model, icon: Package },
                          { label: 'Número de serie', value: item.serial_number, icon: Fingerprint, mono: true },
                          { label: 'Service Tag', value: item.service_tag, icon: Tag, mono: true },
                          { label: 'Sucursal', value: branchName, icon: MapPin },
                          { label: 'Dirección IP', value: item.ip_address, icon: Network, mono: true },
                          { label: 'Dirección MAC', value: item.mac_address, icon: Network, mono: true },
                          { label: 'Fecha de compra', value: item.purchase_date ? String(item.purchase_date).slice(0, 10) : '', icon: Calendar },
                          { label: 'Fin de garantía', value: item.warranty_end ? String(item.warranty_end).slice(0, 10) : '', icon: Clock3 }
                        ].map(field => {
                          const FieldIcon = field.icon;

                          return (
                            <div key={field.label} className="rounded-lg border border-slate-200 p-3 dark:border-white/[0.08]">
                              <p className={`flex items-center gap-1.5 text-[11px] ${MUTED}`}>
                                <FieldIcon size={12} />
                                {field.label}
                              </p>
                              <p className={`mt-2 break-words text-sm font-medium ${field.mono ? 'font-mono' : ''} ${HEADING}`}>
                                {field.value || 'No especificado'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {specs.length > 0 && (
                      <section>
                        <h3 className={`mb-3 text-sm font-semibold ${HEADING}`}>Especificaciones técnicas</h3>
                        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/[0.08]">
                          {specs.map((spec, index) => {
                            const key = spec.spec_key ?? spec.key;
                            const value = spec.spec_value ?? spec.value;

                            return (
                              <div
                                key={`${key}-${index}`}
                                className={`flex items-start justify-between gap-4 px-4 py-3 ${
                                  index > 0 ? 'border-t border-slate-100 dark:border-white/[0.06]' : ''
                                }`}
                              >
                                <span className={`text-xs ${MUTED}`}>{key || 'Especificación'}</span>
                                <span className={`max-w-[60%] break-words text-right text-xs font-medium ${HEADING}`}>
                                  {value === 'true' || value === true
                                    ? 'Sí'
                                    : value === 'false' || value === false
                                      ? 'No'
                                      : value || '—'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    {item.notes && (
                      <section>
                        <h3 className={`mb-2 text-sm font-semibold ${HEADING}`}>Notas y observaciones</h3>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.025]">
                          <p className={`whitespace-pre-wrap text-sm leading-relaxed ${MUTED}`}>{item.notes}</p>
                        </div>
                      </section>
                    )}

                    <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-white/[0.08] sm:flex-row">
                      <button
                        type="button"
                        onClick={() => openEditForm(item)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/[0.05]"
                      >
                        <Edit size={16} />
                        Editar equipo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-400"
                      >
                        <Trash2 size={16} />
                        Eliminar equipo
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
