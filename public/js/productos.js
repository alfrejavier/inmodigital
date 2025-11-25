/**
 * Gestión de Productos
 */

let productoModal;
let categorias = [];
let marcas = [];

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    productoModal = new bootstrap.Modal(document.getElementById('productoModal'));
    
    // Preview de imagen
    const imagenInput = document.getElementById('imagen_producto');
    if (imagenInput) {
        imagenInput.addEventListener('change', function(e) {
            const preview = document.getElementById('preview_imagen');
            const file = e.target.files[0];
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" class="img-thumbnail" style="max-height: 150px;">`;
                };
                reader.readAsDataURL(file);
            } else {
                preview.innerHTML = '';
            }
        });
    }
    
    // Cargar productos al iniciar si la sección está visible
    if (document.getElementById('productos')) {
        cargarFiltros();
    }
});

/**
 * Cargar categorías y marcas para filtros
 */
async function cargarFiltros() {
    try {
        const [categoriasRes, marcasRes] = await Promise.all([
            api.get('/productos/categorias'),
            api.get('/productos/marcas')
        ]);
        
        // Cargar categorías
        if (categoriasRes.success && categoriasRes.data) {
            categorias = categoriasRes.data;
            const selectCategoria = document.getElementById('filtroCategoria');
            categoriasRes.data.forEach(cat => {
                if (cat.categoria) {
                    const option = document.createElement('option');
                    option.value = cat.categoria;
                    option.textContent = cat.categoria;
                    selectCategoria.appendChild(option);
                }
            });
        }
        
        // Cargar marcas
        if (marcasRes.success && marcasRes.data) {
            marcas = marcasRes.data;
            const selectMarca = document.getElementById('filtroMarca');
            marcasRes.data.forEach(marca => {
                if (marca.marca) {
                    const option = document.createElement('option');
                    option.value = marca.marca;
                    option.textContent = marca.marca;
                    selectMarca.appendChild(option);
                }
            });
        }
        
        // Cargar productos inicialmente
        cargarProductos();
        
    } catch (error) {
        console.error('Error cargando filtros:', error);
        cargarProductos(); // Cargar productos aunque fallen los filtros
    }
}

/**
 * Cargar productos desde el servidor
 */
