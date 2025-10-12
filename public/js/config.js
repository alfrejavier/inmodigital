/* Configuración global de la aplicación */
const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api',
    TOKEN_KEY: 'inmobiliaria_token',
    USER_KEY: 'inmobiliaria_user'
};

/* Utilidades globales */
const Utils = {
    // Cache para instancias de modales
    modals: {},

    // Obtener o crear instancia de modal
    getModal(modalId) {
        if (!this.modals[modalId]) {
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                this.modals[modalId] = new bootstrap.Modal(modalElement, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                });
                
                // Limpiar backdrop cuando se cierre el modal
                modalElement.addEventListener('hidden.bs.modal', () => {
                    this.cleanupModalBackdrops();
                });
            }
        }
        return this.modals[modalId];
    },

    // Mostrar modal de forma segura
    showModal(modalId) {
        this.cleanupModalBackdrops();
        const modal = this.getModal(modalId);
        if (modal) {
            modal.show();
        }
    },

    // Ocultar modal de forma segura
    hideModal(modalId) {
        const modal = this.modals[modalId];
        if (modal) {
            modal.hide();
        }
        this.cleanupModalBackdrops();
    },

    // Limpiar backdrops huérfanos
    cleanupModalBackdrops() {
        // Remover todos los backdrops huérfanos
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            if (!backdrop.parentElement.querySelector('.modal.show')) {
                backdrop.remove();
            }
        });
        
        // Restaurar scroll del body si no hay modales activos
        const activeModals = document.querySelectorAll('.modal.show');
        if (activeModals.length === 0) {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    },

    // Inicializar utilidades y limpiar estado
    init() {
        // Limpiar cualquier estado residual de modales
        this.cleanupModalBackdrops();
        
        // Agregar listener global para ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cleanupModalBackdrops();
            }
        });
        
        // Limpiar al cambiar de página (para SPAs)
        window.addEventListener('beforeunload', () => {
            this.cleanupModalBackdrops();
        });
        
        // Exponer función de emergencia globalmente
        window.fixModals = () => {
            this.cleanupModalBackdrops();
            console.log('✅ Modales limpiados');
        };
    },

    // Mostrar loading en un elemento
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border" role="status"></div>
                    <p>Cargando...</p>
                </div>
            `;
        }
    },

    // Ocultar loading
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    },

    // Mostrar error
    showError(message, elementId = null) {
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.className = 'alert alert-danger';
                element.textContent = message;
                element.style.display = 'block';
            }
        } else {
            alert('Error: ' + message);
        }
    },

    // Mostrar éxito
    showSuccess(message, elementId = null) {
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.className = 'alert alert-success';
                element.textContent = message;
                element.style.display = 'block';
            }
        }
    },

    // Ocultar alertas
    hideAlert(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    },

    // Formatear fecha
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Validar email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Limpiar formulario
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }
};