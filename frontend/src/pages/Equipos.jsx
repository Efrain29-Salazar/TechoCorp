import React, { useEffect, useState } from 'react';
import { getEquipos, createEquipo, updateEquipo, deleteEquipo, addMantenimiento } from '../services/api';

const ESTADOS = ['operativo', 'revision', 'inactivo', 'dano'];
const TIPOS   = ['Laptop', 'Desktop', 'Servidor', 'Impresora', 'Monitor', 'Red', 'Otro'];
const EMPTY   = { nombre: '', tipo: 'Laptop', marca: '', modelo: '', serial: '', estado: 'operativo', ubicacion: '' };

export default function Equipos() {
  const [equipos, setEquipos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'nuevo' | 'editar' | 'mant'
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [mantForm, setMantForm] = useState({ descripcion: '', tipo: 'preventivo', tecnico: '', costo: '' });
  const [filtro, setFiltro]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  const load = () => getEquipos().then(r => setEquipos(r.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNuevo = () => { setForm(EMPTY); setModal('nuevo'); setMsg(''); };
  const openEditar = (e) => { setSelected(e); setForm({ ...e }); setModal('editar'); setMsg(''); };
  const openMant   = (e) => { setSelected(e); setMantForm({ descripcion: '', tipo: 'preventivo', tecnico: '', costo: '' }); setModal('mant'); setMsg(''); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'nuevo') await createEquipo(form);
      else await updateEquipo(selected.id, form);
      setMsg('Guardado correctamente');
      await load();
      setTimeout(closeModal, 800);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este equipo? Se eliminarán también sus mantenimientos.')) return;
    await deleteEquipo(id);
    setEquipos(eq => eq.filter(e => e.id !== id));
  };

  const handleMant = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addMantenimiento(selected.id, { ...mantForm, costo: mantForm.costo ? parseFloat(mantForm.costo) : undefined });
      setMsg('Mantenimiento registrado');
      await load();
      setTimeout(closeModal, 800);
    } catch { setMsg('Error al registrar mantenimiento'); }
    finally { setSaving(false); }
  };

  const filtrados = filtro ? equipos.filter(e => e.estado === filtro) : equipos;

  if (loading) return <div className="loading">Cargando equipos...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div><h2>Gestión de Equipos</h2><p>Inventario tecnológico de la empresa</p></div>
        <button className="btn btn-primary" onClick={openNuevo}>+ Nuevo Equipo</button>
      </div>

      <div className="actions-row" style={{ marginBottom: 16 }}>
        <button className={`btn btn-sm ${filtro === '' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFiltro('')}>Todos ({equipos.length})</button>
        {ESTADOS.map(s => (
          <button key={s} className={`btn btn-sm ${filtro === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFiltro(s)}>
            {s} ({equipos.filter(e => e.estado === s).length})
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nombre</th><th>Tipo</th><th>Marca / Modelo</th><th>Serial</th><th>Estado</th><th>Ubicación</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtrados.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: '30px' }}>Sin equipos registrados</td></tr>
                : filtrados.map(e => (
                    <tr key={e.id}>
                      <td><strong>{e.nombre}</strong></td>
                      <td>{e.tipo}</td>
                      <td>{e.marca} {e.modelo}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{e.serial || '-'}</td>
                      <td><span className={`badge badge-${e.estado}`}>{e.estado}</span></td>
                      <td>{e.ubicacion || '-'}</td>
                      <td>
                        <div className="actions-row">
                          <button className="btn btn-outline btn-sm" onClick={() => openEditar(e)}>Editar</button>
                          <button className="btn btn-success btn-sm" onClick={() => openMant(e)}>Mant.</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>×</button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Equipo */}
      {(modal === 'nuevo' || modal === 'editar') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal === 'nuevo' ? 'Nuevo Equipo' : 'Editar Equipo'}</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            {msg && <div className={`alert ${msg.includes('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group"><label className="form-label">Nombre del equipo</label>
                <input className="form-input" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Tipo</label>
                  <select className="form-select" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Estado</label>
                  <select className="form-select" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                    {ESTADOS.map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Marca</label>
                  <input className="form-input" value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label">Modelo</label>
                  <input className="form-input" value={form.modelo || ''} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Serial</label>
                  <input className="form-input" value={form.serial || ''} onChange={e => setForm(f => ({ ...f, serial: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Ubicación</label>
                  <input className="form-input" value={form.ubicacion || ''} onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))} /></div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar Equipo'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mantenimiento */}
      {modal === 'mant' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Registrar Mantenimiento — {selected?.nombre}</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            {msg && <div className={`alert ${msg.includes('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
            <form onSubmit={handleMant}>
              <div className="form-group"><label className="form-label">Descripción</label>
                <textarea className="form-textarea" rows={3} value={mantForm.descripcion}
                  onChange={e => setMantForm(f => ({ ...f, descripcion: e.target.value }))} required /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Tipo</label>
                  <select className="form-select" value={mantForm.tipo} onChange={e => setMantForm(f => ({ ...f, tipo: e.target.value }))}>
                    {['preventivo', 'correctivo', 'predictivo'].map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Técnico</label>
                  <input className="form-input" value={mantForm.tecnico} onChange={e => setMantForm(f => ({ ...f, tecnico: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Costo (opcional)</label>
                <input className="form-input" type="number" step="0.01" value={mantForm.costo}
                  onChange={e => setMantForm(f => ({ ...f, costo: e.target.value }))} /></div>
              <button className="btn btn-success" type="submit" disabled={saving}>{saving ? 'Registrando...' : 'Registrar Mantenimiento'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
