import { useEffect, useMemo, useState } from 'react';
import { Code2, Copy, FileCode2, Plus, Search, Trash2, X, Pencil, Terminal } from 'lucide-react';
import snippetService from '../services/snippetService';

const emptyForm = { title: '', content: '', language: 'sql', category_id: '' };
const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true);
    try {
      const [all, cats] = await Promise.all([snippetService.getAll(), snippetService.getCategories()]);
      setSnippets(Array.isArray(all) ? all : []); setCategories(Array.isArray(cats) ? cats : []); setError('');
    } catch (e) { setError(e.response?.data?.error || 'No se pudieron cargar los snippets.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => snippets.filter(s => {
    const matchesCategory = category === 'all' || String(s.category_id || '') === category;
    const q = query.toLowerCase().trim();
    return matchesCategory && (!q || [s.title,s.content,s.language,s.category_name].some(v => String(v || '').toLowerCase().includes(q)));
  }), [snippets, category, query]);
  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (s) => { setEditing(s); setForm({ title:s.title, content:s.content, language:s.language || 'text', category_id:s.category_id ? String(s.category_id) : '' }); setShowForm(true); };
  const save = async (e) => {
    e.preventDefault();
    const payload = {...form, category_id: form.category_id ? Number(form.category_id) : null};
    try {
      const saved = editing ? await snippetService.update(editing.id,payload) : await snippetService.create(payload);
      setShowForm(false); setEditing(null); await load(); setSelected(saved);
    } catch (e) { setError(e.response?.data?.error || 'No se pudo guardar el snippet.'); }
  };
  const remove = async (s) => {
    if (!window.confirm(`¿Eliminar el snippet "${s.title}"?`)) return;
    try { await snippetService.delete(s.id); if (selected?.id === s.id) setSelected(null); await load(); }
    catch (e) { setError(e.response?.data?.error || 'No se pudo eliminar.'); }
  };
  const copy = async (value) => { try { await navigator.clipboard.writeText(value); } catch { setError('El navegador no permitió copiar al portapapeles.'); } };
  return <main className="min-h-[calc(100vh-64px)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:p-7"><div className="mx-auto max-w-7xl">
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><Terminal size={14}/> Biblioteca técnica</div><h1 className="text-3xl font-semibold tracking-tight">Snippets</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Guarda y reutiliza comandos, consultas y scripts del equipo IT.</p></div><button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"><Plus size={16}/> Nuevo snippet</button></div>
    <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">Total de snippets</p><p className="mt-2 text-2xl font-semibold">{snippets.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">Categorías</p><p className="mt-2 text-2xl font-semibold">{categories.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-sm text-slate-500">Lenguajes usados</p><p className="mt-2 text-2xl font-semibold">{new Set(snippets.map(s => s.language).filter(Boolean)).size}</p></div></div>
    {error && <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="space-y-3 border-b border-slate-200 p-4 dark:border-slate-800"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por título, código..." className={`${fieldClass} pl-9`}/></div><select value={category} onChange={e => setCategory(e.target.value)} className={fieldClass}><option value="all">Todas las categorías</option>{categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}</select></div>
        {loading ? <div className="p-10 text-center text-sm text-slate-500">Cargando biblioteca...</div> : filtered.length === 0 ? <div className="p-10 text-center"><Code2 size={28} className="mx-auto mb-3 text-slate-400"/><p className="font-medium">No hay snippets</p><p className="mt-1 text-sm text-slate-500">Crea el primero o ajusta la búsqueda.</p></div> : <div className="max-h-[620px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">{filtered.map(s => <button key={s.id} onClick={() => setSelected(s)} className={`block w-full border-l-2 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selected?.id === s.id ? 'border-slate-900 bg-slate-50 dark:border-slate-200 dark:bg-slate-800/60' : 'border-transparent'}`}><div className="flex items-start gap-3"><div className="rounded-xl border border-slate-200 p-2 dark:border-slate-700"><FileCode2 size={17}/></div><div className="min-w-0 flex-1"><p className="truncate font-medium">{s.title}</p><p className="mt-1 text-xs text-slate-500">{s.category_name || 'Sin categoría'} · {(s.language || 'text').toUpperCase()}</p><p className="mt-2 line-clamp-2 font-mono text-xs text-slate-500">{s.content}</p></div></div></button>)}</div>}</section>
      <section className="min-h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">{selected ? <><div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800"><div className="min-w-0"><p className="text-xs uppercase tracking-wider text-slate-500">{selected.category_name || 'Sin categoría'} · {(selected.language || 'text').toUpperCase()}</p><h2 className="mt-1 break-words text-xl font-semibold">{selected.title}</h2></div><div className="flex shrink-0 gap-1"><button onClick={() => copy(selected.content)} title="Copiar código" className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><Copy size={16}/></button><button onClick={() => openEdit(selected)} title="Editar" className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><Pencil size={16}/></button><button onClick={() => remove(selected)} title="Eliminar" className="rounded-lg border border-slate-200 p-2 text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-950/30"><Trash2 size={16}/></button></div></div><div className="p-4"><pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-200"><code>{selected.content}</code></pre><button onClick={() => copy(selected.content)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Copy size={15}/> Copiar contenido</button></div></> : <div className="flex h-full min-h-[360px] flex-col items-center justify-center p-8 text-center"><Code2 size={34} className="mb-3 text-slate-400"/><h2 className="font-medium">Selecciona un snippet</h2><p className="mt-1 max-w-xs text-sm text-slate-500">El código aparecerá aquí para consultarlo o copiarlo rápidamente.</p><button onClick={openCreate} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"><Plus size={15}/> Crear snippet</button></div>}</section>
    </div>
  </div>
  {showForm && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={save} className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">{editing ? 'Editar snippet' : 'Nuevo snippet'}</h2><button type="button" onClick={() => setShowForm(false)}><X size={20}/></button></div><div className="space-y-4"><label className="block text-sm">Título<input required value={form.title} onChange={e => setForm({...form,title:e.target.value})} className={`${fieldClass} mt-1`} placeholder="Ej. Consultar productos sin existencia"/></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm">Categoría<select value={form.category_id} onChange={e => setForm({...form,category_id:e.target.value})} className={`${fieldClass} mt-1`}><option value="">Sin categoría</option>{categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}</select></label><label className="block text-sm">Lenguaje<select value={form.language} onChange={e => setForm({...form,language:e.target.value})} className={`${fieldClass} mt-1`}>{['sql','powershell','bash','python','javascript','typescript','json','yaml','text','cisco','mikrotik'].map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}</select></label></div><label className="block text-sm">Contenido<textarea required rows={10} value={form.content} onChange={e => setForm({...form,content:e.target.value})} className={`${fieldClass} mt-1 font-mono`} placeholder="Pega aquí el comando o script..."/></label></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Cancelar</button><button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900">Guardar snippet</button></div></form></div>}
  </main>;
}
