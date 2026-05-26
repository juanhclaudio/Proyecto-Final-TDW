class UsuarioService {
  constructor() {
    if (UsuarioService._instance) return UsuarioService._instance;
    UsuarioService._instance = this;

    this._storage = StorageService.getInstance();
    this._eventBus = EventBus.getInstance();
    this._key = 'infopanel_usuarios';
    this._sessionKey = 'infopanel_sesion_activa';
  }

  static getInstance() {
    if (!UsuarioService._instance) new UsuarioService();
    return UsuarioService._instance;
  }

  getUsuarios() {
    const rawData = this._storage.get(this._key) || [];
    return DataFactory.createCollection('usuario', rawData);
  }

  registrar(email, password) {
    const usuarios = this.getUsuarios();
    if (usuarios.find(u => u.email === email)) {
      throw new Error("El usuario ya existe.");
    }

    const nuevoUsuario = DataFactory.create('usuario', { email, password, rol: 'PÚBLICO' });
    usuarios.push(nuevoUsuario);
    this._storage.set(this._key, usuarios);
    return nuevoUsuario;
  }

  login(email, password) {
    const usuarios = this.getUsuarios();
    const user = usuarios.find(u => u.email === email && u.password === password);
    
    if (!user) throw new Error("Credenciales incorrectas.");

    this._storage.set(this._sessionKey, user);
    this._eventBus.emit('session:changed', user);
    return user;
  }

  logout() {
    this._storage.remove(this._sessionKey);
    this._eventBus.emit('session:changed', null);
  }

  getUsuarioActual() {
    const data = this._storage.get(this._sessionKey);
    return data ? DataFactory.create('usuario', data) : null;
  }

  updateRol(email, nuevoRol) {
    const usuarios = this.getUsuarios();
    const index = usuarios.findIndex(u => u.email === email);
    if (index === -1) return;

    if (nuevoRol === 'PÚBLICO') {
      const gestores = usuarios.filter(u => u.rol === 'GESTOR');
      if (gestores.length <= 1 && usuarios[index].rol === 'GESTOR') {
        throw new Error("No se puede dejar la aplicación sin gestores.");
      }
    }

    usuarios[index].rol = nuevoRol;
    this._storage.set(this._key, usuarios);
    
    const actual = this.getUsuarioActual();
    if (actual && actual.email === email) {
      actual.rol = nuevoRol;
      this._storage.set(this._sessionKey, actual);
      this._eventBus.emit('session:changed', actual);
    }

    this._eventBus.emit('usuarios:changed', usuarios);
  }
}