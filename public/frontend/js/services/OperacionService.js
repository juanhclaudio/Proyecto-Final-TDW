class OperacionService {
  static _instance = null;
  constructor() {
    if (OperacionService._instance) return OperacionService._instance;
    OperacionService._instance = this;
    this._eventBus = window.EventBus ? window.EventBus.getInstance() : null;
  }

  static getInstance() {
    if (!OperacionService._instance) new OperacionService();
    return OperacionService._instance;
  }

  async getAll() {
    try {
      const response = await ApiService.getInstance().fetchWithAuth('/operations');
      const data = Array.isArray(response) ? response : (response.operaciones || response.operations || []);
      return window.DataFactory ? window.DataFactory.createCollection('operacion', data) : data;
    } catch (error) {
      console.error("Error al obtener operaciones de la API:", error);
      return [];
    }
  }

  async save(data, etag = null) {
    let result;
    if (!data.operacionId) {
      result = await ApiService.getInstance().fetchWithAuth('/operations', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } else {
      const headers = {};
      if (etag) headers['If-Match'] = etag;
      result = await ApiService.getInstance().fetchWithAuth(`/operations/${data.operacionId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data)
      });
    }
    if (this._eventBus) this._eventBus.emit('operaciones:changed', await this.getAll());
    return result;
  }

  async delete(id) {
    await ApiService.getInstance().fetchWithAuth(`/operations/${id}`, { method: 'DELETE' });
    if (this._eventBus) this._eventBus.emit('operaciones:changed', await this.getAll());
  }
}