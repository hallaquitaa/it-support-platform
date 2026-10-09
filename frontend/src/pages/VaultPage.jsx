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

// ============================================================
// ICONOS DISPONIBLES
// ============================================================

const AVAILABLE_ICONS = [
  { name: 'Globe', icon: Globe },
  { name: 'Server', icon: Server },
  { name: 'Database', icon: Database },
  { name: 'Mail', icon: Mail },
  { name: 'Network', icon: Network },
  { name: 'Wifi', icon: Wifi },
  { name: 'Cloud', icon: Cloud },
  { name: 'Github', icon: Github },
  { name: 'Twitter', icon: Twitter },
  { name: 'Facebook', icon: Facebook },
  { name: 'Instagram', icon: Instagram },
  { name: 'Youtube', icon: Youtube },
  { name: 'Linkedin', icon: Linkedin },
  { name: 'MessageCircle', icon: MessageCircle },
  { name: 'Monitor', icon: Monitor },
  { name: 'Laptop', icon: Laptop },
  { name: 'Printer', icon: Printer },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Camera', icon: Camera },
  { name: 'Headphones', icon: Headphones },
  { name: 'Terminal', icon: Terminal },
  { name: 'Code', icon: Code },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'MapPin', icon: MapPin },
  { name: 'Settings', icon: Settings },
  { name: 'User', icon: User },
  { name: 'Users', icon: Users },
  { name: 'Bell', icon: Bell },
  { name: 'Bookmark', icon: Bookmark },
  { name: 'Package', icon: Package },
  { name: 'Key', icon: Key },
  { name: 'Lock', icon: Lock },
  { name: 'Shield', icon: Shield }
];

// ============================================================
// CATEGORÍAS PREDEFINIDAS
// ============================================================

const DEFAULT_CATEGORIES = {
  Routers: {
    name: 'Routers y Switches',
    icon: 'Network',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'Equipos de red y conectividad',
    isDefault: true
  },

  Correos: {
    name: 'Cuentas de Correo',
    icon: 'Mail',
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-200 dark:border-red-800',
    description: 'Correos electrónicos y cuentas',
    isDefault: true
  },

  Proveedores: {
    name: 'Portal Proveedores',
    icon: 'Globe',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'Portales de servicios externos',
    isDefault: true
  },

  'Bases Datos': {
    name: 'Bases de Datos',
    icon: 'Database',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    description: 'Bases de datos',
    isDefault: true
  },

  AnyDesk: {
    name: 'Conexiones AnyDesk',
    icon: 'Cloud',
    color: 'from-amber-500 to-yellow-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800',
    description: 'IDs de conexión remota AnyDesk',
    isDefault: true
  },

  Servidores: {
    name: 'Servidores',
    icon: 'Server',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    description: 'Acceso a servidores físicos/virtuales',
    isDefault: true
  },

  Impresoras: {
    name: 'Impresoras',
    icon: 'Printer',
    color: 'from-slate-500 to-gray-500',
    bgColor: 'bg-slate-50 dark:bg-slate-800/60',
    borderColor: 'border-slate-200 dark:border-slate-700',
    description: 'Impresoras y multifuncionales',
    isDefault: true
  },

  POS: {
    name: 'Puntos de Venta',
    icon: 'ShoppingBag',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950/40',
    borderColor: 'border-pink-200 dark:border-pink-800',
    description: 'Sistemas POS y cajas registradoras',
    isDefault: true
  }
};

// ============================================================
// CATEGORÍAS PERSONALIZADAS
// ============================================================

