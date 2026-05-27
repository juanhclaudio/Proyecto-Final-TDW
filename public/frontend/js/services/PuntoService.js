class PuntoService {
  static _instance = null;
  constructor() {
    if (PuntoService._instance) return PuntoService._instance;
    PuntoService._instance = this;
    this._eventBus = window.EventBus ? window.EventBus.getInstance() : null;
  }

  static getInstance() {
    if (!PuntoService._instance) new PuntoService();
    return PuntoService._instance;
  }

  async getAll() {
    try {
      const response = await ApiService.getInstance().fetchWithAuth('/spots');
      const data = Array.isArray(response) ? response : (response.puntos || response.spots || []);
      return window.DataFactory ? window.DataFactory.createCollection('punto', data) : data;
    } catch (error) {
      console.error("Error al obtener puntos de la API:", error);
      return [];
    }
  }

  async save(data, etag = null) {
    let result;
    if (!data.puntoId) {
      result = await ApiService.getInstance().fetchWithAuth('/spots', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } else {
      const headers = {};
      if (etag) headers['If-Match'] = etag;
      result = await ApiService.getInstance().fetchWithAuth(`/spots/${data.puntoId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data)
      });
    }
    if (this._eventBus) this._eventBus.emit('puntos:changed', await this.getAll());
    return result;
  }
  
  async delete(id) {
    await ApiService.getInstance().fetchWithAuth(`/spots/${id}`, { method: 'DELETE' });
    if (this._eventBus) this._eventBus.emit('puntos:changed', await this.getAll());
  }
}