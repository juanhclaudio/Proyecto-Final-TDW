class OperadorService {
  static _instance = null;
  constructor() {
    if (OperadorService._instance) return OperadorService._instance;
    OperadorService._instance = this;
  }

  static getInstance() {
    if (!OperadorService._instance) new OperadorService();
    return OperadorService._instance;
  }

  async getAll() {
    try {
      const response = await ApiService.getInstance().fetchWithAuth('/operators');
      const data = Array.isArray(response) ? response : (response.operadores || response.operators || []);
      return window.DataFactory ? window.DataFactory.createCollection('operador', data) : data;
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
    if (EventBus.getInstance()) EventBus.getInstance().emit('operadores:changed', await this.getAll());
    return result;
  }
  
  async delete(id) {
    await ApiService.getInstance().fetchWithAuth(`/operators/${id}`, { method: 'DELETE' });
    if (EventBus.getInstance()) EventBus.getInstance().emit('operadores:changed', await this.getAll());
  }
}