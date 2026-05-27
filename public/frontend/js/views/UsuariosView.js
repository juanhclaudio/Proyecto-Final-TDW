class UsuariosView {
  constructor() {
    this._container = null;
  }

  render(container) {
    this._container = container;
    this._renderTable();
    
    if (window.EventBus) {
      window.EventBus.getInstance().on('usuarios:changed', () => {
        if (new window.Router().getCurrentRoute() === 'usuarios') this._renderTable();
      });
    }
  }

  async _renderTable() {
    try {
      const rawUsuarios = await UsuarioService.getInstance().getUsuarios();
      console.log("Datos RAW de Usuarios:", rawUsuarios);
      const usuarios = rawUsuarios.map(u => u.user || u);

      this._container.innerHTML = `
        <header class="page-header">
          <div><h1 class="page-title">Gestión de Usuarios</h1><p class="page-subtitle">Administración de roles y permisos</p></div>
        </header>
        <div class="panel">
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead><tr><th>Usuario (Email)</th><th>Rol Actual</th><th style="text-align: right;">Acciones</th></tr></thead>
              <tbody>
                ${usuarios.map(user => `
                  <tr>
                    <td class="font-bold">${user.email}</td>
                    <td><span class="badge badge-${user.role.toLowerCase()}">${user.role}</span></td>
                    <td class="table-actions">
                      ${user.role === 'PUBLICO' 
                        ? `<button class="btn btn-primary btn-sm js-promote" data-id="${user.id}">Promover a GESTOR</button>`
                        : `<button class="btn btn-danger btn-sm js-degrade" data-id="${user.id}">Degradar a PUBLICO</button>`
                      }
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      this._initEvents();
    } catch (error) {
      this._container.innerHTML = `<p style="color:red">Error cargando usuarios: ${error.message}</p>`;
    }
  }

  _initEvents() {
    this._container.querySelectorAll('.js-promote').forEach(btn => {
      btn.onclick = () => this._updateUserRole(btn.dataset.id, 'GESTOR');
    });
    this._container.querySelectorAll('.js-degrade').forEach(btn => {
      btn.onclick = () => this._updateUserRole(btn.dataset.id, 'PUBLICO');
    });
  }

  async _updateUserRole(id, newRole) {
    try {
      const rawUsuarios = await UsuarioService.getInstance().getUsuarios();
      const usuarios = rawUsuarios.map(u => u.user || u);
      const user = usuarios.find(u => u.id == id);
      if (!user) return;
      user.role = newRole;
      await UsuarioService.getInstance().updateUsuario(id, user);
      if (typeof Toast !== 'undefined') Toast.show('Rol actualizado correctamente', 'success');
      this._renderTable();
    } catch (err) {
      if (err.message.includes('428')) {
        alert('El registro fue modificado por otra persona. Refresque la página.');
      } else {
        console.error("Error actualizando rol:", err);
      }
    }
  }
}