import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Home, Key, CheckSquare, Server, Calendar, Wifi, Code, Building2,
  LogOut, Menu, X, Sun, Moon, Shield, ArrowLeft
} from 'lucide-react';

const navItems = [
  { name: 'Sucursales', path: '/branches', icon: Building2 },
  { name: 'Bóveda', path: '/vault', icon: Key },
  { name: 'Tareas', path: '/tasks', icon: CheckSquare },
  { name: 'Inventario', path: '/inventory', icon: Server },
  { name: 'Mantenimiento', path: '/maintenance', icon: Calendar },
  { name: 'Remote Access', path: '/remote', icon: Wifi },
  { name: 'Snippets', path: '/snippets', icon: Code },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animación al montar el componente
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Navbar con animación slide-down */}
      <nav 
        className={`hidden md:block bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-all duration-500 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}
      >
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Botón de regreso al Dashboard */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group"
                title="Volver al Dashboard"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate('/')}>
                <Shield className="w-7 h-7 text-indigo-600" />
                <span className="text-lg font-bold text-slate-800 dark:text-white">IT Support</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                      isActive(item.path)
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-105"
                title={darkMode ? "Modo claro" : "Modo oscuro"}
              >
                {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-indigo-600" />}
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-105 text-red-600"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar con animación */}
      <nav 
        className={`md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-all duration-500 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Volver al Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate('/')}>
              <Shield className="w-6 h-6 text-indigo-600" />
              <span className="text-base font-bold text-slate-800 dark:text-white">IT Support</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {darkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="px-4 pb-3 space-y-1 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>
          </div>
        )}
      </nav>
    </>
  );
}