/* Aplicación principal de administración */
class AdminApp {
    constructor() {
        this.currentSection = 'inicio';
        this.init();
    }

    // Inicializar aplicación
    init() {
        // Inicializar utilidades globales
        Utils.init();
        
        this.setupEventListeners();
        this.checkServerStatus();
        
        // Cargar dashboard al inicio
        if (auth.isAuthenticated()) {
            this.loadDashboard();
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const sectionId = href.substring(1);
                    this.showSection(sectionId);
                }
            });
        });

        // Auto-refresh del dashboard cada 30 segundos
        setInterval(() => {
            if (this.currentSection === 'inicio' && auth.isAuthenticated()) {
                this.loadDashboard();
            }
        }, 30000);
    }

    // Verificar estado del servidor
    async checkServerStatus() {
        const statusElement = document.getElementById('server-status');
        const dbElement = document.getElementById('db-status');
        
        try {
            const status = await api.checkServerStatus();
            
            if (status.status === 'online') {
                if (statusElement) {
                    statusElement.innerHTML = `
                        <div class="d-flex align-items-center text-success">
                            <i class="fas fa-check-circle me-2"></i>
                            Servidor conectado
                        </div>
                    `;
                }
                
                if (dbElement && status.data && status.data.data) {
                    dbElement.innerHTML = `
                        <div class="d-flex align-items-center text-success">
                            <i class="fas fa-database me-2"></i>
                            Base de datos: ${status.data.data.totalPropietarios} propietarios
                        </div>
                    `;
                }
            } else {
                throw new Error(status.error || 'Servidor no disponible');
            }
        } catch (error) {
            if (statusElement) {
                statusElement.innerHTML = `
                    <div class="d-flex align-items-center text-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Servidor desconectado: ${error.message}
                    </div>
                `;
            }
            
            if (dbElement) {
                dbElement.innerHTML = `
                    <div class="d-flex align-items-center text-warning">
                        <i class="fas fa-database me-2"></i>
                        Base de datos: No disponible
                    </div>
                `;
            }
        }
    }

    // Cargar datos del dashboard
    async loadDashboard() {
        try {
            // Cargar contadores
            await this.loadCounters();
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    // Cargar contadores
    async loadCounters() {
        const counters = [
            { id: 'total-propietarios', endpoint: '/propietarios', defaultValue: 0 },
            { id: 'total-clientes', endpoint: '/clientes', defaultValue: 0 },
            { id: 'total-propiedades', endpoint: '/propiedades', defaultValue: 0 },
            { id: 'total-ventas', endpoint: '/ventas', defaultValue: 0 }
        ];

        for (const counter of counters) {
            try {
                const response = await api.get(counter.endpoint);
                const element = document.getElementById(counter.id);
                
                if (element) {
                    if (response.success) {
                        // Para propiedades, obtener el total de la paginación
                        if (counter.id === 'total-propiedades' && response.data?.paginacion?.total_registros !== undefined) {
                            element.textContent = response.data.paginacion.total_registros;
                        } 
                        // Para otros endpoints
                        else {
                            element.textContent = response.total || response.datos?.length || counter.defaultValue;
                        }
                    } else {
                        element.textContent = counter.defaultValue;
                    }
                }
            } catch (error) {
                console.error(`Error loading ${counter.id}:`, error);
                const element = document.getElementById(counter.id);
                if (element) {
                    element.textContent = '-';
                }
            }
        }
    }

    // Mostrar sección específica
    showSection(sectionId) {
        // Verificar autenticación para secciones protegidas
        if (sectionId !== 'inicio' && !auth.isAuthenticated()) {
            showLogin();
            return;
        }

        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('d-none');
        });

        // Mostrar sección actual
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('d-none');
            this.currentSection = sectionId;
        }

        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Cargar datos específicos de la sección
        this.loadSectionData(sectionId);
    }

    // Cargar datos específicos por sección
    async loadSectionData(sectionId) {
        switch (sectionId) {
            case 'inicio':
                await this.loadDashboard();
                break;
            case 'propietarios':
                if (typeof propietariosManager !== 'undefined') {
                    await propietariosManager.loadPropietarios();
                }
                break;
            case 'clientes':
                if (typeof clientesManager !== 'undefined') {
                    await clientesManager.loadClientes();
                }
                break;
            case 'propiedades':
                if (typeof inicializarPropiedades !== 'undefined') {
                    inicializarPropiedades();
                }
                break;
            case 'perfil':
                await this.loadProfile();
                break;
        }
    }

    // Cargar perfil del usuario
    async loadProfile() {
        const profileInfo = document.getElementById('profile-info');
        if (!profileInfo) return;

        try {
            const user = auth.getCurrentUser();
            
            if (user) {
                profileInfo.innerHTML = `
                    <div class="row">
                        <div class="col-md-6">
                            <h5>Información Personal</h5>
                            <table class="table table-borderless">
                                <tr>
                                    <td><strong>Usuario:</strong></td>
                                    <td>${user.nombre_usuario}</td>
                                </tr>
                                <tr>
                                    <td><strong>Documento:</strong></td>
                                    <td>${user.documento}</td>
                                </tr>
                                <tr>
                                    <td><strong>Rol:</strong></td>
                                    <td>
                                        <span class="badge bg-${this.getRoleBadgeClass(user.rol)}">
                                            ${this.getRoleDisplayName(user.rol)}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Estado:</strong></td>
                                    <td>
                                        <span class="badge bg-success">Activo</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h5>Actividad</h5>
                            <table class="table table-borderless">
                                <tr>
                                    <td><strong>Último acceso:</strong></td>
                                    <td>${user.ultimo_login ? Utils.formatDate(user.ultimo_login) : 'Primer acceso'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Registrado:</strong></td>
                                    <td>${user.fecha_creacion ? Utils.formatDate(user.fecha_creacion) : '-'}</td>
                                </tr>
                            </table>
                            
                            <div class="mt-4">
                                <button class="btn btn-outline-primary btn-sm" onclick="adminApp.changePassword()">
                                    <i class="fas fa-lock"></i> Cambiar Contraseña
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            profileInfo.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    Error al cargar perfil: ${error.message}
                </div>
            `;
        }
    }

    // Obtener clase CSS para badge de rol
    getRoleBadgeClass(rol) {
        const classes = {
            'admin': 'danger',
            'vendedor': 'primary',
            'propietario': 'info'
        };
        return classes[rol] || 'secondary';
    }

    // Obtener nombre para mostrar del rol
    getRoleDisplayName(rol) {
        const names = {
            'admin': 'Administrador',
            'vendedor': 'Vendedor',
            'propietario': 'Propietario'
        };
        return names[rol] || rol;
    }

    // Cambiar contraseña (placeholder)
    changePassword() {
        alert('Funcionalidad de cambio de contraseña próximamente disponible');
    }
}

// Instancia global de la aplicación
const adminApp = new AdminApp();

// Funciones globales
function showSection(sectionId) {
    adminApp.showSection(sectionId);
}

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel loaded');
    
    // Inicializar managers cuando el usuario esté autenticado
    if (auth.isAuthenticated()) {
        // Inicializar PropietariosManager si existe la clase
        if (typeof PropietariosManager !== 'undefined') {
            window.propietariosManager = new PropietariosManager();
        }
        
        // Inicializar ClientesManager si existe la clase
        if (typeof ClientesManager !== 'undefined') {
            window.clientesManager = new ClientesManager();
        }
    }
    
    // Mostrar sección inicial
    if (auth.isAuthenticated()) {
        adminApp.showSection('inicio');
    } else {
        adminApp.showSection('inicio');
    }
});

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

