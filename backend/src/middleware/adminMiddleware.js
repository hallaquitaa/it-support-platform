import { openDb } from '../config/database.js';

/**
 * Requires an authenticated account that is currently active and currently
 * assigned the admin role in SQLite. This prevents stale JWT claims from
 * retaining administrator access after a role change or deactivation.
 */
export const adminMiddleware = async (req, res, next) => {
  try {
    const db = await openDb();
    const user = await db.get(
      'SELECT id, role, is_active FROM users WHERE id = ?',
      [req.user?.id]
    );

    if (!user || Number(user.is_active) !== 1) {
      return res.status(401).json({ error: 'La cuenta no está activa.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Se requiere el rol de administrador.' });
    }

    req.currentUser = { id: Number(user.id), role: user.role };
    return next();
  } catch (error) {
    console.error('Error comprobando permisos administrativos:', error);
    return res.status(500).json({ error: 'No se pudieron validar los permisos.' });
  }
};
