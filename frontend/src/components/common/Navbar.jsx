import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import HallITLogo from './HallITLogo';
import {
  Home, Key, CheckSquare, Server, Calendar, Wifi, Code, Building2,
  LogOut, Menu, X, Sun, Moon, ArrowLeft, ShieldCheck
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
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleNavItems = user?.role === 'admin'
    ? [...navItems, { name: 'Administración', path: '/admin', icon: ShieldCheck }]
    : navItems;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`hidden md:block sticky top-0 z-[100] border-b transition-all duration-500 ease-out ${
          darkMode
            ? 'bg-slate-900/90 border-slate-700/80 backdrop-blur-xl'
            : 'bg-white/90 border-slate-200/90 backdrop-blur-xl'
        } `}
      >
        <div className="px-5 py-2">
          <div className="grid grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)] items-center gap-4 animate-[navbarContentIn_420ms_cubic-bezier(.16,1,.3,1)]">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate('/')}
                className={`shrink-0 p-2 rounded-lg transition-all duration-200 group ${
                  darkMode ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Volver al Dashboard"
              >
                <ArrowLeft size={17} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div
                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <HallITLogo size={34} className="shrink-0 drop-shadow-[0_0_10px_rgba(59,130,246,0.18)]" />
                <div className="min-w-0 leading-tight">
                  <div className={`text-base font-bold tracking-tight truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Hall-<span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">IT</span>
                  </div>
                  <div className={`text-[10px] uppercase tracking-[0.12em] truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    IT Support Platform
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1">
              {visibleNavItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap group ${
                      active
                        ? darkMode
                          ? 'bg-indigo-500/15 text-indigo-300'
                          : 'bg-indigo-50 text-indigo-700'
                        : darkMode
                          ? 'text-slate-300 hover:text-white hover:bg-white/5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon size={16} className="transition-transform duration-200 group-hover:scale-105" />
                    <span className="text-[13px] font-medium">{item.name}</span>
                    {active && (
                      <span className="absolute left-3 right-3 -bottom-2 h-px bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.55)]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-1">
              <button
                onClick={toggleDarkMode}
                className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                  darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                }`}
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-600" />}
              </button>
              <button
                onClick={logout}
                className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                  darkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                }`}
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <nav
        className={`md:hidden sticky top-0 z-[100] border-b transition-all duration-500 ease-out ${
          darkMode
            ? 'bg-slate-900/90 border-slate-700/80 backdrop-blur-xl'
            : 'bg-white/90 border-slate-200/90 backdrop-blur-xl'
        } `}
      >
        <div className="px-4 py-3 flex items-center justify-between animate-[navbarContentIn_420ms_cubic-bezier(.16,1,.3,1)]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className={`p-2 rounded-lg ${darkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'}`}
              title="Volver al Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <HallITLogo size={30} />
              <span className={`text-base font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Hall-<span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">IT</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
            >
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`px-4 pb-3 space-y-1 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'} animate-fade-in`}>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    active
                      ? darkMode
                        ? 'bg-indigo-500/15 text-indigo-300'
                        : 'bg-indigo-50 text-indigo-700'
                      : darkMode
                        ? 'text-slate-300 hover:bg-white/5'
                        : 'text-slate-600 hover:bg-slate-100'
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
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>
          </div>
        )}
      </nav>

      <style>{`
        @keyframes navbarContentIn {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
