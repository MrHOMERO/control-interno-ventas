let catalogo = JSON.parse(localStorage.getItem('minipos_catalogo')) || [];
if (catalogo.length === 0) {
    for (let i = 1; i <= 50; i++) {
        catalogo.push({
            codigo: i.toString(),
            nombre: `Corte Vacuno Especial ${i}`,
            categoria: "Carnes",
            precio: parseFloat((250 + (i * 0.5)).toFixed(2))
        });
    }
    catalogo.push(
        { codigo: "501", nombre: "Coca Cola 2L", categoria: "Bebidas", precio: 130 },
        { codigo: "601", nombre: "Pan Flauta 1Kg", categoria: "Almacén", precio: 90 }
    );
    localStorage.setItem('minipos_catalogo', JSON.stringify(catalogo));
}

let carrito = [];
let ventas = JSON.parse(localStorage.getItem('minipos_ventas')) || [];
let compras = JSON.parse(localStorage.getItem('minipos_compras')) || [];
let cierresHistorial = JSON.parse(localStorage.getItem('minipos_cierresHistorial')) || [];

let proveedoresRegistrados = JSON.parse(localStorage.getItem('minipos_proveedores')) || ["Frigorífico Modelo", "Distribuidora Carnes del Este", "Bebidas Uruguay S.A."];
let cajerosRegistrados = JSON.parse(localStorage.getItem('minipos_cajeros')) || [
    { nombre: "Admin", pin: "6272" },
    { nombre: "Juan Pérez", pin: "1111" }
];

let cajeroActual = JSON.parse(localStorage.getItem('minipos_cajeroActual')) || null;
let horarioTurnoActual = localStorage.getItem('minipos_horarioTurno') || "Sin Turno";
let fondoInicialCaja = parseFloat(localStorage.getItem('minipos_fondoInicial')) || 0;
let metodoPagoActual = "Efectivo";
let filtroTemporalActual = "hoy";

let modalTurno, modalCrearUsuario, modalCompras, modalCrearProveedor, modalCierre, modalAdmin, modalProducto, modalAlerta;
let chartVentasGastosInstancia = null;
let chartCortesInstancia = null;
let chartKilosInstancia = null;

document.addEventListener("DOMContentLoaded", () => {
    modalTurno = new bootstrap.Modal(document.getElementById('modalTurno'));
    modalCrearUsuario = new bootstrap.Modal(document.getElementById('modalCrearUsuario'));
    modalCompras = new bootstrap.Modal(document.getElementById('modalCompras'));
    modalCrearProveedor = new bootstrap.Modal(document.getElementById('modalCrearProveedor'));
    modalCierre = new bootstrap.Modal(document.getElementById('modalCierreCaja'));
    modalAdmin = new bootstrap.Modal(document.getElementById('modalAdmin'));
    modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
    modalAlerta = new bootstrap.Modal(document.getElementById('modalAlerta'));

    if (cajeroActual) {
        document.getElementById('label-cajero-actual').textContent = `Cajero: ${cajeroActual.nombre}`;
    }

    renderCatalogoGeneral(catalogo);
    actualizarMetodoPago();
    renderCarrito();
    actualizarResumenTurno();
});

function guardarEnStorage() {
    localStorage.setItem('minipos_catalogo', JSON.stringify(catalogo));
    localStorage.setItem('minipos_ventas', JSON.stringify(ventas));
    localStorage.setItem('minipos_compras', JSON.stringify(compras));
    localStorage.setItem('minipos_cierresHistorial', JSON.stringify(cierresHistorial));
    localStorage.setItem('minipos_proveedores', JSON.stringify(proveedoresRegistrados));
    localStorage.setItem('minipos_cajeros', JSON.stringify(cajerosRegistrados));
    localStorage.setItem('minipos_cajeroActual', JSON.stringify(cajeroActual));
    localStorage.setItem('minipos_horarioTurno', horarioTurnoActual);
    localStorage.setItem('minipos_fondoInicial', fondoInicialCaja);
}

