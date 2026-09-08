import { VaultCredential } from '../models/VaultCredential.js';
import { openDb } from '../config/database.js';

export const getCredentials = async (req, res) => {
  try {
    const credentials = await VaultCredential.getAll(req.query);
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCredentialById = async (req, res) => {
  try {
    const credential = await VaultCredential.getById(req.params.id);
    if (!credential) return res.status(404).json({ error: 'Credencial no encontrada' });
    res.json(credential);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCredential = async (req, res) => {
  const { masterPassword, ...data } = req.body;
  
  if (!masterPassword) {
    return res.status(400).json({ error: 'Se requiere Master Password para cifrar' });
  }
  
  try {
    const credential = await VaultCredential.create({ ...data, created_by: req.user.id }, masterPassword);
    res.status(201).json(credential);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const revealCredential = async (req, res) => {
  const { masterPassword } = req.body;
  const { id } = req.params;
  
  if (!masterPassword) {
    return res.status(400).json({ error: 'Se requiere Master Password' });
  }
  
  try {
    const revealed = await VaultCredential.revealPassword(id, masterPassword);
    res.json(revealed);
  } catch (error) {
    if (error.message.includes('bad decrypt') || error.message.includes('EVP_DecryptFinal_ex')) {
      res.status(401).json({ error: 'Master Password incorrecto' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const updateCredential = async (req, res) => {
  const { masterPassword, ...data } = req.body;
  
  if (!masterPassword) {
    return res.status(400).json({ error: 'Se requiere Master Password' });
  }
  
  try {
    const credential = await VaultCredential.update(req.params.id, data, masterPassword);
    res.json(credential);
  } catch (error) {
    if (error.message === 'Master Password incorrecta') {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const deleteCredential = async (req, res) => {
  try {
    await VaultCredential.delete(req.params.id);
    res.json({ message: 'Credencial eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVaultStats = async (req, res) => {
  try {
    const stats = await VaultCredential.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const db = await openDb();
    const { id } = req.params;
    const userId = req.user.id;
    
    const existing = await db.get(
      'SELECT id FROM vault_favorites WHERE credential_id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (existing) {
      await db.run(
        'DELETE FROM vault_favorites WHERE credential_id = ? AND user_id = ?',
        [id, userId]
      );
      res.json({ favorited: false });
    } else {
      await db.run(
        'INSERT INTO vault_favorites (credential_id, user_id) VALUES (?, ?)',
        [id, userId]
      );
      res.json({ favorited: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const db = await openDb();
    const favorites = await db.all(`
      SELECT v.id, v.service_name, v.username, v.url, v.category, v.status, v.last_updated
      FROM vault_credentials v
      INNER JOIN vault_favorites f ON v.id = f.credential_id
      WHERE f.user_id = ?
    `, [req.user.id]);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMostUsed = async (req, res) => {
  try {
    console.log('getMostUsed llamado');
    console.log('Usuario ID:', req.user.id);
    
    const db = await openDb();
    console.log('Base de datos conectada');
    
    const mostUsed = await db.all(`
      SELECT id, service_name, username, category
      FROM vault_credentials
      ORDER BY id DESC
      LIMIT 5
    `);
    
    console.log('Resultado:', mostUsed);
    res.json(mostUsed);
  } catch (error) {
    console.error('Error en getMostUsed:', error);
    res.status(500).json({ error: error.message });
  }
};

export const incrementUsage = async (req, res) => {
  try {
    const db = await openDb();
    await db.run(
      'UPDATE vault_credentials SET usage_count = COALESCE(usage_count, 0) + 1 WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========== NUEVA FUNCIÓN PARA EXPORTACIÓN MÚLTIPLE SEGURA ==========

export const revealMultiple = async (req, res) => {
  const { ids, masterPassword } = req.body;
  
  if (!masterPassword) {
    return res.status(400).json({ error: 'Se requiere Master Password' });
  }
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de IDs' });
  }
  
  try {
    const results = [];
    
    for (const id of ids) {
      try {
        const revealed = await VaultCredential.revealPassword(id, masterPassword);
        results.push(revealed);
      } catch (err) {
        console.error(`Error descifrando credencial ${id}:`, err);
        results.push({ id, error: 'Error al descifrar', service_name: 'Error' });
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error en revealMultiple:', error);
    res.status(500).json({ error: error.message });
  }
};