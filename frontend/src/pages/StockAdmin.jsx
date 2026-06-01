import React, { useEffect, useState, useRef } from 'react';
import {
  getStockAdmin, toggleStockEquipo,
  getCatalogosAdmin, uploadCatalogo, deleteCatalogo, downloadCatalogo,
  getEquipos,
} from '../services/api';

export default function StockAdmin() {
  const [tab, setTab]           = useState('catalogos');
  const [catalogos, setCatalogos] = useState([]);
  const [equipos, setEquipos]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [stockModal, setStockModal]   = useState(null); // equipo seleccionado
  const [uploadForm, setUploadForm]   = useState({ nombre: '', descripcion: '' });
  const [stockForm, setStockForm]     = useState({ enStock: false, precio: '', descripcionVenta: '' });
  const [file, setFile]         = useState(null);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const fileRef                 = useRef();

  const loadAll = async () => {
    try {
      const [cats, eqs] = await Promise.all([getCatalogosAdmin(), getEquipos()]);
      setCatalogos(cats.data || []);
      setEquipos(eqs.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  // ── Subir PDF ─────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMsg('Selecciona un archivo PDF');
    setSaving(true); setMsg('');
    try {
      const fd = new FormData();
      fd.append('catalogo', file);
      fd.append('nombre', uploadForm.nombre);
      fd.append('descripcion', uploadForm.descripcion);
      await uploadCatalogo(fd);
      setMsg('ok:Catálogo subido exitosamente');
      setUploadModal(false);
      setUploadForm({ nombre: '', descripcion: '' });
      setFile(null);
      await loadAll();
    } catch (err) {
      setMsg('err:' + (err.response?.data?.error || 'Error al subir el PDF'));
    } finally { setSaving(false); }
  };

  const handleDeleteCat = async (id) => {
    if (!confirm('¿Eliminar este catálogo? Se borrará el archivo PDF permanentemente.')) return;
    await deleteCatalogo(id);
    setCatalogos(c => c.filter(x => x.id !== id));
  };

  // ── Toggle Stock Equipo ───────────────────────────────────────────
  const openStockModal = (eq) => {
    setStockModal(eq);
    setStockForm({ enStock: eq.enStock, precio: eq.precio || '', descripcionVenta: eq.descripcionVenta || '' });
    setMsg('');
  };

  const handleStockSave = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await toggleStockEquipo(stockModal.id, {
        enStock: stockForm.enStock,
        precio: stockForm.precio ? parseFloat(stockForm.precio) : null,
        descripcionVenta: stockForm.descripcionVenta || null,
      });
      setMsg('ok:Equipo actualizado en el catálogo de stock');
      await loadAll();
      setTimeout(() => setStockModal(null), 900);
    } catch { setMsg('err:Error al actualizar'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading">Cargando gestión de stock...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Catálogo de Stock — Ventas</h2>
          <p>Gestiona los catálogos PDF y equipos disponibles para clientes</p>
        </div>
        <div className="actions-row">
          {tab === 'catalogos'
            ? <button className="btn btn-primary" onClick={() => { setUploadModal(true); setMsg(''); }}>📤 Subir Catálogo PDF</button>
            : null
          }
        </div>
      </div>

      {/* Tabs */}
      <div className="actions-row" style={{ marginBottom: 20 }}>
        {[['catalogos', '📄 Catálogos PDF'], ['equipos', '💻 Equipos en Stock']].map(([t, label]) => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── CATÁLOGOS ─────────────────────────────────────────────── */}
      {tab === 'catalogos' && (
        <>
          {catalogos.length === 0
            ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>No hay catálogos subidos aún</p>
                  <p>Sube un PDF con el inventario de equipos disponibles para venta</p>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setUploadModal(true)}>
                    📤 Subir Primer Catálogo
                  </button>
                </div>
              </div>
            )
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {catalogos.map(c => (
                  <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 52, height: 52, background: '#ffebee', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>📄</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>{c.nombre}</h3>
                        {c.descripcion && <p style={{ color: '#666', fontSize: '0.82rem' }}>{c.descripcion}</p>}
                        <p style={{ color: '#aaa', fontSize: '0.75rem', marginTop: 4 }}>
                          Subido por: <strong>{c.subidoPor}</strong> —{' '}
                          {new Date(c.creadoEn).toLocaleDateString('es-ES')}
                        </p>
                        <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: c.activo ? '#e8f5e9' : '#f5f5f5', color: c.activo ? '#1b5e20' : '#888' }}>
                          {c.activo ? 'Visible para clientes' : 'Oculto'}
                        </span>
                      </div>
                    </div>
                    <div className="actions-row">
                      <button className="btn btn-outline btn-sm" onClick={() => downloadCatalogo(c.id, c.nombre)}>
                        📥 Descargar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCat(c.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </>
      )}

      {/* ── EQUIPOS EN STOCK ──────────────────────────────────────── */}
      {tab === 'equipos' && (
        <div className="card">
          <div className="section-title">Todos los equipos — marca cuáles están en venta</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Equipo</th><th>Tipo</th><th>Estado</th><th>En Stock</th><th>Precio</th><th>Descripción venta</th><th>Acción</th></tr>
              </thead>
              <tbody>
                {equipos.map(e => (
                  <tr key={e.id}>
                    <td><strong>{e.nombre}</strong><br /><small style={{ color: '#888' }}>{e.marca} {e.modelo}</small></td>
                    <td>{e.tipo}</td>
                    <td><span className={`badge badge-${e.estado}`}>{e.estado}</span></td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700,
                        background: e.enStock ? '#e8f5e9' : '#f5f5f5',
                        color: e.enStock ? '#1b5e20' : '#888',
                      }}>
                        {e.enStock ? '✓ Sí' : '— No'}
                      </span>
                    </td>
                    <td>{e.precio ? `$${Number(e.precio).toLocaleString('es-CO')}` : <span style={{ color: '#aaa' }}>—</span>}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.descripcionVenta || <span style={{ color: '#aaa' }}>—</span>}
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => openStockModal(e)}>
                        Configurar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL Subir PDF ───────────────────────────────────────── */}
      {uploadModal && (
        <div className="modal-overlay" onClick={() => setUploadModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">📤 Subir Catálogo PDF</span>
              <button className="modal-close" onClick={() => setUploadModal(false)}>×</button>
            </div>
            {msg && (
              <div className={`alert ${msg.startsWith('err:') ? 'alert-error' : 'alert-success'}`}>
                {msg.replace(/^(ok:|err:)/, '')}
              </div>
            )}
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Nombre del catálogo *</label>
                <input className="form-input" value={uploadForm.nombre}
                  onChange={e => setUploadForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Catálogo Equipos Q1 2025" required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción (opcional)</label>
                <textarea className="form-textarea" rows={2} value={uploadForm.descripcion}
                  onChange={e => setUploadForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Equipos disponibles para ventas corporativas..." />
              </div>
              <div className="form-group">
                <label className="form-label">Archivo PDF *</label>
                <div style={{ border: '2px dashed #c5cae9', borderRadius: 10, padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#f5f7ff', transition: 'border-color .15s' }}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={ev => { ev.preventDefault(); ev.currentTarget.style.borderColor = '#1a237e'; }}
                  onDragLeave={ev => ev.currentTarget.style.borderColor = '#c5cae9'}
                  onDrop={ev => { ev.preventDefault(); const f = ev.dataTransfer.files[0]; if (f?.type === 'application/pdf') setFile(f); else alert('Solo PDF'); ev.currentTarget.style.borderColor = '#c5cae9'; }}>
                  <input type="file" accept="application/pdf" ref={fileRef} style={{ display: 'none' }}
                    onChange={e => setFile(e.target.files[0])} />
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>📄</div>
                  {file
                    ? <><p style={{ fontWeight: 700, color: '#1a237e' }}>{file.name}</p><p style={{ fontSize: '0.78rem', color: '#888' }}>{(file.size / 1024).toFixed(1)} KB</p></>
                    : <><p style={{ fontWeight: 600, color: '#555' }}>Arrastra tu PDF aquí o haz clic para seleccionar</p><p style={{ fontSize: '0.78rem', color: '#aaa', marginTop: 4 }}>Máximo 30 MB</p></>
                  }
                </div>
              </div>
              <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={saving || !file}>
                {saving ? 'Subiendo...' : '📤 Subir Catálogo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL Config Stock ────────────────────────────────────── */}
      {stockModal && (
        <div className="modal-overlay" onClick={() => setStockModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Configurar Stock — {stockModal.nombre}</span>
              <button className="modal-close" onClick={() => setStockModal(null)}>×</button>
            </div>
            {msg && (
              <div className={`alert ${msg.startsWith('err:') ? 'alert-error' : 'alert-success'}`}>
                {msg.replace(/^(ok:|err:)/, '')}
              </div>
            )}
            <form onSubmit={handleStockSave}>
              <div className="form-group">
                <label className="form-label">Estado en el catálogo</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[true, false].map(v => (
                    <label key={String(v)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '10px 16px', borderRadius: 8, border: `2px solid ${stockForm.enStock === v ? '#1a237e' : '#e0e4f0'}`, background: stockForm.enStock === v ? '#e8eaf6' : '#fff', fontWeight: 600, fontSize: '0.88rem' }}>
                      <input type="radio" name="enStock" checked={stockForm.enStock === v} onChange={() => setStockForm(f => ({ ...f, enStock: v }))} style={{ display: 'none' }} />
                      {v ? '✓ Disponible para venta' : '— No disponible'}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Precio de venta (opcional)</label>
                <input className="form-input" type="number" step="0.01" min="0" value={stockForm.precio}
                  onChange={e => setStockForm(f => ({ ...f, precio: e.target.value }))}
                  placeholder="Ej: 1500000" />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción para el cliente (opcional)</label>
                <textarea className="form-textarea" rows={3} value={stockForm.descripcionVenta}
                  onChange={e => setStockForm(f => ({ ...f, descripcionVenta: e.target.value }))}
                  placeholder="Equipo en excelente estado, garantía incluida..." />
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar Configuración'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
