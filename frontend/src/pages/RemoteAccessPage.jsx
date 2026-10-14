import { useEffect, useState } from 'react';
import {
  Monitor,
  Search,
  Plus,
  RefreshCw,
  Laptop,
  MapPin,
  ExternalLink,
  Wifi,
  X,
} from 'lucide-react';
import api from '../services/api';

export default function RemoteAccessPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [computers, setComputers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [branchError, setBranchError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    computer_name: '',
    anydesk_id: '',
    branch_id: '',
    notes: '',
  });

  // Normaliza respuestas que pueden venir como array
  // o como un objeto que contiene el array.
  const extractRecords = (data, alternativeKeys = []) => {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.data)) return data.data;

    for (const key of alternativeKeys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    return null;
  };

  // Cargar los equipos guardados en el servidor.
  const loadComputers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/remote-access');

      const records = extractRecords(response.data, [
        'computers',
        'items',
      ]);

      if (!records) {
        throw new Error(
          'El servidor devolvió un formato inesperado al cargar los equipos.'
        );
      }

      setComputers(records);
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'No se pudieron cargar los equipos.'
      );

      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cargar las sucursales disponibles.
  const loadBranches = async () => {
    try {
      const response = await api.get('/branches');

      const records = extractRecords(response.data, [
        'branches',
        'items',
      ]);

      if (!records) {
        throw new Error('Formato de sucursales no reconocido.');
      }

      setBranches(records);
      setBranchError('');
    } catch (err) {
      setBranchError(
        err.response?.data?.message ||
          'No se pudieron cargar las sucursales.'
      );
    }
  };

  useEffect(() => {
    loadComputers();
    loadBranches();
  }, []);

  const filteredComputers = computers.filter((computer) => {
    const query = search.trim().toLowerCase();

    return (
      !query ||
      computer.computer_name?.toLowerCase().includes(query) ||
      computer.anydesk_id?.toLowerCase().includes(query) ||
      computer.branch_name?.toLowerCase().includes(query)
    );
  });

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openForm = () => {
    setError('');
    setSuccess('');
    setForm({
      computer_name: '',
      anydesk_id: '',
      branch_id: '',
      notes: '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
  };

  // Guardar un equipo mediante la API.
  const handleSave = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/remote-access', {
        computer_name: form.computer_name.trim(),
        anydesk_id: form.anydesk_id.trim(),
        branch_id: form.branch_id || null,
        notes: form.notes.trim(),
      });

      setForm({
        computer_name: '',
        anydesk_id: '',
        branch_id: '',
        notes: '',
      });

      setShowForm(false);

      const refreshed = await loadComputers();

      if (refreshed) {
        setSuccess('Equipo registrado correctamente.');
      } else {
        setSuccess(
          'Equipo guardado. No se pudo actualizar el listado; intenta recargarlo.'
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'No se pudo guardar el equipo. Comprueba la conexión con el servidor.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-6 text-slate-900 dark:bg-[#0b1120] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              <Monitor size={15} />
              Centro de Mando IT
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Remote Access
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Gestiona los equipos y sus identificadores de AnyDesk desde un
              solo lugar.
            </p>
          </div>

          <button
            type="button"
            onClick={openForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            <Plus size={18} />
            Registrar equipo
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            {success}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Equipos registrados
              </span>
              <span className="rounded-xl bg-indigo-500/10 p-2 text-indigo-500">
                <Laptop size={20} />
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold">
              {computers.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Equipos guardados en el sistema
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Acceso remoto
              </span>
              <span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
                <Wifi size={20} />
              </span>
            </div>

            <p className="mt-4 text-xl font-bold">AnyDesk</p>

            <p className="mt-1 text-xs text-slate-400">
              Plataforma inicial de conexión remota
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Equipos registrados</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Busca por nombre, ID de AnyDesk o sucursal.
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar equipo..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <RefreshCw
                size={24}
                className="mb-3 animate-spin text-indigo-500"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Cargando equipos...
              </p>
            </div>
          ) : filteredComputers.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 rounded-2xl bg-indigo-500/10 p-4 text-indigo-500">
                <Monitor size={30} />
              </div>

              <h3 className="font-semibold">
                {search
                  ? 'No se encontraron equipos'
                  : 'Todavía no hay equipos'}
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {search
                  ? 'Prueba con otro nombre, identificador o sucursal.'
                  : 'Registra el primer equipo para comenzar a organizar los accesos remotos.'}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={openForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 px-4 py-2.5 text-sm font-semibold text-indigo-500 transition hover:bg-indigo-500/10"
                >
                  <Plus size={16} />
                  Registrar primer equipo
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredComputers.map((computer) => (
                <article
                  key={computer.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                      <Laptop size={21} />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {computer.computer_name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        AnyDesk: {computer.anydesk_id}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={12} />
                        {computer.branch_name || 'Sin sucursal'}
                      </p>

                      {computer.notes && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">
                          {computer.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <a
                    href={`anydesk:${encodeURIComponent(computer.anydesk_id)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                  >
                    <ExternalLink size={15} />
                    Abrir AnyDesk
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="remote-form-title"
              className="my-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#111827]"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 id="remote-form-title" className="text-lg font-bold">
                    Registrar equipo
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Datos básicos del equipo remoto.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
                  aria-label="Cerrar formulario"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label
                    htmlFor="remote-computer-name"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Nombre del equipo
                  </label>

                  <input
                    id="remote-computer-name"
                    required
                    maxLength={150}
                    value={form.computer_name}
                    onChange={(event) =>
                      updateField('computer_name', event.target.value)
                    }
                    placeholder="Ej. PC Administración"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="remote-anydesk-id"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    ID de AnyDesk
                  </label>

                  <input
                    id="remote-anydesk-id"
                    required
                    maxLength={100}
                    value={form.anydesk_id}
                    onChange={(event) =>
                      updateField('anydesk_id', event.target.value)
                    }
                    placeholder="Introduce el identificador"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="remote-branch"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Sucursal (opcional)
                  </label>

                  <select
                    id="remote-branch"
                    value={form.branch_id}
                    onChange={(event) =>
                      updateField('branch_id', event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="">Sin sucursal</option>

                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>

                  {branchError && (
                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                      {branchError} Puedes registrar el equipo sin sucursal.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="remote-notes"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Notas (opcional)
                  </label>

                  <textarea
                    id="remote-notes"
                    rows={3}
                    maxLength={2000}
                    value={form.notes}
                    onChange={(event) =>
                      updateField('notes', event.target.value)
                    }
                    placeholder="Información adicional del equipo"
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && (
                      <RefreshCw size={15} className="animate-spin" />
                    )}
                    {saving ? 'Guardando...' : 'Guardar equipo'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
          <RefreshCw size={13} />
          Los equipos se cargan y guardan en el servidor.
        </div>
      </div>
    </main>
  );
}