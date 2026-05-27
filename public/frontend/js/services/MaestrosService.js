class OperadorService {
  static _instance = null;
  constructor() {
    if (OperadorService._instance) return OperadorService._instance;
    OperadorService._instance = this;
    this._storage = StorageService.getInstance();
    this._key = 'infopanel_operadores';
  }
  static getInstance() {
    if (!OperadorService._instance) new OperadorService();
    return OperadorService._instance;
  }
  getAll() { return this._storage.get(this._key) || []; }
  save(item) {
    const items = this.getAll();
    if (!item.operadorId) {
      item.operadorId = items.length > 0 ? Math.max(...items.map(i => i.operadorId)) + 1 : 1;
      items.push(item);
    } else {
      const idx = items.findIndex(i => i.operadorId === item.operadorId);
      if (idx !== -1) items[idx] = item;
    }
    this._storage.set(this._key, items);
    EventBus.getInstance().emit('operadores:changed', items);
  }
}

class PuntoService {
  constructor() {
    if (PuntoService._instance) return PuntoService._instance;
    PuntoService._instance = this;
    this._storage = StorageService.getInstance();
    this._key = 'infopanel_puntos';
  }
  static getInstance() {
    if (!PuntoService._instance) new PuntoService();
    return PuntoService._instance;
  }
  getAll() { return this._storage.get(this._key) || []; }
  save(item) {
    const items = this.getAll();
    if (!item.puntoId) {
      item.puntoId = items.length > 0 ? Math.max(...items.map(i => i.puntoId)) + 1 : 1;
      items.push(item);
    } else {
      const idx = items.findIndex(i => i.puntoId === item.puntoId);
      if (idx !== -1) items[idx] = item;
    }
    this._storage.set(this._key, items);
    EventBus.getInstance().emit('puntos:changed', items);
  }
}