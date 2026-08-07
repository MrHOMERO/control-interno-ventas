let catalogo = [];
for (let i = 1; i <= 200; i++) {
    catalogo.push({
        codigo: i.toString(),
        nombre: `Corte de Carnicería Especial ${i}`,
        categoria: "Carnes",
        precio: parseFloat((250 + (i * 0.5)).toFixed(2))
    });
}
catalogo.push(
    { codigo: "501", nombre: "Coca Cola 2L", categoria: "Bebidas", precio: 130 },
    { codigo: "601", nombre: "Pan Flauta 1Kg", categoria: "Almacén", precio: 90 }
);

let carrito = [];
let ventas = [];
let compras = [];
let proveedoresGuardados = ["Frigorífico Modelo", "Distribuidora Carnes del Este", "Bebidas Uruguay S.A."];
let cajerosRegistrados = [
    { nombre: "Admin", pin: "1234" },
    { nombre: "Juan Pérez", pin: "1111" }
];
let cajeroActual = null;
let horarioTurnoActual = "Sin Turno";
let fondoInicialCaja = 0;
let metodoPagoActual = "Efectivo";

let modalTurno, modalCrearUsuario, modalCompras, modalCierre, modalAdmin, modalProducto, modalAlerta;

document.addEventListener("DOMContentLoaded", () => {
    modalTurno = new bootstrap.Modal(document.getElementById('modalTurno'));
    modalCrearUsuario = new bootstrap.Modal(document.getElementById('modalCrearUsuario'));
    modalCompras = new bootstrap.Modal(document.getElementById('modalCompras'));
    modalCierre = new bootstrap.Modal(document.getElementById('modalCierreCaja'));
    modalAdmin = new bootstrap.Modal(document.getElementById('modalAdmin'));
    modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
    modalAlerta = new bootstrap.Modal(document.getElementById('modalAlerta'));

    renderCatalogoGeneral(catalogo);
    actualizarMetodoPago();
    renderCarrito();
    actualizarResumenTurno();
});

function switchTab(tab) {
    document.getElementById('view-pos').style.display = tab === 'pos' ? 'block' : 'none';
    document.getElementById('view-dashboard').style.display = tab === 'pos' ? 'none' : 'block';
    if (tab === 'dashboard') renderTablaAdminProductos();
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

function procesarCodigoBarras() {
    const val = document.getElementById('input-buscar-articulo').value.trim();
    const prod = catalogo.find(p => p.codigo === val || p.nombre.toLowerCase() === val.toLowerCase());
    if (prod) {
        agregarAlCarritoDirecto(prod.codigo);
        document.getElementById('input-buscar-articulo').value = '';
        renderCatalogoGeneral(catalogo);
    } else {
        mostrarAlerta("Artículo no encontrado");
    }
}

function agregarAlCarritoDirecto(codigo) {
    const producto = catalogo.find(p => p.codigo === codigo);
    if (!producto) return;

    let existente = carrito.find(item => item.codigo === codigo);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1, id: Date.now() });
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
                        <small class="text-muted" style="font-size: 11px;">${item.cantidad} x $U ${item.precio}</small>
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
    carrito.forEach(item => {
        let pItem = item.precio * item.cantidad;
        subtotal += pItem;
        if (item.categoria === "Carnes" && (metodoPagoActual === "Efectivo" || metodoPagoActual === "Transferencia")) {
            descuentoTotal += (pItem * 0.10);
        }
    });

    ventas.push({
        metodo: metodoPagoActual,
        total: subtotal - descuentoTotal,
        descuento: descuentoTotal
    });

    carrito = [];
    renderCarrito();
    actualizarResumenTurno();
    mostrarAlerta("¡Venta cobrada con éxito!");
}

// Gestión de Compras y Proveedores
function abrirModalCompras() {
    if (!cajeroActual) return mostrarAlerta("Debe iniciar turno primero.");
    
    const datalist = document.getElementById('lista-proveedores-sugeridos');
    datalist.innerHTML = proveedoresGuardados.map(p => `<option value="${p}">`).join('');
    
    document.getElementById('input-compra-proveedor').value = '';
    document.getElementById('input-compra-monto').value = '';
    modalCompras.show();
}

function registrarCompraProveedor() {
    const proveedor = document.getElementById('input-compra-proveedor').value.trim();
    const monto = parseFloat(document.getElementById('input-compra-monto').value);
    const pago = document.getElementById('select-compra-pago').value;

    if (!proveedor || isNaN(monto) || monto <= 0) {
        return mostrarAlerta("Ingrese un proveedor válido y un monto mayor a 0.");
    }

    if (!proveedoresGuardados.includes(proveedor)) {
        proveedoresGuardados.push(proveedor);
    }

    compras.push({ proveedor, monto, pago });
    modalCompras.hide();
    actualizarResumenTurno();
    mostrarAlerta(`Compra registrada a ${proveedor} por $U ${monto.toFixed(2)} (${pago}).`);
}

