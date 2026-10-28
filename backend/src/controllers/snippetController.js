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
    res.json(await db.all(`
      SELECT c.id, c.name, COUNT(s.id) AS snippets_count
      FROM categories c LEFT JOIN snippets s ON s.category_id = c.id
      WHERE c.type = 'snippet'
      GROUP BY c.id
      ORDER BY c.name
    `));
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


// Categorías para la biblioteca de snippets. El borrado desasocia los
// fragmentos existentes, pero nunca elimina su contenido.
export const createSnippetCategory = async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    const db = await openDb();
    const duplicate = await db.get('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)', [name]);
    if (duplicate) return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });

    const result = await db.run("INSERT INTO categories (name, type) VALUES (?, 'snippet')", [name]);
    res.status(201).json({ id: result.lastID, name, type: 'snippet', snippets_count: 0 });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear la categoría' });
  }
};

export const updateSnippetCategory = async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    const db = await openDb();
    const existing = await db.get("SELECT id FROM categories WHERE id = ? AND type = 'snippet'", [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Categoría no encontrada' });

    const duplicate = await db.get('SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id <> ?', [name, req.params.id]);
    if (duplicate) return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });

    await db.run("UPDATE categories SET name = ? WHERE id = ? AND type = 'snippet'", [name, req.params.id]);
    const category = await db.get(`
      SELECT c.id, c.name, c.type, COUNT(s.id) AS snippets_count
      FROM categories c LEFT JOIN snippets s ON s.category_id = c.id
      WHERE c.id = ? GROUP BY c.id
    `, [req.params.id]);
    res.json(category);
  } catch {
    res.status(500).json({ error: 'No se pudo actualizar la categoría' });
  }
};

export const deleteSnippetCategory = async (req, res) => {
  try {
    const db = await openDb();
    const category = await db.get("SELECT id FROM categories WHERE id = ? AND type = 'snippet'", [req.params.id]);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });

    await db.run('UPDATE snippets SET category_id = NULL WHERE category_id = ?', [req.params.id]);
    await db.run("DELETE FROM categories WHERE id = ? AND type = 'snippet'", [req.params.id]);
    res.json({ message: 'Categoría eliminada; los snippets se conservaron sin categoría' });
  } catch {
    res.status(500).json({ error: 'No se pudo eliminar la categoría' });
  }
};
