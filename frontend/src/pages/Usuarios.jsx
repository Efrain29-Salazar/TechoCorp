import React, { useEffect, useState } from 'react';
import { getUsuarios, deleteUsuario, register } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ nombre: '', correo: '', password: '', rol: 'tecnico' });
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const { isAdmin }             = useAuth();

  const load = () => getUsuarios().then(r => setUsuarios(r.data || [])).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await register(form);
      setMsg('Usuario creado correctamente');
      await load();
      setTimeout(() => setModal(false), 800);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error al crear usuario');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await deleteUsuario(id);
      setUsuarios(u => u.filter(x => x.id !== id));
    } catch { alert('Error al eliminar'); }
  };

  if (!isAdmin) return <div className="page"><div className="empty-state"><div className="empty-icon">🔒</div><p>Acceso restringido a administradores</p></div></div>;
  if (loading) return <div className="loading">Cargando usuarios...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h2>Gestión de Usuarios</h2><p>Administración de cuentas y roles</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ nombre: '', correo: '', password: '', rol: 'tecnico' }); setMsg(''); setModal(true); }}>
          + Nuevo Usuario
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Registro</th><th>Acciones</th></tr></thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.nombre}</strong></td>
                  <td>{u.correo}</td>
                  <td><span className={`badge badge-${u.rol}`}>{u.rol}</span></td>
                  <td><span className={`badge ${u.activo ? 'badge-operativo' : 'badge-inactivo'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td>{new Date(u.creadoEn).toLocaleDateString('es-ES')}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Nuevo Usuario</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            {msg && <div className={`alert ${msg.includes('Error') || msg.includes('error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group"><label className="form-label">Nombre completo</label>
                <input className="form-input" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Correo electrónico</label>
                <input className="form-input" type="email" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Contraseña</label>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} /></div>
              <div className="form-group"><label className="form-label">Rol</label>
                <select className="form-select" value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                  <option value="tecnico">Técnico</option>
                  <option value="admin">Administrador</option>
                </select></div>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear Usuario'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
