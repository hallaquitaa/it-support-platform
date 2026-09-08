import { openDb } from '../config/database.js';

export class Hardware {
  static async getAll(filters = {}) {
    const db = await openDb();
    let query = `
      SELECT h.*, b.name as branch_name
      FROM hardware h
      LEFT JOIN branches b ON h.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.type) {
      query += ' AND h.type = ?';
      params.push(filters.type);
    }
    if (filters.status) {
      query += ' AND h.status = ?';
      params.push(filters.status);
    }
    if (filters.branch_id) {
      query += ' AND h.branch_id = ?';
      params.push(filters.branch_id);
    }
    if (filters.search) {
      query += ' AND (h.brand_model LIKE ? OR h.serial_number LIKE ? OR h.service_tag LIKE ?)';
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY h.created_at DESC';
    const hardware = await db.all(query, params);
    
    // Cargar especificaciones para cada equipo
    for (const item of hardware) {
      item.specs = await db.all('SELECT spec_key, spec_value FROM hardware_specs WHERE hardware_id = ?', [item.id]);
    }
    
    return hardware;
  }

  static async getById(id) {
    const db = await openDb();
    const item = await db.get(`
      SELECT h.*, b.name as branch_name
      FROM hardware h
      LEFT JOIN branches b ON h.branch_id = b.id
      WHERE h.id = ?
    `, [id]);
    
    if (item) {
      item.specs = await db.all('SELECT spec_key, spec_value FROM hardware_specs WHERE hardware_id = ?', [id]);
    }
    
    return item;
  }

  static async create(data) {
    const db = await openDb();
    const result = await db.run(`
      INSERT INTO hardware (
        type, brand_model, serial_number, service_tag, ip_address,
        mac_address, status, branch_id, purchase_date, warranty_end, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.type, data.brand_model, data.serial_number, data.service_tag,
      data.ip_address, data.mac_address, data.status || 'active',
      data.branch_id, data.purchase_date, data.warranty_end, data.notes
    ]);
    
    const hardwareId = result.lastID;
    
    // Guardar especificaciones personalizadas
    if (data.specs && Array.isArray(data.specs)) {
      for (const spec of data.specs) {
        if (spec.key && spec.value) {
          await db.run(
            'INSERT INTO hardware_specs (hardware_id, spec_key, spec_value) VALUES (?, ?, ?)',
            [hardwareId, spec.key, spec.value]
          );
        }
      }
    }
    
    return this.getById(hardwareId);
  }

  static async update(id, data) {
    const db = await openDb();
    const fields = [];
    const values = [];

    const allowed = ['type', 'brand_model', 'serial_number', 'service_tag',
      'ip_address', 'mac_address', 'status', 'branch_id', 'purchase_date',
      'warranty_end', 'notes'];

    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length > 0) {
      values.push(id);
      await db.run(`UPDATE hardware SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    
    // Actualizar especificaciones
    if (data.specs && Array.isArray(data.specs)) {
      // Eliminar especificaciones existentes
      await db.run('DELETE FROM hardware_specs WHERE hardware_id = ?', [id]);
      
      // Insertar nuevas
      for (const spec of data.specs) {
        if (spec.key && spec.value) {
          await db.run(
            'INSERT INTO hardware_specs (hardware_id, spec_key, spec_value) VALUES (?, ?, ?)',
            [id, spec.key, spec.value]
          );
        }
      }
    }
    
    return this.getById(id);
  }

  static async delete(id) {
    const db = await openDb();
    await db.run('DELETE FROM hardware_specs WHERE hardware_id = ?', [id]);
    await db.run('DELETE FROM hardware WHERE id = ?', [id]);
    return { success: true };
  }

  static async getStats() {
    const db = await openDb();
    return db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'repair' THEN 1 ELSE 0 END) as repair,
        SUM(CASE WHEN status = 'damaged' THEN 1 ELSE 0 END) as damaged,
        SUM(CASE WHEN type = 'Desktop' THEN 1 ELSE 0 END) as desktops,
        SUM(CASE WHEN type = 'Laptop' THEN 1 ELSE 0 END) as laptops,
        SUM(CASE WHEN type = 'Server' THEN 1 ELSE 0 END) as servers,
        SUM(CASE WHEN type = 'Network Device' THEN 1 ELSE 0 END) as network_devices,
        SUM(CASE WHEN type = 'Fiscal Printer' THEN 1 ELSE 0 END) as fiscal_printers,
        SUM(CASE WHEN type = 'POS' THEN 1 ELSE 0 END) as pos
      FROM hardware
    `);
  }

  static async getTypes() {
    const db = await openDb();
    return db.all('SELECT DISTINCT type FROM hardware ORDER BY type');
  }
}