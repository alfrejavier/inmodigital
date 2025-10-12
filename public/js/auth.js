/* Manejo de autenticación */
class AuthManager {
    constructor() {
        this.token = localStorage.getItem(CONFIG.TOKEN_KEY);
        this.user = this.getStoredUser();
    }

    // Obtener usuario almacenado
    getStoredUser() {
        const userStr = localStorage.getItem(CONFIG.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    // Guardar sesión
    saveSession(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    }

    // Limpiar sesión
    clearSession() {
        this.token = null;
        this.user = null;
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
    }

    // Verificar si está autenticado
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.user;
    }

    // Inicializar interfaz de autenticación
    initAuthUI() {
        const userMenu = document.getElementById('user-menu');
        const loginSection = document.getElementById('login-section');
        const usernameElement = document.getElementById('username');

        if (this.isAuthenticated()) {
            // Mostrar menú de usuario
            if (userMenu) userMenu.style.display = 'block';
            if (loginSection) loginSection.style.display = 'none';
            if (usernameElement) usernameElement.textContent = this.user.nombre_usuario;
        } else {
            // Mostrar botón de login
            if (userMenu) userMenu.style.display = 'none';
            if (loginSection) loginSection.style.display = 'block';
        }
    }
}

// Instancia global de autenticación
const auth = new AuthManager();

// Funciones globales de autenticación
function showLogin() {
    // Limpiar formulario
    Utils.clearForm('loginForm');
    Utils.hideAlert('loginError');
    
    // Mostrar modal de forma segura
    Utils.showModal('loginModal');
}

async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        Utils.showError('Por favor ingrese usuario y contraseña', 'loginError');
        return;
    }

    try {
        // Ocultar errores previos
        Utils.hideAlert('loginError');
        
        // Realizar login
        const response = await api.login(username, password);
        
        if (response.success) {
            // Guardar sesión
            auth.saveSession(response.datos.token, response.datos.usuario);
            
            // Cerrar modal de forma segura
            Utils.hideModal('loginModal');
            
            // Actualizar interfaz
            auth.initAuthUI();
            
            // Cargar datos del dashboard
            if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
            
            // Mostrar mensaje de bienvenida
            showNotification(`¡Bienvenido, ${response.datos.usuario.nombre_usuario}!`, 'success');
        } else {
            Utils.showError(response.message || 'Error de autenticación', 'loginError');
        }
    } catch (error) {
        console.error('Error en login:', error);
        Utils.showError('Error al conectar con el servidor: ' + error.message, 'loginError');
    }
}

function logout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        auth.clearSession();
        auth.initAuthUI();
        
        // Redireccionar o limpiar datos
        showSection('inicio');
        
        // Limpiar datos cargados
        document.getElementById('total-propietarios').textContent = '-';
        document.getElementById('total-clientes').textContent = '-';
        document.getElementById('total-propiedades').textContent = '-';
        document.getElementById('total-ventas').textContent = '-';
        
        showNotification('Sesión cerrada correctamente', 'info');
    }
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible position-fixed`;
    notification.style.cssText = `
        top: 80px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar autenticación
    auth.initAuthUI();
    
    // Form de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            login();
        });
    }
});