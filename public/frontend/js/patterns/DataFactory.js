class DataFactory {
  static create(type, data) {
    if (!data) return null;
    switch (type) {
      case 'operacion': return new Operacion(data);
      case 'usuario': return new Usuario(data.email, data.password, data.rol);
      case 'operador': return new Operador(data.operadorId, data.nombre, data.siglas, data.color, data.urlIcono);
      case 'punto': return new Punto(data.puntoId, data.tipo, data.codigo);
      default: return data;
    }
  }
  static createCollection(type, dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(item => this.create(type, item));
  }
}