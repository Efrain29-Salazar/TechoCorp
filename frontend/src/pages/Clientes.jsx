import React, { useEffect, useState } from 'react';
import { getClientes, deleteCliente } from '../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { getClientes().then(r => setClientes(r.data || [])).finally(() => setLoading(false)); }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cliente? Se eliminarán también sus datos.')) return;
    try {
      await deleteCliente(id);
      setClientes(c => c.filter(x => x.id !== id));
    } catch { alert('Error al eliminar'); }
  };

  if (loading) return <div className="loading">Cargando clientes...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Clientes Registrados</h2>
          <p>Usuarios del portal de clientes</p>
        </div>
        <div style={{ background: '#e8eaf6', color: '#1a237e', padding: '8px 18px', borderRadius: 20, fontWeight: 700, fontSize: '0.9rem' }}>
          {clientes.length} clientes
        </div>
      </div>

      {clientes.length === 0
        ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>No hay clientes registrados aún</p>
              <p>Los clientes se registran desde el Portal de Clientes en <strong>/portal</strong></p>
            </div>
          </div>
        )
        : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Empresa</th><th>Estado</th><th>Registro</th><th>Acción</th></tr>
                </thead>
                <tbody>
                  {clientes.map(c => (
                    <tr key={c.id}>
                      <td style={{ color: '#aaa', fontSize: '0.82rem' }}>{c.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e8eaf6', color: '#1a237e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                            {c.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <strong>{c.nombre}</strong>
                        </div>
                      </td>
                      <td>{c.correo}</td>
                      <td>{c.telefono || <span style={{ color: '#ccc' }}>—</span>}</td>
                      <td>{c.empresa || <span style={{ color: '#ccc' }}>—</span>}</td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.74rem', fontWeight: 700,
                          background: c.activo ? '#e8f5e9' : '#f5f5f5',
                          color: c.activo ? '#1b5e20' : '#888',
                        }}>
                          {c.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>{new Date(c.creadoEn).toLocaleDateString('es-ES')}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Eliminar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div>
  );
}
