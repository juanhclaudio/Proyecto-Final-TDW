class StorageService {
    static _instance = null;
    constructor() {
        if (StorageService._instance) {
            return StorageService._instance;
        }
        StorageService._instance = this;
    }

    static getInstance() {
        if (!StorageService._instance) {
            StorageService._instance = new StorageService();
        }
        return StorageService._instance;
    }

    setToken(token) {
        sessionStorage.setItem('jwt_token', token);
    }

    getToken() {
        return sessionStorage.getItem('jwt_token');
    }

    removeToken() {
        sessionStorage.removeItem('jwt_token');
    }

    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("JWT Parsing Error:", e);
            return null;
        }
    }

    getCurrentUser() {
        const token = this.getToken();
        if (!token) return null;

        const decoded = this.parseJwt(token);
        if (!decoded) return null;

        return decoded;
    }
}