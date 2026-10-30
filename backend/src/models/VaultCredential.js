import { openDb } from '../config/database.js';
import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(crypto.scrypt);
const CURRENT_ALGORITHM = 'aes-256-gcm';
const CURRENT_VERSION = 2;

async function deriveKey(masterPassword, salt) {
  if (!masterPassword || typeof masterPassword !== 'string') {
    throw new Error('Master Password requerida');
  }

  return scryptAsync(masterPassword, salt, 32);
}

/**
 * New values use AES-256-GCM with a per-value random salt and IV.
 * The legacy AES-256-CBC envelope remains readable for existing records.
 */
async function encrypt(text, masterPassword) {
  const value = String(text ?? '');
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = await deriveKey(masterPassword, salt);
  const cipher = crypto.createCipheriv(CURRENT_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);

  return {
    version: CURRENT_VERSION,
    algorithm: CURRENT_ALGORITHM,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
    encryptedData: encrypted.toString('hex'),
  };
}

async function decrypt(envelopeValue, masterPassword) {
  const envelope = typeof envelopeValue === 'string'
    ? JSON.parse(envelopeValue)
    : envelopeValue;

  if (!envelope || typeof envelope !== 'object' || !envelope.encryptedData || !envelope.iv) {
    throw new Error('Formato de credencial cifrada no válido');
  }

  if (Number(envelope.version) === CURRENT_VERSION && envelope.algorithm === CURRENT_ALGORITHM) {
    if (!envelope.salt || !envelope.authTag) {
      throw new Error('El registro cifrado está incompleto');
    }

    const salt = Buffer.from(envelope.salt, 'hex');
    const iv = Buffer.from(envelope.iv, 'hex');
    const authTag = Buffer.from(envelope.authTag, 'hex');
    if (salt.length !== 16 || iv.length !== 12 || authTag.length !== 16) {
      throw new Error('El registro cifrado está dañado');
    }

    const key = await deriveKey(masterPassword, salt);
    const decipher = crypto.createDecipheriv(CURRENT_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(Buffer.from(envelope.encryptedData, 'hex')),
      decipher.final(),
    ]).toString('utf8');
  }

  // Backward compatibility for existing AES-256-CBC values.
  const legacyIv = Buffer.from(envelope.iv, 'hex');
  if (legacyIv.length !== 16) {
    throw new Error('Formato de credencial heredada no válido');
  }

  const legacyKey = await deriveKey(masterPassword, Buffer.from('salt', 'utf8'));
  const decipher = crypto.createDecipheriv('aes-256-cbc', legacyKey, legacyIv);
  return Buffer.concat([
    decipher.update(Buffer.from(envelope.encryptedData, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}

const publicCredential = (credential) => {
  if (!credential) return null;

  return {
    id: Number(credential.id),
    service_name: credential.service_name,
    url: credential.url,
    username: credential.username,
    category: credential.category,
    status: credential.status,
    created_by: credential.created_by,
    last_updated: credential.last_updated,
    expires_at: credential.expires_at || null,
    favorite: Boolean(credential.favorite),
    usage_count: Number(credential.usage_count || 0),
    last_used: credential.last_used || null,
    has_password: Boolean(credential.encrypted_password),
  };
};

const passwordIssues = (password) => {
  const issues = [];
  if (password.length < 12) issues.push('short');
  if (!/[a-z]/.test(password)) issues.push('no_lowercase');
  if (!/[A-Z]/.test(password)) issues.push('no_uppercase');
  if (!/[0-9]/.test(password)) issues.push('no_number');
  if (!/[^A-Za-z0-9]/.test(password)) issues.push('no_symbol');
  if (/(.)\1{3,}/.test(password)) issues.push('repeated_characters');
  return issues;
};

const validExpiry = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const text = String(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error('La fecha de vencimiento no es válida');
  }
  const parsed = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    throw new Error('La fecha de vencimiento no es válida');
  }
  return text;
};

export class VaultCredential {
  static async getAll(filters = {}) {
    const db = await openDb();
    const userId = Number(filters.userId) || 0;

    const credentials = await db.all(
      `SELECT v.*,
        (SELECT COUNT(*) FROM vault_favorites
         WHERE credential_id = v.id AND user_id = ?) AS is_favorite
       FROM vault_credentials v
       ORDER BY v.last_updated DESC, v.id DESC`,
      [userId]
    );

    return credentials.map((credential) => ({
      ...publicCredential(credential),
      is_favorite: undefined,
      favorite: Number(credential.is_favorite) > 0,
    }));
  }

  static async getById(id) {
    const db = await openDb();
    const credential = await db.get(
      'SELECT * FROM vault_credentials WHERE id = ?',
      [id]
    );
    return publicCredential(credential);
  }

  static async create(data, masterPassword) {
    const db = await openDb();
    if (!String(data.password || '')) {
      throw new Error('La contraseña es obligatoria');
    }

    const encryptedPassword = await encrypt(data.password, masterPassword);
    const encryptedNotes = data.notes
      ? await encrypt(data.notes, masterPassword)
      : null;
    const expiresAt = validExpiry(data.expires_at);

    const result = await db.run(
      `INSERT INTO vault_credentials
        (service_name, url, username, encrypted_password, encrypted_notes,
         category, created_by, last_updated, status, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(data.service_name || '').trim(),
        data.url || null,
        String(data.username || '').trim(),
        JSON.stringify(encryptedPassword),
        encryptedNotes ? JSON.stringify(encryptedNotes) : null,
        data.category || null,
        data.created_by,
        new Date().toISOString(),
        data.status || 'active',
        expiresAt,
      ]
    );

    return this.getById(result.lastID);
  }

  static async revealPassword(id, masterPassword) {
    const db = await openDb();
    const credential = await db.get(
      'SELECT encrypted_password, encrypted_notes FROM vault_credentials WHERE id = ?',
      [id]
    );
    if (!credential) throw new Error('Credencial no encontrada');

    let password;
    let notes = '';
    try {
      password = await decrypt(credential.encrypted_password, masterPassword);
      notes = credential.encrypted_notes
        ? await decrypt(credential.encrypted_notes, masterPassword)
        : '';
    } catch {
      throw new Error('Master Password incorrecta');
    }

    return { password, notes };
  }

  static async update(id, data, masterPassword, changedBy) {
    const db = await openDb();
    const current = await db.get(
      'SELECT * FROM vault_credentials WHERE id = ?',
      [id]
    );
    if (!current) throw new Error('Credencial no encontrada');

    try {
      await decrypt(current.encrypted_password, masterPassword);
    } catch {
      throw new Error('Master Password incorrecta');
    }

    // Preserve the previous encrypted version before applying any changes.
    await db.run(
      `INSERT INTO vault_credential_history
        (credential_id, service_name, url, username, encrypted_password,
         encrypted_notes, category, tags, changed_by, change_reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        current.id,
        current.service_name,
        current.url,
        current.username,
        current.encrypted_password,
        current.encrypted_notes,
        current.category,
        null,
        changedBy,
        data.change_reason ? String(data.change_reason).slice(0, 500) : null,
      ]
    );

    const fields = [];
    const values = [];

    if (Object.prototype.hasOwnProperty.call(data, 'service_name')) {
      fields.push('service_name = ?');
      values.push(String(data.service_name || '').trim());
    }
    if (Object.prototype.hasOwnProperty.call(data, 'url')) {
      fields.push('url = ?');
      values.push(data.url || null);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'username')) {
      fields.push('username = ?');
      values.push(String(data.username || '').trim());
    }
    if (data.password) {
      fields.push('encrypted_password = ?');
      values.push(JSON.stringify(await encrypt(data.password, masterPassword)));
    }
    if (Object.prototype.hasOwnProperty.call(data, 'notes')) {
      const encryptedNotes = data.notes
        ? await encrypt(data.notes, masterPassword)
        : null;
      fields.push('encrypted_notes = ?');
      values.push(encryptedNotes ? JSON.stringify(encryptedNotes) : null);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'category')) {
      fields.push('category = ?');
      values.push(data.category || null);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'status')) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'expires_at')) {
      fields.push('expires_at = ?');
      values.push(validExpiry(data.expires_at));
    }

    fields.push('last_updated = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await db.run(
      `UPDATE vault_credentials SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.getById(id);
  }

  static async getHistory(id) {
    const db = await openDb();
    return db.all(
      `SELECT id, credential_id, service_name, url, username,
              category, change_reason, changed_by, changed_at
       FROM vault_credential_history
       WHERE credential_id = ?
       ORDER BY changed_at DESC, id DESC
       LIMIT 50`,
      [id]
    );
  }

  /**
   * Audits credentials in memory. The plaintext is never persisted, logged,
   * or returned. Only issue labels and duplicate credential IDs are exposed.
   */
  static async auditSecurity(masterPassword) {
    const db = await openDb();
    const credentials = await db.all(
      `SELECT id, service_name, encrypted_password
       FROM vault_credentials
       WHERE status = 'active'
       ORDER BY id ASC`
    );

    const digestGroups = new Map();
    const results = [];

    for (const credential of credentials) {
      let password;
      try {
        password = await decrypt(credential.encrypted_password, masterPassword);
      } catch {
        throw new Error('Master Password incorrecta');
      }

      const issues = passwordIssues(password);
      const digest = crypto.createHash('sha256').update(password, 'utf8').digest('hex');
      const existing = digestGroups.get(digest) || [];
      existing.push(Number(credential.id));
      digestGroups.set(digest, existing);

      results.push({
        id: Number(credential.id),
        service_name: credential.service_name,
        issues,
        score: Math.max(0, 100 - issues.length * 17),
      });

      // Drop this local reference before processing the next credential.
      password = '';
    }

    for (const result of results) {
      const match = [...digestGroups.values()].find((ids) => ids.includes(result.id) && ids.length > 1);
      result.duplicate_with = match
        ? match.filter((id) => id !== result.id)
        : [];
      if (result.duplicate_with.length) result.issues.push('duplicate');
      result.score = Math.max(0, 100 - result.issues.length * 17);
    }

    const findings = results.filter((item) => item.issues.length > 0);
    return {
      audited: results.length,
      secure: results.length - findings.length,
      findings,
      duplicateCredentials: results.filter((item) => item.duplicate_with.length).length,
      weakCredentials: results.filter((item) => item.issues.some((issue) => issue !== 'duplicate')).length,
      audited_at: new Date().toISOString(),
    };
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
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
        COUNT(DISTINCT category) AS categories_used
      FROM vault_credentials
    `);
    return result || { total: 0, active: 0, categories_used: 0 };
  }
}