function switchTab(tab) {
    document.getElementById('view-pos').style.display = tab === 'pos' ? 'block' : 'none';
    document.getElementById('view-dashboard').style.display = tab === 'pos' ? 'none' : 'block';
    if (tab === 'dashboard') actualizarDashboardAdmin();
}

function mostrarAlerta(msg) {
    document.getElementById('texto-alerta-personalizada').textContent = msg;
    modalAlerta.show();
}

function renderCatalogoGeneral(lista) {
    const contenedor = document.getElementById('lista-catalogo-general');
    if (lista.length === 0) {
        contenedor.innerHTML = `<p class="text-center text-muted small my-2">No se encontraron artículos</p>`;
        return;
    }
    contenedor.innerHTML = lista.map(p => `
        <div class="d-flex justify-content-between align-items-center border-bottom py-1 px-1">
            <div>
                <span class="badge bg-secondary" style="font-size: 10px;">Cód: ${p.codigo}</span>
                ${p.categoria === 'Carnes' ? '<span class="badge bg-success" style="font-size: 9px;">Carnes (Desc. Real)</span>' : ''}
                <div class="fw-bold small text-dark">${p.nombre}</div>
            </div>
            <div class="d-flex align-items-center gap-2">
                <span class="text-success fw-bold small">$U ${p.precio}</span>
                <button class="btn btn-outline-danger btn-sm py-0 px-2" style="font-size: 11px;" onclick="agregarAlCarritoDirecto('${p.codigo}')">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function filtrarCatalogoRapido(val) {
    const query = val.toLowerCase().trim();
    const filtrados = catalogo.filter(p => p.codigo.includes(query) || p.nombre.toLowerCase().includes(query));
    renderCatalogoGeneral(filtrados);
}

function manejarEnterEscanner(e) {
    if (e.key === 'Enter') procesarCodigoBarras();
}

/**
 * PROCESADOR INTELIGENTE DE CÓDIGO DE BARRAS / ESCÁNER / BALANZA
 * Soporta:
 * 1. Códigos normales del catálogo.
 * 2. Tickets de balanza (ej. formato estándar de 13 dígitos que empieza con '2': 
 *    - Dígito 1: Prefix '2'
 *    - Dígitos 2-5: Código del producto (4 dígitos, ej. '0001')
 *    - Dígitos 6-12: Precio total o Peso integrado en centavos/gramos, o lectura directa).
 */
function procesarCodigoBarras() {
    const inputElem = document.getElementById('input-buscar-articulo');
    const val = inputElem.value.trim();
    if (!val) return;

    // Verificar si es un código de balanza (ej. longitud de 12 o 13 caracteres iniciando con '2')
    if (val.length >= 12 && val.startsWith('2')) {
        // Extraer código de producto (usualmente del índice 1 al 5, ej: 4 dígitos)
        const codigoProvisorio = String(parseInt(val.substring(1, 5), 10)); // Quita ceros a la izquierda para emparejar con el catálogo
        const prod = catalogo.find(p => p.codigo === codigoProvisorio || p.codigo === val.substring(1, 5));
        
        if (prod) {
            // Extraer valor de precio o peso de los dígitos siguientes (ej: últimos dígitos divididos por 100 para dar formato moneda)
            // Estándar común: 5 dígitos de precio/peso (ej. los caracteres del 6 al 11)
            const valorRaw = parseInt(val.substring(5, 11), 10) / 100;
            let cantidadCalculada = 1;

            if (!isNaN(valorRaw) && valorRaw > 0 && prod.precio > 0) {
                // Si el valor representa el precio total del ticket de balanza, calculamos el peso exacto (kilos)
                cantidadCalculada = parseFloat((valorRaw / prod.precio).toFixed(3));
            }

            agregarAlCarritoConCantidad(prod.codigo, cantidadCalculada);
            inputElem.value = '';
            renderCatalogoGeneral(catalogo);
            return;
        }
    }

    // Búsqueda normal por código exacto o nombre
    const prodNormal = catalogo.find(p => p.codigo === val || p.nombre.toLowerCase() === val.toLowerCase());
    if (prodNormal) {
        agregarAlCarritoDirecto(prodNormal.codigo);
        inputElem.value = '';
        renderCatalogoGeneral(catalogo);
    } else {
        mostrarAlerta("Artículo o ticket de balanza no encontrado");
    }
}

function agregarAlCarritoDirecto(codigo) {
    agregarAlCarritoConCantidad(codigo, 1);
}

function agregarAlCarritoConCantidad(codigo, cantidad) {
    const producto = catalogo.find(p => p.codigo === codigo);
    if (!producto) return;

    let existente = carrito.find(item => item.codigo === codigo);
    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad: cantidad, id: Date.now() });
    }
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
        list.innerHTML = `<li class="list-group-item text-center text-muted py-3 small">El carrito está vacío</li>`;
    } else {
        list.innerHTML = '';
        carrito.forEach(item => {
            let precioItem = item.precio * item.cantidad;
            subtotal += precioItem;
            
            let descuentoItem = 0;
            if (item.categoria === "Carnes" && (metodoPagoActual === "Efectivo" || metodoPagoActual === "Transferencia")) {
                descuentoItem = precioItem * 0.10;
                descuentoTotal += descuentoItem;
            }

            list.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center py-2 px-1">
                    <div>
                        <div class="fw-bold small text-dark">${item.nombre} ${item.categoria === 'Carnes' ? '<span class="badge bg-success" style="font-size: 8px;">Carnes</span>' : ''}</div>
                        <small class="text-muted" style="font-size: 11px;">${item.cantidad} kg/un. x $U ${item.precio}</small>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="text-dark fw-bold small">$U ${(precioItem - descuentoItem).toFixed(2)}</span>
                        <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarDelCarrito(${item.id})"><i class="fas fa-times"></i></button>
                    </div>
                </li>`;
        });
    }

    let total = subtotal - descuentoTotal;
    document.getElementById('cart-subtotal').textContent = `$U ${subtotal.toFixed(2)}`;
    document.getElementById('cart-descuento-monto').textContent = `-$U ${descuentoTotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$U ${total.toFixed(2)}`;
}

