/**
 * Gestión de Ventas y Arriendos
 */

let ventaModal;
let propiedadesDisponibles = [];
let clientesActivos = [];

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    ventaModal = new bootstrap.Modal(document.getElementById('ventaModal'));
    
    // Establecer fecha actual por defecto
    const hoy = new Date().toISOString().split('T')[0];
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        fechaInput.value = hoy;
    }
    
    // Cargar ventas al iniciar si la sección está visible
    if (document.getElementById('ventas')) {
        cargarVentas();
    }
});

/**
 * Cargar ventas desde el servidor
 */
async function cargarVentas() {
    const tabla = document.getElementById('tablaVentas');
    const filtroEstado = document.getElementById('filtroEstado').value;
    const filtroFecha = document.getElementById('filtroFecha').value;
    
    try {
        tabla.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;

        const response = await api.get('/api/ventas');
        
        if (response.success) {
            let ventas = response.data || [];
            
            // Aplicar filtros
            if (filtroEstado) {
                ventas = ventas.filter(v => v.estado === filtroEstado);
            }
            
            if (filtroFecha) {
                ventas = ventas.filter(v => v.fecha.startsWith(filtroFecha));
            }
            
            if (ventas.length === 0) {
                tabla.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted py-4">
                            <i class="fas fa-inbox fa-3x mb-3"></i>
                            <p>No hay ventas registradas</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            tabla.innerHTML = ventas.map(venta => {
                const fecha = new Date(venta.fecha).toLocaleDateString('es-CO');
                const valor = formatearMoneda(venta.valorventa);
                const estadoBadge = obtenerBadgeEstado(venta.estado);
                
                // Información de la propiedad
                const propiedad = `${venta.tipo_propiedad || 'N/A'} - ${venta.ubicacion || 'N/A'}`;
                
                // Información del cliente
                const cliente = `${venta.nombre_cliente || ''} ${venta.apellido_cliente || 'N/A'}`;
                
                return `
                    <tr>
                        <td>${venta.idventas}</td>
                        <td>${fecha}</td>
                        <td>
                            <small class="text-muted d-block">${propiedad}</small>
                            <small class="text-muted">${venta.ciudad || ''}</small>
                        </td>
                        <td>
                            <div>${cliente}</div>
                            <small class="text-muted">${venta.clientes_documento}</small>
                        </td>
                        <td class="text-end fw-bold">${valor}</td>
                        <td>${estadoBadge}</td>
                        <td>
                            <div class="btn-group btn-group-sm" role="group">
                                <button class="btn btn-outline-primary" 
                                        onclick="editarVenta(${venta.idventas})"
                                        title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" 
                                        onclick="eliminarVenta(${venta.idventas})"
                                        title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
        } else {
            throw new Error(response.message || 'Error al cargar ventas');
        }
        
    } catch (error) {
        console.error('Error cargando ventas:', error);
        tabla.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <p>Error al cargar las ventas: ${error.message}</p>
                    <button class="btn btn-sm btn-primary" onclick="cargarVentas()">
                        <i class="fas fa-sync"></i> Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

/**
 * Abrir modal para nueva venta
 */
async function nuevaVenta() {
    // Resetear formulario
    document.getElementById('ventaForm').reset();
    document.getElementById('idventas').value = '';
    document.getElementById('venta-modal-title').textContent = 'Nueva Venta/Arriendo';
    document.getElementById('venta-save-btn-text').textContent = 'Guardar';
    
    // Establecer fecha actual
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = hoy;
    
    // Estado por defecto
    document.getElementById('estadoVenta').value = 'pendiente';
    
    // Ocultar mensajes
    document.getElementById('ventaError').classList.add('d-none');
    document.getElementById('ventaSuccess').classList.add('d-none');
    
    // Cargar propiedades y clientes
    await Promise.all([
        cargarPropiedadesDisponibles(),
        cargarClientes()
    ]);
    
    ventaModal.show();
}

/**
 * Editar venta existente
 */
async function editarVenta(id) {
    try {
        // Cargar datos de la venta
        const response = await api.get(`/api/ventas/${id}`);
        
        if (!response.success || !response.data) {
            throw new Error('No se pudo cargar la venta');
        }
        
        const venta = response.data;
        
        // Cargar propiedades y clientes primero
        await Promise.all([
            cargarPropiedadesDisponibles(venta.propiedades_id),
            cargarClientes()
        ]);
        
        // Llenar formulario
        document.getElementById('idventas').value = venta.idventas;
        document.getElementById('propiedades_id').value = venta.propiedades_id;
        document.getElementById('clientes_documento').value = venta.clientes_documento;
        document.getElementById('fecha').value = venta.fecha;
        document.getElementById('valorventa').value = venta.valorventa;
        document.getElementById('estadoVenta').value = venta.estado;
        
        // Actualizar título
        document.getElementById('venta-modal-title').textContent = 'Editar Venta';
        document.getElementById('venta-save-btn-text').textContent = 'Actualizar';
        
        // Ocultar mensajes
        document.getElementById('ventaError').classList.add('d-none');
        document.getElementById('ventaSuccess').classList.add('d-none');
        
        ventaModal.show();
        
    } catch (error) {
        console.error('Error cargando venta:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la información de la venta',
            confirmButtonColor: '#0d6efd'
        });
    }
}

/**
 * Guardar venta (crear o actualizar)
 */
async function guardarVenta() {
    const form = document.getElementById('ventaForm');
    const errorDiv = document.getElementById('ventaError');
    const successDiv = document.getElementById('ventaSuccess');
    
    // Validar formulario
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = document.getElementById('idventas').value;
    const datos = {
        propiedades_id: parseInt(document.getElementById('propiedades_id').value),
        clientes_documento: document.getElementById('clientes_documento').value,
        fecha: document.getElementById('fecha').value,
        valorventa: parseInt(document.getElementById('valorventa').value),
        estado: document.getElementById('estadoVenta').value
    };
    
    // Validaciones adicionales
    if (datos.valorventa <= 0) {
        mostrarError(errorDiv, 'El valor debe ser mayor a cero');
        return;
    }
    
    try {
        const saveBtn = document.querySelector('#ventaModal .btn-primary');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        let response;
        if (id) {
            // Actualizar
            response = await api.put(`/api/ventas/${id}`, datos);
        } else {
            // Crear
            response = await api.post('/api/ventas', datos);
        }
        
        if (response.success) {
            mostrarExito(successDiv, id ? 'Venta actualizada correctamente' : 'Venta registrada correctamente');
            
            setTimeout(() => {
                ventaModal.hide();
                cargarVentas();
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: response.message || 'Operación realizada correctamente',
                    timer: 2000,
                    showConfirmButton: false
                });
            }, 1000);
            
        } else {
            throw new Error(response.message || 'Error al guardar la venta');
        }
        
    } catch (error) {
        console.error('Error guardando venta:', error);
        mostrarError(errorDiv, error.message || 'Error al guardar la venta');
        
        const saveBtn = document.querySelector('#ventaModal .btn-primary');
        saveBtn.disabled = false;
        const btnText = document.getElementById('idventas').value ? 'Actualizar' : 'Guardar';
        saveBtn.innerHTML = `<i class="fas fa-save"></i> ${btnText}`;
    }
}

/**
 * Eliminar venta
 */
async function eliminarVenta(id) {
    const result = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar venta?',
        html: `
            <p>Esta acción no se puede deshacer.</p>
            <p class="text-muted">Si la venta estaba completada, la propiedad volverá a estar disponible para venta.</p>
        `,
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
        try {
            const response = await api.delete(`/api/ventas/${id}`);
            
            if (response.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Eliminada',
                    text: 'La venta ha sido eliminada correctamente',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                cargarVentas();
            } else {
                throw new Error(response.message || 'Error al eliminar');
            }
            
        } catch (error) {
            console.error('Error eliminando venta:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo eliminar la venta',
                confirmButtonColor: '#0d6efd'
            });
        }
    }
}

/**
 * Limpiar filtros
 */
function limpiarFiltrosVentas() {
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroFecha').value = '';
    cargarVentas();
}

/**
 * Cargar propiedades disponibles para venta/arriendo
 */
async function cargarPropiedadesDisponibles(propiedadSeleccionada = null) {
    try {
        const response = await api.get('/api/propiedades');
        
        if (response.success && response.data) {
            // Filtrar solo propiedades disponibles (venta o arriendo)
            let propiedades = response.data.filter(p => 
                p.disponibilidad === 'venta' || p.disponibilidad === 'arriendo'
            );
            
            // Si estamos editando, incluir la propiedad actual aunque esté vendida
            if (propiedadSeleccionada) {
                const propActual = response.data.find(p => p.id === propiedadSeleccionada);
                if (propActual && !propiedades.find(p => p.id === propiedadSeleccionada)) {
                    propiedades.unshift(propActual);
                }
            }
            
            const select = document.getElementById('propiedades_id');
            select.innerHTML = '<option value="">Seleccione una propiedad...</option>';
            
            propiedades.forEach(prop => {
                const option = document.createElement('option');
                option.value = prop.id;
                option.textContent = `${prop.tipo} - ${prop.ubicacion}, ${prop.ciudad} - ${formatearMoneda(prop.precio)}`;
                if (prop.disponibilidad === 'vendida' || prop.disponibilidad === 'arrendada') {
                    option.textContent += ' (No disponible)';
                    option.disabled = true;
                }
                select.appendChild(option);
            });
            
            propiedadesDisponibles = propiedades;
        }
        
    } catch (error) {
        console.error('Error cargando propiedades:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las propiedades disponibles',
            confirmButtonColor: '#0d6efd'
        });
    }
}

/**
 * Cargar clientes activos
 */
async function cargarClientes() {
    try {
        const response = await api.get('/api/clientes');
        
        if (response.success && response.data) {
            const clientes = response.data;
            
            const select = document.getElementById('clientes_documento');
            select.innerHTML = '<option value="">Seleccione un cliente...</option>';
            
            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.documento;
                option.textContent = `${cliente.nombre} ${cliente.apellido} - ${cliente.documento}`;
                select.appendChild(option);
            });
            
            clientesActivos = clientes;
        }
        
    } catch (error) {
        console.error('Error cargando clientes:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los clientes',
            confirmButtonColor: '#0d6efd'
        });
    }
}

/**
 * Obtener badge HTML según el estado
 */
function obtenerBadgeEstado(estado) {
    const badges = {
        'pendiente': '<span class="badge bg-warning text-dark"><i class="fas fa-clock"></i> Pendiente</span>',
        'en_proceso': '<span class="badge bg-info"><i class="fas fa-spinner"></i> En Proceso</span>',
        'completada': '<span class="badge bg-success"><i class="fas fa-check-circle"></i> Completada</span>',
        'cancelada': '<span class="badge bg-danger"><i class="fas fa-times-circle"></i> Cancelada</span>'
    };
    
    return badges[estado] || `<span class="badge bg-secondary">${estado}</span>`;
}

/**
 * Formatear valor monetario
 */
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
}

/**
 * Mostrar mensaje de error
 */
function mostrarError(elemento, mensaje) {
    elemento.textContent = mensaje;
    elemento.classList.remove('d-none');
    setTimeout(() => elemento.classList.add('d-none'), 5000);
}

/**
 * Mostrar mensaje de éxito
 */
function mostrarExito(elemento, mensaje) {
    elemento.textContent = mensaje;
    elemento.classList.remove('d-none');
    setTimeout(() => elemento.classList.add('d-none'), 3000);
}
