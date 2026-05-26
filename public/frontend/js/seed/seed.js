const Seed = (() => {
  function init() {
    const storage = StorageService.getInstance();
    if (storage.get('infopanel_usuarios')) return;

    const usuarios = [
      { email: 'admin@infopanel.com', password: 'admin123', rol: 'GESTOR' },
      { email: 'user@infopanel.com',  password: 'user123',  rol: 'PÚBLICO' }
    ];
    storage.set('infopanel_usuarios', usuarios);

    const operadores = [
      { operadorId: 1, nombre: 'Iberia', siglas: 'IB', color: '#d7192d', urlIcono: '✈' },
      { operadorId: 2, nombre: 'Renfe Ave', siglas: 'AVE', color: '#6e2b6e', urlIcono: '🚄' },
      { operadorId: 3, nombre: 'Lufthansa', siglas: 'LH', color: '#002f5b', urlIcono: '✈' }
    ];
    storage.set('infopanel_operadores', operadores);

    const puntos = [
      { puntoId: 1, tipo: 'PUERTA', codigo: 'T4-J45' },
      { puntoId: 2, tipo: 'PUERTA', codigo: 'T1-C12' },
      { puntoId: 3, tipo: 'VIA',    codigo: 'Vía 7' },
      { puntoId: 4, tipo: 'VIA',    codigo: 'Vía 2' }
    ];
    storage.set('infopanel_puntos', puntos);

    const hoy = new Date();
    const operaciones = [
      new Operacion({
        tipo: 'vuelo', sentido: 'salida', codigo: 'IB3120', origen: 'Madrid', destino: 'Londres',
        horaProgramada: new Date(hoy.getTime() + 3600000).toISOString(),
        horaEstimada: new Date(hoy.getTime() + 3600000).toISOString(),
        estado: 'PROGRAMADO', operadorId: 1, puntoId: 1
      }),
      new Operacion({
        tipo: 'vuelo', sentido: 'salida', codigo: 'IB1000', origen: 'Madrid', destino: 'París',
        horaProgramada: new Date(hoy.getTime() + 1800000).toISOString(),
        horaEstimada: new Date(hoy.getTime() + 1800000).toISOString(),
        estado: 'EMBARCANDO', operadorId: 1, puntoId: 1
      }),
      new Operacion({
        tipo: 'vuelo', sentido: 'salida', codigo: 'LH2500', origen: 'Madrid', destino: 'Berlín',
        horaProgramada: new Date(hoy.getTime() + 7200000).toISOString(),
        horaEstimada: new Date(hoy.getTime() + 8400000).toISOString(),
        estado: 'RETRASADO', operadorId: 3, puntoId: 2
      }),
      new Operacion({
        tipo: 'vuelo', sentido: 'salida', codigo: 'IB0500', origen: 'Madrid', destino: 'Roma',
        horaProgramada: new Date(hoy.getTime() + 900000).toISOString(),
        horaEstimada: new Date(hoy.getTime() + 900000).toISOString(),
        estado: 'CANCELADO', operadorId: 1, puntoId: 1
      }),
      new Operacion({
        tipo: 'tren', sentido: 'salida', codigo: 'AVE4567', origen: 'Madrid', destino: 'Sevilla',
        horaProgramada: new Date(hoy.getTime() + 2400000).toISOString(),
        horaEstimada: new Date(hoy.getTime() + 2400000).toISOString(),
        estado: 'PROGRAMADO', operadorId: 2, puntoId: 4
      }),
      new Operacion({
        tipo: 'vuelo', sentido: 'llegada', codigo: 'IB3333', origen: 'Nueva York', destino: 'Madrid',
        horaProgramada: new Date(hoy.getTime() - 3600000).toISOString(),
        horaEstimada: new Date(hoy.getTime() - 600000).toISOString(),
        estado: 'LLEGADO', operadorId: 1, puntoId: 1
      }),
      new Operacion({
        tipo: 'vuelo', sentido: 'llegada', codigo: 'LH2000', origen: 'Frankfurt', destino: 'Madrid',
        horaProgramada: new Date(hoy.getTime() + 3000000).toISOString(),
        horaEstimada: new Date(hoy.getTime() + 3000000).toISOString(),
        estado: 'EN_RUTA', operadorId: 3, puntoId: 2
      }),
      new Operacion({
        tipo: 'tren', sentido: 'llegada', codigo: 'AVE0312', origen: 'Sevilla', destino: 'Madrid',
        horaProgramada: new Date(hoy.getTime() - 1800000).toISOString(),
        horaEstimada: new Date(hoy.getTime() + 600000).toISOString(),
        estado: 'RETRASADO', operadorId: 2, puntoId: 3
      }),
      new Operacion({
        tipo: 'tren', sentido: 'llegada', codigo: 'AVE1122', origen: 'Barcelona', destino: 'Madrid',
        horaProgramada: new Date(hoy.getTime() + 5400000).toISOString(),
        horaEstimada: new Date(hoy.getTime() + 5400000).toISOString(),
        estado: 'PROGRAMADO', operadorId: 2, puntoId: 3
      }),
      new Operacion({
        tipo: 'vuelo', sentido: 'llegada', codigo: 'IB4444', origen: 'Tokio', destino: 'Madrid',
        horaProgramada: new Date(hoy.getTime() + 4200000).toISOString(),
        horaEstimada: new Date(hoy.getTime() + 4200000).toISOString(),
        estado: 'EN_RUTA', operadorId: 1, puntoId: 1
      })
    ];
    storage.set('infopanel_operaciones', operaciones);
  }

  return { init };
})();