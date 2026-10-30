import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus, Search, KeyRound, Copy, Eye, Edit3, Trash2, Lock, ShieldCheck,
  AlertCircle, CheckCircle2, X, RefreshCw, Download, Globe, Server, Database,
  Wifi, Mail, ShoppingBag, Folder, Package, Cloud, Github, Twitter, Facebook,
  Instagram, Youtube, Linkedin, MessageCircle, HardDrive, Network, Terminal,
  Code, Monitor, Laptop, Printer, Smartphone, Camera, Headphones, Star, Heart,
  MapPin, Settings, User, Users, Bell, Bookmark, Clock, Grid2X2, List, TrendingUp,
  ChevronRight, Shield, FileSpreadsheet, FileText, SlidersHorizontal, ExternalLink,
  History, ShieldAlert
} from 'lucide-react';
import vaultService from '../services/vaultService';
import PasswordModal from '../components/common/PasswordModal';
import ConfirmModal from '../components/common/ConfirmModal';
import AlertModal from '../components/common/AlertModal';
import AuraPageBackground from '../components/common/AuraPageBackground';

const PasswordGeneratorPanel = lazy(() => import('../components/vault/PasswordGeneratorPanel'));

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
  { name: 'Key', icon: KeyRound }, { name: 'Lock', icon: Lock },
  { name: 'Shield', icon: Shield }
];

