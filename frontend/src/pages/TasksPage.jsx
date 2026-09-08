import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  CheckCircle, Circle, Clock, Calendar, Edit, Trash2, 
  Eye, X, Save, AlertCircle, Check, Server, Mail, DollarSign, 
  Camera, Monitor, Wifi, HardDrive, User, Phone, MapPin, Flag, 
  Star, Target, Zap, Repeat, Filter, Search, Settings, 
  Play, Pause, Send, MessageSquare, TrendingUp, Award, BarChart3, 
  PieChart, Download, Upload, Image, Paperclip, Link, Bell, 
  Trophy, Medal, Gem, Sparkles, Layers, History, Trash, Folder, 
  Archive, RefreshCw, Sliders, Tag, Tags, Wrench, ArrowUpDown, 
  LogIn, Code, Menu, Rocket, Activity, Shield, Users, Gift, 
  Coffee, Heart, Flame, Plus, Info, AlertTriangle, 
  Calendar as CalendarIcon, Flame as FireIcon, TrendingDown, 
  ThumbsUp, Crown, Target as TargetIcon, Filter as FilterIcon
} from 'lucide-react';
import AlertModal from '../components/common/AlertModal';
import ConfirmModal from '../components/common/ConfirmModal';

// Configuración
const PRIORITIES = {
  mandatory: { label: 'Obligatoria', color: '#dc2626', bg: '#fef2f2', text: '#dc2626', points: 10, icon: Flame },
  standard: { label: 'Estándar', color: '#f59e0b', bg: '#fffbeb', text: '#d97706', points: 5, icon: Flag },
  not_urgent: { label: 'No urgente', color: '#10b981', bg: '#ecfdf5', text: '#059669', points: 2, icon: Coffee }
};

const CATEGORIES = {
  server: { label: 'Servidor', icon: Server, color: '#3b82f6', bg: '#eff6ff' },
  cameras: { label: 'Cámaras', icon: Camera, color: '#ec4899', bg: '#fce7f3' },
  pos: { label: 'Punto de Venta', icon: Monitor, color: '#f97316', bg: '#fff7ed' },
  network: { label: 'Redes', icon: Wifi, color: '#06b6d4', bg: '#cffafe' },
  other: { label: 'Otros', icon: Folder, color: '#6b7280', bg: '#f3f4f6' }
};

// Datos de ejemplo
const INITIAL_TASKS = [
  { id: 1, title: 'Verificar servidor principal', description: 'Revisar logs, temperatura y rendimiento', priority: 'mandatory', hour: '08:00', completed: false },
  { id: 2, title: 'Enviar anulaciones de cashea', description: 'Procesar anulaciones del día', priority: 'mandatory', hour: '18:00', completed: false },
  { id: 3, title: 'Revisar cámaras de seguridad', description: 'Verificar estado de todas las cámaras', priority: 'standard', hour: '12:00', completed: true }
];

const INITIAL_TICKETS = [
  { id: 101, title: 'Cámara pasillo 3 - Imagen borrosa', description: 'La cámara muestra imagen borrosa', category: 'cameras', requestedBy: 'Carlos Pérez', status: 'pending', priority: 'high', date: new Date().toISOString() },
  { id: 102, title: 'Caja 5 - Lentitud extrema', description: 'El sistema tarda en responder', category: 'pos', requestedBy: 'María López', status: 'in_progress', priority: 'critical', date: new Date().toISOString() }
];

