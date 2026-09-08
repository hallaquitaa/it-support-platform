import { useState, useEffect } from 'react';
import { 
  Plus, Search, Server, Monitor, Laptop, Wifi, Printer, 
  Edit, Trash2, Eye, Grid, List, Package, AlertCircle, CheckCircle, 
  Wrench, Folder, FolderOpen, ChevronRight, ChevronDown, 
  Cpu, HardDrive, Network, Smartphone, Tag, MapPin, Calendar,
  Settings, Save, X, PlusCircle, Trash as TrashIcon,
  Camera, Mic, Headphones, Watch, Battery, Truck, Home, Coffee,
  ShoppingBag, Gift, Heart, Star, Zap, Cloud, Lock, Shield,
  User, Users, Globe, Book, Video, Music, File, Image, MessageCircle
} from 'lucide-react';
import hardwareService from '../services/hardwareService';
import branchService from '../services/branchService';

// Lista de iconos disponibles
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
  { name: 'Network', icon: Network }
];

// Categorías predefinidas
const DEFAULT_CATEGORIES = {
  'Fiscal Printer': {
    name: 'Impresoras Fiscales',
    icon: 'Printer',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    defaultSpecs: [
      { key: 'brand', label: 'Marca', type: 'text', placeholder: 'Epson, Hasar, etc.' },
      { key: 'model', label: 'Modelo', type: 'text', placeholder: 'TM-T88VI, Hasar 3000' },
      { key: 'firmware', label: 'Versión Firmware', type: 'text', placeholder: 'v1.2.3' },
      { key: 'port', label: 'Puerto', type: 'select', options: ['USB', 'Serial', 'Ethernet', 'Bluetooth'] },
      { key: 'has_display', label: 'Tiene Display', type: 'boolean' },
      { key: 'has_barcode', label: 'Lector Código de Barras', type: 'boolean' },
      { key: 'paper_width', label: 'Ancho de Papel', type: 'text', placeholder: '80mm, 58mm' }
    ]
  },
  'Desktop': {
    name: 'Computadoras de Escritorio',
    icon: 'Monitor',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    defaultSpecs: [
      { key: 'cpu', label: 'Procesador', type: 'text', placeholder: 'Intel Core i5-12400' },
      { key: 'ram', label: 'Memoria RAM', type: 'text', placeholder: '16GB DDR4' },
      { key: 'storage', label: 'Almacenamiento', type: 'text', placeholder: '512GB SSD' },
      { key: 'os', label: 'Sistema Operativo', type: 'text', placeholder: 'Windows 11 Pro' }
    ]
  },
  'Laptop': {
    name: 'Laptops',
    icon: 'Laptop',
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
    defaultSpecs: [
      { key: 'cpu', label: 'Procesador', type: 'text', placeholder: 'Intel Core i7-1355U' },
      { key: 'ram', label: 'Memoria RAM', type: 'text', placeholder: '32GB DDR5' },
      { key: 'storage', label: 'Almacenamiento', type: 'text', placeholder: '1TB SSD NVMe' },
      { key: 'os', label: 'Sistema Operativo', type: 'text', placeholder: 'Windows 11 Pro' }
    ]
  },
  'Server': {
    name: 'Servidores',
    icon: 'Server',
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    defaultSpecs: [
      { key: 'cpu', label: 'Procesador', type: 'text', placeholder: 'Intel Xeon Gold' },
      { key: 'ram', label: 'Memoria RAM', type: 'text', placeholder: '64GB ECC' },
      { key: 'storage', label: 'Almacenamiento', type: 'text', placeholder: '2x 1TB SSD RAID 1' },
      { key: 'os', label: 'Sistema Operativo', type: 'text', placeholder: 'Windows Server 2022' }
    ]
  },
  'Network Device': {
    name: 'Equipos de Red',
    icon: 'Wifi',
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    defaultSpecs: [
      { key: 'device_type', label: 'Tipo de Equipo', type: 'select', options: ['Router', 'Switch', 'Access Point', 'Firewall', 'Modem'] },
      { key: 'firmware', label: 'Versión Firmware', type: 'text', placeholder: 'v1.0.0' },
      { key: 'ports', label: 'Puertos', type: 'text', placeholder: '24 puertos Gigabit' }
    ]
  },
  'POS': {
    name: 'Puntos de Venta (POS)',
    icon: 'Smartphone',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    borderColor: 'border-pink-200 dark:border-pink-800',
    defaultSpecs: [
      { key: 'pos_software', label: 'Software POS', type: 'text', placeholder: 'SAP, POSCloud' },
      { key: 'touchscreen', label: 'Pantalla Táctil', type: 'boolean' }
    ]
  }
};

