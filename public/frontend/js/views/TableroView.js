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
          <input type="text" id="search-code" class="form-input search-input" placeholder="Buscar por código..." value="${this._searchQuery}">
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
          <div class="panel-header"><h2 class="panel-title">🛫 Salidas</h2></div>
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead><tr><th>Hora</th><th>Código</th><th>Destino</th><th>Operador</th><th>Puerta/Vía</th><th>Estado</th></tr></thead>
              <tbody id="tbody-salidas"></tbody>
            </table>
          </div>
        </article>

        <article class="panel">
          <div class="panel-header"><h2 class="panel-title">🛬 Llegadas</h2></div>
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead><tr><th>Hora</th><th>Código</th><th>Origen</th><th>Operador</th><th>Puerta/Vía</th><th>Estado</th></tr></thead>
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

    inputSearch.addEventListener('input', (e) => { this._searchQuery = e.target.value.trim().toUpperCase(); this._loadData(); });
    selectStatus.addEventListener('change', (e) => { this._filterStatus = e.target.value; this._loadData(); });
    selectSort.addEventListener('change', (e) => { this._sortCriteria = e.target.value; this._loadData(); });
  }

  _startAutoRefresh() {
    if (this._refreshInterval) clearInterval(this._refreshInterval);
    this._refreshInterval = setInterval(() => {
      if (!document.getElementById('tbody-salidas')) {
        clearInterval(this._refreshInterval);
        return;
      }
      this._loadData();
    }, 60000);
  }

  async _loadData() {
    try {
      const rawOperaciones = await OperacionService.getInstance().getAll();
      const rawOperadores = await OperadorService.getInstance().getAll();
      const rawPuntos = await PuntoService.getInstance().getAll();
      const operaciones = rawOperaciones.map(item => item.operacion || item);
      const operadores = rawOperadores.map(item => item.operador || item);
      const puntos = rawPuntos.map(item => item.punto || item);

      let data = operaciones.filter(op => {
        const matchSearch = op.codigo?.toUpperCase().includes(this._searchQuery);
        const estadoNormalizado = op.estado ? op.estado.toUpperCase() : '';
        const filtroNormalizado = this._filterStatus ? this._filterStatus.toUpperCase() : '';
        const matchStatus = this._filterStatus === '' || estadoNormalizado === filtroNormalizado;
        return matchSearch && matchStatus;
      });

      data.sort((a, b) => {
        if (a[this._sortCriteria] < b[this._sortCriteria]) return -1;
        if (a[this._sortCriteria] > b[this._sortCriteria]) return 1;
        return 0;
      });

      const salidas = data.filter(op => op.sentido && op.sentido.toLowerCase() === 'salida');
      const llegadas = data.filter(op => op.sentido && op.sentido.toLowerCase() === 'llegada');

      const tbodySalidas = document.getElementById('tbody-salidas');
      const tbodyLlegadas = document.getElementById('tbody-llegadas');
      
      if (tbodySalidas) this._renderRows(tbodySalidas, salidas, operadores, puntos, 'destino');
      if (tbodyLlegadas) this._renderRows(tbodyLlegadas, llegadas, operadores, puntos, 'origen');
    } catch (error) {
      console.error("Error al cargar el tablero:", error);
    }
  }

  async _showDetail(id) {
    const rawOps = await OperacionService.getInstance().getAll();
    const operaciones = rawOps.map(item => item.operacion || item);
    
    const op = operaciones.find(o => o.operacionId == id || o.id == id);
    if (!op) return;

    let opId = (typeof op.operador === 'object') ? op.operador.id : op.operadorId;
    let ptId = (typeof op.punto === 'object') ? (op.punto.puntoId || op.punto.id) : op.puntoId;

    const rawOperadores = await OperadorService.getInstance().getAll();
    const rawPuntos = await PuntoService.getInstance().getAll();
    
    const operadores = rawOperadores.map(item => item.operador || item);
    const puntos = rawPuntos.map(item => item.punto || item);

    const operador = operadores.find(o => o.id == opId || o.operadorId == opId) || {};
    const punto = puntos.find(p => p.puntoId == ptId || p.id == ptId) || {};

    const html = `
      <div class="detail-grid">
        <div class="detail-field"><span class="detail-label">Identificador</span><span class="detail-value">${op.id || op.operacionId}</span></div>
        <div class="detail-field"><span class="detail-label">Tipo</span><span class="detail-value uppercase">${op.tipo}</span></div>
        <div class="detail-field"><span class="detail-label">Código</span><span class="detail-value text-accent">${op.codigo}</span></div>
        <div class="detail-field"><span class="detail-label">Estado</span><span class="detail-value"><span class="badge badge-${op.estado.toUpperCase()}">${op.estado}</span></span></div>
        <div class="detail-field"><span class="detail-label">Origen</span><span class="detail-value">${op.origen}</span></div>
        <div class="detail-field"><span class="detail-label">Destino</span><span class="detail-value">${op.destino}</span></div>
        <div class="detail-field"><span class="detail-label">Hora Programada</span><span class="detail-value">${new Date(op.horaProgramada).toLocaleString()}</span></div>
        <div class="detail-field"><span class="detail-label">Hora Estimada</span><span class="detail-value">${new Date(op.horaEstimada).toLocaleString()}</span></div>
        <div class="detail-field"><span class="detail-label">Operador</span><span class="detail-value">${operador.nombre || '---'} (${operador.siglas || '---'})</span></div>
        <div class="detail-field"><span class="detail-label">Punto de Acceso</span><span class="detail-value">${punto.tipo || '---'}: ${punto.codigo || '---'}</span></div>
      </div>
    `;

    Modal.open(html, `Detalle de Operación: ${op.codigo}`);
  }

  _renderRows(tbody, items, operadores, puntos, cityField) {
    if (!tbody) {
      console.warn("El cuerpo de la tabla (tbody) no existe en el DOM actual.");
      return;
    }
    
    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="table-empty">No hay operaciones que coincidan</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(op => {
      const innerOp = op.operador?.operador || op.operador || {};
      const innerPt = op.punto?.punto || op.punto || {};
      
      let opId = innerOp.id || op.operadorId;
      let ptId = innerPt.puntoId || innerPt.id || op.puntoId;

      const operador = operadores.find(o => o.id == opId || o.operadorId == opId) || {};
      const punto = puntos.find(p => p.puntoId == ptId || p.id == ptId) || {};
      
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
          <td><span class="badge badge-${op.estado.toUpperCase()}">${op.estado}</span></td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.addEventListener('click', () => this._showDetail(tr.dataset.id));
    });
  }

  async _showDetail(id) {
    const rawOps = await OperacionService.getInstance().getAll();
    const operaciones = rawOps.map(item => item.operacion || item);
    const op = operaciones.find(o => o.operacionId === id || o.id === id);
    if (!op) return;

    const innerOp = op.operador?.operador || op.operador || {};
    const innerPt = op.punto?.punto || op.punto || {};
      
    let opId = innerOp.id || op.operadorId;
    let ptId = innerPt.puntoId || innerPt.id || op.puntoId;

    const rawOperadores = await OperadorService.getInstance().getAll();
    const operadores = rawOperadores.map(item => item.operador || item);
    
    const rawPuntos = await PuntoService.getInstance().getAll();
    const puntos = rawPuntos.map(item => item.punto || item);
    
    const operador = operadores.find(o => o.id == opId || o.operadorId == opId) || {};
    const punto = puntos.find(p => p.puntoId == ptId || p.id == ptId) || {};

    const html = `
      <div class="detail-grid">
        <div class="detail-field"><span class="detail-label">Identificador</span><span class="detail-value">${op.operacionId}</span></div>
        <div class="detail-field"><span class="detail-label">Tipo</span><span class="detail-value uppercase">${op.tipo}</span></div>
        <div class="detail-field"><span class="detail-label">Código</span><span class="detail-value text-accent">${op.codigo}</span></div>
        <div class="detail-field"><span class="detail-label">Estado</span><span class="detail-value"><span class="badge badge-${op.estado.toUpperCase()}">${op.estado}</span></span></div>
        <div class="detail-field"><span class="detail-label">Origen</span><span class="detail-value">${op.origen}</span></div>
        <div class="detail-field"><span class="detail-label">Destino</span><span class="detail-value">${op.destino}</span></div>
        <div class="detail-field"><span class="detail-label">Hora Programada</span><span class="detail-value">${new Date(op.horaProgramada).toLocaleString()}</span></div>
        <div class="detail-field"><span class="detail-label">Hora Estimada</span><span class="detail-value">${new Date(op.horaEstimada).toLocaleString()}</span></div>
        <div class="detail-field"><span class="detail-label">Operador</span><span class="detail-value">${operador.nombre || '---'} (${operador.siglas || '---'})</span></div>
        <div class="detail-field"><span class="detail-label">Punto de Acceso</span><span class="detail-value">${punto.tipo || '---'}: ${punto.codigo || '---'}</span></div>
      </div>
    `;

    Modal.open(html, `Detalle de Operación: ${op.codigo}`);
  }
}