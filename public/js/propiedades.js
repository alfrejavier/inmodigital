// Gestión de Propiedades
let propiedades = [];
let propiedadesPaginaActual = 1;
let propiedadesLimite = 10;
let propiedadesTotales = 0;
let propiedadEditando = null;

// Inicializar al cargar la sección
function inicializarPropiedades() {
    cargarPropietariosSelect();
    cargarPropiedades();
}

// Cargar propietarios en el select del modal
async function cargarPropietariosSelect() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/propietarios?limite=1000`);
        const data = await response.json();
        
        const select = document.getElementById('propietarios_documento');
        select.innerHTML = '<option value="">Seleccione propietario...</option>';
        
        if (data.success && data.data) {
            data.data.forEach(prop => {
                const option = document.createElement('option');
                option.value = prop.documento;
                option.textContent = `${prop.nombre} ${prop.apellido || ''} - ${prop.documento}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando propietarios:', error);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Error cargando propietarios',
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// Cargar propiedades con filtros y paginación
async function cargarPropiedades(pagina = 1) {
    try {
        propiedadesPaginaActual = pagina;
        
        // Construir query params
        const params = new URLSearchParams({
            pagina: pagina,
            limite: propiedadesLimite
        });
        
        // Agregar filtros si existen
        const tipoFiltro = document.getElementById('filtroTipoPropiedad')?.value;
        const ciudadFiltro = document.getElementById('filtroCiudad')?.value;
        const disponibilidadFiltro = document.getElementById('filtroDisponibilidad')?.value;
        
        if (tipoFiltro) params.append('tipo_propiedad', tipoFiltro);
        if (ciudadFiltro) params.append('ciudad', ciudadFiltro);
        if (disponibilidadFiltro) params.append('disponibilidad', disponibilidadFiltro);
        
        // Mostrar loading
        const tbody = document.getElementById('tablaPropiedades');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>
        `;
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/propiedades?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
            propiedades = data.data.propiedades || [];
            propiedadesTotales = data.data.paginacion.total_registros || 0;
            renderizarTablaPropiedades();
            renderizarPaginacionPropiedades();
        } else {
            throw new Error(data.message || 'Error cargando propiedades');
        }
    } catch (error) {
        console.error('Error:', error);
        const tbody = document.getElementById('tablaPropiedades');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle"></i> Error cargando propiedades
                </td>
            </tr>
        `;
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: error.message,
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// Renderizar tabla de propiedades
function renderizarTablaPropiedades() {
    const tbody = document.getElementById('tablaPropiedades');
    
    if (propiedades.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    <i class="fas fa-inbox"></i> No hay propiedades registradas
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = propiedades.map(prop => `
        <tr>
            <td>${prop.id}</td>
            <td>
                <span class="badge bg-info">
                    ${prop.tipo_propiedad.charAt(0).toUpperCase() + prop.tipo_propiedad.slice(1)}
                </span>
            </td>
            <td>
                <small>${prop.ciudad}, ${prop.depto}</small><br>
                <small class="text-muted">${prop.ubicacion}</small>
            </td>
            <td>${prop.tamano} m²</td>
            <td>$${Number(prop.precio).toLocaleString('es-CO')}</td>
            <td>
                <span class="badge bg-${obtenerColorDisponibilidad(prop.disponibilidad)}">
                    ${prop.disponibilidad}
                </span>
            </td>
            <td>
                <small>${prop.propietario_nombre || 'N/A'}</small>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="gestionarCaracteristicas(${prop.id})" 
                            title="Características">
                        <i class="fas fa-list-ul"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="gestionarFotos(${prop.id})" 
                            title="Fotos">
                        <i class="fas fa-images"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="verDetallePropiedad(${prop.id})" 
                            title="Ver detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="editarPropiedad(${prop.id})" 
                            title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="eliminarPropiedad(${prop.id})" 
                            title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Renderizar paginación
function renderizarPaginacionPropiedades() {
    const totalPaginas = Math.ceil(propiedadesTotales / propiedadesLimite);
    const paginacion = document.getElementById('paginacionPropiedades');
    
    if (totalPaginas <= 1) {
        paginacion.innerHTML = '';
        return;
    }
    
    let html = `
        <li class="page-item ${propiedadesPaginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cargarPropiedades(${propiedadesPaginaActual - 1}); return false;">
                Anterior
            </a>
        </li>
    `;
    
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= propiedadesPaginaActual - 1 && i <= propiedadesPaginaActual + 1)) {
            html += `
                <li class="page-item ${i === propiedadesPaginaActual ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="cargarPropiedades(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === propiedadesPaginaActual - 2 || i === propiedadesPaginaActual + 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    html += `
        <li class="page-item ${propiedadesPaginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cargarPropiedades(${propiedadesPaginaActual + 1}); return false;">
                Siguiente
            </a>
        </li>
    `;
    
    paginacion.innerHTML = html;
}

// Abrir modal para nueva propiedad o editar
function abrirModalPropiedad(id = null) {
    propiedadEditando = id;
    const modal = new bootstrap.Modal(document.getElementById('propiedadModal'));
    const form = document.getElementById('propiedadForm');
    const title = document.getElementById('propiedadModalTitle');
    
    // Resetear formulario
    form.reset();
    document.getElementById('propiedadError').classList.add('d-none');
    document.getElementById('propiedadSuccess').classList.add('d-none');
    
    if (id) {
        title.innerHTML = '<i class="fas fa-edit"></i> Editar Propiedad';
        cargarDatosPropiedad(id);
    } else {
        title.innerHTML = '<i class="fas fa-home"></i> Nueva Propiedad';
        document.getElementById('propiedad_id').value = '';
    }
    
    modal.show();
}

// Cargar datos de propiedad para editar
async function cargarDatosPropiedad(id) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/propiedades/${id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const prop = data.data;
            document.getElementById('propiedad_id').value = prop.id;
            document.getElementById('tipo_propiedad').value = prop.tipo_propiedad;
            document.getElementById('depto').value = prop.depto;
            document.getElementById('ciudad').value = prop.ciudad;
            document.getElementById('ubicacion').value = prop.ubicacion;
            document.getElementById('tamano').value = prop.tamano;
            document.getElementById('precio').value = prop.precio;
            document.getElementById('caracteristicas').value = prop.caracteristicas || '';
            document.getElementById('disponibilidad').value = prop.disponibilidad;
            document.getElementById('estado').value = prop.estado;
            document.getElementById('propietarios_documento').value = prop.propietarios_documento;
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Error cargando datos de propiedad',
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// Guardar propiedad (crear o actualizar)
async function guardarPropiedad() {
    const form = document.getElementById('propiedadForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = document.getElementById('propiedad_id').value;
    const datos = {
        tipo_propiedad: document.getElementById('tipo_propiedad').value,
        depto: document.getElementById('depto').value,
        ciudad: document.getElementById('ciudad').value,
        ubicacion: document.getElementById('ubicacion').value,
        tamano: parseFloat(document.getElementById('tamano').value),
        precio: parseFloat(document.getElementById('precio').value),
        caracteristicas: document.getElementById('caracteristicas').value || null,
        disponibilidad: document.getElementById('disponibilidad').value,
        estado: document.getElementById('estado').value,
        propietarios_documento: document.getElementById('propietarios_documento').value
    };
    
    try {
        const url = id ? `${CONFIG.API_BASE_URL}/propiedades/${id}` : `${CONFIG.API_BASE_URL}/propiedades`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });
        
        const data = await response.json();
        
        if (data.success) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: id ? 'Propiedad actualizada exitosamente' : 'Propiedad creada exitosamente',
                showConfirmButton: false,
                timer: 3000
            });
            bootstrap.Modal.getInstance(document.getElementById('propiedadModal')).hide();
            cargarPropiedades(propiedadesPaginaActual);
        } else {
            throw new Error(data.message || 'Error guardando propiedad');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('propiedadError').textContent = error.message;
        document.getElementById('propiedadError').classList.remove('d-none');
    }
}

// Editar propiedad
function editarPropiedad(id) {
    abrirModalPropiedad(id);
}

// Ver detalle de propiedad
async function verDetallePropiedad(id) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/propiedades/${id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const prop = data.data;
            
            // Obtener características de la propiedad
            const respCaract = await fetch(`${CONFIG.API_BASE_URL}/caracteristicas/propiedad/${id}`);
            const dataCaract = await respCaract.json();
            const caracteristicas = dataCaract.success ? dataCaract.data : [];
            
            let htmlCaract = '';
            if (caracteristicas.length > 0) {
                htmlCaract = '<h6 class="mt-3">Características Detalladas:</h6><ul class="list-unstyled">';
                caracteristicas.forEach(c => {
                    htmlCaract += `<li><i class="fas fa-check-circle text-success"></i> ${c.nombre}`;
                    if (c.cantidad) htmlCaract += `: ${c.cantidad}`;
                    if (c.detalle) htmlCaract += ` <small class="text-muted">(${c.detalle})</small>`;
                    htmlCaract += '</li>';
                });
                htmlCaract += '</ul>';
            }
            
            Swal.fire({
                title: `Propiedad #${prop.id}`,
                html: `
                    <div class="text-start">
                        <p><strong>Tipo:</strong> ${prop.tipo_propiedad}</p>
                        <p><strong>Ubicación:</strong> ${prop.ubicacion}<br>
                        <small class="text-muted">${prop.ciudad}, ${prop.depto}</small></p>
                        <p><strong>Tamaño:</strong> ${prop.tamano} m²</p>
                        <p><strong>Precio:</strong> $${Number(prop.precio).toLocaleString('es-CO')}</p>
                        <p><strong>Disponibilidad:</strong> ${prop.disponibilidad}</p>
                        <p><strong>Estado:</strong> ${prop.estado}</p>
                        <p><strong>Propietario:</strong> ${prop.propietario_nombre || 'N/A'}</p>
                        ${prop.caracteristicas ? `<p><strong>Características:</strong> ${prop.caracteristicas}</p>` : ''}
                        ${htmlCaract}
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Cerrar',
                width: '600px'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Error cargando detalle de propiedad',
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// Eliminar propiedad
async function eliminarPropiedad(id) {
    const result = await Swal.fire({
        title: '¿Eliminar propiedad?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/propiedades/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Propiedad eliminada exitosamente',
                    showConfirmButton: false,
                    timer: 3000
                });
                cargarPropiedades(propiedadesPaginaActual);
            } else {
                throw new Error(data.message || 'Error eliminando propiedad');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: error.message,
                showConfirmButton: false,
                timer: 3000
            });
        }
    }
}

// Limpiar filtros
function limpiarFiltrosPropiedades() {
    document.getElementById('filtroTipoPropiedad').value = '';
    document.getElementById('filtroCiudad').value = '';
    document.getElementById('filtroDisponibilidad').value = '';
    cargarPropiedades(1);
}

// Helper: obtener color para badge de disponibilidad
function obtenerColorDisponibilidad(disponibilidad) {
    const colores = {
        'venta': 'success',
        'arriendo': 'warning',
        'venta/arriendo': 'info'
    };
    return colores[disponibilidad] || 'secondary';
}

// Gestionar características de una propiedad
async function gestionarCaracteristicas(propiedadId) {
    try {
        // Cargar características existentes
        const response = await fetch(`${CONFIG.API_BASE_URL}/caracteristicas/propiedad/${propiedadId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error cargando características');
        }
        
        const caracteristicas = data.data || [];
        
        // Crear HTML para el modal
        let html = `
            <div class="mb-3">
                <h6>Características actuales:</h6>
                <div id="listaCaracteristicas" class="list-group mb-3">
                    ${caracteristicas.length > 0 ? caracteristicas.map(c => `
                        <div class="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${c.nombre}</strong>
                                ${c.cantidad ? `<span class="badge bg-info ms-2">${c.cantidad}</span>` : ''}
                                ${c.detalle ? `<br><small class="text-muted">${c.detalle}</small>` : ''}
                            </div>
                            <button class="btn btn-sm btn-danger" onclick="eliminarCaracteristica(${c.idc}, ${propiedadId})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('') : '<p class="text-muted">No hay características registradas</p>'}
                </div>
                
                <h6>Agregar nueva característica:</h6>
                <form id="formCaracteristica" onsubmit="agregarCaracteristica(event, ${propiedadId})">
                    <div class="mb-2">
                        <input type="text" class="form-control" id="nombreCaracteristica" 
                               placeholder="Nombre (ej: Habitaciones, Baños)" required>
                    </div>
                    <div class="row mb-2">
                        <div class="col-6">
                            <input type="number" class="form-control" id="cantidadCaracteristica" 
                                   placeholder="Cantidad (opcional)" min="1">
                        </div>
                        <div class="col-6">
                            <input type="text" class="form-control" id="detalleCaracteristica" 
                                   placeholder="Detalle (opcional)">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </form>
            </div>
        `;
        
        Swal.fire({
            title: 'Gestionar Características',
            html: html,
            width: 600,
            showConfirmButton: false,
            showCloseButton: true
        });
        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: error.message,
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// Agregar característica
async function agregarCaracteristica(event, propiedadId) {
    event.preventDefault();
    
    const datos = {
        propiedades_id: propiedadId,
        nombre: document.getElementById('nombreCaracteristica').value,
        cantidad: document.getElementById('cantidadCaracteristica').value || null,
        detalle: document.getElementById('detalleCaracteristica').value || null
    };
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/caracteristicas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        
        const data = await response.json();
        
        if (data.success) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Característica agregada',
                showConfirmButton: false,
                timer: 2000
            });
            // Recargar el modal
            setTimeout(() => gestionarCaracteristicas(propiedadId), 2000);
        } else {
            throw new Error(data.message || 'Error agregando característica');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: error.message,
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// Eliminar característica
async function eliminarCaracteristica(idc, propiedadId) {
    const confirmacion = await Swal.fire({
        title: '¿Eliminar característica?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });
    
    if (confirmacion.isConfirmed) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/caracteristicas/${idc}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Característica eliminada',
                    showConfirmButton: false,
                    timer: 2000
                });
                // Recargar el modal con las características actualizadas
                setTimeout(() => gestionarCaracteristicas(propiedadId), 2000);
            } else {
                throw new Error(data.message || 'Error eliminando característica');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: error.message,
                showConfirmButton: false,
                timer: 3000
            });
        }
    }
}
