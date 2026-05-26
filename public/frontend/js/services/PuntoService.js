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

  getAll() {
    const data = this._storage.get(this._key) || [];
    return DataFactory.createCollection('punto', data);
  }

  save(item) {
    const items = this.getAll();
    if (!item.puntoId) {
      const maxId = items.reduce((max, i) => (i.puntoId > max ? i.puntoId : max), 0);
      item.puntoId = maxId + 1;
      items.push(item);
    } else {
      const idx = items.findIndex(i => i.puntoId === item.puntoId);
      if (idx !== -1) items[idx] = item;
    }
    this._storage.set(this._key, items);
    EventBus.getInstance().emit('puntos:changed', items);
  }
}