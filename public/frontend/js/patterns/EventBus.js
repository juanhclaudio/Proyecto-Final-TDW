class EventBus {
  constructor() {
    if (EventBus._instance) return EventBus._instance;
    EventBus._instance = this;
    this._listeners = new Map();
  }

  static getInstance() {
    if (!EventBus._instance) new EventBus();
    return EventBus._instance;
  }

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(callback);

    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this._listeners.has(event)) return;
    const filtered = this._listeners.get(event).filter(cb => cb !== callback);
    this._listeners.set(event, filtered);
  }

  emit(event, data) {
    if (!this._listeners.has(event)) return;
    this._listeners.get(event).forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[EventBus] Error en listener de '${event}':`, err);
      }
    });
  }

  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}
