import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BranchesPage from './pages/BranchesPage';
import TasksPage from './pages/TasksPage';
import InventoryPage from './pages/InventoryPage';
import VaultPage from './pages/VaultPage';
import taskService from './services/taskService';
import { Bell, Clock, X } from 'lucide-react';
import RemoteAccessPage from './pages/RemoteAccessPage';

const DUE_ALERT_DURATION = 5000;
const DUE_CHECK_FALLBACK = 30000;

const getDueTimestamp = (task) => {
  if (!task?.due_date || !task?.due_time) return null;

  const [year, month, day] = String(task.due_date).slice(0, 10).split('-').map(Number);
  const [hour, minute] = String(task.due_time).split(':').map(Number);

  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;

  const due = new Date(year, month - 1, day, hour, minute, 0, 0);
  return Number.isNaN(due.getTime()) ? null : due.getTime();
};

const getDueAlertKey = (task) => `${task.id}:${task.due_date || ''}:${task.due_time || ''}`;

const readDueRegistry = () => {
  try {
    const raw = localStorage.getItem('it_support_task_due_alerts');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeDueRegistry = (registry) => {
  try {
    localStorage.setItem('it_support_task_due_alerts', JSON.stringify(registry));
  } catch {}
};

let dueAudioContext = null;
let dueAudioUnlocked = false;

const getDueAudioContext = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!dueAudioContext) dueAudioContext = new AudioContextClass();
    return dueAudioContext;
  } catch {
    return null;
  }
};

const unlockDueSound = () => {
  try {
    const context = getDueAudioContext();
    if (!context) return;

    if (context.state === 'suspended') {
      context.resume().then(() => {
        dueAudioUnlocked = true;
      }).catch(() => {});
    } else {
      dueAudioUnlocked = true;
    }
  } catch {}
};

const playDueSound = () => {
  try {
    const context = getDueAudioContext();
    if (!context) return;

    const play = () => {
      const now = context.currentTime;
      const master = context.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.225, now + 0.012);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
      master.connect(context.destination);

      const notes = [
        { frequency: 1046.5, start: 0.00, duration: 0.24 },
        { frequency: 1318.5, start: 0.30, duration: 0.30 },
      ];

      notes.forEach(({ frequency, start, duration }) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, now + start);
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.82, now + start + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
        oscillator.connect(gain);
        gain.connect(master);
        oscillator.start(now + start);
        oscillator.stop(now + start + duration + 0.01);
      });
    };

    if (context.state === 'suspended') {
      context.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch {}
};

