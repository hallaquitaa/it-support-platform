import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import hardwareRoutes from './routes/hardwareRoutes.js';
import vaultRoutes from './routes/vaultRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost',
  credentials: true
}));
app.use(express.json());

// Inicializar base de datos
await initDb();

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/hardware', hardwareRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/export', exportRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});