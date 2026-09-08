import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbInstance = null;

// Asegurar que el directorio data existe
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('📁 Directorio data creado en:', dataDir);
}

const DB_PATH = path.join(dataDir, 'database.sqlite');

export async function openDb() {
  if (dbInstance) return dbInstance;
  
  console.log('📂 Base de datos en:', DB_PATH);
  
  dbInstance = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  
  return dbInstance;
}

export async function initDb() {
  const db = await openDb();
  
  console.log('🔧 Inicializando base de datos...');
  
  // Tabla de usuarios
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'analyst',
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de sucursales
  await db.exec(`
    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT UNIQUE,
      address TEXT,
      city TEXT,
      phone TEXT,
      manager_name TEXT,
      manager_phone TEXT,
      manager_email TEXT,
      subnet TEXT,
      public_ip TEXT,
      gateway TEXT,
      dns_primary TEXT,
      dns_secondary TEXT,
      internet_provider TEXT,
      status TEXT DEFAULT 'active',
      opening_date DATE,
      capacity INTEGER,
      business_hours TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de hardware (INVENTARIO)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS hardware (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      brand_model TEXT,
      serial_number TEXT UNIQUE,
      service_tag TEXT,
      ip_address TEXT,
      mac_address TEXT,
      status TEXT DEFAULT 'active',
      branch_id INTEGER,
      purchase_date DATE,
      warranty_end DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
    )
  `);

  // Tabla de especificaciones de hardware
  await db.exec(`
    CREATE TABLE IF NOT EXISTS hardware_specs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hardware_id INTEGER NOT NULL,
      spec_key TEXT NOT NULL,
      spec_value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE
    )
  `);

  // Tabla de tareas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      branch_id INTEGER,
      assigned_to INTEGER,
      created_by INTEGER,
      due_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      resolved_at TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Tabla de credenciales (Bóveda)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vault_credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_name TEXT NOT NULL,
      url TEXT,
      username TEXT NOT NULL,
      encrypted_password TEXT NOT NULL,
      encrypted_notes TEXT,
      category TEXT,
      created_by INTEGER,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active',
      favorite BOOLEAN DEFAULT 0,
      usage_count INTEGER DEFAULT 0,
      last_used TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Tabla de tags
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vault_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT 'gray',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Relación credencial-tags
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vault_credential_tags (
      credential_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      FOREIGN KEY (credential_id) REFERENCES vault_credentials(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES vault_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (credential_id, tag_id)
    )
  `);

  // Tabla de favoritos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vault_favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credential_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (credential_id) REFERENCES vault_credentials(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(credential_id, user_id)
    )
  `);

  // Tabla de auditoría de accesos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vault_access_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credential_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (credential_id) REFERENCES vault_credentials(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tabla de historial de versiones
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vault_credential_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credential_id INTEGER NOT NULL,
      service_name TEXT NOT NULL,
      url TEXT,
      username TEXT NOT NULL,
      encrypted_password TEXT NOT NULL,
      encrypted_notes TEXT,
      category TEXT,
      tags TEXT,
      changed_by INTEGER NOT NULL,
      change_reason TEXT,
      changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (credential_id) REFERENCES vault_credentials(id) ON DELETE CASCADE,
      FOREIGN KEY (changed_by) REFERENCES users(id)
    )
  `);

  // Tabla de compartición de credenciales
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vault_shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credential_id INTEGER NOT NULL,
      shared_with_user_id INTEGER NOT NULL,
      shared_by_user_id INTEGER NOT NULL,
      permission TEXT DEFAULT 'view',
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (credential_id) REFERENCES vault_credentials(id) ON DELETE CASCADE,
      FOREIGN KEY (shared_with_user_id) REFERENCES users(id),
      FOREIGN KEY (shared_by_user_id) REFERENCES users(id)
    )
  `);

  // Tabla de cache offline (para modo offline)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS vault_offline_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      credential_id INTEGER NOT NULL,
      encrypted_data TEXT NOT NULL,
      synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(credential_id)
    )
  `);

  // Tabla de conexiones remotas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS remote_access (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER,
      computer_name TEXT NOT NULL,
      anydesk_id TEXT,
      teamviewer_id TEXT,
      notes TEXT,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (branch_id) REFERENCES branches(id)
    )
  `);

  // Tabla de snippets
  await db.exec(`
    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      language TEXT,
      category_id INTEGER,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de mantenimiento programado
  await db.exec(`
    CREATE TABLE IF NOT EXISTS maintenance_schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hardware_id INTEGER,
      title TEXT NOT NULL,
      scheduled_date DATE NOT NULL,
      type TEXT DEFAULT 'preventive',
      status TEXT DEFAULT 'pending',
      created_by INTEGER,
      FOREIGN KEY (hardware_id) REFERENCES hardware(id)
    )
  `);

  // Tabla de historial de mantenimiento
  await db.exec(`
    CREATE TABLE IF NOT EXISTS maintenance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hardware_id INTEGER,
      performed_by INTEGER,
      scheduled_maintenance_id INTEGER,
      description TEXT NOT NULL,
      performed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hardware_id) REFERENCES hardware(id)
    )
  `);

  // Tabla de contactos de sucursales
  await db.exec(`
    CREATE TABLE IF NOT EXISTS branch_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      is_primary BOOLEAN DEFAULT 0,
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
    )
  `);

  // Tabla de categorías
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL
    )
  `);

  // Insertar categorías por defecto para la bóveda
  const categoriesCount = await db.get('SELECT COUNT(*) as count FROM categories WHERE type = "vault"');
  if (categoriesCount.count === 0) {
    const defaultCategories = [
      { name: 'Router ISP', type: 'vault' },
      { name: 'Portal de Proveedor', type: 'vault' },
      { name: 'Base de Datos', type: 'vault' },
      { name: 'Servidor', type: 'vault' },
      { name: 'Correo Electrónico', type: 'vault' },
      { name: 'AnyDesk', type: 'vault' },
      { name: 'TeamViewer', type: 'vault' },
      { name: 'Redes Sociales', type: 'vault' }
    ];
    
    for (const cat of defaultCategories) {
      await db.run('INSERT INTO categories (name, type) VALUES (?, ?)', [cat.name, cat.type]);
    }
    console.log('✅ Categorías de bóveda creadas');
  }

  // Insertar categorías por defecto para snippets
  const snippetCategoriesCount = await db.get('SELECT COUNT(*) as count FROM categories WHERE type = "snippet"');
  if (snippetCategoriesCount.count === 0) {
    const snippetCategories = [
      { name: 'SQL Queries', type: 'snippet' },
      { name: 'PowerShell Scripts', type: 'snippet' },
      { name: 'Cisco Commands', type: 'snippet' },
      { name: 'MikroTik Commands', type: 'snippet' },
      { name: 'Python Scripts', type: 'snippet' },
      { name: 'Bash Commands', type: 'snippet' }
    ];
    
    for (const cat of snippetCategories) {
      await db.run('INSERT INTO categories (name, type) VALUES (?, ?)', [cat.name, cat.type]);
    }
    console.log('✅ Categorías de snippets creadas');
  }

  // Insertar tags por defecto
  const tagsCount = await db.get('SELECT COUNT(*) as count FROM vault_tags');
  if (tagsCount.count === 0) {
    const defaultTags = [
      { name: 'urgente', color: 'red' },
      { name: 'producción', color: 'purple' },
      { name: 'backup', color: 'blue' },
      { name: 'crítico', color: 'orange' },
      { name: 'externo', color: 'green' }
    ];
    
    for (const tag of defaultTags) {
      await db.run('INSERT INTO vault_tags (name, color) VALUES (?, ?)', [tag.name, tag.color]);
    }
    console.log('✅ Tags por defecto creados');
  }

  // Crear usuario admin por defecto
  const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(`
      INSERT INTO users (username, password_hash, full_name, email, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['admin', hashedPassword, 'Administrador', 'admin@itsupport.com', 'admin', 1]);
    console.log('✅ Usuario admin creado: admin / admin123');
  }

  // Agregar columnas faltantes a vault_credentials si no existen
  const tableInfo = await db.all("PRAGMA table_info(vault_credentials)");
  const columns = tableInfo.map(col => col.name);
  
  if (!columns.includes('favorite')) {
    await db.exec(`ALTER TABLE vault_credentials ADD COLUMN favorite BOOLEAN DEFAULT 0`);
    console.log('✅ Columna favorite agregada');
  }
  
  if (!columns.includes('usage_count')) {
    await db.exec(`ALTER TABLE vault_credentials ADD COLUMN usage_count INTEGER DEFAULT 0`);
    console.log('✅ Columna usage_count agregada');
  }
  
  if (!columns.includes('last_used')) {
    await db.exec(`ALTER TABLE vault_credentials ADD COLUMN last_used TIMESTAMP`);
    console.log('✅ Columna last_used agregada');
  }

  console.log('✅ Base de datos inicializada correctamente en:', DB_PATH);
  return db;
}