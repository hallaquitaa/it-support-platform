import { openDb } from '../config/database.js';

export const getMaintenance = async (req, res) => {
  try {
    const db = await openDb();
    const rows = await db.all(`
      SELECT ms.*, h.type AS hardware_type, h.brand_model, h.serial_number,
             b.name AS branch_name
      FROM maintenance_schedule ms
      LEFT JOIN hardware h ON h.id = ms.hardware_id
      LEFT JOIN branches b ON b.id = h.branch_id
      ORDER BY CASE ms.status WHEN 'pending' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
               ms.scheduled_date ASC, ms.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo cargar el mantenimiento' });
  }
};

export const createMaintenance = async (req, res) => {
  try {
    const { hardware_id, title, scheduled_date, type = 'preventive' } = req.body;
    if (!title?.trim() || !scheduled_date) {
      return res.status(400).json({ error: 'Título y fecha son obligatorios' });
    }
    const db = await openDb();
    if (hardware_id) {
      const equipment = await db.get('SELECT id FROM hardware WHERE id = ?', [hardware_id]);
      if (!equipment) return res.status(400).json({ error: 'El equipo seleccionado no existe' });
    }
    const result = await db.run(
      'INSERT INTO maintenance_schedule (hardware_id, title, scheduled_date, type, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [hardware_id || null, title.trim(), scheduled_date, type, 'pending', req.user?.id || req.user?.userId || null]
    );
    res.status(201).json(await db.get('SELECT * FROM maintenance_schedule WHERE id = ?', [result.lastID]));
  } catch (error) {
    res.status(500).json({ error: 'No se pudo programar el mantenimiento' });
  }
};

export const updateMaintenance = async (req, res) => {
  try {
    const { title, scheduled_date, type, status, hardware_id } = req.body;
    const db = await openDb();
    const current = await db.get('SELECT * FROM maintenance_schedule WHERE id = ?', [req.params.id]);
    if (!current) return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    await db.run(
      'UPDATE maintenance_schedule SET hardware_id = ?, title = ?, scheduled_date = ?, type = ?, status = ? WHERE id = ?',
      [hardware_id ?? current.hardware_id, title?.trim() || current.title, scheduled_date || current.scheduled_date, type || current.type, status || current.status, req.params.id]
    );
    res.json(await db.get('SELECT * FROM maintenance_schedule WHERE id = ?', [req.params.id]));
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar el mantenimiento' });
  }
};

export const deleteMaintenance = async (req, res) => {
  try {
    const db = await openDb();
    const result = await db.run('DELETE FROM maintenance_schedule WHERE id = ?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    res.json({ message: 'Mantenimiento eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar el mantenimiento' });
  }
};

export const getMaintenanceLogs = async (req, res) => {
  try {
    const db = await openDb();
    const logs = await db.all(`
      SELECT ml.*, h.type AS hardware_type, h.brand_model, h.serial_number
      FROM maintenance_logs ml
      LEFT JOIN hardware h ON h.id = ml.hardware_id
      ORDER BY ml.performed_date DESC, ml.id DESC
    `);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo cargar el historial' });
  }
};

export const createMaintenanceLog = async (req, res) => {
  try {
    const { hardware_id, scheduled_maintenance_id, description } = req.body;
    if (!description?.trim()) return res.status(400).json({ error: 'La descripción es obligatoria' });
    const db = await openDb();
    if (hardware_id && !(await db.get('SELECT id FROM hardware WHERE id = ?', [hardware_id]))) {
      return res.status(400).json({ error: 'El equipo seleccionado no existe' });
    }
    const result = await db.run(
      'INSERT INTO maintenance_logs (hardware_id, performed_by, scheduled_maintenance_id, description) VALUES (?, ?, ?, ?)',
      [hardware_id || null, req.user?.id || req.user?.userId || null, scheduled_maintenance_id || null, description.trim()]
    );
    if (scheduled_maintenance_id) {
      await db.run("UPDATE maintenance_schedule SET status = 'completed' WHERE id = ?", [scheduled_maintenance_id]);
    }
    res.status(201).json(await db.get('SELECT * FROM maintenance_logs WHERE id = ?', [result.lastID]));
  } catch (error) {
    res.status(500).json({ error: 'No se pudo registrar la intervención' });
  }
};
