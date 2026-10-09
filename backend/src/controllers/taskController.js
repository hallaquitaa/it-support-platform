import { Task } from '../models/Task.js';

export const getTasks = async (req, res) => {
  try {
    const filters = {
      ...req.query,
      user_id: req.user.id,
    };

    const tasks = await Task.getAll(filters);

    res.json(tasks);
  } catch (error) {
    console.error('Error obteniendo tareas:', error);

    res.status(500).json({
      error: error.message,
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.getById(
      req.params.id,
      req.user.id
    );

    if (!task) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Error obteniendo tarea:', error);

    res.status(500).json({
      error: error.message,
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      created_by: req.user.id,
    };

    const task = await Task.create(taskData);

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creando tarea:', error);

    res.status(500).json({
      error: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.update(
      req.params.id,
      req.body,
      req.user.id
    );

    if (!task) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Error actualizando tarea:', error);

    res.status(500).json({
      error: error.message,
    });
  }
};

export const completeTask = async (req, res) => {
  try {
    const task = await Task.update(
      req.params.id,
      {
        status: 'resolved',
      },
      req.user.id
    );

    if (!task) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Error completando tarea:', error);

    res.status(500).json({
      error: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.delete(
      req.params.id,
      req.user.id
    );

    if (!deleted) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
      });
    }

    res.json({
      message: 'Tarea movida a la papelera',
      id: req.params.id,
    });
  } catch (error) {
    console.error('Error eliminando tarea:', error);

    res.status(500).json({
      error: error.message,
    });
  }
};

export const restoreTask = async (req, res) => {
  try {
    const task = await Task.restore(
      req.params.id,
      req.user.id
    );

    if (!task) {
      return res.status(404).json({
        error: 'Tarea no encontrada en la papelera',
      });
    }

    res.json(task);
  } catch (error) {
    console.error('Error restaurando tarea:', error);

    res.status(500).json({
      error: error.message,
    });
  }
};

export const getTaskTrash = async (req, res) => {
  try {
    const tasks = await Task.getTrash(
      req.user.id
    );

    res.json(tasks);
  } catch (error) {
    console.error('Error obteniendo papelera:', error);

    res.status(500).json({
      error: error.message,
    });
  }
};

export const permanentlyDeleteTask = async (req, res) => {
  try {
    const deleted = await Task.permanentDelete(
      req.params.id,
      req.user.id
    );

    if (!deleted) {
      return res.status(404).json({
        error: 'Tarea no encontrada',
      });
    }

    res.json({
      message: 'Tarea eliminada permanentemente',
      id: req.params.id,
    });
  } catch (error) {
    console.error(
      'Error eliminando tarea permanentemente:',
      error
    );

    res.status(500).json({
      error: error.message,
    });
  }
};

export const getTaskHistory = async (req, res) => {
  try {
    const history = await Task.getHistory(
      req.user.id
    );

    res.json(history);
  } catch (error) {
    console.error(
      'Error obteniendo historial de tareas:',
      error
    );

    res.status(500).json({
      error: error.message,
    });
  }
};

export const getTaskStats = async (req, res) => {
  try {
    const stats = await Task.getStats(
      req.user.id
    );

    res.json(stats);
  } catch (error) {
    console.error(
      'Error obteniendo estadísticas:',
      error
    );

    res.status(500).json({
      error: error.message,
    });
  }
};