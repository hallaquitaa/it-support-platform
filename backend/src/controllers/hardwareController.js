import { Hardware } from '../models/Hardware.js';

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
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateHardware = async (req, res) => {
  try {
    const item = await Hardware.update(req.params.id, req.body);
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