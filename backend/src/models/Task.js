import { openDb } from '../config/database.js';

export class Task {
  static async getAll(filters = {}) {
    const db = await openDb();
    let query = `
      SELECT t.*, 
             b.name as branch_name, 
             u.full_name as assignee_name,
             u2.full_name as creator_name
      FROM tasks t 
      LEFT JOIN branches b ON t.branch_id = b.id 
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }
    if (filters.priority) {
      query += ' AND t.priority = ?';
      params.push(filters.priority);
    }
    if (filters.assigned_to) {
      query += ' AND t.assigned_to = ?';
      params.push(filters.assigned_to);
    }
    if (filters.branch_id) {
      query += ' AND t.branch_id = ?';
      params.push(filters.branch_id);
    }
    
    query += ' ORDER BY CASE t.priority WHEN "critical" THEN 1 WHEN "high" THEN 2 WHEN "medium" THEN 3 WHEN "low" THEN 4 END, t.created_at DESC';
    
    return db.all(query, params);
  }

  static async getById(id) {
    const db = await openDb();
    return db.get(`
      SELECT t.*, 
             b.name as branch_name, 
             u.full_name as assignee_name,
             u2.full_name as creator_name
      FROM tasks t 
      LEFT JOIN branches b ON t.branch_id = b.id 
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE t.id = ?
    `, [id]);
  }

  static async create(taskData) {
    const db = await openDb();
    const { title, description, priority, branch_id, assigned_to, due_date, created_by } = taskData;
    
    const result = await db.run(`
      INSERT INTO tasks (title, description, priority, branch_id, assigned_to, due_date, created_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, priority || 'medium', branch_id || null, assigned_to || null, due_date || null, created_by, 'pending']);
    
    return this.getById(result.lastID);
  }

  static async update(id, updates) {
    const db = await openDb();
    const fields = [];
    const values = [];
    
    const allowed = ['title', 'description', 'priority', 'branch_id', 'assigned_to', 'due_date', 'status'];
    for (const [key, value] of Object.entries(updates)) {
      if (allowed.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updates.status === 'resolved') {
      fields.push('resolved_at = CURRENT_TIMESTAMP');
    }
    
    if (fields.length === 0) return this.getById(id);
    
    values.push(id);
    await db.run(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id) {
    const db = await openDb();
    await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    return { success: true };
  }

  static async getStats() {
    const db = await openDb();
    return db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN priority = 'critical' AND status != 'resolved' THEN 1 ELSE 0 END) as critical_active,
        SUM(CASE WHEN due_date < date('now') AND status != 'resolved' THEN 1 ELSE 0 END) as overdue
      FROM tasks
    `);
  }
}