
import { RemoteAccess } from '../models/RemoteAccess.js';

export const getRemoteAccess = async (req, res) => {
  try {
    const connections = await RemoteAccess.getAll(req.query);
    res.json(connections);
  } catch (error) {
    console.error('Error al consultar Remote Access:', error);
    res.status(500).json({
      error: 'Error al consultar las conexiones remotas'
    });
  }
};

export const getRemoteAccessById = async (req, res) => {
  try {
    const connection = await RemoteAccess.getById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        error: 'Conexión remota no encontrada'
      });
    }

    res.json(connection);
  } catch (error) {
    console.error('Error al consultar conexión:', error);
    res.status(500).json({
      error: 'Error al consultar la conexión remota'
    });
  }
};

export const createRemoteAccess = async (req, res) => {
  try {
    const connection = await RemoteAccess.create(req.body);

    res.status(201).json(connection);
  } catch (error) {
    console.error('Error al crear conexión:', error);

    const status = [
      'El nombre del equipo es obligatorio',
      'El ID de AnyDesk es obligatorio',
      'La sucursal seleccionada no es válida'
    ].includes(error.message) ? 400 : 500;

    res.status(status).json({
      error: status === 400
        ? error.message
        : 'Error al crear la conexión remota'
    });
  }
};

export const updateRemoteAccess = async (req, res) => {
  try {
    const connection = await RemoteAccess.update(
      req.params.id,
      req.body
    );

    if (!connection) {
      return res.status(404).json({
        error: 'Conexión remota no encontrada'
      });
    }

    res.json(connection);
  } catch (error) {
    console.error('Error al actualizar conexión:', error);

    const status = [
      'El nombre del equipo es obligatorio',
      'El ID de AnyDesk es obligatorio',
      'La sucursal seleccionada no es válida'
    ].includes(error.message) ? 400 : 500;

    res.status(status).json({
      error: status === 400
        ? error.message
        : 'Error al actualizar la conexión remota'
    });
  }
};

export const deleteRemoteAccess = async (req, res) => {
  try {
    const result = await RemoteAccess.delete(req.params.id);

    if (!result) {
      return res.status(404).json({
        error: 'Conexión remota no encontrada'
      });
    }

    res.json({
      message: 'Conexión remota eliminada correctamente',
      id: result.id
    });
  } catch (error) {
    console.error('Error al eliminar conexión:', error);
    res.status(500).json({
      error: 'Error al eliminar la conexión remota'
    });
  }
};