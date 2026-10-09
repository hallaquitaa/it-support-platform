import { openDb } from '../config/database.js';

class Ticket {
  /**
   * Obtener todos los tickets visibles para un usuario.
   *
   * Un usuario puede ver tickets:
   * - creados por él
   * - asignados a él
   *
   * Por defecto no se muestran tickets eliminados.
   */
  static async getAll(filters = {}) {
    const db = await openDb();

    const {
      user_id,
      status,
      priority,
      category,
      branch_id,
      assigned_to,
      search,
      include_deleted = false,
      trash = false
    } = filters;

    let query = `
      SELECT
        t.*,
        b.name AS branch_name,
        u_assigned.full_name AS assigned_to_name,
        u_created.full_name AS created_by_name
      FROM tickets t
      LEFT JOIN branches b
        ON t.branch_id = b.id
      LEFT JOIN users u_assigned
        ON t.assigned_to = u_assigned.id
      LEFT JOIN users u_created
        ON t.created_by = u_created.id
      WHERE 1 = 1
    `;

    const params = [];

    /*
     * Seguridad:
     * El usuario solamente puede consultar tickets que:
     * - haya creado
     * - tenga asignados
     *
     * Si no se proporciona user_id, no se aplica este filtro.
     */
    if (user_id) {
      query += `
        AND (
          t.created_by = ?
          OR t.assigned_to = ?
        )
      `;

      params.push(user_id, user_id);
    }

    /*
     * Papelera:
     *
     * include_deleted = true
     * -> permite incluir eliminados.
     *
     * trash = true
     * -> devuelve únicamente eliminados.
     *
     * Por defecto:
     * -> solamente tickets activos.
     */
    if (trash) {
      query += ` AND t.deleted_at IS NOT NULL`;
    } else if (!include_deleted) {
      query += ` AND t.deleted_at IS NULL`;
    }

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority) {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }

    if (category) {
      query += ` AND t.category = ?`;
      params.push(category);
    }

    if (branch_id) {
      query += ` AND t.branch_id = ?`;
      params.push(branch_id);
    }

    if (assigned_to) {
      query += ` AND t.assigned_to = ?`;
      params.push(assigned_to);
    }

    if (search) {
      query += `
        AND (
          t.title LIKE ?
          OR t.description LIKE ?
          OR t.category LIKE ?
        )
      `;

      const searchTerm = `%${search}%`;

      params.push(
        searchTerm,
        searchTerm,
        searchTerm
      );
    }

    query += `
      ORDER BY
        CASE
          WHEN t.priority = 'high' THEN 1
          WHEN t.priority = 'medium' THEN 2
          WHEN t.priority = 'low' THEN 3
          ELSE 4
        END,
        t.created_at DESC
    `;