function cobrarVenta() {
    if (carrito.length === 0) return mostrarAlerta("El carrito está vacío.");
    if (!cajeroActual) return mostrarAlerta("Debe iniciar turno primero.");

    let subtotal = 0, descuentoTotal = 0;
    let itemsVenta = [];
    
    carrito.forEach(item => {
        let pItem = item.precio * item.cantidad;
        subtotal += pItem;
        let descItem = 0;
        if (item.categoria === "Carnes" && (metodoPagoActual === "Efectivo" || metodoPagoActual === "Transferencia")) {
            descItem = pItem * 0.10;
            descuentoTotal += descItem;
        }
        itemsVenta.push({
            codigo: item.codigo,
            nombre: item.nombre,
            categoria: item.categoria,
            cantidad: item.cantidad,
            precioUnitario: item.precio,
            subtotal: pItem - descItem
        });
    });

    const ahora = new Date();
    ventas.push({
        id: Date.now(),
        fechaIso: ahora.toISOString(),
        cajero: cajeroActual.nombre,
        fechaHora: ahora.toLocaleDateString() + ' ' + ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metodo: metodoPagoActual,
        total: subtotal - descuentoTotal,
        descuento: descuentoTotal,
        items: itemsVenta
    });

    carrito = [];
    guardarEnStorage();
    renderCarrito();
    actualizarResumenTurno();
    mostrarAlerta("¡Venta cobrada con éxito!");
}

function abrirModalCompras() {
    if (!cajeroActual) return mostrarAlerta("Debe iniciar turno primero.");
    const select = document.getElementById('select-proveedor-registrado');
    select.innerHTML = proveedoresRegistrados.map(p => `<option value="${p}">${p}</option>`).join('');
    if (proveedoresRegistrados.length > 0) {
        document.getElementById('input-compra-proveedor').value = proveedoresRegistrados[0];
    }
    document.getElementById('input-compra-monto').value = '';
    modalCompras.show();
}

