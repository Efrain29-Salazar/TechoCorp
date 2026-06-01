import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Title } from 'chart.js';
import { getDashboard } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Title);

const COLORS_ESTADO = { operativo: '#1b5e20', revision: '#e65100', inactivo: '#78909c', dano: '#c62828' };
const COLORS_TICKET = { abierto: '#1565c0', en_progreso: '#e65100', resuelto: '#1b5e20', cerrado: '#78909c' };
const COLORS_PRIO   = { baja: '#1b5e20', media: '#f57f17', alta: '#e65100', critica: '#c62828' };

export default function Analitica() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Cargando analítica...</div>;

  const equiposEstado = data?.equipos?.porEstado || [];
  const ticketsEstado = data?.tickets?.porEstado || [];
  const ticketsPrio   = data?.tickets?.porPrioridad || [];

  const equipoBarData = {
    labels: equiposEstado.map(e => e.estado),
    datasets: [{ label: 'Equipos', data: equiposEstado.map(e => e._count?.id || 0),
      backgroundColor: equiposEstado.map(e => COLORS_ESTADO[e.estado] || '#3f51b5'), borderRadius: 6 }],
  };

  const ticketDonutData = {
    labels: ticketsEstado.map(t => t._id || 'N/A'),
    datasets: [{ data: ticketsEstado.map(t => t.total),
      backgroundColor: ticketsEstado.map(t => COLORS_TICKET[t._id] || '#888'), borderWidth: 2, borderColor: '#fff' }],
  };

  const prioBarData = {
    labels: ticketsPrio.map(t => t._id || 'N/A'),
    datasets: [{ label: 'Tickets', data: ticketsPrio.map(t => t.total),
      backgroundColor: ticketsPrio.map(t => COLORS_PRIO[t._id] || '#888'), borderRadius: 6 }],
  };

  const maintLast  = data?.mantenimientos?.ultimos || [];
  const maintDates = [...new Set(maintLast.map(m => new Date(m.fecha).toLocaleDateString('es-ES')))];
  const maintLineData = {
    labels: maintDates.length ? maintDates : ['Sin datos'],
    datasets: [{ label: 'Mantenimientos', data: maintDates.map(d => maintLast.filter(m => new Date(m.fecha).toLocaleDateString('es-ES') === d).length),
      fill: true, backgroundColor: 'rgba(26,35,126,0.1)', borderColor: '#1a237e', tension: 0.4 }],
  };

  const opts = { responsive: true, plugins: { legend: { position: 'bottom' } } };

  return (
    <div className="page">
      <div className="page-header"><h2>Analítica</h2><p>Métricas y estadísticas del sistema TechCorp PRO</p></div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Total Equipos</div><div className="stat-value">{data?.equipos?.total || 0}</div></div>
        <div className="stat-card green"><div className="stat-label">Operativos</div><div className="stat-value">{equiposEstado.find(e => e.estado === 'operativo')?._count?.id || 0}</div></div>
        <div className="stat-card orange"><div className="stat-label">Tickets Abiertos</div><div className="stat-value">{ticketsEstado.find(t => t._id === 'abierto')?.total || 0}</div></div>
        <div className="stat-card red"><div className="stat-label">Tickets Críticos</div><div className="stat-value">{ticketsPrio.find(t => t._id === 'critica')?.total || 0}</div></div>
        <div className="stat-card"><div className="stat-label">Total Tickets</div><div className="stat-value">{data?.tickets?.total || 0}</div></div>
        <div className="stat-card purple"><div className="stat-label">Mantenimientos</div><div className="stat-value">{data?.mantenimientos?.total || 0}</div></div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-title">Equipos por Estado</div>
          {equiposEstado.length === 0
            ? <div className="empty-state"><p>Sin datos de equipos</p></div>
            : <Bar data={equipoBarData} options={{ ...opts, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />}
        </div>
        <div className="card">
          <div className="section-title">Tickets por Estado</div>
          {ticketsEstado.length === 0
            ? <div className="empty-state"><p>Sin tickets registrados</p></div>
            : <Doughnut data={ticketDonutData} options={opts} />}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">Tickets por Prioridad</div>
          {ticketsPrio.length === 0
            ? <div className="empty-state"><p>Sin datos de prioridad</p></div>
            : <Bar data={prioBarData} options={{ ...opts, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />}
        </div>
        <div className="card">
          <div className="section-title">Tendencia de Mantenimientos</div>
          <Line data={maintLineData} options={{ ...opts, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
        </div>
      </div>
    </div>
  );
}