// Turnos y Registro de Cajeros Nuevos
function abrirModalTurno() {
    const select = document.getElementById('select-cajero-registrado');
    select.innerHTML = cajerosRegistrados.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
    if (cajerosRegistrados.length > 0) {
        document.getElementById('input-cajero-nombre').value = cajerosRegistrados[0].nombre;
    }
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

    if (!nombre || !pin) {
        return mostrarAlerta("Complete el nombre y el PIN del nuevo cajero.");
    }

    if (cajerosRegistrados.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
        return mostrarAlerta("Ya existe un cajero registrado con ese nombre.");
    }

    cajerosRegistrados.push({ nombre, pin });
    modalCrearUsuario.hide();
    mostrarAlerta(`Cajero ${nombre} registrado con éxito.`);
    abrirModalTurno(); // Volver al modal de turno para iniciar
}

function iniciarTurnoCajero() {
    const horario = document.getElementById('select-horario-turno').value;
    const nombre = document.getElementById('input-cajero-nombre').value;
    const pin = document.getElementById('input-cajero-pin').value.trim();
    const fondo = parseFloat(document.getElementById('input-fondo-inicial').value);

    const cajeroEncontrado = cajerosRegistrados.find(c => c.nombre === nombre && c.pin === pin);

    if (!cajeroEncontrado) {
        return mostrarAlerta("PIN incorrecto o cajero no válido.");
    }

    if (isNaN(fondo)) {
        return mostrarAlerta("Ingrese un fondo inicial válido.");
    }

    cajeroActual = cajeroEncontrado;
    horarioTurnoActual = horario;
    fondoInicialCaja = fondo;
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
    document.getElementById('contador-ventas-turno').textContent = `${ventas.length} Ventas`;
    document.getElementById('resumen-efectivo').textContent = `$U ${tEfe.toFixed(2)}`;
    document.getElementById('resumen-transf').textContent = `$U ${tTra.toFixed(2)}`;
    document.getElementById('resumen-debito').textContent = `$U ${tDeb.toFixed(2)}`;
    document.getElementById('resumen-compras-efe').textContent = `-$U ${comprasEfe.toFixed(2)}`;
    document.getElementById('resumen-compras-trans').textContent = `$U ${comprasTrans.toFixed(2)}`;
    document.getElementById('resumen-descuentos').textContent = `$U ${tDesc.toFixed(2)}`;
    document.getElementById('resumen-fondo-caja').textContent = `$U ${cajaFisicaEfectivo.toFixed(2)}`;
    document.getElementById('cierre-total-txt').textContent = `$U ${cajaFisicaEfectivo.toFixed(2)}`;
}

function abrirModalCierreCaja() { modalCierre.show(); }
function confirmarCierreCaja() {
    ventas = [];
    compras = [];
    fondoInicialCaja = 0;
    horarioTurnoActual = "Sin Turno";
    cajeroActual = null;
    document.getElementById('label-cajero-actual').textContent = "Cajero: Ninguno";
    actualizarResumenTurno();
    modalCierre.hide();
    mostrarAlerta("Caja cerrada y reseteada para el próximo turno.");
}

function verAdmin() { modalAdmin.show(); }
function verificarAccesoAdmin() {
    if (document.getElementById('input-admin-pass').value === "1234") {
        modalAdmin.hide();
        document.getElementById('input-admin-pass').value = '';
        switchTab('dashboard');
    } else {
        mostrarAlerta("Clave incorrecta (Pista: 1234)");
    }
}

function renderTablaAdminProductos() {
    const tbody = document.getElementById('tabla-admin-productos');
    tbody.innerHTML = catalogo.map(p => `
        <tr>
            <td class="fw-bold">${p.codigo}</td>
            <td class="text-start">${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>$U ${p.precio}</td>
            <td><button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="eliminarArticulo('${p.codigo}')"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
}

function abrirModalNuevoProducto() { modalProducto.show(); }
function guardarProductoAdmin() {
    const codigo = document.getElementById('prod-codigo').value.trim();
    const nombre = document.getElementById('prod-nombre').value.trim();
    const categoria = document.getElementById('prod-categoria').value;
    const precio = parseFloat(document.getElementById('prod-precio').value);

    if (codigo && nombre && !isNaN(precio)) {
        catalogo.push({ codigo, nombre, categoria, precio });
        renderCatalogoGeneral(catalogo);
        renderTablaAdminProductos();
        modalProducto.hide();
        mostrarAlerta("Artículo agregado con éxito.");
    } else {
        mostrarAlerta("Complete todos los campos.");
    }
}

function eliminarArticulo(codigo) {
    catalogo = catalogo.filter(p => p.codigo !== codigo);
    renderCatalogoGeneral(catalogo);
    renderTablaAdminProductos();
}
