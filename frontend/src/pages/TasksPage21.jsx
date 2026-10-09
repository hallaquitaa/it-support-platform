import { createPortal } from 'react-dom';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  Check,
  Circle,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  Wrench,
  Shield,
  Wifi,
  HardDrive,
  FileText,
  History,
  RotateCcw,
  BarChart3,
  MessageSquare,
  Trash,
  Sparkles,
  Trophy,
  Flame,
  User,
  CheckCircle2,
  AlertCircle,
  Bell,
  X,
  Save,
  Inbox,
  ArrowUp,
  Minus,
  ArrowDown,
  Ticket,
  Tag,
  Settings2,
  PlusCircle,
  Palette,
  Server,
  Printer,
  Cloud,
  Users,
  Database,
} from 'lucide-react';

import taskService from '../services/taskService';
import TaskCompletionButton from '../components/tasks/TaskCompletionButton';
import AlertModal from '../components/common/AlertModal';
import ConfirmModal from '../components/common/ConfirmModal';


// ============================================================
// CONFIGURACIÓN
// ============================================================

const PRIORITIES = {
  high: {
    label: 'Alta',
    short: 'Alta',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: ArrowUp,
    points: 10,
    order: 1,
  },

  medium: {
    label: 'Media',
    short: 'Media',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: Minus,
    points: 5,
    order: 2,
  },

  low: {
    label: 'Baja',
    short: 'Baja',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: ArrowDown,
    points: 2,
    order: 3,
  },
};