    return await db.all(query, params);
  }

  /**
   * Obtener un ticket por ID.
   */
  static async getById(id, userId = null, includeDeleted = false) {
    const db = await openDb();

    let query = `
      SELECT
        t.*,
        b.name AS branch_name,
        u_assigned.full_name AS assigned_to_name,
        u_created.full_name AS created_by_name
      FROM tickets t
      LEFT JOIN branches b
        ON t.branch_id = b.id
      LEFT JOIN users u_assigned
        ON t.assigned_to = u_assigned.id
      LEFT JOIN users u_created
        ON t.created_by = u_created.id
      WHERE t.id = ?
    `;

    const params = [id];

    if (userId) {
      query += `
        AND (
          t.created_by = ?
          OR t.assigned_to = ?
        )
      `;

      params.push(userId, userId);
    }

    if (!includeDeleted) {
      query += ` AND t.deleted_at IS NULL`;
    }

    return await db.get(query, params);
  }

  /**
   * Crear un ticket.
   */
  static async create(data) {
    const db = await openDb();

    const {
      title,
      description = null,
      status = 'open',
      priority = 'medium',
      category = null,
      branch_id = null,
      assigned_to = null,
      created_by = null
    } = data;

    const result = await db.run(
      `
        INSERT INTO tickets (
          title,
          description,
          status,
          priority,
          category,
          branch_id,
          assigned_to,
          created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description,
        status,
        priority,
        category,
        branch_id,
        assigned_to,
        created_by
      ]
    );

    return await this.getById(result.lastID, created_by);
  }

  /**
   * Actualizar un ticket.
   */
  static async update(id, data, userId = null) {
    const db = await openDb();

    const allowedFields = [
      'title',
      'description',
      'status',
      'priority',
      'category',
      'branch_id',
      'assigned_to',
      'resolved_at'
    ];

    const fields = [];
    const values = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) {
      return await this.getById(id, userId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    let query = `
      UPDATE tickets
      SET ${fields.join(', ')}
      WHERE id = ?
      AND deleted_at IS NULL
    `;

    values.push(id);

    if (userId) {
      query += `
        AND (
          created_by = ?
          OR assigned_to = ?
        )
      `;

      values.push(userId, userId);
    }

    const result = await db.run(query, values);

    if (result.changes === 0) {
      return null;
    }

    return await this.getById(id, userId);
  }

  /**
   * Cambiar el estado de un ticket.
   *
   * Si pasa a resolved:
   * -> se registra resolved_at.
   *
   * Si vuelve a otro estado:
   * -> se limpia resolved_at.
   */
  static async updateStatus(id, status, userId = null) {
    const db = await openDb();

    let query;
    let params;

    if (status === 'resolved') {
      query = `
        UPDATE tickets
        SET
          status = ?,
          resolved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        AND deleted_at IS NULL
      `;

      params = [status, id];
    } else {
      query = `
        UPDATE tickets
        SET
          status = ?,
          resolved_at = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        AND deleted_at IS NULL
      `;

      params = [status, id];
    }

    if (userId) {
      query += `
        AND (
          created_by = ?
          OR assigned_to = ?
        )
      `;

      params.push(userId, userId);
    }

    const result = await db.run(query, params);

    if (result.changes === 0) {
      return null;
    }

    return await this.getById(id, userId);
  }

  /**
   * Mover un ticket a la papelera.
   *
   * Es un soft delete.
   * El ticket NO se elimina físicamente.
   */
  static async delete(id, userId = null) {
    const db = await openDb();

    let query = `
      UPDATE tickets
      SET
        deleted_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      AND deleted_at IS NULL
    `;

    const params = [id];

    if (userId) {
      query += `
        AND (
          created_by = ?
          OR assigned_to = ?
        )
      `;

      params.push(userId, userId);
    }

    const result = await db.run(query, params);

    return result.changes > 0;
  }

  /**
   * Obtener tickets eliminados.
   */
  static async getTrash(userId = null) {
    return await this.getAll({
      user_id: userId,
      trash: true
    });
  }

  /**
   * Restaurar un ticket desde la papelera.
   */
  static async restore(id, userId = null) {
    const db = await openDb();

    let query = `
      UPDATE tickets
      SET
        deleted_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      AND deleted_at IS NOT NULL
    `;

    const params = [id];

    if (userId) {
      query += `
        AND (
          created_by = ?
          OR assigned_to = ?
        )
      `;

      params.push(userId, userId);
    }

    const result = await db.run(query, params);

    if (result.changes === 0) {
      return null;
    }

    return await this.getById(id, userId);
  }

  /**
   * Eliminación permanente.
   *
   * Esta operación sí elimina físicamente el ticket.
   */
  static async permanentDelete(id, userId = null) {
    const db = await openDb();

    let query = `
      DELETE FROM tickets
      WHERE id = ?
    `;

    const params = [id];

    if (userId) {
      query += `
        AND (
          created_by = ?
          OR assigned_to = ?
        )
      `;

      params.push(userId, userId);
    }

    const result = await db.run(query, params);

    return result.changes > 0;
  }

  /**
   * Estadísticas básicas de tickets.
   */
  static async getStats(userId = null) {
    const db = await openDb();

    let query = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved
      FROM tickets
      WHERE deleted_at IS NULL
    `;

    const params = [];

    if (userId) {
      query += `
        AND (
          created_by = ?
          OR assigned_to = ?
        )
      `;

      params.push(userId, userId);
    }

    return await db.get(query, params);
  }
}

export default Ticket;