import { useState } from 'react';
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

export default function RemoteAccessPage() {
const [search, setSearch] = useState('');
const [showForm, setShowForm] = useState(false);

const [form, setForm] = useState({
computer_name: '',
anydesk_id: '',
branch_id: '',
notes: '',
});

// La conexión con la API se implementará en el siguiente paso.
const computers = [];

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
setForm((current) => ({ ...current, [field]: value }));
};

return ( <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-6 text-slate-900 dark:bg-[#0b1120] dark:text-white sm:px-6 lg:px-8"> <div className="mx-auto max-w-7xl space-y-6"> <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"> <div> <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500"> <Monitor size={15} />
Centro de Mando IT </div>

```
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
        onClick={() => setShowForm(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
      >
        <Plus size={18} />
        Registrar equipo
      </button>
    </header>

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
        <p className="mt-4 text-3xl font-bold">{computers.length}</p>
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

      {filteredComputers.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-4 rounded-2xl bg-indigo-500/10 p-4 text-indigo-500">
            <Monitor size={30} />
          </div>
          <h3 className="font-semibold">
            {search ? 'No se encontraron equipos' : 'Todavía no hay equipos'}
          </h3>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {search
              ? 'Prueba con otro nombre, identificador o sucursal.'
              : 'Registra el primer equipo para comenzar a organizar los accesos remotos.'}
          </p>
          {!search && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
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
                  <h3 className="font-semibold">{computer.computer_name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    AnyDesk: {computer.anydesk_id}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={12} />
                    {computer.branch_name || 'Sin sucursal'}
                  </p>
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
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Cerrar formulario"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              // La persistencia se conectará a la API en el siguiente paso.
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Nombre del equipo
              </label>
              <input
                required
                value={form.computer_name}
                onChange={(event) => updateField('computer_name', event.target.value)}
                placeholder="Ej. PC Administración"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                ID de AnyDesk
              </label>
              <input
                required
                value={form.anydesk_id}
                onChange={(event) => updateField('anydesk_id', event.target.value)}
                placeholder="Introduce el identificador"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Notas (opcional)
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                placeholder="Información adicional del equipo"
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Guardar equipo
              </button>
            </div>
          </form>
        </section>
      </div>
    )}

    <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
      <RefreshCw size={13} />
      Los datos se conectarán con el servidor en el siguiente paso.
    </div>
  </div>
</main>


);
}
