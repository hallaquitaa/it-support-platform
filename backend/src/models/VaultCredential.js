import { openDb } from '../config/database.js';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function encrypt(text, masterPassword) {
  const key = crypto.scryptSync(masterPassword, 'salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encryptedData: encrypted, iv: iv.toString('hex') };
}

function decrypt(encryptedData, ivHex, masterPassword) {
  const key = crypto.scryptSync(masterPassword, 'salt', 32);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export class VaultCredential {
  static async getAll(filters = {}) {
  const db = await openDb();
  const userId = filters.userId || 1;
  
  const credentials = await db.all(`
    SELECT v.*, 
           (SELECT COUNT(*) FROM vault_favorites WHERE credential_id = v.id AND user_id = ?) as is_favorite
    FROM vault_credentials v
    ORDER BY v.last_updated DESC
  `, [userId]);
  
  return credentials.map(cred => ({
    ...cred,
    encrypted_password: undefined,
    encrypted_notes: undefined,
    has_password: !!cred.encrypted_password,
    favorite: cred.is_favorite === 1
  }));
}

  static async getById(id) {
    const db = await openDb();
    return db.get('SELECT * FROM vault_credentials WHERE id = ?', [id]);
  }

  static async create(data, masterPassword) {
    const db = await openDb();
    const encrypted = encrypt(data.password, masterPassword);
    
    const result = await db.run(`
      INSERT INTO vault_credentials (service_name, url, username, encrypted_password, category, created_by, last_updated, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.service_name, data.url || null, data.username,
      JSON.stringify(encrypted), data.category || null,
      data.created_by, new Date().toISOString(), data.status || 'active'
    ]);
    
    return this.getById(result.lastID);
  }

  static async revealPassword(id, masterPassword) {
    const db = await openDb();
    const credential = await db.get('SELECT encrypted_password FROM vault_credentials WHERE id = ?', [id]);
    if (!credential) throw new Error('Credencial no encontrada');
    
    const encryptedData = JSON.parse(credential.encrypted_password);
    const decryptedPassword = decrypt(encryptedData.encryptedData, encryptedData.iv, masterPassword);
    
    return { password: decryptedPassword };
  }

  static async update(id, data, masterPassword) {
    const db = await openDb();
    const current = await db.get('SELECT encrypted_password FROM vault_credentials WHERE id = ?', [id]);
    if (!current) throw new Error('Credencial no encontrada');
    
    try {
      const encryptedData = JSON.parse(current.encrypted_password);
      decrypt(encryptedData.encryptedData, encryptedData.iv, masterPassword);
    } catch (error) {
      throw new Error('Master Password incorrecta');
    }
    
    const fields = [];
    const values = [];

    if (data.service_name) {
      fields.push('service_name = ?');
      values.push(data.service_name);
    }
    if (data.url !== undefined) {
      fields.push('url = ?');
      values.push(data.url);
    }
    if (data.username) {
      fields.push('username = ?');
      values.push(data.username);
    }
    if (data.password && data.password !== '') {
      const encrypted = encrypt(data.password, masterPassword);
      fields.push('encrypted_password = ?');
      values.push(JSON.stringify(encrypted));
    }
    if (data.category !== undefined) {
      fields.push('category = ?');
      values.push(data.category);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    
    fields.push('last_updated = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    await db.run(`UPDATE vault_credentials SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id) {
    const db = await openDb();
    await db.run('DELETE FROM vault_credentials WHERE id = ?', [id]);
    return { success: true };
  }

  static async getStats() {
    const db = await openDb();
    const result = await db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        COUNT(DISTINCT category) as categories_used
      FROM vault_credentials
    `);
    return result || { total: 0, active: 0, categories_used: 0 };
  }
}