import { useEffect, useMemo, useState } from 'react';
import {
  Code2, Copy, FileText, Plus, Search, Trash2, Pencil, Terminal, Tag,
  Settings2, Check, RefreshCw, AlertCircle, ChevronRight, Database, X,
  CheckCircle2, ChevronDown, Filter, Sparkles
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import AuraModal from '../components/common/AuraModal';
import AuraPageBackground from '../components/common/AuraPageBackground';
import snippetService from '../services/snippetService';

const emptyForm = { title: '', content: '', language: 'sql', category_id: '' };
const languages = ['sql', 'powershell', 'bash', 'python', 'javascript', 'typescript', 'json', 'yaml', 'text', 'cisco', 'mikrotik'];

const surface = (darkMode) => darkMode
  ? 'border-white/[0.08] bg-[#111827]/[0.78] shadow-black/20'
  : 'border-slate-200/70 bg-white/[0.76] shadow-slate-300/10';

const mutedText = (darkMode) => darkMode ? 'text-gray-400' : 'text-gray-500';

const fieldClass = (darkMode) => `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 ${darkMode
  ? 'border-gray-700 bg-[#0A101D]/90 text-gray-100 placeholder:text-gray-600 hover:border-gray-600'
  : 'border-gray-200 bg-white/90 text-gray-800 placeholder:text-gray-400 hover:border-gray-300'}`;

const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0';
const secondaryButton = (darkMode) => `inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${darkMode ? 'border-gray-700 bg-gray-900/50 text-gray-300 hover:border-gray-600 hover:bg-white/[0.04] hover:text-white' : 'border-gray-200 bg-white/75 text-gray-700 hover:border-gray-300 hover:bg-white'}`;

const getLanguageIcon = (language) => {
  if (language === 'sql') return Database;
  if (['powershell', 'bash', 'cisco', 'mikrotik'].includes(language)) return Terminal;
  if (['json', 'yaml'].includes(language)) return Code2;
  if (language === 'text') return FileText;
  return FileText;
};

const getTodayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function SnippetsPage() {
  const { darkMode } = useTheme();
  const [snippets, setSnippets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const [all, cats] = await Promise.all([snippetService.getAll(), snippetService.getCategories()]);
      const nextSnippets = Array.isArray(all) ? all : [];
      setSnippets(nextSnippets);
      setCategories(Array.isArray(cats) ? cats : []);
      setSelected((current) => current ? nextSnippets.find((item) => item.id === current.id) || null : null);
      setError('');
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudieron cargar los snippets. Comprueba la conexión e inténtalo de nuevo.');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('es');
    return snippets.filter((snippet) => {
      const matchesCategory = category === 'all' || String(snippet.category_id || '') === category;
      const matchesQuery = !q || [snippet.title, snippet.content, snippet.language, snippet.category_name]
        .some((value) => String(value || '').toLocaleLowerCase('es').includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [snippets, category, query]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (snippet) => {
    setEditing(snippet);
    setForm({
      title: snippet.title || '',
      content: snippet.content || '',
      language: snippet.language || 'text',
      category_id: snippet.category_id ? String(snippet.category_id) : '',
    });
    setError('');
    setShowForm(true);
  };

  const saveSnippet = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, category_id: form.category_id ? Number(form.category_id) : null };
    try {
      const saved = editing
        ? await snippetService.update(editing.id, payload)
        : await snippetService.create(payload);
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      await load(false);
      setSelected(saved);
      setNotice(editing ? 'El snippet se actualizó correctamente.' : 'El snippet quedó guardado.');
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo guardar el snippet.');
    } finally {
      setSaving(false);
    }
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    const name = categoryDraft.trim();
    if (!name) return;
    setSaving(true);
    setError('');
    try {
      const result = editingCategory
        ? await snippetService.updateCategory(editingCategory.id, { name })
        : await snippetService.createCategory({ name });
      await load(false);
      if (editingCategory && selected?.category_id === editingCategory.id) {
        setSelected((current) => current ? { ...current, category_name: result.name } : null);
      }
      setCategoryDraft('');
      setEditingCategory(null);
      setNotice(editingCategory ? 'La categoría se actualizó.' : 'La categoría se creó.');
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo guardar la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const requestDeleteSnippet = (snippet) => setConfirmTarget({ kind: 'snippet', item: snippet });
  const requestDeleteCategory = (categoryItem) => setConfirmTarget({ kind: 'category', item: categoryItem });

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    const target = confirmTarget;
    setSaving(true);
    setError('');
    try {
      if (target.kind === 'snippet') {
        await snippetService.delete(target.item.id);
        if (selected?.id === target.item.id) setSelected(null);
        setNotice('El snippet se eliminó.');
      } else {
        await snippetService.deleteCategory(target.item.id);
        if (category === String(target.item.id)) setCategory('all');
        if (selected?.category_id === target.item.id) {
          setSelected((current) => current ? { ...current, category_id: null, category_name: null } : null);
        }
        setNotice('Categoría eliminada; los snippets se conservaron sin categoría.');
      }
      setConfirmTarget(null);
      await load(false);
    } catch (e) {
      setConfirmTarget(null);
      setError(e.response?.data?.error || (target.kind === 'snippet' ? 'No se pudo eliminar el snippet.' : 'No se pudo eliminar la categoría.'));
    } finally {
      setSaving(false);
    }
  };

  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice('Contenido copiado al portapapeles.');
    } catch {
      setError('El navegador no permitió copiar al portapapeles.');
    }
  };

  const resetCategoryEditor = () => { setCategoryDraft(''); setEditingCategory(null); };
  const selectedLanguage = selected?.language || 'text';
  const SelectedIcon = getLanguageIcon(selectedLanguage);

  return (
    <main className={`relative isolate min-h-[calc(100vh-64px)] overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-[#080D18] text-gray-100' : 'bg-[#F5F7FC] text-gray-900'}`}>
      <AuraPageBackground />
      <div className="relative z-10 mx-auto w-full max-w-[1600px] p-4 sm:p-6 xl:p-8">
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className={`mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}><span className="h-px w-6 bg-indigo-500"/> Biblioteca técnica</div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-[1.8rem]">Snippets</h1>
            <p className={`mt-1.5 max-w-xl text-sm leading-6 ${mutedText(darkMode)}`}>Tus consultas SQL, comandos y scripts listos para buscar, consultar y reutilizar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { resetCategoryEditor(); setError(''); setShowCategoryManager(true); }} className={secondaryButton(darkMode)}><Settings2 size={15}/> Categorías</button>
            <button type="button" onClick={openCreate} className={primaryButton}><Plus size={15}/> Nuevo snippet</button>
          </div>
        </header>

        {error && !showForm && !showCategoryManager && !confirmTarget && <div role="alert" className={`mb-4 flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${darkMode ? 'border-rose-400/20 bg-rose-400/[0.07] text-rose-200' : 'border-rose-200 bg-rose-50/90 text-rose-700'}`}><AlertCircle size={17} className="mt-0.5 shrink-0"/><span className="flex-1">{error}</span><button type="button" onClick={() => setError('')} aria-label="Cerrar alerta"><X size={15}/></button></div>}
        {notice && <div className={`mb-4 flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${darkMode ? 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300' : 'border-emerald-200 bg-emerald-50/80 text-emerald-700'}`}><CheckCircle2 size={14}/><span className="flex-1">{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Cerrar aviso"><X size={14}/></button></div>}

        <section className="mb-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Fragmentos guardados', value: snippets.length, detail: 'Biblioteca disponible', icon: Code2, tint: 'text-indigo-400' },
            { label: 'Categorías', value: categories.length, detail: 'Organización técnica', icon: Tag, tint: 'text-violet-400' },
            { label: 'Lenguajes', value: new Set(snippets.map((snippet) => snippet.language).filter(Boolean)).size, detail: 'Tipos de contenido', icon: Code2, tint: 'text-cyan-400' },
          ].map(({ label, value, detail, icon: Icon, tint }) => (
            <article key={label} className={`relative overflow-hidden rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 ${surface(darkMode)}`}>
              <div className="flex items-start justify-between gap-3"><div><p className={`text-xs font-medium ${mutedText(darkMode)}`}>{label}</p><p className="mt-2 text-2xl font-bold tracking-tight">{value}</p><p className={`mt-1 text-[10px] ${mutedText(darkMode)}`}>{detail}</p></div><span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-900/70' : 'border-gray-200 bg-white/80'} ${tint}`}><Icon size={17}/></span></div>
              <span className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"/>
            </article>
          ))}
        </section>

        <section className={`grid items-start gap-4 lg:grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)]`}>
          <section className={`overflow-hidden rounded-2xl border shadow-xl shadow-gray-900/[0.03] backdrop-blur-xl ${surface(darkMode)}`}>
            <header className={`space-y-3 border-b p-4 ${darkMode ? 'border-gray-800/90' : 'border-gray-200/80'}`}>
              <div className="flex items-center justify-between gap-2"><div><h2 className="text-sm font-bold">Biblioteca</h2><p className={`mt-0.5 text-[10px] ${mutedText(darkMode)}`}>{filtered.length} de {snippets.length} fragmentos</p></div><span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-900/70 text-indigo-300' : 'border-gray-200 bg-white/80 text-indigo-600'}`}><FileText size={15}/></span></div>
              <div className="relative"><Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar título, contenido o lenguaje..." className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 ${darkMode ? 'border-gray-700 bg-[#0A101D]/80 text-gray-100 placeholder:text-gray-600' : 'border-gray-200 bg-white/80 text-gray-800 placeholder:text-gray-400'}`}/></div>
              <div className="relative"><Filter size={14} className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}/><select value={category} onChange={(event) => setCategory(event.target.value)} className={`w-full appearance-none rounded-xl border py-2.5 pl-9 pr-8 text-xs outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 ${darkMode ? 'border-gray-700 bg-[#0A101D]/80 text-gray-200' : 'border-gray-200 bg-white/80 text-gray-700'}`}><option value="all">Todas las categorías</option>{categories.map((item) => <option key={item.id} value={String(item.id)}>{item.name} · {item.snippets_count ?? snippets.filter((snippet) => snippet.category_id === item.id).length}</option>)}</select><ChevronDown size={15} className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${mutedText(darkMode)}`}/></div>
            </header>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 p-12"><RefreshCw size={21} className="animate-spin text-indigo-400"/><p className={`text-xs ${mutedText(darkMode)}`}>Cargando biblioteca...</p></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center"><span className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border ${darkMode ? 'border-gray-700 bg-gray-900/70 text-gray-500' : 'border-gray-200 bg-white/80 text-gray-400'}`}><Code2 size={20}/></span><p className="text-sm font-semibold">{query || category !== 'all' ? 'No hay coincidencias' : 'Tu biblioteca está vacía'}</p><p className={`mt-1 max-w-xs text-xs leading-5 ${mutedText(darkMode)}`}>{query || category !== 'all' ? 'Cambia la búsqueda o selecciona otra categoría.' : 'Guarda tu primera consulta o comando para tenerlo a mano.'}</p>{!query && category === 'all' && <button type="button" onClick={openCreate} className={`${primaryButton} mt-4`}><Plus size={14}/> Crear snippet</button>}</div>
            ) : (
              <div className={`max-h-[650px] overflow-y-auto divide-y ${darkMode ? 'divide-gray-800/90' : 'divide-gray-200/70'}`}>
                {filtered.map((snippet) => {
                  const SnippetIcon = getLanguageIcon(snippet.language || 'text');
                  const active = selected?.id === snippet.id;
                  return (
                    <button key={snippet.id} type="button" onClick={() => setSelected(snippet)} className={`group block w-full border-l-2 p-4 text-left transition-all duration-150 ${active ? (darkMode ? 'border-indigo-400 bg-indigo-500/[0.09]' : 'border-indigo-500 bg-indigo-50/70') : `border-transparent ${darkMode ? 'hover:bg-white/[0.025]' : 'hover:bg-white/70'}`}`}>
                      <div className="flex items-start gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${active ? (darkMode ? 'border-indigo-400/25 bg-indigo-500/15 text-indigo-200' : 'border-indigo-200 bg-white text-indigo-600') : (darkMode ? 'border-gray-700 bg-gray-900/70 text-gray-500 group-hover:text-gray-300' : 'border-gray-200 bg-white/80 text-gray-400 group-hover:text-indigo-500')}`}><SnippetIcon size={16}/></span>
                        <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className={`min-w-0 flex-1 truncate text-xs font-semibold ${active ? (darkMode ? 'text-white' : 'text-indigo-950') : ''}`}>{snippet.title}</span><ChevronRight size={13} className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${active ? 'text-indigo-400' : darkMode ? 'text-gray-600' : 'text-gray-300'}`}/></span><span className={`mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] ${mutedText(darkMode)}`}><span>{snippet.category_name || 'Sin categoría'}</span><span>·</span><span className="uppercase tracking-wide">{snippet.language || 'text'}</span></span><span className={`mt-2 block line-clamp-2 break-all font-mono text-[10px] leading-5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{snippet.content}</span></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {!loading && <footer className={`flex items-center justify-between border-t px-4 py-2.5 text-[10px] ${darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}><span>{categories.length} categorías disponibles</span><button type="button" onClick={() => setShowCategoryManager(true)} className="font-semibold text-indigo-400 transition hover:text-indigo-300">Administrar categorías</button></footer>}
          </section>

          <section className={`min-h-[420px] overflow-hidden rounded-2xl border shadow-xl shadow-gray-900/[0.03] backdrop-blur-xl ${surface(darkMode)}`}>
            {selected ? (
              <>
                <header className={`flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5 ${darkMode ? 'border-gray-800/90' : 'border-gray-200/80'}`}>
                  <div className="flex min-w-0 items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${darkMode ? 'border-indigo-400/20 bg-indigo-500/[0.08] text-indigo-300' : 'border-indigo-200 bg-indigo-50/90 text-indigo-600'}`}><SelectedIcon size={18}/></span><div className="min-w-0"><p className={`text-[10px] font-bold uppercase tracking-[.16em] ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>{selected.category_name || 'Sin categoría'} <span className={mutedText(darkMode)}>· {selectedLanguage}</span></p><h2 className="mt-1.5 break-words text-base font-bold tracking-tight">{selected.title}</h2><p className={`mt-1 text-[10px] ${mutedText(darkMode)}`}>Fragmento #{selected.id}</p></div></div>
                  <div className="flex shrink-0 gap-1.5 self-end sm:self-start">
                    <button type="button" onClick={() => copy(selected.content)} title="Copiar código" aria-label="Copiar código" className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${darkMode ? 'border-gray-700 text-gray-400 hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-indigo-200' : 'border-gray-200 bg-white/80 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600'}`}><Copy size={14}/></button>
                    <button type="button" onClick={() => openEdit(selected)} title="Editar snippet" aria-label="Editar snippet" className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-white/[0.05] hover:text-white' : 'border-gray-200 bg-white/80 text-gray-500 hover:bg-white hover:text-indigo-600'}`}><Pencil size={14}/></button>
                    <button type="button" onClick={() => requestDeleteSnippet(selected)} title="Eliminar snippet" aria-label="Eliminar snippet" className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${darkMode ? 'border-gray-700 text-gray-500 hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-300' : 'border-gray-200 bg-white/80 text-gray-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'}`}><Trash2 size={14}/></button>
                  </div>
                </header>
                <div className="p-4 sm:p-5">
                  <div className={`mb-2 flex items-center justify-between text-[10px] font-semibold ${mutedText(darkMode)}`}><span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>{selectedLanguage.toUpperCase()}</span><span>{selected.content.length.toLocaleString('es-CO')} caracteres</span></div>
                  <div className={`overflow-hidden rounded-xl border shadow-inner ${darkMode ? 'border-gray-700/70 bg-[#080D18]' : 'border-gray-200 bg-[#111827]'}`}>
                    <div className="flex items-center gap-1.5 border-b border-white/[0.07] px-3 py-2.5"><span className="h-2 w-2 rounded-full bg-rose-400/80"/><span className="h-2 w-2 rounded-full bg-amber-300/80"/><span className="h-2 w-2 rounded-full bg-emerald-400/80"/><span className="ml-auto font-mono text-[9px] text-gray-500">{selectedLanguage.toUpperCase()}</span></div>
                    <pre className="max-h-[520px] min-h-[280px] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[11px] leading-6 text-slate-200 selection:bg-indigo-500/30"><code>{selected.content}</code></pre>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className={`text-[10px] ${mutedText(darkMode)}`}>Contenido de la biblioteca técnica</p><button type="button" onClick={() => copy(selected.content)} className={primaryButton}><Copy size={14}/> Copiar contenido</button></div>
                </div>
              </>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
                <div className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border ${darkMode ? 'border-indigo-400/20 bg-indigo-500/[0.08] text-indigo-300' : 'border-indigo-200 bg-white/80 text-indigo-600'}`}><Code2 size={26}/><span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500 text-white"><Sparkles size={10}/></span></div>
                <h2 className="text-sm font-bold">Tu espacio de código</h2><p className={`mt-1 max-w-xs text-xs leading-5 ${mutedText(darkMode)}`}>Selecciona un snippet de la biblioteca para leerlo, editarlo o copiarlo sin perder el formato.</p>
                <button type="button" onClick={openCreate} className={`${primaryButton} mt-4`}><Plus size={14}/> Crear snippet</button>
              </div>
            )}
          </section>
        </section>
      </div>

      <AuraModal open={showForm} onClose={() => { setShowForm(false); setEditing(null); setError(''); }} title={editing ? 'Editar snippet' : 'Nuevo snippet'} description="Guarda un comando o consulta para reutilizarla en el equipo." icon={Code2} maxWidthClass="max-w-2xl">
        <form onSubmit={saveSnippet} className="space-y-4 p-5">
          {error && <div role="alert" className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${darkMode ? 'border-rose-400/20 bg-rose-400/[0.07] text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-700'}`}><AlertCircle size={14} className="mt-0.5 shrink-0"/><span>{error}</span></div>}
          <label className={`block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Título
            <input required maxLength={180} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={`${fieldClass(darkMode)} mt-2`} placeholder="Ej. Consultar productos sin existencia" autoFocus/>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={`block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Categoría
              <select value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })} className={`${fieldClass(darkMode)} mt-2`}><option value="">Sin categoría</option>{categories.map((item) => <option key={item.id} value={String(item.id)}>{item.name}</option>)}</select>
            </label>
            <label className={`block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Lenguaje
              <select value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value })} className={`${fieldClass(darkMode)} mt-2`}>{languages.map((value) => <option key={value} value={value}>{value.toUpperCase()}</option>)}</select>
            </label>
          </div>
          <label className={`block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Contenido
            <textarea required rows={11} maxLength={50000} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} className={`${fieldClass(darkMode)} mt-2 resize-y font-mono text-[11px] leading-6`} placeholder="Pega aquí la consulta, comando o script..."/>
          </label>
          <div className={`flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); setError(''); }} className={secondaryButton(darkMode)}>Cancelar</button>
            <button type="submit" disabled={saving} className={primaryButton}>{saving ? <RefreshCw size={14} className="animate-spin"/> : <Check size={14}/>} {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Guardar snippet'}</button>
          </div>
        </form>
      </AuraModal>

      <AuraModal open={showCategoryManager} onClose={() => { setShowCategoryManager(false); resetCategoryEditor(); setError(''); }} title="Administrar categorías" description="Organiza la biblioteca sin alterar el contenido de los snippets." icon={Settings2} maxWidthClass="max-w-md">
        <div className="space-y-4 p-5">
          {error && <div role="alert" className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${darkMode ? 'border-rose-400/20 bg-rose-400/[0.07] text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-700'}`}><AlertCircle size={14} className="mt-0.5 shrink-0"/><span>{error}</span></div>}
          <form onSubmit={saveCategory} className="space-y-2">
            <label className={`block text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{editingCategory ? 'Editar categoría' : 'Nueva categoría'}</label>
            <div className="flex gap-2"><input required maxLength={80} value={categoryDraft} onChange={(event) => setCategoryDraft(event.target.value)} className={fieldClass(darkMode)} placeholder="Ej. Bases de datos"/><button type="submit" disabled={saving || !categoryDraft.trim()} className={`${primaryButton} shrink-0 px-3`} aria-label={editingCategory ? 'Guardar categoría' : 'Crear categoría'}>{saving ? <RefreshCw size={14} className="animate-spin"/> : editingCategory ? <Check size={15}/> : <Plus size={15}/>}</button></div>
            {editingCategory && <button type="button" onClick={resetCategoryEditor} className="text-[11px] font-medium text-indigo-400 transition hover:text-indigo-300">Cancelar edición</button>}
          </form>
          <div className={`border-t pt-3 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="mb-2 flex items-center justify-between"><p className={`text-[10px] font-bold uppercase tracking-[.16em] ${mutedText(darkMode)}`}>Categorías existentes</p><span className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{categories.length}</span></div>
            {categories.length === 0 ? <div className={`rounded-xl border border-dashed p-5 text-center text-xs ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'}`}>Todavía no hay categorías.</div> : <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">{categories.map((item) => <div key={item.id} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${darkMode ? 'border-gray-800 bg-gray-900/45' : 'border-gray-200/80 bg-white/70'}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800 text-indigo-300' : 'border-gray-200 bg-gray-50 text-indigo-600'}`}><Tag size={14}/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{item.name}</span><span className={`mt-0.5 block text-[10px] ${mutedText(darkMode)}`}>{item.snippets_count ?? snippets.filter((snippet) => snippet.category_id === item.id).length} snippets</span></span><button type="button" title="Editar categoría" onClick={() => { setEditingCategory(item); setCategoryDraft(item.name); setError(''); }} className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${darkMode ? 'text-gray-500 hover:bg-white/[0.05] hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-indigo-600'}`}><Pencil size={13}/></button><button type="button" title="Eliminar categoría" onClick={() => requestDeleteCategory(item)} className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${darkMode ? 'text-gray-500 hover:bg-rose-500/10 hover:text-rose-300' : 'text-gray-400 hover:bg-rose-50 hover:text-rose-600'}`}><Trash2 size={13}/></button></div>)}</div>}
          </div>
          <div className={`flex justify-end border-t pt-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}><button type="button" onClick={() => { setShowCategoryManager(false); resetCategoryEditor(); setError(''); }} className={secondaryButton(darkMode)}>Listo</button></div>
        </div>
      </AuraModal>

      <AuraModal open={Boolean(confirmTarget)} onClose={() => setConfirmTarget(null)} title={confirmTarget?.kind === 'category' ? 'Eliminar categoría' : 'Eliminar snippet'} description="Confirma esta acción antes de continuar." icon={Trash2} maxWidthClass="max-w-sm">
        <div className="space-y-4 p-5">
          {confirmTarget?.kind === 'category' ? (
            <p className={`text-sm leading-6 ${mutedText(darkMode)}`}>¿Eliminar la categoría <strong className={darkMode ? 'text-gray-100' : 'text-gray-900'}>{confirmTarget.item.name}</strong>? Los snippets se conservarán, pero quedarán sin categoría.</p>
          ) : (
            <p className={`text-sm leading-6 ${mutedText(darkMode)}`}>¿Eliminar el snippet <strong className={darkMode ? 'text-gray-100' : 'text-gray-900'}>{confirmTarget?.item.title}</strong>? Esta acción no se puede deshacer.</p>
          )}
          <div className={`flex justify-end gap-2 border-t pt-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}><button type="button" onClick={() => setConfirmTarget(null)} className={secondaryButton(darkMode)}>Cancelar</button><button type="button" disabled={saving} onClick={confirmDelete} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50">{saving ? <RefreshCw size={14} className="animate-spin"/> : <Trash2 size={14}/>} Eliminar</button></div>
        </div>
      </AuraModal>
    </main>
  );
}
