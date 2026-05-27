class UsuarioService {
  static _instance = null;

  constructor() {
    if (UsuarioService._instance) return UsuarioService._instance;
    
    this._cache = null;
    this._lastFetch = 0;
    
    UsuarioService._instance = this;
  }

  static getInstance() {
    if (!UsuarioService._instance) new UsuarioService();
    return UsuarioService._instance;
  }

  async getUsuarios() {
    const CACHE_TTL = 60000;
    const now = Date.now();

    if (this._cache && (now - this._lastFetch < CACHE_TTL)) {
      return Promise.resolve(this._cache);
    }

    try {
      const response = await ApiService.getInstance().fetchWithAuth('/users');
      const data = response.users || response || []; 
      
      this._cache = data;
      this._lastFetch = now;
      
      return this._cache;
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

    this._cache = null;

    return nuevoUsuario;
  }

  async login(username, password) {
    const response = await fetch('/access_token', {
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
    EventBus.getInstance().emit('session:changed', user);
    
    return user;
  }

  logout() {
    StorageService.getInstance().removeToken();
    EventBus.getInstance().emit('session:changed', null);
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
    
    this._cache = null;
    
    if (EventBus.getInstance()) EventBus.getInstance().emit('usuarios:changed');
    
    const actual = this.getUsuarioActual();
    if (actual && actual.uid === id && EventBus.getInstance()) {
       EventBus.getInstance().emit('session:changed', actual);
    }
    
    return result;
  }
}