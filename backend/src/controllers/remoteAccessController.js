import { RemoteAccess } from '../models/RemoteAccess.js';

const isValidationError = (message) =>
  /obligatorio|no debe superar|no puede superar|no es válida|no es válido|no válida|no válido/i.test(String(message || ''));

export const getRemoteAccess = async (req, res) => {
  try {
    const connections = await RemoteAccess.getAll(req.query, req.user.id);
    res.json(connections);
  } catch (error) {
    console.error('Error al consultar Remote Access:', error);
    res.status(500).json({ error: 'Error al consultar las conexiones remotas' });
  }
};

export const getRemoteAccessById = async (req, res) => {
  try {
    const connection = await RemoteAccess.getById(req.params.id, req.user.id);
    if (!connection) {
      return res.status(404).json({ error: 'Conexión remota no encontrada' });
    }
    res.json(connection);
  } catch (error) {
    console.error('Error al consultar conexión:', error);
    res.status(500).json({ error: 'Error al consultar la conexión remota' });
  }
};

export const createRemoteAccess = async (req, res) => {
  try {
    const connection = await RemoteAccess.create(req.body);
    await RemoteAccess.logEvent(connection.id, req.user.id, 'record_created', {
      computer_name: connection.computer_name,
      branch_id: connection.branch_id,
    });
    res.status(201).json(connection);
  } catch (error) {
    console.error('Error al crear conexión:', error);
    const status = isValidationError(error.message) ? 400 : 500;
    res.status(status).json({
      error: status === 400 ? error.message : 'Error al crear la conexión remota',
    });
  }
};

export const updateRemoteAccess = async (req, res) => {
  try {
    const connection = await RemoteAccess.update(req.params.id, req.body, req.user.id);
    if (!connection) {
      return res.status(404).json({ error: 'Conexión remota no encontrada' });
    }
    res.json(connection);
  } catch (error) {
    console.error('Error al actualizar conexión:', error);
    const status = isValidationError(error.message) ? 400 : 500;
    res.status(status).json({
      error: status === 400 ? error.message : 'Error al actualizar la conexión remota',
    });
  }
};

export const deleteRemoteAccess = async (req, res) => {
  try {
    const result = await RemoteAccess.delete(req.params.id, req.user.id);
    if (!result) {
      return res.status(404).json({ error: 'Conexión remota no encontrada' });
    }
    res.json({
      message: 'Conexión remota eliminada correctamente',
      id: result.id,
    });
  } catch (error) {
    console.error('Error al eliminar conexión:', error);
    res.status(500).json({ error: 'Error al eliminar la conexión remota' });
  }
};

export const toggleRemoteFavorite = async (req, res) => {
  try {
    const result = await RemoteAccess.toggleFavorite(req.params.id, req.user.id);
    if (!result) return res.status(404).json({ error: 'Conexión remota no encontrada' });
    res.json(result);
  } catch (error) {
    console.error('Error actualizando favoritos Remote Access:', error);
    res.status(500).json({ error: 'No se pudo actualizar el favorito.' });
  }
};

export const getRemoteAccessHistory = async (req, res) => {
  try {
    const connection = await RemoteAccess.getById(req.params.id, req.user.id);
    if (!connection) return res.status(404).json({ error: 'Conexión remota no encontrada' });
    const history = await RemoteAccess.getHistory(req.params.id);
    res.json(history);
  } catch (error) {
    console.error('Error consultando historial Remote Access:', error);
    res.status(500).json({ error: 'No se pudo consultar el historial.' });
  }
};

export const registerRemoteLaunchRequest = async (req, res) => {
  try {
    const connection = await RemoteAccess.getById(req.params.id, req.user.id);
    if (!connection) return res.status(404).json({ error: 'Conexión remota no encontrada' });

    await RemoteAccess.logEvent(req.params.id, req.user.id, 'client_launch_requested', {
      client: 'AnyDesk',
    });

    // This records only a local client launch request, not a confirmed remote session.
    res.json({
      logged: true,
      event: 'client_launch_requested',
      message: 'Se registró la solicitud de apertura del cliente AnyDesk.',
    });
  } catch (error) {
    console.error('Error registrando solicitud AnyDesk:', error);
    res.status(500).json({ error: 'No se pudo registrar la solicitud de apertura.' });
  }
};
