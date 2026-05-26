class StorageService {
  constructor() {
    if (StorageService._instance) return StorageService._instance;
    StorageService._instance = this;
  }

  static getInstance() {
    if (!StorageService._instance) new StorageService();
    return StorageService._instance;
  }

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error guardando ${key} en localStorage`, e);
    }
  }

  get(key) {
    const value = localStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(`Error parseando ${key} de localStorage`, e);
      return null;
    }
  }

  remove(key) {
    localStorage.removeItem(key);
  }
}