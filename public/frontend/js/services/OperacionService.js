class OperacionService {
  constructor() {
    if (OperacionService._instance) return OperacionService._instance;
    OperacionService._instance = this;
    this._storage = StorageService.getInstance();
    this._eventBus = EventBus.getInstance();
    this._key = 'infopanel_operaciones';
  }

  static getInstance() {
    if (!OperacionService._instance) new OperacionService();
    return OperacionService._instance;
  }

  getAll() {
    const data = this._storage.get(this._key) || [];
    return DataFactory.createCollection('operacion', data);
  }

  save(data) {
    const operaciones = this.getAll();
    if (!data.operacionId) {
      const nueva = DataFactory.create('operacion', data);
      operaciones.push(nueva);
    } else {
      const idx = operaciones.findIndex(o => o.operacionId === data.operacionId);
      if (idx !== -1) {
        operaciones[idx] = data;
      }
    }
    this._storage.set(this._key, operaciones);
    this._eventBus.emit('operaciones:changed', operaciones);
  }

  delete(id) {
    const actuales = this.getAll();
    const filtradas = actuales.filter(o => o.operacionId !== id);
    this._storage.set(this._key, filtradas);
    this._eventBus.emit('operaciones:changed', filtradas);
  }
}