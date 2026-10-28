import { openDb } from './database.js';

/**
 * Extensiones del inventario. Se crean aparte para no alterar ni borrar
 * los registros existentes de hardware en instalaciones ya desplegadas.
 */
export async function initHardwareAssetSchema() {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS hardware_asset_details (
      hardware_id INTEGER PRIMARY KEY,
      asset_tag TEXT UNIQUE,
      assigned_to TEXT,
      department TEXT,
      physical_location TEXT,
      purchase_cost REAL DEFAULT 0,
      salvage_value REAL DEFAULT 0,
      useful_life_years REAL DEFAULT 5,
      depreciation_method TEXT DEFAULT 'straight_line',
      asset_condition TEXT DEFAULT 'good',
      image_url TEXT,
      last_audit_date DATE,
      discovery_source TEXT DEFAULT 'manual',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hardware_asset_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hardware_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      metadata_json TEXT,
      performed_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE,
      FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS hardware_components (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hardware_id INTEGER NOT NULL,
      component_type TEXT NOT NULL,
      name TEXT NOT NULL,
      manufacturer TEXT,
      model TEXT,
      serial_number TEXT,
      capacity TEXT,
      installed_at DATE,
      removed_at DATE,
      notes TEXT,
      status TEXT DEFAULT 'installed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hardware_loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hardware_id INTEGER NOT NULL,
      borrower_name TEXT NOT NULL,
      borrower_email TEXT,
      checkout_date DATE NOT NULL,
      due_date DATE NOT NULL,
      returned_at DATE,
      notes TEXT,
      status TEXT DEFAULT 'active',
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS hardware_transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hardware_id INTEGER NOT NULL,
      from_branch_id INTEGER,
      to_branch_id INTEGER,
      requested_by TEXT,
      approved_by TEXT,
      transfer_date DATE NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'completed',
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE,
      FOREIGN KEY (from_branch_id) REFERENCES branches(id) ON DELETE SET NULL,
      FOREIGN KEY (to_branch_id) REFERENCES branches(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS hardware_audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hardware_id INTEGER NOT NULL,
      audit_date DATE NOT NULL,
      result TEXT NOT NULL,
      notes TEXT,
      audited_by TEXT,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_hardware_events_asset ON hardware_asset_events(hardware_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_hardware_components_asset ON hardware_components(hardware_id, status);
    CREATE INDEX IF NOT EXISTS idx_hardware_loans_due ON hardware_loans(status, due_date);
    CREATE INDEX IF NOT EXISTS idx_hardware_transfers_asset ON hardware_transfers(hardware_id, transfer_date DESC);
  `);
}
