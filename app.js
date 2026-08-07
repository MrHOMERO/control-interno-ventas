// ==========================================
// ESTADOS GLOBALES Y DATOS INICIALES
// ==========================================
let catalogo = JSON.parse(localStorage.getItem('carniceria_catalogo')) || [
    { codigo: "18", nombre: "PUCHERO", categoria: "Carnes", precio: 108.00 },
    { codigo: "23", nombre: "CHORIZO MEZCLA", categoria: "Carnes", precio: 345.00 },
    { codigo: "1", nombre: "ASADO", categoria: "Carnes", precio: 380.00 },
    { codigo: "2", nombre: "MILANESA DE CARNE", categoria: "Carnes", precio: 320.00 },
    { codigo: "100", nombre: "COCA COLA 1.5L", categoria: "Bebidas", precio: 120.00 }
];

let carrito = [];
let historialVentas = JSON.parse(localStorage.getItem('carniceria_historial')) || [];
let cajerosRegistrados = JSON.parse(localStorage.getItem('carniceria_cajeros')) || [
    { nombre: "Carlos", pin: "1234" }
];
let turnoActual = JSON.parse(localStorage.getItem('carniceria_turno')) || null;

// Inicialización de la aplicación al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    renderCatalogoGeneral(catalogo);
    renderCarrito();
    actualizarInfoTurnoVisual();
    cargarSelectsCajeros();
});

// ==========================================
// LÓGICA DE ESCANEO Y TICKETS DE BALANZA
// ==========================================
function procesarCodigoBarras() {
    const inputField = document.getElementById('input-buscar-articulo');
    const val = inputField.value.trim();
    if (!val) return;

    // 1. VERIFICAR SI ES UN CÓDIGO DE BARRAS DE BALANZA (Empieza con '2' y tiene 13 dígitos, Ej: 2000180069549)
    if (val.startsWith('2') && val.length === 13) {
        procesarTicketBalanza(val);
        inputField.value = '';
        return;
    }

    // 2. Búsqueda normal por código exacto o nombre de producto
    const prod = catalogo.find(p => p.codigo === val || p.nombre.toLowerCase() === val.toLowerCase());
    if (prod) {
        agregarAlCarritoDirecto(prod.codigo);
        inputField.value = '';
    } else {
        mostrarAlerta("Artículo o código de balanza no encontrado");
    }
}

function procesarTicketBalanza(codigoBalanza) {
    // Estructura del ticket de balanza:
    // Posición 1: '2'
    // Posiciones 2 a 6 (5 dígitos): Código del producto (ej: "00018" -> "18")
    // Posiciones 7 a 11 (5 dígitos): Peso en gramos (ej: "00695" -> 695 gramos = 0.695 kg)
    // Posiciones 12 y 13: Dígitos de control
    
    const codigoProdStr = codigoBalanza.substring(1, 6).replace(/^0+/, ''); 
    const pesoGramosStr = codigoBalanza.substring(6, 11);
    
    const pesoKilos = parseInt(pesoGramosStr, 10) / 1000; // Convierte gramos a kilos exactos (ej: 0.695)

    let producto = catalogo.find(p => p.codigo === codigoProdStr || p.codigo === codigoBalanza.substring(1, 6));

    if (!producto) {
        mostrarAlerta(`Ticket leído, pero el código de producto (${codigoProdStr}) no está cargado.`);
        return;
    }

    if (isNaN(pesoKilos) || pesoKilos <= 0) {
        mostrarAlerta("El ticket de balanza no contiene un peso válido.");
        return;
    }

    agregarItemPorKilo(producto, pesoKilos);
}

function agregarItemPorKilo(producto, kilos) {
    let existente = carrito.find(item => item.codigo === producto.codigo && item.esPorKilo);
    
    if (existente) {
        existente.cantidad += kilos; 
    } else {
        carrito.push({
            ...producto,
            cantidad: kilos, // Almacena los kilos exactos
            esPorKilo: true,
            id: Date.now()
        });
    }
    
    renderCarrito();
    mostrarAlerta(`Agregado: ${kilos.toFixed(3)} kg de ${producto.nombre}`);
}