async function cargarProductos() {
    const tabla = document.getElementById('tablaProductos');
    const filtroCategoria = document.getElementById('filtroCategoria').value;
    const filtroMarca = document.getElementById('filtroMarca').value;
    const filtroEstado = document.getElementById('filtroEstadoProducto').value;
    const filtroDisponible = document.getElementById('filtroDisponible').value;
    const buscar = document.getElementById('buscarProducto').value;
    
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

        // Construir parámetros de consulta
        const params = new URLSearchParams();
        if (filtroCategoria) params.append('categoria', filtroCategoria);
        if (filtroMarca) params.append('marca', filtroMarca);
        if (filtroEstado) params.append('estado', filtroEstado);
        if (filtroDisponible !== '') params.append('disponible', filtroDisponible);
        if (buscar) params.append('buscar', buscar);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await api.get(`/productos${queryString}`);
        

        if (response.success) {
            let productos = response.data || [];
            
            if (productos.length === 0) {
                tabla.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted py-4">
                            <i class="fas fa-inbox fa-3x mb-3"></i>
                            <p>No hay productos registrados</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            tabla.innerHTML = productos.map(producto => {
                const precio = formatearMoneda(producto.precio);
                const estadoBadge = obtenerBadgeEstado(producto.estado);
                const stockBadge = obtenerBadgeStock(producto.cantidad, producto.stock_minimo);
                
                // Mostrar imagen o placeholder
                const imagenHtml = producto.imagen_principal 
                    ? `<img src="${producto.imagen_principal}" alt="${producto.nombre}" 
                           class="img-thumbnail" style="width: 50px; height: 50px; object-fit: cover;">`
                    : `<div class="bg-secondary text-white d-flex align-items-center justify-content-center" 
                           style="width: 50px; height: 50px; font-size: 20px;">
                           <i class="fas fa-box"></i>
                       </div>`;
                
                return `
                    <tr>
                        <td>${imagenHtml}</td>
                        <td>
                            <strong>${producto.nombre}</strong>
                            ${producto.descripcion ? `<br><small class="text-muted">${producto.descripcion.substring(0, 50)}${producto.descripcion.length > 50 ? '...' : ''}</small>` : ''}
                        </td>
                        <td>${producto.marca || '-'}</td>
                        <td>
                            ${producto.categoria || '-'}
                            ${producto.subcategoria ? `<br><small class="text-muted">${producto.subcategoria}</small>` : ''}
                        </td>
                        <td class="text-end fw-bold">${precio}</td>
                        <td class="text-center">${stockBadge}</td>
                        <td class="text-center">${estadoBadge}</td>
                        <td>
                            <div class="btn-group btn-group-sm" role="group">
                                <button class="btn btn-outline-primary" 
                                        onclick="editarProducto(${producto.id_producto})"
                                        title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-success" 
                                        onclick="gestionarStock(${producto.id_producto}, '${producto.nombre}', ${producto.cantidad})"
                                        title="Gestionar Stock">
                                    <i class="fas fa-warehouse"></i>
                                </button>
                                <button class="btn btn-outline-danger" 
                                        onclick="eliminarProducto(${producto.id_producto}, '${producto.nombre}')"
                                        title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
        } else {
            throw new Error(response.message || 'Error al cargar productos');
        }
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        tabla.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <p>Error al cargar los productos: ${error.message}</p>
                    <button class="btn btn-sm btn-primary" onclick="cargarProductos()">
                        <i class="fas fa-sync"></i> Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

/**
 * Abrir modal para nuevo producto
 */
function nuevoProducto() {
    // Resetear formulario
    document.getElementById('productoForm').reset();
    document.getElementById('id_producto').value = '';
    document.getElementById('producto-modal-title').textContent = 'Nuevo Producto';
    document.getElementById('producto-save-btn-text').textContent = 'Guardar';
    
    // Valores por defecto
    document.getElementById('estado_producto').value = 'activo';
    document.getElementById('cantidad_producto').value = '0';
    document.getElementById('stock_minimo').value = '1';
    
    // Ocultar mensajes
    document.getElementById('productoError').classList.add('d-none');
    document.getElementById('productoSuccess').classList.add('d-none');
    
    productoModal.show();
}

/**
 * Editar producto existente
 */
async function editarProducto(id) {
    try {
        const response = await api.get(`/productos/${id}`);
        
        if (!response.success || !response.data) {
            throw new Error('No se pudo cargar el producto');
        }
        
        const producto = response.data;
        
        // Llenar formulario
        const elements = {
            id_producto: producto.id_producto,
            nombre_producto: producto.nombre || '',
            marca: producto.marca || '',
            proveedor: producto.proveedor || '',
            descripcion: producto.descripcion || '',
            codigo_barras: producto.codigo_barras || '',
            precio_producto: producto.precio || 0,
            costo_compra: producto.costo_compra || '',
            cantidad_producto: producto.cantidad || 0,
            stock_minimo: producto.stock_minimo || 1,
            estado_producto: producto.estado || 'activo'
        };
        
        // Asignar valores de forma segura
        for (const [key, value] of Object.entries(elements)) {
            const element = document.getElementById(key);
            if (element) {
                element.value = value;
            }
        }
        
        // Limpiar preview de imagen
        const preview = document.getElementById('preview_imagen');
        if (preview) {
            if (producto.imagen_principal) {
                preview.innerHTML = `<img src="${producto.imagen_principal}" class="img-thumbnail" style="max-height: 150px;">`;
            } else {
                preview.innerHTML = '';
            }
        }
        
        // Actualizar título y botón de forma segura
        const modalTitle = document.getElementById('producto-modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Editar Producto';
        }
        
        const saveBtnText = document.getElementById('producto-save-btn-text');
        if (saveBtnText) {
            saveBtnText.textContent = 'Actualizar';
        }
        
        // Ocultar mensajes
        const errorDiv = document.getElementById('productoError');
        const successDiv = document.getElementById('productoSuccess');
        if (errorDiv) errorDiv.classList.add('d-none');
        if (successDiv) successDiv.classList.add('d-none');
        
        productoModal.show();
        
    } catch (error) {
        console.error('Error cargando producto:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la información del producto',
            confirmButtonColor: '#0d6efd',
            background: '#1a1a1a',
            color: '#ffffff',
            customClass: {
                popup: 'swal-dark-theme'
            }
        });
    }
}

/**
 * Guardar producto (crear o actualizar)
 */
async function guardarProducto() {
    const form = document.getElementById('productoForm');
    const errorDiv = document.getElementById('productoError');
    const successDiv = document.getElementById('productoSuccess');
    
    // Validar formulario
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = document.getElementById('id_producto').value;
    
    // Usar FormData para enviar archivos
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre_producto').value);
    formData.append('descripcion', document.getElementById('descripcion').value || '');
    formData.append('marca', document.getElementById('marca').value || '');
    formData.append('precio', parseFloat(document.getElementById('precio_producto').value));
    formData.append('cantidad', parseInt(document.getElementById('cantidad_producto').value));
    formData.append('stock_minimo', parseInt(document.getElementById('stock_minimo').value) || 1);
    formData.append('codigo_barras', document.getElementById('codigo_barras').value || '');
    formData.append('estado', document.getElementById('estado_producto').value);
    formData.append('proveedor', document.getElementById('proveedor').value || '');
    formData.append('costo_compra', document.getElementById('costo_compra').value || '');
    
    // Agregar imagen si se seleccionó
    const imagenInput = document.getElementById('imagen_producto');
    if (imagenInput && imagenInput.files.length > 0) {
        formData.append('imagen', imagenInput.files[0]);
    }
    
    const datos = {
        precio: parseFloat(document.getElementById('precio_producto').value),
        cantidad: parseInt(document.getElementById('cantidad_producto').value)
    };
    
    // Validaciones adicionales
    if (datos.precio <= 0) {
        mostrarError(errorDiv, 'El precio debe ser mayor a cero');
        return;
    }
    
    if (datos.cantidad < 0) {
        mostrarError(errorDiv, 'La cantidad no puede ser negativa');
        return;
    }
    
    try {
        const saveBtn = document.querySelector('#productoModal .btn-primary');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        let response;
        if (id) {
            // Actualizar
            const res = await fetch(`${CONFIG.API_BASE_URL}/productos/${id}`, {
                method: 'PUT',
                body: formData
            });
            response = await res.json();
        } else {
            // Crear
            const res = await fetch(`${CONFIG.API_BASE_URL}/productos`, {
                method: 'POST',
                body: formData
            });
            response = await res.json();
        }
        
        if (response.success) {
            mostrarExito(successDiv, id ? 'Producto actualizado correctamente' : 'Producto registrado correctamente');
            
            // Restaurar botón inmediatamente
            const saveBtn = document.querySelector('#productoModal .btn-primary');
            if (saveBtn) {
                saveBtn.disabled = false;
                const btnText = id ? 'Actualizar' : 'Guardar';
                saveBtn.innerHTML = `<i class="fas fa-save"></i> ${btnText}`;
            }
            
            setTimeout(() => {
                productoModal.hide();
                cargarProductos();
                cargarFiltros(); // Recargar filtros por si hay nueva categoría/marca
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: response.message || 'Operación realizada correctamente',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1a1a1a',
                    color: '#ffffff',
                    customClass: {
                        popup: 'swal-dark-theme'
                    }
                });
            }, 1000);
            
        } else {
            throw new Error(response.message || 'Error al guardar el producto');
        }
        
    } catch (error) {
        console.error('Error guardando producto:', error);
        mostrarError(errorDiv, error.message || 'Error al guardar el producto');
    } finally {
        // Asegurar que el botón siempre se restaure
        const saveBtn = document.querySelector('#productoModal .btn-primary');
        if (saveBtn && saveBtn.disabled) {
            saveBtn.disabled = false;
            const id = document.getElementById('id_producto').value;
            const btnText = id ? 'Actualizar' : 'Guardar';
            saveBtn.innerHTML = `<i class="fas fa-save"></i> ${btnText}`;
        }
    }
}

/**
 * Eliminar producto
 */
async function eliminarProducto(id, nombre) {
    const result = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar producto?',
        html: `
            <p>¿Está seguro de eliminar el producto:</p>
            <p class="fw-bold">${nombre}</p>
            <p class="text-muted">Esta acción no se puede deshacer.</p>
        `,
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#1a1a1a',
        color: '#ffffff',
        customClass: {
            popup: 'swal-dark-theme'
        }
    });
    
    if (result.isConfirmed) {
        try {
            const response = await api.delete(`/productos/${id}`);
            
            if (response.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El producto ha sido eliminado correctamente',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1a1a1a',
                    color: '#ffffff',
                    customClass: {
                        popup: 'swal-dark-theme'
                    }
                });
                
                cargarProductos();
            } else {
                throw new Error(response.message || 'Error al eliminar');
            }
            
        } catch (error) {
            console.error('Error eliminando producto:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo eliminar el producto',
                confirmButtonColor: '#0d6efd',
                background: '#1a1a1a',
                color: '#ffffff',
                customClass: {
                    popup: 'swal-dark-theme'
                }
            });
        }
    }
}

/**
 * Gestionar stock del producto
 */
async function gestionarStock(id, nombre, stockActual) {
    const { value: formValues } = await Swal.fire({
        title: 'Gestionar Stock',
        html: `
            <div class="text-start">
                <p class="mb-3"><strong>Producto:</strong> ${nombre}</p>
                <p class="mb-3"><strong>Stock Actual:</strong> <span class="badge bg-primary">${stockActual} unidades</span></p>
                
                <label class="form-label">Tipo de Operación:</label>
                <select id="swal-operacion" class="form-select mb-3">
                    <option value="agregar">Agregar stock (compra/ingreso)</option>
                    <option value="restar">Restar stock (venta/salida)</option>
                    <option value="ajustar">Ajustar stock (establecer valor exacto)</option>
                </select>
                
                <label class="form-label">Cantidad:</label>
                <input id="swal-cantidad" type="number" class="form-control" min="0" value="1">
                
                <label class="form-label mt-3">Motivo (opcional):</label>
                <textarea id="swal-motivo" class="form-control" rows="2" placeholder="Ej: Compra a proveedor, Venta, Ajuste de inventario..."></textarea>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Aplicar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        background: '#1a1a1a',
        color: '#ffffff',
        customClass: {
            popup: 'swal-dark-theme'
        },
        preConfirm: () => {
            const operacion = document.getElementById('swal-operacion').value;
            const cantidad = parseInt(document.getElementById('swal-cantidad').value);
            const motivo = document.getElementById('swal-motivo').value;
            
            if (!cantidad || cantidad <= 0) {
                Swal.showValidationMessage('Debe ingresar una cantidad válida');
                return false;
            }
            
            return { operacion, cantidad, motivo };
        }
    });
    
    if (formValues) {
        try {
            const { operacion, cantidad, motivo } = formValues;
            
            const response = await api.patch(`/productos/${id}/stock`, {
                operacion,
                cantidad,
                motivo
            });
            
            if (response.success) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Stock actualizado!',
                    text: `Nuevo stock: ${response.data.stock_nuevo} unidades`,
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1a1a1a',
                    color: '#ffffff',
                    customClass: {
                        popup: 'swal-dark-theme'
                    }
                });
                
                cargarProductos();
            } else {
                throw new Error(response.message || 'Error al actualizar stock');
            }
            
        } catch (error) {
            console.error('Error actualizando stock:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo actualizar el stock',
                confirmButtonColor: '#0d6efd',
                background: '#1a1a1a',
                color: '#ffffff',
                customClass: {
                    popup: 'swal-dark-theme'
                }
            });
        }
    }
}

