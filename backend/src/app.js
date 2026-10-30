import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import hardwareRoutes from './routes/hardwareRoutes.js';
import vaultRoutes from './routes/vaultRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import remoteAccessRoutes from './routes/remoteAccessRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import snippetRoutes from './routes/snippetRoutes.js';
import hardwareAssetRoutes from './routes/hardwareAssetRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initRemoteAccessSchema } from './config/remoteAccessSchema.js';
import { initAdminSchema } from './config/adminSchema.js';
import { initHardwareAssetSchema } from './config/hardwareAssetSchema.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost',
  credentials: true
}));
app.use(express.json());

// Inicializar base de datos
await initDb();
await initHardwareAssetSchema();
await initAdminSchema();
await initRemoteAccessSchema();

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/hardware', hardwareRoutes);
app.use('/api/hardware-assets', hardwareAssetRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/remote-access', remoteAccessRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/snippets', snippetRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});