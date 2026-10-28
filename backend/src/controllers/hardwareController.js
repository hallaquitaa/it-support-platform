import { Hardware } from '../models/Hardware.js';
import { openDb } from '../config/database.js';

export const getHardware = async (req, res) => {
  try {
    const hardware = await Hardware.getAll(req.query);
    res.json(hardware);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHardwareById = async (req, res) => {
  try {
    const item = await Hardware.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipo no encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createHardware = async (req, res) => {
  try {
    const item = await Hardware.create(req.body);
    const db = await openDb();
    await db.run('INSERT INTO hardware_asset_events (hardware_id, event_type, title, description, performed_by) VALUES (?, ?, ?, ?, ?)', [item.id, 'created', 'Equipo registrado', item.brand_model || item.type, req.user?.id || req.user?.userId || null]);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateHardware = async (req, res) => {
  try {
    const item = await Hardware.update(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: 'Equipo no encontrado' });
    const db = await openDb();
    await db.run('INSERT INTO hardware_asset_events (hardware_id, event_type, title, description, performed_by) VALUES (?, ?, ?, ?, ?)', [item.id, 'updated', 'Ficha del equipo actualizada', 'Se modificaron los datos generales o las especificaciones técnicas.', req.user?.id || req.user?.userId || null]);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteHardware = async (req, res) => {
  try {
    await Hardware.delete(req.params.id);
    res.json({ message: 'Equipo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHardwareStats = async (req, res) => {
  try {
    const stats = await Hardware.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHardwareTypes = async (req, res) => {
  try {
    const types = await Hardware.getTypes();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};