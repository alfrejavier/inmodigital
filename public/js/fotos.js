/**
 * Gestión de fotos de propiedades
 */

// Gestionar fotos de una propiedad
async function gestionarFotos(propiedadId) {
    try {
        // Cargar fotos existentes
        const response = await fetch(`${CONFIG.API_BASE_URL}/fotos/propiedad/${propiedadId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error cargando fotos');
        }
        
        const fotos = data.data || [];
        
        // Crear HTML para el modal
        let html = `
            <div class="mb-4">
                <h6 class="mb-3">Fotos actuales (${fotos.length}):</h6>
                <div id="galeriaFotos" class="row g-2 mb-3">
                    ${fotos.length > 0 ? fotos.map(foto => `
                        <div class="col-md-4 col-sm-6" id="foto-${foto.id}">
                            <div class="card">
                                <img src="${foto.ruta}" class="card-img-top" alt="Foto propiedad" 
                                     style="height: 200px; object-fit: cover; cursor: pointer;"
                                     onclick="verFotoCompleta('${foto.ruta}')">
                                <div class="card-body p-2 text-center">
                                    <button class="btn btn-sm btn-danger w-100" 
                                            onclick="eliminarFoto(${foto.id}, ${propiedadId})">
                                        <i class="fas fa-trash"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('') : '<div class="col-12"><p class="text-muted text-center">No hay fotos registradas</p></div>'}
                </div>
                
                <hr>
                
                <h6 class="mb-3">Subir nuevas fotos:</h6>
                <form id="formFotos" onsubmit="subirFotos(event, ${propiedadId})">
                    <div class="mb-3">
                        <input type="file" class="form-control" id="inputFotos" 
                               accept="image/jpeg,image/jpg,image/png,image/webp" 
                               multiple required>
                        <div class="form-text">
                            Puedes seleccionar hasta 10 fotos. Formatos: JPG, PNG, WEBP. Máximo 5MB por foto.
                        </div>
                    </div>
                    <div id="previsualizacion" class="row g-2 mb-3"></div>
                    <button type="submit" class="btn btn-primary w-100">
                        <i class="fas fa-upload"></i> Subir Fotos
                    </button>
                </form>
            </div>
        `;
        
        // Mostrar modal con SweetAlert2
        Swal.fire({
            title: '<i class="fas fa-images"></i> Gestionar Fotos',
            html: html,
            width: '800px',
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
                popup: 'swal-wide'
            },
            didOpen: () => {
                // Agregar listener para previsualización
                const inputFotos = document.getElementById('inputFotos');
                if (inputFotos) {
                    inputFotos.addEventListener('change', previsualizarFotos);
                }
            }
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

// Previsualizar fotos antes de subir
function previsualizarFotos(event) {
    const files = event.target.files;
    const previsualizacion = document.getElementById('previsualizacion');
    
    if (!previsualizacion) return;
    
    previsualizacion.innerHTML = '';
    
    if (files.length === 0) return;
    
    if (files.length > 10) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'warning',
            title: 'Máximo 10 fotos a la vez',
            showConfirmButton: false,
            timer: 3000
        });
        event.target.value = '';
        return;
    }
    
    Array.from(files).forEach((file, index) => {
        // Validar tamaño
        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: `${file.name} supera 5MB`,
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = 'col-md-3 col-sm-4 col-6';
            div.innerHTML = `
                <div class="card">
                    <img src="${e.target.result}" class="card-img-top" 
                         style="height: 120px; object-fit: cover;">
                    <div class="card-body p-2">
                        <small class="text-muted d-block text-truncate">${file.name}</small>
                        <small class="text-muted">${(file.size / 1024).toFixed(1)} KB</small>
                    </div>
                </div>
            `;
            previsualizacion.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

// Subir fotos
async function subirFotos(event, propiedadId) {
    event.preventDefault();
    
    const inputFotos = document.getElementById('inputFotos');
    const files = inputFotos.files;
    
    if (files.length === 0) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'warning',
            title: 'Selecciona al menos una foto',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }
    
    // Crear FormData
    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append('fotos', file);
    });
    
    // Mostrar loading
    Swal.fire({
        title: 'Subiendo fotos...',
        html: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/fotos/propiedad/${propiedadId}`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: data.message,
                showConfirmButton: false,
                timer: 2000
            });
            // Recargar el modal
            setTimeout(() => gestionarFotos(propiedadId), 2000);
        } else {
            throw new Error(data.message || 'Error subiendo fotos');
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

// Eliminar foto
async function eliminarFoto(fotoId, propiedadId) {
    const confirmacion = await Swal.fire({
        title: '¿Eliminar foto?',
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
            const response = await fetch(`${CONFIG.API_BASE_URL}/fotos/${fotoId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Foto eliminada',
                    showConfirmButton: false,
                    timer: 2000
                });
                // Recargar el modal
                setTimeout(() => gestionarFotos(propiedadId), 2000);
            } else {
                throw new Error(data.message || 'Error eliminando foto');
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

// Ver foto en tamaño completo (lightbox)
function verFotoCompleta(ruta) {
    Swal.fire({
        imageUrl: ruta,
        imageAlt: 'Foto de propiedad',
        showConfirmButton: false,
        showCloseButton: true,
        width: 'auto',
        padding: '0',
        background: 'transparent',
        backdrop: 'rgba(0,0,0,0.9)'
    });
}
