import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClienteProvider, useCliente } from './context/ClienteContext';

import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Equipos        from './pages/Equipos';
import Tickets        from './pages/Tickets';
import Analitica      from './pages/Analitica';
import Asistente      from './pages/Asistente';
import Usuarios       from './pages/Usuarios';
import Clientes       from './pages/Clientes';
import StockAdmin     from './pages/StockAdmin';

import PortalCliente  from './pages/PortalCliente';
import ClienteInicio  from './pages/ClienteInicio';

const NAV_MAIN = [
  { to: '/dashboard',  icon: '◈',  label: 'Dashboard' },
  { to: '/equipos',    icon: '💻',  label: 'Equipos' },
  { to: '/tickets',    icon: '🎫',  label: 'Tickets' },
  { to: '/analitica',  icon: '📊',  label: 'Analítica' },
  { to: '/asistente',  icon: '🤖',  label: 'Asistente' },
];
const NAV_VENTAS = [
  { to: '/stock',      icon: '🏪',  label: 'Stock / Catálogos' },
  { to: '/clientes',   icon: '👥',  label: 'Clientes' },
];
const NAV_ADMIN = [
  { to: '/usuarios',   icon: '🔐',  label: 'Usuarios Admin' },
];

function Sidebar() {
  const { usuario, logout, isAdmin } = useAuth();
  const initials = usuario?.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>TechCorp PRO</h1>
        <p>Gestión de Equipos</p>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <div className="name">{usuario?.nombre}</div>
          <div className="role">{usuario?.rol}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Principal</div>
        {NAV_MAIN.map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="sidebar-icon">{n.icon}</span>{n.label}
          </NavLink>
        ))}

        <div className="sidebar-section">Ventas y Clientes</div>
        {NAV_VENTAS.map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="sidebar-icon">{n.icon}</span>{n.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="sidebar-section">Administración</div>
            {NAV_ADMIN.map(n => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-icon">{n.icon}</span>{n.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <span>v1.1.0</span>
        <button className="logout-btn" onClick={logout}>Salir</button>
      </div>
    </aside>
  );
}

function ProtectedLayout() {
  const { usuario, loading } = useAuth();
  if (loading) return <div className="loading">Cargando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="equipos"    element={<Equipos />} />
          <Route path="tickets"    element={<Tickets />} />
          <Route path="analitica"  element={<Analitica />} />
          <Route path="asistente"  element={<Asistente />} />
          <Route path="stock"      element={<StockAdmin />} />
          <Route path="clientes"   element={<Clientes />} />
          <Route path="usuarios"   element={<Usuarios />} />
          <Route index             element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function PortalClienteGuard() {
  const { cliente, loading } = useCliente();
  if (loading) return <div className="loading">Cargando...</div>;
  if (!cliente) return <Navigate to="/portal" replace />;
  return <ClienteInicio />;
}

export default function App() {
  return (
    <AuthProvider>
      <ClienteProvider>
        <Routes>
          {/* Admin */}
          <Route path="/login"      element={<Login />} />
          <Route path="/*"          element={<ProtectedLayout />} />

          {/* Portal Clientes */}
          <Route path="/portal"         element={<PortalCliente />} />
          <Route path="/portal/inicio"  element={<PortalClienteGuard />} />
        </Routes>
      </ClienteProvider>
    </AuthProvider>
  );
}
