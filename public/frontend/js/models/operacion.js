class Operacion {
  constructor(data) {
    this.operacionId = data.operacionId || this._generarULID();
    this.tipo = data.tipo;
    this.sentido = data.sentido;
    this.codigo = data.codigo;
    this.origen = data.origen;
    this.destino = data.destino;
    this.horaProgramada = data.horaProgramada;
    this.horaEstimada = data.horaEstimada;
    this.estado = data.estado;
    this.operadorId = data.operadorId;
    this.puntoId = data.puntoId;
  }
  _generarULID() {
    const caracteres = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    let ulid = '';
    for (let i = 0; i < 26; i++) {
      ulid += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return ulid;
  }
}