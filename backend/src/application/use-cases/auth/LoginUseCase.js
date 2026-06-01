const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LoginUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ correo, password }) {
    if (!correo || !password) throw new Error('Correo y contraseña son requeridos');

    const usuario = await this.usuarioRepository.findByCorreo(correo);
    if (!usuario) throw new Error('Credenciales incorrectas');
    if (!usuario.activo) throw new Error('Usuario inactivo');

    // Comparación 
    const bcrypt = require('bcryptjs');

const valid = await bcrypt.compare(
  password,
  usuario.password
);

if (!valid) {
  throw new Error('Credenciales incorrectas');
}

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    const { password: _, ...userPublic } = usuario;
    return { token, usuario: userPublic };
  }
}

module.exports = LoginUseCase;
