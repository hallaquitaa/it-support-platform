import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowLeftRight, CalendarClock, Check, ClipboardCheck,
  Clock3, Cpu, Download, FileClock, History, Laptop, Loader2, Package,
  Plus, RefreshCw, Save, Search, Tag, User, Wrench, X
} from 'lucide-react';
import hardwareAssetService from '../../services/hardwareAssetService';

const input = 'w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/10 dark:border-white/[0.09] dark:bg-[#0A0E17]/80 dark:text-slate-100';
const button = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white/75 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/70 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.09] dark:bg-white/[0.035] dark:text-slate-200 dark:hover:bg-white/[0.07]';
const primary = 'inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-950/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50';
const panel = 'rounded-2xl border border-slate-200/70 bg-white/[0.76] shadow-xl shadow-slate-300/10 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#111827]/[0.78] dark:shadow-black/20';
const label = 'mb-1.5 block text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500 dark:text-slate-400';
const today = () => new Date().toISOString().slice(0, 10);
const errorText = (error) => error?.response?.data?.error || error?.message || 'No se pudo completar la operación.';

function Metric({ icon: Icon, title, value, hint }) {
  return <div className="rounded-xl border border-slate-200/70 bg-white/60 p-3 dark:border-white/[0.06] dark:bg-white/[0.025]">
    <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</span><Icon size={15} className="text-indigo-500" /></div>
    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value ?? '—'}</p>
    <p className="mt-1 text-[10px] text-slate-500">{hint}</p>
  </div>;
}

function Field({ title, children }) {
  return <label className="block min-w-0"><span className={label}>{title}</span>{children}</label>;
}

