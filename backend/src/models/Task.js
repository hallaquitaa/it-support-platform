import { openDb } from '../config/database.js';

let schemaReady = false;

const normalizePriority = (priority) => {
  const value = String(priority || '').toLowerCase();

  const map = {
    mandatory: 'high',
    high: 'high',
    critical: 'high',
    standard: 'medium',
    medium: 'medium',
    not_urgent: 'low',
    low: 'low',
  };

  return map[value] || 'medium';
};

const normalizeStatus = (status) => {
  const value = String(status || '').toLowerCase();

  if (value === 'completed') return 'resolved';
  if (value === 'done') return 'resolved';

  return value || 'pending';
};

export class Task {
  // ============================================================
  // DATABASE SCHEMA
  // ============================================================

  static async ensureSchema(db) {
    if (schemaReady) return;

    const columns = await db.all('PRAGMA table_info(tasks)');

    const existingColumns = new Set(
      columns.map((column) => column.name)
    );

    const newColumns = [
      ['task_type', "TEXT DEFAULT 'administrative'"],
      ['parent_task_id', 'INTEGER'],
      ['due_time', 'TEXT'],
      ['completed_at', 'TIMESTAMP'],
      ['started_at', 'TIMESTAMP'],
      ['deleted_at', 'TIMESTAMP'],
    ];

    for (const [columnName, definition] of newColumns) {
      if (!existingColumns.has(columnName)) {
        await db.run(
          `ALTER TABLE tasks ADD COLUMN ${columnName} ${definition}`
        );
      }
    }

    schemaReady = true;
  }

  // ============================================================
  // GET ALL TASKS
  // ============================================================

  static async getAll(filters = {}) {
    const db = await openDb();
    await this.ensureSchema(db);

    let query = `
      SELECT
        t.*,

        b.name AS branch_name,

        u.full_name AS assignee_name,

        u2.full_name AS creator_name,

        CASE
          WHEN t.started_at IS NOT NULL
            AND t.completed_at IS NOT NULL
          THEN ROUND(
            (
              julianday(t.completed_at)
              - julianday(t.started_at)
            ) * 86400
          )
          ELSE NULL
        END AS duration_seconds

      FROM tasks t

      LEFT JOIN branches b
        ON t.branch_id = b.id

      LEFT JOIN users u
        ON t.assigned_to = u.id

      LEFT JOIN users u2
        ON t.created_by = u2.id

      WHERE 1=1
    `;

    const params = [];

    // ----------------------------------------------------------
    // USER SECURITY FILTER
    // ----------------------------------------------------------

    if (filters.user_id) {
      query += `
        AND (
          t.created_by = ?
          OR t.assigned_to = ?
        )
      `;

      params.push(
        filters.user_id,
        filters.user_id
      );
    }

    // ----------------------------------------------------------
    // TRASH FILTER
    // ----------------------------------------------------------

    const includeDeleted =
      filters.include_deleted === true ||
      filters.include_deleted === 'true' ||
      filters.trash === true ||
      filters.trash === 'true';

    if (!includeDeleted) {
      query += `
        AND t.deleted_at IS NULL
      `;
    } else {
      query += `
        AND t.deleted_at IS NOT NULL
      `;
    }

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    if (filters.status) {
      query += `
        AND t.status = ?
      `;

      params.push(
        normalizeStatus(filters.status)
      );
    }

    // ----------------------------------------------------------
    // PRIORITY
    // ----------------------------------------------------------

    if (filters.priority) {
      query += `
        AND t.priority = ?
      `;

      params.push(
        normalizePriority(filters.priority)
      );
    }

    // ----------------------------------------------------------
    // ASSIGNED USER
    // ----------------------------------------------------------

    if (filters.assigned_to) {
      query += `
        AND t.assigned_to = ?
      `;

      params.push(filters.assigned_to);
    }

    // ----------------------------------------------------------
    // BRANCH
    // ----------------------------------------------------------

    if (filters.branch_id) {
      query += `
        AND t.branch_id = ?
      `;

      params.push(filters.branch_id);
    }

    // ----------------------------------------------------------
    // TASK TYPE
    // ----------------------------------------------------------

    if (filters.task_type) {
      query += `
        AND t.task_type = ?
      `;

      params.push(filters.task_type);
    }

    // ----------------------------------------------------------
    // PARENT TASK
    // ----------------------------------------------------------

    if (filters.parent_task_id !== undefined) {
      if (
        filters.parent_task_id === null ||
        filters.parent_task_id === 'null'
      ) {
        query += `
          AND t.parent_task_id IS NULL
        `;
      } else {
        query += `
          AND t.parent_task_id = ?
        `;

        params.push(filters.parent_task_id);
      }
    }

    // ----------------------------------------------------------
    // ORDER
    // ----------------------------------------------------------

    if (includeDeleted) {
      query += `
        ORDER BY
          t.deleted_at DESC,
          t.created_at DESC
      `;
    } else {
      query += `
        ORDER BY

          CASE
            WHEN t.status = 'resolved'
              THEN 3

            WHEN t.status = 'in_progress'
              THEN 2

            ELSE 1
          END,

          CASE
            WHEN t.priority = 'high'
              THEN 1

            WHEN t.priority = 'medium'
              THEN 2

            WHEN t.priority = 'low'
              THEN 3

            ELSE 4
          END,

          CASE
            WHEN t.due_date IS NULL
              THEN 1

            ELSE 0
          END,

          t.due_date ASC,

          t.due_time ASC,

          t.created_at DESC
      `;
    }

    return db.all(query, params);
  }

