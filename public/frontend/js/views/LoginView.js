class LoginView {
  render(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-card-header">
            <div class="auth-card-icon">🔑</div>
            <h2 class="auth-card-title">Iniciar Sesión</h2>
            <p class="auth-card-subtitle">Accede a tu panel informativo</p>
          </div>
          <form id="login-form">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="login-email" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input type="password" id="login-password" class="form-input" required>
            </div>
            <button type="submit" class="btn btn-primary btn-full">Entrar</button>
          </form>
          <div class="auth-footer">
            ¿No tienes cuenta? <a id="go-to-register">Regístrate aquí</a>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;

      try {
        UsuarioService.getInstance().login(email, pass);
        new Router().navigate('tablero');
        Toast.show('Acceso concedido', 'success');
      } catch (err) {
        Toast.show(err.message, 'error');
      }
    });

    container.querySelector('#go-to-register').addEventListener('click', () => {
      new Router().navigate('registro');
    });
  }
}