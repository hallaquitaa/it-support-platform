import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Check,
  CircleAlert,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  UserX,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuraPageBackground from '../components/common/AuraPageBackground';
import adminService from '../services/adminService';

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'technician', label: 'Técnico' },
  { value: 'analyst', label: 'Analista' },
];

const EMPTY_FORM = {
  username: '',
  full_name: '',
  email: '',
  password: '',
  role: 'analyst',
};

const actionLabels = {
  user_created: 'Usuario creado',
  user_updated: 'Usuario actualizado',
  user_password_reset: 'Contraseña restablecida',
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-[#0d1422]/80 dark:text-slate-100 dark:placeholder:text-slate-500';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-indigo-400/40 dark:hover:text-indigo-300';

function getErrorMessage(error) {
  return error?.response?.data?.error || error?.message || 'Ocurrió un error inesperado.';
}

function formatDate(value) {
  if (!value) return '—';
  const parsed = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [resetUserId, setResetUserId] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const isAdmin = user?.role === 'admin';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersResult, activityResult] = await Promise.all([
        adminService.getUsers(),
        adminService.getActivity(25),
      ]);
      setUsers(Array.isArray(usersResult) ? usersResult : []);
      setActivity(Array.isArray(activityResult) ? activityResult : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/', { replace: true });
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin, loadData]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return users;
    return users.filter((item) =>
      [item.full_name, item.username, item.email, item.role]
        .some((value) => String(value || '').toLocaleLowerCase().includes(query))
    );
  }, [users, search]);

  const activeCount = users.filter((item) => item.is_active).length;
  const adminCount = users.filter((item) => item.is_active && item.role === 'admin').length;

  const handleCreate = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await adminService.createUser(form);
      setForm(EMPTY_FORM);
      setShowCreate(false);
      setNotice('La cuenta fue creada correctamente.');
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (id, patch) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const updated = await adminService.updateUser(id, patch);
      setUsers((current) => current.map((item) => item.id === id ? updated : item));
      setNotice('Los cambios del usuario se guardaron.');
      const refreshedActivity = await adminService.getActivity(25);
      setActivity(Array.isArray(refreshedActivity) ? refreshedActivity : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      await loadData();
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (event, id) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await adminService.resetPassword(id, resetPassword);
      setResetPassword('');
      setResetUserId(null);
      setNotice('La contraseña se actualizó correctamente.');
      const refreshedActivity = await adminService.getActivity(25);
      setActivity(Array.isArray(refreshedActivity) ? refreshedActivity : []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || !isAdmin) return null;

  return (
    <main className="relative isolate min-h-[calc(100vh-64px)] overflow-hidden bg-[#f5f7fc] px-4 py-6 text-slate-900 dark:bg-[#080d18] dark:text-slate-100 sm:px-6 lg:px-8">
      <AuraPageBackground />
      <div className="relative mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
              <ShieldCheck size={15} /> Centro de control Hall-IT
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Administración</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Usuarios, roles, acceso y actividad administrativa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass} onClick={loadData} disabled={loading || busy}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Actualizar
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50" onClick={() => setShowCreate((value) => !value)}>
              {showCreate ? <X size={14} /> : <Plus size={14} />}
              {showCreate ? 'Cerrar formulario' : 'Nuevo usuario'}
            </button>
          </div>
        </header>

        {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-3 text-sm text-rose-700 dark:text-rose-300"><CircleAlert size={16} className="mt-0.5 shrink-0" />{error}</div>}
        {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3 text-sm text-emerald-700 dark:text-emerald-300"><Check size={16} className="mt-0.5 shrink-0" />{notice}</div>}

        <section aria-label="Resumen de usuarios" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Usuarios registrados', value: users.length, icon: Users },
            { label: 'Cuentas activas', value: activeCount, icon: UserRound },
            { label: 'Administradores activos', value: adminCount, icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="aura-panel rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  {item.label}
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/15 bg-indigo-500/[0.06] text-indigo-600 dark:text-indigo-300"><Icon size={17} /></span>
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums">{item.value}</p>
              </article>
            );
          })}
        </section>

        {showCreate && (
          <section className="aura-panel rounded-2xl p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold">Crear cuenta de usuario</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">La contraseña se almacena como hash bcrypt. Debe tener al menos 12 caracteres.</p>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Nombre completo
                <input className={inputClass} value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} required minLength={2} maxLength={100} autoComplete="name" />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Usuario
                <input className={inputClass} value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} required minLength={3} maxLength={32} pattern="[a-zA-Z0-9._-]+" autoComplete="username" />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Correo electrónico
                <input type="email" className={inputClass} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required maxLength={160} autoComplete="email" />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Contraseña inicial
                <input type="password" className={inputClass} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required minLength={12} autoComplete="new-password" />
              </label>
              <label className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Rol
                <select className={inputClass} value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
                  {ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                </select>
              </label>
              <div className="flex items-end">
                <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50" disabled={busy}>
                  <Plus size={14} />Crear usuario
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="aura-panel overflow-hidden rounded-2xl">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200/70 p-4 dark:border-white/[0.07] sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-semibold">Usuarios y permisos</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Los cambios de rol y estado se validan nuevamente en el servidor.</p>
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-black/10 sm:w-72">
              <Search size={15} className="text-slate-400" />
              <input aria-label="Buscar usuarios" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, usuario o correo..." className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-xs text-slate-500"><RefreshCw size={15} className="animate-spin" />Cargando usuarios...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">No hay usuarios que coincidan con la búsqueda.</div>
          ) : (
            <div className="divide-y divide-slate-200/70 dark:divide-white/[0.06]">
              {filteredUsers.map((item) => {
                const isCurrentUser = Number(item.id) === Number(user.id);
                return (
                  <article key={item.id} className="grid grid-cols-1 items-center gap-3 p-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(150px,.7fr)_minmax(150px,.7fr)_auto]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{item.full_name}</p>
                        {isCurrentUser && <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[9px] font-semibold text-indigo-600 dark:text-indigo-300">Tu cuenta</span>}
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">@{item.username} · {item.email}</p>
                      <p className="mt-1 text-[10px] text-slate-400">Registrado: {formatDate(item.created_at)}</p>
                    </div>

                    <label className="space-y-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Rol
                      <select aria-label={`Rol de ${item.username}`} className={inputClass} value={item.role} disabled={busy || isCurrentUser} onChange={(event) => handleUpdate(item.id, { role: event.target.value })}>
                        {ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                      </select>
                    </label>

                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Estado</span>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${item.is_active ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-slate-300 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/[0.04]'}`}>{item.is_active ? 'Activo' : 'Inactivo'}</span>
                        <button type="button" className={buttonClass} disabled={busy || isCurrentUser || (item.role === 'admin' && item.is_active && adminCount <= 1)} onClick={() => handleUpdate(item.id, { is_active: !item.is_active })} title={isCurrentUser ? 'No puedes desactivar tu propia cuenta' : item.role === 'admin' && item.is_active && adminCount <= 1 ? 'Debe quedar al menos un administrador activo' : ''}>
                          {item.is_active ? <UserX size={13} /> : <Check size={13} />}
                          {item.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      {resetUserId === item.id ? (
                        <form onSubmit={(event) => handleResetPassword(event, item.id)} className="flex min-w-0 flex-1 gap-2 lg:max-w-sm">
                          <input type="password" className={inputClass} placeholder="Nueva contraseña (12+)" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} minLength={12} required autoComplete="new-password" />
                          <button type="submit" className={buttonClass} disabled={busy || resetPassword.length < 12} aria-label="Guardar nueva contraseña"><Check size={14} /></button>
                          <button type="button" className={buttonClass} onClick={() => { setResetUserId(null); setResetPassword(''); }} aria-label="Cancelar"><X size={14} /></button>
                        </form>
                      ) : (
                        <button type="button" className={buttonClass} disabled={busy} onClick={() => { setResetUserId(item.id); setResetPassword(''); }}><KeyRound size={14} />Restablecer clave</button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="aura-panel overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-slate-200/70 p-4 dark:border-white/[0.07]">
            <Activity size={16} className="text-indigo-500" />
            <div>
              <h2 className="text-sm font-semibold">Actividad administrativa</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Registro de altas, cambios de usuario y restablecimientos de contraseña.</p>
            </div>
          </div>
          {activity.length ? (
            <div className="divide-y divide-slate-200/70 dark:divide-white/[0.06]">
              {activity.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-1.5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{actionLabels[entry.action] || entry.action}</p>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {entry.actor_name || entry.actor_username || 'Cuenta desconocida'}
                      {entry.target_name ? ` → ${entry.target_name}` : ''}
                    </p>
                  </div>
                  <time className="shrink-0 text-[10px] text-slate-400">{formatDate(entry.created_at)}</time>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">Todavía no hay acciones administrativas registradas.</div>
          )}
        </section>

        <p className="flex items-start gap-2 text-[10px] leading-5 text-slate-500 dark:text-slate-400">
          <ShieldCheck size={13} className="mt-0.5 shrink-0" />
          Este panel no muestra hashes ni contraseñas almacenadas. Los restablecimientos generan un hash bcrypt en el servidor y las acciones quedan registradas en la auditoría.
        </p>
      </div>
    </main>
  );
}
