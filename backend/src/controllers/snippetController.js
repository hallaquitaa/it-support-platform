import { openDb } from '../config/database.js';

export const getSnippets = async (req, res) => {
  try {
    const db = await openDb();
    res.json(await db.all(`
      SELECT s.*, c.name AS category_name
      FROM snippets s LEFT JOIN categories c ON c.id = s.category_id
      ORDER BY s.created_at DESC, s.id DESC
    `));
  } catch {
    res.status(500).json({ error: 'No se pudieron cargar los snippets' });
  }
};

export const getSnippetCategories = async (req, res) => {
  try {
    const db = await openDb();
    res.json(await db.all("SELECT id, name FROM categories WHERE type = 'snippet' ORDER BY name"));
  } catch {
    res.status(500).json({ error: 'No se pudieron cargar las categorías' });
  }
};

export const createSnippet = async (req, res) => {
  try {
    const { title, content, language = 'text', category_id = null } = req.body;
    if (!title?.trim() || !content?.trim()) return res.status(400).json({ error: 'Título y contenido son obligatorios' });
    const db = await openDb();
    if (category_id && !(await db.get("SELECT id FROM categories WHERE id = ? AND type = 'snippet'", [category_id]))) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }
    const result = await db.run(
      'INSERT INTO snippets (title, content, language, category_id, created_by) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), content, language, category_id || null, req.user?.id || req.user?.userId || null]
    );
    res.status(201).json(await db.get(`
      SELECT s.*, c.name AS category_name FROM snippets s
      LEFT JOIN categories c ON c.id = s.category_id WHERE s.id = ?
    `, [result.lastID]));
  } catch {
    res.status(500).json({ error: 'No se pudo guardar el snippet' });
  }
};

export const updateSnippet = async (req, res) => {
  try {
    const { title, content, language = 'text', category_id = null } = req.body;
    if (!title?.trim() || !content?.trim()) return res.status(400).json({ error: 'Título y contenido son obligatorios' });
    const db = await openDb();
    if (!(await db.get('SELECT id FROM snippets WHERE id = ?', [req.params.id]))) return res.status(404).json({ error: 'Snippet no encontrado' });
    if (category_id && !(await db.get("SELECT id FROM categories WHERE id = ? AND type = 'snippet'", [category_id]))) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }
    await db.run('UPDATE snippets SET title = ?, content = ?, language = ?, category_id = ? WHERE id = ?',
      [title.trim(), content, language, category_id || null, req.params.id]);
    res.json(await db.get(`
      SELECT s.*, c.name AS category_name FROM snippets s
      LEFT JOIN categories c ON c.id = s.category_id WHERE s.id = ?
    `, [req.params.id]));
  } catch {
    res.status(500).json({ error: 'No se pudo actualizar el snippet' });
  }
};

export const deleteSnippet = async (req, res) => {
  try {
    const db = await openDb();
    const result = await db.run('DELETE FROM snippets WHERE id = ?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ error: 'Snippet no encontrado' });
    res.json({ message: 'Snippet eliminado' });
  } catch {
    res.status(500).json({ error: 'No se pudo eliminar el snippet' });
  }
};
