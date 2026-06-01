import React, { useEffect, useState } from 'react';
import { getTickets, createTicket, updateTicket, deleteTicket, resolverTicket, addNota } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ESTADOS    = ['abierto', 'en_progreso', 'resuelto', 'cerrado'];
const PRIORIDADES= ['baja', 'media', 'alta', 'critica'];
const EMPTY = { titulo: '', descripcion: '', prioridad: 'media', categoria: 'general', equipoId: '', asignadoA: '' };

export default function Tickets() {
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [nota, setNota]         = useState('');
  const [filtro, setFiltro]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const { usuario }             = useAuth();

  const load = () => getTickets().then(r => setTickets(r.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNuevo  = () => { setForm(EMPTY); setModal('nuevo'); setMsg(''); };
  const openDetalle = (t) => { setSelected(t); setNota(''); setModal('detalle'); setMsg(''); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTicket({ ...form, reportadoPor: usuario?.nombre });
      setMsg('Ticket creado');
      await load();
      setTimeout(closeModal, 800);
    } catch { setMsg('Error al crear ticket'); }
    finally { setSaving(false); }
  };

  const handleEstado = async (id, estado) => {
    await updateTicket(id, { estado });
    await load();
    if (selected?._id === id) setSelected(t => ({ ...t, estado }));
  };

  const handleResolver = async (id) => {
    await resolverTicket(id);
    await load();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este ticket?')) return;
    await deleteTicket(id);
    setTickets(tks => tks.filter(t => t._id !== id));
    if (modal === 'detalle') closeModal();
  };

  const handleNota = async () => {
    if (!nota.trim()) return;
    setSaving(true);
    try {
      const updated = await addNota(selected._id, { texto: nota, autor: usuario?.nombre });
      setSelected(updated.data);
      setNota('');
    } catch { setMsg('Error al agregar nota'); }
    finally { setSaving(false); }
  };

  const filtrados = filtro ? tickets.filter(t => t.estado === filtro) : tickets;

  if (loading) return <div className="loading">Cargando tickets...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h2>Gestión de Tickets</h2><p>Soporte técnico y seguimiento de incidencias</p></div>
        <button className="btn btn-primary" onClick={openNuevo}>+ Nuevo Ticket</button>
      </div>

      <div className="actions-row" style={{ marginBottom: 16 }}>
        <button className={`btn btn-sm ${filtro === '' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFiltro('')}>Todos ({tickets.length})</button>
        {ESTADOS.map(s => (
          <button key={s} className={`btn btn-sm ${filtro === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFiltro(s)}>
            {s} ({tickets.filter(t => t.estado === s).length})
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Título</th><th>Categoría</th><th>Prioridad</th><th>Estado</th><th>Reportado por</th><th>Fecha</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtrados.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: '30px' }}>Sin tickets</td></tr>
                : filtrados.map(t => (
                    <tr key={t._id}>
                      <td style={{ maxWidth: 200 }}><strong>{t.titulo}</strong></td>
                      <td>{t.categoria}</td>
                      <td><span className={`badge badge-${t.prioridad}`}>{t.prioridad}</span></td>
                      <td><span className={`badge badge-${t.estado}`}>{t.estado}</span></td>
                      <td>{t.reportadoPor}</td>
                      <td>{new Date(t.fecha).toLocaleDateString('es-ES')}</td>
                      <td>
                        <div className="actions-row">
                          <button className="btn btn-outline btn-sm" onClick={() => openDetalle(t)}>Ver</button>
                          {t.estado !== 'resuelto' && t.estado !== 'cerrado' &&
                            <button className="btn btn-success btn-sm" onClick={() => handleResolver(t._id)}>✓</button>}
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>×</button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo */}
      {modal === 'nuevo' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Nuevo Ticket de Soporte</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            {msg && <div className={`alert ${msg.includes('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group"><label className="form-label">Título</label>
                <input className="form-input" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Descripción</label>
                <textarea className="form-textarea" rows={3} value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} required /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Prioridad</label>
                  <select className="form-select" value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}>
                    {PRIORIDADES.map(p => <option key={p}>{p}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Categoría</label>
                  <input className="form-input" value={form.categoria}
                    onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Equipo ID (opcional)</label>
                  <input className="form-input" type="number" value={form.equipoId}
                    onChange={e => setForm(f => ({ ...f, equipoId: e.target.value ? Number(e.target.value) : null }))} /></div>
                <div className="form-group"><label className="form-label">Asignar a</label>
                  <input className="form-input" value={form.asignadoA}
                    onChange={e => setForm(f => ({ ...f, asignadoA: e.target.value }))} /></div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear Ticket'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {modal === 'detalle' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{selected.titulo}</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <span className={`badge badge-${selected.prioridad}`}>Prioridad: {selected.prioridad}</span>
              <span className={`badge badge-${selected.estado}`}>Estado: {selected.estado}</span>
              {selected.asignadoA && <span className="badge badge-abierto">Asignado: {selected.asignadoA}</span>}
            </div>
            <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.6 }}>{selected.descripcion}</p>

            <div style={{ marginBottom: 12 }}>
              <div className="section-title">Cambiar Estado</div>
              <div className="actions-row">
                {ESTADOS.map(s => (
                  <button key={s} className={`btn btn-sm ${selected.estado === s ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => handleEstado(selected._id, s)}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div className="section-title">Notas ({selected.notas?.length || 0})</div>
              {(selected.notas || []).map((n, i) => (
                <div key={i} style={{ background: '#f5f7ff', borderRadius: 8, padding: '8px 12px', marginBottom: 6, fontSize: '0.85rem' }}>
                  <strong>{n.autor}</strong> — {new Date(n.fecha).toLocaleDateString('es-ES')}<br />
                  <span style={{ color: '#444' }}>{n.texto}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input className="form-input" placeholder="Agregar nota..." value={nota} onChange={e => setNota(e.target.value)} />
                <button className="btn btn-outline btn-sm" onClick={handleNota} disabled={saving}>+</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