const WEEKLY_TICKETS = [12, 8, 15, 10, 18, 14, 9];
const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function TasksPage() {
  const { darkMode } = useTheme(); // Usar el tema global del Navbar
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [deletedTickets, setDeletedTickets] = useState([]);
  const [userPoints, setUserPoints] = useState(255);
  const [streak, setStreak] = useState(3);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAlert, setShowAlert] = useState({ show: false, title: '', message: '', type: 'success' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState({ priority: 'all', status: 'all' });
  const [ticketFilter, setTicketFilter] = useState({ status: 'all' });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'mandatory', hour: '12:00' });
  const [newTicket, setNewTicket] = useState({ title: '', description: '', requestedBy: '', category: 'other', priority: 'standard' });
  const [deletingId, setDeletingId] = useState(null);
  const [deletingType, setDeletingType] = useState(null);

  const completedToday = tasks.filter(t => t.completed).length;
  const todayTasks = tasks.length;
  const slaAdherence = todayTasks ? Math.round((completedToday / todayTasks) * 100) : 100;
  const pendingTickets = tickets.filter(t => t.status !== 'completed').length;
  const urgentTickets = tickets.filter(t => t.priority === 'critical' && t.status !== 'completed').length;

  const handleCompleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
      setUserPoints(prev => prev + (PRIORITIES[task.priority]?.points || 5));
      setShowAlert({ show: true, title: '🎉 Completada!', message: `+${PRIORITIES[task.priority]?.points || 5} puntos`, type: 'success' });
    }
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    setTasks(prev => [{ id: Date.now(), ...newTask, completed: false }, ...prev]);
    setNewTask({ title: '', description: '', priority: 'mandatory', hour: '12:00' });
    setShowTaskModal(false);
    setShowAlert({ show: true, title: '✅ Tarea creada', message: 'Nueva tarea agregada', type: 'success' });
  };

  const handleUpdateTask = () => {
    if (!editingTask.title.trim()) return;
    setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...editingTask } : t));
    setEditingTask(null);
    setShowTaskDetail(false);
    setShowAlert({ show: true, title: '✅ Actualizada', message: 'Tarea actualizada', type: 'success' });
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setShowAlert({ show: true, title: '🗑️ Eliminada', message: 'Tarea eliminada', type: 'info' });
  };

  const handleCompleteTicket = (ticketId) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'completed' } : t));
    setUserPoints(prev => prev + 5);
    setShowAlert({ show: true, title: '✅ Completado', message: '+5 puntos', type: 'success' });
  };

  const handleAddTicket = () => {
    if (!newTicket.title.trim() || !newTicket.requestedBy.trim()) return;
    setTickets(prev => [{ id: Date.now(), ...newTicket, status: 'pending', date: new Date().toISOString() }, ...prev]);
    setNewTicket({ title: '', description: '', requestedBy: '', category: 'other', priority: 'standard' });
    setShowTicketModal(false);
    setShowAlert({ show: true, title: '🎫 Ticket creado', message: 'Nuevo ticket agregado', type: 'success' });
  };

  const handleUpdateTicket = () => {
    if (!editingTicket.title.trim()) return;
    setTickets(prev => prev.map(t => t.id === editingTicket.id ? { ...t, ...editingTicket } : t));
    setEditingTicket(null);
    setShowTicketDetail(false);
    setShowAlert({ show: true, title: '✅ Actualizado', message: 'Ticket actualizado', type: 'success' });
  };

  const handleDeleteTicket = (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      setDeletedTickets(prev => [...prev, { ...ticket, deletedAt: new Date().toISOString() }]);
      setShowAlert({ show: true, title: '🗑️ Movido a papelera', message: 'Ticket eliminado', type: 'info' });
    }
  };

  const handleRestoreTicket = (ticket) => {
    setDeletedTickets(prev => prev.filter(t => t.id !== ticket.id));
    setTickets(prev => [...prev, { ...ticket, status: 'pending', deletedAt: null }]);
    setShowAlert({ show: true, title: '🔄 Restaurado', message: 'Ticket restaurado', type: 'success' });
  };

  const confirmDelete = (id, type) => {
    setDeletingId(id);
    setDeletingType(type);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deletingType === 'task') handleDeleteTask(deletingId);
    else if (deletingType === 'ticket') handleDeleteTicket(deletingId);
    else if (deletingType === 'permanent') setDeletedTickets(prev => prev.filter(t => t.id !== deletingId));
    setShowConfirm(false);
    setDeletingId(null);
    setDeletingType(null);
  };

  const filteredTasks = tasks.filter(task => {
    if (taskFilter.priority !== 'all' && task.priority !== taskFilter.priority) return false;
    if (taskFilter.status === 'completed' && !task.completed) return false;
    if (taskFilter.status === 'pending' && task.completed) return false;
    return true;
  });

  const filteredTickets = tickets.filter(ticket => {
    if (ticketFilter.status !== 'all' && ticket.status !== ticketFilter.status) return false;
    if (searchTerm && !ticket.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tasks', label: 'Tareas', icon: CheckCircle },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare },
    { id: 'trash', label: 'Papelera', icon: Trash }
  ];

  const dailyGoal = 5;
  const dailyProgress = Math.min(100, (completedToday / dailyGoal) * 100);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header - SIN botón de tema (solo puntos) */}
      <div className={`sticky top-0 z-20 shadow-lg transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border-b`}>
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Centro de Mando IT</h1>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gestión de tareas y tickets</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
                <Sparkles size={16} className="text-yellow-500" />
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{userPoints}</span>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>pts</span>
              </div>
              {/* NO hay botón de tema aquí - se usa el del Navbar */}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-6">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
                <CheckCircle size={28} className="mb-2 opacity-80" />
                <p className="text-white/80 text-sm">Completadas Hoy</p>
                <p className="text-3xl font-bold mt-1">{completedToday}</p>
                <p className="text-white/60 text-xs">de {todayTasks} tareas</p>
                <div className="mt-2 h-1.5 bg-white/20 rounded-full"><div className="h-full bg-white rounded-full" style={{ width: todayTasks ? `${(completedToday / todayTasks) * 100}%` : '0%' }}></div></div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
                <Shield size={28} className="mb-2 opacity-80" />
                <p className="text-white/80 text-sm">SLA Adherencia</p>
                <p className="text-3xl font-bold mt-1">{slaAdherence}%</p>
                <p className="text-white/60 text-xs">Meta: 95%</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
                <MessageSquare size={28} className="mb-2 opacity-80" />
                <p className="text-white/80 text-sm">Tickets Pendientes</p>
                <p className="text-3xl font-bold mt-1">{pendingTickets}</p>
                <p className="text-white/60 text-xs">Críticos: {urgentTickets}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
                <Trophy size={28} className="mb-2 opacity-80" />
                <p className="text-white/80 text-sm">Puntos</p>
                <p className="text-3xl font-bold mt-1">{userPoints}</p>
                <p className="text-white/60 text-xs">Nivel {Math.floor(userPoints / 100) + 1}</p>
                <div className="mt-2 h-1.5 bg-white/20 rounded-full"><div className="h-full bg-yellow-400 rounded-full" style={{ width: `${userPoints % 100}%` }}></div></div>
              </div>
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg">
                <Flame size={28} className="mb-2 opacity-80" />
                <p className="text-white/80 text-sm">Racha Actual</p>
                <p className="text-3xl font-bold mt-1">{streak} días</p>
                <p className="text-white/60 text-xs">¡Sigue así! 🔥</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`rounded-2xl p-5 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`font-semibold flex items-center gap-2 mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}><TrendingUp size={18} className="text-indigo-500" />Tendencia de Tickets</h3>
                <div className="flex items-end gap-2 h-40">
                  {WEEKLY_TICKETS.map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-t-lg overflow-hidden relative" style={{ height: `${Math.min(120, (value / 20) * 120)}px` }}>
                        <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg" style={{ height: `${(value / 20) * 100}%` }}></div>
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{WEEK_DAYS[i]}</span>
                      <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`rounded-2xl p-5 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`font-semibold flex items-center gap-2 mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}><TargetIcon size={18} className="text-indigo-500" />🎯 Meta del Día</h3>
                <div className="text-center"><div className="relative inline-flex"><svg className="w-24 h-24"><circle cx="48" cy="48" r="42" fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="6"/><circle cx="48" cy="48" r="42" fill="none" stroke="#6366f1" strokeWidth="6" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 * (1 - dailyProgress / 100)} transform="rotate(-90 48 48)" strokeLinecap="round"/></svg><div className="absolute inset-0 flex items-center justify-center"><span className="text-2xl font-bold">{completedToday}</span><span className="text-sm text-gray-400">/{dailyGoal}</span></div></div><p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{dailyProgress >= 100 ? '🎉 ¡Meta alcanzada!' : `Faltan ${dailyGoal - completedToday} tareas`}</p></div>
              </div>
            </div>
          </div>
        )}

        {/* TAREAS */}
        {activeTab === 'tasks' && (
          <div className={`rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>📋 Tareas</h2>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <FilterIcon size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    <select value={taskFilter.priority} onChange={(e) => setTaskFilter({...taskFilter, priority: e.target.value})} className={`bg-transparent text-sm focus:outline-none ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <option value="all">Todas</option><option value="mandatory">Obligatoria</option><option value="standard">Estándar</option><option value="not_urgent">No urgente</option>
                    </select>
                  </div>
                  <button onClick={() => setShowTaskModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700"><Plus size={16} /> Nueva Tarea</button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {filteredTasks.length === 0 ? (<div className="text-center py-12 text-gray-400">No hay tareas</div>) : (
                <div className="space-y-3">
                  {filteredTasks.map(task => {
                    const priority = PRIORITIES[task.priority];
                    return (<div key={task.id} className={`p-4 rounded-xl border flex justify-between items-center ${task.completed ? (darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200') : (darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200')}`}>
                      <div><h3 className={`font-semibold ${task.completed ? 'line-through text-gray-400' : darkMode ? 'text-white' : 'text-gray-800'}`}>{task.title}</h3>{task.description && <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{task.description}</p>}<div className="flex items-center gap-2 mt-2"><span className={`text-xs px-2 py-1 rounded-full ${priority.bg} ${priority.text}`}>{priority.label}</span><span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>⏰ {task.hour}</span></div></div>
                      <div className="flex gap-2">{!task.completed && <button onClick={() => handleCompleteTask(task.id)} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">Completar</button>}<button onClick={() => confirmDelete(task.id, 'task')} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={16} /></button></div>
                    </div>);
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TICKETS */}
        {activeTab === 'tickets' && (
          <div className={`rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>🎫 Tickets</h2>
                <div className="flex gap-3 flex-wrap">
                  <div className="relative"><Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} /><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`pl-10 pr-4 py-2 rounded-xl border w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200'}`} /></div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700"><FilterIcon size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} /><select value={ticketFilter.status} onChange={(e) => setTicketFilter({...ticketFilter, status: e.target.value})} className={`bg-transparent text-sm focus:outline-none ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}><option value="all">Todos</option><option value="pending">Pendientes</option><option value="in_progress">En Proceso</option><option value="completed">Completados</option></select></div>
                  <button onClick={() => setShowTicketModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700"><Plus size={16} /> Nuevo Ticket</button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {filteredTickets.length === 0 ? (<div className="text-center py-12 text-gray-400">No hay tickets</div>) : (
                <div className="space-y-4">
                  {filteredTickets.map(ticket => {
                    const category = CATEGORIES[ticket.category] || CATEGORIES.other;
                    const CategoryIcon = category.icon;
                    const statusColors = { pending: 'bg-yellow-100 text-yellow-700', in_progress: 'bg-blue-100 text-blue-600', completed: 'bg-green-100 text-green-700' };
                    return (<div key={ticket.id} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                      <div className="flex justify-between items-start">
                        <div><div className="flex items-center gap-3 flex-wrap"><span className={`text-sm font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>#{ticket.id}</span><div className={`p-1 rounded-lg ${category.bg}`}><CategoryIcon size={14} style={{ color: category.color }} /></div><h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{ticket.title}</h3><span className={`text-xs px-2 py-1 rounded-full ${statusColors[ticket.status]}`}>{ticket.status === 'pending' ? 'Pendiente' : ticket.status === 'in_progress' ? 'En Proceso' : 'Completado'}</span></div>
                        <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ticket.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm"><span className="flex items-center gap-1"><User size={14} className={darkMode ? 'text-gray-500' : 'text-gray-400'} /> {ticket.requestedBy}</span><span className="flex items-center gap-1"><Clock size={14} className={darkMode ? 'text-gray-500' : 'text-gray-400'} /> {new Date(ticket.date).toLocaleString()}</span></div></div>
                        <div className="flex gap-2 ml-4">{ticket.status !== 'completed' && <button onClick={() => handleCompleteTicket(ticket.id)} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm">Completar</button>}<button onClick={() => confirmDelete(ticket.id, 'ticket')} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={16} /></button></div>
                      </div>
                    </div>);
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAPELERA */}
        {activeTab === 'trash' && (
          <div className={`rounded-2xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center"><div className="flex items-center gap-3"><Trash size={24} className="text-red-500" /><h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Papelera</h2><span className={`text-sm px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{deletedTickets.length} tickets</span></div>{deletedTickets.length > 0 && <button onClick={() => { setDeletingId('all'); setDeletingType('permanent'); setShowConfirm(true); }} className="px-4 py-2 bg-red-600 text-white rounded-lg">Vaciar</button>}</div>
            </div>
            <div className="p-6">
              {deletedTickets.length === 0 ? (<div className="text-center py-12"><Trash size={48} className="mx-auto mb-3 opacity-50 text-gray-400" /><p className="text-gray-500">La papelera está vacía</p></div>) : deletedTickets.map(ticket => (<div key={ticket.id} className={`p-4 rounded-xl flex justify-between items-center mb-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}><div><p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{ticket.title}</p><p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Eliminado: {new Date(ticket.deletedAt).toLocaleDateString()}</p></div><div className="flex gap-2"><button onClick={() => handleRestoreTicket(ticket)} className="px-4 py-2 bg-indigo-500 text-white rounded-lg">Restaurar</button><button onClick={() => { setDeletingId(ticket.id); setDeletingType('permanent'); setShowConfirm(true); }} className="px-4 py-2 bg-red-500 text-white rounded-lg">Eliminar</button></div></div>))}
            </div>
          </div>
        )}
      </div>

      {/* Modales simplificados */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl max-w-md w-full p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Nueva Tarea</h2>
            <div className="space-y-4"><input type="text" placeholder="Título" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200'}`} /><textarea placeholder="Descripción" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} rows="2" className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} /><div className="flex gap-3"><select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} className={`flex-1 p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}><option value="mandatory">Obligatoria</option><option value="standard">Estándar</option><option value="not_urgent">No urgente</option></select><input type="time" value={newTask.hour} onChange={(e) => setNewTask({...newTask, hour: e.target.value})} className={`p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} /></div><button onClick={handleAddTask} className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Crear</button><button onClick={() => setShowTaskModal(false)} className="w-full py-3 border rounded-xl mt-2">Cancelar</button></div>
          </div>
        </div>
      )}

      {showTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl max-w-md w-full p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Nuevo Ticket</h2>
            <div className="space-y-4"><input type="text" placeholder="Título" value={newTicket.title} onChange={(e) => setNewTicket({...newTicket, title: e.target.value})} className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} /><textarea placeholder="Descripción" value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} rows="2" className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} /><input type="text" placeholder="Solicitado por" value={newTicket.requestedBy} onChange={(e) => setNewTicket({...newTicket, requestedBy: e.target.value})} className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} /><select value={newTicket.category} onChange={(e) => setNewTicket({...newTicket, category: e.target.value})} className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}><option value="server">Servidor</option><option value="cameras">Cámaras</option><option value="pos">POS</option><option value="other">Otros</option></select><select value={newTicket.priority} onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})} className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}><option value="critical">Crítico</option><option value="high">Alta</option><option value="standard">Estándar</option><option value="low">Baja</option></select><button onClick={handleAddTicket} className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Crear</button><button onClick={() => setShowTicketModal(false)} className="w-full py-3 border rounded-xl mt-2">Cancelar</button></div>
          </div>
        </div>
      )}

      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl max-w-md w-full p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Detalle Tarea</h2>
            {editingTask ? (<><input type="text" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} className={`w-full p-3 rounded-xl border mb-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} /><textarea value={editingTask.description} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} rows="2" className={`w-full p-3 rounded-xl border mb-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} /><select value={editingTask.priority} onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})} className={`w-full p-3 rounded-xl border mb-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}><option value="mandatory">Obligatoria</option><option value="standard">Estándar</option><option value="not_urgent">No urgente</option></select><input type="time" value={editingTask.hour} onChange={(e) => setEditingTask({...editingTask, hour: e.target.value})} className={`w-full p-3 rounded-xl border mb-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} /><div className="flex gap-3"><button onClick={() => setEditingTask(null)} className="flex-1 p-3 border rounded-xl">Cancelar</button><button onClick={handleUpdateTask} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl">Guardar</button></div></>) : (<><p className="text-lg font-semibold">{selectedTask.title}</p><p className="text-gray-500 mt-1">{selectedTask.description || 'Sin descripción'}</p><div className="flex gap-4 mt-3 text-sm"><span>Prioridad: {PRIORITIES[selectedTask.priority]?.label}</span><span>Hora: {selectedTask.hour}</span><span>Estado: {selectedTask.completed ? 'Completada' : 'Pendiente'}</span></div><div className="flex gap-3 mt-4"><button onClick={() => setEditingTask({...selectedTask})} className="flex-1 p-3 border rounded-xl">Editar</button><button onClick={() => { handleCompleteTask(selectedTask.id); setShowTaskDetail(false); }} className="flex-1 p-3 bg-green-500 text-white rounded-xl">Completar</button><button onClick={() => { confirmDelete(selectedTask.id, 'task'); setShowTaskDetail(false); }} className="flex-1 p-3 bg-red-500 text-white rounded-xl">Eliminar</button></div></>)}
          </div>
        </div>
      )}

      {showTicketDetail && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl max-w-md w-full p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ticket #{selectedTicket.id}</h2>
            {editingTicket ? (<><input type="text" value={editingTicket.title} onChange={(e) => setEditingTicket({...editingTicket, title: e.target.value})} className={`w-full p-3 rounded-xl border mb-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} /><textarea value={editingTicket.description} onChange={(e) => setEditingTicket({...editingTicket, description: e.target.value})} rows="2" className={`w-full p-3 rounded-xl border mb-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} /><input type="text" value={editingTicket.requestedBy} onChange={(e) => setEditingTicket({...editingTicket, requestedBy: e.target.value})} className={`w-full p-3 rounded-xl border mb-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`} /><select value={editingTicket.category} onChange={(e) => setEditingTicket({...editingTicket, category: e.target.value})} className={`w-full p-3 rounded-xl border mb-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}><option value="server">Servidor</option><option value="cameras">Cámaras</option><option value="pos">POS</option><option value="other">Otros</option></select><select value={editingTicket.priority} onChange={(e) => setEditingTicket({...editingTicket, priority: e.target.value})} className={`w-full p-3 rounded-xl border mb-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}><option value="critical">Crítico</option><option value="high">Alta</option><option value="standard">Estándar</option><option value="low">Baja</option></select><div className="flex gap-3"><button onClick={() => setEditingTicket(null)} className="flex-1 p-3 border rounded-xl">Cancelar</button><button onClick={handleUpdateTicket} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl">Guardar</button></div></>) : (<><p className="text-lg font-semibold">{selectedTicket.title}</p><p className="text-gray-500 mt-1">{selectedTicket.description}</p><div className="grid grid-cols-2 gap-2 mt-3 text-sm"><span>Solicitante: {selectedTicket.requestedBy}</span><span>Categoría: {CATEGORIES[selectedTicket.category]?.label}</span><span>Prioridad: {selectedTicket.priority}</span><span>Estado: {selectedTicket.status}</span></div><div className="flex gap-3 mt-4"><button onClick={() => setEditingTicket({...selectedTicket})} className="flex-1 p-3 border rounded-xl">Editar</button><button onClick={() => { handleCompleteTicket(selectedTicket.id); setShowTicketDetail(false); }} className="flex-1 p-3 bg-green-500 text-white rounded-xl">Completar</button><button onClick={() => { confirmDelete(selectedTicket.id, 'ticket'); setShowTicketDetail(false); }} className="flex-1 p-3 bg-red-500 text-white rounded-xl">Eliminar</button></div></>)}
          </div>
        </div>
      )}

      <ConfirmModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleConfirmDelete} title="Confirmar" message="¿Estás seguro?" confirmText="Eliminar" type="danger" />
      <AlertModal isOpen={showAlert.show} onClose={() => setShowAlert({ ...showAlert, show: false })} title={showAlert.title} message={showAlert.message} type={showAlert.type} />
    </div>
  );
}