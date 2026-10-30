import { openDb } from '../config/database.js';

const PRIORITIES = new Set(['low', 'normal', 'high', 'critical']);
const STATUSES = new Set(['registered', 'maintenance', 'retired']);

const normalizeTags = (value) => {
  const source = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return [...new Set(
    source
      .map((tag) => String(tag || '').trim().slice(0, 40))
      .filter(Boolean)
  )].slice(0, 12);
};

const parseTags = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? normalizeTags(parsed) : [];
  } catch {
    return [];
  }
};

const normalizeRecord = (record) => record
  ? {
      ...record,
      favorite: Number(record.is_favorite || 0) > 0,
      tags: parseTags(record.tags_json),
    }
  : null;

const optionalText = (value, maxLength, fieldName) => {
  const clean = String(value || '').trim();
  if (clean.length > maxLength) {
    throw new Error(`${fieldName} no puede superar ${maxLength} caracteres`);
  }
  return clean || null;
};

const normalizeBranchId = (value) => {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('La sucursal seleccionada no es válida');
  }
  return parsed;
};

export class RemoteAccess {
  static async logEvent(remoteAccessId, actorUserId, action, details = null) {
    const db = await openDb();
    await db.run(
      `INSERT INTO remote_access_events
        (remote_access_id, actor_user_id, action, details)
       VALUES (?, ?, ?, ?)`,
      [
        remoteAccessId,
        actorUserId || null,
        action,
        details ? JSON.stringify(details) : null,
      ]
    );
  }

  static async getAll(filters = {}, userId = 0) {
    const db = await openDb();

    let query = `
      SELECT
        ra.*,
        b.name AS branch_name,
        (SELECT COUNT(*) FROM remote_access_favorites f
         WHERE f.remote_access_id = ra.id AND f.user_id = ?) AS is_favorite
      FROM remote_access ra
      LEFT JOIN branches b ON b.id = ra.branch_id
      WHERE 1 = 1
    `;

    const params = [Number(userId) || 0];

    if (filters.search && String(filters.search).trim()) {
      const term = `%${String(filters.search).trim()}%`;
      query += `
        AND (
          ra.computer_name LIKE ?
          OR ra.anydesk_id LIKE ?
          OR ra.teamviewer_id LIKE ?
          OR ra.notes LIKE ?
          OR b.name LIKE ?
          OR ra.responsible LIKE ?
          OR ra.department LIKE ?
          OR ra.location LIKE ?
          OR ra.priority LIKE ?
          OR ra.status LIKE ?
          OR ra.tags_json LIKE ?
        )
      `;
      params.push(term, term, term, term, term, term, term, term, term, term, term);
    }

    if (filters.branch_id) {
      query += ' AND ra.branch_id = ?';
      params.push(filters.branch_id);
    }

    if (filters.department) {
      query += ' AND ra.department = ?';
      params.push(String(filters.department));
    }

    if (filters.status) {
      query += ' AND ra.status = ?';
      params.push(String(filters.status));
    }

    if (filters.favorite === 'true' || filters.favorite === true) {
      query += `
        AND EXISTS (
          SELECT 1 FROM remote_access_favorites fav
          WHERE fav.remote_access_id = ra.id AND fav.user_id = ?
        )
      `;
      params.push(Number(userId) || 0);
    }

    query += `
      ORDER BY
        CASE WHEN ra.priority = 'critical' THEN 0
             WHEN ra.priority = 'high' THEN 1
             WHEN ra.priority = 'normal' THEN 2
             ELSE 3 END,
        ra.computer_name COLLATE NOCASE ASC,
        ra.id DESC
    `;

    const records = await db.all(query, params);
    return records.map(normalizeRecord);
  }

  static async getById(id, userId = 0) {
    const db = await openDb();
    const record = await db.get(
      `
        SELECT
          ra.*,
          b.name AS branch_name,
          (SELECT COUNT(*) FROM remote_access_favorites f
           WHERE f.remote_access_id = ra.id AND f.user_id = ?) AS is_favorite
        FROM remote_access ra
        LEFT JOIN branches b ON b.id = ra.branch_id
        WHERE ra.id = ?
      `,
      [Number(userId) || 0, id]
    );
    return normalizeRecord(record);
  }

  static async getHistory(id) {
    const db = await openDb();
    return db.all(
      `SELECT
         events.id, events.action, events.details, events.created_at,
         users.username AS actor_username, users.full_name AS actor_name
       FROM remote_access_events events
       LEFT JOIN users ON users.id = events.actor_user_id
       WHERE events.remote_access_id = ?
       ORDER BY events.created_at DESC, events.id DESC
       LIMIT 100`,
      [id]
    );
  }

