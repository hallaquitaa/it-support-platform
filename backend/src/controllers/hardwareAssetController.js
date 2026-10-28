import { openDb } from '../config/database.js';

const actorId = (req) => req.user?.id || req.user?.userId || null;

async function requireHardware(db, id) {
  return db.get('SELECT id, branch_id, status FROM hardware WHERE id = ?', [id]);
}

export const getHardwareAssetOverview = async (req, res) => {
  try {
    const db = await openDb();
    const [total, warranties, loans, components, audits, obsolete] = await Promise.all([
      db.get('SELECT COUNT(*) AS total FROM hardware'),
      db.get("SELECT COUNT(*) AS total FROM hardware h LEFT JOIN hardware_asset_details d ON d.hardware_id = h.id WHERE h.warranty_end IS NOT NULL AND date(h.warranty_end) BETWEEN date('now') AND date('now', '+30 day')"),
      db.get("SELECT COUNT(*) AS total FROM hardware_loans WHERE status = 'active' AND date(due_date) < date('now')"),
      db.get("SELECT COUNT(*) AS total FROM hardware_components WHERE status = 'installed'"),
      db.get("SELECT COUNT(*) AS total FROM hardware h LEFT JOIN hardware_asset_details d ON d.hardware_id = h.id WHERE d.last_audit_date IS NULL OR date(d.last_audit_date) < date('now', '-180 day')"),
      db.get("SELECT COUNT(*) AS total FROM hardware h LEFT JOIN hardware_asset_details d ON d.hardware_id = h.id WHERE h.purchase_date IS NOT NULL AND date(h.purchase_date, '+' || COALESCE(d.useful_life_years, 5) || ' years') < date('now')")
    ]);
    res.json({
      total: total?.total || 0,
      warrantiesExpiring: warranties?.total || 0,
      overdueLoans: loans?.total || 0,
      installedComponents: components?.total || 0,
      auditDue: audits?.total || 0,
      obsolete: obsolete?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo cargar el resumen avanzado del inventario.' });
  }
};

export const getHardwareAssetDetails = async (req, res) => {
  try {
    const db = await openDb();
    const hardware = await db.get(`
      SELECT h.*, b.name AS branch_name, d.asset_tag, d.assigned_to, d.department,
             d.physical_location, d.purchase_cost, d.salvage_value, d.useful_life_years,
             d.depreciation_method, d.asset_condition, d.image_url, d.last_audit_date,
             d.discovery_source, d.updated_at AS details_updated_at
      FROM hardware h
      LEFT JOIN branches b ON b.id = h.branch_id
      LEFT JOIN hardware_asset_details d ON d.hardware_id = h.id
      WHERE h.id = ?
    `, [req.params.hardwareId]);
    if (!hardware) return res.status(404).json({ error: 'Equipo no encontrado.' });

    const [events, components, loans, transfers, audits] = await Promise.all([
      db.all('SELECT e.*, u.full_name AS actor_name FROM hardware_asset_events e LEFT JOIN users u ON u.id = e.performed_by WHERE e.hardware_id = ? ORDER BY e.created_at DESC, e.id DESC LIMIT 100', [hardware.id]),
      db.all('SELECT * FROM hardware_components WHERE hardware_id = ? ORDER BY CASE status WHEN \'installed\' THEN 0 ELSE 1 END, created_at DESC', [hardware.id]),
      db.all('SELECT * FROM hardware_loans WHERE hardware_id = ? ORDER BY created_at DESC LIMIT 50', [hardware.id]),
      db.all('SELECT t.*, fb.name AS from_branch_name, tb.name AS to_branch_name FROM hardware_transfers t LEFT JOIN branches fb ON fb.id = t.from_branch_id LEFT JOIN branches tb ON tb.id = t.to_branch_id WHERE t.hardware_id = ? ORDER BY t.transfer_date DESC, t.id DESC LIMIT 50', [hardware.id]),
      db.all('SELECT * FROM hardware_audits WHERE hardware_id = ? ORDER BY audit_date DESC, id DESC LIMIT 50', [hardware.id])
    ]);
    res.json({ hardware, events, components, loans, transfers, audits });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo cargar la ficha avanzada del equipo.' });
  }
};

export const updateHardwareAssetDetails = async (req, res) => {
  try {
    const db = await openDb();
    const id = Number(req.params.hardwareId);
    if (!await requireHardware(db, id)) return res.status(404).json({ error: 'Equipo no encontrado.' });

    const {
      asset_tag = null, assigned_to = null, department = null, physical_location = null,
      purchase_cost = 0, salvage_value = 0, useful_life_years = 5,
      depreciation_method = 'straight_line', asset_condition = 'good',
      image_url = null, last_audit_date = null, discovery_source = 'manual'
    } = req.body || {};

    if (purchase_cost !== null && (!Number.isFinite(Number(purchase_cost)) || Number(purchase_cost) < 0)) {
      return res.status(400).json({ error: 'El costo de compra debe ser un número positivo.' });
    }
    if (salvage_value !== null && (!Number.isFinite(Number(salvage_value)) || Number(salvage_value) < 0)) {
      return res.status(400).json({ error: 'El valor residual debe ser un número positivo.' });
    }
    if (!['straight_line', 'none'].includes(depreciation_method)) {
      return res.status(400).json({ error: 'Método de depreciación no válido.' });
    }

    await db.run(`
      INSERT INTO hardware_asset_details
        (hardware_id, asset_tag, assigned_to, department, physical_location, purchase_cost,
         salvage_value, useful_life_years, depreciation_method, asset_condition, image_url,
         last_audit_date, discovery_source, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(hardware_id) DO UPDATE SET
        asset_tag=excluded.asset_tag, assigned_to=excluded.assigned_to,
        department=excluded.department, physical_location=excluded.physical_location,
        purchase_cost=excluded.purchase_cost, salvage_value=excluded.salvage_value,
        useful_life_years=excluded.useful_life_years, depreciation_method=excluded.depreciation_method,
        asset_condition=excluded.asset_condition, image_url=excluded.image_url,
        last_audit_date=excluded.last_audit_date, discovery_source=excluded.discovery_source,
        updated_at=CURRENT_TIMESTAMP
    `, [
      id, asset_tag?.trim() || null, assigned_to?.trim() || null, department?.trim() || null,
      physical_location?.trim() || null, Number(purchase_cost || 0), Number(salvage_value || 0),
      Math.max(0.1, Number(useful_life_years || 5)), depreciation_method, asset_condition,
      image_url?.trim() || null, last_audit_date || null, discovery_source
    ]);

    await db.run(
      'INSERT INTO hardware_asset_events (hardware_id, event_type, title, description, performed_by) VALUES (?, ?, ?, ?, ?)',
      [id, 'details_updated', 'Ficha patrimonial actualizada', 'Se actualizaron los datos patrimoniales, de asignación o depreciación.', actorId(req)]
    );
    res.json({ success: true, message: 'Ficha patrimonial guardada.' });
  } catch (error) {
    const duplicate = /UNIQUE constraint failed: hardware_asset_details.asset_tag/i.test(error.message || '');
    res.status(duplicate ? 409 : 500).json({ error: duplicate ? 'Ya existe un equipo con esa etiqueta patrimonial.' : 'No se pudo guardar la ficha patrimonial.' });
  }
};

export const createHardwareAssetEvent = async (req, res) => {
  try {
    const db = await openDb();
    const id = Number(req.params.hardwareId);
    if (!await requireHardware(db, id)) return res.status(404).json({ error: 'Equipo no encontrado.' });
    const { event_type = 'note', title, description = '', metadata = null } = req.body || {};
    if (!title?.trim()) return res.status(400).json({ error: 'El título del evento es obligatorio.' });
    const result = await db.run(
      'INSERT INTO hardware_asset_events (hardware_id, event_type, title, description, metadata_json, performed_by) VALUES (?, ?, ?, ?, ?, ?)',
      [id, String(event_type).slice(0, 40), title.trim(), description.trim(), metadata ? JSON.stringify(metadata) : null, actorId(req)]
    );
    res.status(201).json(await db.get('SELECT * FROM hardware_asset_events WHERE id = ?', [result.lastID]));
  } catch {
    res.status(500).json({ error: 'No se pudo registrar el evento.' });
  }
};

export const createHardwareComponent = async (req, res) => {
  try {
    const db = await openDb();
    const id = Number(req.params.hardwareId);
    if (!await requireHardware(db, id)) return res.status(404).json({ error: 'Equipo no encontrado.' });
    const { component_type, name, manufacturer = '', model = '', serial_number = '', capacity = '', installed_at = null, notes = '' } = req.body || {};
    if (!component_type?.trim() || !name?.trim()) return res.status(400).json({ error: 'Tipo y nombre del componente son obligatorios.' });
    const result = await db.run(
      'INSERT INTO hardware_components (hardware_id, component_type, name, manufacturer, model, serial_number, capacity, installed_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, component_type.trim(), name.trim(), manufacturer.trim(), model.trim(), serial_number.trim(), capacity.trim(), installed_at || null, notes.trim()]
    );
    await db.run('INSERT INTO hardware_asset_events (hardware_id, event_type, title, description, performed_by) VALUES (?, ?, ?, ?, ?)', [id, 'component_added', 'Componente registrado', name.trim() + ' · ' + component_type.trim(), actorId(req)]);
    res.status(201).json(await db.get('SELECT * FROM hardware_components WHERE id = ?', [result.lastID]));
  } catch (error) {
    res.status(500).json({ error: 'No se pudo registrar el componente.' });
  }
};

export const updateHardwareComponent = async (req, res) => {
  try {
    const db = await openDb();
    const component = await db.get('SELECT * FROM hardware_components WHERE id = ? AND hardware_id = ?', [req.params.componentId, req.params.hardwareId]);
    if (!component) return res.status(404).json({ error: 'Componente no encontrado.' });
    const status = req.body?.status;
    if (!['installed', 'removed', 'faulty'].includes(status)) return res.status(400).json({ error: 'Estado de componente no válido.' });
    await db.run('UPDATE hardware_components SET status = ?, removed_at = CASE WHEN ? = \'removed\' THEN date(\'now\') ELSE removed_at END WHERE id = ?', [status, status, component.id]);
    await db.run('INSERT INTO hardware_asset_events (hardware_id, event_type, title, description, performed_by) VALUES (?, ?, ?, ?, ?)', [component.hardware_id, 'component_status', 'Estado de componente actualizado', component.name + ': ' + status, actorId(req)]);
    res.json(await db.get('SELECT * FROM hardware_components WHERE id = ?', [component.id]));
  } catch {
    res.status(500).json({ error: 'No se pudo actualizar el componente.' });
  }
};

export const createHardwareLoan = async (req, res) => {
  try {
    const db = await openDb();
    const id = Number(req.params.hardwareId);
    if (!await requireHardware(db, id)) return res.status(404).json({ error: 'Equipo no encontrado.' });
    const { borrower_name, borrower_email = '', checkout_date, due_date, notes = '' } = req.body || {};
    if (!borrower_name?.trim() || !checkout_date || !due_date || due_date < checkout_date) return res.status(400).json({ error: 'Indica responsable y fechas válidas para el préstamo.' });
    const active = await db.get("SELECT id FROM hardware_loans WHERE hardware_id = ? AND status = 'active'", [id]);
    if (active) return res.status(409).json({ error: 'Este equipo ya tiene un préstamo activo.' });
    const result = await db.run('INSERT INTO hardware_loans (hardware_id, borrower_name, borrower_email, checkout_date, due_date, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, borrower_name.trim(), borrower_email.trim(), checkout_date, due_date, notes.trim(), actorId(req)]);
    await db.run('INSERT INTO hardware_asset_events (hardware_id, event_type, title, description, performed_by) VALUES (?, ?, ?, ?, ?)', [id, 'loan_created', 'Préstamo registrado', borrower_name.trim() + ' · devolución prevista: ' + due_date, actorId(req)]);
    res.status(201).json(await db.get('SELECT * FROM hardware_loans WHERE id = ?', [result.lastID]));
  } catch {
    res.status(500).json({ error: 'No se pudo registrar el préstamo.' });
  }
};

export const returnHardwareLoan = async (req, res) => {
  try {
    const db = await openDb();
    const loan = await db.get('SELECT * FROM hardware_loans WHERE id = ? AND hardware_id = ?', [req.params.loanId, req.params.hardwareId]);
    if (!loan) return res.status(404).json({ error: 'Préstamo no encontrado.' });
    if (loan.status !== 'active') return res.status(409).json({ error: 'El préstamo ya está cerrado.' });
    await db.run("UPDATE hardware_loans SET status = 'returned', returned_at = date('now') WHERE id = ?", [loan.id]);
    await db.run('INSERT INTO hardware_asset_events (hardware_id, event_type, title, description, performed_by) VALUES (?, ?, ?, ?, ?)', [loan.hardware_id, 'loan_returned', 'Equipo devuelto', 'Préstamo de ' + loan.borrower_name + ' cerrado.', actorId(req)]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'No se pudo cerrar el préstamo.' });
  }
};

export const createHardwareTransfer = async (req, res) => {
  try {
    const db = await openDb();
    const id = Number(req.params.hardwareId);
    const item = await requireHardware(db, id);
    if (!item) return res.status(404).json({ error: 'Equipo no encontrado.' });
    const { to_branch_id, transfer_date, requested_by = '', approved_by = '', reason = '', status = 'completed' } = req.body || {};
    if (!to_branch_id || !transfer_date) return res.status(400).json({ error: 'Sucursal destino y fecha son obligatorias.' });
    if (!['pending', 'completed', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Estado del traslado no válido.' });
    if (Number(to_branch_id) === Number(item.branch_id) && status === 'completed') return res.status(400).json({ error: 'El equipo ya pertenece a esa sucursal.' });
    if (!await db.get('SELECT id FROM branches WHERE id = ?', [to_branch_id])) return res.status(400).json({ error: 'La sucursal destino no existe.' });
    const result = await db.run('INSERT INTO hardware_transfers (hardware_id, from_branch_id, to_branch_id, requested_by, approved_by, transfer_date, reason, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, item.branch_id, to_branch_id, requested_by.trim(), approved_by.trim(), transfer_date, reason.trim(), status, actorId(req)]);
    if (status === 'completed') {
      await db.run('UPDATE hardware SET branch_id = ? WHERE id = ?', [to_branch_id, id]);
      await db.run('INSERT INTO hardware_asset_events (hardware_id, event_type, title, description, performed_by) VALUES (?, ?, ?, ?, ?)', [id, 'transfer', 'Traslado de equipo', 'Traslado completado a la sucursal ID ' + to_branch_id + '. ' + reason.trim(), actorId(req)]);
    }
    res.status(201).json(await db.get('SELECT * FROM hardware_transfers WHERE id = ?', [result.lastID]));
  } catch {
    res.status(500).json({ error: 'No se pudo registrar el traslado.' });
  }
};

export const createHardwareAudit = async (req, res) => {
  try {
    const db = await openDb();
    const id = Number(req.params.hardwareId);
    if (!await requireHardware(db, id)) return res.status(404).json({ error: 'Equipo no encontrado.' });
    const { audit_date, result = 'verified', notes = '', audited_by = '' } = req.body || {};
    if (!audit_date || !['verified', 'missing', 'damaged', 'data_mismatch'].includes(result)) return res.status(400).json({ error: 'Fecha y resultado de auditoría válidos son obligatorios.' });
    const insert = await db.run('INSERT INTO hardware_audits (hardware_id, audit_date, result, notes, audited_by, created_by) VALUES (?, ?, ?, ?, ?, ?)', [id, audit_date, result, notes.trim(), audited_by.trim(), actorId(req)]);
    await db.run('INSERT INTO hardware_asset_details (hardware_id, last_audit_date) VALUES (?, ?) ON CONFLICT(hardware_id) DO UPDATE SET last_audit_date = excluded.last_audit_date, updated_at = CURRENT_TIMESTAMP', [id, audit_date]);
    await db.run('INSERT INTO hardware_asset_events (hardware_id, event_type, title, description, performed_by) VALUES (?, ?, ?, ?, ?)', [id, 'audit', 'Auditoría física registrada', result + ' · ' + (notes.trim() || 'Sin observaciones'), actorId(req)]);
    res.status(201).json(await db.get('SELECT * FROM hardware_audits WHERE id = ?', [insert.lastID]));
  } catch {
    res.status(500).json({ error: 'No se pudo registrar la auditoría.' });
  }
};

export const getHardwareDuplicates = async (req, res) => {
  try {
    const db = await openDb();
    const serials = await db.all("SELECT serial_number AS value, COUNT(*) AS count, GROUP_CONCAT(id) AS hardware_ids FROM hardware WHERE serial_number IS NOT NULL AND TRIM(serial_number) <> '' GROUP BY lower(trim(serial_number)) HAVING COUNT(*) > 1");
    const tags = await db.all("SELECT asset_tag AS value, COUNT(*) AS count, GROUP_CONCAT(hardware_id) AS hardware_ids FROM hardware_asset_details WHERE asset_tag IS NOT NULL AND TRIM(asset_tag) <> '' GROUP BY lower(trim(asset_tag)) HAVING COUNT(*) > 1");
    const serviceTags = await db.all("SELECT service_tag AS value, COUNT(*) AS count, GROUP_CONCAT(id) AS hardware_ids FROM hardware WHERE service_tag IS NOT NULL AND TRIM(service_tag) <> '' GROUP BY lower(trim(service_tag)) HAVING COUNT(*) > 1");
    const macAddresses = await db.all("SELECT mac_address AS value, COUNT(*) AS count, GROUP_CONCAT(id) AS hardware_ids FROM hardware WHERE mac_address IS NOT NULL AND TRIM(mac_address) <> '' GROUP BY lower(trim(mac_address)) HAVING COUNT(*) > 1");
    const ipAddresses = await db.all("SELECT ip_address AS value, COUNT(*) AS count, GROUP_CONCAT(id) AS hardware_ids FROM hardware WHERE ip_address IS NOT NULL AND TRIM(ip_address) <> '' GROUP BY lower(trim(ip_address)) HAVING COUNT(*) > 1");
    res.json({ serials, assetTags: tags, serviceTags, macAddresses, ipAddresses });
  } catch {
    res.status(500).json({ error: 'No se pudo revisar duplicados.' });
  }
};
