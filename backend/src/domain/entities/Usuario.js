class Usuario {
  constructor({ id, nombre, correo, password, rol, activo, creadoEn }) {
    this.id       = id;
    this.nombre   = nombre;
    this.correo   = correo;
    this.password = password;
    this.rol      = rol || 'tecnico';
    this.activo   = activo ?? true;
    this.creadoEn = creadoEn;
  }

  toPublic() {
    const { password, ...pub } = this;
    return pub;
  }

  isAdmin() { return this.rol === 'admin'; }
}

module.exports = Usuario;
