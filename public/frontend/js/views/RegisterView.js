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
              <input type="email" id="register-email" class="form-input" required>
              <span id="email-feedback" style="font-size: 0.85em; display:block; margin-top:5px;"></span>
            </div>
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input type="text" id="register-nombre" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Apellidos</label>
              <input type="text" id="register-apellidos" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Fecha de Nacimiento</label>
              <input type="date" id="register-fecha" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input type="password" id="register-password" class="form-input" required>
              <span class="form-hint">Mínimo 8 caracteres y al menos 1 número</span>
            </div>
            <button type="submit" id="register-submit-btn" class="btn btn-primary btn-full" disabled>Crear cuenta</button>
          </form>
          <div class="auth-footer">
            ¿Ya tienes cuenta? <a id="go-to-login" style="cursor:pointer; color:blue;">Inicia sesión</a>
          </div>
        </div>
      </div>
    `;

    this.setupRegistrationAjax(container);

    container.querySelector('#register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const userData = {
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
        nombre: document.getElementById('register-nombre').value,
        apellidos: document.getElementById('register-apellidos').value,
        fechaNacimiento: document.getElementById('register-fecha').value,
        urlsInteres: [] 
      };

      if (userData.password.length < 8 || !/\d/.test(userData.password)) {
        if(window.Toast) window.Toast.show('La contraseña debe tener 8 caracteres y 1 número', 'error');
        return;
      }

      try {
        await UsuarioService.getInstance().registrar(userData);
        if(window.Toast) window.Toast.show('Usuario registrado correctamente', 'success');
        new Router().navigate('login');
      } catch (err) {
        if(window.Toast) window.Toast.show('Error en el registro. Intente de nuevo.', 'error');
      }
    });

    container.querySelector('#go-to-login').addEventListener('click', () => {
      new Router().navigate('login');
    });
  }

  setupRegistrationAjax(container) {
    const emailInput = container.querySelector('#register-email');
    const feedbackEl = container.querySelector('#email-feedback');
    const submitBtn = container.querySelector('#register-submit-btn');
    let debounceTimer;

    emailInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const email = e.target.value.trim();
      
      if (email.length < 5 || !email.includes('@')) {
        feedbackEl.textContent = '';
        submitBtn.disabled = true;
        return;
      }

      debounceTimer = setTimeout(async () => {
        feedbackEl.textContent = 'Verificando disponibilidad...';
        feedbackEl.style.color = 'orange';
        
        try {
          const res = await fetch(`/api/v1/users/email/${encodeURIComponent(email)}`);
          
          if (res.status === 204) {
            feedbackEl.textContent = '❌ Este email ya está registrado';
            feedbackEl.style.color = 'red';
            submitBtn.disabled = true;
          } else if (res.status === 404) {
            feedbackEl.textContent = '✅ Email disponible';
            feedbackEl.style.color = 'green';
            submitBtn.disabled = false;
          }
        } catch (err) {
          feedbackEl.textContent = 'Error de red al verificar email.';
        }
      }, 600);
    });
  }
}