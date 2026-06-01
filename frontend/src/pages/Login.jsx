import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]   = useState({ correo: 'admin@techcorp.com', password: 'admin123' });
  const [err, setErr]     = useState('');
  const [loading, setLoading] = useState(false);
  const { loginCtx }      = useAuth();
  const navigate          = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await loginApi(form);
      loginCtx(res.data.token, res.data.usuario);
      navigate('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>TechCorp PRO</h1>
          <p>Plataforma de Equipos Tecnológicos</p>
        </div>

        {err && <div className="alert alert-error">{err}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="form-input" type="email" value={form.correo}
              onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
              placeholder="correo@empresa.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="form-input" type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: '12px', background: '#f0f2f8', borderRadius: 8, fontSize: '0.8rem', color: '#555' }}>
          <strong>Credenciales demo:</strong><br />
          Admin: admin@techcorp.com / admin123<br />
          Técnico: tecnico@techcorp.com / tecnico123
        </div>
      </div>
    </div>
  );
}
