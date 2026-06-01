import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token') || localStorage.getItem('clienteToken');
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
  return cfg;
});

// ── Auth Admin ────────────────────────────────────────────────────
export const login    = (data) => api.post('/auth/login', data).then(r => r.data);
export const register = (data) => api.post('/auth/register', data).then(r => r.data);
export const getUsuarios    = () => api.get('/auth/usuarios').then(r => r.data);
export const deleteUsuario  = (id) => api.delete(`/auth/usuarios/${id}`);

// ── Auth Cliente ──────────────────────────────────────────────────
export const clienteRegister = (data) => api.post('/clientes/register', data).then(r => r.data);
export const clienteLogin    = (data) => api.post('/clientes/login', data).then(r => r.data);
export const clientePerfil   = () => {
  const token = localStorage.getItem('clienteToken');
  return api.get('/clientes/perfil', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);
};
export const getStockPublico     = () => {
  const token = localStorage.getItem('clienteToken');
  return api.get('/clientes/stock', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);
};
export const getCatalogosPublicos = () => {
  const token = localStorage.getItem('clienteToken');
  return api.get('/clientes/catalogos', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data);
};

// ── Admin: Clientes ───────────────────────────────────────────────
export const getClientes   = () => api.get('/clientes/admin/lista').then(r => r.data);
export const deleteCliente = (id) => api.delete(`/clientes/admin/${id}`);

// ── Equipos ───────────────────────────────────────────────────────
export const getEquipos   = (estado) => api.get('/equipos', { params: estado ? { estado } : {} }).then(r => r.data);
export const getEquipo    = (id) => api.get(`/equipos/${id}`).then(r => r.data);
export const createEquipo = (data) => api.post('/equipos', data).then(r => r.data);
export const updateEquipo = (id, data) => api.put(`/equipos/${id}`, data).then(r => r.data);
export const deleteEquipo = (id) => api.delete(`/equipos/${id}`);
export const addMantenimiento  = (id, data) => api.post(`/equipos/${id}/mantenimientos`, data).then(r => r.data);
export const getMantenimientos = (id) => api.get(`/equipos/${id}/mantenimientos`).then(r => r.data);

// ── Tickets ───────────────────────────────────────────────────────
export const getTickets     = (params) => api.get('/tickets', { params }).then(r => r.data);
export const getTicket      = (id) => api.get(`/tickets/${id}`).then(r => r.data);
export const createTicket   = (data) => api.post('/tickets', data).then(r => r.data);
export const updateTicket   = (id, data) => api.put(`/tickets/${id}`, data).then(r => r.data);
export const deleteTicket   = (id) => api.delete(`/tickets/${id}`);
export const addNota        = (id, data) => api.post(`/tickets/${id}/notas`, data).then(r => r.data);
export const resolverTicket = (id) => api.patch(`/tickets/${id}/resolver`).then(r => r.data);

// ── Dashboard ─────────────────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard/resumen').then(r => r.data);

// ── Asistente ─────────────────────────────────────────────────────
export const enviarMensaje = (data) => api.post('/asistente/mensaje', data).then(r => r.data);

// ── Stock / Catálogos PDF (Admin) ─────────────────────────────────
export const getStockAdmin    = () => api.get('/stock/equipos').then(r => r.data);
export const toggleStockEquipo = (id, data) => api.patch(`/stock/equipos/${id}`, data).then(r => r.data);
export const getCatalogosAdmin = () => api.get('/stock/catalogos').then(r => r.data);
export const deleteCatalogo    = (id) => api.delete(`/stock/catalogos/${id}`);
export const uploadCatalogo    = (formData) =>
  api.post('/stock/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const downloadCatalogo  = (id, nombre) =>
  api.get(`/stock/catalogos/${id}/download`, { responseType: 'blob' }).then(r => {
    const url  = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${nombre}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  });

// ── Reporte PDF (Admin) ───────────────────────────────────────────
export const downloadReportePDF = () =>
  api.get('/reportes/pdf', { responseType: 'blob' }).then(r => {
    const url  = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte-techcorp.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  });
