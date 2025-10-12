/* Gestión de propietarios */
class PropietariosManager {
    constructor() {
        this.currentPropietario = null;
        this.propietarios = []; // Siempre inicializar como array vacío
        this.isLoading = false; // Flag para evitar cargas múltiples
        this.searchTimeout = null; // Para implementar debounce en búsqueda
    }

    // Inicialización segura
    init() {
        // Verificar que los elementos necesarios existan
        const requiredElements = [
            'propietarios-loading',
            'propietarios-container', 
            'propietarios-table'
        ];

        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.warn('Elementos faltantes para PropietariosManager:', missingElements);
            return false;
        }

        return true;
    }

    // Función para resaltar términos de búsqueda
    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm || !text) return text;
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.toString().replace(regex, '<mark class="bg-warning">$1</mark>');
    }

    // Cargar todos los propietarios
    async loadPropietarios(filters = {}) {
        // Evitar cargas múltiples simultáneas
        if (this.isLoading) {
            console.log('Ya hay una carga en progreso, ignorando nueva solicitud');
            return;
        }

        try {
            this.isLoading = true;
            Utils.showLoading('propietarios-loading');
            const container = document.getElementById('propietarios-container');
            if (container) container.style.display = 'none';

            const response = await api.getPropietarios(filters);
            
            if (response.success) {
                // Asegurar que siempre tengamos un array válido
                // La API devuelve 'data', no 'datos'
                this.propietarios = Array.isArray(response.data) ? response.data : [];
                console.log('Propietarios cargados:', this.propietarios.length);
                this.renderPropietarios();
                
                // Actualizar contador en dashboard
                const totalElement = document.getElementById('total-propietarios');
                if (totalElement) {
                    totalElement.textContent = response.total || this.propietarios.length;
                }
            } else {
                throw new Error(response.message || 'Error al cargar propietarios');
            }
        } catch (error) {
            console.error('Error loading propietarios:', error);
            
            // Asegurar que propietarios sea un array vacío en caso de error
            this.propietarios = [];
            
            Utils.showError('Error al cargar propietarios: ' + error.message);
            
            // Mostrar mensaje en la tabla
            const tableBody = document.getElementById('propietarios-table');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-danger">
                            <i class="fas fa-exclamation-triangle"></i>
                            Error al cargar datos: ${error.message}
                        </td>
                    </tr>
                `;
            }
            
            // Actualizar contador en dashboard a 0
            const totalElement = document.getElementById('total-propietarios');
            if (totalElement) {
                totalElement.textContent = '0';
            }
        } finally {
            this.isLoading = false;
            Utils.hideLoading('propietarios-loading');
            const container = document.getElementById('propietarios-container');
            if (container) container.style.display = 'block';
        }
    }

    // Renderizar lista de propietarios
    renderPropietarios() {
        const tableBody = document.getElementById('propietarios-table');
        if (!tableBody) return;

        // Verificar que propietarios sea un array válido
        if (!Array.isArray(this.propietarios)) {
            console.warn('propietarios no es un array válido, inicializando como array vacío');
            this.propietarios = [];
        }

        const searchInput = document.getElementById('search-propietarios');
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        
        // Filtrar propietarios si hay término de búsqueda
        let propietariosFiltrados = this.propietarios;
        
        if (searchTerm && searchTerm.length > 0) {
            const termino = searchTerm.toLowerCase();
            propietariosFiltrados = this.propietarios.filter(propietario => {
                const nombre = `${propietario.nombre} ${propietario.apellido1} ${propietario.apellido2 || ''}`.toLowerCase();
                const documento = String(propietario.documento || '').toLowerCase();
                const correo = (propietario.correo || '').toLowerCase();
                
                return nombre.includes(termino) || 
                       documento.includes(termino) || 
                       correo.includes(termino);
            });
        }

        if (propietariosFiltrados.length === 0) {
            const mensaje = searchTerm ? 
                `<i class="fas fa-search"></i><br>No se encontraron resultados para "${searchTerm}"<br><small>Intenta con otro término de búsqueda</small>` :
                `<i class="fas fa-inbox"></i><br>No hay propietarios registrados<br><small>Haz clic en "Nuevo Propietario" para agregar uno</small>`;
                
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        ${mensaje}
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = propietariosFiltrados.map(propietario => {
            // Aplicar resaltado si hay término de búsqueda
            const documento = searchTerm ? this.highlightSearchTerm(String(propietario.documento || ''), searchTerm) : propietario.documento;
            const nombre = searchTerm ? this.highlightSearchTerm(propietario.nombre || '', searchTerm) : propietario.nombre;
            const apellido1 = searchTerm ? this.highlightSearchTerm(propietario.apellido1 || '', searchTerm) : propietario.apellido1;
            const apellido2 = propietario.apellido2 && searchTerm ? this.highlightSearchTerm(propietario.apellido2, searchTerm) : propietario.apellido2;
            const correo = propietario.correo && searchTerm ? this.highlightSearchTerm(propietario.correo, searchTerm) : propietario.correo;
            
            return `
            <tr>
                <td>
                    <strong>${documento}</strong>
                    <br><small class="text-muted">${propietario.tipo_doc || 'Cédula'}</small>
                </td>
                <td>
                    <strong>${nombre} ${apellido1}</strong>
                    ${apellido2 ? ` ${apellido2}` : ''}
                </td>
                <td>
                    ${propietario.tel ? `<div><i class="fas fa-phone"></i> ${propietario.tel}</div>` : ''}
                    ${propietario.cel ? `<div><i class="fas fa-mobile"></i> ${propietario.cel}</div>` : ''}
                    ${!propietario.tel && !propietario.cel ? '<span class="text-muted">-</span>' : ''}
                </td>
                <td>
                    ${correo ? `<a href="mailto:${propietario.correo}">${correo}</a>` : '<span class="text-muted">-</span>'}
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary" onclick="propietariosManager.editPropietario('${propietario.documento}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-outline-info" onclick="propietariosManager.viewPropietario('${propietario.documento}')" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger" onclick="propietariosManager.deletePropietario('${propietario.documento}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
        
        // Actualizar contador con los resultados filtrados
        const totalElement = document.getElementById('total-propietarios');
        if (totalElement) {
            const count = propietariosFiltrados.length;
            totalElement.textContent = count.toString();
            
            // Agregar texto descriptivo si hay filtro activo
            const countContainer = totalElement.parentElement;
            if (countContainer && searchTerm) {
                const totalOriginal = this.propietarios.length;
                if (count !== totalOriginal) {
                    countContainer.innerHTML = `<strong id="total-propietarios">${count}</strong> de ${totalOriginal} propietarios`;
                } else {
                    countContainer.innerHTML = `<strong id="total-propietarios">${count}</strong> propietarios`;
                }
            }
        }
    }

    // Buscar propietarios (manual - botón)
    async searchPropietarios() {
        const searchInput = document.getElementById('search-propietarios');
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        
        await this.loadPropietarios({ search: searchTerm });
    }

    // Búsqueda en tiempo real con debounce
    searchPropietariosRealTime() {
        // Limpiar timeout anterior
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Configurar nuevo timeout
        this.searchTimeout = setTimeout(() => {
            this.searchPropietarios();
        }, 300); // Esperar 300ms después de que el usuario deje de escribir
    }

    // Limpiar búsqueda
    clearSearch() {
        const searchInput = document.getElementById('search-propietarios');
        if (searchInput) {
            searchInput.value = '';
            this.loadPropietarios(); // Cargar todos los propietarios
        }
    }

    // Mostrar formulario para nuevo propietario
    showNewPropietarioForm() {
        this.currentPropietario = null;
        this.clearForm();
        
        // Actualizar título y botón
        const modalTitle = document.getElementById('propietarioModalTitle');
        const saveBtn = document.getElementById('save-btn-text');
        
        if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Nuevo Propietario';
        if (saveBtn) saveBtn.textContent = 'Guardar';
        
        // Habilitar campo documento
        const documentoField = document.getElementById('documento');
        if (documentoField) documentoField.disabled = false;
        
        // Mostrar modal de forma segura
        Utils.showModal('propietarioModal');
    }

    // Editar propietario existente
    async editPropietario(documento) {
        try {
            const response = await api.getPropietario(documento);
            
            if (response.success) {
                this.currentPropietario = response.data;
                this.fillForm(this.currentPropietario);
                
                // Actualizar título y botón
                const modalTitle = document.getElementById('propietarioModalTitle');
                const saveBtn = document.getElementById('save-btn-text');
                
                if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Editar Propietario';
                if (saveBtn) saveBtn.textContent = 'Actualizar';
                
                // Deshabilitar campo documento
                const documentoField = document.getElementById('documento');
                if (documentoField) documentoField.disabled = true;
                
                // Mostrar modal de forma segura
                Utils.showModal('propietarioModal');
            }
        } catch (error) {
            Utils.showError('Error al cargar propietario: ' + error.message);
        }
    }

    // Ver detalles del propietario
    async viewPropietario(documento) {
        try {
            const response = await api.getPropietario(documento);
            
            if (response.success) {
                const propietario = response.data;
                
                // Crear modal de solo lectura
                const modalHTML = `
                    <div class="modal fade" id="viewPropietarioModal" tabindex="-1">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">
                                        <i class="fas fa-user"></i> Detalles del Propietario
                                    </h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Documento:</strong></div>
                                        <div class="col-sm-8">${propietario.documento}</div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Nombre:</strong></div>
                                        <div class="col-sm-8">${propietario.nombre} ${propietario.apellido1} ${propietario.apellido2 || ''}</div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Teléfono:</strong></div>
                                        <div class="col-sm-8">${propietario.tel || '-'}</div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Celular:</strong></div>
                                        <div class="col-sm-8">${propietario.cel || '-'}</div>
                                    </div>
                                    <hr>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Email:</strong></div>
                                        <div class="col-sm-8">${propietario.correo || '-'}</div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                    <button type="button" class="btn btn-primary" onclick="propietariosManager.editPropietario('${propietario.documento}'); bootstrap.Modal.getInstance(document.getElementById('viewPropietarioModal')).hide();">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Remover modal anterior si existe
                const existingModal = document.getElementById('viewPropietarioModal');
                if (existingModal) existingModal.remove();
                
                // Agregar nuevo modal
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                
                // Mostrar modal de forma segura
                Utils.showModal('viewPropietarioModal');
            }
        } catch (error) {
            Utils.showError('Error al cargar propietario: ' + error.message);
        }
    }

    // Eliminar propietario
    async deletePropietario(documento) {
        if (!confirm('¿Está seguro que desea eliminar este propietario?')) {
            return;
        }

        try {
            const response = await api.deletePropietario(documento);
            
            if (response.success) {
                showNotification('Propietario eliminado exitosamente', 'success');
                await this.loadPropietarios();
            } else {
                throw new Error(response.message || 'Error al eliminar propietario');
            }
        } catch (error) {
            Utils.showError('Error al eliminar propietario: ' + error.message);
        }
    }

    // Guardar propietario (crear o actualizar)
    async savePropietario() {
        const form = document.getElementById('propietarioForm');
        if (!form) return;

        // Validar formulario
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Recopilar datos del formulario
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value.toString().trim();
        }

        // Validaciones adicionales
        if (data.correo && !Utils.isValidEmail(data.correo)) {
            Utils.showError('Por favor ingrese un email válido', 'propietarioError');
            return;
        }

        // Ocultar alertas previas
        Utils.hideAlert('propietarioError');
        Utils.hideAlert('propietarioSuccess');

        // Deshabilitar botón
        const saveBtn = document.querySelector('#propietarioModal .btn-primary');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Guardando...';
        saveBtn.disabled = true;

        try {
            let response;
            
            if (this.currentPropietario) {
                // Actualizar propietario existente
                response = await api.updatePropietario(this.currentPropietario.documento, data);
            } else {
                // Crear nuevo propietario
                response = await api.createPropietario(data);
            }

            if (response.success) {
                Utils.showSuccess(
                    `Propietario ${this.currentPropietario ? 'actualizado' : 'creado'} exitosamente`,
                    'propietarioSuccess'
                );
                
                setTimeout(() => {
                    Utils.hideModal('propietarioModal');
                    this.loadPropietarios();
                }, 1500);
            } else {
                throw new Error(response.message || 'Error al guardar propietario');
            }
            
        } catch (error) {
            Utils.showError(error.message, 'propietarioError');
        } finally {
            // Rehabilitar botón
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }

    // Limpiar formulario
    clearForm() {
        Utils.clearForm('propietarioForm');
        Utils.hideAlert('propietarioError');
        Utils.hideAlert('propietarioSuccess');
    }

    // Llenar formulario con datos
    fillForm(propietario) {
        const form = document.getElementById('propietarioForm');
        if (!form || !propietario) return;

        // Llenar campos
        const fields = ['documento', 'nombre', 'apellido1', 'apellido2', 'tel', 'cel', 'correo'];
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input && propietario[field]) {
                input.value = propietario[field];
            }
        });

        // Limpiar alertas
        Utils.hideAlert('propietarioError');
        Utils.hideAlert('propietarioSuccess');
    }
}

// Instancia global
const propietariosManager = new PropietariosManager();

// Funciones globales para eventos
function showNewPropietarioForm() {
    if (!auth.isAuthenticated()) {
        showLogin();
        return;
    }
    propietariosManager.showNewPropietarioForm();
}

function savePropietario() {
    propietariosManager.savePropietario();
}

function searchPropietarios() {
    propietariosManager.searchPropietarios();
}

function loadPropietarios() {
    if (propietariosManager.init()) {
        propietariosManager.loadPropietarios();
    } else {
        console.error('No se puede cargar propietarios: elementos faltantes en el DOM');
        Utils.showError('Error: No se encontraron los elementos necesarios en la página');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la sección de propietarios
    const propietariosTable = document.getElementById('propietarios-table');
    
    if (propietariosTable) {
        console.log('Inicializando módulo de propietarios...');
        
        // Verificar autenticación antes de cargar
        if (auth && auth.isAuthenticated()) {
            // Dar un pequeño delay para asegurar que todo esté inicializado
            setTimeout(() => {
                loadPropietarios();
            }, 100);
        } else {
            console.log('Usuario no autenticado, no se cargarán propietarios');
        }
    }
    
    // Configurar eventos de búsqueda
    const searchInput = document.getElementById('search-propietarios');
    if (searchInput) {
        // Búsqueda en tiempo real mientras se escribe
        searchInput.addEventListener('input', function(e) {
            propietariosManager.searchPropietariosRealTime();
        });

        // Búsqueda al presionar Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchPropietarios();
            }
        });

        // Limpiar búsqueda con Escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                propietariosManager.clearSearch();
            }
        });
    }
});