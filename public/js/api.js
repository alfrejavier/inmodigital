/* Manejo de API */
class ApiService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
    }

    // Obtener headers con autenticación
    getHeaders() {
        const token = localStorage.getItem(CONFIG.TOKEN_KEY);
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    // Realizar petición HTTP
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            console.log('API Request:', url, config);
            const response = await fetch(url, config);
            const data = await response.json();
            
            console.log('API Response:', response.status, data);

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Métodos HTTP específicos
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Verificar estado del servidor
    async checkServerStatus() {
        try {
            const response = await this.get('/health');
            return { status: 'online', data: response };
        } catch (error) {
            return { status: 'offline', error: error.message };
        }
    }

    // Métodos de autenticación
    async login(username, password) {
        return this.post('/auth/login', {
            nombre_usuario: username,
            password: password
        });
    }

    async getProfile() {
        return this.get('/auth/profile');
    }

    // Métodos de propietarios
    async getPropietarios(filters = {}) {
        let endpoint = '/propietarios';
        const params = new URLSearchParams();
        
        if (filters.search) {
            params.append('search', filters.search);
        }
        if (filters.page) {
            params.append('page', filters.page);
        }
        if (filters.limit) {
            params.append('limit', filters.limit);
        }
        
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        
        return this.get(endpoint);
    }

    async getPropietario(documento) {
        return this.get(`/propietarios/${documento}`);
    }

    async createPropietario(data) {
        return this.post('/propietarios', data);
    }

    async updatePropietario(documento, data) {
        return this.put(`/propietarios/${documento}`, data);
    }

    async deletePropietario(documento) {
        return this.delete(`/propietarios/${documento}`);
    }

    // Métodos de clientes
    async getClientes(filters = {}) {
        let endpoint = '/clientes';
        const params = new URLSearchParams();
        
        if (filters.search) {
            params.append('search', filters.search);
        }
        
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        
        return this.get(endpoint);
    }

    async getCliente(documento) {
        return this.get(`/clientes/${documento}`);
    }

    async createCliente(data) {
        return this.post('/clientes', data);
    }

    async updateCliente(documento, data) {
        return this.put(`/clientes/${documento}`, data);
    }

    async deleteCliente(documento) {
        return this.delete(`/clientes/${documento}`);
    }

    // Métodos de propiedades
    async getPropiedades(filters = {}) {
        let endpoint = '/propiedades';
        const params = new URLSearchParams();
        
        if (filters.search) {
            params.append('search', filters.search);
        }
        
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        
        return this.get(endpoint);
    }

    // Métodos de ventas
    async getVentas(filters = {}) {
        let endpoint = '/ventas';
        const params = new URLSearchParams();
        
        if (filters.search) {
            params.append('search', filters.search);
        }
        
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        
        return this.get(endpoint);
    }
}

// Instancia global de API
const api = new ApiService();