class Cliente {
  constructor({ id, nombre, correo, password, telefono, empresa, activo, creadoEn }) {
    this.id       = id;
    this.nombre   = nombre;
    this.correo   = correo;
    this.password = password;
    this.telefono = telefono;
    this.empresa  = empresa;
    this.activo   = activo ?? true;
    this.creadoEn = creadoEn;
  }

  toPublic() {
    const { password, ...pub } = this;
    return pub;
  }
}

module.exports = Cliente;
