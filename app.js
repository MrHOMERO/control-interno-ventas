// Variables globales y base de datos simulada en memoria
let catalogo = [
    { codigo: "101", nombre: "Asado de Tira", categoria: "Carnes", precio: 350 },
    { codigo: "102", nombre: "Carne Picada", categoria: "Carnes", precio: 280 },
    { codigo: "201", nombre: "Coca Cola 2L", categoria: "Bebidas", precio: 120 },
    { codigo: "301", nombre: "Pan Flauta", categoria: "Almacén", precio: 80 }
];
let carrito = [];
let ventas = [];
let compras = [];
let logs = [];
let cajeros = [{ nombre: "Admin", pin: "1234" }];
let cajeroActual = null;
let metodoPagoActual = "Efectivo";

// Instancias de Modales de Bootstrap
let modalTurno, modalCierre, modalAdmin, modalProducto, modalAlerta, modalCompra;

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar modales
    modalTurno = new bootstrap.Modal(document.getElementById('modalTurno'));
    modalCierre = new bootstrap.Modal(document.getElementById('modalCierreCaja'));
    modalAdmin = new bootstrap.Modal(document.getElementById('modalAdmin'));
    modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
    modalAlerta = new bootstrap.Modal(document.getElementById('modalAlerta'));
    modalCompra = new bootstrap.Modal(document.getElementById('modalCompra'));

    actualizarMetodoPago();
    mostrarCajero();
    renderTablaAdminProductos();
});

// Cambiar entre vista POS y Dashboard
function switchTab(tab) {
    document.getElementById('view-pos').style.display = tab === 'pos' ? 'flex' : 'none';
    document.getElementById('view-dashboard').style.display = tab === 'pos' ? 'none' : 'flex';
    if (tab === 'dashboard') actualizarDashboard();
}

// Alertas y Bitácora
function mostrarAlerta(mensaje) {
    document.getElementById('texto-alerta-personalizada').textContent = mensaje;
    modalAlerta.show();
}

function registrarLog(accion) {
    const fecha = new Date().toLocaleString();
    const usuario = cajeroActual ? cajeroActual.nombre : "Sistema";
    logs.push({ fecha, usuario, accion });
    const tbody = document.getElementById('tabla-logs');
    if(tbody) {
        tbody.innerHTML = logs.map(l => `<tr><td>${l.fecha}</td><td>${l.usuario}</td><td class="text-start">${l.accion}</td></tr>`).join('');
    }
}

// Lógica de Búsqueda y Escáner
function manejarEnterEscanner(e) {
    if (e.key === 'Enter') procesarCodigoBarras();
}

function procesarCodigoBarras() {
    const input = document.getElementById('input-buscar-articulo').value.trim().toLowerCase();
    if (!input) return;

    const producto = catalogo.find(p => p.codigo === input || p.nombre.toLowerCase().includes(input));
    const resultDiv = document.getElementById('single-product-result');

    if (producto) {
        // Si es carne, pide peso. Si no, pide cantidad.
        let inputHtml = producto.categoria === "Carnes" 
            ? `<input type="number" id="input-peso-${producto.codigo}" class="form-control form-control-sm me-2" placeholder="Ej: 1.5 (Kg)" step="0.01" style="width: 100px;">`
            : `<input type="number" id="input-cant-${producto.codigo}" class="form-control form-control-sm me-2" value="1" min="1" style="width: 80px;">`;
            
        resultDiv.innerHTML = `
            <div class="card border-primary shadow-sm">
                <div class="card-body d-flex justify-content-between align-items-center p-2">
                    <div>
                        <h6 class="m-0 fw-bold text-primary">${producto.nombre}</h6>
                        <small class="text-muted">Cód: ${producto.codigo} | $U ${producto.precio} ${producto.categoria === 'Carnes' ? '/Kg' : '/u'}</small>
                    </div>
                    <div class="d-flex align-items-center">
                        ${inputHtml}
                        <button class="btn btn-primary btn-sm fw-bold" onclick="agregarAlCarrito('${producto.codigo}')">
                            <i class="fas fa-plus"></i> Agregar
                        </button>
                    </div>
                </div>
            </div>`;
        resultDiv.style.display = 'block';
    } else {
        resultDiv.style.display = 'none';
        mostrarAlerta("Artículo no encontrado. Verifique el código.");
    }
}

