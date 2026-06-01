const bcrypt = require('bcryptjs');

class RegisterUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute({ nombre, correo, password, rol }) {
    if (!nombre || !correo || !password) throw new Error('Nombre, correo y contraseña son requeridos');

    const existing = await this.usuarioRepository.findByCorreo(correo);
    if (existing) throw new Error('El correo ya está registrado');

    const hashed = await bcrypt.hash(password, 10);
    const usuario = await this.usuarioRepository.create({
      nombre, correo, password: hashed, rol: rol || 'tecnico',
    });

    const { password: _, ...userPublic } = usuario;
    return userPublic;
  }
}

module.exports = RegisterUseCase;