function TaskDueGlobalToast({ task, onClose, onOpenTask, darkMode }) {
  useEffect(() => {
    if (!task) return undefined;
    const timer = setTimeout(onClose, DUE_ALERT_DURATION);
    return () => clearTimeout(timer);
  }, [task?.id, task?.due_date, task?.due_time, onClose]);

  if (!task) return null;

  const timeLabel = task.due_time
    ? (() => {
        const [hours, minutes] = String(task.due_time).split(':').map(Number);
        const date = new Date();
        date.setHours(hours || 0, minutes || 0, 0, 0);
        return date.toLocaleTimeString('es-US', { hour: '2-digit', minute: '2-digit' });
      })()
    : '';

  return (
    <div className="fixed inset-0 z-[2200] pointer-events-none">
      <div
        className={`pointer-events-auto fixed top-[72px] right-6 w-[380px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border shadow-2xl animate-[taskDueToastIn_360ms_cubic-bezier(.16,1,.3,1)] ${
          darkMode
            ? 'border-indigo-400/30 bg-[#111827]/[0.98] shadow-black/60 backdrop-blur-xl'
            : 'border-indigo-200 bg-white/[0.98] shadow-gray-300/50 backdrop-blur-xl'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />

        <div className="relative flex gap-3.5 p-4">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-indigo-500/10 animate-[taskDuePulse_900ms_ease-out]" />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/25">
              <Bell size={19} strokeWidth={2.5} />
            </span>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">
              Tarea programada
            </span>
            <h4 className={`mt-1 text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Es momento de actuar
            </h4>
            <p className={`mt-0.5 truncate text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {task.title}
            </p>
            {timeLabel && (
              <p className={`mt-0.5 flex items-center gap-1.5 text-[11px] ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                <Clock size={11} />
                {timeLabel}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`self-start rounded-lg p-1 transition ${darkMode ? 'text-gray-500 hover:bg-white/5 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
            aria-label="Cerrar alerta"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5">
          <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Sigue pendiente
          </span>
          <button
            type="button"
            onClick={() => {
              onOpenTask(task);
              onClose();
            }}
            className="rounded-lg bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-indigo-400"
          >
            Abrir tarea
          </button>
        </div>

        <div className={darkMode ? 'h-[2px] bg-gray-800' : 'h-[2px] bg-gray-100'}>
          <div className="h-full bg-indigo-500/70 animate-[taskDueProgress_5000ms_linear_forwards]" />
        </div>
      </div>

      <style>{`
        @keyframes taskDueToastIn {
          0% { opacity: 0; transform: translate3d(22px,-8px,0) scale(.96); }
          70% { opacity: 1; transform: translate3d(-2px,0,0) scale(1.01); }
          100% { opacity: 1; transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes taskDuePulse {
          0% { opacity: .65; transform: scale(.72); }
          100% { opacity: 0; transform: scale(1.65); }
        }
        @keyframes taskDueProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

function GlobalTaskDueNotifier() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [toastTask, setToastTask] = useState(null);
  const [queue, setQueue] = useState([]);
  const toastRef = useRef(null);
  const timerRef = useRef(null);
  const loadingRef = useRef(false);
  const queueRef = useRef([]);

  useEffect(() => {
    queueRef.current = queue;
    toastRef.current = toastTask;
  }, [queue, toastTask]);

  useEffect(() => {
    const unlock = () => unlockDueSound();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const scheduleNextCheck = useCallback((tasks) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const now = Date.now();
    const futureTimes = tasks
      .filter((task) => !task.completed && task.status !== 'resolved')
      .map(getDueTimestamp)
      .filter((timestamp) => timestamp !== null && timestamp > now)
      .sort((a, b) => a - b);

    const nextDue = futureTimes[0];
    const delay = nextDue ? Math.max(250, nextDue - now + 50) : DUE_CHECK_FALLBACK;
    timerRef.current = setTimeout(loadTasks, delay);
  }, []);

  const loadTasks = useCallback(async () => {
    if (loadingRef.current || !localStorage.getItem('token')) return;
    loadingRef.current = true;

    try {
      const tasks = await taskService.getAll();
      const now = Date.now();
      const registry = readDueRegistry();
      const dueNow = [];
      let registryChanged = false;

      tasks.forEach((task) => {
        if (task.completed || task.status === 'resolved') return;
        const dueTimestamp = getDueTimestamp(task);
        if (dueTimestamp === null || dueTimestamp > now) return;

        const key = getDueAlertKey(task);
        if (registry[key]) return;

        registry[key] = new Date().toISOString();
        registryChanged = true;
        dueNow.push(task);
      });

      if (registryChanged) writeDueRegistry(registry);

      if (dueNow.length) {
        const existingIds = new Set([
          ...queueRef.current.map((task) => getDueAlertKey(task)),
          ...(toastRef.current ? [getDueAlertKey(toastRef.current)] : []),
        ]);
        const fresh = dueNow.filter((task) => !existingIds.has(getDueAlertKey(task)));
        if (fresh.length) setQueue((prev) => [...prev, ...fresh]);
      }

      scheduleNextCheck(tasks);
    } catch (error) {
      console.error('Error comprobando tareas programadas:', error);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(loadTasks, DUE_CHECK_FALLBACK);
    } finally {
      loadingRef.current = false;
    }
  }, [scheduleNextCheck]);

  useEffect(() => {
    loadTasks();

    const refresh = () => loadTasks();
    window.addEventListener('it-support:tasks-changed', refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      window.removeEventListener('it-support:tasks-changed', refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loadTasks]);

  useEffect(() => {
    if (toastTask || !queue.length) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    setToastTask(next);
    playDueSound();

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('IT Support — Tarea programada', {
          body: `${next.title} está pendiente y llegó a su hora programada.`,
          tag: `task-due-${next.id}`,
        });
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch {}
    }
  }, [queue, toastTask]);

  const closeToast = useCallback(() => setToastTask(null), []);

  const openTask = useCallback((task) => {
    navigate('/tasks', { state: { openTaskId: task.id } });
  }, [navigate]);

  return (
    <TaskDueGlobalToast
      task={toastTask}
      darkMode={darkMode}
      onClose={closeToast}
      onOpenTask={openTask}
    />
  );
}

function App() {
  const token = localStorage.getItem('token');

  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    return <>{children}</>;
  };

  const ProtectedRouteWithNavbar = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    return (
      <>
        <Navbar />
        {children}
      </>
    );
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/branches" element={<ProtectedRouteWithNavbar><BranchesPage /></ProtectedRouteWithNavbar>} />
            <Route path="/tasks" element={<ProtectedRouteWithNavbar><TasksPage /></ProtectedRouteWithNavbar>} />
            <Route path="/inventory" element={<ProtectedRouteWithNavbar><InventoryPage /></ProtectedRouteWithNavbar>} />
            <Route path="/vault" element={<ProtectedRouteWithNavbar><VaultPage /></ProtectedRouteWithNavbar>} />
            <Route path="/maintenance" element={<ProtectedRouteWithNavbar><div className="p-8 text-slate-500 dark:text-slate-400">Módulo Mantenimiento - Próximamente</div></ProtectedRouteWithNavbar>} />
            <Route
  path="/remote"
  element={
    <ProtectedRouteWithNavbar>
      <RemoteAccessPage />
    </ProtectedRouteWithNavbar>
  }
/>
            <Route path="/snippets" element={<ProtectedRouteWithNavbar><div className="p-8 text-slate-500 dark:text-slate-400">Módulo Snippets - Próximamente</div></ProtectedRouteWithNavbar>} />
          </Routes>
          {token && <GlobalTaskDueNotifier />}
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
