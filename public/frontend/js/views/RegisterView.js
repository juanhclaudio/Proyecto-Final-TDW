class RegisterView {
  render(container) {
    container.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-card-header">
            <div class="auth-card-icon">📝</div>
            <h2 class="auth-card-title">Registro</h2>
            <p class="auth-card-subtitle">Crea una cuenta nueva</p>
          </div>
          <form id="register-form">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="reg-email" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input type="password" id="reg-password" class="form-input" required>
              <span class="form-hint">Mínimo 8 caracteres y al menos 1 número</span>
            </div>
            <button type="submit" class="btn btn-primary btn-full">Crear cuenta</button>
          </form>
          <div class="auth-footer">
            ¿Ya tienes cuenta? <a id="go-to-login">Inicia sesión</a>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-password').value;

      if (!Usuario.esPasswordValido(pass)) {
        Toast.show('La contraseña debe tener 8 caracteres y 1 número', 'error');
        return;
      }

      try {
        UsuarioService.getInstance().registrar(email, pass);
        Toast.show('Usuario registrado correctamente', 'success');
        new Router().navigate('login');
      } catch (err) {
        Toast.show(err.message, 'error');
      }
    });

    container.querySelector('#go-to-login').addEventListener('click', () => {
      new Router().navigate('login');
    });
  }
}