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
            <button type="submit" id="login-submit-btn" class="btn btn-primary btn-full">Entrar</button>
          </form>
          <div class="auth-footer">
            ¿No tienes cuenta? <a id="go-to-register" style="cursor:pointer; color:blue;">Regístrate aquí</a>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      const submitBtn = document.getElementById('login-submit-btn');

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verificando...';
        
        await UsuarioService.getInstance().login(email, pass);
        
        if (window.Toast) window.Toast.show('Acceso concedido', 'success');
        new Router().navigate('tablero'); 
      } catch (err) {
        if (window.Toast) window.Toast.show(err.message, 'error');
        else alert(err.message);
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Entrar';
      }
    });

    container.querySelector('#go-to-register').addEventListener('click', () => {
      new Router().navigate('registro');
    });
  }
}