  // ============================================================
  // GET TASK BY ID
  // ============================================================

  static async getById(
    id,
    userId = null,
    options = {}
  ) {
    const db = await openDb();
    await this.ensureSchema(db);

    const includeDeleted =
      options.includeDeleted === true;

    let query = `
      SELECT
        t.*,

        b.name AS branch_name,

        u.full_name AS assignee_name,

        u2.full_name AS creator_name,

        CASE
          WHEN t.started_at IS NOT NULL
            AND t.completed_at IS NOT NULL
          THEN ROUND(
            (
              julianday(t.completed_at)
              - julianday(t.started_at)
            ) * 86400
          )
          ELSE NULL
        END AS duration_seconds

      FROM tasks t

      LEFT JOIN branches b
        ON t.branch_id = b.id

      LEFT JOIN users u
        ON t.assigned_to = u.id

      LEFT JOIN users u2
        ON t.created_by = u2.id

      WHERE t.id = ?
    `;

    const params = [id];

    // ----------------------------------------------------------
    // BY DEFAULT DELETED TASKS ARE INVISIBLE
    // ----------------------------------------------------------

    if (!includeDeleted) {
      query += `
        AND t.deleted_at IS NULL
      `;
    }

    // ----------------------------------------------------------
    // USER SECURITY
    // ----------------------------------------------------------

    if (userId) {
      query += `
        AND (
          t.created_by = ?
          OR t.assigned_to = ?
        )
      `;

      params.push(
        userId,
        userId
      );
    }

    return db.get(query, params);
  }

  // ============================================================
  // CREATE TASK
  // ============================================================

  static async create(taskData) {
    const db = await openDb();
    await this.ensureSchema(db);

    const {
      title,
      description,
      priority,
      branch_id,
      assigned_to,
      due_date,
      due_time,
      task_type,
      parent_task_id,
      created_by,
      started_at,
    } = taskData;

    const normalizedPriority =
      normalizePriority(priority);

    const normalizedTaskType =
      task_type || 'administrative';

    const result = await db.run(
      `
        INSERT INTO tasks (

          title,

          description,

          priority,

          branch_id,

          assigned_to,

          due_date,

          due_time,

          task_type,

          parent_task_id,

          created_by,

          started_at,

          status,

          completed_at,

          deleted_at

        )

        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          NULL,
          NULL
        )
      `,
      [
        title,

        description || null,

        normalizedPriority,

        branch_id || null,

        assigned_to || null,

        due_date || null,

        due_time || null,

        normalizedTaskType,

        parent_task_id || null,

        created_by,

        started_at || null,

        'pending',
      ]
    );

    return this.getById(
      result.lastID,
      created_by
    );
  }

  // ============================================================
  // UPDATE TASK
  // ============================================================

