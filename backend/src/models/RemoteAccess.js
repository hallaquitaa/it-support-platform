
import { openDb } from '../config/database.js';

export class RemoteAccess {
  // Obtener conexiones con búsqueda y filtros.
  static async getAll(filters = {}) {
    const db = await openDb();

    let query = `
      SELECT
        ra.*,
        b.name AS branch_name
      FROM remote_access ra
      LEFT JOIN branches b ON b.id = ra.branch_id
      WHERE 1 = 1
    `;

    const params = [];

    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;

      query += `
        AND (
          ra.computer_name LIKE ?
          OR ra.anydesk_id LIKE ?
          OR ra.notes LIKE ?
          OR b.name LIKE ?
        )
      `;

      params.push(term, term, term, term);
    }

    if (filters.branch_id) {
      query += ' AND ra.branch_id = ?';
      params.push(filters.branch_id);
    }

    query += `
      ORDER BY
        ra.computer_name COLLATE NOCASE ASC,
        ra.id DESC
    `;

    return db.all(query, params);
  }

  // Obtener una conexión por su ID interno.
  static async getById(id) {
    const db = await openDb();

    return db.get(
      `
        SELECT
          ra.*,
          b.name AS branch_name
        FROM remote_access ra
        LEFT JOIN branches b ON b.id = ra.branch_id
        WHERE ra.id = ?
      `,
      [id]
    );
  }

  // Crear una conexión de AnyDesk.
  static async create(data) {
    const db = await openDb();

    const computerName = String(data.computer_name || '').trim();
    const anydeskId = String(data.anydesk_id || '').trim();
    const notes = String(data.notes || '').trim();
    const branchId =
      data.branch_id === '' ||
      data.branch_id === undefined ||
      data.branch_id === null
        ? null
        : Number(data.branch_id);

    if (!computerName) {
      throw new Error('El nombre del equipo es obligatorio');
    }

    if (!anydeskId) {
      throw new Error('El ID de AnyDesk es obligatorio');
    }

    if (
      branchId !== null &&
      (!Number.isInteger(branchId) || branchId <= 0)
    ) {
      throw new Error('La sucursal seleccionada no es válida');
    }

    const result = await db.run(
      `
        INSERT INTO remote_access (
          branch_id,
          computer_name,
          anydesk_id,
          notes,
          last_updated
        )
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [branchId, computerName, anydeskId, notes || null]
    );

    return this.getById(result.lastID);
  }

  // Actualizar una conexión existente.
  static async update(id, data) {
    const db = await openDb();
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const allowedFields = [
      'computer_name',
      'anydesk_id',
      'branch_id',
      'notes'
    ];

    const updates = [];
    const params = [];

    for (const field of allowedFields) {
      if (!Object.prototype.hasOwnProperty.call(data, field)) {
        continue;
      }

      let value = data[field];

      if (field === 'computer_name') {
        value = String(value || '').trim();

        if (!value) {
          throw new Error('El nombre del equipo es obligatorio');
        }
      }

      if (field === 'anydesk_id') {
        value = String(value || '').trim();

        if (!value) {
          throw new Error('El ID de AnyDesk es obligatorio');
        }
      }

      if (field === 'notes') {
        value = String(value || '').trim() || null;
      }

      if (field === 'branch_id') {
        if (value === '' || value === null) {
          value = null;
        } else {
          value = Number(value);

          if (!Number.isInteger(value) || value <= 0) {
            throw new Error('La sucursal seleccionada no es válida');
          }
        }
      }

      updates.push(`${field} = ?`);
      params.push(value);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('last_updated = CURRENT_TIMESTAMP');
    params.push(id);

    await db.run(
      `
        UPDATE remote_access
        SET ${updates.join(', ')}
        WHERE id = ?
      `,
      params
    );

    return this.getById(id);
  }

  // Eliminar una conexión.
  static async delete(id) {
    const db = await openDb();

    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    await db.run(
      'DELETE FROM remote_access WHERE id = ?',
      [id]
    );

    return { success: true, id: Number(id) };
  }
}