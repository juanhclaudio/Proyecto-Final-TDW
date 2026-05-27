class Router {
  constructor() {
    if (Router._instance) return Router._instance;
    Router._instance = this;
    this._routes = new Map();
    this._currentRoute = null;
    this._outlet = document.getElementById('app-main');
    window.addEventListener('hashchange', () => this._handleRouteChange());
  }

  register(path, view, roles = null) {
    this._routes.set(path, { view, roles });
    return this;
  }

  navigate(path) {
    window.location.hash = `#${path}`;
  }

  start(defaultPath = 'tablero') {
    const hash = window.location.hash.replace('#', '');
    const initial = hash && this._routes.has(hash) ? hash : defaultPath;
    window.location.hash = `#${initial}`;
    
    
    if (window.location.hash === `#${initial}`) {
      this._handleRouteChange();
    }
  }

  _handleRouteChange() {
    const path = window.location.hash.replace('#', '') || 'tablero';
    const route = this._routes.get(path);

    if (!route) {
      
      this.navigate('tablero');
      return;
    }

    
    if (route.roles && route.roles.length > 0) {
      const usuario = UsuarioService.getInstance().getUsuarioActual();
      if (!usuario || !route.roles.includes(usuario.role)) {
        EventBus.getInstance().emit('toast', {
          type: 'error',
          message: 'Acceso denegado. Inicia sesión con los permisos adecuados.'
        });
        this.navigate('login');
        return;
      }
    }

    this._currentRoute = path;
    this._renderView(route.view);
    this._updateNavLinks(path);
  }

  _renderView(view) {
    if (!this._outlet) return;
    
    this._outlet.innerHTML = '';
    view.render(this._outlet);
  }

  _updateNavLinks(path) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const route = link.dataset.route;
      link.classList.toggle('active', route === path);
    });
  }

  getCurrentRoute() {
    return this._currentRoute;
  }
}
