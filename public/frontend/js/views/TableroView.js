class TableroView {
  constructor() {
    this._container = null;
    this._searchQuery = '';
    this._filterStatus = '';
    this._sortCriteria = 'horaProgramada';
    this._refreshInterval = null;
  }

  render(container) {
    this._container = container;
    this._container.innerHTML = `
      <header class="page-header">
        <div>
          <h1 class="page-title">Tablero de Operaciones</h1>
          <div class="refresh-indicator">
            <span class="refresh-dot"></span>
            <span>Actualización automática: 60s</span>
          </div>
        </div>
        <div class="clock-display">
          <div id="clock-time">00:00:00</div>
          <div id="clock-date" class="clock-date">---</div>
        </div>
      </header>

      <section class="toolbar">
        <div class="search-input-wrapper">
          <span class="search-input-icon">🔍</span>
          <input type="text" id="search-code" class="form-input search-input" placeholder="Buscar por código (ej. IB1234)..." value="${this._searchQuery}">
        </div>
        <div class="filter-group">
          <select id="filter-status" class="form-select">
            <option value="">Todos los estados</option>
            <option value="PROGRAMADO">PROGRAMADO</option>
            <option value="EMBARCANDO">EMBARCANDO</option>
            <option value="RETRASADO">RETRASADO</option>
            <option value="CANCELADO">CANCELADO</option>
            <option value="EN_RUTA">EN_RUTA</option>
            <option value="LLEGADO">LLEGADO</option>
          </select>
        </div>
        <div class="sort-group">
          <select id="sort-criteria" class="form-select">
            <option value="horaProgramada">Ordenar por Hora</option>
            <option value="codigo">Ordenar por Código</option>
            <option value="origen">Ordenar por Origen</option>
            <option value="destino">Ordenar por Destino</option>
          </select>
        </div>
      </section>

      <div class="tablero-panels">
        <article class="panel">
          <div class="panel-header">
            <h2 class="panel-title">
              <span class="panel-title-icon">🛫</span> Salidas
            </h2>
          </div>
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Código</th>
                  <th>Destino</th>
                  <th>Operador</th>
                  <th>Puerta/Vía</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody id="tbody-salidas"></tbody>
            </table>
          </div>
        </article>

        <article class="panel">
          <div class="panel-header">
            <h2 class="panel-title">
              <span class="panel-title-icon">🛬</span> Llegadas
            </h2>
          </div>
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Código</th>
                  <th>Origen</th>
                  <th>Operador</th>
                  <th>Puerta/Vía</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody id="tbody-llegadas"></tbody>
            </table>
          </div>
        </article>
      </div>
    `;

    this._initEvents();
    this._loadData();
    this._startAutoRefresh();
  }

  _initEvents() {
    const inputSearch = this._container.querySelector('#search-code');
    const selectStatus = this._container.querySelector('#filter-status');
    const selectSort = this._container.querySelector('#sort-criteria');

    inputSearch.addEventListener('input', (e) => {
      this._searchQuery = e.target.value.trim().toUpperCase();
      this._loadData();
    });

    selectStatus.addEventListener('change', (e) => {
      this._filterStatus = e.target.value;
      this._loadData();
    });

    selectSort.addEventListener('change', (e) => {
      this._sortCriteria = e.target.value;
      this._loadData();
    });
  }

  _startAutoRefresh() {
    if (this._refreshInterval) clearInterval(this._refreshInterval);
    this._refreshInterval = setInterval(() => {
      this._loadData();
    }, 60000);
  }

  _loadData() {
    const operaciones = OperacionService.getInstance().getAll();
    const operadores = OperadorService.getInstance().getAll();
    const puntos = PuntoService.getInstance().getAll();

    let data = operaciones.filter(op => {
      const matchSearch = op.codigo.toUpperCase().includes(this._searchQuery);
      const matchStatus = this._filterStatus === '' || op.estado === this._filterStatus;
      return matchSearch && matchStatus;
    });

    data.sort((a, b) => {
      if (a[this._sortCriteria] < b[this._sortCriteria]) return -1;
      if (a[this._sortCriteria] > b[this._sortCriteria]) return 1;
      return 0;
    });

    const salidas = data.filter(op => op.sentido === 'salida');
    const llegadas = data.filter(op => op.sentido === 'llegada');

    this._renderRows(this._container.querySelector('#tbody-salidas'), salidas, operadores, puntos, 'destino');
    this._renderRows(this._container.querySelector('#tbody-llegadas'), llegadas, operadores, puntos, 'origen');
  }

  _renderRows(tbody, items, operadores, puntos, cityField) {
    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="table-empty">No hay operaciones que coincidan</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(op => {
      const operador = operadores.find(o => o.operadorId == op.operadorId) || {};
      const punto = puntos.find(p => p.puntoId == op.puntoId) || {};
      const horaP = new Date(op.horaProgramada).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const horaE = new Date(op.horaEstimada).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const isDelayed = op.estado === 'RETRASADO';

      return `
        <tr data-id="${op.operacionId}">
          <td>
            <div class="op-time">
              <span class="op-time-programada">${horaP}</span>
              <span class="op-time-estimada ${isDelayed ? 'delayed' : ''}">${horaE}</span>
            </div>
          </td>
          <td><span class="op-code">${op.codigo}</span></td>
          <td>${op[cityField]}</td>
          <td>
            <div class="op-operator">
              <span class="op-operator-dot" style="background-color: ${operador.color || 'var(--color-border)'}"></span>
              <span>${operador.siglas || '---'}</span>
            </div>
          </td>
          <td>${punto.codigo || '---'}</td>
          <td><span class="badge badge-${op.estado}">${op.estado}</span></td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.addEventListener('click', () => this._showDetail(tr.dataset.id));
    });
  }

  _showDetail(id) {
    const op = OperacionService.getInstance().getAll().find(o => o.operacionId === id);
    const operador = OperadorService.getInstance().getAll().find(o => o.operadorId == op.operadorId) || {};
    const punto = PuntoService.getInstance().getAll().find(p => p.puntoId == op.puntoId) || {};

    const html = `
      <div class="detail-grid">
        <div class="detail-field">
          <span class="detail-label">Identificador (ULID)</span>
          <span class="detail-value">${op.operacionId}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Tipo de Transporte</span>
          <span class="detail-value uppercase">${op.tipo}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Código</span>
          <span class="detail-value text-accent">${op.codigo}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Estado Actual</span>
          <span class="detail-value"><span class="badge badge-${op.estado}">${op.estado}</span></span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Origen</span>
          <span class="detail-value">${op.origen}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Destino</span>
          <span class="detail-value">${op.destino}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Hora Programada</span>
          <span class="detail-value">${new Date(op.horaProgramada).toLocaleString()}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Hora Estimada</span>
          <span class="detail-value">${new Date(op.horaEstimada).toLocaleString()}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Operador</span>
          <span class="detail-value">${operador.nombre} (${operador.siglas})</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Punto de Acceso</span>
          <span class="detail-value">${punto.tipo}: ${punto.codigo}</span>
        </div>
      </div>
    `;

    Modal.open(html, `Detalle de Operación: ${op.codigo}`);
  }
}