// Categorías personalizadas
const loadCustomCategories = () => {
  const saved = localStorage.getItem('customCategories');
  return saved ? JSON.parse(saved) : {};
};

const saveCustomCategories = (custom) => {
  localStorage.setItem('customCategories', JSON.stringify(custom));
};

// Componente de badge de estado
const StatusBadge = ({ status }) => {
  const config = {
    active: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900', label: 'Activo' },
    repair: { icon: Wrench, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900', label: 'Reparación' },
    damaged: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900', label: 'Dañado' }
  };
  const c = config[status] || config.active;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${c.bg} ${c.color}`}>
      <Icon size={12} />
      {c.label}
    </span>
  );
};

export default function InventoryPage() {
  const [hardware, setHardware] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customCategories, setCustomCategories] = useState(loadCustomCategories());
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'Package',
    color: 'from-slate-500 to-gray-500'
  });
  const [formData, setFormData] = useState({
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
  });

  const allCategories = { ...DEFAULT_CATEGORIES, ...customCategories };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFiltered(hardware.filter(item => item.type === selectedCategory));
    } else {
      setFiltered(hardware);
    }
  }, [hardware, selectedCategory]);

  const loadData = async () => {
    try {
      const [hardwareData, statsData, branchesData] = await Promise.all([
        hardwareService.getAll(),
        hardwareService.getStats(),
        branchService.getAll()
      ]);
      setHardware(hardwareData);
      setFiltered(hardwareData);
      setStats(statsData);
      setBranches(branchesData);
    } catch (error) {
      console.error('Error loading hardware:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.type) {
      alert('Seleccione un tipo de equipo');
      return;
    }
    if (!formData.brand_model) {
      alert('Ingrese la marca/modelo del equipo');
      return;
    }
    
    try {
      const dataToSave = {
        ...formData,
        specs: formData.specs.filter(s => s.key && s.value).map(s => ({
          key: s.key,
          value: s.value
        }))
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
      alert('Error al guardar el equipo: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
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
    });
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este equipo? Esta acción no se puede deshacer.')) {
      try {
        await hardwareService.delete(id);
        await loadData();
        setSelectedItem(null);
      } catch (error) {
        alert('Error al eliminar el equipo');
      }
    }
  };

  const getCategoryIcon = (categoryName) => {
    const category = allCategories[categoryName];
    const iconName = category?.icon || 'Package';
    const iconObj = AVAILABLE_ICONS.find(i => i.name === iconName);
    return iconObj ? iconObj.icon : Package;
  };

  const getItemCountByCategory = (category) => {
    return hardware.filter(item => item.type === category).length;
  };

  const handleTypeChange = (type) => {
    const category = allCategories[type];
    const defaultSpecs = category && category.defaultSpecs ? category.defaultSpecs.map(spec => ({
      key: spec.key,
      value: '',
      label: spec.label,
      type: spec.type,
      options: spec.options,
      placeholder: spec.placeholder
    })) : [];
    
    setFormData({
      ...formData,
      type: type,
      specs: defaultSpecs
    });
  };

  const handleSpecChange = (index, value) => {
    const newSpecs = [...formData.specs];
    newSpecs[index].value = value;
    setFormData({ ...formData, specs: newSpecs });
  };

  const addCustomSpec = () => {
    setFormData({
      ...formData,
      specs: [...formData.specs, { key: '', value: '', label: '', type: 'text', isCustom: true }]
    });
  };

  const removeSpec = (index) => {
    const newSpecs = formData.specs.filter((_, i) => i !== index);
    setFormData({ ...formData, specs: newSpecs });
  };

  const updateSpecKey = (index, key) => {
    const newSpecs = [...formData.specs];
    newSpecs[index].key = key;
    newSpecs[index].label = key;
    setFormData({ ...formData, specs: newSpecs });
  };

  const addCustomCategory = () => {
    if (!newCategory.name.trim()) {
      alert('Ingrese un nombre para la categoría');
      return;
    }
    
    const categoryKey = newCategory.name.replace(/\s+/g, '_');
    const updatedCustom = {
      ...customCategories,
      [categoryKey]: {
        name: newCategory.name,
        icon: newCategory.icon,
        color: newCategory.color,
        bgColor: 'bg-slate-50 dark:bg-slate-800/50',
        borderColor: 'border-slate-200 dark:border-slate-700',
        defaultSpecs: []
      }
    };
    
    setCustomCategories(updatedCustom);
    saveCustomCategories(updatedCustom);
    setShowCategoryForm(false);
    setNewCategory({ name: '', icon: 'Package', color: 'from-slate-500 to-gray-500' });
    loadData();
  };

  const deleteCustomCategory = (categoryKey) => {
    if (confirm(`¿Eliminar la categoría "${customCategories[categoryKey]?.name}"?`)) {
      const updated = { ...customCategories };
      delete updated[categoryKey];
      setCustomCategories(updated);
      saveCustomCategories(updated);
      if (selectedCategory === categoryKey) {
        setSelectedCategory(null);
      }
      loadData();
    }
  };

  const colorOptions = [
    'from-red-500 to-orange-500', 'from-orange-500 to-yellow-500', 'from-yellow-500 to-green-500',
    'from-green-500 to-teal-500', 'from-teal-500 to-cyan-500', 'from-cyan-500 to-blue-500',
    'from-blue-500 to-indigo-500', 'from-indigo-500 to-purple-500', 'from-purple-500 to-pink-500',
    'from-pink-500 to-rose-500', 'from-slate-500 to-gray-500'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header con zoom - más grande */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600" />
            Inventario de Hardware
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
            Gestión completa de equipos e infraestructura IT por categorías
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium"
          >
            <Plus size={18} />
            Nueva Categoría
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setSelectedCategory(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <Plus size={18} />
            Agregar Equipo
          </button>
        </div>
      </div>

      {/* Stats Grid - más grande */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.total}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Equipos</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Activos</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-3xl font-bold text-yellow-600">{stats.repair}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Reparación</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-3xl font-bold text-indigo-600">{stats.fiscal_printers || 0}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Impresoras Fiscales</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-3xl font-bold text-blue-600">{(stats.desktops || 0) + (stats.laptops || 0)}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Computadoras</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-3xl font-bold text-purple-600">{stats.servers || 0}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Servidores</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-3xl font-bold text-cyan-600">{stats.network_devices || 0}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Equipos Red</p>
          </div>
        </div>
      )}

      {/* Folders / Categories View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar con carpetas - más grande */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Categorías</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Selecciona una carpeta</p>
            </div>
            <div className="p-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 ${
                  selectedCategory === null 
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Folder className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">Todos los equipos</span>
                <span className="text-sm text-slate-400">{hardware.length}</span>
              </button>
              
              {Object.entries(allCategories).map(([key, category]) => {
                const Icon = getCategoryIcon(key);
                const itemCount = getItemCountByCategory(key);
                const isSelected = selectedCategory === key;
                
                return (
                  <div key={key} className="mb-2">
                    <button
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isSelected 
                          ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-md' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left font-medium">{category.name}</span>
                      <span className="text-sm opacity-70">{itemCount}</span>
                    </button>
                    {customCategories[key] && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCustomCategory(key); }}
                        className="ml-12 mt-1 text-xs text-red-500 hover:text-red-700"
                      >
                        Eliminar categoría
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content - Items Grid más grande */}
        <div className="lg:col-span-3">
          {selectedCategory && allCategories[selectedCategory] && (
            <div className={`mb-6 p-5 rounded-xl ${allCategories[selectedCategory].bgColor} border ${allCategories[selectedCategory].borderColor}`}>
              <div className="flex items-center gap-4">
                {(() => {
                  const Icon = getCategoryIcon(selectedCategory);
                  return <Icon className="w-10 h-10" />;
                })()}
                <div>
                  <h2 className="text-2xl font-bold">{allCategories[selectedCategory].name}</h2>
                  <p className="text-base opacity-75">{filtered.length} equipos registrados</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(item => {
              const Icon = getCategoryIcon(item.type);
              const category = allCategories[item.type];
              const specs = item.specs || [];
              
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer overflow-hidden group"
                >
                  <div className={`h-2 bg-gradient-to-r ${category?.color || 'from-slate-500 to-slate-600'}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${category?.bgColor || 'bg-slate-100 dark:bg-slate-700'}`}>
                          <Icon className={`w-6 h-6 ${category?.color?.split(' ')[1] || 'text-slate-600'}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{item.type}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{item.brand_model || 'Sin modelo'}</p>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="space-y-2 mb-4">
                      {specs.slice(0, 3).map((spec, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400 capitalize">{spec.spec_key}:</span>
                          <span className="text-slate-700 dark:text-slate-300 font-mono text-sm">{spec.spec_value}</span>
                        </div>
                      ))}
                      {specs.length === 0 && (
                        <p className="text-sm text-slate-400 italic">Sin especificaciones adicionales</p>
                      )}
                    </div>

                    <div className="space-y-2 text-sm border-t border-slate-100 dark:border-slate-700 pt-3">
                      {item.serial_number && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Serial:</span>
                          <code className="text-slate-600 dark:text-slate-400 font-mono text-sm">{item.serial_number}</code>
                        </div>
                      )}
                      {item.service_tag && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Service Tag:</span>
                          <code className="text-slate-600 dark:text-slate-400 font-mono text-sm">{item.service_tag}</code>
                        </div>
                      )}
                      {item.branch_name && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Ubicación:</span>
                          <span className="text-slate-600 dark:text-slate-400">{item.branch_name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingItem(item); setFormData({...item, specs: item.specs || []}); setShowForm(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl">
              <Package className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-lg">No hay equipos en esta categoría</p>
              <button onClick={() => setShowForm(true)} className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
                Agregar el primer equipo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear nueva categoría */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Nueva Categoría</h2>
              <button onClick={() => setShowCategoryForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="input"
                  placeholder="Ej: Pistolas de Código de Barras"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Icono
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                  {AVAILABLE_ICONS.map((iconItem) => {
                    const IconComponent = iconItem.icon;
                    const isSelected = newCategory.icon === iconItem.name;
                    return (
                      <button
                        key={iconItem.name}
                        type="button"
                        onClick={() => setNewCategory({...newCategory, icon: iconItem.name})}
                        className={`p-2 rounded-lg transition-all ${
                          isSelected 
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                        title={iconItem.name}
                      >
                        <IconComponent className="w-6 h-6 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Color de fondo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewCategory({...newCategory, color: color})}
                      className={`h-10 rounded-lg bg-gradient-to-r ${color} ${
                        newCategory.color === color ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCategoryForm(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button onClick={addCustomCategory} className="btn-primary flex-1">
                  Crear Categoría
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de formulario para agregar/editar equipo */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingItem ? 'Editar Equipo' : 'Agregar Equipo'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Tipo de equipo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Equipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="input"
                  required
                  disabled={editingItem}
                >
                  <option value="">Seleccionar tipo</option>
                  {Object.keys(allCategories).map(cat => (
                    <option key={cat} value={cat}>{allCategories[cat].name}</option>
                  ))}
                </select>
              </div>

              {/* Campos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Marca / Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.brand_model}
                    onChange={(e) => setFormData({...formData, brand_model: e.target.value})}
                    className="input"
                    placeholder="Ej: Epson TM-T88VI"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Número de Serie
                  </label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                    className="input font-mono"
                    placeholder="Número de serie único"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Service Tag
                  </label>
                  <input
                    type="text"
                    value={formData.service_tag}
                    onChange={(e) => setFormData({...formData, service_tag: e.target.value})}
                    className="input font-mono"
                    placeholder="Service Tag (Dell, HP, etc.)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input"
                  >
                    <option value="active">Activo</option>
                    <option value="repair">En Reparación</option>
                    <option value="damaged">Dañado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                    className="input font-mono"
                    placeholder="192.168.1.100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    MAC Address
                  </label>
                  <input
                    type="text"
                    value={formData.mac_address}
                    onChange={(e) => setFormData({...formData, mac_address: e.target.value})}
                    className="input font-mono"
                    placeholder="AA:BB:CC:DD:EE:FF"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Sucursal
                  </label>
                  <select
                    value={formData.branch_id}
                    onChange={(e) => setFormData({...formData, branch_id: e.target.value})}
                    className="input"
                  >
                    <option value="">Seleccionar sucursal</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fecha de Compra
                  </label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Fecha Fin Garantía
                </label>
                <input
                  type="date"
                  value={formData.warranty_end}
                  onChange={(e) => setFormData({...formData, warranty_end: e.target.value})}
                  className="input"
                />
              </div>

              {/* Especificaciones personalizadas según categoría */}
              {formData.type && allCategories[formData.type] && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Especificaciones del equipo
                    </label>
                    <button
                      type="button"
                      onClick={addCustomSpec}
                      className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                    >
                      <PlusCircle size={14} />
                      Agregar especificación
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.specs.map((spec, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        {spec.isCustom ? (
                          <input
                            type="text"
                            value={spec.key}
                            onChange={(e) => updateSpecKey(index, e.target.value)}
                            placeholder="Nombre (ej: Resolución)"
                            className="flex-1 input text-sm"
                          />
                        ) : (
                          <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 pt-2">
                            {spec.label}:
                          </span>
                        )}
                        
                        {spec.type === 'select' ? (
                          <select
                            value={spec.value}
                            onChange={(e) => handleSpecChange(index, e.target.value)}
                            className="flex-2 input text-sm"
                          >
                            <option value="">Seleccionar...</option>
                            {spec.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : spec.type === 'boolean' ? (
                          <div className="flex-2">
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={spec.value === 'true' || spec.value === true}
                                onChange={(e) => handleSpecChange(index, e.target.checked ? 'true' : 'false')}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-sm text-slate-600">Sí / No</span>
                            </label>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => handleSpecChange(index, e.target.value)}
                            placeholder={spec.placeholder || 'Valor'}
                            className="flex-2 input text-sm"
                          />
                        )}
                        
                        <button
                          type="button"
                          onClick={() => removeSpec(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  className="input"
                  placeholder="Información adicional, observaciones, etc."
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }} className="btn-secondary flex-1 py-3 text-base">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1 py-3 text-base">
                  {editingItem ? 'Actualizar' : 'Guardar'} Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalles del equipo */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Detalles del Equipo
              </h2>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Tipo con gradiente */}
              <div className={`p-5 rounded-xl bg-gradient-to-r ${allCategories[selectedItem.type]?.color || 'from-slate-500 to-slate-600'} bg-opacity-10`}>
                <div className="flex items-center gap-4">
                  {(() => {
                    const Icon = getCategoryIcon(selectedItem.type);
                    return <Icon className="w-10 h-10 text-white" />;
                  })()}
                  <div>
                    <p className="text-sm opacity-75">Tipo de equipo</p>
                    <p className="text-2xl font-bold">{selectedItem.type}</p>
                  </div>
                </div>
              </div>

              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Marca / Modelo</p>
                  <p className="font-medium text-lg">{selectedItem.brand_model || '-'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Estado</p>
                  <StatusBadge status={selectedItem.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Número de Serie</p>
                  <code className="text-sm font-mono">{selectedItem.serial_number || '-'}</code>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Service Tag</p>
                  <code className="text-sm font-mono">{selectedItem.service_tag || '-'}</code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">IP Address</p>
                  <code className="text-sm font-mono">{selectedItem.ip_address || '-'}</code>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">MAC Address</p>
                  <code className="text-sm font-mono">{selectedItem.mac_address || '-'}</code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Sucursal</p>
                  <p className="font-medium">{selectedItem.branch_name || '-'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Fecha de Compra</p>
                  <p>{selectedItem.purchase_date ? new Date(selectedItem.purchase_date).toLocaleDateString() : '-'}</p>
                </div>
              </div>

              {/* Especificaciones personalizadas */}
              {selectedItem.specs && selectedItem.specs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Especificaciones</h3>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg overflow-hidden">
                    {selectedItem.specs.map((spec, idx) => (
                      <div key={idx} className="flex justify-between p-3 border-b border-slate-200 dark:border-slate-600 last:border-0">
                        <span className="text-sm capitalize">{spec.spec_key}:</span>
                        <span className="text-sm font-medium">{spec.spec_value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedItem.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">Notas</h3>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedItem.notes}</p>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    setEditingItem(selectedItem);
                    setFormData({...selectedItem, specs: selectedItem.specs || []});
                    setSelectedItem(null);
                    setShowForm(true);
                  }}
                  className="btn-secondary flex-1 py-3 text-base"
                >
                  <Edit size={18} className="inline mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex-1 text-base font-medium"
                >
                  <TrashIcon size={18} className="inline mr-2" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}