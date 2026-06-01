const ChatAsistente = require('../database/mongodb/models/ChatAsistente');
const { success, error } = require('../../shared/response');
const { v4: uuidv4 } = require('crypto');

// Base de conocimiento técnico
const KNOWLEDGE_BASE = [
  { keywords: ['no enciende', 'no prende', 'apagado'], resp: 'Verifica la fuente de poder y conexiones eléctricas. Si el equipo no enciende, puede ser falla en la fuente de alimentación o el botón de encendido. Revisa también el cable de poder y prueba en otro tomacorriente.' },
  { keywords: ['lento', 'tarda', 'lentitud'], resp: 'El equipo lento puede deberse a: (1) poco espacio en disco, (2) demasiados programas al inicio, (3) virus o malware, (4) RAM insuficiente. Recomiendo limpiar archivos temporales y revisar el administrador de tareas.' },
  { keywords: ['pantalla', 'monitor', 'display', 'imagen'], resp: 'Problemas de pantalla: verifica los cables de video (HDMI/VGA/DP), actualiza los drivers de la tarjeta gráfica, y prueba el monitor en otro equipo para descartar falla de hardware.' },
  { keywords: ['red', 'internet', 'wifi', 'conexión'], resp: 'Para problemas de red: reinicia el router y el adaptador de red. Ejecuta "ipconfig /flushdns" en CMD. Verifica que los drivers de red estén actualizados. Prueba con cable ethernet para descartar problemas inalámbricos.' },
  { keywords: ['impresora', 'imprimir', 'papel'], resp: 'Problemas de impresora: verifica la conexión USB o de red, reinicia el servicio "Print Spooler" en Windows, reinstala los drivers desde el sitio del fabricante, y revisa que el papel esté correctamente cargado.' },
  { keywords: ['virus', 'malware', 'infectado', 'ransomware'], resp: 'Para virus/malware: desconecta el equipo de la red inmediatamente. Usa un antivirus actualizado (Malwarebytes, Windows Defender). Si es ransomware, NO pagues el rescate. Contacta al equipo de seguridad.' },
  { keywords: ['batería', 'no carga', 'autonomía'], resp: 'Para problemas de batería: calibra la batería (descarga completa y carga al 100%). Verifica que el cargador sea el original. Si la batería tiene más de 2 años, puede necesitar reemplazo.' },
  { keywords: ['ticket', 'soporte', 'reporte', 'crear'], resp: 'Para crear un ticket de soporte, ve a la sección "Tickets" en el menú lateral, haz clic en "Nuevo Ticket", completa el formulario con el título, descripción y prioridad, y nuestro equipo lo atenderá.' },
  { keywords: ['mantenimiento', 'preventivo', 'limpieza'], resp: 'El mantenimiento preventivo recomendado incluye: limpieza de polvo cada 6 meses, actualización de software mensual, verificación de disco trimestral, y respaldo de datos semanal.' },
  { keywords: ['contraseña', 'password', 'acceso'], resp: 'Para restablecer contraseña: contacta al administrador del sistema. Las contraseñas deben tener mínimo 8 caracteres, incluir mayúsculas, números y símbolos. Nunca compartas tu contraseña.' },
];

function getBotResponse(mensaje) {
  const msgLower = mensaje.toLowerCase();
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some(k => msgLower.includes(k))) {
      return entry.resp;
    }
  }
  return 'Entendido. Para este tipo de problema específico, te recomiendo crear un ticket de soporte técnico para que uno de nuestros técnicos especializados pueda asistirte personalmente. ¿Hay algo más en lo que pueda orientarte?';
}

async function enviarMensaje(req, res) {
  try {
    const { sesionId, mensaje, usuario } = req.body;
    if (!mensaje) return error(res, 'Mensaje requerido');

    const sid = sesionId || `session_${Date.now()}`;
    const respuesta = getBotResponse(mensaje);

    let chat = await ChatAsistente.findOne({ sesionId: sid });
    if (!chat) {
      chat = new ChatAsistente({ sesionId: sid, usuario: usuario || 'anon', mensajes: [] });
    }

    chat.mensajes.push({ rol: 'usuario', contenido: mensaje });
    chat.mensajes.push({ rol: 'asistente', contenido: respuesta });
    chat.actualizadoEn = new Date();
    await chat.save();

    success(res, { sesionId: sid, respuesta, historial: chat.mensajes.slice(-10) });
  } catch (e) {
    error(res, e.message, 500);
  }
}

async function obtenerHistorial(req, res) {
  try {
    const { sesionId } = req.params;
    const chat = await ChatAsistente.findOne({ sesionId });
    success(res, chat ? chat.mensajes : []);
  } catch (e) {
    error(res, e.message, 500);
  }
}

module.exports = { enviarMensaje, obtenerHistorial };