  static async toggleFavorite(id, userId) {
    const db = await openDb();
    const exists = await db.get(
      'SELECT id FROM remote_access WHERE id = ?',
      [id]
    );
    if (!exists) return null;

    const favorite = await db.get(
      `SELECT id FROM remote_access_favorites
       WHERE remote_access_id = ? AND user_id = ?`,
      [id, userId]
    );

    if (favorite) {
      await db.run(
        'DELETE FROM remote_access_favorites WHERE remote_access_id = ? AND user_id = ?',
        [id, userId]
      );
      return { favorite: false };
    }

    await db.run(
      'INSERT INTO remote_access_favorites (remote_access_id, user_id) VALUES (?, ?)',
      [id, userId]
    );
    return { favorite: true };
  }

  static async create(data) {
    const db = await openDb();

    const computerName = String(data.computer_name || '').trim();
    const anydeskId = String(data.anydesk_id || '').trim();
    const notes = optionalText(data.notes, 2000, 'Las notas');
    const branchId = normalizeBranchId(data.branch_id);
    const responsible = optionalText(data.responsible, 150, 'El responsable');
    const department = optionalText(data.department, 120, 'El departamento');
    const location = optionalText(data.location, 200, 'La ubicación');
    const priority = String(data.priority || 'normal');
    const status = String(data.status || 'registered');
    const tags = normalizeTags(data.tags);

    if (!computerName || computerName.length > 150) {
      throw new Error('El nombre del equipo es obligatorio y no debe superar 150 caracteres');
    }
    if (!anydeskId || anydeskId.length > 100) {
      throw new Error('El ID de AnyDesk es obligatorio y no debe superar 100 caracteres');
    }
    if (!PRIORITIES.has(priority)) throw new Error('La prioridad seleccionada no es válida');
    if (!STATUSES.has(status)) throw new Error('El estado seleccionado no es válido');

    const result = await db.run(
      `INSERT INTO remote_access (
        branch_id, computer_name, anydesk_id, notes, last_updated,
        responsible, department, location, priority, status, tags_json
      )
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?)`,
      [
        branchId, computerName, anydeskId, notes, responsible, department,
        location, priority, status, JSON.stringify(tags),
      ]
    );

    return this.getById(result.lastID);
  }

  static async update(id, data, userId) {
    const db = await openDb();
    const existing = await this.getById(id, userId);
    if (!existing) return null;

    const updates = [];
    const params = [];
    const fields = {
      computer_name: (value) => {
        const clean = String(value || '').trim();
        if (!clean || clean.length > 150) {
          throw new Error('El nombre del equipo es obligatorio y no debe superar 150 caracteres');
        }
        return clean;
      },
      anydesk_id: (value) => {
        const clean = String(value || '').trim();
        if (!clean || clean.length > 100) {
          throw new Error('El ID de AnyDesk es obligatorio y no debe superar 100 caracteres');
        }
        return clean;
      },
      branch_id: normalizeBranchId,
      notes: (value) => optionalText(value, 2000, 'Las notas'),
      responsible: (value) => optionalText(value, 150, 'El responsable'),
      department: (value) => optionalText(value, 120, 'El departamento'),
      location: (value) => optionalText(value, 200, 'La ubicación'),
      priority: (value) => {
        const clean = String(value || '');
        if (!PRIORITIES.has(clean)) throw new Error('La prioridad seleccionada no es válida');
        return clean;
      },
      status: (value) => {
        const clean = String(value || '');
        if (!STATUSES.has(clean)) throw new Error('El estado seleccionado no es válido');
        return clean;
      },
      tags: (value) => JSON.stringify(normalizeTags(value)),
      teamviewer_id: (value) => optionalText(value, 100, 'El ID de TeamViewer'),
    };

    for (const [field, normalize] of Object.entries(fields)) {
      if (!Object.prototype.hasOwnProperty.call(data, field)) continue;
      updates.push(`${field === 'tags' ? 'tags_json' : field} = ?`);
      params.push(normalize(data[field]));
    }

    if (!updates.length) return existing;

    updates.push('last_updated = CURRENT_TIMESTAMP');
    params.push(id);

    await db.run(
      `UPDATE remote_access SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updated = await this.getById(id, userId);
    await this.logEvent(id, userId, 'record_updated', {
      fields: Object.keys(data).filter((field) => Object.prototype.hasOwnProperty.call(fields, field)),
    });
    return updated;
  }

  static async delete(id, userId) {
    const db = await openDb();
    const existing = await this.getById(id, userId);
    if (!existing) return null;

    await this.logEvent(id, userId, 'record_deleted', {
      computer_name: existing.computer_name,
    });

    await db.run('DELETE FROM remote_access WHERE id = ?', [id]);
    await db.run('DELETE FROM remote_access_favorites WHERE remote_access_id = ?', [id]);

    return { success: true, id: Number(id) };
  }
}
