import { useState, useEffect } from 'react';
import { 
  Plus, Search, Key, Copy, Eye, Edit, Trash2, 
  Lock, Shield, AlertCircle, CheckCircle, X, RefreshCw, Download,
  Globe, Server, Database, Wifi, Mail, ShoppingBag,
  Folder, Package, Cloud, Github, Twitter, Facebook, Instagram,
  Youtube, Linkedin, MessageCircle, HardDrive, Network, Terminal, Code,
  Monitor, Laptop, Printer, Smartphone, Camera, Headphones,
  Star, Heart, MapPin, Settings, User, Users, Bell, Bookmark,
  Clock, Grid, List, TrendingUp
} from 'lucide-react';
import vaultService from '../services/vaultService';
import exportService from '../services/exportService';
import pdfExportService from '../services/pdfExportService';
import PasswordModal from '../components/common/PasswordModal';
import ConfirmModal from '../components/common/ConfirmModal';
import AlertModal from '../components/common/AlertModal';

// Lista de iconos disponibles
const AVAILABLE_ICONS = [
  { name: 'Globe', icon: Globe }, { name: 'Server', icon: Server },
  { name: 'Database', icon: Database }, { name: 'Mail', icon: Mail },
  { name: 'Network', icon: Network }, { name: 'Wifi', icon: Wifi },
  { name: 'Cloud', icon: Cloud }, { name: 'Github', icon: Github },
  { name: 'Twitter', icon: Twitter }, { name: 'Facebook', icon: Facebook },
  { name: 'Instagram', icon: Instagram }, { name: 'Youtube', icon: Youtube },
  { name: 'Linkedin', icon: Linkedin }, { name: 'MessageCircle', icon: MessageCircle },
  { name: 'Monitor', icon: Monitor }, { name: 'Laptop', icon: Laptop },
  { name: 'Printer', icon: Printer }, { name: 'Smartphone', icon: Smartphone },
  { name: 'Camera', icon: Camera }, { name: 'Headphones', icon: Headphones },
  { name: 'Terminal', icon: Terminal }, { name: 'Code', icon: Code },
  { name: 'HardDrive', icon: HardDrive }, { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart }, { name: 'MapPin', icon: MapPin },
  { name: 'Settings', icon: Settings }, { name: 'User', icon: User },
  { name: 'Users', icon: Users }, { name: 'Bell', icon: Bell },
  { name: 'Bookmark', icon: Bookmark }, { name: 'Package', icon: Package },
  { name: 'Key', icon: Key }, { name: 'Lock', icon: Lock }, { name: 'Shield', icon: Shield }
];

// Categorías predefinidas
const DEFAULT_CATEGORIES = {
  'Routers': {
    name: 'Routers y Switches',
    icon: 'Network',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'Equipos de red y conectividad',
    isDefault: true
  },
  'Correos': {
    name: 'Cuentas de Correo',
    icon: 'Mail',
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    description: 'Correos electrónicos y cuentas',
    isDefault: true
  },
  'Proveedores': {
    name: 'Portal Proveedores',
    icon: 'Globe',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'Portales de servicios externos',
    isDefault: true
  },
  'Bases Datos': {
    name: 'Bases de Datos',
    icon: 'Database',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    description: 'Bases de datos',
    isDefault: true
  },
  'AnyDesk': {
    name: 'Conexiones AnyDesk',
    icon: 'Cloud',
    color: 'from-amber-500 to-yellow-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    description: 'IDs de conexión remota AnyDesk',
    isDefault: true
  },
  'Servidores': {
    name: 'Servidores',
    icon: 'Server',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    description: 'Acceso a servidores físicos/virtuales',
    isDefault: true
  },
  'Impresoras': {
    name: 'Impresoras',
    icon: 'Printer',
    color: 'from-slate-500 to-gray-500',
    bgColor: 'bg-slate-50 dark:bg-slate-800/50',
    borderColor: 'border-slate-200 dark:border-slate-700',
    description: 'Impresoras y multifuncionales',
    isDefault: true
  },
  'POS': {
    name: 'Puntos de Venta',
    icon: 'ShoppingBag',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    borderColor: 'border-pink-200 dark:border-pink-800',
    description: 'Sistemas POS y cajas registradoras',
    isDefault: true
  }
};

// Categorías personalizadas
const loadCustomCategories = () => {
  const saved = localStorage.getItem('vaultCustomCategories');
  return saved ? JSON.parse(saved) : {};
};

