class UsuarioService {

  static _instance = null;

  constructor() {
    if (UsuarioService._instance) return UsuarioService._instance;
    UsuarioService._instance = this;
    
    this._eventBus = window.EventBus ? window.EventBus.getInstance() : null;
  }

  static getInstance() {
    if (!UsuarioService._instance) new UsuarioService();
    return UsuarioService._instance;
  }

  async getUsuarios() {
    try {
      const response = await ApiService.getInstance().fetchWithAuth('/users');
      return response.users || response || []; 
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  async registrar(userData) {
    const nuevoUsuario = await ApiService.getInstance().fetchWithAuth('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return nuevoUsuario;
  }

  async login(username, password) {
    const response = await ApiService.getInstance().fetchWithAuth('/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error("Credenciales incorrectas o cuenta inactiva.");
    }

    const data = await response.json();
    StorageService.getInstance().setToken(data.access_token);
    
    const user = StorageService.getInstance().getCurrentUser();
    if (this._eventBus) this._eventBus.emit('session:changed', user);
    
    return user;
  }

  logout() {
    StorageService.getInstance().removeToken();
    if (this._eventBus) this._eventBus.emit('session:changed', null);
  }

  getUsuarioActual() {
    return StorageService.getInstance().getCurrentUser();
  }

  async updateUsuario(id, updateData, etag = null) {
    const headers = {};
    if (etag) headers['If-Match'] = etag;

    const result = await ApiService.getInstance().fetchWithAuth(`/users/${id}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(updateData)
    });
    
    if (this._eventBus) this._eventBus.emit('usuarios:changed');
    
    const actual = this.getUsuarioActual();
    if (actual && actual.uid === id && this._eventBus) {
       this._eventBus.emit('session:changed', actual);
    }
    
    return result;
  }
}