function seleccionarProveedorLista(nombre) {
    document.getElementById('input-compra-proveedor').value = nombre;
}

function abrirModalCrearProveedor() {
    modalCompras.hide();
    document.getElementById('nuevo-proveedor-nombre').value = '';
    modalCrearProveedor.show();
}

function guardarNuevoProveedor() {
    const nombre = document.getElementById('nuevo-proveedor-nombre').value.trim();
    if (!nombre) return mostrarAlerta("Ingrese el nombre del proveedor.");
    if (proveedoresRegistrados.some(p => p.toLowerCase() === nombre.toLowerCase())) {
        return mostrarAlerta("El proveedor ya se encuentra registrado.");
    }
    proveedoresRegistrados.push(nombre);
    guardarEnStorage();
    modalCrearProveedor.hide();
    mostrarAlerta(`Proveedor ${nombre} guardado con éxito.`);
    abrirModalCompras();
}

function registrarCompraProveedor() {
    const proveedor = document.getElementById('input-compra-proveedor').value.trim();
    const monto = parseFloat(document.getElementById('input-compra-monto').value);
    const pago = document.getElementById('select-compra-pago').value;

    if (!proveedor || isNaN(monto) || monto <= 0) {
        return mostrarAlerta("Seleccione un proveedor válido y un monto mayor a 0.");
    }

    const ahora = new Date();
    compras.push({
        id: Date.now(),
        fechaIso: ahora.toISOString(),
        fechaHora: ahora.toLocaleDateString() + ' ' + ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proveedor,
        monto,
        pago
    });

    guardarEnStorage();
    modalCompras.hide();
    actualizarResumenTurno();
    mostrarAlerta(`Compra registrada a ${proveedor} por $U ${monto.toFixed(2)} (${pago}).`);
}

function abrirModalTurno() {
    const select = document.getElementById('select-cajero-registrado');
    select.innerHTML = cajerosRegistrados.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
    if (cajerosRegistrados.length > 0) {
        document.getElementById('input-cajero-nombre').value = cajerosRegistrados[0].nombre;
    }
    document.getElementById('input-fondo-inicial').value = '';
    modalTurno.show();
}

function seleccionarCajeroLista(nombre) {
    document.getElementById('input-cajero-nombre').value = nombre;
}

function abrirModalCrearUsuario() {
    modalTurno.hide();
    document.getElementById('nuevo-cajero-nombre').value = '';
    document.getElementById('nuevo-cajero-pin').value = '';
    modalCrearUsuario.show();
}

function guardarNuevoCajero() {
    const nombre = document.getElementById('nuevo-cajero-nombre').value.trim();
    const pin = document.getElementById('nuevo-cajero-pin').value.trim();

    if (!nombre || !pin) return mostrarAlerta("Complete el nombre y el PIN del nuevo cajero.");
    if (cajerosRegistrados.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
        return mostrarAlerta("Ya existe un cajero registrado con ese nombre.");
    }

    cajerosRegistrados.push({ nombre, pin });
    guardarEnStorage();
    modalCrearUsuario.hide();
    mostrarAlerta(`Cajero ${nombre} registrado con éxito.`);
    abrirModalTurno();
}

function iniciarTurnoCajero() {
    const horario = document.getElementById('select-horario-turno').value;
    const nombre = document.getElementById('input-cajero-nombre').value;
    const pin = document.getElementById('input-cajero-pin').value.trim();
    const fondoInput = document.getElementById('input-fondo-inicial').value.trim();
    const fondo = parseFloat(fondoInput);

    const cajeroEncontrado = cajerosRegistrados.find(c => c.nombre === nombre && c.pin === pin);
    if (!cajeroEncontrado) return mostrarAlerta("PIN incorrecto o cajero no válido.");
    if (fondoInput === "" || isNaN(fondo) || fondo <= 0) {
        return mostrarAlerta("Debe ingresar un fondo inicial válido (mayor a 0).");
    }

    cajeroActual = cajeroEncontrado;
    horarioTurnoActual = horario;
    fondoInicialCaja = fondo;
    guardarEnStorage();

    document.getElementById('label-cajero-actual').textContent = `Cajero: ${nombre}`;
    modalTurno.hide();
    actualizarResumenTurno();
    mostrarAlerta(`Turno ${horario} iniciado con $U ${fondo.toFixed(2)} en caja.`);
}

