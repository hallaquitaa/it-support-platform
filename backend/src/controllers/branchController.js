import { Branch } from '../models/Branch.js';

export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.getAll(req.query);
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.getById(req.params.id);
    if (!branch) return res.status(404).json({ error: 'Sucursal no encontrada' });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createBranch = async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json(branch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.update(req.params.id, req.body);
    if (!branch) return res.status(404).json({ error: 'Sucursal no encontrada' });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    await Branch.delete(req.params.id);
    res.json({ message: 'Sucursal eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBranchStats = async (req, res) => {
  try {
    const stats = await Branch.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};