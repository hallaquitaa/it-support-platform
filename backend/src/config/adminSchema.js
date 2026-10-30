import { openDb } from './database.js';

/**
 * Additive administrative audit schema. It does not alter existing tables.
 */
export async function initAdminSchema() {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_user_id INTEGER,
      target_user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_admin_audit_created
    ON admin_audit_logs(created_at DESC)
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_admin_audit_actor
    ON admin_audit_logs(actor_user_id, created_at DESC)
  `);
}