function actualizarResumenTurno() {
    let tEfe = 0, tTra = 0, tDeb = 0, tDesc = 0;
    ventas.forEach(v => {
        if (v.metodo === 'Efectivo') tEfe += v.total;
        if (v.metodo === 'Transferencia') tTra += v.total;
        if (v.metodo === 'Debito') tDeb += v.total;
        tDesc += v.descuento;
    });

    let comprasEfe = 0, comprasTrans = 0;
    compras.forEach(c => {
        if (c.pago === 'Efectivo') comprasEfe += c.monto;
        if (c.pago === 'Transferencia') comprasTrans += c.monto;
    });

    let cajaFisicaEfectivo = fondoInicialCaja + tEfe - comprasEfe;

    document.getElementById('label-horario-turno').textContent = horarioTurnoActual;
    document.getElementById('contador-ventas-turno').textContent = `${ventas.length} Ventas Total`;
    document.getElementById('resumen-efectivo').textContent = `$U ${tEfe.toFixed(2)}`;
    document.getElementById('resumen-transf').textContent = `$U ${tTra.toFixed(2)}`;
    document.getElementById('resumen-debito').textContent = `$U ${tDeb.toFixed(2)}`;
    document.getElementById('resumen-compras-efe').textContent = `-$U ${comprasEfe.toFixed(2)}`;
    document.getElementById('resumen-compras-trans').textContent = `-$U ${comprasTrans.toFixed(2)}`;
    document.getElementById('resumen-descuentos').textContent = `$U ${tDesc.toFixed(2)}`;
    document.getElementById('resumen-fondo-caja').textContent = `$U ${cajaFisicaEfectivo.toFixed(2)}`;
}

function abrirModalCierreCaja() {
    if (!cajeroActual) return mostrarAlerta("Debe iniciar turno primero.");

    let tEfe = 0, tTra = 0, tDeb = 0, tDesc = 0;
    ventas.forEach(v => {
        if (v.metodo === 'Efectivo') tEfe += v.total;
        if (v.metodo === 'Transferencia') tTra += v.total;
        if (v.metodo === 'Debito') tDeb += v.total;
        tDesc += v.descuento;
    });

    let comprasEfe = 0;
    compras.forEach(c => {
        if (c.pago === 'Efectivo') comprasEfe += c.monto;
    });

    let cajaFisicaEfectivo = fondoInicialCaja + tEfe - comprasEfe;

    document.getElementById('cierre-fondo-inicial').textContent = `$U ${fondoInicialCaja.toFixed(2)}`;
    document.getElementById('cierre-ventas-efe').textContent = `$U ${tEfe.toFixed(2)}`;
    document.getElementById('cierre-compras-efe').textContent = `-$U ${comprasEfe.toFixed(2)}`;
    document.getElementById('cierre-ventas-trans').textContent = `$U ${tTra.toFixed(2)}`;
    document.getElementById('cierre-ventas-deb').textContent = `$U ${tDeb.toFixed(2)}`;
    document.getElementById('cierre-descuentos').textContent = `$U ${tDesc.toFixed(2)}`;
    document.getElementById('cierre-total-txt').textContent = `$U ${cajaFisicaEfectivo.toFixed(2)}`;

    modalCierre.show();
}

