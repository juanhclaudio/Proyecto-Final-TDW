class OperadorService {
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
  getAll() {
    const data = this._storage.get(this._key) || [];
    return DataFactory.createCollection('operador', data);
  }
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