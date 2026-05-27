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
      const usuarios = await UsuarioService.getInstance().getUsuarios();

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
                    <td><span class="badge badge-${user.role}">${user.role}</span></td>
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

  async _updateUserRole(id, nuevoRol) {
    try {
      await UsuarioService.getInstance().updateUsuario(id, { role: nuevoRol });
      if (window.Toast) window.Toast.show(`Rol actualizado a ${nuevoRol}`, 'success');
      this._renderTable(); 
    } catch (err) {
      if (window.Toast) window.Toast.show(err.message, 'error');
    }
  }
}