function confirmarCierreCaja() {
    let tEfe = 0;
    ventas.forEach(v => { if (v.metodo === 'Efectivo') tEfe += v.total; });
    let comprasEfe = 0;
    compras.forEach(c => { if (c.pago === 'Efectivo') comprasEfe += c.monto; });
    let cajaFisicaEfectivo = fondoInicialCaja + tEfe - comprasEfe;

    cierresHistorial.push({
        fechaHora: new Date().toLocaleString(),
        fondoInicial: fondoInicialCaja,
        ventasEfectivo: tEfe,
        comprasEfectivo: comprasEfe,
        totalCaja: cajaFisicaEfectivo,
        cajero: cajeroActual ? cajeroActual.nombre : "Desconocido"
    });

    fondoInicialCaja = 0;
    horarioTurnoActual = "Sin Turno";
    cajeroActual = null;
    guardarEnStorage();

    document.getElementById('label-cajero-actual').textContent = "Cajero: Ninguno";
    actualizarResumenTurno();
    modalCierre.hide();
    mostrarAlerta("Cierre guardado. El historial de ventas y compras permanece intacto.");
}

function verAdmin() { modalAdmin.show(); }
function verificarAccesoAdmin() {
    if (document.getElementById('input-admin-pass').value === "6272") {
        modalAdmin.hide();
        document.getElementById('input-admin-pass').value = '';
        switchTab('dashboard');
    } else {
        mostrarAlerta("PIN incorrecto (PIN Administrador: 6272)");
    }
}

function cambiarFiltroTemporal(tipo) {
    filtroTemporalActual = tipo;
    ['hoy', 'semana', 'mes', 'historico'].forEach(t => {
        const btn = document.getElementById(`btn-filtro-${t}`);
        if (btn) btn.classList.remove('active');
    });
    document.getElementById(`btn-filtro-${tipo}`).classList.add('active');
    actualizarDashboardAdmin();
}

function filtrarPorTiempo(lista) {
    if (filtroTemporalActual === 'historico') return lista;

    const ahora = new Date();
    return lista.filter(item => {
        if (!item.fechaIso) return true;
        const fechaItem = new Date(item.fechaIso);

        if (filtroTemporalActual === 'hoy') {
            return fechaItem.toDateString() === ahora.toDateString();
        } else if (filtroTemporalActual === 'semana') {
            const unDiaMs = 24 * 60 * 60 * 1000;
            const diffDias = Math.abs((ahora - fechaItem) / unDiaMs);
            return diffDias <= 7;
        } else if (filtroTemporalActual === 'mes') {
            return fechaItem.getMonth() === ahora.getMonth() && fechaItem.getFullYear() === ahora.getFullYear();
        }
        return true;
    });
}