const TASK_TYPES = {
  maintenance: {
    label: 'Mantenimiento',
    icon: Wrench,
    iconKey: 'wrench',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },

  security: {
    label: 'Seguridad',
    icon: Shield,
    iconKey: 'shield',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },

  network: {
    label: 'Redes',
    icon: Wifi,
    iconKey: 'wifi',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
  },

  hardware: {
    label: 'Hardware',
    icon: HardDrive,
    iconKey: 'harddrive',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },

  administrative: {
    label: 'Administrativo',
    icon: FileText,
    iconKey: 'filetext',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
};

const TYPE_ICON_LIBRARY = {
  wrench: Wrench,
  shield: Shield,
  wifi: Wifi,
  harddrive: HardDrive,
  filetext: FileText,
  server: Server,
  printer: Printer,
  cloud: Cloud,
  users: Users,
  database: Database,
  tag: Tag,
  sparkles: Sparkles,
};

const TYPE_COLOR_LIBRARY = [
  { key: 'orange', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', solid: 'bg-orange-500' },
  { key: 'red', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', solid: 'bg-red-500' },
  { key: 'rose', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', solid: 'bg-rose-500' },
  { key: 'pink', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20', solid: 'bg-pink-500' },
  { key: 'fuchsia', color: 'text-fuchsia-500', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', solid: 'bg-fuchsia-500' },
  { key: 'purple', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', solid: 'bg-purple-500' },
  { key: 'indigo', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', solid: 'bg-indigo-500' },
  { key: 'blue', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', solid: 'bg-blue-500' },
  { key: 'cyan', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', solid: 'bg-cyan-500' },
  { key: 'teal', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', solid: 'bg-teal-500' },
  { key: 'emerald', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', solid: 'bg-emerald-500' },
  { key: 'amber', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', solid: 'bg-amber-500' },
];

const AURA = {
  surface: (darkMode) =>
    darkMode
      ? 'bg-[#111827]/98 border-gray-700/80 shadow-black/40'
      : 'bg-white/98 border-gray-200 shadow-gray-300/30',
  enter: 'animate-[calendarIn_180ms_cubic-bezier(.16,1,.3,1)]',
};


const safeStorageRead = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const slugifyType = (label) => {
  const base = String(label || 'tipo')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'tipo';

  return `custom_${base}_${Date.now().toString(36)}`;
};

// ============================================================
// TICKETS EXISTENTES
// ============================================================

const INITIAL_TICKETS = [
  {
    id: 101,
    title: 'Cámara pasillo 3 - Imagen borrosa',
    description: 'La cámara muestra imagen borrosa',
    category: 'cameras',
    requestedBy: 'Carlos Pérez',
    status: 'pending',
    priority: 'high',
    date: new Date().toISOString(),
  },

  {
    id: 102,
    title: 'Caja 5 - Lentitud extrema',
    description: 'El sistema tarda en responder',
    category: 'pos',
    requestedBy: 'María López',
    status: 'in_progress',
    priority: 'critical',
    date: new Date().toISOString(),
  },
];


const WEEK_DAYS = [
  'Lun',
  'Mar',
  'Mié',
  'Jue',
  'Vie',
  'Sáb',
  'Dom',
];


// ============================================================
// UTILIDADES
// ============================================================

const getTodayString = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


const normalizeDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};


const getDateOnly = (value) => {
  if (!value) return null;

  const stringValue = String(value);

  if (stringValue.includes('T')) {
    return stringValue.split('T')[0];
  }

  if (stringValue.includes(' ')) {
    return stringValue.split(' ')[0];
  }

  return stringValue.substring(0, 10);
};


const formatDate = (value) => {
  if (!value) return '';

  const date = normalizeDate(value);

  if (!date) return '';

  return date.toLocaleDateString('es-US', {
    month: 'short',
    day: 'numeric',
  });
};


const formatDateTime = (value) => {
  if (!value) return '';

  const date = normalizeDate(value);

  if (!date) return '';

  return date.toLocaleString('es-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};


const isToday = (task) => {
  return getDateOnly(task.due_date) === getTodayString();
};


const isOverdue = (task) => {
  if (!task?.due_date) return false;

  if (task.completed || task.status === 'resolved') {
    return false;
  }

  return getDateOnly(task.due_date) < getTodayString();
};


const isUpcoming = (task) => {
  if (!task?.due_date) return false;

  if (task.completed || task.status === 'resolved') {
    return false;
  }

  return getDateOnly(task.due_date) > getTodayString();
};


const isCompleted = (task) => {
  return (
    task.completed === true ||
    task.status === 'resolved' ||
    task.status === 'completed'
  );
};

function TaskFilterDropdown({
  value,
  options,
  onChange,
  darkMode,
  icon: TriggerIcon = Filter,
  width = 'w-56',
  menuTitle = 'Filtrar',
  onManage,
  isOpen,
  onOpenChange,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const close = (event) => {
      if (!event.target.closest('[data-task-filter-dropdown]')) {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isOpen, onOpenChange]);

  const selected = options.find((option) => option.value === value) || {
    value: 'all',
    label: menuTitle,
  };

  return (
    <div className="relative" data-task-filter-dropdown>
      <button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className={`group flex h-9 items-center gap-2 rounded-lg border px-2.5 text-xs font-medium transition-all duration-200 ${width} ${
          isOpen
            ? darkMode
              ? 'border-indigo-500/70 bg-indigo-500/10 text-white ring-2 ring-indigo-500/10'
              : 'border-indigo-400 bg-indigo-50 text-gray-900 ring-2 ring-indigo-500/10'
            : darkMode
            ? 'border-gray-700/80 bg-gray-900/80 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <TriggerIcon
          size={15}
          className={`shrink-0 ${
            isOpen
              ? 'text-indigo-400'
              : darkMode
              ? 'text-gray-500 group-hover:text-indigo-400'
              : 'text-gray-400 group-hover:text-indigo-500'
          }`}
        />
        <span className="min-w-0 flex-1 truncate text-left">{selected.label}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-200 ${
            isOpen
              ? 'rotate-180 text-indigo-400'
              : darkMode
              ? 'text-gray-500'
              : 'text-gray-400'
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 top-[calc(100%+6px)] z-[90] overflow-hidden rounded-xl border p-1 shadow-2xl backdrop-blur-xl ${AURA.enter} ${width} ${AURA.surface(darkMode)}`}
          role="listbox"
        >
          <div className={`px-2 pb-1 pt-1 text-[8px] font-bold uppercase tracking-[0.18em] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {menuTitle}
          </div>

          <div className="space-y-0.5">
            {options.map((option) => {
              const OptionIcon = option.icon;
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    onOpenChange(false);
                  }}
                  className={`group/option flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-all duration-150 ${
                    active
                      ? darkMode
                        ? 'bg-indigo-500/15 text-white'
                        : 'bg-indigo-50 text-indigo-700'
                      : darkMode
                      ? 'text-gray-300 hover:bg-white/[0.06] hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  role="option"
                  aria-selected={active}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                      active
                        ? darkMode
                          ? 'border-indigo-400/20 bg-indigo-500/15'
                          : 'border-indigo-200 bg-indigo-100'
                        : darkMode
                        ? 'border-gray-700/70 bg-gray-800/80 group-hover/option:border-gray-600'
                        : 'border-gray-200 bg-gray-50 group-hover/option:border-gray-300'
                    }`}
                  >
                    {OptionIcon ? (
                      <OptionIcon
                        size={14}
                        className={
                          option.color ||
                          (active
                            ? 'text-indigo-400'
                            : darkMode
                            ? 'text-gray-500'
                            : 'text-gray-400')
                        }
                      />
                    ) : (
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-indigo-400' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    )}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-left font-medium">{option.label}</span>

                  {active && <Check size={15} className="shrink-0 text-indigo-400" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>

          {onManage && (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onManage();
              }}
              className={`mt-1 flex w-full items-center gap-2 rounded-lg border-t px-2 py-2 text-[11px] font-semibold transition ${darkMode ? 'border-gray-800 text-indigo-300 hover:bg-indigo-500/10' : 'border-gray-100 text-indigo-600 hover:bg-indigo-50'}`}
            >
              <Settings2 size={14} />
              Personalizar tipos
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const getTaskDueTimestamp = (task) => {
  if (!task?.due_date || !task?.due_time) return null;

  const [year, month, day] = String(task.due_date).slice(0, 10).split('-').map(Number);
  const [hour, minute] = String(task.due_time).split(':').map(Number);

  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;

  const due = new Date(year, month - 1, day, hour, minute, 0, 0);
  return Number.isNaN(due.getTime()) ? null : due.getTime();
};



// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================



function TaskDatePicker({ value, onChange, darkMode, isOpen, onToggle }) {
  const parseDate = (dateValue) => {
    if (!dateValue) return new Date();
    const [year, month, day] = dateValue.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const [viewDate, setViewDate] = useState(() =>
    parseDate(value)
  );

  useEffect(() => {
    if (value) {
      setViewDate(parseDate(value));
    }
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];

  const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const previousMonthDays = new Date(
    year,
    month,
    0
  ).getDate();

  const cells = [];

  for (let index = firstDay - 1; index >= 0; index -= 1) {
    cells.push({
      day: previousMonthDays - index,
      outside: true,
      date: new Date(
        year,
        month - 1,
        previousMonthDays - index
      ),
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      outside: false,
      date: new Date(year, month, day),
    });
  }

  const remaining = Math.max(
    0,
    35 - cells.length
  );

  for (let day = 1; day <= remaining; day += 1) {
    cells.push({
      day,
      outside: true,
      date: new Date(year, month + 1, day),
    });
  }

  // If a month genuinely needs a sixth week, keep only
  // the required days instead of showing a full next-month row.
  if (cells.length > 35) {
    cells.length = 35;
  }

  const toISO = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  };

  const todayISO = toISO(new Date());

  const selectDate = (date) => {
    onChange(toISO(date));
    onToggle(false);
  };

  const selectedDate = value
    ? parseDate(value)
    : null;

  const selectedISO = value || '';

  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString('es-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Seleccionar fecha';

  const changeMonth = (amount) => {
    setViewDate(
      new Date(
        year,
        month + amount,
        1
      )
    );
  };

  const goToday = () => {
    const today = new Date();
    setViewDate(today);
    selectDate(today);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className={`
          group
          flex
          items-center
          justify-between
          w-full
          px-3
          py-2.5
          rounded-xl
          border
          text-sm
          text-left
          transition-all
          duration-200
          ${
            isOpen
              ? darkMode
                ? 'bg-gray-800 border-indigo-500/60 ring-2 ring-indigo-500/10'
                : 'bg-white border-indigo-400 ring-2 ring-indigo-500/10'
              : darkMode
              ? 'bg-gray-800/90 border-gray-700 text-gray-200 hover:border-gray-600 hover:bg-gray-800'
              : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300'
          }
        `}
      >
        <span
          className={`
            flex
            items-center
            gap-2
            ${
              value
                ? darkMode
                  ? 'text-gray-100'
                  : 'text-gray-900'
                : 'text-gray-500'
            }
          `}
        >
          <Calendar
            size={16}
            className={`
              transition-colors
              ${
                isOpen
                  ? 'text-indigo-400'
                  : darkMode
                  ? 'text-gray-500 group-hover:text-indigo-400'
                  : 'text-gray-400 group-hover:text-indigo-500'
              }
            `}
          />
          {displayValue}
        </span>

        <ChevronDown
          size={15}
          className={`
            transition-transform duration-200
            ${
              isOpen
                ? 'rotate-180 text-indigo-400'
                : darkMode
                ? 'text-gray-500'
                : 'text-gray-400'
            }
          `}
        />
      </button>

      {isOpen && (
        <div
          className={`
            absolute
            z-[80]
            left-0
            bottom-[calc(100%+8px)]
            w-[290px]
            max-w-[calc(100vw-48px)]
            overflow-hidden
            rounded-2xl
            border
            shadow-2xl
            backdrop-blur-xl
            animate-[calendarIn_180ms_cubic-bezier(.16,1,.3,1)]
            ${darkMode
              ? 'bg-[#111827]/98 border-gray-700/80 shadow-black/40'
              : 'bg-white/98 border-gray-200 shadow-gray-300/30'}
          `}
        >
          <div
            className={`
              px-3
              pt-3
              pb-2
              border-b
              ${
                darkMode
                  ? 'border-gray-800'
                  : 'border-gray-100'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className={`
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  transition-all
                  hover:scale-105
                  ${
                    darkMode
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                aria-label="Mes anterior"
              >
                <ChevronDown
                  size={16}
                  className="rotate-90"
                />
              </button>

              <div className="text-center">
                <div
                  className={`
                    text-sm
                    font-semibold
                    capitalize
                    ${
                      darkMode
                        ? 'text-white'
                        : 'text-gray-900'
                    }
                  `}
                >
                  {monthNames[month]}
                </div>

                <div
                  className={`
                    mt-0.5
                    text-[11px]
                    font-medium
                    ${
                      darkMode
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }
                  `}
                >
                  {year}
                </div>
              </div>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                className={`
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  transition-all
                  hover:scale-105
                  ${
                    darkMode
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                aria-label="Mes siguiente"
              >
                <ChevronDown
                  size={16}
                  className="-rotate-90"
                />
              </button>
            </div>
          </div>

          <div className="px-3 pt-2">
            <div className="grid grid-cols-7 mb-0">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className={`
                    flex
                    h-6
                    items-center
                    justify-center
                    text-[10px]
                    font-semibold
                    uppercase
                    ${
                      darkMode
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }
                  `}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((cell, index) => {
                const iso = toISO(cell.date);
                const selected =
                  iso === selectedISO;
                const today =
                  iso === todayISO;

                return (
                  <button
                    type="button"
                    key={`${iso}-${index}`}
                    onClick={() =>
                      selectDate(cell.date)
                    }
                    className={`
                      relative
                      mx-auto
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-xl
                      text-xs
                      font-medium
                      transition-all
                      duration-150
                      hover:scale-105
                      ${
                        selected
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                          : cell.outside
                          ? darkMode
                            ? 'text-gray-700 hover:bg-gray-800 hover:text-gray-400'
                            : 'text-gray-300 hover:bg-gray-50 hover:text-gray-500'
                          : darkMode
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    {cell.day}

                    {today && !selected && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`
              flex
              items-center
              justify-between
              mt-1
              px-3
              py-2.5
              border-t
              ${
                darkMode
                  ? 'border-gray-800'
                  : 'border-gray-100'
              }
            `}
          >
            <button
              type="button"
              onClick={() => {
                onChange('');
                onToggle(false);
              }}
              className={`
                text-[11px]
                font-medium
                transition-colors
                ${
                  darkMode
                    ? 'text-gray-500 hover:text-gray-300'
                    : 'text-gray-400 hover:text-gray-700'
                }
              `}
            >
              Limpiar
            </button>

            <button
              type="button"
              onClick={goToday}
              className="
                rounded-lg
                px-2.5
                py-1.5
                text-[11px]
                font-semibold
                text-indigo-400
                transition-all
                hover:bg-indigo-500/10
                hover:text-indigo-300
              "
            >
              Hoy
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes auraPanelIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes auraOverlayIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes taskFilterIn {
          0% { opacity: 0; transform: translateY(-4px) scale(.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes taskPanelIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes calendarIn {
          0% {
            opacity: 0;
            transform: translateY(-5px) scale(.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}


function TaskTimePicker({ value, onChange, darkMode, isOpen, onToggle }) {
  const parseTime = (timeValue) => {
    if (!timeValue || !/^\d{2}:\d{2}$/.test(timeValue)) {
      return { hour: 12, minute: 0, period: 'AM' };
    }

    const [hours, minutes] = timeValue.split(':').map(Number);
    return {
      hour: hours === 0 ? 12 : hours > 12 ? hours - 12 : hours,
      minute: minutes,
      period: hours >= 12 ? 'PM' : 'AM',
    };
  };

  const [draft, setDraft] = useState(() => parseTime(value));

  useEffect(() => {
    if (isOpen) {
      setDraft(parseTime(value));
    }
  }, [isOpen, value]);

  const hours = Array.from({ length: 12 }, (_, index) => index + 1);
  const minutes = Array.from({ length: 60 }, (_, index) => index);

  const commit = (next) => {
    const hour24 = next.period === 'AM'
      ? next.hour === 12 ? 0 : next.hour
      : next.hour === 12 ? 12 : next.hour + 12;

    onChange(`${String(hour24).padStart(2, '0')}:${String(next.minute).padStart(2, '0')}`);
  };

  const updateDraft = (patch) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    commit(next);
  };

  const displayValue = value
    ? (() => {
        const parsed = parseTime(value);
        return `${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')} ${parsed.period}`;
      })()
    : 'Seleccionar hora';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className={`
          group flex w-full items-center justify-between
          px-3 py-2.5 rounded-xl border text-sm text-left
          transition-all duration-200
          ${isOpen
            ? darkMode
              ? 'bg-gray-800 border-indigo-500/60 ring-2 ring-indigo-500/10'
              : 'bg-white border-indigo-400 ring-2 ring-indigo-500/10'
            : darkMode
              ? 'bg-gray-800/90 border-gray-700 text-gray-200 hover:border-gray-600 hover:bg-gray-800'
              : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300'
          }
        `}
      >
        <span className={`flex items-center gap-2 ${value ? (darkMode ? 'text-gray-100' : 'text-gray-900') : 'text-gray-500'}`}>
          <Clock
            size={16}
            className={isOpen ? 'text-indigo-400' : darkMode ? 'text-gray-500 group-hover:text-indigo-400' : 'text-gray-400 group-hover:text-indigo-500'}
          />
          {displayValue}
        </span>
        <Clock size={15} className={isOpen ? 'text-indigo-400' : darkMode ? 'text-gray-500' : 'text-gray-400'} />
      </button>

      {isOpen && (
        <div className={`
          absolute z-[80] right-0 bottom-[calc(100%+8px)]
          w-[290px] max-w-[calc(100vw-48px)]
          overflow-hidden rounded-2xl border shadow-2xl
          backdrop-blur-xl
          animate-[calendarIn_180ms_cubic-bezier(.16,1,.3,1)]
          ${darkMode
            ? 'bg-[#111827]/98 border-gray-700/80 shadow-black/40'
            : 'bg-white/98 border-gray-200 shadow-gray-300/30'
          }
        `}>
          <div className={`px-3 pt-3 pb-2 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-semibold uppercase tracking-[0.12em] ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  Hora
                </div>
                <div className={`mt-0.5 text-[11px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Selecciona hora y minutos
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggle(false)}
                className={`rounded-lg px-2 py-1 text-[10px] font-medium ${darkMode ? 'text-gray-500 hover:bg-gray-800 hover:text-gray-300' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 px-3 py-2">
            <div>
              <div className={`mb-1 text-center text-[10px] font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Hora</div>
              <div className={`h-[178px] overflow-y-auto rounded-xl p-1 ${darkMode ? 'bg-gray-900/45' : 'bg-gray-50'}`}>
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => updateDraft({ hour })}
                    className={`mb-1 flex h-8 w-full items-center justify-center rounded-lg text-xs font-medium transition-all last:mb-0 ${draft.hour === hour ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {String(hour).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={`mb-1 text-center text-[10px] font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Min</div>
              <div className={`h-[178px] overflow-y-auto rounded-xl p-1 ${darkMode ? 'bg-gray-900/45' : 'bg-gray-50'}`}>
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => updateDraft({ minute })}
                    className={`mb-1 flex h-8 w-full items-center justify-center rounded-lg text-xs font-medium transition-all last:mb-0 ${draft.minute === minute ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {String(minute).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={`mb-1 text-center text-[10px] font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>Zona</div>
              <div className={`rounded-xl p-1 ${darkMode ? 'bg-gray-900/45' : 'bg-gray-50'}`}>
                {['AM', 'PM'].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => updateDraft({ period })}
                    className={`mb-1 flex h-9 w-full items-center justify-center rounded-lg text-xs font-semibold transition-all last:mb-0 ${draft.period === period ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`flex items-center justify-between border-t px-3 py-2.5 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <button
              type="button"
              onClick={() => {
                onChange('');
                onToggle(false);
              }}
              className={`text-[11px] font-medium transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => onToggle(false)}
              className="rounded-lg bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-all hover:bg-indigo-400"
            >
              Listo
            </button>
          </div>
        </div>
      )}

      <style>{`\n        @keyframes calendarIn {\n          0% { opacity: 0; transform: translateY(5px) scale(.98); }\n          100% { opacity: 1; transform: translateY(0) scale(1); }\n        }\n      `}</style>
    </div>
  );
}


function TaskValidationToast({ show, onClose, darkMode }) {
  useEffect(() => {
    if (!show) return undefined;

    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[1200] pointer-events-none">
      <div
        className={`
          pointer-events-auto fixed top-[72px] right-6
          w-[340px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border
          shadow-2xl animate-[taskToastIn_420ms_cubic-bezier(.16,1,.3,1)]
          ${
            darkMode
              ? 'border-amber-400/25 bg-[#111827] shadow-black/50'
              : 'border-amber-300 bg-white shadow-gray-300/50'
          }
        `}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <div className="flex gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
            <AlertCircle size={19} strokeWidth={2.5} />
          </div>

          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400">
              Tarea incompleta
            </span>

            <h4 className={`mt-1 text-sm font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Necesita un nombre
            </h4>

            <p className={`mt-0.5 text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Escribe un título para continuar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`self-start rounded-lg p-1 transition ${
              darkMode
                ? 'text-gray-500 hover:bg-gray-800 hover:text-white'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
            }`}
            aria-label="Cerrar"
          >
            <X size={15} />
          </button>
        </div>

        <div className="h-0.5 bg-amber-400/20">
          <div className="h-full w-full origin-left animate-[taskValidationProgress_3s_linear] bg-amber-400" />
        </div>
      </div>

      <style>{`
        @keyframes taskValidationProgress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

function TaskCreatedToast({ toast, onClose, darkMode }) {
  useEffect(() => {
    if (!toast?.show) return undefined;

    const timer = setTimeout(() => {
      onClose();
    }, 3200);

    return () => clearTimeout(timer);
  }, [toast?.show, toast?.id, onClose]);

  if (!toast?.show) return null;

  return (
    <>
      <div className="fixed inset-0 z-[220] pointer-events-none">
        <div
          className={`
            pointer-events-auto absolute top-[72px] right-6 w-[340px]
            max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border
            ${
              darkMode
                ? 'border-emerald-400/20 bg-[#0d1422]'
                : 'border-emerald-500/25 bg-white'
            }
            animate-[taskToastIn_420ms_cubic-bezier(.16,1,.3,1)]
          `}
        >
          <div
            className="
              absolute inset-x-0 top-0 h-px
              bg-gradient-to-r from-transparent via-emerald-400 to-transparent
              animate-[taskToastGlow_900ms_ease-out]
            "
          />

          <div className="relative flex gap-4 p-4">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
              <span
                className="
                  absolute inset-0 rounded-full bg-emerald-500/10
                  animate-[taskToastRing_700ms_ease-out]
                "
              />

              <span
                className="
                  relative flex h-10 w-10 items-center justify-center
                  rounded-full bg-emerald-500 text-white
                  animate-[taskToastIcon_520ms_cubic-bezier(.16,1,.3,1)]
                "
              >
                <Check
                  size={21}
                  strokeWidth={3}
                  className="animate-[taskToastCheck_500ms_ease-out]"
                />
              </span>

              <Sparkles
                size={13}
                className="
                  absolute -right-1 -top-1 text-emerald-300
                  animate-[taskToastSparkle_900ms_ease-out]
                "
              />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Operación completada
              </span>

              <h4
                className={`
                  mt-1 text-sm font-semibold
                  ${darkMode ? 'text-white' : 'text-gray-900'}
                `}
              >
                Tarea creada
              </h4>

              <p
                className={`
                  mt-0.5 truncate text-xs
                  ${darkMode ? 'text-gray-400' : 'text-gray-500'}
                `}
              >
                {toast.title || 'Nueva tarea lista para ejecutar'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`
                pointer-events-auto -mr-1 -mt-1 flex h-6 w-6 shrink-0
                items-center justify-center rounded-md transition-all
                ${
                  darkMode
                    ? 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }
              `}
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>

          <div className={`h-[2px] ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div
              className="
                h-full bg-emerald-500/70
                animate-[taskToastProgress_3200ms_linear_forwards]
              "
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes taskToastIn {
          0% { opacity: 0; transform: translate3d(28px,-10px,0) scale(.94); }
          70% { opacity: 1; transform: translate3d(-3px,0,0) scale(1.01); }
          100% { opacity: 1; transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes taskToastGlow {
          0% { opacity: 0; transform: scaleX(.2); }
          50% { opacity: 1; transform: scaleX(1); }
          100% { opacity: .35; transform: scaleX(.7); }
        }
        @keyframes taskToastRing {
          0% { opacity: .8; transform: scale(.45); }
          100% { opacity: 0; transform: scale(1.75); }
        }
        @keyframes taskToastIcon {
          0% { transform: scale(.45) rotate(-12deg); opacity: 0; }
          65% { transform: scale(1.12) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes taskToastCheck {
          0% { transform: scale(.3); opacity: 0; }
          55% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes taskToastSparkle {
          0% { opacity: 0; transform: scale(.2) rotate(-30deg); }
          45% { opacity: 1; transform: scale(1.2) rotate(10deg); }
          100% { opacity: .35; transform: scale(.9) rotate(0); }
        }
        @keyframes taskToastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  );
}



function TypeManagerContent({ darkMode, customTaskTypes, onCreate, onDelete, onClose }) {
  const [draft, setDraft] = useState({ label: '', iconKey: 'tag', colorKey: 'blue' });
  const palette = TYPE_COLOR_LIBRARY.find((item) => item.key === draft.colorKey) || TYPE_COLOR_LIBRARY[0];
  const DraftIcon = TYPE_ICON_LIBRARY[draft.iconKey] || Tag;

  return (
    <div>
      <div className={`flex items-center justify-between border-b px-5 py-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
        <div>
          <div className="flex items-center gap-2">
            <Settings2 size={17} className="text-indigo-400" />
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Personalizar tipos</h3>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Crea categorías IT que se adapten a tu operación.</p>
        </div>
        <button type="button" onClick={onClose} className={`rounded-lg p-2 ${darkMode ? 'text-gray-500 hover:bg-white/5 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}><X size={16} /></button>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <label className={`mb-2 block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Nuevo tipo</label>
          <input autoFocus value={draft.label} onChange={(e) => setDraft((prev) => ({ ...prev, label: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter' && draft.label.trim()) onCreate(draft); }} placeholder="Ej. Microsoft 365, Impresoras, Backups..." className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 ${darkMode ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-600' : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400'}`} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between"><label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Icono</label><span className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold ${palette.bg} ${palette.color}`}><DraftIcon size={12} /> Vista previa</span></div>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(TYPE_ICON_LIBRARY).map(([key, Icon]) => (
              <button key={key} type="button" onClick={() => setDraft((prev) => ({ ...prev, iconKey: key }))} className={`flex h-9 items-center justify-center rounded-lg border transition ${draft.iconKey === key ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : darkMode ? 'border-gray-700 bg-gray-800 text-gray-500 hover:text-white' : 'border-gray-200 bg-gray-50 text-gray-400 hover:text-gray-700'}`}><Icon size={15} /></button>
            ))}
          </div>
        </div>

        <div>
          <label className={`mb-2 block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Color</label>
          <div className="flex flex-wrap gap-2">
            {TYPE_COLOR_LIBRARY.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, colorKey: item.key }))}
                className={`h-7 w-7 rounded-full border transition-transform duration-150 hover:scale-105 ${item.solid} ${
                  draft.colorKey === item.key
                    ? darkMode
                      ? 'border-white ring-2 ring-indigo-400/70 ring-offset-2 ring-offset-[#111827]'
                      : 'border-gray-900 ring-2 ring-indigo-400/60 ring-offset-2 ring-offset-white'
                    : darkMode
                    ? 'border-white/15'
                    : 'border-black/10'
                }`}
                title={item.key}
                aria-label={`Color ${item.key}`}
              />
            ))}
          </div>
        </div>

        <button type="button" disabled={!draft.label.trim()} onClick={() => onCreate(draft)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"><PlusCircle size={15} /> Crear tipo</button>

        <div>
          <div className={`mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}><Palette size={12} /> Tipos personalizados</div>
          {Object.keys(customTaskTypes).length === 0 ? (
            <div className={`rounded-xl border border-dashed p-3 text-center text-xs ${darkMode ? 'border-gray-700 text-gray-600' : 'border-gray-200 text-gray-400'}`}>Todavía no has creado tipos personalizados.</div>
          ) : (
            <div className="space-y-1.5">
              {Object.entries(customTaskTypes).map(([key, type]) => {
                const Icon = TYPE_ICON_LIBRARY[type.iconKey] || Tag;
                return <div key={key} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}><Icon size={14} className={type.color} /><span className={`flex-1 text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{type.label}</span><button type="button" onClick={() => onDelete(key)} className={`rounded-md p-1 ${darkMode ? 'text-gray-600 hover:bg-red-500/10 hover:text-red-400' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'}`}><Trash2 size={13} /></button></div>;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { darkMode } = useTheme();
  const location = useLocation();

  // ==========================================================
  // TAREAS
  // ==========================================================

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskError, setTaskError] = useState('');

  // ==========================================================
  // UI
  // ==========================================================

  const [activeTab, setActiveTab] = useState('dashboard');

  const [taskView, setTaskView] = useState('active');

  const [searchTerm, setSearchTerm] = useState('');

  const [taskFilter, setTaskFilter] = useState({
    priority: 'all',
    type: 'all',
  });

  const [customTaskTypes, setCustomTaskTypes] = useState({});
  const [showTypeManager, setShowTypeManager] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);

  const allTaskTypes = useMemo(() => {
    const hydratedCustomTypes = Object.fromEntries(
      Object.entries(customTaskTypes).map(([key, type]) => [
        key,
        {
          ...type,
          icon: TYPE_ICON_LIBRARY[type.iconKey] || Tag,
        },
      ])
    );

    return {
      ...TASK_TYPES,
      ...hydratedCustomTypes,
    };
  }, [customTaskTypes]);

  const taskTypeOptions = useMemo(() => [
    { value: 'all', label: 'Tipo', icon: Filter },
    ...Object.entries(allTaskTypes).map(([key, type]) => ({
      value: key,
      label: type.label,
      icon: type.icon,
      color: type.color,
    })),
  ], [allTaskTypes]);

  const [showNoDate, setShowNoDate] = useState(false);

  // ==========================================================
  // SIDE PANEL
  // ==========================================================

  const [showTaskPanel, setShowTaskPanel] = useState(false);

  const [panelMode, setPanelMode] = useState('create');

  const [formTask, setFormTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    task_type: 'administrative',
    due_date: '',
    due_time: '',
    parent_task_id: null,
  });

  const [savingTask, setSavingTask] = useState(false);

  const [activePicker, setActivePicker] = useState(null);

  // ==========================================================
  // SUBTAREAS
  // ==========================================================

  const [expandedTasks, setExpandedTasks] = useState({});

  // ==========================================================
  // TICKETS
  // ==========================================================

  const [tickets, setTickets] = useState(INITIAL_TICKETS);

  const [deletedTickets, setDeletedTickets] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [loadingTrash, setLoadingTrash] = useState(false);

  const [ticketFilter, setTicketFilter] = useState({
    status: 'all',
  });

  // ==========================================================
  // GAMIFICACIÓN
  // ==========================================================
  // Nota: el contador de tareas completadas ahora se deriva de
  // `historyTasks` (datos reales del backend), ya no es un valor
  // fijo en estado. Ver `completedTasksCount` más abajo.

  const [streak] = useState(3);

  // ==========================================================
  // NOTIFICACIONES
  // ==========================================================

  const [showNotifications, setShowNotifications] = useState(false);

  // ==========================================================
  // ALERTAS
  // ==========================================================

  const [createdToast, setCreatedToast] = useState({
    show: false,
    title: '',
    id: 0,
  });

  const [validationToast, setValidationToast] = useState({ show: false, id: 0 });

  const [showAlert, setShowAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success',
  });

  const [showConfirm, setShowConfirm] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [deletingType, setDeletingType] = useState(null);

  // ==========================================================
  // CARGAR TAREAS
  // ==========================================================

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      setTaskError('');

      const data = await taskService.getAll();

      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando tareas:', error);

      setTaskError(
        'No se pudieron cargar las tareas desde el servidor.'
      );
    } finally {
      setLoadingTasks(false);
    }
  };


  const loadTaskTrash = async () => {
    try {
      setLoadingTrash(true);
      const data = await taskService.getTrash();
      setDeletedTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando papelera de tareas:', error);
      setShowAlert({ show: true, title: 'Error', message: 'No se pudo cargar la papelera de tareas.', type: 'error' });
    } finally {
      setLoadingTrash(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'trash') loadTaskTrash();
  }, [activeTab]);


  useEffect(() => {
    const stored = safeStorageRead('it_support_task_custom_types', {});
    const sanitized = Object.fromEntries(
      Object.entries(stored).map(([key, type]) => {
        const iconKey = TYPE_ICON_LIBRARY[type?.iconKey] ? type.iconKey : 'tag';
        const palette = TYPE_COLOR_LIBRARY.find((item) => item.key === type?.colorKey) || TYPE_COLOR_LIBRARY[0];
        return [key, {
          label: String(type?.label || 'Tipo'),
          iconKey,
          colorKey: palette.key,
          color: palette.color,
          bg: palette.bg,
          custom: true,
        }];
      })
    );
    setCustomTaskTypes(sanitized);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('it_support_task_custom_types', JSON.stringify(customTaskTypes));
    } catch {}
  }, [customTaskTypes]);


  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const taskId = location.state?.openTaskId;
    if (!taskId) return undefined;

    let cancelled = false;

    const openRequestedTask = async () => {
      try {
        const task = await taskService.getById(taskId);
        if (!cancelled && task) {
          openEditPanel(task);
          window.history.replaceState(
            window.history.state,
            '',
            window.location.href
          );
        }
      } catch (error) {
        console.error('Error abriendo tarea desde alerta:', error);
      }
    };

    openRequestedTask();

    return () => {
      cancelled = true;
    };
  }, [location.state?.openTaskId]);




  // ==========================================================
  // TAREAS DERIVADAS
  // ==========================================================

  const rootTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        !task.parent_task_id &&
        !task.parent_task_id === null
    );
  }, [tasks]);


  const topLevelTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.parent_task_id === null ||
        task.parent_task_id === undefined ||
        task.parent_task_id === ''
    );
  }, [tasks]);


  const subtasksByParent = useMemo(() => {
    const grouped = {};

    tasks.forEach((task) => {
      if (task.parent_task_id) {
        if (!grouped[task.parent_task_id]) {
          grouped[task.parent_task_id] = [];
        }

        grouped[task.parent_task_id].push(task);
      }
    });

    return grouped;
  }, [tasks]);


  const completedToday = useMemo(() => {
    return tasks.filter((task) => {
      if (!isCompleted(task)) return false;

      const completedDate =
        getDateOnly(task.completed_at) ||
        getDateOnly(task.resolved_at);

      return completedDate === getTodayString();
    }).length;
  }, [tasks]);


  const todayTotal = useMemo(() => {
    return tasks.filter((task) => {
      return isToday(task);
    }).length;
  }, [tasks]);


  const dailyProgress = todayTotal
    ? Math.min(100, Math.round((completedToday / todayTotal) * 100))
    : 0;


  const pendingTasks = useMemo(() => {
    return tasks.filter((task) => !isCompleted(task));
  }, [tasks]);


  const historyTasks = useMemo(() => {
    return tasks.filter((task) => isCompleted(task));
  }, [tasks]);


  // Gamificación: contador simple de tareas completadas (dato real,
  // no un puntaje simulado). Se recalcula solo cuando cambian las tareas.
  const completedTasksCount = historyTasks.length;


  // Analíticas: actividad real de los últimos 7 días, calculada a partir
  // de las fechas de completado reales (completed_at / resolved_at),
  // en vez del arreglo estático WEEKLY_TICKETS.
  const weeklyActivity = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dateKey = getDateOnly(date.toISOString());
      const label = WEEK_DAYS[(date.getDay() + 6) % 7];

      const count = tasks.filter((task) => {
        if (!isCompleted(task)) return false;

        const completedDate =
          getDateOnly(task.completed_at) ||
          getDateOnly(task.resolved_at);

        return completedDate === dateKey;
      }).length;

      days.push({ dateKey, label, count });
    }

    return days;
  }, [tasks]);


  const overdueTasks = useMemo(() => {
    return pendingTasks.filter(isOverdue);
  }, [pendingTasks]);


  const todayTasks = useMemo(() => {
    return pendingTasks.filter(isToday);
  }, [pendingTasks]);


  const upcomingTasks = useMemo(() => {
    return pendingTasks.filter(isUpcoming);
  }, [pendingTasks]);


  const noDateTasks = useMemo(() => {
    return pendingTasks.filter(
      (task) => !task.due_date
    );
  }, [pendingTasks]);


  // ==========================================================
  // FILTRO Y ORDEN
  // ==========================================================

  const matchesFilters = (task) => {
    if (
      taskFilter.priority !== 'all' &&
      task.priority !== taskFilter.priority
    ) {
      return false;
    }

    if (
      taskFilter.type !== 'all' &&
      task.task_type !== taskFilter.type
    ) {
      return false;
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      const title =
        String(task.title || '').toLowerCase();

      const description =
        String(task.description || '').toLowerCase();

      if (
        !title.includes(search) &&
        !description.includes(search)
      ) {
        return false;
      }
    }

    return true;
  };


  const sortTasks = (list) => {
    return [...list].sort((a, b) => {
      const priorityA =
        PRIORITIES[a.priority]?.order || 99;

      const priorityB =
        PRIORITIES[b.priority]?.order || 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      const dateA = a.due_date || '9999-12-31';

      const dateB = b.due_date || '9999-12-31';

      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }

      const timeA = a.due_time || '99:99';

      const timeB = b.due_time || '99:99';

      return timeA.localeCompare(timeB);
    });
  };


  const isTopLevelTask = (task) =>
    task.parent_task_id === null ||
    task.parent_task_id === undefined ||
    task.parent_task_id === '';


  const visibleOverdue = useMemo(
    () =>
      sortTasks(
        overdueTasks
          .filter(isTopLevelTask)
          .filter(matchesFilters)
      ),
    [
      overdueTasks,
      taskFilter,
      searchTerm,
    ]
  );


  const visibleToday = useMemo(
    () =>
      sortTasks(
        todayTasks
          .filter(isTopLevelTask)
          .filter(matchesFilters)
      ),
    [
      todayTasks,
      taskFilter,
      searchTerm,
    ]
  );


  const visibleUpcoming = useMemo(
    () =>
      sortTasks(
        upcomingTasks
          .filter(isTopLevelTask)
          .filter(matchesFilters)
      ),
    [
      upcomingTasks,
      taskFilter,
      searchTerm,
    ]
  );


  const visibleNoDate = useMemo(
    () =>
      sortTasks(
        noDateTasks
          .filter(isTopLevelTask)
          .filter(matchesFilters)
      ),
    [
      noDateTasks,
      taskFilter,
      searchTerm,
    ]
  );


  const visibleHistory = useMemo(
    () =>
      sortTasks(
        historyTasks
          .filter(isTopLevelTask)
          .filter(matchesFilters)
      ),
    [
      historyTasks,
      taskFilter,
      searchTerm,
    ]
  );


  // ==========================================================
  // COMPLETAR TAREA
  // ==========================================================

  const handleCompleteTask = async (taskId) => {
    const task = tasks.find(
      (item) => item.id === taskId
    );

    if (!task || isCompleted(task)) {
      return;
    }

    // Actualización optimista
    const previousTasks = [...tasks];

    setTasks((prev) =>
      prev.map((item) =>
        item.id === taskId
          ? {
              ...item,
              completed: true,
              status: 'resolved',
              completed_at: new Date().toISOString(),
            }
          : item
      )
    );

    try {
      await taskService.update(taskId, {
        status: 'resolved',
      });


    } catch (error) {
      console.error(
        'Error completando tarea:',
        error
      );

      // Revertir si falla el servidor
      setTasks(previousTasks);

      setShowAlert({
        show: true,
        title: 'Error',
        message:
          'No se pudo completar la tarea.',
        type: 'error',
      });
    }
  };


  // ==========================================================
  // RESTAURAR TAREA
  // ==========================================================

  const handleRestoreTask = async (taskId) => {
    const previousTasks = [...tasks];

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: false,
              status: 'pending',
              completed_at: null,
              resolved_at: null,
            }
          : task
      )
    );

    try {
      await taskService.update(taskId, {
        status: 'pending',
      });

      setShowAlert({
        show: true,
        title: '↩️ Tarea restaurada',
        message: 'La tarea volvió a pendientes.',
        type: 'success',
      });
    } catch (error) {
      console.error(error);

      setTasks(previousTasks);

      setShowAlert({
        show: true,
        title: 'Error',
        message:
          'No se pudo restaurar la tarea.',
        type: 'error',
      });
    }
  };


  // ==========================================================
  // CREAR TAREA
  // ==========================================================

  const openCreatePanel = (parentId = null) => {
    setPanelMode('create');

    setFormTask({
      title: '',
      description: '',
      priority: 'medium',
      task_type: 'administrative',
      due_date: '',
      due_time: '',
      parent_task_id: parentId,
    });

    setActivePicker(null);
    setShowTaskPanel(true);
  };


  const openEditPanel = (task) => {
    setPanelMode('edit');

    setFormTask({
      id: task.id,
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      task_type:
        task.task_type || 'administrative',
      due_date:
        getDateOnly(task.due_date) || '',
      due_time:
        task.due_time || '',
      parent_task_id:
        task.parent_task_id || null,
    });

    setTagDraft('');
    setActivePicker(null);
    setShowTaskPanel(true);
  };


  const closeTaskPanel = () => {
    if (savingTask) return;

    setActivePicker(null);
    setShowTaskPanel(false);
  };



  const handleCreateCustomType = (draft) => {
    const label = draft.label.trim();
    if (!label) return;
    const key = slugifyType(label);
    const palette = TYPE_COLOR_LIBRARY.find((item) => item.key === draft.colorKey) || TYPE_COLOR_LIBRARY[0];
    setCustomTaskTypes((prev) => ({
      ...prev,
      [key]: {
        label,
        iconKey: TYPE_ICON_LIBRARY[draft.iconKey] ? draft.iconKey : 'tag',
        colorKey: palette.key,
        color: palette.color,
        bg: palette.bg,
        custom: true,
      },
    }));
    setShowTypeManager(false);
    setFormTask((prev) => ({ ...prev, task_type: key }));
  };

  const handleDeleteCustomType = (key) => {
    setCustomTaskTypes((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (taskFilter.type === key) {
      setTaskFilter((prev) => ({ ...prev, type: 'all' }));
    }
    if (formTask.task_type === key) {
      setFormTask((prev) => ({ ...prev, task_type: 'administrative' }));
    }
  };

  const handleSaveTask = async () => {
    if (!formTask.title.trim()) {
      setValidationToast({
        show: true,
        id: Date.now(),
      });
      return;
    }

    try {
      setSavingTask(true);

      const payload = {
        title: formTask.title.trim(),
        description:
          formTask.description.trim() || null,
        priority: formTask.priority,
        task_type: formTask.task_type,
        due_date:
          formTask.due_date || null,
        due_time:
          formTask.due_time || null,
        parent_task_id:
          formTask.parent_task_id || null,
      };

      if (panelMode === 'create') {
        const created =
          await taskService.create(payload);


        setTasks((prev) => [
          created,
          ...prev,
        ]);

        setCreatedToast({
          show: true,
          title: created.title,
          id: Date.now(),
        });

        window.dispatchEvent(new CustomEvent('it-support:tasks-changed'));
      } else {
        const updated =
          await taskService.update(
            formTask.id,
            payload
          );


        setTasks((prev) =>
          prev.map((task) =>
            task.id === formTask.id
              ? { ...task, ...updated }
              : task
          )
        );

        window.dispatchEvent(new CustomEvent('it-support:tasks-changed'));

        setShowAlert({
          show: true,
          title: '✅ Tarea actualizada',
          message:
            'Los cambios fueron guardados.',
          type: 'success',
        });
      }

      setShowTaskPanel(false);
    } catch (error) {
      console.error(
        'Error guardando tarea:',
        error
      );

      setShowAlert({
        show: true,
        title: 'Error',
        message:
          'No se pudo guardar la tarea.',
        type: 'error',
      });
    } finally {
      setSavingTask(false);
    }
  };


  // ==========================================================
  // ELIMINAR TAREA
  // ==========================================================

  const confirmDeleteTask = (id) => {
    setDeletingId(id);
    setDeletingType('task');
    setShowConfirm(true);
  };


  const handleDeleteTask = async (id) => {
    try {
      await taskService.delete(id);

      setTasks((prev) =>
        prev.filter(
          (task) =>
            task.id !== id &&
            task.parent_task_id !== id
        )
      );

      setShowAlert({
        show: true,
        title: '🗑️ Tarea eliminada',
        message:
          'La tarea fue eliminada correctamente.',
        type: 'info',
      });
    } catch (error) {
      console.error(error);

      setShowAlert({
        show: true,
        title: 'Error',
        message:
          'No se pudo eliminar la tarea.',
        type: 'error',
      });
    }
  };


  // ==========================================================
  // CONFIRMACIÓN GENERAL
  // ==========================================================

  const handleRestoreDeletedTask = async (taskId) => {
    try {
      await taskService.restore(taskId);
      await loadTaskTrash();
      await loadTasks();
      setShowAlert({ show: true, title: '↩️ Tarea restaurada', message: 'La tarea volvió a la lista de tareas.', type: 'success' });
    } catch (error) {
      console.error('Error restaurando tarea eliminada:', error);
      setShowAlert({ show: true, title: 'Error', message: 'No se pudo restaurar la tarea.', type: 'error' });
    }
  };

  const handlePermanentDeleteTask = async (taskId) => {
    try {
      await taskService.permanentDelete(taskId);
      setDeletedTasks((prev) => prev.filter((task) => task.id !== taskId));
      setShowAlert({ show: true, title: '🗑️ Tarea eliminada definitivamente', message: 'La tarea fue eliminada de forma permanente.', type: 'info' });
    } catch (error) {
      console.error('Error eliminando tarea permanentemente:', error);
      setShowAlert({ show: true, title: 'Error', message: 'No se pudo eliminar la tarea permanentemente.', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingType === 'task' && deletingId) await handleDeleteTask(deletingId);
    if (deletingType === 'ticket' && deletingId) handleDeleteTicket(deletingId);
    if (deletingType === 'task_permanent' && deletingId) await handlePermanentDeleteTask(deletingId);
    if (deletingType === 'ticket_permanent' && deletingId) setDeletedTickets((prev) => prev.filter((ticket) => ticket.id !== deletingId));
    if (deletingType === 'all_permanent') {
      await Promise.all(deletedTasks.map((task) => taskService.permanentDelete(task.id)));
      setDeletedTasks([]);
      setDeletedTickets([]);
      setShowAlert({ show: true, title: '🗑️ Papelera vaciada', message: 'Las tareas y tickets fueron eliminados permanentemente.', type: 'info' });
    }
    setShowConfirm(false);
    setDeletingId(null);
    setDeletingType(null);
  };

  // ==========================================================
  // SUBTAREAS
  // ==========================================================

  const toggleExpanded = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };


  // ==========================================================
  // TICKETS
  // ==========================================================

  const handleCompleteTicket = (ticketId) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: 'completed',
            }
          : ticket
      )
    );

    setShowAlert({
      show: true,
      title: '✅ Ticket completado',
      message: 'El ticket se marcó como resuelto.',
      type: 'success',
    });
  };


  const handleAddTicket = () => {
    // Se mantiene la función existente
    // para no romper el módulo de tickets.
  };


  const handleDeleteTicket = (ticketId) => {
    const ticket = tickets.find(
      (item) => item.id === ticketId
    );

    if (!ticket) return;

    setTickets((prev) =>
      prev.filter(
        (item) => item.id !== ticketId
      )
    );

    setDeletedTickets((prev) => [
      ...prev,
      {
        ...ticket,
        deletedAt:
          new Date().toISOString(),
      },
    ]);

    setShowAlert({
      show: true,
      title: '🗑️ Movido a papelera',
      message: 'Ticket eliminado.',
      type: 'info',
    });
  };


  const handleRestoreTicket = (ticket) => {
    setDeletedTickets((prev) =>
      prev.filter(
        (item) => item.id !== ticket.id
      )
    );

    setTickets((prev) => [
      ...prev,
      {
        ...ticket,
        status: 'pending',
        deletedAt: null,
      },
    ]);
  };


  const filteredTickets = tickets.filter(
    (ticket) => {
      if (
        ticketFilter.status === 'open' &&
        ticket.status === 'completed'
      ) {
        return false;
      }

      if (
        ticketFilter.status !== 'all' &&
        ticketFilter.status !== 'open' &&
        ticket.status !== ticketFilter.status
      ) {
        return false;
      }

      if (
        searchTerm &&
        !ticket.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      return true;
    }
  );


  const openTasksView = (view = 'active') => {
    setActiveTab('tasks');
    setTaskView(view);
    setSearchTerm('');
    setTaskFilter({
      priority: 'all',
      type: 'all',
    });
    setShowNoDate(false);
  };

  const openTicketsView = () => {
    setActiveTab('tickets');
    setSearchTerm('');
    setTicketFilter({
      status: 'open',
    });
  };


  // ==========================================================
  // ESTADÍSTICAS
  // ==========================================================

  const pendingTickets = tickets.filter(
    (ticket) =>
      ticket.status !== 'completed'
  ).length;


  const urgentTickets = tickets.filter(
    (ticket) =>
      ticket.priority === 'critical' &&
      ticket.status !== 'completed'
  ).length;


  const slaAdherence =
    tasks.length > 0
      ? Math.round(
          (tasks.filter(isCompleted).length /
            tasks.length) *
            100
        )
      : 100;


  // ==========================================================
  // NOTIFICACIONES
  // ==========================================================
  // Se arman a partir de datos reales (tareas vencidas, tareas de
  // hoy y tickets críticos), no de datos simulados.

  const notifications = useMemo(() => {
    const items = [];

    overdueTasks.forEach((task) => {
      items.push({
        id: `overdue-${task.id}`,
        type: 'overdue',
        title: task.title,
        subtitle: 'Tarea vencida',
        onClick: () => {
          openTasksView('overdue');
          setShowNotifications(false);
        },
      });
    });

    todayTasks.forEach((task) => {
      items.push({
        id: `today-${task.id}`,
        type: 'today',
        title: task.title,
        subtitle: task.due_time
          ? `Vence hoy a las ${task.due_time}`
          : 'Vence hoy',
        onClick: () => {
          openTasksView('active');
          setShowNotifications(false);
        },
      });
    });

    tickets
      .filter(
        (ticket) =>
          ticket.priority === 'critical' &&
          ticket.status !== 'completed'
      )
      .forEach((ticket) => {
        items.push({
          id: `ticket-${ticket.id}`,
          type: 'ticket',
          title: ticket.title,
          subtitle: 'Ticket crítico pendiente',
          onClick: () => {
            openTicketsView();
            setShowNotifications(false);
          },
        });
      });

    return items;
  }, [overdueTasks, todayTasks, tickets]);


  // ==========================================================
  // COMPONENTE TAREA
  // ==========================================================

  const renderTaskRow = ({
    task,
    nested = false,
  }) => {
    const completed = isCompleted(task);

    const priority =
      PRIORITIES[task.priority] ||
      PRIORITIES.medium;

    const type =
      allTaskTypes[task.task_type] ||
      TASK_TYPES.administrative;

    const PriorityIcon = priority.icon;

    const TypeIcon = type.icon;

    const subtasks =
      subtasksByParent[task.id] || [];

    const completedSubtasks =
      subtasks.filter(isCompleted).length;

    const hasSubtasks =
      subtasks.length > 0;

    const expanded =
      expandedTasks[task.id];

    return (
      <div
        className={`
          group
          ${nested ? 'ml-8' : ''}
          transition-all duration-300
          ${completed ? 'opacity-60' : ''}
        `}
      >
        <div
          className={`
            flex items-center gap-3
            py-3 px-3
            rounded-xl
            transition-all
            ${
              darkMode
                ? 'hover:bg-gray-800'
                : 'hover:bg-gray-50'
            }
          `}
        >
          {/* SUBTASK EXPAND */}
          <div className="w-5 flex-shrink-0">
            {hasSubtasks && (
              <button
                onClick={() =>
                  toggleExpanded(task.id)
                }
                className={`
                  p-0.5 rounded
                  ${
                    darkMode
                      ? 'text-gray-500 hover:text-gray-300'
                      : 'text-gray-400 hover:text-gray-700'
                  }
                `}
              >
                {expanded ? (
                  <ChevronDown size={15} />
                ) : (
                  <ChevronRight size={15} />
                )}
              </button>
            )}
          </div>

          {/* CHECK */}
          <TaskCompletionButton
            completed={completed}
            darkMode={darkMode}
            size={23}
            onClick={() =>
              completed
                ? handleRestoreTask(task.id)
                : handleCompleteTask(task.id)
            }
          />

          {/* TASK */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() =>
              openEditPanel(task)
            }
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`
                  text-sm font-medium
                  transition-all
                  ${
                    completed
                      ? 'line-through text-gray-400'
                      : darkMode
                      ? 'text-gray-100'
                      : 'text-gray-800'
                  }
                `}
              >
                {task.title}
              </span>

              {/* PRIORITY */}
              <span
                className={`
                  inline-flex items-center gap-1
                  px-1.5 py-0.5
                  rounded-md
                  text-[10px]
                  font-medium
                  ${priority.bg}
                  ${priority.color}
                `}
              >
                <PriorityIcon size={10} />
                {priority.label}
              </span>

              {/* TYPE */}
              <span
                className={`
                  inline-flex items-center gap-1
                  px-1.5 py-0.5
                  rounded-md
                  text-[10px]
                  font-medium
                  ${type.bg}
                  ${type.color}
                `}
              >
                <TypeIcon size={10} />
                {type.label}
              </span>
            </div>

            {task.description && (
              <p
                className={`
                  text-xs mt-1 truncate
                  ${
                    completed
                      ? 'text-gray-400'
                      : darkMode
                      ? 'text-gray-500'
                      : 'text-gray-500'
                  }
                `}
              >
                {task.description}
              </p>
            )}


            <div className="flex items-center gap-3 mt-1.5">
              {task.due_date && (
                <span
                  className={`
                    flex items-center gap-1
                    text-[11px]
                    ${
                      isOverdue(task)
                        ? 'text-red-500'
                        : darkMode
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }
                  `}
                >
                  <Calendar size={11} />
                  {formatDate(task.due_date)}
                </span>
              )}

              {task.due_time && (
                <span
                  className={`
                    flex items-center gap-1
                    text-[11px]
                    ${
                      darkMode
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }
                  `}
                >
                  <Clock size={11} />
                  {task.due_time}
                </span>
              )}

              {hasSubtasks && (
                <span
                  className={`
                    text-[11px]
                    ${
                      darkMode
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }
                  `}
                >
                  {completedSubtasks}/
                  {subtasks.length} subtareas
                </span>
              )}

              {completed &&
                (task.completed_at ||
                  task.resolved_at) && (
                  <span className="text-[11px] text-emerald-500">
                    Completada{' '}
                    {formatDateTime(
                      task.completed_at ||
                        task.resolved_at
                    )}
                  </span>
                )}
            </div>
          </div>

          {/* ACCIONES */}
          <div
            className={`
              flex items-center gap-1
              opacity-0
              group-hover:opacity-100
              transition-opacity
            `}
          >
            {!completed && (
              <button
                onClick={() =>
                  openCreatePanel(task.id)
                }
                className={`
                  p-1.5 rounded-lg
                  ${
                    darkMode
                      ? 'text-gray-500 hover:text-indigo-400 hover:bg-gray-700'
                      : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'
                  }
                `}
                title="Agregar subtarea"
              >
                <Plus size={15} />
              </button>
            )}

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openEditPanel(task);
              }}
              className={`
                p-1.5 rounded-lg
                ${
                  darkMode
                    ? 'text-gray-500 hover:text-indigo-400 hover:bg-gray-700'
                    : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'
                }
              `}
              title="Editar"
            >
              <Edit3 size={15} />
            </button>

            <button
              onClick={() =>
                confirmDeleteTask(task.id)
              }
              className={`
                p-1.5 rounded-lg
                ${
                  darkMode
                    ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/20'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }
              `}
              title="Eliminar"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* SUBTASKS */}
        {expanded && hasSubtasks && (
          <div className="mt-1">
            {subtasks.map((subtask) => (
              <Fragment key={subtask.id}>{renderTaskRow({ task: subtask, nested: true })}</Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };


  // ==========================================================
  // SECCIÓN DE TAREAS
  // ==========================================================

  const renderTaskSection = ({
    title,
    tasks: sectionTasks,
    icon,
    iconColor,
    emptyText,
  }) => {
    if (!sectionTasks.length) {
      return null;
    }

    const Icon = icon;

    return (
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-2 px-2">
          <Icon
            size={16}
            className={iconColor}
          />

          <h3
            className={`
              text-xs
              font-semibold
              uppercase
              tracking-wider
              ${
                darkMode
                  ? 'text-gray-400'
                  : 'text-gray-500'
              }
            `}
          >
            {title}
          </h3>

          <span
            className={`
              text-[11px]
              ${
                darkMode
                  ? 'text-gray-600'
                  : 'text-gray-400'
              }
            `}
          >
            {sectionTasks.length}
          </span>
        </div>

        <div
          className={`
            rounded-xl
            ${
              darkMode
                ? 'bg-gray-800/40'
                : 'bg-white'
            }
          `}
        >
          {sectionTasks.map((task) => (
            <Fragment key={task.id}>{renderTaskRow({ task })}</Fragment>
          ))}
        </div>
      </div>
    );
  };


  // ==========================================================
  // TABS
  // ==========================================================

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      id: 'tasks',
      label: 'Tareas',
      icon: CheckCircle2,
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: MessageSquare,
    },
    {
      id: 'trash',
      label: 'Papelera',
      icon: Trash,
    },
  ];


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className={`
        relative min-h-screen overflow-x-hidden
        transition-colors duration-300
        ${
          darkMode
            ? 'bg-[#070b14]'
            : 'bg-[#f6f8fc]'
        }
      `}
    >
      {/* ======================================================
          AURA BACKGROUND
      ====================================================== */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className={`
            absolute -top-32 left-[8%] h-72 w-72 rounded-full
            blur-3xl opacity-20
            ${
              darkMode
                ? 'bg-indigo-600'
                : 'bg-indigo-300'
            }
          `}
        />

        <div
          className={`
            absolute top-[18%] right-[6%] h-80 w-80 rounded-full
            blur-3xl opacity-15
            ${
              darkMode
                ? 'bg-cyan-500'
                : 'bg-cyan-200'
            }
          `}
        />

        <div
          className={`
            absolute bottom-[8%] left-[38%] h-72 w-72 rounded-full
            blur-3xl opacity-15
            ${
              darkMode
                ? 'bg-violet-600'
                : 'bg-violet-200'
            }
          `}
        />

        <div
          className={`
            absolute inset-0
            ${
              darkMode
                ? 'bg-[radial-gradient(circle_at_50%_20%,rgba(99,102,241,0.10),transparent_42%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.06),transparent_36%)]'
                : 'bg-[radial-gradient(circle_at_50%_20%,rgba(99,102,241,0.06),transparent_42%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.04),transparent_36%)]'
            }
          `}
        />
      </div>

      <div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className={`
          sticky top-0 z-30
          border-b
          backdrop-blur-xl
          ${
            darkMode
              ? 'bg-gray-950/90 border-gray-800'
              : 'bg-white/90 border-gray-200'
          }
        `}
      >
        <div className="px-5 py-2.5">
          <div className="grid grid-cols-[minmax(220px,1fr)_auto_minmax(120px,1fr)] items-center gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                darkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'
              }`}>
                <CheckCircle2 size={18} className="text-indigo-400" />
              </div>
              <div className="min-w-0 leading-tight">
                <h1 className={`text-base font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tareas
                </h1>
                <p className={`mt-0.5 text-[10px] truncate ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Gestión de tareas y tickets
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white'
                        : darkMode
                        ? 'text-gray-500 hover:text-gray-200 hover:bg-gray-800'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                  darkMode ? 'bg-gray-800' : 'bg-amber-50'
                }`}
                title="Tareas completadas"
              >
                <Trophy size={14} className="text-amber-500" />
                <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {completedTasksCount}
                </span>
                <span className="text-[10px] text-gray-500">completadas</span>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className={`relative flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                    darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Bell size={15} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications &&
                  createPortal(
                    <>
                      <div
                        className="fixed inset-0 z-[1150]"
                        onMouseDown={() => setShowNotifications(false)}
                      />
                      <div
                        className={`fixed right-6 top-[64px] z-[1160] w-80 max-h-[70vh] overflow-y-auto rounded-2xl border shadow-2xl backdrop-blur-xl ${AURA.surface(
                          darkMode
                        )} ${AURA.enter}`}
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        <div
                          className={`flex items-center justify-between px-4 py-3 border-b ${
                            darkMode ? 'border-gray-800' : 'border-gray-100'
                          }`}
                        >
                          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Notificaciones
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowNotifications(false)}
                            className={darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-8 px-4">
                            <CheckCircle2 size={22} className="text-emerald-400" />
                            <p className="text-xs text-gray-500 text-center">
                              No tienes notificaciones pendientes.
                            </p>
                          </div>
                        ) : (
                          <div className="p-2">
                            {notifications.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={item.onClick}
                                className={`w-full flex items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                }`}
                              >
                                {item.type === 'overdue' && (
                                  <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
                                )}
                                {item.type === 'today' && (
                                  <Clock size={15} className="mt-0.5 shrink-0 text-cyan-400" />
                                )}
                                {item.type === 'ticket' && (
                                  <Ticket size={15} className="mt-0.5 shrink-0 text-amber-400" />
                                )}
                                <div className="min-w-0">
                                  <p className={`truncate text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    {item.title}
                                  </p>
                                  <p className="text-[10px] text-gray-500 mt-0.5">{item.subtitle}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>,
                    document.body
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ======================================================
          CONTENIDO
      ====================================================== */}

      <div className="max-w-6xl mx-auto px-6 py-7">


        {/* ====================================================
            DASHBOARD
        ==================================================== */}

        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            {/* HERO */}
            <div className={`relative overflow-hidden rounded-3xl border p-6 md:p-7 ${
              darkMode
                ? 'border-indigo-500/20 bg-gradient-to-br from-[#111827] via-[#101827] to-[#0b1020]'
                : 'border-indigo-100 bg-gradient-to-br from-white via-indigo-50/50 to-slate-50'
            }`}>
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <BarChart3 size={18} className="text-indigo-400" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-400">Centro de mando</span>
                  </div>
                  <h2 className={`text-2xl md:text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Resumen operativo
                  </h2>
                  <p className="mt-1.5 text-sm text-gray-500 max-w-xl">
                    Una vista rápida de tu carga de trabajo, prioridades y actividad de soporte.
                  </p>
                </div>

                <div className={`min-w-[210px] rounded-2xl border px-4 py-3 ${
                  darkMode ? 'border-gray-800 bg-gray-950/40' : 'border-gray-200 bg-white/80'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Rendimiento global</span>
                    <span className="text-sm font-bold text-indigo-400">{slaAdherence}%</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${slaAdherence}%` }} />
                  </div>
                  <p className="mt-2 text-[10px] text-gray-500">Tareas completadas sobre el total registrado</p>
                </div>
              </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {[
                { label: 'Tareas activas', value: pendingTasks.length, sub: `${todayTasks.length} para hoy`, icon: Inbox, tone: 'indigo', action: () => openTasksView('active') },
                { label: 'Completadas', value: historyTasks.length, sub: `${completedToday} hoy`, icon: CheckCircle2, tone: 'emerald', action: () => openTasksView('history') },
                { label: 'Vencidas', value: overdueTasks.length, sub: overdueTasks.length ? 'Requieren atención' : 'Todo al día', icon: AlertCircle, tone: 'red', action: () => openTasksView('overdue') },
                { label: 'Tickets abiertos', value: pendingTickets, sub: `${urgentTickets} críticos`, icon: Ticket, tone: 'amber', action: openTicketsView },
              ].map((item) => {
                const Icon = item.icon;
                const tones = {
                  indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/15',
                  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15',
                  red: 'text-red-400 bg-red-500/10 border-red-500/15',
                  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/15',
                };
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      darkMode ? 'border-gray-800 bg-gray-900/70 hover:border-gray-700' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium text-gray-500">{item.label}</p>
                        <p className={`mt-1 text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                        <p className="mt-1 text-[10px] text-gray-500">{item.sub}</p>
                      </div>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${tones[item.tone]}`}>
                        <Icon size={17} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_.9fr] gap-5">
              {/* TODAY */}
              <div className={`rounded-2xl border p-5 ${darkMode ? 'border-gray-800 bg-gray-900/70' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar size={17} className="text-indigo-400" />
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Carga de hoy</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Lo que queda pendiente durante el día</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-400">{dailyProgress}%</span>
                </div>

                <div className={`h-2 rounded-full overflow-hidden mb-5 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${dailyProgress}%` }} />
                </div>

                {todayTasks.length === 0 ? (
                  <div className={`rounded-xl border border-dashed py-9 text-center ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <CheckCircle2 size={25} className="mx-auto mb-2 text-emerald-500/70" />
                    <p className="text-sm font-medium text-gray-500">No hay tareas pendientes para hoy</p>
                    <p className="text-[11px] text-gray-600 mt-1">Buen momento para adelantarte a lo siguiente.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayTasks.slice(0, 5).map((task) => {
                      const priority = PRIORITIES[task.priority] || PRIORITIES.medium;
                      const TypeIcon = (allTaskTypes[task.task_type] || TASK_TYPES.maintenance).icon;
                      return (
                        <div key={task.id} className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${darkMode ? 'border-gray-800 bg-gray-950/30' : 'border-gray-100 bg-gray-50/70'}`}>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${priority.bg}`}>
                            <TypeIcon size={14} className={priority.color} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] ${priority.color}`}>{priority.label}</span>
                              {task.due_time && <><span className="text-gray-700">•</span><span className="text-[10px] text-gray-500">{task.due_time}</span></>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {todayTasks.length > 5 && <p className="text-[10px] text-gray-500 text-center pt-1">+ {todayTasks.length - 5} tareas más</p>}
                  </div>
                )}
              </div>

              {/* PRIORITIES */}
              <div className={`rounded-2xl border p-5 ${darkMode ? 'border-gray-800 bg-gray-900/70' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center gap-2 mb-5">
                  <AlertCircle size={17} className="text-amber-400" />
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Prioridades</h3>
                    <p className="text-xs text-gray-500 mt-1">Distribución de tareas activas</p>
                  </div>
                </div>

                {[
                  { key: 'high', label: 'Alta', icon: ArrowUp, color: 'text-red-400', bar: 'bg-red-500' },
                  { key: 'medium', label: 'Media', icon: Minus, color: 'text-amber-400', bar: 'bg-amber-500' },
                  { key: 'low', label: 'Baja', icon: ArrowDown, color: 'text-emerald-400', bar: 'bg-emerald-500' },
                ].map((item) => {
                  const count = pendingTasks.filter((task) => task.priority === item.key).length;
                  const percent = pendingTasks.length ? Math.round((count / pendingTasks.length) * 100) : 0;
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${item.color}`}><Icon size={13} />{item.label}</span>
                        <span className="text-xs text-gray-500">{count}</span>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className={`h-full rounded-full ${item.bar} transition-all duration-500`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}

                <div className={`mt-5 pt-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Racha actual</span>
                    <span className="flex items-center gap-1 text-sm font-bold text-orange-400"><Flame size={14} />{streak} días</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_.9fr] gap-5">
              {/* WEEK */}
              <div className={`rounded-2xl border p-5 ${darkMode ? 'border-gray-800 bg-gray-900/70' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 size={17} className="text-indigo-400" />
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Actividad semanal</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Tareas completadas por día</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400">7 días</span>
                </div>
                <div className="flex items-end gap-2.5 h-36">
                  {weeklyActivity.map((day, index) => {
                    const max = Math.max(...weeklyActivity.map((d) => d.count), 1);
                    const isPeak = day.count === max && day.count > 0;
                    return (
                      <div key={day.dateKey} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                        <span className={`text-[10px] font-medium ${isPeak ? 'text-indigo-400' : 'text-gray-600'}`}>{day.count}</span>
                        <div className={`w-full max-w-10 rounded-t-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} style={{ height: `${Math.max(4, (day.count / max) * 92)}px` }}>
                          <div className="h-full w-full bg-indigo-500 rounded-t-lg transition-all duration-500" />
                        </div>
                        <span className="text-[10px] text-gray-500">{day.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ATTENTION */}
              <div className={`rounded-2xl border p-5 ${darkMode ? 'border-gray-800 bg-gray-900/70' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Bell size={17} className="text-cyan-400" />
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Requiere atención</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Lo más importante ahora</p>
                  </div>
                </div>

                {overdueTasks.length === 0 && urgentTickets === 0 ? (
                  <div className="flex items-center gap-3 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/10">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Todo bajo control</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">No hay incidencias críticas pendientes.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {overdueTasks.slice(0, 3).map((task) => (
                      <div key={`overdue-${task.id}`} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${darkMode ? 'bg-red-500/5' : 'bg-red-50'}`}>
                        <AlertCircle size={15} className="shrink-0 text-red-400" />
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{task.title}</p>
                          <p className="text-[10px] text-red-400 mt-0.5">Tarea vencida</p>
                        </div>
                      </div>
                    ))}
                    {urgentTickets > 0 && (
                      <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${darkMode ? 'bg-amber-500/5' : 'bg-amber-50'}`}>
                        <Ticket size={15} className="shrink-0 text-amber-400" />
                        <div>
                          <p className={`text-xs font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{urgentTickets} ticket{urgentTickets === 1 ? '' : 's'} crítico{urgentTickets === 1 ? '' : 's'}</p>
                          <p className="text-[10px] text-amber-400 mt-0.5">Pendiente{urgentTickets === 1 ? '' : 's'} de atención</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            TAREAS
        ==================================================== */}

        {activeTab === 'tasks' && (
          <div>

            {/* HEADER TAREAS */}

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">

              <div>
                <h2
                  className={`
                    text-2xl
                    font-bold
                    ${
                      darkMode
                        ? 'text-white'
                        : 'text-gray-900'
                    }
                  `}
                >
                  Mis tareas
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Organiza tu trabajo de soporte IT
                </p>
              </div>


              <div className="flex flex-wrap items-center gap-2">

                {/* SEARCH */}

                <div className="relative">

                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Buscar tareas..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                    className={`
                      pl-9 pr-3 py-1.5
                      rounded-lg
                      border
                      text-xs
                      w-48
                      focus:outline-none
                      focus:ring-2
                      focus:ring-indigo-500
                      ${
                        darkMode
                          ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-600'
                          : 'bg-white border-gray-200 text-gray-900'
                      }
                    `}
                  />

                </div>


                {/* FILTROS */}

                <TaskFilterDropdown
                  value={taskFilter.priority}
                  darkMode={darkMode}
                  width="w-36"
                  menuTitle="Prioridad"
                  icon={Filter}
                  isOpen={openFilter === 'priority'}
                  onOpenChange={(open) => setOpenFilter(open ? 'priority' : null)}
                  onChange={(value) => setTaskFilter((prev) => ({ ...prev, priority: value }))}
                  options={[
                    { value: 'all', label: 'Todos', icon: Filter },
                    { value: 'high', label: 'Alta', icon: ArrowUp, color: 'text-red-500' },
                    { value: 'medium', label: 'Media', icon: Minus, color: 'text-amber-500' },
                    { value: 'low', label: 'Baja', icon: ArrowDown, color: 'text-emerald-500' },
                  ]}
                />

                <TaskFilterDropdown
                  value={taskFilter.type}
                  darkMode={darkMode}
                  width="w-48"
                  menuTitle="Tipo de tarea"
                  icon={Filter}
                  isOpen={openFilter === 'type'}
                  onOpenChange={(open) => setOpenFilter(open ? 'type' : null)}
                  onChange={(value) => setTaskFilter((prev) => ({ ...prev, type: value }))}
                  onManage={() => {
                    setOpenFilter(null);
                    setShowTypeManager(true);
                  }}
                  options={[
                    { value: 'all', label: 'Todos los tipos', icon: Filter },
                    ...Object.entries(allTaskTypes).map(([key, type]) => ({
                      value: key,
                      label: type.label,
                      icon: type.icon,
                      color: type.color,
                    })),
                  ]}
                />

                <button
                  type="button"
                  onClick={() => openTasksView(taskView === 'history' ? 'active' : 'history')}
                  className={`
                    flex items-center gap-2
                    px-3 py-1.5
                    rounded-lg
                    border
                    text-sm
                    font-medium
                    transition-colors
                    ${
                      taskView === 'history'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500'
                        : darkMode
                        ? 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <History size={15} />
                  Tareas completadas
                  <span className="text-[10px] opacity-70">
                    {historyTasks.length}
                  </span>
                </button>

                {/* NUEVA */}

                <button
                  onClick={() =>
                    openCreatePanel()
                  }
                  className="
                    flex items-center gap-2
                    px-3 py-1.5
                    rounded-lg
                    bg-indigo-600
                    hover:bg-indigo-700
                    text-white
                    text-sm
                    font-medium
                    transition-colors
                  "
                >
                  <Plus size={15} />
                  Nueva tarea
                </button>

              </div>

            </div>


            {/* PROGRESO COMPACTO */}

            <div
              className={`
                mb-7
                ${
                  darkMode
                    ? 'bg-gray-900'
                    : 'bg-white'
                }
                rounded-xl
                border
                ${
                  darkMode
                    ? 'border-gray-800'
                    : 'border-gray-200'
                }
                px-4 py-3
              `}
            >

              <div className="flex items-center justify-between mb-2">

                <div className="flex items-center gap-2">

                  <TargetIcon
                    size={15}
                    className="text-indigo-500"
                  />

                  <span
                    className={`
                      text-xs
                      font-medium
                      ${
                        darkMode
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }
                    `}
                  >
                    Progreso de hoy
                  </span>

                </div>

                <span className="text-xs font-semibold text-indigo-500">
                  {completedToday}/{todayTotal}
                </span>

              </div>

              <div
                className={`
                  h-1.5
                  rounded-full
                  overflow-hidden
                  ${
                    darkMode
                      ? 'bg-gray-800'
                      : 'bg-gray-100'
                  }
                `}
              >
                <div
                  className="
                    h-full
                    bg-indigo-500
                    rounded-full
                    transition-all duration-500
                  "
                  style={{
                    width: `${dailyProgress}%`,
                  }}
                />
              </div>

            </div>


            {/* ESTADOS */}

            {loadingTasks ? (
              <div
                className={`
                  flex flex-col
                  items-center
                  justify-center
                  py-20
                  ${
                    darkMode
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  }
                `}
              >
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />

                <p className="text-sm">
                  Cargando tareas...
                </p>
              </div>
            ) : taskError ? (
              <div
                className={`
                  rounded-xl
                  border
                  p-6
                  text-center
                  ${
                    darkMode
                      ? 'bg-red-900/10 border-red-900/30'
                      : 'bg-red-50 border-red-100'
                  }
                `}
              >
                <AlertCircle
                  size={28}
                  className="mx-auto text-red-500 mb-2"
                />

                <p className="text-sm text-red-500">
                  {taskError}
                </p>

                <button
                  onClick={loadTasks}
                  className="mt-3 text-sm text-indigo-500 hover:text-indigo-600"
                >
                  Intentar nuevamente
                </button>
              </div>
            ) : taskView === 'history' ? (
              <div className="mt-2">
                <div className="flex items-end justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Tareas completadas
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Historial de tareas finalizadas, ordenado según tus filtros actuales.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openTasksView('active')}
                    className={`text-xs font-medium transition-colors ${
                      darkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Volver a tareas activas
                  </button>
                </div>

                {visibleHistory.length === 0 ? (
                  <div className={`text-center py-20 ${
                    darkMode ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    <CheckCircle2 size={42} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      No hay tareas completadas.
                    </p>
                  </div>
                ) : (
                  <div className={`rounded-xl ${
                    darkMode ? 'bg-gray-800/40' : 'bg-white'
                  }`}>
                    {visibleHistory.map((task) => (
                      <Fragment key={task.id}>{renderTaskRow({ task })}</Fragment>
                    ))}
                  </div>
                )}
              </div>
            ) : taskView === 'overdue' ? (
              <div className="mt-2">
                <div className="flex items-end justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertCircle size={18} className="text-red-500" />
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Tareas vencidas
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Estas tareas requieren atención porque su fecha límite ya pasó.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openTasksView('active')}
                    className={`text-xs font-medium transition-colors ${
                      darkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Ver todas las tareas
                  </button>
                </div>

                {visibleOverdue.length === 0 ? (
                  <div className={`text-center py-20 ${
                    darkMode ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    <CheckCircle2 size={42} className="mx-auto mb-3 opacity-50 text-emerald-500" />
                    <p className="text-sm">
                      No tienes tareas vencidas.
                    </p>
                  </div>
                ) : (
                  <div className={`rounded-xl ${
                    darkMode ? 'bg-gray-800/40' : 'bg-white'
                  }`}>
                    {visibleOverdue.map((task) => (
                      <Fragment key={task.id}>{renderTaskRow({ task })}</Fragment>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>

                {renderTaskSection({
                  title: 'Vencidas',
                  tasks: visibleOverdue,
                  icon: AlertCircle,
                  iconColor: 'text-red-500',
                })}

                {renderTaskSection({
                  title: 'Hoy',
                  tasks: visibleToday,
                  icon: Calendar,
                  iconColor: 'text-indigo-500',
                })}

                {renderTaskSection({
                  title: 'Próximas',
                  tasks: visibleUpcoming,
                  icon: Clock,
                  iconColor: 'text-gray-400',
                })}

                {visibleNoDate.length > 0 && (
                  <div className="mb-7">

                    <button
                      onClick={() =>
                        setShowNoDate(
                          (prev) => !prev
                        )
                      }
                      className={`
                        flex items-center gap-2
                        px-2 mb-2
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        ${
                          darkMode
                            ? 'text-gray-500 hover:text-gray-300'
                            : 'text-gray-500 hover:text-gray-700'
                        }
                      `}
                    >
                      {showNoDate ? (
                        <ChevronDown size={15} />
                      ) : (
                        <ChevronRight size={15} />
                      )}

                      Sin fecha

                      <span className="text-gray-400">
                        {visibleNoDate.length}
                      </span>
                    </button>

                    {showNoDate && (
                      <div
                        className={`
                          rounded-xl
                          ${
                            darkMode
                              ? 'bg-gray-800/40'
                              : 'bg-white'
                          }
                        `}
                      >
                        {visibleNoDate.map(
                          (task) => (
                            <Fragment key={task.id}>{renderTaskRow({ task })}</Fragment>
                          )
                        )}
                      </div>
                    )}

                  </div>
                )}


                {visibleOverdue.length === 0 &&
                  visibleToday.length === 0 &&
                  visibleUpcoming.length === 0 &&
                  visibleNoDate.length === 0 && (
                    <div
                      className={`
                        text-center
                        py-20
                        ${
                          darkMode
                            ? 'text-gray-600'
                            : 'text-gray-400'
                        }
                      `}
                    >
                      <Inbox
                        size={42}
                        className="mx-auto mb-3 opacity-50"
                      />

                      <p className="text-sm">
                        No hay tareas pendientes.
                      </p>

                      <button
                        onClick={() =>
                          openCreatePanel()
                        }
                        className="mt-3 text-sm text-indigo-500 hover:text-indigo-600"
                      >
                        Crear una tarea
                      </button>
                    </div>
                  )}

              </>
            )}

          </div>
        )}


        {/* ====================================================
            TICKETS
        ==================================================== */}

        {activeTab === 'tickets' && (
          <div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

              <div>
                <h2
                  className={`
                    text-2xl font-bold
                    ${
                      darkMode
                        ? 'text-white'
                        : 'text-gray-900'
                    }
                  `}
                >
                  Tickets
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Gestión rápida de solicitudes
                </p>
              </div>

              <div className="flex gap-2">

                <div className="relative">

                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                    className={`
                      pl-9 pr-3 py-2
                      rounded-lg
                      border
                      text-sm
                      ${
                        darkMode
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-white border-gray-200'
                      }
                    `}
                  />

                </div>

                <select
                  value={ticketFilter.status}
                  onChange={(e) =>
                    setTicketFilter({
                      status:
                        e.target.value,
                    })
                  }
                  className={`
                    px-3 py-2
                    rounded-lg
                    border
                    text-sm
                    ${
                      darkMode
                        ? 'bg-gray-900 border-gray-700 text-gray-300'
                        : 'bg-white border-gray-200 text-gray-600'
                    }
                  `}
                >
                  <option value="all">
                    Todos
                  </option>

                  <option value="open">
                    Abiertos
                  </option>

                  <option value="pending">
                    Pendientes
                  </option>

                  <option value="in_progress">
                    En proceso
                  </option>

                  <option value="completed">
                    Completados
                  </option>
                </select>

              </div>

            </div>


            {filteredTickets.length === 0 ? (
              <div
                className={`
                  text-center
                  py-20
                  ${
                    darkMode
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }
                `}
              >
                <MessageSquare
                  size={42}
                  className="mx-auto mb-3 opacity-50"
                />

                <p className="text-sm">
                  No hay tickets.
                </p>
              </div>
            ) : (
              <div className="space-y-2">

                {filteredTickets.map(
                  (ticket) => (
                    <div
                      key={ticket.id}
                      className={`
                        group
                        flex items-center gap-4
                        p-4
                        rounded-xl
                        border
                        ${
                          darkMode
                            ? 'bg-gray-900 border-gray-800 hover:border-gray-700'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center gap-2">

                          <span className="text-xs text-gray-400 font-mono">
                            #{ticket.id}
                          </span>

                          <h3
                            className={`
                              text-sm font-medium truncate
                              ${
                                darkMode
                                  ? 'text-white'
                                  : 'text-gray-800'
                              }
                            `}
                          >
                            {ticket.title}
                          </h3>

                        </div>

                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {ticket.description}
                        </p>

                        <div className="flex items-center gap-3 mt-2">

                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <User size={11} />
                            {ticket.requestedBy}
                          </span>

                          <span className="text-xs text-gray-400">
                            {formatDateTime(
                              ticket.date
                            )}
                          </span>

                        </div>

                      </div>


                      <span
                        className={`
                          text-[10px]
                          px-2 py-1
                          rounded-md
                          ${
                            ticket.status ===
                            'completed'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                              : ticket.status ===
                                'in_progress'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                          }
                        `}
                      >
                        {ticket.status ===
                        'completed'
                          ? 'Completado'
                          : ticket.status ===
                            'in_progress'
                          ? 'En proceso'
                          : 'Pendiente'}
                      </span>


                      <div className="flex items-center gap-1">

                        {ticket.status !==
                          'completed' && (
                          <button
                            onClick={() =>
                              handleCompleteTicket(
                                ticket.id
                              )
                            }
                            className="
                              p-2
                              rounded-lg
                              text-emerald-500
                              hover:bg-emerald-50
                              dark:hover:bg-emerald-900/20
                            "
                            title="Completar"
                          >
                            <Check size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setDeletingId(
                              ticket.id
                            );

                            setDeletingType(
                              'ticket'
                            );

                            setShowConfirm(
                              true
                            );
                          }}
                          className="
                            p-2
                            rounded-lg
                            text-red-500
                            hover:bg-red-50
                            dark:hover:bg-red-900/20
                          "
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        )}


        {/* ====================================================
            PAPELERA
        ==================================================== */}

        {activeTab === 'trash' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trash size={22} className="text-red-500" />
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Papelera</h2>
                  <p className="text-sm text-gray-500 mt-1">Tareas y tickets eliminados</p>
                </div>
              </div>
              {(deletedTasks.length || deletedTickets.length) > 0 && (
                <button type="button" onClick={() => { setDeletingId('all'); setDeletingType('all_permanent'); setShowConfirm(true); }} className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">Vaciar</button>
              )}
            </div>

            {loadingTrash ? (
              <div className={`py-20 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Cargando papelera...</div>
            ) : (
              <div className="space-y-8">
                <section>
                  <div className="mb-2 flex items-center gap-2 px-2">
                    <CheckCircle2 size={16} className="text-indigo-400" />
                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tareas eliminadas</h3>
                    <span className="text-[11px] text-gray-500">{deletedTasks.length}</span>
                  </div>
                  {deletedTasks.length === 0 ? (
                    <div className={`rounded-xl border border-dashed p-6 text-center text-sm ${darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}>No hay tareas en la papelera.</div>
                  ) : (
                    <div className={`overflow-hidden rounded-xl ${darkMode ? 'bg-gray-800/40' : 'bg-white border border-gray-100'}`}>
                      {deletedTasks.map((task) => {
                        const priority = PRIORITIES[task.priority] || PRIORITIES.medium;
                        const type = allTaskTypes[task.task_type] || TASK_TYPES.administrative;
                        const TypeIcon = type.icon || FileText;
                        const PriorityIcon = priority.icon;
                        return (
                          <div key={task.id} className={`flex items-center justify-between gap-4 px-4 py-3 border-b last:border-b-0 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{task.title}</span>
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${priority.bg} ${priority.color}`}><PriorityIcon size={10} />{priority.label}</span>
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${type.bg} ${type.color}`}><TypeIcon size={10} />{type.label}</span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">Eliminada: {formatDateTime(task.deleted_at)}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button type="button" onClick={() => handleRestoreDeletedTask(task.id)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"><RotateCcw size={14} />Restaurar</button>
                              <button type="button" onClick={() => { setDeletingId(task.id); setDeletingType('task_permanent'); setShowConfirm(true); }} className={`rounded-lg p-2 text-red-500 ${darkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`} title="Eliminar permanentemente"><Trash2 size={15} /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section>
                  <div className="mb-2 flex items-center gap-2 px-2">
                    <Ticket size={16} className="text-cyan-400" />
                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tickets eliminados</h3>
                    <span className="text-[11px] text-gray-500">{deletedTickets.length}</span>
                  </div>
                  {deletedTickets.length === 0 ? (
                    <div className={`rounded-xl border border-dashed p-6 text-center text-sm ${darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}>No hay tickets en la papelera.</div>
                  ) : (
                    <div className="space-y-2">
                      {deletedTickets.map((ticket) => (
                        <div key={ticket.id} className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                          <div className="min-w-0"><p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{ticket.title}</p><p className="mt-1 text-xs text-gray-500">Eliminado: {formatDateTime(ticket.deletedAt)}</p></div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button type="button" onClick={() => handleRestoreTicket(ticket)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"><RotateCcw size={14} />Restaurar</button>
                            <button type="button" onClick={() => { setDeletingId(ticket.id); setDeletingType('ticket_permanent'); setShowConfirm(true); }} className={`rounded-lg p-2 text-red-500 ${darkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`} title="Eliminar permanentemente"><Trash2 size={15} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        )} 
      </div>====================================================
          SIDE PANEL DE TAREAS
      ====================================================== */}

      {showTaskPanel && (
        <>
          <div
            className="
              fixed inset-0
              bg-black/40
              backdrop-blur-sm
              z-[900]
            "
            onClick={closeTaskPanel}
          />

          <aside
            className={`
              fixed
              top-0 right-0
              h-full
              w-full max-w-md
              z-[1000]
              shadow-2xl
                            flex flex-col
              ${
                darkMode
                  ? 'bg-gray-900 border-l border-gray-800'
                  : 'bg-white border-l border-gray-200'
              }
            `}
          >

            {/* PANEL HEADER */}

            <div
              className={`
                flex items-center justify-between
                px-6 py-5
                border-b
                ${
                  darkMode
                    ? 'border-gray-800'
                    : 'border-gray-200'
                }
              `}
            >

              <div>

                <h2
                  className={`
                    text-lg font-bold
                    ${
                      darkMode
                        ? 'text-white'
                        : 'text-gray-900'
                    }
                  `}
                >
                  {panelMode === 'create'
                    ? formTask.parent_task_id
                      ? 'Nueva subtarea'
                      : 'Nueva tarea'
                    : 'Editar tarea'}
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Configura los detalles de la tarea
                </p>

              </div>

              <button
                onClick={closeTaskPanel}
                className={`
                  p-2 rounded-lg
                  ${
                    darkMode
                      ? 'text-gray-500 hover:text-white hover:bg-gray-800'
                      : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
                  }
                `}
              >
                <X size={18} />
              </button>

            </div>


            {/* PANEL BODY */}

            <div className="flex-1 overflow-y-auto p-6">

              <div className="space-y-5">

                {/* TITULO */}

                <div>

                  <label
                    className={`
                      block
                      text-xs
                      font-semibold
                      mb-2
                      ${
                        darkMode
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }
                    `}
                  >
                    Título *
                  </label>

                  <input
                    autoFocus
                    type="text"
                    value={formTask.title}
                    onChange={(e) =>
                      setFormTask(
                        (prev) => ({
                          ...prev,
                          title:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="Ej. Revisar servidor principal"
                    className={`
                      w-full
                      px-3 py-2.5
                      rounded-lg
                      border
                      text-sm
                      focus:outline-none
                      focus:ring-2
                      focus:ring-indigo-500
                      ${
                        darkMode
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600'
                          : 'bg-white border-gray-200 text-gray-900'
                      }
                    `}
                  />

                </div>


                {/* DESCRIPCIÓN */}

                <div>

                  <label
                    className={`
                      block
                      text-xs
                      font-semibold
                      mb-2
                      ${
                        darkMode
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }
                    `}
                  >
                    Descripción
                  </label>

                  <textarea
                    rows={5}
                    value={
                      formTask.description
                    }
                    onChange={(e) =>
                      setFormTask(
                        (prev) => ({
                          ...prev,
                          description:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="Describe qué se debe hacer..."
                    className={`
                      w-full
                      px-3 py-2.5
                      rounded-lg
                      border
                      text-sm
                      resize-none
                      focus:outline-none
                      focus:ring-2
                      focus:ring-indigo-500
                      ${
                        darkMode
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600'
                          : 'bg-white border-gray-200 text-gray-900'
                      }
                    `}
                  />

                  <p className="text-[10px] text-gray-500 mt-1">
                    Puedes usar Markdown básico.
                  </p>

                </div>

                {/* PRIORIDAD */}

                <div>

                  <label
                    className={`
                      block
                      text-xs
                      font-semibold
                      mb-2
                      ${
                        darkMode
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }
                    `}
                  >
                    Prioridad
                  </label>

                  <div className="grid grid-cols-3 gap-2">

                    {Object.entries(
                      PRIORITIES
                    ).map(
                      ([
                        key,
                        priority,
                      ]) => {
                        const Icon =
                          priority.icon;

                        const selected =
                          formTask.priority ===
                          key;

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              setFormTask(
                                (prev) => ({
                                  ...prev,
                                  priority:
                                    key,
                                })
                              )
                            }
                            className={`
                              flex
                              items-center
                              justify-center
                              gap-1.5
                              px-3 py-2.5
                              rounded-lg
                              border
                              text-xs
                              font-medium
                              transition-all
                              ${
                                selected
                                  ? `${priority.bg} ${priority.border} ${priority.color}`
                                  : darkMode
                                  ? 'bg-gray-800 border-gray-700 text-gray-500'
                                  : 'bg-white border-gray-200 text-gray-500'
                              }
                            `}
                          >
                            <Icon size={13} />
                            {priority.label}
                          </button>
                        );
                      }
                    )}

                  </div>

                </div>


                {/* TIPO */}

                <div>

                  <label
                    className={`
                      block
                      text-xs
                      font-semibold
                      mb-2
                      ${
                        darkMode
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }
                    `}
                  >
                    Tipo de tarea
                  </label>

                  <div className="grid grid-cols-2 gap-2">

                    {Object.entries(
                      allTaskTypes
                    ).map(
                      ([
                        key,
                        type,
                      ]) => {
                        const Icon =
                          type.icon;

                        const selected =
                          formTask.task_type ===
                          key;

                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              setFormTask(
                                (prev) => ({
                                  ...prev,
                                  task_type:
                                    key,
                                })
                              )
                            }
                            className={`
                              flex
                              items-center
                              gap-2
                              px-3 py-2.5
                              rounded-lg
                              border
                              text-xs
                              font-medium
                              text-left
                              ${
                                selected
                                  ? `${type.bg} border-transparent ${type.color}`
                                  : darkMode
                                  ? 'bg-gray-800 border-gray-700 text-gray-500'
                                  : 'bg-white border-gray-200 text-gray-500'
                              }
                            `}
                          >
                            <Icon size={14} />
                            {type.label}
                          </button>
                        );
                      }
                    )}

                  </div>

                </div>


                {/* FECHA / HORA */}

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <label
                      className={`
                        block
                        text-xs
                        font-semibold
                        mb-2
                        ${
                          darkMode
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }
                      `}
                    >
                      Fecha
                    </label>

                    <TaskDatePicker
                      value={formTask.due_date}
                      darkMode={darkMode}
                      isOpen={activePicker === 'date'}
                      onToggle={(open) => setActivePicker(open ? 'date' : null)}
                      onChange={(date) =>
                        setFormTask((prev) => ({
                          ...prev,
                          due_date: date,
                        }))
                      }
                    />

                  </div>


                  <div>

                    <label
                      className={`
                        block
                        text-xs
                        font-semibold
                        mb-2
                        ${
                          darkMode
                            ? 'text-gray-300'
                            : 'text-gray-600'
                        }
                      `}
                    >
                      Hora
                    </label>

                    <TaskTimePicker
                      value={formTask.due_time}
                      darkMode={darkMode}
                      isOpen={activePicker === 'time'}
                      onToggle={(open) => setActivePicker(open ? 'time' : null)}
                      onChange={(time) =>
                        setFormTask((prev) => ({
                          ...prev,
                          due_time: time,
                        }))
                      }
                    />

                  </div>

                </div>


                {/* PADRE */}

                {formTask.parent_task_id && (
                  <div
                    className={`
                      p-3
                      rounded-lg
                      ${
                        darkMode
                          ? 'bg-indigo-900/20 border border-indigo-900/40'
                          : 'bg-indigo-50 border border-indigo-100'
                      }
                    `}
                  >

                    <div className="flex items-center gap-2">

                      <CheckCircle2
                        size={14}
                        className="text-indigo-500"
                      />

                      <span className="text-xs text-indigo-500">
                        Esta tarea será creada como subtarea.
                      </span>

                    </div>

                  </div>
                )}

              </div>

            </div>


            {/* PANEL FOOTER */}

            <div
              className={`
                flex items-center gap-3
                px-6 py-4
                border-t
                ${
                  darkMode
                    ? 'border-gray-800'
                    : 'border-gray-200'
                }
              `}
            >

              <button
                onClick={closeTaskPanel}
                disabled={savingTask}
                className={`
                  flex-1
                  px-4 py-2.5
                  rounded-lg
                  border
                  text-sm
                  font-medium
                  ${
                    darkMode
                      ? 'border-gray-700 text-gray-400 hover:bg-gray-800'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                Cancelar
              </button>


              <button
                onClick={handleSaveTask}
                disabled={savingTask}
                className="
                  flex-1
                  flex items-center justify-center gap-2
                  px-4 py-2.5
                  rounded-lg
                  bg-indigo-600
                  hover:bg-indigo-700
                  disabled:opacity-50
                  text-white
                  text-sm
                  font-medium
                "
              >
                {savingTask ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    {panelMode === 'create'
                      ? 'Crear tarea'
                      : 'Guardar cambios'}
                  </>
                )}
              </button>

            </div>

          </aside>
        </>
      )}


      {showTypeManager &&
        createPortal(
          <div
            className={`fixed inset-0 z-[1100] flex items-center justify-center p-4 ${
              darkMode ? 'bg-black/18' : 'bg-slate-950/10'
            } animate-[auraOverlayIn_180ms_ease-out]`}
            onMouseDown={() => setShowTypeManager(false)}
          >
            <div
              onMouseDown={(event) => event.stopPropagation()}
              className={`w-full max-w-md max-h-[calc(100vh-48px)] overflow-y-auto overflow-x-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${darkMode ? 'bg-[#111827]/98 border-gray-700/80 shadow-black/40' : 'bg-white/98 border-gray-200 shadow-gray-300/30'} animate-[auraPanelIn_180ms_ease-out]`}
            >
              <TypeManagerContent
                darkMode={darkMode}
                customTaskTypes={customTaskTypes}
                onCreate={handleCreateCustomType}
                onDelete={handleDeleteCustomType}
                onClose={() => setShowTypeManager(false)}
              />
            </div>
          </div>,
          document.body
        )}

      <TaskValidationToast
        show={validationToast.show}
        darkMode={darkMode}
        onClose={() =>
          setValidationToast((prev) => ({
            ...prev,
            show: false,
          }))
        }
      />

      <TaskCreatedToast
        toast={createdToast}
        darkMode={darkMode}
        onClose={() =>
          setCreatedToast((prev) => ({
            ...prev,
            show: false,
          }))
        }
      />

      {/* ======================================================
          MODAL CONFIRMACIÓN
      ====================================================== */}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() =>
          setShowConfirm(false)
        }
        onConfirm={
          handleConfirmDelete
        }
        title="Confirmar"
        message={deletingType === 'all_permanent' ? '¿Estás seguro de que deseas vaciar toda la papelera? Esta acción no se puede deshacer.' : deletingType === 'task_permanent' || deletingType === 'ticket_permanent' ? '¿Estás seguro de que deseas eliminar este elemento permanentemente? Esta acción no se puede deshacer.' : '¿Estás seguro de que deseas mover este elemento a la papelera?'}
        confirmText="Eliminar"
        type="danger"
      />


      {/* ======================================================
          ALERTA
      ====================================================== */}

      <AlertModal
        isOpen={showAlert.show}
        onClose={() =>
          setShowAlert({
            ...showAlert,
            show: false,
          })
        }
        title={showAlert.title}
        message={showAlert.message}
        type={showAlert.type}
      />

      </div>
    </div>
  );
}


// ============================================================
// ICONO AUXILIAR PARA DASHBOARD
// ============================================================

function TargetIcon({
  size = 18,
  className = '',
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}