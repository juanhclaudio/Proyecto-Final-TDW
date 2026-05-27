class SessionView {
  render(container) {
    const usuario = UsuarioService.getInstance().getUsuarioActual();
    console.log("Usuario decodificado del JWT:", usuario);

    if (!usuario) {
      container.innerHTML = `
        <button class="btn btn-secondary btn-sm" id="btn-login-nav">Iniciar Sesión</button>
      `;
      container.querySelector('#btn-login-nav').addEventListener('click', () => {
        new Router().navigate('login');
      });
      return;
    }

    usuario.role = (usuario?.role || 'publico').toLowerCase();
    
    container.innerHTML = `
      <div class="session-info">
        <span class="session-email" title="${usuario.email}">${usuario.email}</span>
        <span class="session-role role-${usuario.role}">${usuario.role}</span>
      </div>
      <button class="btn btn-ghost btn-sm" id="btn-logout" title="Cerrar Sesión">SALIR</button>
    `;

    container.querySelector('#btn-logout').addEventListener('click', () => {
      UsuarioService.getInstance().logout();
      new Router().navigate('tablero');
      Toast.show('Has cerrado sesión', 'info');
    });
  }
}