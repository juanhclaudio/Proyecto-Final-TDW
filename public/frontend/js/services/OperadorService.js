class OperadorService {
  static _instance = null;

  constructor() {
    if (OperadorService._instance) return OperadorService._instance;
    
    this._cache = null;
    this._lastFetch = 0;
    
    OperadorService._instance = this;
  }

  static getInstance() {
    if (!OperadorService._instance) new OperadorService();
    return OperadorService._instance;
  }

  async getAll() {
    const CACHE_TTL = 60000;
    const now = Date.now();

    if (this._cache && (now - this._lastFetch < CACHE_TTL)) {
      return Promise.resolve(this._cache);
    }

    try {
      const response = await ApiService.getInstance().fetchWithAuth('/operators');
      const data = Array.isArray(response) ? response : (response.operadores || response.operators || []);
      const processedData = window.DataFactory ? window.DataFactory.createCollection('operador', data) : data;
      
      this._cache = processedData;
      this._lastFetch = now;
      
      return this._cache;
    } catch (error) {
      console.error("Error al obtener operadores de la API:", error);
      return [];
    }
  }

  async save(data, etag = null) {
    let result;
    if (!data.operadorId) {
      result = await ApiService.getInstance().fetchWithAuth('/operators', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } else {
      const headers = {};
      if (etag) headers['If-Match'] = etag;
      result = await ApiService.getInstance().fetchWithAuth(`/operators/${data.operadorId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data)
      });
    }

    this._cache = null;

    if (EventBus.getInstance()) EventBus.getInstance().emit('operadores:changed', await this.getAll());
    return result;
  }
  
  async delete(id) {
    await ApiService.getInstance().fetchWithAuth(`/operators/${id}`, { method: 'DELETE' });
    
    this._cache = null;

    if (EventBus.getInstance()) EventBus.getInstance().emit('operadores:changed', await this.getAll());
  }
}