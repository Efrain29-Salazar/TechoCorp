const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

class ClienteRegisterUseCase {
  constructor(clienteRepository) {
    this.repo = clienteRepository;
  }

  async execute({ nombre, correo, password, telefono, empresa }) {
    if (!nombre || !correo || !password) throw new Error('Nombre, correo y contraseña son requeridos');
    if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

    const existing = await this.repo.findByCorreo(correo);
    if (existing) throw new Error('Este correo ya está registrado');

    const hashed = await bcrypt.hash(password, 10);
    const cliente = await this.repo.create({ nombre, correo, password: hashed, telefono, empresa });
    const { password: _, ...pub } = cliente;
    return pub;
  }
}

class ClienteLoginUseCase {
  constructor(clienteRepository) {
    this.repo = clienteRepository;
  }

  async execute({ correo, password }) {
    if (!correo || !password) throw new Error('Correo y contraseña son requeridos');

    const cliente = await this.repo.findByCorreo(correo);
    if (!cliente) throw new Error('Credenciales incorrectas');
    if (!cliente.activo) throw new Error('Cuenta inactiva. Contacta al soporte.');

    const valid = await bcrypt.compare(password, cliente.password);
    if (!valid) throw new Error('Credenciales incorrectas');

    const token = jwt.sign(
      { id: cliente.id, correo: cliente.correo, nombre: cliente.nombre, tipo: 'cliente' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    const { password: _, ...pub } = cliente;
    return { token, cliente: pub };
  }
}

module.exports = { ClienteRegisterUseCase, ClienteLoginUseCase };
