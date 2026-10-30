import bcrypt from 'bcrypt';
import { openDb } from '../config/database.js';

const ALLOWED_ROLES = new Set(['admin', 'technician', 'analyst']);
const PASSWORD_MIN_LENGTH = 12;

const safeUser = (user) => ({
  id: Number(user.id),
  username: user.username,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  is_active: Number(user.is_active) === 1,
  created_at: user.created_at,
});

const logAdminAction = async (db, req, { targetUserId = null, action, details = null }) => {
  await db.run(
    `INSERT INTO admin_audit_logs
      (actor_user_id, target_user_id, action, details, ip_address)
     VALUES (?, ?, ?, ?, ?)`,
    [
      req.currentUser.id,
      targetUserId,
      action,
      details ? JSON.stringify(details) : null,
      req.ip || null,
    ]
  );
};

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export const getAdminUsers = async (_req, res) => {
  try {
    const db = await openDb();
    const users = await db.all(`
      SELECT id, username, full_name, email, role, is_active, created_at
      FROM users
      ORDER BY is_active DESC, full_name COLLATE NOCASE ASC, id ASC
    `);

    return res.json(users.map(safeUser));
  } catch (error) {
    console.error('Error listando usuarios administrativos:', error);
    return res.status(500).json({ error: 'No se pudieron cargar los usuarios.' });
  }
};

