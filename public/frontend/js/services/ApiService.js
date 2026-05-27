const API_BASE = '/api/v1';

class ApiService {

    static _instance = null;

    constructor() {
        if (ApiService._instance) return ApiService._instance;
        ApiService._instance = this;
    }
    static getInstance() {
        if (!ApiService._instance) new ApiService();
        return ApiService._instance;
    }
    async fetchWithAuth(endpoint, options = {}) {
        const token = StorageService.getInstance().getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = { ...options, headers };
        const response = await fetch(`${API_BASE}${endpoint}`, config);

        if (!response.ok) {
            const status = response.status;
            if (status === 401) {
                StorageService.getInstance().removeToken();
                alert("Sesión expirada o cuenta inactiva. Por favor, inicie sesión de nuevo.");
                new Router().navigate('login');
                throw new Error('401_UNAUTHORIZED');
            } else if (status === 404) {
                throw new Error('404_NOT_FOUND');
            } else if (status === 428) {
                StorageService.getInstance().removeToken();
                alert("El registro fue modificado por otra persona. Refresque la página.");
                throw new Error('428_PRECONDITION_REQUIRED');
            }
            throw new Error(`Error del servidor: ${status}`);
        }

        if (response.status === 204) return null;
        return await response.json();
    }
};