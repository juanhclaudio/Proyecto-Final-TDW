class OperacionService {
  static _instance = null;

  constructor() {
    if (OperacionService._instance) return OperacionService._instance;
    
    this._cache = null;
    this._lastFetch = 0;
    
    OperacionService._instance = this;
  }

  static getInstance() {
    if (!OperacionService._instance) new OperacionService();
    return OperacionService._instance;
  }

  async getAll() {
    const CACHE_TTL = 60000;
    const now = Date.now();

    if (this._cache && (now - this._lastFetch < CACHE_TTL)) {
      return Promise.resolve(this._cache);
    }

    try {
      const response = await ApiService.getInstance().fetchWithAuth('/operations');
      const data = Array.isArray(response) ? response : (response.operaciones || response.operations || []);
      const processedData = window.DataFactory ? window.DataFactory.createCollection('operacion', data) : data;
      
      this._cache = processedData;
      this._lastFetch = now;
      
      return this._cache;
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

    this._cache = null;

    if (EventBus.getInstance()) EventBus.getInstance().emit('operaciones:changed', await this.getAll());
    return result;
  }

  async delete(id) {
    await ApiService.getInstance().fetchWithAuth(`/operations/${id}`, { method: 'DELETE' });
    
    this._cache = null;

    if (EventBus.getInstance()) EventBus.getInstance().emit('operaciones:changed', await this.getAll());
  }
}