/**
 * Utilidades generales para la aplicación
 */
class Utils {
    /**
     * Mostrar alerta usando SweetAlert2 con tema dark
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de alerta: 'success', 'danger', 'warning', 'info'
     * @param {number} duration - Duración en milisegundos (opcional, por defecto 3000)
     */
    static showAlert(message, type = 'info', duration = 3000) {
        console.log('🔔 Utils.showAlert ejecutándose:', { message, type, duration });
        console.log('🍭 SweetAlert2 disponible:', typeof Swal !== 'undefined');
        
        try {
            // Verificar si SweetAlert2 está disponible
            if (typeof Swal === 'undefined') {
                console.error('❌ SweetAlert2 no está disponible, usando alert nativo');
                alert(`${type.toUpperCase()}: ${message}`);
                return;
            }
            // Mapear tipos de Bootstrap a SweetAlert2
            const swalTypes = {
                'success': 'success',
                'danger': 'error',
                'warning': 'warning',
                'info': 'info'
            };
            
            const swalType = swalTypes[type] || 'info';
            
            Swal.fire({
                title: this.getAlertTitle(type),
                text: message,
                icon: swalType,
                timer: duration,
                timerProgressBar: true,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
                background: '#1a1a1a',
                color: '#ffffff',
                customClass: {
                    popup: 'swal-dark-theme'
                },
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });
            
        } catch (error) {
            console.error('Error en showAlert:', error);
            // Fallback: usar alert nativo
            alert(message);
        }
    }

    /**
     * Obtener título según el tipo de alerta
     * @param {string} type - Tipo de alerta
     * @returns {string} - Título de la alerta
     */
    static getAlertTitle(type) {
        const titles = {
            'success': '¡Éxito!',
            'danger': '¡Error!',
            'warning': '¡Advertencia!',
            'info': 'Información'
        };
        return titles[type] || titles['info'];
    }

