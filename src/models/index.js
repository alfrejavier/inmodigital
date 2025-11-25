const Propietario = require('./Propietario');
const Cliente = require('./Cliente');
const Propiedad = require('./Propiedad');
const Venta = require('./Venta');
const Foto = require('./Foto');
const Caracteristica = require('./Caracteristica');
const Usuario = require('./Usuario');
const Producto = require('./Producto');

// Crear instancias de los modelos
const propietario = new Propietario();
const cliente = new Cliente();
const propiedad = new Propiedad();
const venta = new Venta();
const foto = new Foto();
const caracteristica = new Caracteristica();
const usuario = new Usuario();

module.exports = {
    Propietario,
    Cliente,
    Propiedad,
    Venta,
    Foto,
    Caracteristica,
    Usuario,
    Producto,
    // Instancias listas para usar
    propietario,
    cliente,
    propiedad,
    venta,
    foto,
    caracteristica,
    usuario
};