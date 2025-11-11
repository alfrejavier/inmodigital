/**
 * Gestor de Clientes - Frontend
 * Maneja todas las operaciones CRUD de clientes con búsqueda en tiempo real
 */
class ClientesManager {
    constructor() {
        this.clientes = [];
        this.isLoading = false;
        this.searchTimeout = null; // Para debounce de búsqueda
        this.currentClienteId = null; // Para edición
        this.init();
    }

    /**
     * Inicializar el manager
     */
    async init() {
        try {
            await this.loadClientes();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error al inicializar ClientesManager:', error);
            Utils.showAlert('Error al inicializar la gestión de clientes', 'danger');
        }
    }

    /**
     * Función para resaltar términos de búsqueda
     */
    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm || !text) return text;
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.toString().replace(regex, '<mark class="bg-warning">$1</mark>');
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Búsqueda en tiempo real
        const searchInput = document.getElementById('search-clientes');
        if (searchInput) {
            // Búsqueda mientras se escribe (debounce)
            searchInput.addEventListener('input', () => {
                this.searchClientesRealTime();
            });

            // Búsqueda al presionar Enter
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchClientes();
                }
            });

            // Limpiar búsqueda con Escape
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.target.value = '';
                    this.clearSearch();
                }
            });
        }

        return true;
    }

    /**
     * Cargar todos los clientes
     */
    async loadClientes(filters = {}) {
        // Evitar cargas múltiples simultáneas
        if (this.isLoading) {
            return false;
        }

        try {
            this.isLoading = true;
            Utils.showLoading('clientes-loading');

            // Construir parámetros de consulta
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    queryParams.append(key, filters[key]);
                }
            });

            const response = await api.get(`/clientes?${queryParams.toString()}`);
            
            if (response.success) {
                this.clientes = response.data || [];
                this.renderClientes();
                this.updateClientesCount();
            } else {
                throw new Error(response.message || 'Error al cargar clientes');
            }

        } catch (error) {
            console.error('Error al cargar clientes:', error);
            Utils.showAlert(`Error al cargar clientes: ${error.message}`, 'danger');
            
            // En caso de error, inicializar array vacío
            this.clientes = [];
            this.renderClientes();
            
            // Actualizar contador a 0
            const totalElement = document.getElementById('total-clientes');
            if (totalElement) {
                totalElement.textContent = '0';
            }
        } finally {
            this.isLoading = false;
            Utils.hideLoading('clientes-loading');
            const container = document.getElementById('clientes-container');
            if (container) container.style.display = 'block';
        }
    }

    /**
     * Renderizar lista de clientes
     */
    renderClientes() {
        const tableBody = document.getElementById('clientes-table');
        if (!tableBody) return;

        // Verificar que clientes sea un array válido
        if (!Array.isArray(this.clientes)) {
            console.warn('clientes no es un array válido, inicializando como array vacío');
            this.clientes = [];
        }

        const searchInput = document.getElementById('search-clientes');
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        
        // Filtrar clientes si hay término de búsqueda
        let clientesFiltrados = this.clientes;
        
        if (searchTerm && searchTerm.length > 0) {
            const termino = searchTerm.toLowerCase();
            clientesFiltrados = this.clientes.filter(cliente => {
                const nombre = (cliente.nombre || '').toLowerCase();
                const apellido = (cliente.apellido || '').toLowerCase();
                const documento = String(cliente.documento || '').toLowerCase();
                const cel = (cliente.cel || '').toLowerCase();
                const correo = (cliente.correo || '').toLowerCase();
                
                return nombre.includes(termino) || 
                       apellido.includes(termino) ||
                       documento.includes(termino) || 
                       cel.includes(termino) ||
                       correo.includes(termino);
            });
        }

        if (clientesFiltrados.length === 0) {
            const mensaje = searchTerm ? 
                `<i class="fas fa-search"></i><br>No se encontraron resultados para "${searchTerm}"<br><small>Intenta con otro término de búsqueda</small>` :
                `<i class="fas fa-inbox"></i><br>No hay clientes registrados<br><small>Haz clic en "Nuevo Cliente" para agregar uno</small>`;
                
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        ${mensaje}
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = clientesFiltrados.map(cliente => {
            // Aplicar resaltado si hay término de búsqueda
            const documento = searchTerm ? this.highlightSearchTerm(String(cliente.documento || ''), searchTerm) : cliente.documento;
            const nombre = searchTerm ? this.highlightSearchTerm(cliente.nombre || '', searchTerm) : cliente.nombre;
            const apellido = cliente.apellido && searchTerm ? this.highlightSearchTerm(cliente.apellido, searchTerm) : (cliente.apellido || '');
            const cel = cliente.cel && searchTerm ? this.highlightSearchTerm(cliente.cel, searchTerm) : (cliente.cel || '-');
            const correo = cliente.correo && searchTerm ? this.highlightSearchTerm(cliente.correo, searchTerm) : (cliente.correo || '-');
            
            const nombreCompleto = `${nombre} ${apellido}`.trim();
            
            return `
            <tr>
                <td>
                    <strong>${documento}</strong>
                </td>
                <td>
                    <strong>${nombreCompleto}</strong>
                </td>
                <td>
                    ${cel !== '-' ? `<i class="fas fa-mobile"></i> ${cel}` : '<span class="text-muted">-</span>'}
                </td>
                <td>
                    ${correo !== '-' ? `<a href="mailto:${cliente.correo}">${correo}</a>` : '<span class="text-muted">-</span>'}
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary" onclick="clientesManager.editCliente('${cliente.documento}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-outline-info" onclick="clientesManager.viewCliente('${cliente.documento}')" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger" onclick="clientesManager.deleteCliente('${cliente.documento}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
        
        // Actualizar contador con los resultados filtrados
        const totalElement = document.getElementById('total-clientes');
        if (totalElement) {
            const count = clientesFiltrados.length;
            totalElement.textContent = count.toString();
            
            // Agregar texto descriptivo si hay filtro activo
            const countContainer = totalElement.parentElement;
            if (countContainer && searchTerm) {
                const totalOriginal = this.clientes.length;
                if (count !== totalOriginal) {
                    countContainer.innerHTML = `<strong id="total-clientes">${count}</strong> de ${totalOriginal} clientes`;
                } else {
                    countContainer.innerHTML = `<strong id="total-clientes">${count}</strong> clientes`;
                }
            }
        }
    }

    /**
     * Buscar clientes (manual - botón)
     */
    async searchClientes() {
        const searchInput = document.getElementById('search-clientes');
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        
        await this.loadClientes({ search: searchTerm });
    }

    /**
     * Búsqueda en tiempo real con debounce
     */
    searchClientesRealTime() {
        // Limpiar timeout anterior
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Establecer nuevo timeout
        this.searchTimeout = setTimeout(() => {
            this.renderClientes(); // Solo re-renderizar, no hacer nueva consulta
        }, 300); // 300ms de delay
    }

    /**
     * Limpiar búsqueda
     */
    clearSearch() {
        const searchInput = document.getElementById('search-clientes');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Limpiar timeout si existe
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        this.renderClientes();
    }

    /**
     * Actualizar contador de clientes
     */
    updateClientesCount() {
        const totalElement = document.getElementById('total-clientes');
        if (totalElement && Array.isArray(this.clientes)) {
            totalElement.textContent = this.clientes.length.toString();
        }
    }

    /**
     * Mostrar formulario para nuevo cliente
     */
    showNewClienteForm() {
        this.currentClienteId = null;
        this.clearForm();
        
        // Cambiar título del modal
        const modalTitle = document.getElementById('clienteModalTitle');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Nuevo Cliente';
        }

        // Cambiar texto del botón
        const saveBtn = document.getElementById('save-btn-text');
        if (saveBtn) {
            saveBtn.textContent = 'Guardar';
        }

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
        modal.show();
    }

    /**
     * Limpiar formulario
     */
    clearForm() {
        const form = document.getElementById('clienteForm');
        if (form) {
            form.reset();
        }

        // Habilitar campo documento (en caso de que esté deshabilitado por edición)
        const documentoField = document.getElementById('documento');
        if (documentoField) {
            documentoField.readOnly = false;
        }

        // Limpiar mensajes de error y éxito
        const errorDiv = document.getElementById('clienteError');
        const successDiv = document.getElementById('clienteSuccess');
        
        if (errorDiv) {
            errorDiv.classList.add('d-none');
            errorDiv.textContent = '';
        }
        
        if (successDiv) {
            successDiv.classList.add('d-none');
            successDiv.textContent = '';
        }
    }

    /**
     * Guardar cliente (crear o actualizar)
     */
    async saveCliente() {
        try {
            // Obtener datos del formulario
            const formData = new FormData(document.getElementById('clienteForm'));
            const clienteData = {
                documento: formData.get('documento'),
                nombre: formData.get('nombre'),
                apellido: formData.get('apellido'),
                cel: formData.get('cel'),
                correo: formData.get('correo')
            };

            // Limpiar mensajes anteriores
            this.clearMessages();

            let response;
            if (this.currentClienteId) {
                // Actualizar cliente existente
                response = await api.put(`/clientes/${this.currentClienteId}`, clienteData);
            } else {
                // Crear nuevo cliente
                response = await api.post('/clientes', clienteData);
            }

            if (response.success) {
                const action = this.currentClienteId ? 'actualizado' : 'creado';
                
                // Debug: Verificar que Utils esté disponible
                console.log('Utils disponible:', typeof Utils);
                console.log('Utils.showAlert disponible:', typeof Utils.showAlert);
                
                try {
                    Utils.showAlert(`Cliente ${action} exitosamente`, 'success');
                } catch (alertError) {
                    console.error('Error con Utils.showAlert:', alertError);
                    // Fallback: usar alert nativo
                    alert(`Cliente ${action} exitosamente`);
                }
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('clienteModal'));
                modal.hide();
                
                // Recargar lista
                await this.loadClientes();
            } else {
                throw new Error(response.message || 'Error al guardar cliente');
            }

        } catch (error) {
            console.error('Error al guardar cliente:', error);
            this.showError(error.message);
        }
    }

    /**
     * Editar cliente
     */
    async editCliente(documento) {
        try {
            const response = await api.get(`/clientes/${documento}`);
            
            if (response.success && response.data) {
                this.currentClienteId = documento;
                this.fillForm(response.data);
                
                // Cambiar título del modal
                const modalTitle = document.getElementById('clienteModalTitle');
                if (modalTitle) {
                    modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Editar Cliente';
                }

                // Cambiar texto del botón
                const saveBtn = document.getElementById('save-btn-text');
                if (saveBtn) {
                    saveBtn.textContent = 'Actualizar';
                }

                // Deshabilitar campo documento
                const documentoField = document.getElementById('documento');
                if (documentoField) {
                    documentoField.readOnly = true;
                }

                // Mostrar modal
                const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
                modal.show();
            } else {
                throw new Error('Cliente no encontrado');
            }

        } catch (error) {
            console.error('Error al cargar cliente:', error);
            Utils.showAlert(`Error al cargar cliente: ${error.message}`, 'danger');
        }
    }

    /**
     * Ver detalles de un cliente
     */
    async viewCliente(documento) {
        try {
            const response = await api.get(`/clientes/${documento}`);
            
            if (response.success && response.data) {
                this.showClienteDetails(response.data);
            } else {
                throw new Error('Cliente no encontrado');
            }

        } catch (error) {
            console.error('Error al cargar cliente:', error);
            Utils.showAlert(`Error al cargar cliente: ${error.message}`, 'danger');
        }
    }

    /**
     * Eliminar cliente
     */
    async deleteCliente(documento) {
        try {
            // Obtener información del cliente para mostrar en el diálogo
            const clienteResponse = await api.getCliente(documento);
            
            if (!clienteResponse.success || !clienteResponse.data) {
                throw new Error('No se pudo obtener la información del cliente');
            }

            const cliente = clienteResponse.data;
            const nombreCompleto = `${cliente.nombre} ${cliente.apellido || ''}`.trim();
            
            // Mostrar confirmación con información detallada del cliente
            const confirmed = await Utils.confirmDialog(
                '⚠️ Confirmar Eliminación de Cliente',
                `
                <div class="text-center mb-3">
                    <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
                </div>
                <p><strong>¿Está seguro que desea eliminar este cliente?</strong></p>
                <div class="alert alert-info">
                    <strong>Cliente:</strong> ${nombreCompleto}<br>
                    <strong>Documento:</strong> ${cliente.documento}<br>
                    ${cliente.cel ? `<strong>Celular:</strong> ${cliente.cel}<br>` : ''}
                    ${cliente.correo ? `<strong>Correo:</strong> ${cliente.correo}` : ''}
                </div>
                <p class="text-danger">
                    <small>
                        <i class="fas fa-exclamation-circle"></i> 
                        Esta acción no se puede deshacer y eliminará permanentemente toda la información del cliente.
                    </small>
                </p>
                `,
                'Sí, eliminar cliente',
                'Cancelar'
            );

            if (!confirmed) return;

            // Proceder con la eliminación usando el método correcto
            const response = await api.deleteCliente(documento);
            
            if (response.success) {
                Utils.showAlert('Cliente eliminado exitosamente', 'success');
                // Cerrar modal si está abierto
                const modal = document.getElementById('viewClienteModal');
                if (modal) {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) modalInstance.hide();
                }
                // Recargar la lista
                await this.loadClientes();
            } else {
                throw new Error(response.message || 'Error al eliminar cliente');
            }

        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            
            // Manejar errores específicos
            let errorMessage = error.message;
            if (error.message.includes('registros asociados') || 
                error.message.includes('foreign key constraint')) {
                errorMessage = 'No se puede eliminar el cliente porque tiene registros asociados (ventas, propiedades, etc.)';
            }
            
            Utils.showAlert(`Error al eliminar cliente: ${errorMessage}`, 'danger');
        }
    }

    /**
     * Llenar formulario con datos del cliente
     */
    fillForm(cliente) {
        const fields = ['documento', 'nombre', 'apellido', 'cel', 'correo'];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && cliente[field] !== undefined) {
                element.value = cliente[field] || '';
            }
        });
    }

    /**
     * Mostrar detalles del cliente en modal
     */
    showClienteDetails(cliente) {
        const nombreCompleto = `${cliente.nombre} ${cliente.apellido || ''}`.trim();
        
        // Formatear fecha de registro
        const fechaRegistro = cliente.fecha_registro ? 
            new Date(cliente.fecha_registro).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'No disponible';
        
        // Crear modal HTML completo (igual que propietarios)
        const modalHTML = `
            <div class="modal fade" id="viewClienteModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-user-circle"></i> Detalles del Cliente
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <div class="avatar-placeholder bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                                     style="width: 80px; height: 80px; font-size: 2rem;">
                                    <i class="fas fa-user"></i>
                                </div>
                                <h4 class="mt-2 mb-0">${nombreCompleto}</h4>
                                <p class="text-muted">Cliente #${cliente.documento}</p>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card border-0 bg-light mb-3">
                                        <div class="card-body">
                                            <h6 class="card-title">
                                                <i class="fas fa-id-card text-primary"></i> Información Personal
                                            </h6>
                                            <div class="mb-2">
                                                <small class="text-muted">Documento:</small><br>
                                                <strong>${cliente.documento}</strong>
                                            </div>
                                            <div class="mb-2">
                                                <small class="text-muted">Nombre:</small><br>
                                                <strong>${cliente.nombre}</strong>
                                            </div>
                                            <div>
                                                <small class="text-muted">Apellido:</small><br>
                                                <strong>${cliente.apellido || '<em class="text-muted">No especificado</em>'}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card border-0 bg-light mb-3">
                                        <div class="card-body">
                                            <h6 class="card-title">
                                                <i class="fas fa-phone text-success"></i> Información de Contacto
                                            </h6>
                                            <div class="mb-2">
                                                <small class="text-muted">Celular:</small><br>
                                                ${cliente.cel ? 
                                                    `<strong><i class="fas fa-mobile-alt"></i> <a href="tel:${cliente.cel}">${cliente.cel}</a></strong>` : 
                                                    '<em class="text-muted">No especificado</em>'
                                                }
                                            </div>
                                            <div>
                                                <small class="text-muted">Correo electrónico:</small><br>
                                                ${cliente.correo ? 
                                                    `<strong><i class="fas fa-envelope"></i> <a href="mailto:${cliente.correo}">${cliente.correo}</a></strong>` : 
                                                    '<em class="text-muted">No especificado</em>'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-12">
                                    <div class="card border-0 bg-info bg-opacity-10 mb-3">
                                        <div class="card-body">
                                            <h6 class="card-title">
                                                <i class="fas fa-calendar-alt text-info"></i> Información de Registro
                                            </h6>
                                            <div class="d-flex align-items-center">
                                                <i class="fas fa-clock text-info me-2"></i>
                                                <div>
                                                    <small class="text-muted">Registrado el:</small><br>
                                                    <span class="badge bg-info fs-6">${fechaRegistro}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn btn-primary me-2" onclick="clientesManager.editCliente('${cliente.documento}'); bootstrap.Modal.getInstance(document.getElementById('viewClienteModal')).hide();">
                                <i class="fas fa-edit"></i> Editar Cliente
                            </button>
                            <button type="button" class="btn btn-outline-danger" onclick="clientesManager.deleteCliente('${cliente.documento}'); bootstrap.Modal.getInstance(document.getElementById('viewClienteModal')).hide();">
                                <i class="fas fa-trash"></i> Eliminar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior si existe (igual que propietarios)
        const existingModal = document.getElementById('viewClienteModal');
        if (existingModal) existingModal.remove();
        
        // Agregar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Mostrar modal usando el ID (igual que propietarios)
        Utils.showModal('viewClienteModal');
    }

    /**
     * Mostrar mensaje de error
     */
    showError(message) {
        const errorDiv = document.getElementById('clienteError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('d-none');
        }
    }

    /**
     * Mostrar mensaje de éxito
     */
    showSuccess(message) {
        const successDiv = document.getElementById('clienteSuccess');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.classList.remove('d-none');
        }
    }

    /**
     * Limpiar mensajes
     */
    clearMessages() {
        const errorDiv = document.getElementById('clienteError');
        const successDiv = document.getElementById('clienteSuccess');
        
        if (errorDiv) {
            errorDiv.classList.add('d-none');
            errorDiv.textContent = '';
        }
        
        if (successDiv) {
            successDiv.classList.add('d-none');
            successDiv.textContent = '';
        }
    }
}

// Funciones globales para compatibilidad con onclick en HTML
function showNewClienteForm() {
    if (window.clientesManager) {
        window.clientesManager.showNewClienteForm();
    }
}

function saveCliente() {
    if (window.clientesManager) {
        window.clientesManager.saveCliente();
    }
}

function searchClientes() {
    if (window.clientesManager) {
        window.clientesManager.searchClientes();
    }
}

function loadClientes() {
    if (window.clientesManager) {
        window.clientesManager.loadClientes();
    }
}

// Instancia global
window.clientesManager = null;