function agregarAlCarritoDirecto(codigo) {
    const prod = catalogo.find(p => p.codigo === codigo);
    if (!prod) return;

    let existente = carrito.find(item => item.codigo === codigo && !item.esPorKilo);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ ...prod, cantidad: 1, esPorKilo: false, id: Date.now() });
    }
    renderCarrito();
}

function renderCarrito() {
    const tbody = document.getElementById('tabla-carrito');
    tbody.innerHTML = '';
    let totalPagar = 0;

    if (carrito.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-muted py-3">El ticket está vacío</td></tr>`;
        document.getElementById('txt-total-pagar').innerText = "$U 0.00";
        document.getElementById('txt-descuento').innerText = "$U 0.00";
        return;
    }

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        totalPagar += subtotal;
        
        let cantidadTexto = item.esPorKilo ? `${item.cantidad.toFixed(3)} kg` : `${item.cantidad} un`;

        tbody.innerHTML += `
            <tr>
                <td class="text-start ps-2">${item.nombre}</td>
                <td>${cantidadTexto}</td>
                <td class="fw-bold">$U ${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-link text-danger p-0" onclick="eliminarItemCarrito(${item.id})"><i class="fas fa-times"></i></button>
                </td>
            </tr>
        `;
    });

    document.getElementById('txt-total-pagar').innerText = `$U ${totalPagar.toFixed(2)}`;
}

function eliminarItemCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    renderCarrito();
}

function vaciarCarrito() {
    carrito = [];
    renderCarrito();
}

// ==========================================
// GESTIÓN DEL CATÁLOGO Y GRILLA
// ==========================================
function renderCatalogoGeneral(lista) {
    const grilla = document.getElementById('grilla-catalogo');
    if (!grilla) return;
    grilla.innerHTML = '';

    lista.forEach(p => {
        grilla.innerHTML += `
            <div class="col-4">
                <button class="btn btn-outline-secondary w-100 p-2 text-start bg-white border shadow-sm" onclick="agregarAlCarritoDirecto('${p.codigo}')">
                    <div class="fw-bold text-dark text-truncate" style="font-size: 11px;">${p.nombre}</div>
                    <div class="text-success fw-bold" style="font-size: 10px;">$U ${p.precio.toFixed(2)}</div>
                </button>
            </div>
        `;
    });

    renderizarTablaAdminProductos();
}

function filtrarCategoria(cat) {
    if (cat === 'Todos') {
        renderCatalogoGeneral(catalogo);
    } else {
        const filtrados = catalogo.filter(p => p.categoria === cat);
        renderCatalogoGeneral(filtrados);
    }
}

// ==========================================
// COBRO Y TRANSACCIONES
// ==========================================
function cobrar(metodoPago) {
    if (carrito.length === 0) {
        mostrarAlerta("No hay artículos en el ticket actual.");
        return;
    }

    let totalVenta = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    const nuevaVenta = {
        id: "T-" + Math.floor(1000 + Math.random() * 9000),
        fecha: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        cajero: turnoActual ? turnoActual.cajero : "General",
        metodo: metodoPago,
        total: totalVenta,
        items: [...carrito]
    };

    historialVentas.unshift(nuevaVenta);
    localStorage.setItem('carniceria_historial', JSON.stringify(historialVentas));

    if (turnoActual) {
        if (metodoPago === 'Efectivo') turnoActual.ventasEfectivo += totalVenta;
        if (metodoPago === 'Transferencia') turnoActual.ventasTransf += totalVenta;
        localStorage.setItem('carniceria_turno', JSON.stringify(turnoActual));
    }

    vaciarCarrito();
    renderHistorialVentas();
    mostrarAlerta("¡Venta cobrada con éxito!");
}

