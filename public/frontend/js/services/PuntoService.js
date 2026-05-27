class PuntoService {
  static _instance = null;

  constructor() {
    if (PuntoService._instance) return PuntoService._instance;
    
    this._cache = null;
    this._lastFetch = 0;
    
    PuntoService._instance = this;
  }

  static getInstance() {
    if (!PuntoService._instance) new PuntoService();
    return PuntoService._instance;
  }

  async getAll() {
    const CACHE_TTL = 60000;
    const now = Date.now();

    if (this._cache && (now - this._lastFetch < CACHE_TTL)) {
      return Promise.resolve(this._cache);
    }

    try {
      const response = await ApiService.getInstance().fetchWithAuth('/spots');
      const data = Array.isArray(response) ? response : (response.puntos || response.spots || []);
      const processedData = window.DataFactory ? window.DataFactory.createCollection('punto', data) : data;
      
      this._cache = processedData;
      this._lastFetch = now;
      
      return this._cache;
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

    this._cache = null;

    if (EventBus.getInstance()) EventBus.getInstance().emit('puntos:changed', await this.getAll());
    return result;
  }
  
  async delete(id) {
    await ApiService.getInstance().fetchWithAuth(`/spots/${id}`, { method: 'DELETE' });
    
    this._cache = null;

    if (EventBus.getInstance()) EventBus.getInstance().emit('puntos:changed', await this.getAll());
  }
}