export const createAdminUser = async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const fullName = String(req.body?.full_name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const role = String(req.body?.role || 'analyst');

  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    return res.status(400).json({ error: 'El usuario debe tener entre 3 y 32 caracteres (letras, números, punto, guion o guion bajo).' });
  }
  if (fullName.length < 2 || fullName.length > 100) {
    return res.status(400).json({ error: 'El nombre debe tener entre 2 y 100 caracteres.' });
  }
  if (!isValidEmail(email) || email.length > 160) {
    return res.status(400).json({ error: 'Introduce un correo electrónico válido.' });
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({ error: `La contraseña inicial debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.` });
  }
  if (!ALLOWED_ROLES.has(role)) {
    return res.status(400).json({ error: 'El rol seleccionado no es válido.' });
  }

  try {
    const db = await openDb();
    const existing = await db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese usuario o correo.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await db.run(
      `INSERT INTO users (username, password_hash, full_name, email, role, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [username, passwordHash, fullName, email, role]
    );

    const user = await db.get(
      'SELECT id, username, full_name, email, role, is_active, created_at FROM users WHERE id = ?',
      [result.lastID]
    );

    await logAdminAction(db, req, {
      targetUserId: result.lastID,
      action: 'user_created',
      details: { username, role },
    });

    return res.status(201).json(safeUser(user));
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'El usuario o correo ya está registrado.' });
    }
    console.error('Error creando usuario:', error);
    return res.status(500).json({ error: 'No se pudo crear el usuario.' });
  }
};

export const updateAdminUser = async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: 'El identificador de usuario no es válido.' });
  }

  const updates = [];
  const values = [];
  const body = req.body || {};

  if (Object.prototype.hasOwnProperty.call(body, 'full_name')) {
    const fullName = String(body.full_name || '').trim();
    if (fullName.length < 2 || fullName.length > 100) {
      return res.status(400).json({ error: 'El nombre debe tener entre 2 y 100 caracteres.' });
    }
    updates.push('full_name = ?');
    values.push(fullName);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'email')) {
    const email = String(body.email || '').trim().toLowerCase();
    if (!isValidEmail(email) || email.length > 160) {
      return res.status(400).json({ error: 'Introduce un correo electrónico válido.' });
    }
    updates.push('email = ?');
    values.push(email);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'role')) {
    const role = String(body.role || '');
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ error: 'El rol seleccionado no es válido.' });
    }
    updates.push('role = ?');
    values.push(role);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'is_active')) {
    if (typeof body.is_active !== 'boolean') {
      return res.status(400).json({ error: 'El estado debe ser activo o inactivo.' });
    }
    updates.push('is_active = ?');
    values.push(body.is_active ? 1 : 0);
  }

  if (!updates.length) {
    return res.status(400).json({ error: 'No se recibieron cambios válidos.' });
  }

  if (targetId === req.currentUser.id) {
    const demotesSelf = Object.prototype.hasOwnProperty.call(body, 'role') && body.role !== 'admin';
    const disablesSelf = body.is_active === false;
    if (demotesSelf || disablesSelf) {
      return res.status(400).json({ error: 'No puedes retirar tus propios permisos administrativos ni desactivar tu cuenta.' });
    }
  }

  let transactionOpen = false;
  try {
    const db = await openDb();
    await db.exec('BEGIN IMMEDIATE');
    transactionOpen = true;

    const current = await db.get(
      'SELECT id, role, is_active FROM users WHERE id = ?',
      [targetId]
    );
    if (!current) {
      await db.exec('ROLLBACK');
      transactionOpen = false;
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    values.push(targetId);
    await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const activeAdmins = await db.get(
      `SELECT COUNT(*) AS count FROM users
       WHERE role = 'admin' AND is_active = 1`
    );
    if (!Number(activeAdmins?.count)) {
      await db.exec('ROLLBACK');
      transactionOpen = false;
      return res.status(400).json({ error: 'Debe permanecer al menos un administrador activo.' });
    }

    const updated = await db.get(
      'SELECT id, username, full_name, email, role, is_active, created_at FROM users WHERE id = ?',
      [targetId]
    );

    await logAdminAction(db, req, {
      targetUserId: targetId,
      action: 'user_updated',
      details: {
        fields: Object.keys(body).filter((key) => ['full_name', 'email', 'role', 'is_active'].includes(key)),
        previousRole: current.role,
        previousActive: Number(current.is_active) === 1,
      },
    });

    await db.exec('COMMIT');
    transactionOpen = false;
    return res.json(safeUser(updated));
  } catch (error) {
    if (transactionOpen) {
      try {
        const db = await openDb();
        await db.exec('ROLLBACK');
      } catch {}
    }
    if (String(error.message).includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'El correo ya está asignado a otro usuario.' });
    }
    console.error('Error actualizando usuario:', error);
    return res.status(500).json({ error: 'No se pudo actualizar el usuario.' });
  }
};

export const resetAdminUserPassword = async (req, res) => {
  const targetId = Number(req.params.id);
  const password = String(req.body?.password || '');

  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: 'El identificador de usuario no es válido.' });
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({ error: `La nueva contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.` });
  }

  try {
    const db = await openDb();
    const target = await db.get('SELECT id FROM users WHERE id = ?', [targetId]);
    if (!target) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const passwordHash = await bcrypt.hash(password, 12);
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, targetId]);

    await logAdminAction(db, req, {
      targetUserId: targetId,
      action: 'user_password_reset',
    });

    return res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error restableciendo contraseña:', error);
    return res.status(500).json({ error: 'No se pudo restablecer la contraseña.' });
  }
};

export const getAdminActivity = async (req, res) => {
  const requestedLimit = Number(req.query.limit || 20);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 100)
    : 20;

  try {
    const db = await openDb();
    const activity = await db.all(
      `SELECT
        logs.id, logs.action, logs.details, logs.ip_address, logs.created_at,
        actor.username AS actor_username, actor.full_name AS actor_name,
        target.username AS target_username, target.full_name AS target_name
       FROM admin_audit_logs logs
       LEFT JOIN users actor ON actor.id = logs.actor_user_id
       LEFT JOIN users target ON target.id = logs.target_user_id
       ORDER BY logs.created_at DESC, logs.id DESC
       LIMIT ?`,
      [limit]
    );

    return res.json(activity);
  } catch (error) {
    console.error('Error consultando auditoría administrativa:', error);
    return res.status(500).json({ error: 'No se pudo cargar la actividad administrativa.' });
  }
};