function actualizarDashboardAdmin() {
    const ventasFiltradas = filtrarPorTiempo(ventas);
    const comprasFiltradas = filtrarPorTiempo(compras);

    let totalEfe = 0, totalDeb = 0, totalTra = 0;
    ventasFiltradas.forEach(v => {
        if (v.metodo === 'Efectivo') totalEfe += v.total;
        if (v.metodo === 'Debito') totalDeb += v.total;
        if (v.metodo === 'Transferencia') totalTra += v.total;
    });

    let totalGastos = 0;
    comprasFiltradas.forEach(c => { totalGastos += c.monto; });

    document.getElementById('admin-total-efe').textContent = `$U ${totalEfe.toFixed(2)}`;
    document.getElementById('admin-total-deb').textContent = `$U ${totalDeb.toFixed(2)}`;
    document.getElementById('admin-total-tra').textContent = `$U ${totalTra.toFixed(2)}`;
    document.getElementById('admin-total-gastos').textContent = `$U ${totalGastos.toFixed(2)}`;

    let mapaKilos = {};
    let mapaCortesMonto = {};
    ventasFiltradas.forEach(v => {
        v.items.forEach(i => {
            if (!mapaKilos[i.codigo]) {
                mapaKilos[i.codigo] = { codigo: i.codigo, nombre: i.nombre, categoria: i.categoria, cantidad: 0 };
            }
            mapaKilos[i.codigo].cantidad += i.cantidad;

            if (!mapaCortesMonto[i.nombre]) {
                mapaCortesMonto[i.nombre] = 0;
            }
            mapaCortesMonto[i.nombre] += i.subtotal;
        });
    });

    const tbodyKilos = document.getElementById('tabla-admin-kilos');
    const listaKilosArr = Object.values(mapaKilos);
    if (listaKilosArr.length === 0) {
        tbodyKilos.innerHTML = `<tr><td colspan="4" class="text-muted py-2">No hay ventas registradas en este periodo</td></tr>`;
    } else {
        tbodyKilos.innerHTML = listaKilosArr.map(k => `
            <tr>
                <td><span class="badge bg-secondary">${k.codigo}</span></td>
                <td class="text-start fw-bold">${k.nombre}</td>
                <td>${k.categoria}</td>
                <td class="text-success fw-bold">${k.cantidad.toFixed(3)} kg / un.</td>
            </tr>
        `).join('');
    }

    const tbodyTrans = document.getElementById('tabla-admin-transacciones');
    if (ventasFiltradas.length === 0) {
        tbodyTrans.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-2">Sin transacciones registradas</td></tr>`;
    } else {
        tbodyTrans.innerHTML = ventasFiltradas.slice().reverse().map(v => `
            <tr class="border-bottom">
                <td class="text-center text-muted" style="font-size: 11px;">${v.fechaHora}</td>
                <td class="text-center fw-bold text-primary">${v.cajero}</td>
                <td class="text-center"><span class="badge bg-dark">${v.metodo}</span></td>
                <td>
                    <ul class="list-unstyled m-0" style="font-size: 11px;">
                        ${v.items.map(i => `<li>• ${i.cantidad.toFixed(3)}x ${i.nombre} ($U ${i.subtotal.toFixed(2)})</li>`).join('')}
                    </ul>
                </td>
                <td class="text-end fw-bold text-success">$U ${v.total.toFixed(2)}</td>
            </tr>
        `).join('');
    }

    const tbodyCierres = document.getElementById('tabla-admin-cierres');
    if (cierresHistorial.length === 0) {
        tbodyCierres.innerHTML = `<tr><td colspan="5" class="text-muted py-2">No hay cierres registrados aún</td></tr>`;
    } else {
        tbodyCierres.innerHTML = cierresHistorial.slice().reverse().map(c => `
            <tr>
                <td>${c.fechaHora} (${c.cajero})</td>
                <td>$U ${c.fondoInicial.toFixed(2)}</td>
                <td class="text-success">$U ${c.ventasEfectivo.toFixed(2)}</td>
                <td class="text-danger">-$U ${c.comprasEfectivo.toFixed(2)}</td>
                <td class="fw-bold">$U ${c.totalCaja.toFixed(2)}</td>
            </tr>
        `).join('');
    }

    renderTablaAdminProductos();
    renderizarGraficas(totalEfe, totalTra, totalDeb, totalGastos, mapaCortesMonto, listaKilosArr);
}

function renderizarGraficas(tEfe, tTra, tDeb, tGastos, mapaCortesMonto, listaKilosArr) {
    if (chartVentasGastosInstancia) chartVentasGastosInstancia.destroy();
    if (chartCortesInstancia) chartCortesInstancia.destroy();
    if (chartKilosInstancia) chartKilosInstancia.destroy();

    const ctx1 = document.getElementById('chartVentasGastos').getContext('2d');
    chartVentasGastosInstancia = new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: ['Efectivo', 'Transferencia', 'Débito/Créd.', 'Gastos/Compras'],
            datasets: [{
                data: [tEfe, tTra, tDeb, tGastos],
                backgroundColor: ['#198754', '#0d6efd', '#0dcaf0', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } }
        }
    });

    const cortesLabels = Object.keys(mapaCortesMonto).slice(0, 5);
    const cortesData = Object.values(mapaCortesMonto).slice(0, 5);
    const ctx2 = document.getElementById('chartCortes').getContext('2d');
    chartCortesInstancia = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: cortesLabels.length > 0 ? cortesLabels : ['Sin Datos'],
            datasets: [{
                label: 'Ingresos ($U)',
                data: cortesData.length > 0 ? cortesData : [0],
                backgroundColor: '#ffc107'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { font: { size: 9 } } }, x: { ticks: { font: { size: 9 } } } }
        }
    });

    const topKilos = listaKilosArr.sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
    const kilosLabels = topKilos.map(k => k.nombre);
    const kilosData = topKilos.map(k => k.cantidad);
    const ctx3 = document.getElementById('chartKilos').getContext('2d');
    chartKilosInstancia = new Chart(ctx3, {
        type: 'doughnut',
        data: {
            labels: kilosLabels.length > 0 ? kilosLabels : ['Sin Datos'],
            datasets: [{
                data: kilosData.length > 0 ? kilosData : [1],
                backgroundColor: ['#6610f2', '#6f42c1', '#d63384', '#fd7e14', '#20c997']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 } } } }
        }
    });
}

