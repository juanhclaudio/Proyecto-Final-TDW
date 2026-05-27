(function () {
  'use strict';

  function initApp() {

    const eventBus = EventBus.getInstance();
    const sessionView = new SessionView();
    
    sessionView.render(document.getElementById('header-session'));

    const router = new Router();
    router
      .register('tablero',  new TableroView())
      .register('login',    new LoginView())
      .register('registro', new RegisterView())
      .register('admin',    new AdminView(),    ['GESTOR'])
      .register('usuarios', new UsuariosView(), ['GESTOR']);

    eventBus.on('session:changed', () => {
      sessionView.render(document.getElementById('header-session'));
      _updateProtectedLinks();
    });

    eventBus.on('toast', ({ type, message }) => {
      Toast.show(message, type);
    });

    _updateProtectedLinks();
    router.start('tablero');
    _initModal();
    _initClock();
  }

  function _updateProtectedLinks() {
    const usuario = UsuarioService.getInstance().getUsuarioActual();
    document.querySelectorAll('.js-protected').forEach(link => {
      const requiredRole = link.dataset.role;
      const hasAccess = usuario && usuario.rol === requiredRole;
      link.classList.toggle('hidden', !hasAccess);
    });
  }

  function _initModal() {
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    closeBtn.addEventListener('click', () => Modal.close());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) Modal.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        Modal.close();
      }
    });
  }

  function _initClock() {
    function tick() {
      const now = new Date();
      const timeEl = document.getElementById('clock-time');
      const dateEl = document.getElementById('clock-date');
      if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('es-ES', {
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
      }
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('es-ES', {
          weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
        });
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();