import React, { useState, useRef, useEffect } from 'react';
import { enviarMensaje } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SUGERENCIAS = [
  'El equipo no enciende',
  'El computador está muy lento',
  'Problemas de conexión a internet',
  'Error en la impresora',
  'Cómo crear un ticket de soporte',
  'Recomendaciones de mantenimiento preventivo',
];

export default function Asistente() {
  const [mensajes, setMensajes] = useState([
    { rol: 'asistente', contenido: '¡Hola! Soy el Asistente Técnico de TechCorp PRO. Estoy aquí para ayudarte con diagnósticos y soporte técnico. ¿En qué puedo asistirte hoy?' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sesionId]            = useState(`session_${Date.now()}`);
  const chatRef               = useRef(null);
  const { usuario }           = useAuth();

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [mensajes]);

  const enviar = async (texto) => {
    const msg = texto || input.trim();
    if (!msg) return;
    setInput('');
    setMensajes(m => [...m, { rol: 'usuario', contenido: msg }]);
    setLoading(true);
    try {
      const res = await enviarMensaje({ sesionId, mensaje: msg, usuario: usuario?.nombre });
      setMensajes(m => [...m, { rol: 'asistente', contenido: res.data.respuesta }]);
    } catch {
      setMensajes(m => [...m, { rol: 'asistente', contenido: 'Lo siento, hubo un error al procesar tu consulta. Por favor intenta nuevamente.' }]);
    } finally { setLoading(false); }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } };

  const initials = usuario?.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  return (
    <div className="page">
      <div className="page-header">
        <div><h2>Asistente Técnico</h2><p>Diagnóstico inteligente y soporte para equipos tecnológicos</p></div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-title">Chat de Soporte</div>

          <div className="chat-container" ref={chatRef}>
            {mensajes.map((m, i) => (
              <div key={i} className={`chat-msg ${m.rol}`}>
                <div className={`chat-avatar ${m.rol === 'asistente' ? 'bot' : 'user'}`}>
                  {m.rol === 'asistente' ? '🤖' : initials}
                </div>
                <div className="chat-bubble">{m.contenido}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg asistente">
                <div className="chat-avatar bot">🤖</div>
                <div className="chat-bubble" style={{ color: '#888', fontStyle: 'italic' }}>Analizando tu consulta...</div>
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <input className="chat-input" placeholder="Describe tu problema técnico..." value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={handleKey} disabled={loading} />
            <button className="btn btn-primary" onClick={() => enviar()} disabled={loading || !input.trim()}>Enviar</button>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-title">Consultas Rápidas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGERENCIAS.map((s, i) => (
                <button key={i} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => enviar(s)} disabled={loading}>{s}</button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title">Áreas de Soporte</div>
            {[
              { icon: '💻', label: 'Hardware', desc: 'Equipos, componentes, periféricos' },
              { icon: '🌐', label: 'Redes', desc: 'Conectividad, WiFi, VPN' },
              { icon: '🖨️', label: 'Impresoras', desc: 'Drivers, papel, tóner' },
              { icon: '🔒', label: 'Seguridad', desc: 'Virus, accesos, contraseñas' },
              { icon: '⚡', label: 'Rendimiento', desc: 'Lentitud, memoria, disco' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? '1px solid #f1f3fb' : 'none' }}>
                <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.78rem', color: '#888' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