const saveCustomCategories = (custom) => {
  localStorage.setItem('vaultCustomCategories', JSON.stringify(custom));
};

// Componente de badge de estado
const StatusBadge = ({ status }) => {
  if (!status) return null;
  const config = {
    active: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900', label: 'Activa' },
    inactive: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900', label: 'Inactiva' }
  };
  const c = config[status] || config.active;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.color}`}>
      <Icon size={14} />
      {c.label}
    </span>
  );
};

// Componente de indicador de fuerza de contraseña
const PasswordStrength = ({ length }) => {
  let strength = 'Débil';
  let color = 'bg-red-500';
  let width = '25%';
  
  if (length >= 12) {
    strength = 'Fuerte';
    color = 'bg-green-500';
    width = '100%';
  } else if (length >= 8) {
    strength = 'Media';
    color = 'bg-yellow-500';
    width = '66%';
  } else if (length >= 6) {
    strength = 'Baja';
    color = 'bg-orange-500';
    width = '33%';
  }
  
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-300`} style={{ width }} />
      </div>
      <span className="text-xs text-slate-400 w-10">{strength}</span>
    </div>
  );
};

export default function VaultPage() {
  const [credentials, setCredentials] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [mostUsed, setMostUsed] = useState([]);
  const [customCategories, setCustomCategories] = useState(loadCustomCategories());
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [revealedData, setRevealedData] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'Package', color: 'from-slate-500 to-gray-500' });
  const [formData, setFormData] = useState({ service_name: '', url: '', username: '', password: '', notes: '', category: '', status: 'active' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalConfig, setPasswordModalConfig] = useState({ title: '', message: '', onConfirm: null });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({ title: '', message: '', onConfirm: null, confirmText: 'Eliminar', type: 'danger' });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalConfig, setAlertModalConfig] = useState({ title: '', message: '', type: 'success' });

  const getVisibleCategories = () => {
    const all = { ...DEFAULT_CATEGORIES, ...customCategories };
    return Object.fromEntries(
      Object.entries(all).filter(([key, cat]) => !cat.deleted)
    );
  };

  const allCategories = getVisibleCategories();

  useEffect(() => {
    loadData();
    loadFavorites();
    loadMostUsed();
  }, []);

  useEffect(() => {
    filterCredentials();
  }, [credentials, searchTerm, selectedCategory, showFavoritesOnly, favorites]);

  useEffect(() => {
    loadData();
  }, [customCategories]);

  const loadData = async () => {
    setLoading(true);
    try {
      const credsData = await vaultService.getAll();
      setCredentials(credsData);
      setFiltered(credsData);
      const statsData = await vaultService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await vaultService.getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMostUsed = async () => {
    try {
      const most = await vaultService.getMostUsed(5);
      setMostUsed(most);
    } catch (error) {
      console.error('Error loading most used:', error);
    }
  };

  const filterCredentials = () => {
    let filtered = [...credentials];
    
    if (showFavoritesOnly) {
      const favoriteIds = favorites.map(f => f.id);
      filtered = filtered.filter(c => favoriteIds.includes(c.id));
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.service_name?.toLowerCase().includes(term) ||
        c.username?.toLowerCase().includes(term) ||
        (c.url && c.url.toLowerCase().includes(term))
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    setFiltered(filtered);
  };

  const toggleFavorite = async (credId, e) => {
    e.stopPropagation();
    try {
      const result = await vaultService.toggleFavorite(credId);
      await loadData();
      await loadFavorites();
      setAlertModalConfig({
        title: result.favorited ? '⭐ Agregado' : '⭐ Eliminado',
        message: result.favorited ? 'Credencial agregada a favoritos' : 'Credencial eliminada de favoritos',
        type: 'success'
      });
      setShowAlertModal(true);
    } catch (error) {
      setAlertModalConfig({ title: '❌ Error', message: error.response?.data?.error || error.message, type: 'error' });
      setShowAlertModal(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordModalConfig({
      title: '🔐 Master Password',
      message: editingItem ? 'Ingrese la Master Password para modificar esta credencial:' : 'Ingrese la Master Password para guardar la credencial cifrada:',
      onConfirm: async (mp) => {
        try {
          const dataToSend = {
            service_name: formData.service_name,
            url: formData.url,
            username: formData.username,
            password: formData.password,
            notes: formData.notes,
            category: formData.category,
            status: formData.status
          };
          
          if (editingItem) {
            await vaultService.update(editingItem.id, dataToSend, mp);
            setAlertModalConfig({ title: '✓ Éxito', message: 'Credencial actualizada correctamente', type: 'success' });
          } else {
            await vaultService.create(dataToSend, mp);
            setAlertModalConfig({ title: '✓ Éxito', message: 'Credencial guardada correctamente', type: 'success' });
          }
          setShowAlertModal(true);
          await loadData();
          setShowForm(false);
          setEditingItem(null);
          resetForm();
        } catch (error) {
          setAlertModalConfig({ title: '❌ Error', message: error.response?.data?.error || error.message, type: 'error' });
          setShowAlertModal(true);
        }
      }
    });
    setShowPasswordModal(true);
  };

  const resetForm = () => {
    setFormData({
      service_name: '',
      url: '',
      username: '',
      password: '',
      notes: '',
      category: '',
      status: 'active'
    });
  };

  const handleCopy = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setAlertModalConfig({ title: '✓ Copiado', message: `${field} copiado al portapapeles`, type: 'success' });
    setShowAlertModal(true);
  };

  const handleDelete = async (id) => {
    setPasswordModalConfig({
      title: '🔐 Eliminar Credencial',
      message: 'Ingrese la Master Password para eliminar esta credencial. Esta acción no se puede deshacer.',
      onConfirm: async (mp) => {
        try {
          await vaultService.reveal(id, mp);
          await vaultService.delete(id);
          await loadData();
          await loadFavorites();
          setAlertModalConfig({ title: '✓ Eliminado', message: 'Credencial eliminada correctamente', type: 'success' });
          setShowAlertModal(true);
        } catch (error) {
          setAlertModalConfig({ title: '❌ Error', message: 'Master Password incorrecta', type: 'error' });
          setShowAlertModal(true);
        }
      }
    });
    setShowPasswordModal(true);
  };

  const getCategoryIcon = (categoryKey) => {
    const category = allCategories[categoryKey];
    const iconName = category?.icon || 'Package';
    const iconObj = AVAILABLE_ICONS.find(i => i.name === iconName);
    return iconObj ? iconObj.icon : Package;
  };

  const getItemCountByCategory = (categoryKey) => {
    return credentials.filter(item => item.category === categoryKey).length;
  };

  const editCategory = (categoryKey, category) => {
    const newName = prompt('✏️ Editar nombre de la categoría:', category.name);
    if (!newName || !newName.trim() || newName === category.name) return;
    
    const updated = { ...customCategories };
    updated[categoryKey] = {
      ...category,
      name: newName.trim(),
      isDefault: false
    };
    
    setCustomCategories(updated);
    saveCustomCategories(updated);
    
    if (selectedCategory === categoryKey) {
      setSelectedCategory(categoryKey);
    }
    loadData();
  };

  const deleteCategory = (categoryKey, category) => {
    const itemCount = getItemCountByCategory(categoryKey);
    if (itemCount > 0) {
      setAlertModalConfig({ 
        title: '❌ No se puede eliminar', 
        message: `No se puede eliminar la categoría "${category.name}" porque tiene ${itemCount} credencial(es) asociadas.`, 
        type: 'warning' 
      });
      setShowAlertModal(true);
      return;
    }
    
    setConfirmModalConfig({
      title: 'Eliminar Categoría',
      message: `¿Eliminar la categoría "${category.name}"?`,
      onConfirm: () => {
        const updated = { ...customCategories };
        
        updated[categoryKey] = {
          ...category,
          deleted: true
        };
        
        setCustomCategories(updated);
        saveCustomCategories(updated);
        
        if (selectedCategory === categoryKey) {
          setSelectedCategory(null);
        }
        
        setAlertModalConfig({ title: '✓ Eliminado', message: 'Categoría eliminada correctamente', type: 'success' });
        setShowAlertModal(true);
      },
      confirmText: 'Eliminar',
      type: 'danger'
    });
    setShowConfirmModal(true);
  };

  const addCustomCategory = () => {
    if (!newCategory.name.trim()) {
      setAlertModalConfig({ title: '❌ Error', message: 'Ingrese un nombre para la categoría', type: 'error' });
      setShowAlertModal(true);
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
        description: 'Categoría personalizada',
        isDefault: false
      }
    };
    
    setCustomCategories(updatedCustom);
    saveCustomCategories(updatedCustom);
    setShowCategoryForm(false);
    setNewCategory({ name: '', icon: 'Package', color: 'from-slate-500 to-gray-500' });
    setAlertModalConfig({ title: '✓ Éxito', message: 'Categoría creada correctamente', type: 'success' });
    setShowAlertModal(true);
  };

  const colorOptions = [
    'from-red-500 to-orange-500', 'from-orange-500 to-yellow-500', 'from-yellow-500 to-green-500',
    'from-green-500 to-teal-500', 'from-teal-500 to-cyan-500', 'from-cyan-500 to-blue-500',
    'from-blue-500 to-indigo-500', 'from-indigo-500 to-purple-500', 'from-purple-500 to-pink-500',
    'from-pink-500 to-rose-500', 'from-slate-500 to-gray-500'
  ];

  // Función para exportar PDF con contraseñas (solo con MP)
  const exportPDFWithPasswords = async (masterPassword) => {
    try {
      setLoading(true);
      const ids = filtered.map(cred => cred.id);
      const decryptedCredentials = await vaultService.revealMultiple(ids, masterPassword);
      
      const validCredentials = decryptedCredentials.filter(c => !c.error);
      if (validCredentials.length === 0) {
        throw new Error('No se pudieron descifrar las credenciales');
      }
      
      await pdfExportService.exportToPDFWithPasswords(validCredentials);
      setAlertModalConfig({ title: '✓ Éxito', message: 'PDF con contraseñas generado correctamente', type: 'success' });
      setShowAlertModal(true);
    } catch (error) {
      console.error('Error:', error);
      setAlertModalConfig({ title: '❌ Error', message: error.response?.data?.error || error.message, type: 'error' });
      setShowAlertModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400 animate-pulse">Cargando bóveda...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[2000px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Shield className="w-9 h-9 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Bóveda de Credenciales</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {stats && (
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2 rounded-lg">
              <Key className="w-5 h-5 text-indigo-600" />
              <span className="text-xl font-bold text-slate-800 dark:text-white">{stats.total}</span>
              <span className="text-sm text-slate-500">credenciales</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-500'}`}><Grid size={16} /></button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-slate-500'}`}><List size={16} /></button>
          </div>
          
          <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm ${showFavoritesOnly ? 'bg-yellow-100 text-yellow-700' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
            <Star size={14} fill={showFavoritesOnly ? 'currentColor' : 'none'} /> Favoritos
          </button>
          
          {/* Botón Exportar a Excel */}
          <button 
            onClick={async () => {
              setPasswordModalConfig({
                title: '📄 Exportar a Excel',
                message: 'Ingrese Master Password para incluir contraseñas (opcional - deje vacío para exportar sin contraseñas):',
                onConfirm: async (mp) => {
                  const includePasswords = mp !== null && mp !== '';
                  try {
                    await exportService.exportToExcel(includePasswords, includePasswords ? mp : null);
                    setAlertModalConfig({ title: '✓ Éxito', message: 'Exportado a Excel correctamente', type: 'success' });
                    setShowAlertModal(true);
                  } catch (error) {
                    setAlertModalConfig({ title: '❌ Error', message: error.response?.data?.error || error.message, type: 'error' });
                    setShowAlertModal(true);
                  }
                }
              });
              setShowPasswordModal(true);
            }}
            className="border border-green-500 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2"
          >
            <Download size={15} /> Excel
          </button>

          {/* Botón Exportar a PDF - SOLO CON CONTRASEÑAS (SEGURO) */}
          <button 
            onClick={async () => {
              setPasswordModalConfig({
                title: '🔐 Exportar a PDF',
                message: 'Ingrese la Master Password para exportar las credenciales.\n\n⚠️ El PDF incluirá las contraseñas en texto plano. Manténgalo en un lugar seguro.',
                onConfirm: async (mp) => {
                  await exportPDFWithPasswords(mp);
                }
              });
              setShowPasswordModal(true);
            }}
            className="border border-red-500 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2"
          >
            <Download size={15} /> PDF
          </button>
          
          <button onClick={() => loadData()} className="border border-slate-300 px-4 py-2 rounded-lg flex items-center gap-2"><RefreshCw size={15} /> Refrescar</button>
          <button onClick={() => setShowCategoryForm(true)} className="border-2 border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={15} /> Categoría</button>
          <button onClick={() => { setEditingItem(null); resetForm(); setShowForm(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={15} /> Credencial</button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-end mb-5">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
          <input type="text" placeholder="🔍 Buscar credencial..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="block w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-white/80" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar Categorías */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden sticky top-6">
            <div className="px-4 py-3 border-b bg-slate-50"><h3 className="font-semibold">Categorías</h3><p className="text-xs text-slate-500">Selecciona una carpeta</p></div>
            <div className="p-2 max-h-[calc(100vh-250px)] overflow-y-auto">
              <button onClick={() => setSelectedCategory(null)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 ${!selectedCategory ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100'}`}>
                <Folder className="w-5 h-5" /><span className="flex-1 text-left font-medium">Todas</span><span className="text-sm text-slate-400">{credentials.length}</span>
              </button>
              {Object.entries(allCategories).map(([key, cat]) => {
                const Icon = getCategoryIcon(key);
                const itemCount = getItemCountByCategory(key);
                const isSelected = selectedCategory === key;
                const isHovered = hoveredCategory === key;
                return (
                  <div key={key} className="relative mb-1" onMouseEnter={() => setHoveredCategory(key)} onMouseLeave={() => setHoveredCategory(null)}>
                    <button onClick={() => setSelectedCategory(key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${isSelected ? 'bg-gradient-to-r ' + cat.color + ' text-white shadow-sm' : 'hover:bg-slate-100'}`}>
                      <Icon className="w-5 h-5" /><span className="flex-1 text-left font-medium truncate">{cat.name}</span><span className="text-sm opacity-70">{itemCount}</span>
                    </button>
                    {isHovered && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 bg-white rounded-md shadow-sm border p-1">
                        <button onClick={e => { e.stopPropagation(); editCategory(key, cat); }} className="p-1 text-blue-500 rounded hover:bg-blue-50"><Edit size={14} /></button>
                        <button onClick={e => { e.stopPropagation(); deleteCategory(key, cat); }} className="p-1 text-red-500 rounded hover:bg-red-50"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {mostUsed.length > 0 && !selectedCategory && (
              <div className="mt-4 pt-3 border-t px-2 pb-2">
                <h4 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1"><TrendingUp size={12} /> Más usadas</h4>
                {mostUsed.map(cred => (
                  <button key={cred.id} onClick={() => { setSelectedItem(cred); vaultService.incrementUsage(cred.id); }} className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition truncate">
                    {cred.service_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-4">
          {selectedCategory && allCategories[selectedCategory] && (
            <div className={`mb-4 p-3 rounded-lg ${allCategories[selectedCategory].bgColor} border ${allCategories[selectedCategory].borderColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => { const Icon = getCategoryIcon(selectedCategory); return <Icon className="w-6 h-6" />; })()}
                  <div>
                    <h2 className="text-lg font-bold">{allCategories[selectedCategory].name}</h2>
                    <p className="text-sm opacity-75">{allCategories[selectedCategory].description}</p>
                  </div>
                </div>
                
                {/* Botón exportar categoría a PDF - SOLO CON CONTRASEÑAS */}
                <button
                  onClick={async () => {
                    setPasswordModalConfig({
                      title: '🔐 Exportar categoría a PDF',
                      message: `Exportar "${allCategories[selectedCategory].name}" a PDF.\n\n⚠️ El PDF incluirá las contraseñas en texto plano.`,
                      onConfirm: async (mp) => {
                        try {
                          setLoading(true);
                          const ids = filtered.map(cred => cred.id);
                          const decryptedCredentials = await vaultService.revealMultiple(ids, mp);
                          const validCredentials = decryptedCredentials.filter(c => !c.error);
                          await pdfExportService.exportToPDFWithPasswords(validCredentials);
                          setAlertModalConfig({ title: '✓ Éxito', message: 'PDF de categoría generado', type: 'success' });
                          setShowAlertModal(true);
                        } catch (error) {
                          setAlertModalConfig({ title: '❌ Error', message: error.message, type: 'error' });
                          setShowAlertModal(true);
                        } finally {
                          setLoading(false);
                        }
                      }
                    });
                    setShowPasswordModal(true);
                  }}
                  className="text-sm bg-white/50 hover:bg-white px-3 py-1.5 rounded-lg flex items-center gap-2"
                >
                  <Download size={14} /> Exportar PDF
                </button>
              </div>
            </div>
          )}

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(cred => {
                const Icon = getCategoryIcon(cred.category);
                const category = allCategories[cred.category];
                return (
                  <div key={cred.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md cursor-pointer overflow-hidden group" onClick={() => setSelectedItem(cred)}>
                    <div className={`h-1.5 bg-gradient-to-r ${category?.color || 'from-slate-500 to-slate-600'}`} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-xl ${category?.bgColor || 'bg-slate-100'}`}><Icon className="w-6 h-6" /></div>
                          <div><h3 className="font-semibold text-base truncate">{cred.service_name}</h3><p className="text-xs text-slate-400 truncate">{cred.category || 'Sin categoría'}</p></div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                          <button onClick={e => toggleFavorite(cred.id, e)} className={`p-1.5 rounded-lg ${cred.favorite ? 'text-yellow-500' : 'text-slate-400 hover:text-yellow-500'}`}><Star size={15} fill={cred.favorite ? 'currentColor' : 'none'} /></button>
                          <button onClick={e => { e.stopPropagation(); handleCopy(cred.username, 'Usuario'); }} className="p-1.5 text-slate-400 hover:text-indigo-600"><Copy size={15} /></button>
                          <button onClick={e => { e.stopPropagation(); setEditingItem(cred); setFormData({ ...cred, password: '' }); setShowForm(true); }} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit size={15} /></button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(cred.id); }} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500 w-16">Usuario:</span><span className="font-mono text-sm truncate">{cred.username}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500 w-16">Contraseña:</span><div className="flex items-center gap-2"><span className="text-slate-400 font-mono">••••••••</span><button onClick={e => { e.stopPropagation(); setPasswordModalConfig({ title: '🔐 Desbloquear', message: 'Ingrese la Master Password:', onConfirm: async (mp) => { try { const data = await vaultService.reveal(cred.id, mp); setRevealedData({ ...data, ...cred }); } catch { setAlertModalConfig({ title: '❌ Error', message: 'Password incorrecta', type: 'error' }); setShowAlertModal(true); } } }); setShowPasswordModal(true); }} className="text-indigo-500"><Eye size={15} /></button></div></div>
                        {cred.url && <div className="flex justify-between"><span className="text-slate-500 w-16">URL/IP:</span><span className="text-indigo-600 text-sm truncate">{cred.url}</span></div>}
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t"><span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} />{new Date(cred.last_updated).toLocaleDateString()}</span><StatusBadge status={cred.status} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3 text-left"></th>
                    <th>Servicio</th>
                    <th>Usuario</th>
                    <th>URL/IP</th>
                    <th>Categoría</th>
                    <th>Actualizado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(cred => (
                    <tr key={cred.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedItem(cred)}>
                      <td className="p-3"><button onClick={e => toggleFavorite(cred.id, e)} className={cred.favorite ? 'text-yellow-500' : 'text-slate-300'}><Star size={16} fill={cred.favorite ? 'currentColor' : 'none'} /></button></td>
                      <td className="p-3">{cred.service_name}</td>
                      <td className="p-3 font-mono">{cred.username}</td>
                      <td className="p-3 text-indigo-600">{cred.url || '-'}</td>
                      <td className="p-3">{cred.category || '-'}</td>
                      <td className="p-3 text-slate-400">{new Date(cred.last_updated).toLocaleDateString()}</td>
                      <td className="p-3"><div className="flex gap-2"><button onClick={e => { e.stopPropagation(); handleCopy(cred.username, 'Usuario'); }} className="text-indigo-500"><Copy size={14} /></button><button onClick={e => { e.stopPropagation(); setEditingItem(cred); setFormData({ ...cred, password: '' }); setShowForm(true); }} className="text-blue-500"><Edit size={14} /></button><button onClick={e => { e.stopPropagation(); handleDelete(cred.id); }} className="text-red-500"><Trash2 size={14} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filtered.length === 0 && (<div className="text-center py-16"><Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p>{showFavoritesOnly ? 'No hay favoritos' : 'No hay credenciales'}</p><button onClick={() => setShowForm(true)} className="mt-4 text-indigo-600">+ Agregar</button></div>)}
        </div>
      </div>

      {/* Modales */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between mb-4"><h2 className="text-xl font-bold">Nueva Categoría</h2><button onClick={() => setShowCategoryForm(false)}><X size={20} /></button></div>
            <input type="text" placeholder="Nombre" className="input" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} />
            <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto p-2 border rounded-lg my-3">
              {AVAILABLE_ICONS.map(icon => { const Ic = icon.icon; return (<button key={icon.name} onClick={() => setNewCategory({...newCategory, icon: icon.name})} className={`p-1.5 rounded ${newCategory.icon === icon.name ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100'}`}><Ic className="w-5 h-5" /></button>); })}
            </div>
            <div className="grid grid-cols-4 gap-1 mb-3">
              {colorOptions.map((color, i) => (<button key={i} onClick={() => setNewCategory({...newCategory, color})} className={`h-8 rounded-lg bg-gradient-to-r ${color} ${newCategory.color === color ? 'ring-2 ring-indigo-500' : ''}`} />))}
            </div>
            <div className="flex gap-3"><button onClick={() => setShowCategoryForm(false)} className="btn-secondary flex-1">Cancelar</button><button onClick={addCustomCategory} className="btn-primary flex-1">Crear</button></div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-5 border-b"><h2 className="text-xl font-bold">{editingItem ? 'Editar' : 'Nueva'} Credencial</h2></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <input type="text" placeholder="Servicio *" className="input" value={formData.service_name} onChange={e => setFormData({...formData, service_name: e.target.value})} required />
              <input type="text" placeholder="URL/IP" className="input" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Usuario *" className="input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                <input type="password" placeholder="Contraseña *" className="input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input">
                  <option value="">Sin categoría</option>
                  {Object.entries(allCategories).map(([k, v]) => (<option key={k} value={k}>{v.name}</option>))}
                </select>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="input">
                  <option value="active">Activa</option><option value="inactive">Inactiva</option>
                </select>
              </div>
              <textarea placeholder="Notas" rows="3" className="input" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              <div className="bg-amber-50 p-3 rounded-lg"><Lock size={14} className="inline mr-2" /> Seguridad AES-256</div>
              <div className="flex gap-3"><button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary flex-1">Cancelar</button><button type="submit" className="btn-primary flex-1">{editingItem ? 'Actualizar' : 'Guardar'}</button></div>
            </form>
          </div>
        </div>
      )}

      {revealedData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between mb-4"><h2 className="text-xl font-bold">{revealedData.service_name}</h2><button onClick={() => setRevealedData(null)}><X size={20} /></button></div>
            <div className="bg-slate-50 p-3 rounded-lg mb-2"><p className="text-xs text-slate-500">Usuario</p><code className="text-sm font-mono">{revealedData.username}</code><button onClick={() => handleCopy(revealedData.username, 'Usuario')} className="float-right"><Copy size={14} /></button></div>
            <div className="bg-slate-50 p-3 rounded-lg"><p className="text-xs text-slate-500">Contraseña</p><code className="text-sm font-mono break-all">{revealedData.password}</code><button onClick={() => handleCopy(revealedData.password, 'Contraseña')} className="float-right"><Copy size={14} /></button><PasswordStrength length={revealedData.password?.length || 0} /></div>
            {revealedData.url && <div className="bg-slate-50 p-3 rounded-lg mt-2"><p className="text-xs text-slate-500">URL/IP</p><a href={revealedData.url} className="text-indigo-600 text-sm">{revealedData.url}</a></div>}
            <div className="flex gap-3 mt-4"><button onClick={() => { setEditingItem(revealedData); setFormData({ ...revealedData, password: '' }); setRevealedData(null); setShowForm(true); }} className="btn-secondary flex-1">Editar</button><button onClick={() => { handleDelete(revealedData.id); setRevealedData(null); }} className="bg-red-600 text-white px-4 py-2 rounded-lg flex-1">Eliminar</button></div>
          </div>
        </div>
      )}

      <PasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} onConfirm={passwordModalConfig.onConfirm} title={passwordModalConfig.title} message={passwordModalConfig.message} />
      <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={async () => { await confirmModalConfig.onConfirm(); setShowConfirmModal(false); }} title={confirmModalConfig.title} message={confirmModalConfig.message} confirmText={confirmModalConfig.confirmText} type={confirmModalConfig.type} />
      <AlertModal isOpen={showAlertModal} onClose={() => setShowAlertModal(false)} title={alertModalConfig.title} message={alertModalConfig.message} type={alertModalConfig.type} />
    </div>
  );
}