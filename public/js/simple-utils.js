/**
 * Utilidades simples para debugging
 */
class SimpleUtils {
    static showAlert(message, type = 'info') {
        console.log('SimpleUtils.showAlert llamada:', message, type);
        
        // Versión muy simple usando alert nativo como fallback
        alert(`${type.toUpperCase()}: ${message}`);
        
        // También intentar mostrar un div simple
        try {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} position-fixed`;
            alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
            alertDiv.innerHTML = `<strong>${message}</strong>`;
            document.body.appendChild(alertDiv);
            
            setTimeout(() => {
                if (alertDiv && alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 3000);
            
        } catch (e) {
            console.error('Error creando div de alerta:', e);
        }
    }
}

// Reemplazar Utils temporalmente
window.Utils = SimpleUtils;
console.log('✅ SimpleUtils cargado como reemplazo');