const loadCustomCategories = () => {
  try {
    const saved = localStorage.getItem('vaultCustomCategories');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveCustomCategories = custom => {
  localStorage.setItem(
    'vaultCustomCategories',
    JSON.stringify(custom)
  );
};

// ============================================================
// BADGE DE ESTADO
// ============================================================

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const config = {
    active: {
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-950/60',
      label: 'Activa'
    },

    inactive: {
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-950/60',
      label: 'Inactiva'
    }
  };

  const c = config[status] || config.active;
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.color}`}
    >
      <Icon size={14} />
      {c.label}
    </span>
  );
};

// ============================================================
// FUERZA DE CONTRASEÑA
// ============================================================

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
        <div
          className={`h-full ${color} rounded-full transition-all duration-300`}
          style={{ width }}
        />
      </div>

      <span className="text-xs text-slate-500 dark:text-slate-400 w-10">
        {strength}
      </span>
    </div>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function VaultPage() {
  const [credentials, setCredentials] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [mostUsed, setMostUsed] = useState([]);

  const [customCategories, setCustomCategories] =
    useState(loadCustomCategories());

  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [revealedData, setRevealedData] = useState(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'Package',
    color: 'from-slate-500 to-gray-500'
  });

  const [formData, setFormData] = useState({
    service_name: '',
    url: '',
    username: '',
    password: '',
    notes: '',
    category: '',
    status: 'active'
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordModalConfig, setPasswordModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: null
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Eliminar',
    type: 'danger'
  });

  const [showAlertModal, setShowAlertModal] = useState(false);

  const [alertModalConfig, setAlertModalConfig] = useState({
    title: '',
    message: '',
    type: 'success'
  });

  // ============================================================
  // CATEGORÍAS
  // ============================================================

  const getVisibleCategories = () => {
    const all = {
      ...DEFAULT_CATEGORIES,
      ...customCategories
    };

    return Object.fromEntries(
      Object.entries(all).filter(
        ([, category]) => !category.deleted
      )
    );
  };

  const allCategories = getVisibleCategories();

  // ============================================================
  // EFECTOS
  // ============================================================

  useEffect(() => {
    loadData();
    loadFavorites();
    loadMostUsed();
  }, []);

  useEffect(() => {
    filterCredentials();
  }, [
    credentials,
    searchTerm,
    selectedCategory,
    showFavoritesOnly,
    favorites
  ]);

  useEffect(() => {
    loadData();
  }, [customCategories]);

  // ============================================================
  // DATOS
  // ============================================================

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
      console.error(error);
    }
  };

  // ============================================================
  // FILTROS
  // ============================================================

  const filterCredentials = () => {
    let result = [...credentials];

    if (showFavoritesOnly) {
      const favoriteIds = favorites.map(f => f.id);

      result = result.filter(c =>
        favoriteIds.includes(c.id)
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      result = result.filter(c =>
        c.service_name?.toLowerCase().includes(term) ||
        c.username?.toLowerCase().includes(term) ||
        (c.url && c.url.toLowerCase().includes(term))
      );
    }

    if (selectedCategory) {
      result = result.filter(
        c => c.category === selectedCategory
      );
    }

    setFiltered(result);
  };

  // ============================================================
  // FAVORITOS
  // ============================================================

  const toggleFavorite = async (credId, e) => {
    e.stopPropagation();

    try {
      const result =
        await vaultService.toggleFavorite(credId);

      await loadData();
      await loadFavorites();

      setAlertModalConfig({
        title: result.favorited
          ? '⭐ Agregado'
          : '⭐ Eliminado',
        message: result.favorited
          ? 'Credencial agregada a favoritos'
          : 'Credencial eliminada de favoritos',
        type: 'success'
      });

      setShowAlertModal(true);
    } catch (error) {
      setAlertModalConfig({
        title: '❌ Error',
        message:
          error.response?.data?.error ||
          error.message,
        type: 'error'
      });

      setShowAlertModal(true);
    }
  };

  // ============================================================
  // CREDENCIALES
  // ============================================================

  const handleSubmit = async e => {
    e.preventDefault();

    setPasswordModalConfig({
      title: '🔐 Master Password',

      message: editingItem
        ? 'Ingrese la Master Password para modificar esta credencial:'
        : 'Ingrese la Master Password para guardar la credencial cifrada:',

      onConfirm: async mp => {
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
            await vaultService.update(
              editingItem.id,
              dataToSend,
              mp
            );

            setAlertModalConfig({
              title: '✓ Éxito',
              message:
                'Credencial actualizada correctamente',
              type: 'success'
            });
          } else {
            await vaultService.create(
              dataToSend,
              mp
            );

            setAlertModalConfig({
              title: '✓ Éxito',
              message:
                'Credencial guardada correctamente',
              type: 'success'
            });
          }

          setShowAlertModal(true);

          await loadData();

          setShowForm(false);
          setEditingItem(null);

          resetForm();
        } catch (error) {
          setAlertModalConfig({
            title: '❌ Error',
            message:
              error.response?.data?.error ||
              error.message,
            type: 'error'
          });

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

  // ============================================================
  // COPIAR
  // ============================================================

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);

      setAlertModalConfig({
        title: '✓ Copiado',
        message: `${field} copiado al portapapeles`,
        type: 'success'
      });

      setShowAlertModal(true);
    } catch {
      setAlertModalConfig({
        title: '❌ Error',
        message: 'No se pudo copiar al portapapeles',
        type: 'error'
      });

      setShowAlertModal(true);
    }
  };

  // ============================================================
  // ELIMINAR
  // ============================================================

  const handleDelete = async id => {
    setPasswordModalConfig({
      title: '🔐 Eliminar Credencial',

      message:
        'Ingrese la Master Password para eliminar esta credencial. Esta acción no se puede deshacer.',

      onConfirm: async mp => {
        try {
          await vaultService.reveal(id, mp);
          await vaultService.delete(id);

          await loadData();
          await loadFavorites();

          setSelectedItem(null);
          setRevealedData(null);

          setAlertModalConfig({
            title: '✓ Eliminado',
            message:
              'Credencial eliminada correctamente',
            type: 'success'
          });

          setShowAlertModal(true);
        } catch (error) {
          console.error(error);

          setAlertModalConfig({
            title: '❌ Error',
            message: 'Master Password incorrecta',
            type: 'error'
          });

          setShowAlertModal(true);
        }
      }
    });

    setShowPasswordModal(true);
  };

  // ============================================================
  // REVELAR CREDENCIAL
  // ============================================================

  const revealCredential = cred => {
    setPasswordModalConfig({
      title: '🔐 Desbloquear credencial',
      message:
        'Ingrese la Master Password para visualizar usuario y contraseña.',

      onConfirm: async mp => {
        try {
          const data = await vaultService.reveal(
            cred.id,
            mp
          );

          setRevealedData({
            ...data,
            ...cred
          });
        } catch (error) {
          console.error(error);

          setAlertModalConfig({
            title: '❌ Error',
            message: 'Master Password incorrecta',
            type: 'error'
          });

          setShowAlertModal(true);
        }
      }
    });

    setShowPasswordModal(true);
  };

  // ============================================================
  // ICONOS
  // ============================================================

  const getCategoryIcon = categoryKey => {
    const category = allCategories[categoryKey];

    const iconName =
      category?.icon || 'Package';

    const iconObj =
      AVAILABLE_ICONS.find(
        i => i.name === iconName
      );

    return iconObj
      ? iconObj.icon
      : Package;
  };

  const getItemCountByCategory = categoryKey => {
    return credentials.filter(
      item => item.category === categoryKey
    ).length;
  };

  // ============================================================
  // EDITAR CATEGORÍA
  // ============================================================

  const editCategory = (categoryKey, category) => {
    setEditingCategory({
      key: categoryKey,
      originalName: category.name
    });

    setCategoryForm({
      name: category.name,
      icon: category.icon || 'Package',
      color:
        category.color ||
        'from-slate-500 to-gray-500'
    });

    setShowCategoryForm(true);
  };

  const closeCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);

    setCategoryForm({
      name: '',
      icon: 'Package',
      color: 'from-slate-500 to-gray-500'
    });
  };

  const saveCategory = () => {
    if (!categoryForm.name.trim()) {
      setAlertModalConfig({
        title: '❌ Error',
        message: 'Ingrese un nombre para la categoría',
        type: 'error'
      });

      setShowAlertModal(true);
      return;
    }

    const cleanName =
      categoryForm.name.trim();

    if (editingCategory) {
      const categoryKey =
        editingCategory.key;

      const existingCategory =
        allCategories[categoryKey];

      const updated = {
        ...customCategories,

        [categoryKey]: {
          ...(existingCategory || {}),

          name: cleanName,
          icon: categoryForm.icon,
          color: categoryForm.color,

          bgColor:
            existingCategory?.bgColor ||
            'bg-slate-50 dark:bg-slate-800/60',

          borderColor:
            existingCategory?.borderColor ||
            'border-slate-200 dark:border-slate-700',

          description:
            existingCategory?.description ||
            'Categoría personalizada',

          isDefault: false,
          deleted: false
        }
      };

      setCustomCategories(updated);
      saveCustomCategories(updated);

      closeCategoryForm();

      setAlertModalConfig({
        title: '✓ Categoría actualizada',
        message:
          'El nombre, icono y color fueron actualizados correctamente.',
        type: 'success'
      });

      setShowAlertModal(true);

      return;
    }

    let categoryKey =
      cleanName.replace(/\s+/g, '_');

    let counter = 2;
    const originalKey = categoryKey;

    while (allCategories[categoryKey]) {
      categoryKey =
        `${originalKey}_${counter}`;

      counter++;
    }

    const updatedCustom = {
      ...customCategories,

      [categoryKey]: {
        name: cleanName,
        icon: categoryForm.icon,
        color: categoryForm.color,

        bgColor:
          'bg-slate-50 dark:bg-slate-800/60',

        borderColor:
          'border-slate-200 dark:border-slate-700',

        description:
          'Categoría personalizada',

        isDefault: false
      }
    };

    setCustomCategories(updatedCustom);
    saveCustomCategories(updatedCustom);

    closeCategoryForm();

    setAlertModalConfig({
      title: '✓ Éxito',
      message:
        'Categoría creada correctamente',
      type: 'success'
    });

    setShowAlertModal(true);
  };

  // ============================================================
  // ELIMINAR CATEGORÍA
  // ============================================================

  const deleteCategory = (
    categoryKey,
    category
  ) => {
    const itemCount =
      getItemCountByCategory(categoryKey);

    if (itemCount > 0) {
      setAlertModalConfig({
        title: '❌ No se puede eliminar',

        message:
          `No se puede eliminar la categoría "${category.name}" porque tiene ${itemCount} credencial(es) asociadas.`,

        type: 'warning'
      });

      setShowAlertModal(true);
      return;
    }

    setConfirmModalConfig({
      title: 'Eliminar Categoría',

      message:
        `¿Eliminar la categoría "${category.name}"?`,

      onConfirm: () => {
        const updated = {
          ...customCategories
        };

        updated[categoryKey] = {
          ...category,
          deleted: true
        };

        setCustomCategories(updated);
        saveCustomCategories(updated);

        if (
          selectedCategory === categoryKey
        ) {
          setSelectedCategory(null);
        }

        setAlertModalConfig({
          title: '✓ Eliminado',
          message:
            'Categoría eliminada correctamente',
          type: 'success'
        });

        setShowAlertModal(true);
      },

      confirmText: 'Eliminar',
      type: 'danger'
    });

    setShowConfirmModal(true);
  };

  // ============================================================
  // COLORES
  // ============================================================

  const colorOptions = [
    'from-red-500 to-orange-500',
    'from-orange-500 to-yellow-500',
    'from-yellow-500 to-green-500',
    'from-green-500 to-teal-500',
    'from-teal-500 to-cyan-500',
    'from-cyan-500 to-blue-500',
    'from-blue-500 to-indigo-500',
    'from-indigo-500 to-purple-500',
    'from-purple-500 to-pink-500',
    'from-pink-500 to-rose-500',
    'from-slate-500 to-gray-500'
  ];

  // ============================================================
  // EXPORTAR PDF
  // ============================================================

  const exportPDFWithPasswords =
    async masterPassword => {
      try {
        setLoading(true);

        const ids =
          filtered.map(
            cred => cred.id
          );

        const decryptedCredentials =
          await vaultService.revealMultiple(
            ids,
            masterPassword
          );

        const validCredentials =
          decryptedCredentials.filter(
            c => !c.error
          );

        if (
          validCredentials.length === 0
        ) {
          throw new Error(
            'No se pudieron descifrar las credenciales'
          );
        }

        await pdfExportService
          .exportToPDFWithPasswords(
            validCredentials
          );

        setAlertModalConfig({
          title: '✓ Éxito',
          message:
            'PDF con contraseñas generado correctamente',
          type: 'success'
        });

        setShowAlertModal(true);
      } catch (error) {
        console.error(error);

        setAlertModalConfig({
          title: '❌ Error',
          message:
            error.response?.data?.error ||
            error.message,
          type: 'error'
        });

        setShowAlertModal(true);
      } finally {
        setLoading(false);
      }
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="text-slate-500 dark:text-slate-400 animate-pulse">
          Cargando bóveda...
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-6 max-w-[2000px] mx-auto transition-colors duration-200">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
            <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Bóveda de Credenciales
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gestión segura de accesos
            </p>
          </div>

        </div>

        <div className="flex flex-wrap items-center gap-3">

          {stats && (
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 px-4 py-2 rounded-xl">
              <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />

              <span className="text-xl font-bold text-slate-800 dark:text-white">
                {stats.total}
              </span>

              <span className="text-sm text-slate-500 dark:text-slate-400">
                credenciales
              </span>
            </div>
          )}

          {/* VISTA */}

          <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-1">

            <button
              onClick={() =>
                setViewMode('grid')
              }
              className={`p-2 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Grid size={17} />
            </button>

            <button
              onClick={() =>
                setViewMode('table')
              }
              className={`p-2 rounded-md transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <List size={17} />
            </button>

          </div>

          {/* FAVORITOS */}

          <button
            onClick={() =>
              setShowFavoritesOnly(
                !showFavoritesOnly
              )
            }
            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm border transition ${
              showFavoritesOnly
                ? 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800'
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star
              size={15}
              fill={
                showFavoritesOnly
                  ? 'currentColor'
                  : 'none'
              }
            />
            Favoritos
          </button>

          {/* EXCEL */}

          <button
            onClick={() => {
              setPasswordModalConfig({
                title: '📄 Exportar a Excel',

                message:
                  'Ingrese Master Password para incluir contraseñas (opcional - deje vacío para exportar sin contraseñas):',

                onConfirm: async mp => {
                  const includePasswords =
                    mp !== null &&
                    mp !== '';

                  try {
                    await exportService
                      .exportToExcel(
                        includePasswords,
                        includePasswords
                          ? mp
                          : null
                      );

                    setAlertModalConfig({
                      title: '✓ Éxito',
                      message:
                        'Exportado a Excel correctamente',
                      type: 'success'
                    });

                    setShowAlertModal(true);
                  } catch (error) {
                    setAlertModalConfig({
                      title: '❌ Error',
                      message:
                        error.response?.data?.error ||
                        error.message,
                      type: 'error'
                    });

                    setShowAlertModal(true);
                  }
                }
              });

              setShowPasswordModal(true);
            }}
            className="border border-green-500 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40 px-3 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Download size={15} />
            Excel
          </button>

          {/* PDF */}

          <button
            onClick={() => {
              setPasswordModalConfig({
                title: '🔐 Exportar a PDF',

                message:
                  'Ingrese la Master Password para exportar las credenciales.\n\n⚠️ El PDF incluirá las contraseñas en texto plano. Manténgalo en un lugar seguro.',

                onConfirm:
                  async mp => {
                    await exportPDFWithPasswords(
                      mp
                    );
                  }
              });

              setShowPasswordModal(true);
            }}
            className="border border-red-500 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Download size={15} />
            PDF
          </button>

          {/* REFRESCAR */}

          <button
            onClick={() =>
              loadData()
            }
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <RefreshCw size={15} />
            Refrescar
          </button>

          {/* CATEGORÍA */}

          <button
            onClick={() => {
              setEditingCategory(null);

              setCategoryForm({
                name: '',
                icon: 'Package',
                color:
                  'from-slate-500 to-gray-500'
              });

              setShowCategoryForm(true);
            }}
            className="border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={15} />
            Categoría
          </button>

          {/* CREDENCIAL */}

          <button
            onClick={() => {
              setEditingItem(null);
              resetForm();
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
          >
            <Plus size={15} />
            Credencial
          </button>

        </div>
      </div>

      {/* ======================================================
          BUSCADOR
      ====================================================== */}

      <div className="flex justify-end mb-5">

        <div className="relative w-96">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />

          <input
            type="text"
            placeholder="Buscar credencial..."
            value={searchTerm}
            onChange={e =>
              setSearchTerm(
                e.target.value
              )
            }
            className="block w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition"
          />

        </div>
      </div>

      {/* ======================================================
          LAYOUT
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* SIDEBAR */}

        <div className="lg:col-span-1">

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-6">

            <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">

              <h3 className="font-semibold text-slate-800 dark:text-white">
                Categorías
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona una carpeta
              </p>

            </div>

            <div className="p-2 max-h-[calc(100vh-250px)] overflow-y-auto">

              {/* TODAS */}

              <button
                onClick={() =>
                  setSelectedCategory(null)
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition ${
                  !selectedCategory
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Folder className="w-5 h-5" />

                <span className="flex-1 text-left font-medium">
                  Todas
                </span>

                <span className="text-sm text-slate-400">
                  {credentials.length}
                </span>
              </button>

              {/* CATEGORÍAS */}

              {Object.entries(
                allCategories
              ).map(([key, cat]) => {

                const Icon =
                  getCategoryIcon(key);

                const itemCount =
                  getItemCountByCategory(
                    key
                  );

                const isSelected =
                  selectedCategory ===
                  key;

                const isHovered =
                  hoveredCategory ===
                  key;

                return (
                  <div
                    key={key}
                    className="relative mb-1"
                    onMouseEnter={() =>
                      setHoveredCategory(
                        key
                      )
                    }
                    onMouseLeave={() =>
                      setHoveredCategory(
                        null
                      )
                    }
                  >

                    <button
                      onClick={() =>
                        setSelectedCategory(
                          key
                        )
                      }
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                        isSelected
                          ? `bg-gradient-to-r ${cat.color} text-white shadow-sm`
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >

                      <Icon className="w-5 h-5 flex-shrink-0" />

                      <span className="flex-1 text-left font-medium truncate">
                        {cat.name}
                      </span>

                      <span className="text-sm opacity-70">
                        {itemCount}
                      </span>

                    </button>

                    {/* ACCIONES */}

                    {isHovered && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-1 z-10">

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            editCategory(
                              key,
                              cat
                            );
                          }}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded"
                          title="Editar categoría"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteCategory(
                              key,
                              cat
                            );
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded"
                          title="Eliminar categoría"
                        >
                          <Trash2 size={14} />
                        </button>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>

            {/* MÁS USADAS */}

            {mostUsed.length > 0 &&
              !selectedCategory && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 px-2 pb-2">

                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                    <TrendingUp size={12} />
                    Más usadas
                  </h4>

                  {mostUsed.map(
                    cred => (
                      <button
                        key={cred.id}
                        onClick={() => {
                          setSelectedItem(
                            cred
                          );

                          vaultService.incrementUsage(
                            cred.id
                          );
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition truncate"
                      >
                        {cred.service_name}
                      </button>
                    )
                  )}

                </div>
              )}

          </div>

        </div>

        {/* CONTENIDO */}

        <div className="lg:col-span-4">

          {/* CATEGORÍA SELECCIONADA */}

          {selectedCategory &&
            allCategories[
              selectedCategory
            ] && (
              <div
                className={`mb-4 p-4 rounded-xl ${allCategories[selectedCategory].bgColor} border ${allCategories[selectedCategory].borderColor}`}
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    {(() => {
                      const Icon =
                        getCategoryIcon(
                          selectedCategory
                        );

                      return (
                        <Icon className="w-7 h-7" />
                      );
                    })()}

                    <div>

                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                        {
                          allCategories[
                            selectedCategory
                          ].name
                        }
                      </h2>

                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {
                          allCategories[
                            selectedCategory
                          ].description
                        }
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() => {
                      setPasswordModalConfig({
                        title:
                          '🔐 Exportar categoría a PDF',

                        message:
                          `Exportar "${allCategories[selectedCategory].name}" a PDF.\n\n⚠️ El PDF incluirá las contraseñas en texto plano.`,

                        onConfirm:
                          async mp => {
                            try {
                              setLoading(
                                true
                              );

                              const ids =
                                filtered.map(
                                  cred =>
                                    cred.id
                                );

                              const decrypted =
                                await vaultService.revealMultiple(
                                  ids,
                                  mp
                                );

                              const valid =
                                decrypted.filter(
                                  c =>
                                    !c.error
                                );

                              await pdfExportService.exportToPDFWithPasswords(
                                valid
                              );

                              setAlertModalConfig(
                                {
                                  title:
                                    '✓ Éxito',
                                  message:
                                    'PDF de categoría generado',
                                  type: 'success'
                                }
                              );

                              setShowAlertModal(
                                true
                              );
                            } catch (error) {
                              setAlertModalConfig(
                                {
                                  title:
                                    '❌ Error',
                                  message:
                                    error.message,
                                  type: 'error'
                                }
                              );

                              setShowAlertModal(
                                true
                              );
                            } finally {
                              setLoading(
                                false
                              );
                            }
                          }
                      });

                      setShowPasswordModal(
                        true
                      );
                    }}
                    className="text-sm bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 px-3 py-2 rounded-lg flex items-center gap-2 text-slate-700 dark:text-slate-200 transition"
                  >
                    <Download size={14} />
                    Exportar PDF
                  </button>

                </div>

              </div>
            )}

          {/* ==================================================
              GRID
          ================================================== */}

          {viewMode === 'grid' ? (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

              {filtered.map(cred => {

                const Icon =
                  getCategoryIcon(
                    cred.category
                  );

                const category =
                  allCategories[
                    cred.category
                  ];

                return (

                  <div
                    key={cred.id}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl dark:hover:shadow-black/30 hover:border-indigo-200 dark:hover:border-indigo-900 cursor-pointer overflow-hidden group transition-all duration-200"
                    onClick={() =>
                      setSelectedItem(
                        cred
                      )
                    }
                  >

                    {/* COLOR SUPERIOR */}

                    <div
                      className={`h-1.5 bg-gradient-to-r ${
                        category?.color ||
                        'from-slate-500 to-slate-600'
                      }`}
                    />

                    <div className="p-4">

                      {/* HEADER */}

                      <div className="flex items-center justify-between mb-4">

                        <div className="flex items-center gap-3 flex-1 min-w-0">

                          <div
                            className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                              category?.bgColor ||
                              'bg-slate-100 dark:bg-slate-800'
                            }`}
                          >
                            <Icon className="w-7 h-7" />
                          </div>

                          <div className="min-w-0">

                            <h3 className="font-semibold text-base text-slate-800 dark:text-white truncate">
                              {cred.service_name}
                            </h3>

                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                              {category?.name ||
                                'Sin categoría'}
                            </p>

                          </div>

                        </div>

                        {/* ACCIONES */}

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-1">

                          <button
                            onClick={e =>
                              toggleFavorite(
                                cred.id,
                                e
                              )
                            }
                            className={`p-1.5 rounded-lg ${
                              cred.favorite
                                ? 'text-yellow-500'
                                : 'text-slate-400 hover:text-yellow-500 dark:text-slate-500'
                            }`}
                            title="Favorito"
                          >
                            <Star
                              size={15}
                              fill={
                                cred.favorite
                                  ? 'currentColor'
                                  : 'none'
                              }
                            />
                          </button>

                          <button
                            onClick={e => {
                              e.stopPropagation();

                              handleCopy(
                                cred.username,
                                'Usuario'
                              );
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400"
                            title="Copiar usuario"
                          >
                            <Copy size={15} />
                          </button>

                          <button
                            onClick={e => {
                              e.stopPropagation();

                              setEditingItem(
                                cred
                              );

                              setFormData({
                                ...cred,
                                password: ''
                              });

                              setShowForm(
                                true
                              );
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400"
                            title="Editar"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            onClick={e => {
                              e.stopPropagation();

                              handleDelete(
                                cred.id
                              );
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
                            title="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>

                      </div>

                      {/* DATOS OCULTOS */}

                      <div className="space-y-3 text-sm">

                        <div className="flex justify-between gap-3">

                          <span className="text-slate-500 dark:text-slate-400">
                            Usuario:
                          </span>

                          <span className="font-mono text-sm text-slate-400 dark:text-slate-500 tracking-widest">
                            ••••••••••••
                          </span>

                        </div>

                        <div className="flex justify-between gap-3">

                          <span className="text-slate-500 dark:text-slate-400">
                            Contraseña:
                          </span>

                          <span className="font-mono text-sm text-slate-400 dark:text-slate-500 tracking-widest">
                            ••••••••••••
                          </span>

                        </div>

                      </div>

                      {/* OJO GRANDE */}

                      <div className="flex justify-center py-3">

                        <button
                          onClick={e => {
                            e.stopPropagation();

                            revealCredential(
                              cred
                            );
                          }}
                          className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:scale-105 flex items-center justify-center transition-all"
                          title="Visualizar credencial"
                        >
                          <Eye size={22} />
                        </button>

                      </div>

                      {/* URL */}

                      {cred.url && (
                        <div className="flex justify-between gap-3 text-sm">

                          <span className="text-slate-500 dark:text-slate-400">
                            URL/IP:
                          </span>

                          <span className="text-indigo-600 dark:text-indigo-400 truncate">
                            {cred.url}
                          </span>

                        </div>
                      )}

                      {/* FOOTER */}

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">

                        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(
                            cred.last_updated
                          ).toLocaleDateString()}
                        </span>

                        <StatusBadge
                          status={
                            cred.status
                          }
                        />

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          ) : (

            /* ==================================================
               TABLA
            ================================================== */

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">

                    <tr className="text-slate-600 dark:text-slate-300">

                      <th className="p-3 text-left"></th>

                      <th className="p-3 text-left">
                        Servicio
                      </th>

                      <th className="p-3 text-center w-20">
                        <Eye
                          size={18}
                          className="mx-auto text-indigo-500 dark:text-indigo-400"
                        />
                      </th>

                      <th className="p-3 text-left">
                        Usuario
                      </th>

                      <th className="p-3 text-left">
                        URL/IP
                      </th>

                      <th className="p-3 text-left">
                        Categoría
                      </th>

                      <th className="p-3 text-left">
                        Actualizado
                      </th>

                      <th className="p-3 text-left">
                        Acciones
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filtered.map(
                      cred => (
                        <tr
                          key={cred.id}
                          className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition"
                          onClick={() =>
                            setSelectedItem(
                              cred
                            )
                          }
                        >

                          <td className="p-3">

                            <button
                              onClick={e =>
                                toggleFavorite(
                                  cred.id,
                                  e
                                )
                              }
                              className={
                                cred.favorite
                                  ? 'text-yellow-500'
                                  : 'text-slate-300 dark:text-slate-600'
                              }
                            >
                              <Star
                                size={16}
                                fill={
                                  cred.favorite
                                    ? 'currentColor'
                                    : 'none'
                                }
                              />
                            </button>

                          </td>

                          <td className="p-3 font-medium text-slate-800 dark:text-white">
                            {cred.service_name}
                          </td>

                          {/* OJO PARA VISUALIZAR LA CREDENCIAL */}

                          <td className="p-3 text-center">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                revealCredential(cred);
                              }}
                              className="w-10 h-10 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:border-indigo-300 dark:hover:border-indigo-700 hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-sm"
                              title="Visualizar credencial"
                              aria-label={`Visualizar credencial ${cred.service_name}`}
                            >
                              <Eye size={21} />
                            </button>
                          </td>

                          <td className="p-3 font-mono text-slate-500 dark:text-slate-400">
                            ••••••••••••
                          </td>

                          <td className="p-3 text-indigo-600 dark:text-indigo-400">
                            {cred.url ||
                              '-'}
                          </td>

                          <td className="p-3 text-slate-600 dark:text-slate-300">
                            {allCategories[
                              cred.category
                            ]?.name ||
                              cred.category ||
                              '-'}
                          </td>

                          <td className="p-3 text-slate-400 dark:text-slate-500">
                            {new Date(
                              cred.last_updated
                            ).toLocaleDateString()}
                          </td>

                          <td className="p-3">

                            <div className="flex gap-2">

                              <button
                                onClick={e => {
                                  e.stopPropagation();

                                  handleCopy(
                                    cred.username,
                                    'Usuario'
                                  );
                                }}
                                className="text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400"
                                title="Copiar usuario"
                              >
                                <Copy
                                  size={15}
                                />
                              </button>

                              <button
                                onClick={e => {
                                  e.stopPropagation();

                                  setEditingItem(
                                    cred
                                  );

                                  setFormData({
                                    ...cred,
                                    password: ''
                                  });

                                  setShowForm(
                                    true
                                  );
                                }}
                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400"
                                title="Editar"
                              >
                                <Edit
                                  size={15}
                                />
                              </button>

                              <button
                                onClick={e => {
                                  e.stopPropagation();

                                  handleDelete(
                                    cred.id
                                  );
                                }}
                                className="text-red-500 hover:text-red-700 dark:text-red-400"
                                title="Eliminar"
                              >
                                <Trash2
                                  size={15}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

          {/* SIN RESULTADOS */}

          {filtered.length === 0 && (
            <div className="text-center py-16">

              <Shield className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />

              <p className="text-slate-500 dark:text-slate-400">
                {showFavoritesOnly
                  ? 'No hay favoritos'
                  : 'No hay credenciales'}
              </p>

              <button
                onClick={() => {
                  setEditingItem(null);
                  resetForm();
                  setShowForm(true);
                }}
                className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                + Agregar
              </button>

            </div>
          )}

        </div>
      </div>

      {/* ======================================================
          MODAL CATEGORÍA
      ====================================================== */}

      {showCategoryForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">

              <div>

                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {editingCategory
                    ? 'Editar categoría'
                    : 'Nueva categoría'}
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Personaliza nombre, icono y color
                </p>

              </div>

              <button
                onClick={closeCategoryForm}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>

            </div>

            <div className="p-6">

              {/* NOMBRE */}

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nombre
              </label>

              <input
                type="text"
                placeholder="Nombre de la categoría"
                value={
                  categoryForm.name
                }
                onChange={e =>
                  setCategoryForm({
                    ...categoryForm,
                    name: e.target.value
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500"
              />

              {/* ICONOS */}

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mt-5 mb-2">
                Icono
              </label>

              <div className="grid grid-cols-6 gap-2 max-h-44 overflow-y-auto p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/60">

                {AVAILABLE_ICONS.map(
                  icon => {

                    const Ic =
                      icon.icon;

                    const selected =
                      categoryForm.icon ===
                      icon.name;

                    return (
                      <button
                        key={icon.name}
                        onClick={() =>
                          setCategoryForm({
                            ...categoryForm,
                            icon: icon.name
                          })
                        }
                        title={icon.name}
                        className={`h-10 rounded-lg flex items-center justify-center transition ${
                          selected
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
                        }`}
                      >
                        <Ic size={20} />
                      </button>
                    );
                  }
                )}

              </div>

              {/* COLORES */}

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mt-5 mb-2">
                Color
              </label>

              <div className="grid grid-cols-4 gap-2">

                {colorOptions.map(
                  (color, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setCategoryForm({
                          ...categoryForm,
                          color
                        })
                      }
                      className={`h-9 rounded-lg bg-gradient-to-r ${color} transition ${
                        categoryForm.color ===
                        color
                          ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900'
                          : ''
                      }`}
                    />
                  )
                )}

              </div>

              {/* BOTONES */}

              <div className="flex gap-3 mt-6">

                <button
                  onClick={
                    closeCategoryForm
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={saveCategory}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition"
                >
                  {editingCategory
                    ? 'Guardar cambios'
                    : 'Crear categoría'}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          MODAL CREDENCIAL
      ====================================================== */}

      {showForm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">

            <div className="sticky top-0 bg-white dark:bg-slate-900 p-5 border-b border-slate-200 dark:border-slate-700 z-10 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {editingItem
                    ? 'Editar credencial'
                    : 'Nueva credencial'}
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Información protegida con AES-256
                </p>

              </div>

              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4"
            >

              <input
                type="text"
                placeholder="Servicio *"
                className="w-full input border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                value={
                  formData.service_name
                }
                onChange={e =>
                  setFormData({
                    ...formData,
                    service_name:
                      e.target.value
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="URL/IP"
                className="w-full input border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                value={
                  formData.url
                }
                onChange={e =>
                  setFormData({
                    ...formData,
                    url: e.target.value
                  })
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <input
                  type="text"
                  placeholder="Usuario *"
                  className="w-full input border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  value={
                    formData.username
                  }
                  onChange={e =>
                    setFormData({
                      ...formData,
                      username:
                        e.target.value
                    })
                  }
                  required
                />

                <input
                  type="password"
                  placeholder={
                    editingItem
                      ? 'Nueva contraseña'
                      : 'Contraseña *'
                  }
                  className="w-full input border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  value={
                    formData.password
                  }
                  onChange={e =>
                    setFormData({
                      ...formData,
                      password:
                        e.target.value
                    })
                  }
                  required={!editingItem}
                />

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <select
                  value={
                    formData.category
                  }
                  onChange={e =>
                    setFormData({
                      ...formData,
                      category:
                        e.target.value
                    })
                  }
                  className="w-full input border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                >
                  <option value="">
                    Sin categoría
                  </option>

                  {Object.entries(
                    allCategories
                  ).map(
                    ([k, v]) => (
                      <option
                        key={k}
                        value={k}
                      >
                        {v.name}
                      </option>
                    )
                  )}

                </select>

                <select
                  value={
                    formData.status
                  }
                  onChange={e =>
                    setFormData({
                      ...formData,
                      status:
                        e.target.value
                    })
                  }
                  className="w-full input border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                >
                  <option value="active">
                    Activa
                  </option>

                  <option value="inactive">
                    Inactiva
                  </option>

                </select>

              </div>

              <textarea
                placeholder="Notas"
                rows="3"
                className="w-full input border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 resize-none"
                value={
                  formData.notes
                }
                onChange={e =>
                  setFormData({
                    ...formData,
                    notes:
                      e.target.value
                  })
                }
              />

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 p-3 rounded-xl text-sm">

                <Lock
                  size={15}
                  className="inline mr-2"
                />

                Seguridad AES-256

              </div>

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(
                      false
                    );

                    resetForm();
                    setEditingItem(
                      null
                    );
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition"
                >
                  {editingItem
                    ? 'Actualizar'
                    : 'Guardar'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ======================================================
          MODAL VISUALIZAR CREDENCIAL
      ====================================================== */}

      {revealedData && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">

            {/* HEADER */}

            <div className="flex justify-between items-start mb-5">

              <div>

                <p className="text-xs font-medium text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1">
                  Credencial desbloqueada
                </p>

                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {revealedData.service_name}
                </h2>

              </div>

              <button
                onClick={() =>
                  setRevealedData(
                    null
                  )
                }
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>

            </div>

            {/* USUARIO */}

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl mb-3">

              <div className="flex items-center justify-between mb-1">

                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Usuario
                </p>

                <button
                  onClick={() =>
                    handleCopy(
                      revealedData.username,
                      'Usuario'
                    )
                  }
                  className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center"
                  title="Copiar usuario"
                >
                  <Copy size={15} />
                </button>

              </div>

              <code className="text-base font-mono text-slate-800 dark:text-white break-all">
                {
                  revealedData.username
                }
              </code>

            </div>

            {/* CONTRASEÑA */}

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">

              <div className="flex items-center justify-between mb-1">

                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Contraseña
                </p>

                <button
                  onClick={() =>
                    handleCopy(
                      revealedData.password,
                      'Contraseña'
                    )
                  }
                  className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center"
                  title="Copiar contraseña"
                >
                  <Copy size={15} />
                </button>

              </div>

              <code className="text-base font-mono text-slate-800 dark:text-white break-all">
                {
                  revealedData.password
                }
              </code>

              <PasswordStrength
                length={
                  revealedData
                    .password
                    ?.length || 0
                }
              />

            </div>

            {/* URL */}

            {revealedData.url && (
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl mt-3">

                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  URL / IP
                </p>

                <a
                  href={
                    revealedData.url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 text-sm break-all hover:underline"
                >
                  {
                    revealedData.url
                  }
                </a>

              </div>
            )}

            {/* BOTONES */}

            <div className="flex gap-3 mt-5">

              <button
                onClick={() => {
                  setEditingItem(
                    revealedData
                  );

                  setFormData({
                    ...revealedData,
                    password: ''
                  });

                  setRevealedData(
                    null
                  );

                  setShowForm(
                    true
                  );
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Edit
                  size={15}
                  className="inline mr-2"
                />
                Editar
              </button>

              <button
                onClick={() => {
                  const id =
                    revealedData.id;

                  setRevealedData(
                    null
                  );

                  handleDelete(id);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl flex-1 transition"
              >
                <Trash2
                  size={15}
                  className="inline mr-2"
                />
                Eliminar
              </button>

            </div>

            {/* SEGURIDAD */}

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">

              <Lock size={13} />

              Información protegida con Master Password

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          MODALES GENERALES
      ====================================================== */}

      <PasswordModal
        isOpen={
          showPasswordModal
        }
        onClose={() =>
          setShowPasswordModal(
            false
          )
        }
        onConfirm={
          passwordModalConfig.onConfirm
        }
        title={
          passwordModalConfig.title
        }
        message={
          passwordModalConfig.message
        }
      />

      <ConfirmModal
        isOpen={
          showConfirmModal
        }
        onClose={() =>
          setShowConfirmModal(
            false
          )
        }
        onConfirm={
          async () => {
            await confirmModalConfig.onConfirm();
            setShowConfirmModal(
              false
            );
          }
        }
        title={
          confirmModalConfig.title
        }
        message={
          confirmModalConfig.message
        }
        confirmText={
          confirmModalConfig.confirmText
        }
        type={
          confirmModalConfig.type
        }
      />

      <AlertModal
        isOpen={
          showAlertModal
        }
        onClose={() =>
          setShowAlertModal(
            false
          )
        }
        title={
          alertModalConfig.title
        }
        message={
          alertModalConfig.message
        }
        type={
          alertModalConfig.type
        }
      />

    </div>
  );
}