  static async update(
    id,
    updates,
    userId = null
  ) {
    const db = await openDb();
    await this.ensureSchema(db);

    const existingTask =
      await this.getById(
        id,
        userId
      );

    if (!existingTask) {
      return null;
    }

    const fields = [];
    const values = [];

    const allowed = [
      'title',
      'description',
      'priority',
      'branch_id',
      'assigned_to',
      'due_date',
      'due_time',
      'task_type',
      'parent_task_id',
      'status',
      'started_at',
      'completed_at',
    ];

    // ----------------------------------------------------------
    // COMPLETED BOOLEAN SUPPORT
    // ----------------------------------------------------------

    let requestedStatus =
      updates.status !== undefined
        ? normalizeStatus(updates.status)
        : undefined;

    if (
      typeof updates.completed === 'boolean'
    ) {
      requestedStatus =
        updates.completed
          ? 'resolved'
          : 'pending';
    }

    // ----------------------------------------------------------
    // NORMAL FIELDS
    // ----------------------------------------------------------

    for (const [key, value] of Object.entries(updates)) {
      if (!allowed.includes(key)) {
        continue;
      }

      if (value === undefined) {
        continue;
      }

      // Priority is always normalized here.
      // This guarantees that HIGH cannot accidentally
      // be stored as MEDIUM.
      if (key === 'priority') {
        fields.push('priority = ?');

        values.push(
          normalizePriority(value)
        );

        continue;
      }

      // Status is normalized here.
      if (key === 'status') {
        fields.push('status = ?');

        values.push(
          normalizeStatus(value)
        );

        continue;
      }

      fields.push(`${key} = ?`);

      values.push(value);
    }

    // ----------------------------------------------------------
    // STATUS / COMPLETION LOGIC
    // ----------------------------------------------------------

    if (requestedStatus === 'resolved') {
      fields.push(`
        status = 'resolved'
      `);

      fields.push(`
        resolved_at = CURRENT_TIMESTAMP
      `);

      fields.push(`
        completed_at = CURRENT_TIMESTAMP
      `);
    }

    if (
      requestedStatus === 'pending'
    ) {
      fields.push(`
        status = 'pending'
      `);

      fields.push(`
        resolved_at = NULL
      `);

      fields.push(`
        completed_at = NULL
      `);
    }

    if (
      requestedStatus === 'in_progress'
    ) {
      fields.push(`
        status = 'in_progress'
      `);

      fields.push(`
        started_at = COALESCE(
          started_at,
          CURRENT_TIMESTAMP
        )
      `);
    }

    // ----------------------------------------------------------
    // NOTHING TO UPDATE
    // ----------------------------------------------------------

    if (fields.length === 0) {
      return existingTask;
    }

    // ----------------------------------------------------------
    // WHERE
    // ----------------------------------------------------------

    values.push(id);

    let whereClause = `
      WHERE id = ?
    `;

    if (userId) {
      whereClause += `
        AND (
          created_by = ?
          OR assigned_to = ?
        )
      `;

      values.push(
        userId,
        userId
      );
    }

    await db.run(
      `
        UPDATE tasks

        SET ${fields.join(', ')}

        ${whereClause}
      `,
      values
    );

    return this.getById(
      id,
      userId
    );
  }

  // ============================================================
  // SOFT DELETE
  // ============================================================

  static async delete(
    id,
    userId = null
  ) {
    const db = await openDb();
    await this.ensureSchema(db);

    const existingTask =
      await this.getById(
        id,
        userId
      );

    if (!existingTask) {
      return null;
    }

    // ----------------------------------------------------------
    // MOVE PARENT TASK TO TRASH
    // ----------------------------------------------------------

    let childQuery = `
      UPDATE tasks

      SET deleted_at = CURRENT_TIMESTAMP

      WHERE parent_task_id = ?

        AND deleted_at IS NULL
    `;

    const childParams = [id];

    if (userId) {
      childQuery += `
        AND (
          created_by = ?
          OR assigned_to = ?
        )
      `;

      childParams.push(
        userId,
        userId
      );
    }

    await db.run(
      childQuery,
      childParams
    );

    // ----------------------------------------------------------
    // MOVE MAIN TASK TO TRASH
    // ----------------------------------------------------------

    let query = `
      UPDATE tasks

      SET deleted_at = CURRENT_TIMESTAMP

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

      params.push(
        userId,
        userId
      );
    }

    const result = await db.run(
      query,
      params
    );

    if (!result.changes) {
      return null;
    }

    return {
      success: true,

      id,

      deleted_at: new Date().toISOString(),
    };
  }

  // ============================================================
  // GET TRASH
  // ============================================================

  static async getTrash(
    userId = null
  ) {
    return this.getAll({
      user_id: userId,
      include_deleted: true,
    });
  }

  // ============================================================
  // RESTORE TASK
  // ============================================================

  static async restore(
    id,
    userId = null
  ) {
    const db = await openDb();
    await this.ensureSchema(db);

    const existingTask =
      await this.getById(
        id,
        userId,
        {
          includeDeleted: true,
        }
      );

    if (
      !existingTask ||
      !existingTask.deleted_at
    ) {
      return null;
    }

    // ----------------------------------------------------------
    // RESTORE CHILDREN
    // ----------------------------------------------------------

    let childQuery = `
      UPDATE tasks

      SET deleted_at = NULL

      WHERE parent_task_id = ?

        AND deleted_at IS NOT NULL
    `;

    const childParams = [id];

    if (userId) {
      childQuery += `
        AND (
          created_by = ?
          OR assigned_to = ?
        )
      `;

      childParams.push(
        userId,
        userId
      );
    }

    await db.run(
      childQuery,
      childParams
    );

    // ----------------------------------------------------------
    // RESTORE MAIN TASK
    // ----------------------------------------------------------

    let query = `
      UPDATE tasks

      SET deleted_at = NULL

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

      params.push(
        userId,
        userId
      );
    }

