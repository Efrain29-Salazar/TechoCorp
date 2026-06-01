class Equipo {
  constructor({ id, nombre, tipo, marca, modelo, serial, estado, ubicacion, fechaCompra, creadoEn, actualizadoEn, mantenimientos }) {
    this.id            = id;
    this.nombre        = nombre;
    this.tipo          = tipo;
    this.marca         = marca;
    this.modelo        = modelo;
    this.serial        = serial;
    this.estado        = estado || 'operativo';
    this.ubicacion     = ubicacion;
    this.fechaCompra   = fechaCompra;
    this.creadoEn      = creadoEn;
    this.actualizadoEn = actualizadoEn;
    this.mantenimientos = mantenimientos || [];
  }

  isOperativo()   { return this.estado === 'operativo'; }
  necesitaRevision() { return this.estado === 'revision'; }
}

module.exports = Equipo;