/**
 * Ver productos con stock bajo
 */
async function verProductosStockBajo() {
    try {
        const response = await api.get('/productos/stock-bajo');
        
        if (response.success && response.data && response.data.length > 0) {
            const productosHTML = response.data.map(p => `
                <tr>
                    <td><strong>${p.nombre}</strong></td>
                    <td class="text-center">
                        <span class="badge bg-warning text-dark">${p.cantidad}</span>
                    </td>
                    <td class="text-center">
                        <span class="badge bg-info">${p.stock_minimo}</span>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-primary" onclick="Swal.close(); gestionarStock(${p.id_producto}, '${p.nombre}', ${p.cantidad})">
                            <i class="fas fa-plus"></i> Agregar
                        </button>
                    </td>
                </tr>
            `).join('');
            
            Swal.fire({
                title: '<i class="fas fa-exclamation-triangle text-warning"></i> Productos con Stock Bajo',
                html: `
                    <div class="table-responsive mt-3">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th class="text-center">Stock</th>
                                    <th class="text-center">Mínimo</th>
                                    <th class="text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productosHTML}
                            </tbody>
                        </table>
                    </div>
                `,
                width: '700px',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#0d6efd',
                background: '#1a1a1a',
                color: '#ffffff',
                customClass: {
                    popup: 'swal-dark-theme'
                }
            });
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Todo bien',
                text: 'No hay productos con stock bajo',
                confirmButtonColor: '#0d6efd',
                background: '#1a1a1a',
                color: '#ffffff',
                customClass: {
                    popup: 'swal-dark-theme'
                }
            });
        }
        
    } catch (error) {
        console.error('Error consultando stock bajo:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo consultar el stock',
            confirmButtonColor: '#0d6efd',
            background: '#1a1a1a',
            color: '#ffffff',
            customClass: {
                popup: 'swal-dark-theme'
            }
        });
    }
}

