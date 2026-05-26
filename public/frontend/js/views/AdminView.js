class AdminView {
  constructor() {
    this._container = null;
    this._currentSection = 'operaciones';
  }

  render(container) {
    this._container = container;
    this._renderLayout();
    this._loadSection();

    const eb = EventBus.getInstance();
    eb.on('operaciones:changed', () => { if (this._currentSection === 'operaciones') this._loadSection(); });
    eb.on('operadores:changed', () => { if (this._currentSection === 'operadores') this._loadSection(); });
    eb.on('puntos:changed', () => { if (this._currentSection === 'puntos') this._loadSection(); });
  }

  _renderLayout() {
    this._container.innerHTML = `
      <div class="view-with-sidebar">
        <aside class="view-sidebar">
          <div class="sidebar-title">Mantenimiento</div>
          <nav class="sidebar-nav">
            <div class="sidebar-nav-link ${this._currentSection === 'operaciones' ? 'active' : ''}" data-section="operaciones">Operaciones</div>
            <div class="sidebar-nav-link ${this._currentSection === 'operadores' ? 'active' : ''}" data-section="operadores">Operadores</div>
            <div class="sidebar-nav-link ${this._currentSection === 'puntos' ? 'active' : ''}" data-section="puntos">Puertas / Vías</div>
          </nav>
        </aside>
        <section class="view-content" id="admin-content"></section>
      </div>
    `;

    this._container.querySelectorAll('.sidebar-nav-link').forEach(link => {
      link.onclick = (e) => {
        this._currentSection = e.target.dataset.section;
        this._container.querySelectorAll('.sidebar-nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        this._loadSection();
      };
    });
  }

  _loadSection() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    if (this._currentSection === 'operaciones') this._renderOperaciones(content);
    else if (this._currentSection === 'operadores') this._renderOperadores(content);
    else if (this._currentSection === 'puntos') this._renderPuntos(content);
  }

  _renderOperaciones(container) {
    const data = OperacionService.getInstance().getAll();
    container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Gestión de Operaciones</h2>
        <button class="btn btn-primary btn-sm" id="btn-new-op">+ Nueva Operación</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Tipo</th>
            <th>Sentido</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(op => `
            <tr>
              <td class="op-code">${op.codigo}</td>
              <td><span class="badge badge-${op.tipo}">${op.tipo}</span></td>
              <td class="uppercase">${op.sentido}</td>
              <td><span class="badge badge-${op.estado}">${op.estado}</span></td>
              <td class="table-actions">
                <button class="btn btn-secondary btn-sm js-edit-op" data-id="${op.operacionId}">Editar</button>
                <button class="btn btn-danger btn-sm js-delete-op" data-id="${op.operacionId}">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.querySelector('#btn-new-op').onclick = () => this._formOperacion();
    container.querySelectorAll('.js-edit-op').forEach(btn => btn.onclick = () => this._formOperacion(btn.dataset.id));
    container.querySelectorAll('.js-delete-op').forEach(btn => btn.onclick = () => {
      if (confirm('¿Deseas eliminar esta operación?')) OperacionService.getInstance().delete(btn.dataset.id);
    });
  }

  _formOperacion(id = null) {
    const ops = OperadorService.getInstance().getAll();
    const pts = PuntoService.getInstance().getAll();
    const op = id ? OperacionService.getInstance().getAll().find(o => o.operacionId === id) : null;

    const html = `
      <form id="form-op">
        <div class="form-group">
          <label class="form-label">Código</label>
          <input type="text" id="op-codigo" class="form-input" value="${op?.codigo || ''}" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tipo</label>
            <select id="op-tipo" class="form-select">
              <option value="vuelo" ${op?.tipo === 'vuelo' ? 'selected' : ''}>Vuelo</option>
              <option value="tren" ${op?.tipo === 'tren' ? 'selected' : ''}>Tren</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Sentido</label>
            <select id="op-sentido" class="form-select">
              <option value="salida" ${op?.sentido === 'salida' ? 'selected' : ''}>Salida</option>
              <option value="llegada" ${op?.sentido === 'llegada' ? 'selected' : ''}>Llegada</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Origen</label>
            <input type="text" id="op-origen" class="form-input" value="${op?.origen || ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Destino</label>
            <input type="text" id="op-destino" class="form-input" value="${op?.destino || ''}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">H. Programada</label>
            <input type="datetime-local" id="op-hprog" class="form-input" value="${op?.horaProgramada ? op.horaProgramada.slice(0, 16) : ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">H. Estimada</label>
            <input type="datetime-local" id="op-hest" class="form-input" value="${op?.horaEstimada ? op.horaEstimada.slice(0, 16) : ''}" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select id="op-estado" class="form-select">
            ${['PROGRAMADO', 'EMBARCANDO', 'RETRASADO', 'CANCELADO', 'EN_RUTA', 'LLEGADO'].map(e => `
              <option value="${e}" ${op?.estado === e ? 'selected' : ''}>${e}</option>
            `).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Operador</label>
            <select id="op-operador" class="form-select">
              ${ops.map(o => `<option value="${o.operadorId}" ${op?.operadorId == o.operadorId ? 'selected' : ''}>${o.nombre}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Punto Acceso</label>
            <select id="op-punto" class="form-select">
              ${pts.map(p => `<option value="${p.puntoId}" ${op?.puntoId == p.puntoId ? 'selected' : ''}>${p.codigo}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </form>
    `;

    Modal.open(html, id ? 'Editar Operación' : 'Nueva Operación');

    document.getElementById('form-op').onsubmit = (e) => {
      e.preventDefault();
      const payload = {
        operacionId: id,
        codigo: document.getElementById('op-codigo').value,
        tipo: document.getElementById('op-tipo').value,
        sentido: document.getElementById('op-sentido').value,
        origen: document.getElementById('op-origen').value,
        destino: document.getElementById('op-destino').value,
        horaProgramada: new Date(document.getElementById('op-hprog').value).toISOString(),
        horaEstimada: new Date(document.getElementById('op-hest').value).toISOString(),
        estado: document.getElementById('op-estado').value,
        operadorId: parseInt(document.getElementById('op-operador').value),
        puntoId: parseInt(document.getElementById('op-punto').value)
      };
      OperacionService.getInstance().save(payload);
      Modal.close();
      Toast.show('Operación actualizada', 'success');
    };
  }

  _renderOperadores(container) {
    const data = OperadorService.getInstance().getAll();
    container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Gestión de Operadores</h2>
        <button class="btn btn-primary btn-sm" id="btn-new-opr">+ Nuevo Operador</button>
      </div>
      <table class="data-table">
        <thead><tr><th>Nombre</th><th>Siglas</th><th>Color</th><th>Acciones</th></tr></thead>
        <tbody>
          ${data.map(o => `
            <tr>
              <td>${o.nombre}</td>
              <td><strong>${o.siglas}</strong></td>
              <td><div style="width:20px;height:20px;border-radius:50%;background:${o.color}"></div></td>
              <td class="table-actions">
                <button class="btn btn-secondary btn-sm js-edit-opr" data-id="${o.operadorId}">Editar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.querySelector('#btn-new-opr').onclick = () => this._formOperador();
    container.querySelectorAll('.js-edit-opr').forEach(btn => btn.onclick = () => this._formOperador(btn.dataset.id));
  }

  _formOperador(id = null) {
    const service = OperadorService.getInstance();
    const obj = id ? service.getAll().find(o => o.operadorId == id) : null;
    const html = `
      <form id="form-opr">
        <div class="form-group"><label class="form-label">Nombre</label><input type="text" id="opr-nombre" class="form-input" value="${obj?.nombre || ''}" required></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Siglas</label><input type="text" id="opr-siglas" class="form-input" value="${obj?.siglas || ''}" required></div>
          <div class="form-group"><label class="form-label">Color</label><input type="color" id="opr-color" class="form-input" value="${obj?.color || '#f59e0b'}"></div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </form>
    `;
    Modal.open(html, 'Datos del Operador');
    document.getElementById('form-opr').onsubmit = (e) => {
      e.preventDefault();
      service.save({
        operadorId: id ? parseInt(id) : null,
        nombre: document.getElementById('opr-nombre').value,
        siglas: document.getElementById('opr-siglas').value,
        color: document.getElementById('opr-color').value,
        urlIcono: ''
      });
      Modal.close();
      Toast.show('Operador guardado', 'success');
    };
  }

  _renderPuntos(container) {
    const data = PuntoService.getInstance().getAll();
    container.innerHTML = `
      <div class="page-header">
        <h2 class="page-title">Gestión de Puntos</h2>
        <button class="btn btn-primary btn-sm" id="btn-new-p">+ Nuevo Punto</button>
      </div>
      <table class="data-table">
        <thead><tr><th>Tipo</th><th>Código</th><th>Acciones</th></tr></thead>
        <tbody>
          ${data.map(p => `
            <tr>
              <td>${p.tipo}</td>
              <td>${p.codigo}</td>
              <td class="table-actions">
                <button class="btn btn-secondary btn-sm js-edit-p" data-id="${p.puntoId}">Editar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.querySelector('#btn-new-p').onclick = () => this._formPunto();
    container.querySelectorAll('.js-edit-p').forEach(btn => btn.onclick = () => this._formPunto(btn.dataset.id));
  }

  _formPunto(id = null) {
    const service = PuntoService.getInstance();
    const obj = id ? service.getAll().find(p => p.puntoId == id) : null;
    const html = `
      <form id="form-p">
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select id="p-tipo" class="form-select">
            <option value="PUERTA" ${obj?.tipo === 'PUERTA' ? 'selected' : ''}>PUERTA</option>
            <option value="VIA" ${obj?.tipo === 'VIA' ? 'selected' : ''}>VIA</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Código</label><input type="text" id="p-codigo" class="form-input" value="${obj?.codigo || ''}" required></div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </form>
    `;
    Modal.open(html, 'Datos del Punto de Acceso');
    document.getElementById('form-p').onsubmit = (e) => {
      e.preventDefault();
      service.save({
        puntoId: id ? parseInt(id) : null,
        tipo: document.getElementById('p-tipo').value,
        codigo: document.getElementById('p-codigo').value
      });
      Modal.close();
      Toast.show('Punto guardado', 'success');
    };
  }
}