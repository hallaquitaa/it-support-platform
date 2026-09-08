import { openDb } from '../config/database.js';

export class Branch {
  static async getAll(filters = {}) {
    const db = await openDb();
    let query = `
      SELECT b.*, 
             COUNT(DISTINCT h.id) as hardware_count,
             COUNT(DISTINCT t.id) as active_tickets_count
      FROM branches b
      LEFT JOIN hardware h ON h.branch_id = b.id
      LEFT JOIN tasks t ON t.branch_id = b.id AND t.status != 'resolved'
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.status) {
      query += ' AND b.status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      query += ' AND (b.name LIKE ? OR b.address LIKE ? OR b.manager_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' GROUP BY b.id ORDER BY b.name ASC';
    return db.all(query, params);
  }

  static async getById(id) {
    const db = await openDb();
    return db.get('SELECT * FROM branches WHERE id = ?', [id]);
  }

  static async create(data) {
    const db = await openDb();
    const result = await db.run(`
      INSERT INTO branches (name, code, address, city, phone, manager_name, manager_phone, manager_email, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.name, data.code || null, data.address || null, data.city || null,
      data.phone || null, data.manager_name || null, data.manager_phone || null,
      data.manager_email || null, data.status || 'active'
    ]);
    return this.getById(result.lastID);
  }

  static async update(id, data) {
    const db = await openDb();
    const fields = [];
    const values = [];
    
    const allowed = ['name', 'code', 'address', 'city', 'phone', 'manager_name', 'manager_phone', 'manager_email', 'status'];
    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return this.getById(id);
    
    values.push(id);
    await db.run(`UPDATE branches SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id) {
    const db = await openDb();
    await db.run('DELETE FROM branches WHERE id = ?', [id]);
    return { success: true };
  }

  static async getStats() {
    const db = await openDb();
    return db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM branches
    `);
  }
}