// ==========================================
// HISTORIAL Y TURNOS
// ==========================================
function renderHistorialVentas() {
    const tbody = document.getElementById('tabla-historial');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (historialVentas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-muted py-3">No hay ventas registradas</td></tr>`;
        return;
    }

    historialVentas.forEach(v => {
        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">${v.id}</td>
                <td>${v.fecha}</td>
                <td>${v.cajero}</td>
                <td><span class="badge bg-secondary">${v.metodo}</span></td>
                <td class="fw-bold text-success">$U ${v.total.toFixed(2)}</td>
                <td><button class="btn btn-outline-dark btn-sm py-0 px-1" onclick="verDetalleVenta('${v.id}')"><i class="fas fa-eye"></i></button></td>
            </tr>
        `;
    });
}

function limpiarHistorial() {
    historialVentas = [];
    localStorage.removeItem('carniceria_historial');
    renderHistorialVentas();
}

function abrirModalTurno() {
    const modal = new bootstrap.Modal(document.getElementById('modalTurno'));
    modal.show();
}

function iniciarTurnoCajero() {
    const horario = document.getElementById('select-horario-turno').value;
    const cajeroNombre = document.getElementById('input-cajero-nombre').value;
    const pin = document.getElementById('input-cajero-pin').value;
    const fondoInicial = parseFloat(document.getElementById('input-fondo-inicial').value) || 0;

    const cajeroEncontrado = cajerosRegistrados.find(c => c.nombre === cajeroNombre && c.pin === pin);
    if (!cajeroEncontrado) {
        mostrarAlerta("PIN de cajero incorrecto o cajero no seleccionado.");
        return;
    }

    turnoActual = {
        horario,
        cajero: cajeroNombre,
        fondoInicial,
        ventasEfectivo: 0,
        ventasTransf: 0
    };

    localStorage.setItem('carniceria_turno', JSON.stringify(turnoActual));
    actualizarInfoTurnoVisual();
    bootstrap.Modal.getInstance(document.getElementById('modalTurno')).hide();
    mostrarAlerta("¡Turno iniciado correctamente!");
}

function actualizarInfoTurnoVisual() {
    const info = document.getElementById('info-turno-actual');
    if (turnoActual) {
        info.innerText = `Turno: ${turnoActual.cajero} (${turnoActual.horario})`;
    } else {
        info.innerText = "Turno: No iniciado";
    }
}

function abrirModalCierreCaja() {
    if (!turnoActual) {
        mostrarAlerta("No hay un turno activo para cerrar.");
        return;
    }

    document.getElementById('cierre-fondo-inicial').innerText = `$U ${turnoActual.fondoInicial.toFixed(2)}`;
    document.getElementById('cierre-ventas-efe').innerText = `$U ${turnoActual.ventasEfectivo.toFixed(2)}`;
    document.getElementById('cierre-ventas-trans').innerText = `$U ${turnoActual.ventasTransf.toFixed(2)}`;
    
    let totalEfectivoCaja = turnoActual.fondoInicial + turnoActual.ventasEfectivo;
    document.getElementById('cierre-total-txt').innerText = `$U ${totalEfectivoCaja.toFixed(2)}`;

    const modal = new bootstrap.Modal(document.getElementById('modalCierreCaja'));
    modal.show();
}

function confirmarCierreCaja() {
    turnoActual = null;
    localStorage.removeItem('carniceria_turno');
    actualizarInfoTurnoVisual();
    bootstrap.Modal.getInstance(document.getElementById('modalCierreCaja')).hide();
    mostrarAlerta("Caja cerrada correctamente.");
}

// ==========================================
// ADMINISTRACIÓN DE CAJEROS Y PRODUCTOS
// ==========================================
function abrirModalCrearUsuario() {
    const modal = new bootstrap.Modal(document.getElementById('modalCrearUsuario'));
    modal.show();
}

function guardarNuevoCajero() {
    const nombre = document.getElementById('nuevo-cajero-nombre').value.trim();
    const pin = document.getElementById('nuevo-cajero-pin').value.trim();

    if (!nombre || !pin) {
        mostrarAlerta("Complete todos los campos del cajero.");
        return;
    }

    cajerosRegistrados.push({ nombre, pin });
    localStorage.setItem('carniceria_cajeros', JSON.stringify(cajerosRegistrados));
    cargarSelectsCajeros();
    bootstrap.Modal.getInstance(document.getElementById('modalCrearUsuario')).hide();
    mostrarAlerta("Cajero registrado con éxito.");
}

function cargarSelectsCajeros() {
    const select = document.getElementById('select-cajero-registrado');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccione Cajero...</option>';
    cajerosRegistrados.forEach(c => {
        select.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
    });
}

function seleccionarCajeroLista(nombre) {
    document.getElementById('input-cajero-nombre').value = nombre;
}

function verificarAccesoAdminTab() {
    const modal = new bootstrap.Modal(document.getElementById('modalAdmin'));
    modal.show();
}

function verificarAccesoAdmin() {
    const pass = document.getElementById('input-admin-pass').value;
    if (pass === "6272") {
        bootstrap.Modal.getInstance(document.getElementById('modalAdmin')).hide();
        document.getElementById('input-admin-pass').value = '';
        renderizarTablaAdminProductos();
    } else {
        mostrarAlerta("PIN de Administrador incorrecto.");
    }
}

function renderizarTablaAdminProductos() {
    const tbody = document.getElementById('tabla-admin-productos');
    if (!tbody) return;
    tbody.innerHTML = '';

    catalogo.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">${p.codigo}</td>
                <td>${p.nombre}</td>
                <td><span class="badge bg-light text-dark border">${p.categoria}</span></td>
                <td class="fw-bold text-success">$U ${p.precio.toFixed(2)}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm py-0 px-1 me-1" onclick="abrirModalEditarProducto('${p.codigo}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-outline-danger btn-sm py-0 px-1" onclick="eliminarProducto('${p.codigo}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function abrirModalNuevoProducto() {
    document.getElementById('titulo-modal-producto').innerText = "Nuevo Artículo";
    document.getElementById('prod-editando-codigo').value = "";
    document.getElementById('prod-codigo').value = "";
    document.getElementById('prod-nombre').value = "";
    document.getElementById('prod-precio').value = "";
    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
}

function abrirModalEditarProducto(codigo) {
    const prod = catalogo.find(p => p.codigo === codigo);
    if (!prod) return;

    document.getElementById('titulo-modal-producto').innerText = "Editar Artículo";
    document.getElementById('prod-editando-codigo').value = prod.codigo;
    document.getElementById('prod-codigo').value = prod.codigo;
    document.getElementById('prod-nombre').value = prod.nombre;
    document.getElementById('prod-categoria').value = prod.categoria;
    document.getElementById('prod-precio').value = prod.precio;

    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
}

function guardarProductoAdmin() {
    const codigoEdit = document.getElementById('prod-editando-codigo').value;
    const codigo = document.getElementById('prod-codigo').value.trim();
    const nombre = document.getElementById('prod-nombre').value.trim().toUpperCase();
    const categoria = document.getElementById('prod-categoria').value;
    const precio = parseFloat(document.getElementById('prod-precio').value);

    if (!codigo || !nombre || isNaN(precio)) {
        mostrarAlerta("Complete todos los campos correctamente.");
        return;
    }

    if (codigoEdit) {
        let index = catalogo.findIndex(p => p.codigo === codigoEdit);
        if (index !== -1) {
            catalogo[index] = { codigo, nombre, categoria, precio };
        }
    } else {
        if (catalogo.some(p => p.codigo === codigo)) {
            mostrarAlerta("Ya existe un producto con ese código.");
            return;
        }
        catalogo.push({ codigo, nombre, categoria, precio });
    }

    localStorage.setItem('carniceria_catalogo', JSON.stringify(catalogo));
    renderCatalogoGeneral(catalogo);
    bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
    mostrarAlerta("Artículo guardado con éxito.");
}

function eliminarProducto(codigo) {
    if (confirm("¿Está seguro de eliminar este artículo del catálogo?")) {
        catalogo = catalogo.filter(p => p.codigo !== codigo);
        localStorage.setItem('carniceria_catalogo', JSON.stringify(catalogo));
        renderCatalogoGeneral(catalogo);
    }
}

// ==========================================
// UTILIDADES GENERALES
// ==========================================
function mostrarAlerta(mensaje) {
    document.getElementById('texto-alerta-personalizada').innerText = mensaje;
    const modal = new bootstrap.Modal(document.getElementById('modalAlerta'));
    modal.show();
}
