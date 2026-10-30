import { openDb } from './database.js';

export async function initRemoteAccessSchema() {
  const db = await openDb();
  const columns = await db.all('PRAGMA table_info(remote_access)');
  const existing = new Set(columns.map((column) => column.name));

  const additiveColumns = [
    ['responsible', 'TEXT'],
    ['department', 'TEXT'],
    ['location', 'TEXT'],
    ['priority', "TEXT DEFAULT 'normal'"],
    ['status', "TEXT DEFAULT 'registered'"],
    ['tags_json', 'TEXT'],
  ];

  for (const [name, definition] of additiveColumns) {
    if (!existing.has(name)) {
      await db.exec(`ALTER TABLE remote_access ADD COLUMN ${name} ${definition}`);
    }
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS remote_access_favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      remote_access_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(remote_access_id, user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Keep event history even if a remote-access record is later deleted.
  await db.exec(`
    CREATE TABLE IF NOT EXISTS remote_access_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      remote_access_id INTEGER NOT NULL,
      actor_user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_remote_favorites_user
    ON remote_access_favorites(user_id, remote_access_id)
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_remote_events_item
    ON remote_access_events(remote_access_id, created_at DESC)
  `);
}
