class UsuariosView {
  constructor() {
    this._container = null;
  }

  render(container) {
    this._container = container;
    this._renderTable();
    
    EventBus.getInstance().on('usuarios:changed', () => {
      if (new Router().getCurrentRoute() === 'usuarios') {
        this._renderTable();
      }
    });
  }

  _renderTable() {
    const service = UsuarioService.getInstance();
    const usuarios = service.getUsuarios();

    this._container.innerHTML = `
      <header class="page-header">
        <div>
          <h1 class="page-title">Gestión de Usuarios</h1>
          <p class="page-subtitle">Administración de roles y permisos del sistema</p>
        </div>
      </header>

      <div class="panel">
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Usuario (Email)</th>
                <th>Rol Actual</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${usuarios.map(user => `
                <tr>
                  <td class="font-bold">${user.email}</td>
                  <td><span class="badge badge-${user.rol}">${user.rol}</span></td>
                  <td class="table-actions">
                    ${user.rol === 'PÚBLICO' 
                      ? `<button class="btn btn-primary btn-sm js-promote" data-email="${user.email}">Promover a GESTOR</button>`
                      : `<button class="btn btn-danger btn-sm js-degrade" data-email="${user.email}">Degradar a PÚBLICO</button>`
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
  }

  _initEvents() {
    this._container.querySelectorAll('.js-promote').forEach(btn => {
      btn.onclick = () => this._updateUserRole(btn.dataset.email, 'GESTOR');
    });

    this._container.querySelectorAll('.js-degrade').forEach(btn => {
      btn.onclick = () => this._updateUserRole(btn.dataset.email, 'PÚBLICO');
    });
  }

  _updateUserRole(email, nuevoRol) {
    try {
      UsuarioService.getInstance().updateRol(email, nuevoRol);
      Toast.show(`Usuario actualizado a ${nuevoRol}`, 'success');
    } catch (err) {
      Toast.show(err.message, 'error');
    }
  }
}