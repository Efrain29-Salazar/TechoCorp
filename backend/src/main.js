const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const { connectMongoDB } = require('./infrastructure/database/mongodb/connection');

const authRoutes     = require('./infrastructure/routes/authRoutes');
const equipoRoutes   = require('./infrastructure/routes/equipoRoutes');
const ticketRoutes   = require('./infrastructure/routes/ticketRoutes');
const reporteRoutes  = require('./infrastructure/routes/reporteRoutes');
const dashboardRoutes= require('./infrastructure/routes/dashboardRoutes');
const asistenteRoutes= require('./infrastructure/routes/asistenteRoutes');
const clienteRoutes  = require('./infrastructure/routes/clienteRoutes');
const stockRoutes    = require('./infrastructure/routes/stockRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos de uploads (PDFs)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

connectMongoDB();

app.use('/api/auth',      authRoutes);
app.use('/api/equipos',   equipoRoutes);
app.use('/api/tickets',   ticketRoutes);
app.use('/api/reportes',  reporteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/asistente', asistenteRoutes);
app.use('/api/clientes',  clienteRoutes);
app.use('/api/stock',     stockRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'TechCorp PRO funcionando correctamente', version: '1.1.0' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor', detail: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TechCorp PRO API corriendo en http://localhost:${PORT}`);
});
