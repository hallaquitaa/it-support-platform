import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, Sun, Moon, Home, Key, CheckSquare, Server, Calendar, Wifi, Code, Building2 } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const modules = [
    { name: 'Dashboard', icon: Home, path: '/', color: 'bg-slate-100 dark:bg-slate-700', textColor: 'text-slate-700 dark:text-slate-300' },
    { name: 'Sucursales', icon: Building2, path: '/branches', color: 'bg-orange-100 dark:bg-orange-900', textColor: 'text-orange-700 dark:text-orange-300' },
    { name: 'Bóveda', icon: Key, path: '/vault', color: 'bg-indigo-100 dark:bg-indigo-900', textColor: 'text-indigo-700 dark:text-indigo-300' },
    { name: 'Tareas', icon: CheckSquare, path: '/tasks', color: 'bg-blue-100 dark:bg-blue-900', textColor: 'text-blue-700 dark:text-blue-300' },
    { name: 'Inventario', icon: Server, path: '/inventory', color: 'bg-green-100 dark:bg-green-900', textColor: 'text-green-700 dark:text-green-300' },
    { name: 'Mantenimiento', icon: Calendar, path: '/maintenance', color: 'bg-yellow-100 dark:bg-yellow-900', textColor: 'text-yellow-700 dark:text-yellow-300' },
    { name: 'Remote Access', icon: Wifi, path: '/remote', color: 'bg-purple-100 dark:bg-purple-900', textColor: 'text-purple-700 dark:text-purple-300' },
    { name: 'Snippets', icon: Code, path: '/snippets', color: 'bg-pink-100 dark:bg-pink-900', textColor: 'text-pink-700 dark:text-pink-300' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">IT Support Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Bienvenido, {user?.full_name}
            </span>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title={darkMode ? "Modo claro" : "Modo oscuro"}
            >
              {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-indigo-600" />}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition text-red-600 dark:text-red-400"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Panel Principal
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Plataforma de gestión integral para soporte IT
          </p>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map(module => {
              const Icon = module.icon;
              return (
                <div
                  key={module.name}
                  onClick={() => navigate(module.path)}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200"
                >
                  <div className={`${module.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={32} className={module.textColor} />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">{module.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Módulo disponible</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}