export default function InventoryAdvancedPanel({ hardware = [], branches = [], onRefresh }) {
  const [assetId, setAssetId] = useState(hardware[0]?.id ? String(hardware[0].id) : '');
  const [overview, setOverview] = useState(null);
  const [details, setDetails] = useState(null);
  const [form, setForm] = useState({});
  const [tab, setTab] = useState('profile');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [duplicates, setDuplicates] = useState(null);
  const [componentForm, setComponentForm] = useState({ component_type: 'RAM', name: '', manufacturer: '', model: '', serial_number: '', capacity: '', installed_at: today(), notes: '' });
  const [loanForm, setLoanForm] = useState({ borrower_name: '', borrower_email: '', checkout_date: today(), due_date: today(), notes: '' });
  const [transferForm, setTransferForm] = useState({ to_branch_id: '', transfer_date: today(), requested_by: '', approved_by: '', reason: '', status: 'completed' });
  const [auditForm, setAuditForm] = useState({ audit_date: today(), result: 'verified', audited_by: '', notes: '' });
  const [eventForm, setEventForm] = useState({ title: '', description: '' });

  const selected = useMemo(() => hardware.find((item) => String(item.id) === String(assetId)), [hardware, assetId]);

  const loadOverview = useCallback(async () => {
    try {
      const [summary, duplicateData] = await Promise.all([
        hardwareAssetService.getOverview(),
        hardwareAssetService.getDuplicates()
      ]);
      setOverview(summary);
      setDuplicates(duplicateData);
    } catch (e) {
      setError(errorText(e));
    }
  }, []);

  const loadAsset = useCallback(async () => {
    if (!assetId) { setDetails(null); return; }
    try {
      setError('');
      const data = await hardwareAssetService.getDetails(assetId);
      setDetails(data);
      setForm({
        asset_tag: data.hardware.asset_tag || '',
        assigned_to: data.hardware.assigned_to || '',
        department: data.hardware.department || '',
        physical_location: data.hardware.physical_location || '',
        purchase_cost: data.hardware.purchase_cost ?? 0,
        salvage_value: data.hardware.salvage_value ?? 0,
        useful_life_years: data.hardware.useful_life_years ?? 5,
        depreciation_method: data.hardware.depreciation_method || 'straight_line',
        asset_condition: data.hardware.asset_condition || 'good',
        image_url: data.hardware.image_url || '',
        last_audit_date: data.hardware.last_audit_date || '',
        discovery_source: data.hardware.discovery_source || 'manual'
      });
      if (data.hardware.branch_id) setTransferForm((current) => ({ ...current, to_branch_id: '' }));
    } catch (e) {
      setError(errorText(e));
    }
  }, [assetId]);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => {
    if (!assetId && hardware.length) setAssetId(String(hardware[0].id));
  }, [assetId, hardware]);
  useEffect(() => { loadAsset(); }, [loadAsset]);

  const mutate = async (operation, successMessage) => {
    if (!assetId) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await operation();
      setNotice(successMessage);
      await Promise.all([loadAsset(), loadOverview()]);
      if (onRefresh) await onRefresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const saveDetails = (event) => {
    event.preventDefault();
    return mutate(() => hardwareAssetService.saveDetails(assetId, {
      ...form,
      purchase_cost: Number(form.purchase_cost || 0),
      salvage_value: Number(form.salvage_value || 0),
      useful_life_years: Number(form.useful_life_years || 5)
    }), 'Ficha patrimonial guardada.');
  };

  const exportCsv = () => {
    const rows = [
      ['ID', 'Etiqueta patrimonial', 'Tipo', 'Marca/modelo', 'Serial', 'Estado', 'Sucursal', 'Responsable', 'Departamento', 'Costo compra', 'Garantía'],
      ...hardware.map((item) => [item.id, item.asset_tag || '', item.type || '', item.brand_model || '', item.serial_number || '', item.status || '', item.branch_name || '', item.assigned_to || '', item.department || '', item.purchase_cost ?? '', item.warranty_end || ''])
    ];
    const csv = rows.map((row) => row.map((cell) => '"' + String(cell ?? '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'inventario-hardware.csv'; link.click();
    URL.revokeObjectURL(url);
  };

  const fieldChange = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const purchaseCost = Number(form.purchase_cost || 0);
  const salvageValue = Number(form.salvage_value || 0);
  const lifeYears = Math.max(0.1, Number(form.useful_life_years || 5));
  const ageYears = details?.hardware?.purchase_date
    ? Math.max(0, (Date.now() - new Date(details.hardware.purchase_date).getTime()) / (365.25 * 86400000))
    : 0;
  const accumulatedDepreciation = form.depreciation_method === 'none'
    ? 0
    : Math.min(Math.max(0, purchaseCost - salvageValue), Math.max(0, purchaseCost - salvageValue) * Math.min(1, ageYears / lifeYears));
  const currentValue = Math.max(salvageValue, purchaseCost - accumulatedDepreciation);
  const duplicateCount = ['serials', 'assetTags', 'serviceTags', 'macAddresses', 'ipAddresses'].reduce((sum, key) => sum + (duplicates?.[key]?.length || 0), 0);
  const tabs = [
    ['profile', 'Ficha patrimonial', Tag],
    ['components', 'Componentes', Cpu],
    ['loans', 'Préstamos', User],
    ['transfers', 'Traslados', ArrowLeftRight],
    ['audit', 'Auditoría', ClipboardCheck],
    ['history', 'Historial', History]
  ];

  return <section className={panel + ' space-y-4 p-4 sm:p-5'}>
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-500"><Activity size={19} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500">AURA · Gestión avanzada</p><h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Ciclo de vida del hardware</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Asignación, componentes, préstamos, traslados, auditoría y depreciación.</p></div></div>
      <div className="flex flex-wrap gap-2"><button type="button" className={button} onClick={exportCsv}><Download size={14} />Exportar CSV</button><button type="button" className={button} onClick={() => { loadOverview(); loadAsset(); }}><RefreshCw size={14} />Actualizar</button></div>
    </div>

    <div className="grid grid-cols-2 gap-2 xl:grid-cols-5">
      <Metric icon={Package} title="Activos" value={overview?.total ?? hardware.length} hint="Equipos registrados" />
      <Metric icon={CalendarClock} title="Garantías" value={overview?.warrantiesExpiring ?? '—'} hint="Vencen en 30 días" />
      <Metric icon={Clock3} title="Préstamos vencidos" value={overview?.overdueLoans ?? '—'} hint="Pendientes de devolución" />
      <Metric icon={Cpu} title="Componentes" value={overview?.installedComponents ?? '—'} hint="Instalados actualmente" />
      <Metric icon={ClipboardCheck} title="Auditorías" value={overview?.auditDue ?? '—'} hint="Sin verificar en 180 días" />
    </div>

    {duplicateCount > 0 && <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-xs text-amber-700 dark:text-amber-300"><AlertTriangle size={15} className="mt-0.5 shrink-0" /><span>Se detectaron {duplicateCount} grupos de posibles duplicados entre seriales, etiquetas, service tags, MAC o IP. Revísalos antes de importar más equipos.</span></div>}

    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,2fr)]">
      <div className="space-y-3">
        <Field title="Equipo que vas a administrar">
          <select className={input} value={assetId} onChange={(event) => setAssetId(event.target.value)}>
            <option value="">Seleccionar equipo...</option>
            {hardware.map((item) => <option key={item.id} value={String(item.id)}>{item.service_tag || item.serial_number || ('IT-' + item.id)} · {item.brand_model || item.type}</option>)}
          </select>
        </Field>
        {selected && <div className="rounded-xl border border-slate-200/70 bg-white/55 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{selected.type}</p><p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{selected.brand_model || 'Equipo sin modelo'}</p><p className="mt-1 font-mono text-[11px] text-slate-500">{selected.serial_number || 'Sin serial'}</p><p className="mt-2 text-[11px] text-slate-500">{selected.branch_name || 'Sin sucursal'}</p></div>}
        <div className="rounded-xl border border-slate-200/70 p-3 dark:border-white/[0.06]"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Valor estimado actual</p><p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(currentValue || 0)}</p><p className="mt-1 text-[10px] text-slate-500">Depreciación lineal estimada; requiere fecha y costo de compra.</p></div>
      </div>

      <div className="min-w-0 space-y-3">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200/70 bg-slate-100/60 p-1 dark:border-white/[0.06] dark:bg-black/10">
          {tabs.map(([id, title, Icon]) => <button key={id} type="button" onClick={() => setTab(id)} className={'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition ' + (tab === id ? 'bg-white text-indigo-600 shadow-sm dark:bg-white/[0.09] dark:text-indigo-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white')}><Icon size={13} />{title}</button>)}
        </div>

        {!assetId ? <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 dark:border-white/10">Selecciona un equipo para administrar sus datos.</div> : !details ? <div className="flex min-h-48 items-center justify-center gap-2 text-xs text-slate-500"><Loader2 size={16} className="animate-spin" />Cargando ficha avanzada...</div> : <>
          {tab === 'profile' && <form onSubmit={saveDetails} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field title="Etiqueta patrimonial"><input className={input} value={form.asset_tag || ''} onChange={(e) => fieldChange('asset_tag', e.target.value)} placeholder="IT-BOG-0001" /></Field>
              <Field title="Responsable / usuario"><input className={input} value={form.assigned_to || ''} onChange={(e) => fieldChange('assigned_to', e.target.value)} placeholder="Nombre del empleado" /></Field>
              <Field title="Departamento"><input className={input} value={form.department || ''} onChange={(e) => fieldChange('department', e.target.value)} placeholder="Operaciones, Finanzas..." /></Field>
              <Field title="Ubicación física"><input className={input} value={form.physical_location || ''} onChange={(e) => fieldChange('physical_location', e.target.value)} placeholder="Piso, oficina, puesto..." /></Field>
              <Field title="Costo de compra (COP)"><input type="number" min="0" step="1000" className={input} value={form.purchase_cost ?? 0} onChange={(e) => fieldChange('purchase_cost', e.target.value)} /></Field>
              <Field title="Valor residual (COP)"><input type="number" min="0" step="1000" className={input} value={form.salvage_value ?? 0} onChange={(e) => fieldChange('salvage_value', e.target.value)} /></Field>
              <Field title="Vida útil (años)"><input type="number" min="0.1" max="100" step="0.5" className={input} value={form.useful_life_years ?? 5} onChange={(e) => fieldChange('useful_life_years', e.target.value)} /></Field>
              <Field title="Depreciación"><select className={input} value={form.depreciation_method || 'straight_line'} onChange={(e) => fieldChange('depreciation_method', e.target.value)}><option value="straight_line">Lineal</option><option value="none">Sin depreciación</option></select></Field>
              <Field title="Condición física"><select className={input} value={form.asset_condition || 'good'} onChange={(e) => fieldChange('asset_condition', e.target.value)}><option value="new">Nuevo</option><option value="good">Bueno</option><option value="fair">Regular</option><option value="poor">Deficiente</option><option value="retired">Retirado</option></select></Field>
              <Field title="Última auditoría"><input type="date" className={input} value={form.last_audit_date || ''} onChange={(e) => fieldChange('last_audit_date', e.target.value)} /></Field>
            </div>
            <Field title="URL de fotografía del equipo"><input className={input} value={form.image_url || ''} onChange={(e) => fieldChange('image_url', e.target.value)} placeholder="https://..." /></Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="rounded-xl border border-indigo-500/15 bg-indigo-500/[0.04] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Depreciación acumulada</p><p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(accumulatedDepreciation || 0)}</p></div><div className="rounded-xl border border-indigo-500/15 bg-indigo-500/[0.04] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Valor neto estimado</p><p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(currentValue || 0)}</p></div></div>
            <div className="flex justify-end"><button className={primary} type="submit" disabled={busy}><Save size={14} />Guardar ficha</button></div>
          </form>}

          {tab === 'components' && <div className="space-y-3">
            <form className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200/70 p-3 dark:border-white/[0.06] sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); mutate(() => hardwareAssetService.addComponent(assetId, componentForm), 'Componente registrado.'); setComponentForm((v) => ({ ...v, name: '', manufacturer: '', model: '', serial_number: '', capacity: '', notes: '' })); }}>
              <Field title="Tipo"><select className={input} value={componentForm.component_type} onChange={(e) => setComponentForm((v) => ({ ...v, component_type: e.target.value }))}>{['RAM','Disco','SSD','HDD','GPU','CPU','Batería','Fuente','Tarjeta de red','Otro'].map((v) => <option key={v}>{v}</option>)}</select></Field>
              <Field title="Nombre *"><input required className={input} value={componentForm.name} onChange={(e) => setComponentForm((v) => ({ ...v, name: e.target.value }))} placeholder="Ej. Kingston Fury" /></Field>
              <Field title="Fabricante"><input className={input} value={componentForm.manufacturer} onChange={(e) => setComponentForm((v) => ({ ...v, manufacturer: e.target.value }))} /></Field>
              <Field title="Modelo"><input className={input} value={componentForm.model} onChange={(e) => setComponentForm((v) => ({ ...v, model: e.target.value }))} /></Field>
              <Field title="Serial del componente"><input className={input} value={componentForm.serial_number} onChange={(e) => setComponentForm((v) => ({ ...v, serial_number: e.target.value }))} /></Field>
              <Field title="Capacidad"><input className={input} value={componentForm.capacity} onChange={(e) => setComponentForm((v) => ({ ...v, capacity: e.target.value }))} placeholder="16 GB / 1 TB" /></Field>
              <div className="sm:col-span-2 flex justify-end"><button className={primary} disabled={busy}><Plus size={14} />Añadir componente</button></div>
            </form>
            <div className="space-y-2">{(details.components || []).length ? details.components.map((item) => <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-slate-200/70 p-3 dark:border-white/[0.06] sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-900 dark:text-white">{item.name} <span className="font-normal text-slate-500">· {item.component_type}</span></p><p className="mt-1 text-[10px] text-slate-500">{[item.manufacturer, item.model, item.capacity, item.serial_number].filter(Boolean).join(' · ') || 'Sin datos adicionales'}</p></div><span className="text-[10px] text-slate-500">{item.status === 'installed' ? 'Instalado' : item.status === 'faulty' ? 'Defectuoso' : 'Retirado'}</span>{item.status === 'installed' && <button className={button} disabled={busy} onClick={() => mutate(() => hardwareAssetService.updateComponent(assetId, item.id, { status: 'removed' }), 'Componente marcado como retirado.')} type="button">Retirar</button>}</div>) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500 dark:border-white/10">Todavía no hay componentes registrados.</p>}</div>
          </div>}

          {tab === 'loans' && <div className="space-y-3">
            <form className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200/70 p-3 dark:border-white/[0.06] sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); mutate(() => hardwareAssetService.addLoan(assetId, loanForm), 'Préstamo registrado.'); setLoanForm((v) => ({ ...v, borrower_name: '', borrower_email: '', notes: '' })); }}>
              <Field title="Persona responsable *"><input required className={input} value={loanForm.borrower_name} onChange={(e) => setLoanForm((v) => ({ ...v, borrower_name: e.target.value }))} /></Field>
              <Field title="Correo"><input type="email" className={input} value={loanForm.borrower_email} onChange={(e) => setLoanForm((v) => ({ ...v, borrower_email: e.target.value }))} /></Field>
              <Field title="Fecha de entrega"><input type="date" required className={input} value={loanForm.checkout_date} onChange={(e) => setLoanForm((v) => ({ ...v, checkout_date: e.target.value }))} /></Field>
              <Field title="Devolución prevista"><input type="date" required min={loanForm.checkout_date} className={input} value={loanForm.due_date} onChange={(e) => setLoanForm((v) => ({ ...v, due_date: e.target.value }))} /></Field>
              <div className="sm:col-span-2 flex justify-end"><button className={primary} disabled={busy}><Plus size={14} />Registrar préstamo</button></div>
            </form>
            <div className="space-y-2">{(details.loans || []).length ? details.loans.map((loan) => <div key={loan.id} className="flex flex-col gap-2 rounded-xl border border-slate-200/70 p-3 dark:border-white/[0.06] sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-900 dark:text-white">{loan.borrower_name}</p><p className="mt-1 text-[10px] text-slate-500">Entrega {loan.checkout_date} · Devolución {loan.due_date}</p></div><span className={'text-[10px] font-semibold ' + (loan.status === 'active' && loan.due_date < today() ? 'text-rose-500' : 'text-slate-500')}>{loan.status === 'returned' ? 'Devuelto' : loan.due_date < today() ? 'Vencido' : 'Activo'}</span>{loan.status === 'active' && <button className={button} disabled={busy} onClick={() => mutate(() => hardwareAssetService.returnLoan(assetId, loan.id), 'Devolución registrada.')} type="button"><Check size={13} />Marcar devuelto</button>}</div>) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500 dark:border-white/10">No hay préstamos para este equipo.</p>}</div>
          </div>}

          {tab === 'transfers' && <div className="space-y-3">
            <form className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200/70 p-3 dark:border-white/[0.06] sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); mutate(() => hardwareAssetService.addTransfer(assetId, transferForm), 'Traslado registrado.'); setTransferForm((v) => ({ ...v, requested_by: '', approved_by: '', reason: '' })); }}>
              <Field title="Sucursal destino *"><select required className={input} value={transferForm.to_branch_id} onChange={(e) => setTransferForm((v) => ({ ...v, to_branch_id: e.target.value }))}><option value="">Seleccionar sucursal...</option>{branches.filter((b) => String(b.id) !== String(selected?.branch_id)).map((b) => <option key={b.id} value={String(b.id)}>{b.name}</option>)}</select></Field>
              <Field title="Fecha del traslado"><input type="date" required className={input} value={transferForm.transfer_date} onChange={(e) => setTransferForm((v) => ({ ...v, transfer_date: e.target.value }))} /></Field>
              <Field title="Solicitado por"><input className={input} value={transferForm.requested_by} onChange={(e) => setTransferForm((v) => ({ ...v, requested_by: e.target.value }))} /></Field>
              <Field title="Autorizado por"><input className={input} value={transferForm.approved_by} onChange={(e) => setTransferForm((v) => ({ ...v, approved_by: e.target.value }))} /></Field>
              <Field title="Motivo"><input className={input} value={transferForm.reason} onChange={(e) => setTransferForm((v) => ({ ...v, reason: e.target.value }))} /></Field>
              <Field title="Estado"><select className={input} value={transferForm.status} onChange={(e) => setTransferForm((v) => ({ ...v, status: e.target.value }))}><option value="completed">Completado</option><option value="pending">Pendiente de aprobación</option></select></Field>
              <div className="sm:col-span-2 flex justify-end"><button className={primary} disabled={busy}><Plus size={14} />Registrar traslado</button></div>
            </form>
            <div className="space-y-2">{(details.transfers || []).length ? details.transfers.map((t) => <div key={t.id} className="rounded-xl border border-slate-200/70 p-3 dark:border-white/[0.06]"><div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white"><ArrowLeftRight size={14} className="text-indigo-500" />{t.from_branch_name || 'Sin sede'} → {t.to_branch_name || 'Sin sede'}</div><p className="mt-1 text-[10px] text-slate-500">{t.transfer_date} · {t.status === 'completed' ? 'Completado' : 'Pendiente'}{t.reason ? ' · ' + t.reason : ''}</p></div>) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500 dark:border-white/10">No hay traslados registrados.</p>}</div>
          </div>}

          {tab === 'audit' && <div className="space-y-3">
            <form className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200/70 p-3 dark:border-white/[0.06] sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); mutate(() => hardwareAssetService.addAudit(assetId, auditForm), 'Auditoría guardada.'); setAuditForm((v) => ({ ...v, notes: '' })); }}>
              <Field title="Fecha"><input type="date" required className={input} value={auditForm.audit_date} onChange={(e) => setAuditForm((v) => ({ ...v, audit_date: e.target.value }))} /></Field>
              <Field title="Resultado"><select className={input} value={auditForm.result} onChange={(e) => setAuditForm((v) => ({ ...v, result: e.target.value }))}><option value="verified">Verificado</option><option value="missing">No localizado</option><option value="damaged">Dañado</option><option value="data_mismatch">Datos no coinciden</option></select></Field>
              <Field title="Auditor"><input className={input} value={auditForm.audited_by} onChange={(e) => setAuditForm((v) => ({ ...v, audited_by: e.target.value }))} /></Field>
              <Field title="Observaciones"><input className={input} value={auditForm.notes} onChange={(e) => setAuditForm((v) => ({ ...v, notes: e.target.value }))} /></Field>
              <div className="sm:col-span-2 flex justify-end"><button className={primary} disabled={busy}><ClipboardCheck size={14} />Guardar auditoría</button></div>
            </form>
            <div className="space-y-2">{(details.audits || []).length ? details.audits.map((a) => <div key={a.id} className="rounded-xl border border-slate-200/70 p-3 dark:border-white/[0.06]"><p className="text-xs font-semibold text-slate-900 dark:text-white">{({ verified: 'Verificado', missing: 'No localizado', damaged: 'Dañado', data_mismatch: 'Datos no coinciden' })[a.result] || a.result}</p><p className="mt-1 text-[10px] text-slate-500">{a.audit_date}{a.audited_by ? ' · ' + a.audited_by : ''}{a.notes ? ' · ' + a.notes : ''}</p></div>) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500 dark:border-white/10">No hay auditorías registradas.</p>}</div>
          </div>}

          {tab === 'history' && <div className="space-y-2">{(details.events || []).length ? details.events.map((event) => <div key={event.id} className="flex gap-3 rounded-xl border border-slate-200/70 p-3 dark:border-white/[0.06]"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-indigo-500/15 bg-indigo-500/[0.06] text-indigo-500"><FileClock size={14} /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-900 dark:text-white">{event.title}</p>{event.description && <p className="mt-1 whitespace-pre-wrap text-[11px] leading-5 text-slate-500 dark:text-slate-400">{event.description}</p>}<p className="mt-1 text-[10px] text-slate-400">{event.created_at}{event.actor_name ? ' · ' + event.actor_name : ''}</p></div></div>) : <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500 dark:border-white/10">Aún no hay eventos registrados.</p>}
            <form className="grid gap-2 rounded-xl border border-slate-200/70 p-3 dark:border-white/[0.06]" onSubmit={(e) => { e.preventDefault(); mutate(() => hardwareAssetService.addEvent(assetId, { event_type: 'note', ...eventForm }), 'Nota añadida al historial.'); setEventForm({ title: '', description: '' }); }}>
              <Field title="Añadir nota al historial"><input required className={input} value={eventForm.title} onChange={(e) => setEventForm((v) => ({ ...v, title: e.target.value }))} placeholder="Título del evento" /></Field>
              <textarea className={input} rows={2} value={eventForm.description} onChange={(e) => setEventForm((v) => ({ ...v, description: e.target.value }))} placeholder="Descripción o contexto..." />
              <div className="flex justify-end"><button className={primary} disabled={busy}><Plus size={13} />Añadir nota</button></div>
            </form>
          </div>}
        </>}
      </div>
    </div>

    {(error || notice) && <div className={'flex items-start justify-between gap-3 rounded-xl border p-3 text-xs ' + (error ? 'border-rose-500/20 bg-rose-500/[0.06] text-rose-600 dark:text-rose-300' : 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-300')}><span>{error || notice}</span><button type="button" onClick={() => { setError(''); setNotice(''); }}><X size={14} /></button></div>}
  </section>;
}