function renderTablaAdminProductos() {
    const tbody = document.getElementById('tabla-admin-productos');
    tbody.innerHTML = catalogo.map(p => `
        <tr>
            <td class="fw-bold">${p.codigo}</td>
            <td class="text-start">${p.nombre}</td>
            <td><span class="badge bg-secondary">${p.categoria}</span></td>
            <td class="fw-bold text-success">$U ${p.precio}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary py-0 px-1 me-1" onclick="abrirModalEditarProducto('${p.codigo}')" title="Editar"><i class="fas fa-pen"></i></button>
                <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarArticulo('${p.codigo}')" title="Eliminar"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function abrirModalNuevoProducto() {
    document.getElementById('prod-editando-codigo').value = "";
    document.getElementById('prod-codigo').value = "";
    document.getElementById('prod-nombre').value = "";
    document.getElementById('prod-categoria').value = "Carnes";
    document.getElementById('prod-precio').value = "";
    document.getElementById('titulo-modal-producto').textContent = "Nuevo Artículo";
    modalProducto.show();
}

function abrirModalEditarProducto(codigo) {
    let p = catalogo.find(item => item.codigo === codigo);
    if (!p) return;

    document.getElementById('prod-editando-codigo').value = p.codigo;
    document.getElementById('prod-codigo').value = p.codigo;
    document.getElementById('prod-nombre').value = p.nombre;
    document.getElementById('prod-categoria').value = p.categoria;
    document.getElementById('prod-precio').value = p.precio;
    document.getElementById('titulo-modal-producto').textContent = "Editar Artículo";
    modalProducto.show();
}

function guardarProductoAdmin() {
    const codigoAntiguo = document.getElementById('prod-editando-codigo').value;
    const codigo = document.getElementById('prod-codigo').value.trim();
    const nombre = document.getElementById('prod-nombre').value.trim();
    const categoria = document.getElementById('prod-categoria').value;
    const precio = parseFloat(document.getElementById('prod-precio').value);

    if (!codigo || !nombre || isNaN(precio)) {
        return mostrarAlerta("Complete todos los campos correctamente.");
    }

    if (codigoAntiguo === "") {
        let existente = catalogo.find(p => p.codigo === codigo);
        if (existente) return mostrarAlerta("Ya existe un producto con ese código.");
        catalogo.push({ codigo, nombre, categoria, precio });
        mostrarAlerta("Artículo agregado con éxito.");
    } else {
        let p = catalogo.find(item => item.codigo === codigoAntiguo);
        if (p) {
            p.codigo = codigo;
            p.nombre = nombre;
            p.categoria = categoria;
            p.precio = precio;
            mostrarAlerta("Artículo actualizado con éxito.");
        }
    }

    guardarEnStorage();
    renderCatalogoGeneral(catalogo);
    renderTablaAdminProductos();
    modalProducto.hide();
}

function eliminarArticulo(codigo) {
    catalogo = catalogo.filter(p => p.codigo !== codigo);
    guardarEnStorage();
    renderCatalogoGeneral(catalogo);
    renderTablaAdminProductos();
}