    await db.run(
      query,
      params
    );

    return this.getById(
      id,
      userId
    );
  }

  // ============================================================
  // PERMANENT DELETE
  // ============================================================

  static async permanentDelete(
    id,
    userId = null
  ) {
    const db = await openDb();
    await this.ensureSchema(db);

    const existingTask =
      await this.getById(
        id,
        userId,
        {
          includeDeleted: true,
        }
      );

    if (!existingTask) {
      return null;
    }

    // ----------------------------------------------------------
    // DELETE CHILDREN
    // ----------------------------------------------------------

    let childQuery = `
      DELETE FROM tasks

      WHERE parent_task_id = ?
    `;

    const childParams = [id];

    if (userId) {
      childQuery += `
        AND (
          created_by = ?
          OR assigned_to = ?
        )
      `;

      childParams.push(
        userId,
        userId
      );
    }

    await db.run(
      childQuery,
      childParams
    );

    // ----------------------------------------------------------
    // DELETE MAIN TASK
    // ----------------------------------------------------------

    let query = `
      DELETE FROM tasks

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

      params.push(
        userId,
        userId
      );
    }

    const result = await db.run(
      query,
      params
    );

    if (!result.changes) {
      return null;
    }

    return {
      success: true,
      id,
    };
  }

  // ============================================================
  // TASK HISTORY
  // ============================================================

  static async getHistory(
    userId = null
  ) {
    const db = await openDb();
    await this.ensureSchema(db);

    let query = `
      SELECT
        t.*,

        b.name AS branch_name,

        u.full_name AS assignee_name,

        u2.full_name AS creator_name,

        CASE
          WHEN t.started_at IS NOT NULL
            AND t.completed_at IS NOT NULL
          THEN ROUND(
            (
              julianday(t.completed_at)
              - julianday(t.started_at)
            ) * 86400
          )
          ELSE NULL
        END AS duration_seconds

      FROM tasks t

      LEFT JOIN branches b
        ON t.branch_id = b.id

      LEFT JOIN users u
        ON t.assigned_to = u.id

      LEFT JOIN users u2
        ON t.created_by = u2.id

      WHERE t.status = 'resolved'

        AND t.completed_at IS NOT NULL

        AND t.deleted_at IS NULL
    `;

    const params = [];

    if (userId) {
      query += `
        AND (
          t.created_by = ?
          OR t.assigned_to = ?
        )
      `;

      params.push(
        userId,
        userId
      );
    }

    query += `
      ORDER BY
        t.completed_at DESC
    `;

    return db.all(
      query,
      params
    );
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  static async getStats(
    userId = null
  ) {
    const db = await openDb();
    await this.ensureSchema(db);

    let whereClause = `
      WHERE deleted_at IS NULL
    `;

    const params = [];

    if (userId) {
      whereClause += `
        AND (
          created_by = ?
          OR assigned_to = ?
        )
      `;

      params.push(
        userId,
        userId
      );
    }

    return db.get(
      `
        SELECT

          COUNT(*) AS total,

          SUM(
            CASE
              WHEN status = 'pending'
              THEN 1
              ELSE 0
            END
          ) AS pending,

          SUM(
            CASE
              WHEN status = 'in_progress'
              THEN 1
              ELSE 0
            END
          ) AS in_progress,

          SUM(
            CASE
              WHEN status = 'resolved'
              THEN 1
              ELSE 0
            END
          ) AS resolved,

          SUM(
            CASE
              WHEN priority = 'high'
                AND status != 'resolved'
              THEN 1
              ELSE 0
            END
          ) AS high_active,

          SUM(
            CASE
              WHEN due_date < date('now')
                AND status != 'resolved'
                AND due_date IS NOT NULL
              THEN 1
              ELSE 0
            END
          ) AS overdue,

          SUM(
            CASE
              WHEN status = 'resolved'

                AND completed_at >=
                  datetime(
                    'now',
                    'start of day'
                  )

                AND completed_at <
                  datetime(
                    'now',
                    'start of day',
                    '+1 day'
                  )

              THEN 1
              ELSE 0
            END
          ) AS completed_today,

          SUM(
            CASE
              WHEN status = 'resolved'
                AND completed_at IS NOT NULL
              THEN 1
              ELSE 0
            END
          ) AS completed_total

        FROM tasks

        ${whereClause}
      `,
      params
    );
  }
}