    /**
     * Obtener icono según el tipo de alerta (para compatibilidad)
     * @param {string} type - Tipo de alerta
     * @returns {string} - HTML del icono
     */
    static getAlertIcon(type) {
        const icons = {
            'success': '<i class="fas fa-check-circle"></i>',
            'danger': '<i class="fas fa-exclamation-triangle"></i>',
            'warning': '<i class="fas fa-exclamation-circle"></i>',
            'info': '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons['info'];
    }

    /**
     * Mostrar diálogo de confirmación (alias para compatibilidad)
     * @param {string} title - Título del modal
     * @param {string} message - Mensaje del modal
     * @param {string} confirmText - Texto del botón de confirmación
     * @param {string} cancelText - Texto del botón de cancelación
     * @returns {Promise<boolean>} - true si se confirma, false si se cancela
     */
    static confirmDialog(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
        return this.showConfirmModal(title, message, confirmText, cancelText);
    }

    /**
     * Mostrar modal de confirmación usando SweetAlert2 con tema dark
     * @param {string} title - Título del modal
     * @param {string} message - Mensaje del modal
     * @param {string} confirmText - Texto del botón de confirmación
     * @param {string} cancelText - Texto del botón de cancelación
     * @returns {Promise<boolean>} - true si se confirma, false si se cancela
     */
    static showConfirmModal(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
        return new Promise((resolve) => {
            try {
                // Verificar si SweetAlert2 está disponible
                if (typeof Swal === 'undefined') {
                    console.error('❌ SweetAlert2 no está disponible para confirmación, usando confirm nativo');
                    resolve(confirm(message));
                    return;
                }
                Swal.fire({
                    title: title,
                    text: message,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: confirmText,
                    cancelButtonText: cancelText,
                    background: '#1a1a1a',
                    color: '#ffffff',
                    customClass: {
                        popup: 'swal-dark-theme',
                        confirmButton: 'btn btn-danger me-2',
                        cancelButton: 'btn btn-secondary'
                    },
                    buttonsStyling: false,
                    reverseButtons: true,
                    focusConfirm: false,
                    focusCancel: true
                }).then((result) => {
                    resolve(result.isConfirmed);
                });

            } catch (error) {
                console.error('Error en showConfirmModal:', error);
                // Fallback: usar confirm nativo
                resolve(confirm(message));
            }
        });
    }

    /**
     * Formatear número como moneda
     * @param {number} amount - Cantidad a formatear
     * @param {string} currency - Código de moneda (por defecto COP)
     * @returns {string} - Número formateado como moneda
     */
    static formatCurrency(amount, currency = 'COP') {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Formatear fecha
     * @param {Date|string} date - Fecha a formatear
     * @param {Object} options - Opciones de formato
     * @returns {string} - Fecha formateada
     */
    static formatDate(date, options = { year: 'numeric', month: '2-digit', day: '2-digit' }) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('es-CO', options).format(dateObj);
    }

    /**
     * Debounce function
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en milisegundos
     * @returns {Function} - Función con debounce aplicado
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Validar email
     * @param {string} email - Email a validar
     * @returns {boolean} - true si es válido, false si no
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validar número de documento
     * @param {string} documento - Documento a validar
     * @returns {boolean} - true si es válido, false si no
     */
    static isValidDocumento(documento) {
        const docRegex = /^\d+$/;
        return docRegex.test(documento) && parseInt(documento) > 0;
    }

    /**
     * Capitalizar primera letra
     * @param {string} str - String a capitalizar
     * @returns {string} - String capitalizado
     */
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Limpiar HTML de un string
     * @param {string} str - String a limpiar
     * @returns {string} - String sin HTML
     */
    static stripHtml(str) {
        const doc = new DOMParser().parseFromString(str, 'text/html');
        return doc.body.textContent || '';
    }

    /**
     * Crear loader/spinner
     * @param {string} containerId - ID del contenedor donde mostrar el loader
     */
    static showLoader(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="d-flex justify-content-center align-items-center p-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <span class="ms-2">Cargando...</span>
                </div>
            `;
        }
    }

    /**
     * Ocultar loader
     * @param {string} containerId - ID del contenedor del loader
     */
    static hideLoader(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    }

    /**
     * Mostrar loader (alias para showLoader)
     * @param {string} containerId - ID del contenedor donde mostrar el loader
     */
    static showLoading(containerId) {
        this.showLoader(containerId);
    }

    /**
     * Mostrar modal genérico
     * @param {string} titleOrModalId - Título del modal o ID del modal existente
     * @param {string} content - Contenido HTML del modal (opcional si es ID)
     * @param {string} size - Tamaño del modal: 'sm', 'lg', 'xl' o '' para normal
     */
    static showModal(titleOrModalId, content, size = '') {
        // Si no hay contenido, asumimos que es un ID de modal existente
        if (!content && typeof titleOrModalId === 'string') {
            const existingModal = document.getElementById(titleOrModalId);
            if (existingModal) {
                const modal = new bootstrap.Modal(existingModal);
                modal.show();
                return modal;
            } else {
                console.error(`Modal con ID "${titleOrModalId}" no encontrado`);
                return null;
            }
        }

        // Crear nuevo modal con título y contenido
        const modalId = 'genericModal-' + Date.now();
        const sizeClass = size ? `modal-${size}` : '';
        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog ${sizeClass}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${titleOrModalId}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modalElement = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalElement);

        // Limpiar el modal cuando se cierre
        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
        });

        modal.show();
        return modal;
    }
}

// Hacer disponible globalmente
window.Utils = Utils;

// Debug: Confirmar que Utils se ha cargado
console.log('✅ Utils.js cargado correctamente');
console.log('Utils object:', Utils);
console.log('Utils.showAlert type:', typeof Utils.showAlert);

// Verificar que Utils esté disponible globalmente
if (typeof window.Utils === 'undefined') {
    console.error('❌ ERROR: Utils no está disponible globalmente');
} else {
    console.log('✅ Utils disponible globalmente como window.Utils');
}