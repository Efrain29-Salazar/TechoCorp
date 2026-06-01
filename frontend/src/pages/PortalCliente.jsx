import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteLogin, clienteRegister } from '../services/api';
import { useCliente } from '../context/ClienteContext';

export default function PortalCliente() {
  const [tab, setTab]     = useState('login');
  const [form, setForm]   = useState({ nombre: '', correo: '', password: '', telefono: '', empresa: '' });
  const [err, setErr]     = useState('');
  const [ok, setOk]       = useState('');
  const [loading, setLoading] = useState(false);
  const { loginCliente }  = useCliente();
  const navigate          = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res = await clienteLogin({ correo: form.correo, password: form.password });
      loginCliente(res.data.token, res.data.cliente);
      navigate('/portal/inicio');
    } catch (e) {
      setErr(e.response?.data?.error || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr(''); setOk(''); setLoading(true);
    try {
      await clienteRegister(form);
      setOk('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
      setTab('login');
      setForm(f => ({ ...f, nombre: '', password: '', telefono: '', empresa: '' }));
    } catch (e) {
      setErr(e.response?.data?.error || 'Error al registrar');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d1b6e 0%, #1a237e 50%, #283593 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28, color: '#fff' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>💻</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>TechCorp PRO</h1>
          <p style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: 4 }}>Portal de Clientes</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,.3)', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid #f1f3fb' }}>
            {[['login', 'Iniciar Sesión'], ['register', 'Crear Cuenta']].map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); setErr(''); setOk(''); }}
                style={{
                  flex: 1, padding: '16px', border: 'none', cursor: 'pointer',
                  background: tab === t ? '#fff' : '#f5f7ff',
                  fontWeight: tab === t ? 700 : 500,
                  color: tab === t ? '#1a237e' : '#888',
                  fontSize: '0.92rem',
                  borderBottom: tab === t ? '3px solid #1a237e' : '3px solid transparent',
                  transition: 'all .15s',
                }}>{label}</button>
            ))}
          </div>

          <div style={{ padding: '28px 32px' }}>
            {err && (
              <div style={{ background: '#ffebee', color: '#c62828', borderLeft: '4px solid #c62828', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.88rem' }}>
                {err}
              </div>
            )}
            {ok && (
              <div style={{ background: '#e8f5e9', color: '#1b5e20', borderLeft: '4px solid #1b5e20', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.88rem' }}>
                {ok}
              </div>
            )}

            {/* LOGIN */}
            {tab === 'login' && (
              <form onSubmit={handleLogin}>
                <Fg label="Correo electrónico">
                  <input className="form-input" type="email" value={form.correo} required
                    placeholder="tu@correo.com"
                    onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} />
                </Fg>
                <Fg label="Contraseña">
                  <input className="form-input" type="password" value={form.password} required
                    placeholder="••••••••"
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </Fg>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                  type="submit" disabled={loading}>
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
                <p style={{ textAlign: 'center', marginTop: 14, fontSize: '0.82rem', color: '#888' }}>
                  ¿No tienes cuenta?{' '}
                  <button type="button" onClick={() => setTab('register')}
                    style={{ background: 'none', border: 'none', color: '#1a237e', fontWeight: 700, cursor: 'pointer' }}>
                    Regístrate gratis
                  </button>
                </p>
              </form>
            )}

            {/* REGISTRO */}
            {tab === 'register' && (
              <form onSubmit={handleRegister}>
                <Fg label="Nombre completo *">
                  <input className="form-input" value={form.nombre} required
                    placeholder="Juan Pérez"
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                </Fg>
                <Fg label="Correo electrónico *">
                  <input className="form-input" type="email" value={form.correo} required
                    placeholder="tu@correo.com"
                    onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} />
                </Fg>
                <Fg label="Contraseña * (mín. 6 caracteres)">
                  <input className="form-input" type="password" value={form.password} required minLength={6}
                    placeholder="••••••••"
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </Fg>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Fg label="Teléfono">
                    <input className="form-input" value={form.telefono}
                      placeholder="+57 300 000 0000"
                      onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                  </Fg>
                  <Fg label="Empresa">
                    <input className="form-input" value={form.empresa}
                      placeholder="Mi Empresa S.A."
                      onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))} />
                  </Fg>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                  type="submit" disabled={loading}>
                  {loading ? 'Creando cuenta...' : 'Crear Mi Cuenta'}
                </button>
                <p style={{ textAlign: 'center', marginTop: 14, fontSize: '0.78rem', color: '#aaa' }}>
                  Al registrarte aceptas los términos y condiciones de TechCorp PRO.
                </p>
              </form>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,.5)', fontSize: '0.78rem' }}>
          ¿Eres administrador?{' '}
          <a href="/login" style={{ color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>Ir al panel admin</a>
        </p>
      </div>
    </div>
  );
}

function Fg({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}
