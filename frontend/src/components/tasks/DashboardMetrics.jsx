import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle, Award, Clock, TrendingUp, Trophy } from 'lucide-react';

const DashboardMetrics = ({ stats, tickets, recurringTasks, userPoints, achievements, isDarkMode }) => {
  const weeklyData = [
    { day: 'Lun', completadas: stats?.completedToday || 0, total: stats?.todayTasks || 7 },
    { day: 'Mar', completadas: 0, total: 7 }, { day: 'Mié', completadas: 0, total: 7 },
    { day: 'Jue', completadas: 0, total: 7 }, { day: 'Vie', completadas: 0, total: 7 },
    { day: 'Sáb', completadas: 0, total: 5 }, { day: 'Dom', completadas: 0, total: 4 }
  ];

  const categoryData = [
    { name: 'Servidor', value: tickets?.filter(t => t.category === 'server').length || 0, color: '#3b82f6' },
    { name: 'Cashea', value: tickets?.filter(t => t.category === 'cashea').length || 0, color: '#10b981' },
    { name: 'Cámaras', value: tickets?.filter(t => t.category === 'cameras').length || 0, color: '#ec4899' },
    { name: 'POS', value: tickets?.filter(t => t.category === 'pos').length || 0, color: '#f97316' }
  ].filter(c => c.value > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between"><div><p className="text-sm text-gray-500">Tareas Hoy</p><p className="text-2xl font-bold">{stats?.todayTasks || 0}</p><p className="text-xs text-gray-400">Completadas: {stats?.completedToday || 0}</p></div><div className="p-2 rounded-lg bg-indigo-100"><CheckCircle size={20} className="text-indigo-600" /></div></div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5"><div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${((stats?.completedToday || 0) / (stats?.todayTasks || 1)) * 100}%` }}></div></div>
        </div>
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between"><div><p className="text-sm text-gray-500">SLA Adherencia</p><p className="text-2xl font-bold">{stats?.slaAdherence || 94}%</p><p className="text-xs text-gray-400">Meta: 95%</p></div><div className="p-2 rounded-lg bg-emerald-100"><Award size={20} className="text-emerald-600" /></div></div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${stats?.slaAdherence || 94}%` }}></div></div>
        </div>
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between"><div><p className="text-sm text-gray-500">Tiempo Medio</p><p className="text-2xl font-bold">{stats?.avgResolutionTime || 2.4}h</p><p className="text-xs text-gray-400">vs 3h semana pasada</p></div><div className="p-2 rounded-lg bg-blue-100"><Clock size={20} className="text-blue-600" /></div></div>
          <div className="mt-2 flex items-center gap-1 text-green-500 text-xs"><TrendingUp size={12} /> -15%</div>
        </div>
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between"><div><p className="text-sm text-gray-500">Puntos</p><p className="text-2xl font-bold">{userPoints || 0}</p><p className="text-xs text-gray-400">Logros: {achievements?.length || 0}</p></div><div className="p-2 rounded-lg bg-yellow-100"><Trophy size={20} className="text-yellow-600" /></div></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className="text-md font-semibold mb-3">Cumplimiento Semanal</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="completadas" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className="text-md font-semibold mb-3">Distribución por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{categoryData.map((entry, idx) => <Cell key={idx} fill={entry.color || COLORS[idx % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;