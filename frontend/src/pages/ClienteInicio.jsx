import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStockPublico, getCatalogosPublicos } from '../services/api';
import { useCliente } from '../context/ClienteContext';

const TIPO_ICONS = { Laptop: '💻', Desktop: '🖥️', Servidor: '🗄️', Impresora: '🖨️', Monitor: '🖥', Red: '🌐', Otro: '📦' };

export default function ClienteInicio() {
  const [equipos, setEquipos]     = useState([]);
  const [catalogos, setCatalogos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('equipos');
  const { cliente, logoutCliente } = useCliente();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getStockPublico(), getCatalogosPublicos()])
      .then(([eq, cat]) => { setEquipos(eq.data || []); setCatalogos(cat.data || []); })
      .catch(() => { logoutCliente(); navigate('/portal'); })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (id, nombre) => {
    const token = localStorage.getItem('clienteToken');
    try {
      const res = await fetch(`/api/stock/catalogos/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No autorizado');
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `${nombre}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { alert('Error al descargar. Inicia sesión nuevamente.'); }
  };

  const initials = cliente?.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'C';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f8', fontFamily: 'Inter, sans-serif' }}>
      {/* Navbar */}
      <header style={{ background: '#1a237e', color: '#fff', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.3rem' }}>💻</span>
          <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>TechCorp PRO</span>
          <span style={{ opacity: .5, fontSize: '0.78rem', marginLeft: 4 }}>— Portal Cliente</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3f51b5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{initials}</div>
            <span>{cliente?.nombre}</span>
          </div>
          <button onClick={() => { logoutCliente(); navigate('/portal'); }}
            style={{ background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem' }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
        {/* Bienvenida */}
        <div style={{ background: 'linear-gradient(135deg, #1a237e, #283593)', borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>¡Bienvenido, {cliente?.nombre?.split(' ')[0]}!</h2>
            <p style={{ opacity: .8, fontSize: '0.88rem' }}>Explora nuestro catálogo de equipos disponibles para la venta</p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: '12px 20px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{equipos.length}</div>
              <div style={{ fontSize: '0.75rem', opacity: .7 }}>Equipos disponibles</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: '12px 20px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{catalogos.length}</div>
              <div style={{ fontSize: '0.75rem', opacity: .7 }}>Catálogos PDF</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', padding: 4, borderRadius: 10, boxShadow: '0 2px 8px rgba(26,35,126,.08)', width: 'fit-content' }}>
          {[['equipos', '🖥️ Equipos en Stock'], ['catalogos', '📄 Catálogos PDF']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', transition: 'all .15s',
                background: tab === t ? '#1a237e' : 'transparent',
                color: tab === t ? '#fff' : '#666',
              }}>{label}</button>
          ))}
        </div>

        {loading
          ? <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Cargando...</div>
          : tab === 'equipos'
            ? <EquiposGrid equipos={equipos} />
            : <CatalogosGrid catalogos={catalogos} onDownload={handleDownload} />
        }
      </div>
    </div>
  );
}

function EquiposGrid({ equipos }) {
  const TIPO_ICONS = { Laptop: '💻', Desktop: '🖥️', Servidor: '🗄️', Impresora: '🖨️', Monitor: '🖥', Red: '🌐', Otro: '📦' };

  if (equipos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📦</div>
        <p style={{ fontWeight: 600 }}>No hay equipos disponibles en este momento.</p>
        <p style={{ fontSize: '0.85rem', marginTop: 6 }}>Consulta los catálogos PDF o contacta a nuestro equipo.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
      {equipos.map(e => (
        <div key={e.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(26,35,126,.08)', border: '1px solid #e0e4f0', overflow: 'hidden', transition: 'transform .2s, box-shadow .2s' }}
          onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-3px)'; ev.currentTarget.style.boxShadow = '0 8px 24px rgba(26,35,126,.15)'; }}
          onMouseLeave={ev => { ev.currentTarget.style.transform = 'translateY(0)'; ev.currentTarget.style.boxShadow = '0 2px 10px rgba(26,35,126,.08)'; }}>
          {/* Header card */}
          <div style={{ background: 'linear-gradient(135deg, #e8eaf6, #c5cae9)', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.8rem' }}>{TIPO_ICONS[e.tipo] || '📦'}</div>
            <div style={{ fontWeight: 700, marginTop: 8, color: '#1a237e', fontSize: '0.88rem' }}>{e.tipo}</div>
          </div>
          <div style={{ padding: '18px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4, color: '#1a1a1a' }}>{e.nombre}</h3>
            <p style={{ color: '#666', fontSize: '0.82rem', marginBottom: 12 }}>{e.marca} {e.modelo}</p>
            {e.descripcionVenta && (
              <p style={{ color: '#555', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: 12 }}>{e.descripcionVenta}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: '#e8f5e9', color: '#1b5e20', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                Disponible
              </span>
              {e.precio
                ? <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a237e' }}>${Number(e.precio).toLocaleString('es-CO')}</span>
                : <span style={{ color: '#888', fontSize: '0.82rem' }}>Consultar precio</span>
              }
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CatalogosGrid({ catalogos, onDownload }) {
  if (catalogos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📄</div>
        <p style={{ fontWeight: 600 }}>No hay catálogos disponibles por el momento.</p>
        <p style={{ fontSize: '0.85rem', marginTop: 6 }}>El equipo de ventas los publicará próximamente.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
      {catalogos.map(c => (
        <div key={c.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(26,35,126,.08)', border: '1px solid #e0e4f0', padding: '22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, background: '#ffebee', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📄</div>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1a1a1a', marginBottom: 4 }}>{c.nombre}</h3>
              {c.descripcion && <p style={{ color: '#666', fontSize: '0.82rem', lineHeight: 1.5 }}>{c.descripcion}</p>}
              <p style={{ color: '#aaa', fontSize: '0.75rem', marginTop: 4 }}>
                Publicado: {new Date(c.creadoEn).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={() => onDownload(c.id, c.nombre)}
            style={{ background: '#c62828', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background .15s' }}
            onMouseEnter={ev => ev.currentTarget.style.background = '#b71c1c'}
            onMouseLeave={ev => ev.currentTarget.style.background = '#c62828'}>
            📥 Descargar Catálogo PDF
          </button>
        </div>
      ))}
    </div>
  );
}