const DEFAULT_CATEGORIES = {
  Routers: { name: 'Routers y Switches', icon: 'Network', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', description: 'Equipos de red y conectividad', isDefault: true },
  Correos: { name: 'Cuentas de Correo', icon: 'Mail', color: 'from-red-500 to-orange-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', description: 'Correos electrónicos y cuentas', isDefault: true },
  Proveedores: { name: 'Portal Proveedores', icon: 'Globe', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20', description: 'Portales de servicios externos', isDefault: true },
  'Bases Datos': { name: 'Bases de Datos', icon: 'Database', color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', description: 'Bases de datos', isDefault: true },
  AnyDesk: { name: 'Conexiones AnyDesk', icon: 'Cloud', color: 'from-amber-500 to-yellow-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', description: 'IDs de conexión remota AnyDesk', isDefault: true },
  Servidores: { name: 'Servidores', icon: 'Server', color: 'from-indigo-500 to-purple-500', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20', description: 'Acceso a servidores físicos/virtuales', isDefault: true },
  Impresoras: { name: 'Impresoras', icon: 'Printer', color: 'from-slate-400 to-slate-600', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/20', description: 'Impresoras y multifuncionales', isDefault: true },
  POS: { name: 'Puntos de Venta', icon: 'ShoppingBag', color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20', description: 'Sistemas POS y cajas registradoras', isDefault: true }
};

const loadCustomCategories = () => {
  try { return JSON.parse(localStorage.getItem('vaultCustomCategories') || '{}'); }
  catch { return {}; }
};
const saveCustomCategories = (categories) => {
  try { localStorage.setItem('vaultCustomCategories', JSON.stringify(categories)); }
  catch (error) { console.error('No se pudieron guardar las categorías locales:', error); }
};
const COLOR_OPTIONS = [
  'from-red-500 to-orange-500', 'from-orange-500 to-yellow-500',
  'from-yellow-500 to-green-500', 'from-green-500 to-teal-500',
  'from-teal-500 to-cyan-500', 'from-cyan-500 to-blue-500',
  'from-blue-500 to-indigo-500', 'from-indigo-500 to-purple-500',
  'from-purple-500 to-pink-500', 'from-pink-500 to-rose-500',
  'from-slate-500 to-gray-500'
];
const EMPTY_FORM = { service_name: '', url: '', username: '', password: '', notes: '', category: '', status: 'active', expires_at: '' };

const StatusBadge = ({ status }) => {
  const active = status !== 'inactive';
  const Icon = active ? CheckCircle2 : AlertCircle;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${active ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/20 bg-rose-500/10 text-rose-400'}`}><Icon size={12} />{active ? 'Activa' : 'Inactiva'}</span>;
};

const PasswordStrength = ({ length = 0 }) => {
  const strength = length >= 12 ? { label: 'Fuerte', width: '100%', color: 'bg-emerald-400' } : length >= 8 ? { label: 'Media', width: '66%', color: 'bg-amber-400' } : length >= 6 ? { label: 'Baja', width: '40%', color: 'bg-orange-400' } : { label: 'Débil', width: '20%', color: 'bg-rose-400' };
  return <div className="mt-3 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700"><div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} /></div><span className="w-12 text-right text-[11px] text-slate-400">{strength.label}</span></div>;
};

const Surface = ({ children, className = '' }) => <section className={`rounded-xl border border-slate-200/80 bg-white/85 shadow-[0_8px_28px_rgba(35,50,90,0.05)] dark:border-white/[0.07] dark:bg-[#111827]/90 dark:shadow-[0_12px_35px_rgba(0,0,0,0.12)] ${className}`}>{children}</section>;
const FieldLabel = ({ children }) => <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">{children}</label>;
const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0A0E17] dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-cyan-400/50 dark:focus:ring-cyan-400/10';
const smallButton = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-white/15 dark:hover:bg-white/[0.07] dark:text-white dark:hover:text-white';

export default function VaultPage() {
  const [credentials, setCredentials] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [securityAudit, setSecurityAudit] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
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
  const [customCategories, setCustomCategories] = useState(loadCustomCategories);
  const [revealedData, setRevealedData] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: 'Package', color: 'from-slate-500 to-gray-500' });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalConfig, setPasswordModalConfig] = useState({ title: '', message: '', onConfirm: null });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({ title: '', message: '', onConfirm: null, confirmText: 'Eliminar', type: 'danger' });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalConfig, setAlertModalConfig] = useState({ title: '', message: '', type: 'success' });

  const allCategories = useMemo(() => Object.fromEntries(Object.entries({ ...DEFAULT_CATEGORIES, ...customCategories }).filter(([, category]) => !category.deleted)), [customCategories]);
  const favoriteIds = useMemo(() => new Set(favorites.map(item => item.id)), [favorites]);
  const expirationSummary = useMemo(() => {
    const now = Date.now();
    const expired = [];
    const expiring = [];
    credentials.forEach((credential) => {
      if (!credential.expires_at || credential.status === 'inactive') return;
      const expiry = new Date(`${credential.expires_at}T23:59:59`).getTime();
      if (!Number.isFinite(expiry)) return;
      if (expiry < now) expired.push(credential);
      else if (expiry <= now + 30 * 24 * 60 * 60 * 1000) expiring.push(credential);
    });
    return { expired, expiring };
  }, [credentials]);
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return credentials.filter(cred => {
      if (showFavoritesOnly && !favoriteIds.has(cred.id) && !cred.favorite) return false;
      if (selectedCategory && cred.category !== selectedCategory) return false;
      if (!term) return true;
      return [cred.service_name, cred.username, cred.url, cred.notes, allCategories[cred.category]?.name].some(value => String(value || '').toLowerCase().includes(term));
    });
  }, [credentials, searchTerm, selectedCategory, showFavoritesOnly, favoriteIds, allCategories]);

  const loadData = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setLoadError('');
    try {
      const [credsData, statsData] = await Promise.all([vaultService.getAll(), vaultService.getStats()]);
      setCredentials(Array.isArray(credsData) ? credsData : []);
      setStats(statsData || null);
    } catch (error) {
      console.error(error);
      setLoadError(error.response?.data?.error || error.message || 'No se pudieron cargar las credenciales.');
    } finally { if (showSpinner) setLoading(false); }
  }, []);

  const loadFavorites = useCallback(async () => {
    try { const result = await vaultService.getFavorites(); setFavorites(Array.isArray(result) ? result : []); }
    catch (error) { console.error(error); }
  }, []);
  const loadMostUsed = useCallback(async () => {
    try { const result = await vaultService.getMostUsed(5); setMostUsed(Array.isArray(result) ? result : []); }
    catch (error) { console.error(error); }
  }, []);
  useEffect(() => { loadData(); loadFavorites(); loadMostUsed(); }, [loadData, loadFavorites, loadMostUsed]);

  const showAlert = (title, message, type = 'success') => { setAlertModalConfig({ title, message, type }); setShowAlertModal(true); };
  const getCategoryIcon = key => AVAILABLE_ICONS.find(item => item.name === allCategories[key]?.icon)?.icon || Package;
  const getItemCountByCategory = key => credentials.filter(item => item.category === key).length;
  const resetForm = () => setFormData(EMPTY_FORM);
  const openNewCredential = () => { setEditingItem(null); resetForm(); setShowForm(true); };
  const openEditCredential = cred => { setEditingItem(cred); setFormData({ ...EMPTY_FORM, ...cred, password: '' }); setShowForm(true); };

  const handleCopy = async (text, field) => {
    if (text == null || text === '') { showAlert('Dato no disponible', `No hay un valor de ${field.toLowerCase()} para copiar.`, 'warning'); return; }
    try { await navigator.clipboard.writeText(String(text)); showAlert('Copiado', `${field} copiado al portapapeles.`, 'success'); }
    catch { showAlert('Error al copiar', 'No se pudo acceder al portapapeles. Verifica los permisos del navegador.', 'error'); }
  };

  const requestMasterPassword = (config) => { setPasswordModalConfig(config); setShowPasswordModal(true); };

  const runSecurityAudit = () => requestMasterPassword({
    title: 'Auditoría de seguridad',
    message: 'Introduce la Master Password para revisar fortaleza y reutilización. Las contraseñas se analizan en memoria y nunca se devuelven en el informe.',
    onConfirm: async masterPassword => {
      setAuditLoading(true);
      try {
        const result = await vaultService.audit(masterPassword);
        setSecurityAudit(result);
        showAlert(
          'Auditoría completada',
          `Se revisaron ${result.audited} credenciales. Se encontraron ${result.findings.length} con observaciones.`,
          result.findings.length ? 'warning' : 'success'
        );
      } catch (error) {
        showAlert('No se pudo auditar', error.response?.data?.error || error.message, 'error');
      } finally {
        setAuditLoading(false);
      }
    }
  });

  const openCredentialHistory = async (credential) => {
    setHistoryLoading(true);
    setHistoryModal({ credential, entries: [] });
    try {
      const entries = await vaultService.getHistory(credential.id);
      setHistoryModal({ credential, entries: Array.isArray(entries) ? entries : [] });
    } catch (error) {
      setHistoryModal(null);
      showAlert('Historial no disponible', error.response?.data?.error || error.message, 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();
    requestMasterPassword({
      title: 'Verificación de seguridad',
      message: editingItem ? 'Introduce la Master Password para actualizar esta credencial.' : 'Introduce la Master Password para guardar la credencial cifrada.',
      onConfirm: async masterPassword => {
        try {
          const dataToSend = { service_name: formData.service_name, url: formData.url, username: formData.username, password: formData.password, category: formData.category, status: formData.status, expires_at: formData.expires_at || null };
          if (!editingItem || formData.notes) dataToSend.notes = formData.notes;
          if (editingItem) await vaultService.update(editingItem.id, dataToSend, masterPassword);
          else await vaultService.create(dataToSend, masterPassword);
          setShowForm(false); setEditingItem(null); resetForm();
          await Promise.all([loadData(false), loadFavorites(), loadMostUsed()]);
          showAlert('Operación completada', editingItem ? 'La credencial se actualizó correctamente.' : 'La credencial se guardó correctamente.', 'success');
        } catch (error) { showAlert('No se pudo guardar', error.response?.data?.error || error.message || 'Ocurrió un error inesperado.', 'error'); }
      }
    });
  };

  const toggleFavorite = async (credId, event) => {
    event?.stopPropagation();
    try {
      const result = await vaultService.toggleFavorite(credId);
      await Promise.all([loadData(false), loadFavorites()]);
      showAlert(result.favorited ? 'Añadida a favoritos' : 'Eliminada de favoritos', result.favorited ? 'La credencial se añadió a favoritos.' : 'La credencial se quitó de favoritos.', 'success');
    } catch (error) { showAlert('Error en favoritos', error.response?.data?.error || error.message, 'error'); }
  };

  const revealCredential = cred => requestMasterPassword({
    title: 'Desbloquear credencial',
    message: 'Introduce la Master Password para visualizar los datos protegidos.',
    onConfirm: async masterPassword => {
      try {
        const data = await vaultService.reveal(cred.id, masterPassword);
        setRevealedData({ ...cred, ...data });
        try { await vaultService.incrementUsage(cred.id); loadMostUsed(); } catch (error) { console.error(error); }
      } catch (error) { showAlert('No se pudo desbloquear', error.response?.data?.error || 'La Master Password es incorrecta o no fue posible descifrar la credencial.', 'error'); }
    }
  });

  const handleDelete = id => requestMasterPassword({
    title: 'Confirmar eliminación',
    message: 'Introduce la Master Password para autorizar la eliminación definitiva de esta credencial.',
    onConfirm: async masterPassword => {
      try {
        await vaultService.reveal(id, masterPassword);
        await vaultService.delete(id);
        setSelectedItem(null); setRevealedData(null);
        await Promise.all([loadData(false), loadFavorites(), loadMostUsed()]);
        showAlert('Credencial eliminada', 'La credencial se eliminó correctamente.', 'success');
      } catch (error) { showAlert('No se pudo eliminar', error.response?.data?.error || 'Verifica la Master Password e inténtalo de nuevo.', 'error'); }
    }
  });

  const openCategoryForm = (key = null, category = null) => {
    setEditingCategory(key && category ? { key, originalName: category.name } : null);
    setCategoryForm(category ? { name: category.name, icon: category.icon || 'Package', color: category.color || COLOR_OPTIONS[10] } : { name: '', icon: 'Package', color: COLOR_OPTIONS[10] });
    setShowCategoryForm(true);
  };
  const closeCategoryForm = () => { setShowCategoryForm(false); setEditingCategory(null); setCategoryForm({ name: '', icon: 'Package', color: COLOR_OPTIONS[10] }); };

  const saveCategory = () => {
    const cleanName = categoryForm.name.trim();
    if (!cleanName) { showAlert('Falta el nombre', 'Escribe un nombre para la categoría.', 'error'); return; }
    if (editingCategory) {
      const key = editingCategory.key;
      const updated = { ...customCategories, [key]: { ...(customCategories[key] || {}), name: cleanName, icon: categoryForm.icon, color: categoryForm.color, bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', description: customCategories[key]?.description || 'Categoría personalizada', isDefault: false, deleted: false } };
      setCustomCategories(updated); saveCustomCategories(updated); closeCategoryForm(); showAlert('Categoría actualizada', 'Se guardaron los cambios de la categoría.', 'success'); return;
    }
    let key = cleanName.replace(/\s+/g, '_'); const base = key; let counter = 2;
    while ({ ...DEFAULT_CATEGORIES, ...customCategories }[key]) key = `${base}_${counter++}`;
    const updated = { ...customCategories, [key]: { name: cleanName, icon: categoryForm.icon, color: categoryForm.color, bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', description: 'Categoría personalizada', isDefault: false } };
    setCustomCategories(updated); saveCustomCategories(updated); closeCategoryForm(); showAlert('Categoría creada', 'La nueva categoría está disponible.', 'success');
  };

  const deleteCategory = (key, category) => {
    const itemCount = getItemCountByCategory(key);
    if (itemCount > 0) { showAlert('No se puede eliminar', `La categoría “${category.name}” contiene ${itemCount} credencial(es). Reasígnalas antes de eliminarla.`, 'warning'); return; }
    setConfirmModalConfig({ title: 'Eliminar categoría', message: `¿Quieres eliminar la categoría “${category.name}”?`, confirmText: 'Eliminar categoría', type: 'danger', onConfirm: () => {
      const updated = { ...customCategories, [key]: { ...category, deleted: true } };
      setCustomCategories(updated); saveCustomCategories(updated); if (selectedCategory === key) setSelectedCategory(null);
      showAlert('Categoría eliminada', 'La categoría se eliminó correctamente.', 'success');
    } });
    setShowConfirmModal(true);
  };

  const exportExcel = () => requestMasterPassword({
    title: 'Exportar a Excel',
    message: 'Introduce la Master Password para incluir contraseñas. Si deseas exportar solo los datos generales, deja el campo vacío.',
    onConfirm: async masterPassword => {
      try { const includePasswords = masterPassword !== null && masterPassword !== ''; const { default: exportService } = await import('../services/exportService'); await exportService.exportToExcel(includePasswords, includePasswords ? masterPassword : null); showAlert('Exportación completada', 'El archivo Excel se generó correctamente.', 'success'); }
      catch (error) { showAlert('Error de exportación', error.response?.data?.error || error.message, 'error'); }
    }
  });
  const exportPDF = (credentialsToExport = filtered, title = 'Exportar a PDF') => requestMasterPassword({
    title,
    message: 'Introduce la Master Password para descifrar las credenciales que se incluirán en el PDF. El documento puede contener contraseñas en texto legible; guárdalo de forma segura.',
    onConfirm: async masterPassword => {
      try {
        setLoading(true);
        const ids = credentialsToExport.map(cred => cred.id);
        if (!ids.length) throw new Error('No hay credenciales para exportar.');
        const decrypted = await vaultService.revealMultiple(ids, masterPassword);
        const valid = decrypted.filter(cred => !cred.error);
        if (!valid.length) throw new Error('No se pudieron descifrar las credenciales seleccionadas.');
        const { default: pdfExportService } = await import('../services/pdfExportService'); await pdfExportService.exportToPDFWithPasswords(valid);
        showAlert('Exportación completada', 'El PDF se generó correctamente. Recuerda proteger el archivo.', 'success');
      } catch (error) { showAlert('Error de exportación', error.response?.data?.error || error.message, 'error'); }
      finally { setLoading(false); }
    }
  });

  const openMostUsed = async cred => {
    setSelectedCategory(null); setSearchTerm(cred.service_name || ''); setShowFavoritesOnly(false);
    try { await vaultService.incrementUsage(cred.id); await loadMostUsed(); } catch (error) { console.error(error); }
    setSelectedItem(cred);
  };

  if (loading) return <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7fc] text-slate-700 dark:bg-[#080d18] dark:text-slate-300"><AuraPageBackground /><div className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white/85 px-5 py-4 dark:border-white/[0.08] dark:bg-[#111827]/90"><RefreshCw size={18} className="animate-spin text-indigo-500 dark:text-cyan-400" /><span className="text-sm">Cargando bóveda segura…</span></div></div>;

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#f5f7fc] px-4 py-5 text-slate-900 dark:bg-[#080d18] dark:text-slate-100 sm:px-6 lg:px-8">
      <AuraPageBackground />
      <div className="relative mx-auto max-w-[1800px]">
        <header className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.07] pb-5 xl:flex-row xl:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.09] text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.08)]"><ShieldCheck size={25} /></div>
            <div><div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"><span>IT SUPPORT PLATFORM</span><ChevronRight size={11} /><span className="text-cyan-400">SECURE VAULT</span></div><h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[28px]">Bóveda de credenciales</h1><p className="mt-1 text-sm text-slate-400">Accesos, cuentas y secretos técnicos en un solo lugar.</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 flex items-center gap-2 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-2"><KeyRound size={15} className="text-cyan-300" /><span className="text-lg font-semibold tabular-nums text-slate-900 dark:text-white">{stats?.total ?? credentials.length}</span><span className="text-xs text-slate-400">credenciales</span></div>
            <div className="flex rounded-lg border border-slate-200 dark:border-white/10 bg-white/[0.03] p-1"><button aria-label="Vista de cuadrícula" onClick={() => setViewMode('grid')} className={`rounded-md p-2 transition ${viewMode === 'grid' ? 'bg-cyan-400/15 text-cyan-300' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}><Grid2X2 size={16} /></button><button aria-label="Vista de tabla" onClick={() => setViewMode('table')} className={`rounded-md p-2 transition ${viewMode === 'table' ? 'bg-cyan-400/15 text-cyan-300' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}><List size={16} /></button></div>
            <button onClick={() => setShowPasswordGenerator(true)} className={smallButton}><KeyRound size={14} className="text-indigo-500 dark:text-cyan-300" />Generador</button>
            <button onClick={runSecurityAudit} className={smallButton} disabled={auditLoading}><ShieldAlert size={14} className="text-amber-600 dark:text-amber-300" />{auditLoading ? 'Auditando…' : 'Auditoría'}</button>
            <button onClick={() => setShowFavoritesOnly(value => !value)} className={`${smallButton} ${showFavoritesOnly ? 'border-amber-400/30 bg-amber-400/10 text-amber-300' : ''}`}><Star size={14} fill={showFavoritesOnly ? 'currentColor' : 'none'} />Favoritos</button>
            <button onClick={exportExcel} className={smallButton}><FileSpreadsheet size={14} className="text-emerald-400" />Excel</button>
            <button onClick={() => exportPDF()} className={smallButton}><FileText size={14} className="text-rose-400" />PDF</button>
            <button onClick={() => { loadData(); loadFavorites(); loadMostUsed(); }} className={smallButton} title="Actualizar datos"><RefreshCw size={14} /></button>
            <button onClick={() => openCategoryForm()} className={smallButton}><Folder size={14} className="text-cyan-300" />Categoría</button>
            <button onClick={openNewCredential} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-[#07131B] shadow-[0_5px_18px_rgba(6,182,212,0.15)] transition hover:bg-cyan-400"><Plus size={15} />Nueva credencial</button>
          </div>
        </header>

        {loadError && <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-300"><span className="flex items-center gap-2"><AlertCircle size={16} />{loadError}</span><button onClick={() => loadData()} className="underline underline-offset-2">Reintentar</button></div>}

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <Surface className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300"><KeyRound size={19} /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Registradas</p><p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">{stats?.total ?? credentials.length}</p></div></Surface>
          <Surface className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"><CheckCircle2 size={19} /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Activas</p><p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">{stats?.active ?? credentials.filter(c => c.status !== 'inactive').length}</p></div></Surface>
          <Surface className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300"><Star size={19} /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Favoritas</p><p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">{favorites.length || credentials.filter(c => c.favorite).length}</p></div></Surface>
          <Surface className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-300"><Folder size={19} /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Categorías</p><p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">{Object.keys(allCategories).length}</p></div></Surface> 
          <Surface className="flex items-center gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10 text-amber-700 dark:text-amber-300"><Clock size={19} /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Vencidas / próximas</p><p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">{expirationSummary.expired.length + expirationSummary.expiring.length}</p></div></Surface>
        </div>

        {securityAudit && (
          <section className="mb-5 rounded-xl border border-slate-200 bg-white/85 p-4 dark:border-white/[0.08] dark:bg-[#111827]/90">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"><ShieldCheck size={16} className="text-indigo-500 dark:text-emerald-300" />Resultado de auditoría</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Revisadas: {securityAudit.audited} · Sin observaciones: {securityAudit.secure} · Débiles: {securityAudit.weakCredentials} · Reutilizadas: {securityAudit.duplicateCredentials}</p>
              </div>
              <button type="button" onClick={() => setSecurityAudit(null)} className={smallButton}>Cerrar informe</button>
            </div>
            {securityAudit.findings?.length ? (
              <div className="mt-3 max-h-64 divide-y divide-slate-200/70 overflow-y-auto dark:divide-white/[0.06]">
                {securityAudit.findings.map((finding) => (
                  <div key={finding.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{finding.service_name}</p>
                      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">ID #{finding.id} · Puntuación estimada {finding.score}/100</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {finding.issues.map((issue) => (
                        <span key={issue} className="rounded-full border border-amber-500/20 bg-amber-500/[0.07] px-2 py-1 text-[10px] text-amber-800 dark:text-amber-200">{({
                          short: 'Menos de 12 caracteres',
                          no_lowercase: 'Sin minúsculas',
                          no_uppercase: 'Sin mayúsculas',
                          no_number: 'Sin números',
                          no_symbol: 'Sin símbolos',
                          repeated_characters: 'Caracteres repetidos',
                          duplicate: 'Contraseña reutilizada',
                        })[issue] || issue}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-lg bg-emerald-500/[0.06] p-3 text-xs text-emerald-700 dark:text-emerald-300">No se detectaron contraseñas débiles ni reutilizadas.</p>
            )}
            <p className="mt-3 text-[10px] text-slate-400">Auditoría ejecutada: {securityAudit.audited_at ? new Date(securityAudit.audited_at).toLocaleString() : '—'}. El informe no contiene contraseñas.</p>
          </section>
        )}

        {(expirationSummary.expired.length > 0 || expirationSummary.expiring.length > 0) && (
          <div role="status" className="mb-5 grid grid-cols-1 gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.055] px-4 py-3 text-xs text-amber-800 dark:text-amber-200 sm:grid-cols-2">
            <span><strong>{expirationSummary.expired.length}</strong> credenciales vencidas</span>
            <span><strong>{expirationSummary.expiring.length}</strong> vencen en los próximos 30 días</span>
          </div>
        )}

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" /><input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Buscar por servicio, usuario, URL o notas…" className="w-full rounded-xl border border-white/[0.09] bg-white dark:bg-[#111827]/80 py-3 pl-10 pr-10 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10" />{searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:text-white" aria-label="Limpiar búsqueda"><X size={16} /></button>}</div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500"><SlidersHorizontal size={14} /><span>Mostrando</span><span className="font-semibold text-slate-600 dark:text-slate-300">{filtered.length}</span><span>de {credentials.length}</span>{(selectedCategory || showFavoritesOnly || searchTerm) && <button onClick={() => { setSelectedCategory(null); setShowFavoritesOnly(false); setSearchTerm(''); }} className="ml-1 text-cyan-300 hover:text-cyan-200">Limpiar filtros</button>}</div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <Surface className="overflow-hidden">
              <div className="border-b border-slate-200/80 dark:border-white/[0.07] px-4 py-3.5"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-900 dark:text-white">Categorías</h2><span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] text-slate-400">{Object.keys(allCategories).length}</span></div><p className="mt-1 text-xs text-slate-500">Organiza los accesos por tipo.</p></div>
              <div className="space-y-1 p-2">
                <button onClick={() => setSelectedCategory(null)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${!selectedCategory ? 'border border-cyan-400/15 bg-cyan-400/[0.09] text-cyan-200' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-800 dark:text-slate-100'}`}><Folder size={16} /><span className="flex-1 text-sm font-medium">Todas</span><span className="text-xs tabular-nums text-slate-500">{credentials.length}</span></button>
                {Object.entries(allCategories).map(([key, category]) => { const Icon = getCategoryIcon(key); const selected = selectedCategory === key; return <div key={key} className={`group flex items-center gap-1 rounded-lg transition ${selected ? 'border border-cyan-400/15 bg-cyan-400/[0.08]' : 'hover:bg-white/[0.035]'}`}><button onClick={() => setSelectedCategory(key)} className={`flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left ${selected ? 'text-cyan-200' : 'text-slate-400 hover:text-slate-800 dark:text-slate-100'}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${category.bgColor || 'bg-white/[0.04]'}`}><Icon size={15} /></span><span className="min-w-0 flex-1 truncate text-xs font-medium">{category.name}</span><span className="text-[11px] tabular-nums text-slate-500">{getItemCountByCategory(key)}</span></button><div className="mr-1 hidden items-center gap-0.5 group-hover:flex"><button title="Editar categoría" onClick={() => openCategoryForm(key, category)} className="rounded p-1.5 text-slate-500 hover:bg-white/[0.07] hover:text-cyan-300"><Edit3 size={13} /></button><button title="Eliminar categoría" onClick={() => deleteCategory(key, category)} className="rounded p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300"><Trash2 size={13} /></button></div></div>; })}
              </div>
            </Surface>
            {!selectedCategory && mostUsed.length > 0 && <Surface className="p-3.5"><h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400"><TrendingUp size={14} className="text-cyan-300" />Más utilizadas</h3><div className="space-y-1">{mostUsed.map(cred => <button key={cred.id} onClick={() => openMostUsed(cred)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-900 dark:text-white"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] text-slate-500"><KeyRound size={13} /></span><span className="min-w-0 flex-1 truncate">{cred.service_name}</span><ChevronRight size={13} className="text-slate-600" /></button>)}</div></Surface>}
            <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.045] p-3.5"><div className="mb-2 flex items-center gap-2 text-cyan-300"><Lock size={15} /><span className="text-xs font-semibold">Bóveda protegida</span></div><p className="text-[11px] leading-relaxed text-slate-500">Los datos sensibles solo se muestran después de verificar la Master Password. Evita exportar secretos a dispositivos compartidos.</p></div>
          </aside>

          <main className="min-w-0">
            {selectedCategory && allCategories[selectedCategory] && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.045] p-4"><div className="flex items-center gap-3">{(() => { const Icon = getCategoryIcon(selectedCategory); return <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/[0.08] text-cyan-300"><Icon size={20} /></div>; })()}<div><h2 className="font-semibold text-slate-900 dark:text-white">{allCategories[selectedCategory].name}</h2><p className="mt-0.5 text-xs text-slate-500">{allCategories[selectedCategory].description}</p></div></div><button onClick={() => exportPDF(filtered, 'Exportar categoría a PDF')} className={smallButton}><Download size={14} />Exportar categoría</button></div>}

            {filtered.length === 0 ? <Surface className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-300"><ShieldCheck size={26} /></div><h3 className="text-base font-semibold text-slate-900 dark:text-white">{searchTerm || selectedCategory || showFavoritesOnly ? 'No encontramos coincidencias' : 'Tu bóveda está lista'}</h3><p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{searchTerm || selectedCategory || showFavoritesOnly ? 'Prueba con otros términos o limpia los filtros para ver más credenciales.' : 'Registra tu primera credencial para mantener los accesos técnicos organizados.'}</p><button onClick={searchTerm || selectedCategory || showFavoritesOnly ? () => { setSearchTerm(''); setSelectedCategory(null); setShowFavoritesOnly(false); } : openNewCredential} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-[#07131B] transition hover:bg-cyan-400">{searchTerm || selectedCategory || showFavoritesOnly ? 'Limpiar filtros' : <><Plus size={16} />Nueva credencial</>}</button></Surface> : viewMode === 'grid' ? <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">{filtered.map(cred => { const Icon = getCategoryIcon(cred.category); const category = allCategories[cred.category]; const favorite = favoriteIds.has(cred.id) || Boolean(cred.favorite); return <Surface key={cred.id} className="group relative overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:shadow-[0_12px_35px_rgba(6,182,212,0.055)]"><div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${category?.color || 'from-cyan-500 to-blue-500'} opacity-70`} /><div className="p-4"><div className="flex items-start gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.05] ${category?.bgColor || 'bg-cyan-500/10'} text-cyan-200`}><Icon size={19} /></div><div className="min-w-0 flex-1 pt-0.5"><h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={cred.service_name}>{cred.service_name}</h3><p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">{category?.name || cred.category || 'Sin categoría'}</p>{cred.expires_at && <p className={`mt-1 text-[10px] font-medium ${new Date(`${cred.expires_at}T23:59:59`).getTime() < Date.now() ? 'text-rose-600 dark:text-rose-300' : 'text-amber-700 dark:text-amber-300'}`}>Vence: {new Date(`${cred.expires_at}T00:00:00`).toLocaleDateString('es-CO')}</p>}</div><button onClick={event => toggleFavorite(cred.id, event)} className={`rounded-md p-1.5 transition ${favorite ? 'text-amber-300' : 'text-slate-600 hover:text-amber-300'}`} title={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}><Star size={16} fill={favorite ? 'currentColor' : 'none'} /></button></div><div className="my-4 space-y-2.5 border-y border-white/[0.06] py-3"><div className="flex items-center justify-between gap-3"><span className="text-xs text-slate-500">Usuario</span><span className="max-w-[65%] truncate font-mono text-xs text-slate-400">••••••••••••</span></div><div className="flex items-center justify-between gap-3"><span className="text-xs text-slate-500">Contraseña</span><span className="font-mono text-xs tracking-[0.2em] text-slate-500">••••••••••</span></div>{cred.url && <div className="flex items-center justify-between gap-3"><span className="text-xs text-slate-500">URL / IP</span><span className="max-w-[68%] truncate text-xs text-cyan-300/80" title={cred.url}>{cred.url}</span></div>}</div><div className="flex items-center justify-between gap-2"><StatusBadge status={cred.status} /><span className="flex items-center gap-1 text-[10px] text-slate-600"><Clock size={11} />{cred.last_updated && !Number.isNaN(new Date(cred.last_updated).getTime()) ? new Date(cred.last_updated).toLocaleDateString() : 'Sin fecha'}</span></div><div className="mt-3 flex items-center gap-1.5 border-t border-white/[0.06] pt-3"><button onClick={() => revealCredential(cred)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.07] px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-400/[0.13]"><Eye size={14} />Desbloquear</button><button onClick={() => openCredentialHistory(cred)} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 dark:border-white/[0.08] dark:hover:bg-white/[0.05] dark:hover:text-cyan-300" title="Historial de cambios"><History size={14} /></button><button onClick={event => { event.stopPropagation(); handleCopy(cred.username, 'Usuario'); }} className="rounded-lg border border-slate-200/80 dark:border-white/[0.08] p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-900 dark:text-white" title="Copiar usuario"><Copy size={14} /></button><button onClick={() => openEditCredential(cred)} className="rounded-lg border border-slate-200/80 dark:border-white/[0.08] p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-cyan-300" title="Editar"><Edit3 size={14} /></button><button onClick={() => handleDelete(cred.id)} className="rounded-lg border border-slate-200/80 dark:border-white/[0.08] p-2 text-slate-500 transition hover:border-rose-500/20 hover:bg-rose-500/[0.06] hover:text-rose-300" title="Eliminar"><Trash2 size={14} /></button></div></div></Surface>; })}</div> : <Surface className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left"><thead className="border-b border-slate-200/80 dark:border-white/[0.07] bg-white/[0.025]"><tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"><th className="px-4 py-3">Favorito</th><th className="px-4 py-3">Servicio</th><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">URL / IP</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th></tr></thead><tbody className="divide-y divide-white/[0.055]">{filtered.map(cred => { const Icon = getCategoryIcon(cred.category); const favorite = favoriteIds.has(cred.id) || Boolean(cred.favorite); return <tr key={cred.id} className="transition hover:bg-white/[0.025]"><td className="px-4 py-3"><button onClick={event => toggleFavorite(cred.id, event)} className={favorite ? 'text-amber-300' : 'text-slate-600 hover:text-amber-300'}><Star size={15} fill={favorite ? 'currentColor' : 'none'} /></button></td><td className="px-4 py-3"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300"><Icon size={15} /></span><span className="text-xs font-medium text-slate-200">{cred.service_name}</span></div></td><td className="px-4 py-3 font-mono text-xs text-slate-500">••••••••</td><td className="max-w-[220px] truncate px-4 py-3 text-xs text-cyan-300/80">{cred.url || '—'}</td><td className="px-4 py-3 text-xs text-slate-400">{allCategories[cred.category]?.name || cred.category || '—'}</td><td className="px-4 py-3"><StatusBadge status={cred.status} /></td><td className="px-4 py-3"><div className="flex items-center gap-1"><button onClick={() => revealCredential(cred)} title="Desbloquear" className="rounded-md p-2 text-slate-500 hover:bg-cyan-400/10 hover:text-cyan-300"><Eye size={14} /></button><button onClick={() => openEditCredential(cred)} title="Editar" className="rounded-md p-2 text-slate-500 hover:bg-white/[0.06] hover:text-slate-900 dark:text-white"><Edit3 size={14} /></button><button onClick={() => handleDelete(cred.id)} title="Eliminar" className="rounded-md p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300"><Trash2 size={14} /></button></div></td></tr>; })}</tbody></table></div></Surface>}
          </main>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4 text-[10px] text-slate-600"><span className="flex items-center gap-1.5"><Lock size={12} className="text-cyan-500/70" />CENTRO DE MANDO IT · BÓVEDA DE ACCESOS</span><span>Evita compartir credenciales y exportaciones sin protección.</span></footer>
      </div>

      {showCategoryForm && <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-[#02050B]/80 p-4 backdrop-blur-sm"><div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] shadow-2xl"><div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.07] px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400">Configuración</p><h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{editingCategory ? 'Editar categoría' : 'Nueva categoría'}</h2></div><button onClick={closeCategoryForm} className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-slate-900 dark:text-white"><X size={18} /></button></div><div className="space-y-5 p-5"><div><FieldLabel>Nombre de categoría</FieldLabel><input value={categoryForm.name} onChange={event => setCategoryForm({ ...categoryForm, name: event.target.value })} placeholder="Ej. Aplicaciones internas" className={inputClass} autoFocus /></div><div><FieldLabel>Icono</FieldLabel><div className="grid max-h-44 grid-cols-6 gap-2 overflow-y-auto rounded-lg border border-slate-200/80 dark:border-white/[0.07] bg-slate-50 dark:bg-[#0A0E17] p-3">{AVAILABLE_ICONS.map(({ name, icon: Icon }) => <button key={name} title={name} onClick={() => setCategoryForm({ ...categoryForm, icon: name })} className={`flex h-9 items-center justify-center rounded-md border transition ${categoryForm.icon === name ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300' : 'border-transparent text-slate-500 hover:bg-white/[0.05] hover:text-slate-900 dark:text-white'}`}><Icon size={17} /></button>)}</div></div><div><FieldLabel>Color de identificación</FieldLabel><div className="grid grid-cols-4 gap-2">{COLOR_OPTIONS.map(color => <button key={color} title={color} onClick={() => setCategoryForm({ ...categoryForm, color })} className={`h-8 rounded-md bg-gradient-to-r ${color} transition ${categoryForm.color === color ? 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-[#111827]' : 'opacity-75 hover:opacity-100'}`} />)}</div></div><div className="flex gap-2 border-t border-slate-200/80 dark:border-white/[0.07] pt-4"><button onClick={closeCategoryForm} className={`${smallButton} flex-1`}>Cancelar</button><button onClick={saveCategory} className="flex-1 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-[#07131B] transition hover:bg-cyan-400">{editingCategory ? 'Guardar cambios' : 'Crear categoría'}</button></div></div></div></div>}

      {showForm && <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-[#02050B]/80 p-4 backdrop-blur-sm"><div className="my-auto max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#111827]/95 px-5 py-4 backdrop-blur"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400">Acceso protegido</p><h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{editingItem ? 'Editar credencial' : 'Nueva credencial'}</h2><p className="mt-1 text-xs text-slate-500">Los datos se gestionan mediante el servicio seguro de la bóveda.</p></div><button onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }} className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-slate-900 dark:text-white"><X size={18} /></button></div><form onSubmit={handleSubmit} className="space-y-4 p-5"><div><FieldLabel>Nombre del servicio *</FieldLabel><input value={formData.service_name} onChange={event => setFormData({ ...formData, service_name: event.target.value })} placeholder="Ej. Router principal, correo corporativo" className={inputClass} required /></div><div><FieldLabel>URL o dirección IP</FieldLabel><input value={formData.url || ''} onChange={event => setFormData({ ...formData, url: event.target.value })} placeholder="https://… o 192.168.1.1" className={inputClass} /></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><FieldLabel>Usuario *</FieldLabel><input value={formData.username} onChange={event => setFormData({ ...formData, username: event.target.value })} placeholder="Nombre de usuario" className={inputClass} required autoComplete="off" /></div><div><FieldLabel>{editingItem ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</FieldLabel><input type="password" value={formData.password} onChange={event => setFormData({ ...formData, password: event.target.value })} placeholder={editingItem ? 'Dejar vacío si no cambia' : 'Contraseña' } className={inputClass} required={!editingItem} autoComplete="new-password" /></div></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><FieldLabel>Categoría</FieldLabel><select value={formData.category || ''} onChange={event => setFormData({ ...formData, category: event.target.value })} className={inputClass}><option value="">Sin categoría</option>{Object.entries(allCategories).map(([key, category]) => <option key={key} value={key}>{category.name}</option>)}</select></div><div><FieldLabel>Estado</FieldLabel><select value={formData.status || 'active'} onChange={event => setFormData({ ...formData, status: event.target.value })} className={inputClass}><option value="active">Activa</option><option value="inactive">Inactiva</option></select></div></div><div><FieldLabel>Vencimiento de la credencial</FieldLabel><input type="date" value={formData.expires_at || ''} onChange={event => setFormData({ ...formData, expires_at: event.target.value })} className={inputClass} /><p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">Opcional. La bóveda mostrará avisos al vencer o cuando falten 30 días.</p></div><div><FieldLabel>Notas adicionales</FieldLabel><textarea value={formData.notes || ''} onChange={event => setFormData({ ...formData, notes: event.target.value })} placeholder="Información útil para el equipo técnico…" rows={3} className={`${inputClass} resize-y`} /></div><div className="flex items-start gap-3 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.045] p-3"><Lock size={16} className="mt-0.5 shrink-0 text-cyan-300" /><div><p className="text-xs font-medium text-cyan-200">Verificación con Master Password</p><p className="mt-1 text-[11px] leading-relaxed text-slate-500">Se solicitará autorización antes de guardar o actualizar esta credencial.</p></div></div><div className="flex gap-2 border-t border-slate-200/80 dark:border-white/[0.07] pt-4"><button type="button" onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }} className={`${smallButton} flex-1`}>Cancelar</button><button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-[#07131B] transition hover:bg-cyan-400"><Lock size={14} />{editingItem ? 'Actualizar credencial' : 'Guardar credencial'}</button></div></form></div></div>}

      {revealedData && <div className="fixed inset-0 z-[95] flex items-center justify-center overflow-y-auto bg-[#02050B]/85 p-4 backdrop-blur-sm"><div className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-cyan-400/15 bg-white dark:bg-[#111827] shadow-[0_20px_80px_rgba(0,0,0,0.5)]"><div className="border-b border-slate-200/80 dark:border-white/[0.07] p-5"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-300"><ShieldCheck size={20} /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-400">Credencial desbloqueada</p><h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{revealedData.service_name}</h2><p className="mt-1 text-xs text-slate-500">Contenido sensible · mantener privado</p></div></div><button onClick={() => setRevealedData(null)} className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-slate-900 dark:text-white"><X size={18} /></button></div></div><div className="space-y-3 p-5"><div className="rounded-lg border border-slate-200/80 dark:border-white/[0.07] bg-slate-50 dark:bg-[#0A0E17] p-3.5"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">Usuario</span><button onClick={() => handleCopy(revealedData.username, 'Usuario')} className="flex items-center gap-1.5 text-[11px] text-cyan-300 hover:text-cyan-200"><Copy size={13} />Copiar</button></div><code className="block break-all text-sm text-slate-800 dark:text-slate-100">{revealedData.username || '—'}</code></div><div className="rounded-lg border border-slate-200/80 dark:border-white/[0.07] bg-slate-50 dark:bg-[#0A0E17] p-3.5"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">Contraseña</span><button onClick={() => handleCopy(revealedData.password, 'Contraseña')} className="flex items-center gap-1.5 text-[11px] text-cyan-300 hover:text-cyan-200"><Copy size={13} />Copiar</button></div><code className="block break-all text-sm text-slate-800 dark:text-slate-100">{revealedData.password || '—'}</code><PasswordStrength length={revealedData.password?.length || 0} /></div>{revealedData.url && <div className="rounded-lg border border-slate-200/80 dark:border-white/[0.07] bg-slate-50 dark:bg-[#0A0E17] p-3.5"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">URL / IP</span><a href={/^(https?:\/\/)/i.test(revealedData.url) ? revealedData.url : undefined} target="_blank" rel="noreferrer" className="flex items-center gap-2 break-all text-sm text-cyan-300 hover:text-cyan-200">{revealedData.url}{/^https?:\/\//i.test(revealedData.url) && <ExternalLink size={13} className="shrink-0" />}</a></div>}{revealedData.notes && <div className="rounded-lg border border-slate-200/80 dark:border-white/[0.07] bg-slate-50 dark:bg-[#0A0E17] p-3.5"><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">Notas</span><p className="whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300">{revealedData.notes}</p></div>}<div className="flex gap-2 pt-1"><button onClick={() => { openEditCredential(revealedData); setRevealedData(null); }} className={`${smallButton} flex-1`}><Edit3 size={14} />Editar</button><button onClick={() => { const id = revealedData.id; setRevealedData(null); handleDelete(id); }} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/[0.07] px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/[0.12]"><Trash2 size={14} />Eliminar</button><button onClick={() => setRevealedData(null)} className={`${smallButton} flex-1`}>Cerrar</button></div><p className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-slate-600"><Lock size={11} />No dejes esta ventana abierta en un equipo compartido.</p></div></div></div>}

      {showPasswordGenerator && (
        <Suspense fallback={null}>
          <PasswordGeneratorPanel
            onClose={() => setShowPasswordGenerator(false)}
            onUse={(password) => {
              setFormData((current) => ({ ...current, password }));
              setEditingItem(null);
              setShowPasswordGenerator(false);
              setShowForm(true);
            }}
          />
        </Suspense>
      )}

      {historyModal && (
        <div className="fixed inset-0 z-[125] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="vault-history-title" className="aura-panel max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-[#111827]">
            <header className="flex items-center justify-between border-b border-slate-200/70 p-5 dark:border-white/[0.07]">
              <div>
                <h2 id="vault-history-title" className="text-sm font-semibold text-slate-900 dark:text-white">Historial de {historyModal.credential.service_name}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Solo se muestra el historial de cambios; no se exponen contraseñas ni valores cifrados.</p>
              </div>
              <button type="button" onClick={() => setHistoryModal(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06]" aria-label="Cerrar historial"><X size={17} /></button>
            </header>
            <div className="max-h-[60vh] overflow-y-auto p-5">
              {historyLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-500"><RefreshCw size={14} className="animate-spin" />Cargando historial...</div>
              ) : historyModal.entries.length ? (
                <div className="space-y-3">
                  {historyModal.entries.map((entry) => (
                    <article key={entry.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/[0.08]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Versión anterior #{entry.id}</p>
                        <time className="text-[10px] text-slate-500 dark:text-slate-400">{entry.changed_at ? new Date(String(entry.changed_at).replace(' ', 'T')).toLocaleString() : '—'}</time>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{entry.service_name} · {entry.username}</p>
                      {entry.change_reason && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{entry.change_reason}</p>}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-xs text-slate-500">Todavía no hay versiones anteriores registradas.</p>
              )}
            </div>
          </section>
        </div>
      )}

      <PasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} onConfirm={passwordModalConfig.onConfirm} title={passwordModalConfig.title} message={passwordModalConfig.message} />
      <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={async () => { await confirmModalConfig.onConfirm?.(); setShowConfirmModal(false); }} title={confirmModalConfig.title} message={confirmModalConfig.message} confirmText={confirmModalConfig.confirmText} type={confirmModalConfig.type} />
      <AlertModal isOpen={showAlertModal} onClose={() => setShowAlertModal(false)} title={alertModalConfig.title} message={alertModalConfig.message} type={alertModalConfig.type} />
    </div>
  );
}