function filtrarCatalogoRapido() {
    // Aquí se puede agregar lógica futura de autocompletado si se desea.
}

// Carrito de Compras
function agregarAlCarrito(codigo) {
    const producto = catalogo.find(p => p.codigo === codigo);
    let cantidad = 1;

    if (producto.categoria === "Carnes") {
        let peso = parseFloat(document.getElementById(`input-peso-${codigo}`).value);
        if (isNaN(peso) || peso <= 0) return mostrarAlerta("Ingrese un peso válido en Kg.");
        cantidad = peso;
    } else {
        cantidad = parseInt(document.getElementById(`input-cant-${codigo}`).value);
        if (isNaN(cantidad) || cantidad <= 0) return mostrarAlerta("Ingrese una cantidad válida.");
    }

    carrito.push({ ...producto, cantidad, id: Date.now() });
    document.getElementById('input-buscar-articulo').value = '';
    document.getElementById('single-product-result').style.display = 'none';
    document.getElementById('input-buscar-articulo').focus();
    renderCarrito();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    renderCarrito();
}

function actualizarMetodoPago() {
    const radios = document.getElementsByName('btnradio_pago');
    for (let r of radios) {
        if (r.checked) metodoPagoActual = r.value;
    }
    renderCarrito();
}

function renderCarrito() {
    const list = document.getElementById('cart-items');
    let subtotal = 0;
    let descuentoTotal = 0;

    if (carrito.length === 0) {
        list.innerHTML = `<li class="list-group-item text-center text-muted py-4 small">El carrito está vacío</li>`;
        document.getElementById('contador-ventas').textContent = "0 Ventas";
    } else {
        list.innerHTML = '';
        carrito.forEach(item => {
            let precioItem = item.precio * item.cantidad;
            subtotal += precioItem;
            
            // Lógica Descuento (10% en carnes en Efectivo/Transf)
            let descuentoItem = 0;
            if (item.categoria === "Carnes" && (metodoPagoActual === "Efectivo" || metodoPagoActual === "Transferencia")) {
                descuentoItem = precioItem * 0.10;
                descuentoTotal += descuentoItem;
            }

            let cantStr = item.categoria === "Carnes" ? `${item.cantidad} Kg` : `${item.cantidad} u`;
            
            list.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center lh-sm p-2">
                    <div>
                        <h6 class="my-0 small fw-bold">${item.nombre}</h6>
                        <small class="text-muted">${cantStr} x $U ${item.precio}</small>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="text-dark small fw-bold">$U ${(precioItem - descuentoItem).toFixed(2)}</span>
                        <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarDelCarrito(${item.id})"><i class="fas fa-times"></i></button>
                    </div>
                </li>`;
        });
        document.getElementById('contador-ventas').textContent = `${carrito.length} Items`;
    }

    let total = subtotal - descuentoTotal;
    document.getElementById('cart-subtotal').textContent = `$U ${subtotal.toFixed(2)}`;
    document.getElementById('cart-descuento-monto').textContent = `-$U ${descuentoTotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$U ${total.toFixed(2)}`;
}

function cobrarVenta() {
    if (carrito.length === 0) return mostrarAlerta("El carrito está vacío.");
    if (!cajeroActual) return mostrarAlerta("Debe iniciar turno con un cajero antes de cobrar.");

    let subtotal = 0, descuentoTotal = 0;
    
    carrito.forEach(item => {
        let precioItem = item.precio * item.cantidad;
        subtotal += precioItem;
        if (item.categoria === "Carnes" && (metodoPagoActual === "Efectivo" || metodoPagoActual === "Transferencia")) {
            descuentoTotal += (precioItem * 0.10);
        }
    });

    let total = subtotal - descuentoTotal;
    
    ventas.push({
        id: Date.now(),
        cajero: cajeroActual.nombre,
        metodo: metodoPagoActual,
        items: [...carrito],
        subtotal,
        descuento: descuentoTotal,
        total,
        fecha: new Date()
    });

    registrarLog(`Venta cobrada: $U ${total.toFixed(2)} (${metodoPagoActual})`);
    carrito = [];
    renderCarrito();
    actualizarTotalesFooter();
    mostrarAlerta("¡Venta cobrada y registrada con éxito!");
    // Turnos y Cajeros
function abrirModalTurno() { modalTurno.show(); }

function registrarNuevoCajero() {
    const nombre = document.getElementById('input-cajero-nombre').value.trim();
    const pin = document.getElementById('input-cajero-pin').value.trim();
    if(!nombre || !pin) return mostrarAlerta("Ingrese nombre y PIN válidos.");
    cajeros.push({nombre, pin});
    registrarLog(`Nuevo cajero registrado: ${nombre}`);
    mostrarAlerta("Cajero registrado. Ahora seleccione 'Iniciar Turno'.");
}

function iniciarTurnoCajero() {
    const nombre = document.getElementById('input-cajero-nombre').value.trim();
    const pin = document.getElementById('input-cajero-pin').value.trim();
    const cajeroEncontrado = cajeros.find(x => x.nombre === nombre && x.pin === pin);
    
    if(cajeroEncontrado) {
        cajeroActual = cajeroEncontrado;
        mostrarCajero();
        registrarLog(`Turno iniciado por: ${nombre}`);
        modalTurno.hide();
    } else {
        mostrarAlerta("Credenciales incorrectas.");
    }
}

function mostrarCajero() {
    document.getElementById('label-cajero-actual').textContent = cajeroActual ? `Cajero: ${cajeroActual.nombre}` : "Cajero: Ninguno";
    document.getElementById('cierre-cajero-txt').textContent = cajeroActual ? cajeroActual.nombre : "Ninguno";
}

// Compras (Gastos)
function abrirModalCompra() { modalCompra.show(); }

function guardarCompra() {
    const prov = document.getElementById('input-compra-proveedor').value.trim();
    const monto = parseFloat(document.getElementById('input-compra-monto').value);
    
    if(!prov || isNaN(monto) || monto <= 0) return mostrarAlerta("Datos de compra inválidos.");
    
    compras.push({ proveedor: prov, monto, fecha: new Date() });
    registrarLog(`Gasto/Compra: ${prov} por $U ${monto}`);
    actualizarTotalesFooter();
    modalCompra.hide();
    document.getElementById('input-compra-proveedor').value = '';
    document.getElementById('input-compra-monto').value = '';
}

// Cierre de Caja y Footer
function actualizarTotalesFooter() {
    let tEfectivo = 0, tTransf = 0, tDebito = 0, tDesc = 0, tCompras = 0;
    
    ventas.forEach(v => {
        if(v.metodo === 'Efectivo') tEfectivo += v.total;
        if(v.metodo === 'Transferencia') tTransf += v.total;
        if(v.metodo === 'Debito') tDebito += v.total;
        tDesc += v.descuento;
    });

    compras.forEach(c => tCompras += c.monto);

    document.getElementById('total-efectivo-ui').textContent = `$U ${tEfectivo.toFixed(2)}`;
    document.getElementById('total-transf-ui').textContent = `$U ${tTransf.toFixed(2)}`;
    document.getElementById('total-debito-ui').textContent = `$U ${tDebito.toFixed(2)}`;
    document.getElementById('total-descuentos-turno-ui').textContent = `$U ${tDesc.toFixed(2)}`;
    document.getElementById('total-compras-turno-ui').textContent = `$U ${tCompras.toFixed(2)}`;
    
    const cajaEfectivo = tEfectivo - tCompras;
    document.getElementById('caja-efectivo-total').textContent = `$U ${cajaEfectivo.toFixed(2)}`;
    document.getElementById('cierre-total-txt').textContent = `$U ${cajaEfectivo.toFixed(2)}`;
}

function abrirModalCierreCaja() { modalCierre.show(); }

function confirmarCierreCaja() {
    registrarLog(`Caja cerrada. Cajero: ${cajeroActual ? cajeroActual.nombre : 'Desconocido'}`);
    ventas = [];
    compras = [];
    cajeroActual = null;
    mostrarCajero();
    actualizarTotalesFooter();
    modalCierre.hide();
    mostrarAlerta("Cierre de caja realizado. Los totales de este turno se han reiniciado.");
}

// Lógica del Administrador
function verAdmin() { modalAdmin.show(); }
function manejarEnterAdmin(e) { if(e.key === 'Enter') verificarAccesoAdmin(); }

function verificarAccesoAdmin() {
    const pass = document.getElementById('input-admin-pass').value;
    if(pass === "1234") { // Contraseña genérica por defecto
        modalAdmin.hide();
        document.getElementById('input-admin-pass').value = '';
        switchTab('dashboard');
    } else {
        mostrarAlerta("Contraseña incorrecta. Pista: use 1234");
    }
}

// Gestión de Productos (Admin)
function abrirModalNuevoProducto() { modalProducto.show(); }

function guardarProductoAdmin() {
    const codigo = document.getElementById('prod-codigo').value.trim();
    const nombre = document.getElementById('prod-nombre').value.trim();
    const cat = document.getElementById('prod-categoria').value;
    const precio = parseFloat(document.getElementById('prod-precio').value);

    if(!codigo || !nombre || isNaN(precio)) return mostrarAlerta("Por favor complete todos los campos.");
    
    catalogo.push({ codigo, nombre, categoria: cat, precio });
    registrarLog(`Artículo creado: ${nombre} (${codigo})`);
    renderTablaAdminProductos();
    modalProducto.hide();
    
    // Limpiar modal
    document.getElementById('prod-codigo').value = '';
    document.getElementById('prod-nombre').value = '';
    document.getElementById('prod-precio').value = '';
}

function renderTablaAdminProductos() {
    const tbody = document.getElementById('tabla-admin-productos');
    const filtro = document.getElementById('input-admin-buscar-prod') ? document.getElementById('input-admin-buscar-prod').value.toLowerCase() : '';
    
    tbody.innerHTML = catalogo.filter(p => p.nombre.toLowerCase().includes(filtro) || p.codigo.includes(filtro))
        .map(p => `<tr>
            <td>${p.codigo}</td>
            <td>${p.nombre}</td>
            <td><span class="badge bg-secondary">${p.categoria}</span></td>
            <td>$U ${p.precio}</td>
            <td class="text-end"><button class="btn btn-sm btn-outline-danger py-0" onclick="eliminarProducto('${p.codigo}')"><i class="fas fa-trash"></i></button></td>
        </tr>`).join('');
}

function eliminarProducto(cod) {
    catalogo = catalogo.filter(p => p.codigo !== cod);
    registrarLog(`Artículo eliminado: Cód. ${cod}`);
    renderTablaAdminProductos();
}

// Actualización del Dashboard (Admin)
function actualizarDashboard() {
    // Totales rápidos
    const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);
    document.getElementById('admin-reporte-dia').innerHTML = `<strong>Total hoy:</strong> $U ${totalVentas.toFixed(2)}<br><small>${ventas.length} ventas procesadas</small>`;
    
    // Lógica Tabla Kilos Carnes
    const kilosVendidos = {};
    ventas.forEach(v => {
        v.items.forEach(i => {
            if(i.categoria === 'Carnes') {
                if(!kilosVendidos[i.codigo]) kilosVendidos[i.codigo] = { nombre: i.nombre, kilos: 0, recaudado: 0 };
                kilosVendidos[i.codigo].kilos += i.cantidad;
                kilosVendidos[i.codigo].recaudado += (i.cantidad * i.precio); // Sin descuento aplicado al item individual visualmente para simplificar
            }
        });
    });

    document.getElementById('tabla-kilos-admin').innerHTML = Object.keys(kilosVendidos).map(cod => `
        <tr>
            <td>${cod}</td>
            <td class="text-start">${kilosVendidos[cod].nombre}</td>
            <td class="fw-bold text-success">${kilosVendidos[cod].kilos.toFixed(2)} Kg</td>
            <td>$U ${kilosVendidos[cod].recaudado.toFixed(2)}</td>
        </tr>
    `).join('') || `<tr><td colspan="4" class="text-muted py-3">No hay registros de ventas de carnes</td></tr>`;
    
    renderChart();
}

// Gráfica de Métodos de Pago
let salesChart = null;
function renderChart() {
    const ctx = document.getElementById('salesChart');
    if(!ctx) return;
    if(salesChart) salesChart.destroy();
    
    let efe = 0, tra = 0, deb = 0;
    ventas.forEach(v => {
        if(v.metodo === 'Efectivo') efe += v.total;
        if(v.metodo === 'Transferencia') tra += v.total;
        if(v.metodo === 'Debito') deb += v.total;
    });

    salesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Efectivo', 'Transferencia', 'Débito'],
            datasets: [{ 
                data: [efe, tra, deb], 
                backgroundColor: ['#198754', '#0d6efd', '#0dcaf0'] 
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}
                                              }
