import React, { useEffect, useState } from 'react';
import { getDashboard, downloadReportePDF } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfl, setPdfl]   = useState(false);
  const { usuario }       = useAuth();

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handlePDF = async () => {
    setPdfl(true);
    try { await downloadReportePDF(); }
    catch { alert('Error al generar PDF. Verifique que el servidor esté corriendo.'); }
    finally { setPdfl(false); }
  };

  if (loading) return <div className="loading">Cargando dashboard...</div>;

  const equiposPorEstado = {};
  data?.equipos?.porEstado?.forEach(e => { equiposPorEstado[e.estado] = e._count?.id || 0; });

  const ticketsPorEstado = {};
  data?.tickets?.porEstado?.forEach(t => { ticketsPorEstado[t._id] = t.total; });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Bienvenido, {usuario?.nombre} — Resumen general del sistema</p>
        </div>
        <button className="pdf-btn" onClick={handlePDF} disabled={pdfl}>
          {pdfl ? 'Generando...' : '📄 Reporte PDF'}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Equipos</div>
          <div className="stat-value">{data?.equipos?.total || 0}</div>
          <div className="stat-sub">en inventario</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Operativos</div>
          <div className="stat-value">{equiposPorEstado['operativo'] || 0}</div>
          <div className="stat-sub">equipos activos</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">En Revisión</div>
          <div className="stat-value">{equiposPorEstado['revision'] || 0}</div>
          <div className="stat-sub">requieren atención</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Tickets Abiertos</div>
          <div className="stat-value">{ticketsPorEstado['abierto'] || 0}</div>
          <div className="stat-sub">pendientes de atender</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Total Tickets</div>
          <div className="stat-value">{data?.tickets?.total || 0}</div>
          <div className="stat-sub">registrados</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Mantenimientos</div>
          <div className="stat-value">{data?.mantenimientos?.total || 0}</div>
          <div className="stat-sub">realizados</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">Últimos Mantenimientos</div>
          {(data?.mantenimientos?.ultimos || []).length === 0
            ? <p style={{ color: '#888', fontSize: '0.88rem' }}>Sin mantenimientos recientes.</p>
            : <table><thead><tr><th>Equipo</th><th>Tipo</th><th>Técnico</th><th>Fecha</th></tr></thead>
                <tbody>
                  {data.mantenimientos.ultimos.map(m => (
                    <tr key={m.id}>
                      <td>{m.equipo?.nombre}</td>
                      <td><span className={`badge badge-${m.tipo === 'preventivo' ? 'abierto' : 'alta'}`}>{m.tipo}</span></td>
                      <td>{m.tecnico || '-'}</td>
                      <td>{new Date(m.fecha).toLocaleDateString('es-ES')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        <div className="card">
          <div className="section-title">Últimos Tickets</div>
          {(data?.ultimosTickets || []).length === 0
            ? <p style={{ color: '#888', fontSize: '0.88rem' }}>Sin tickets recientes.</p>
            : <table><thead><tr><th>Título</th><th>Prioridad</th><th>Estado</th></tr></thead>
                <tbody>
                  {data.ultimosTickets.map(t => (
                    <tr key={t._id}>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.titulo}</td>
                      <td><span className={`badge badge-${t.prioridad}`}>{t.prioridad}</span></td>
                      <td><span className={`badge badge-${t.estado}`}>{t.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>
    </div>
  );
}