/**
 * Limpiar filtros
 */
function limpiarFiltrosProductos() {
    document.getElementById('filtroCategoria').value = '';
    document.getElementById('filtroMarca').value = '';
    document.getElementById('filtroEstadoProducto').value = '';
    document.getElementById('filtroDisponible').value = '';
    document.getElementById('buscarProducto').value = '';
    cargarProductos();
}

/**
 * Obtener badge HTML según el estado
 */
function obtenerBadgeEstado(estado) {
    const badges = {
        'activo': '<span class="badge bg-success"><i class="fas fa-check-circle"></i> Activo</span>',
        'inactivo': '<span class="badge bg-secondary"><i class="fas fa-pause-circle"></i> Inactivo</span>',
        'descontinuado': '<span class="badge bg-danger"><i class="fas fa-times-circle"></i> Descontinuado</span>'
    };
    
    return badges[estado] || `<span class="badge bg-secondary">${estado}</span>`;
}

/**
 * Obtener badge de stock según cantidad y mínimo
 */
function obtenerBadgeStock(cantidad, stockMinimo) {
    if (cantidad === 0) {
        return `<span class="badge bg-danger"><i class="fas fa-times"></i> ${cantidad}</span>`;
    } else if (cantidad <= stockMinimo) {
        return `<span class="badge bg-warning text-dark"><i class="fas fa-exclamation-triangle"></i> ${cantidad}</span>`;
    } else {
        return `<span class="badge bg-success">${cantidad}</span>`;
    }
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
