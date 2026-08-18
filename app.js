// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
let productosInventario = JSON.parse(localStorage.getItem('inventario_carniceria')) || [
    { codigo: "1", nombre: "Asado de Res", categoria: "Carnicería", precio: 320 },
    { codigo: "2", nombre: "Vacio", categoria: "Carnicería", precio: 380 },
    { codigo: "3", nombre: "Milanesa de Pollo", categoria: "Carnicería", precio: 290 }
];

let carrito = [];
let turnoActivo = JSON.parse(localStorage.getItem('turno_activo_carniceria')) || null;
let ventasTurno = JSON.parse(localStorage.getItem('ventas_turno_carniceria')) || [];
let comprasTurno = JSON.parse(localStorage.getItem('compras_turno_carniceria')) || [];
let cajerosRegistrados = JSON.parse(localStorage.getItem('cajeros_carniceria')) || [{ nombre: "Admin", pin: "6272" }];
let proveedoresRegistrados = JSON.parse(localStorage.getItem('proveedores_carniceria')) || [{ nombre: "Frigorífico Local" }];
let ventasHistoricas = JSON.parse(localStorage.getItem('ventas_historicas_carniceria')) || [];

let metodoPagoSeleccionado = "Efectivo";
let filtroTemporalActual = "hoy";

// ==========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    actualizarSelectoresListas();
    verificarEstadoTurnoVisual();
    filtrarCatalogoRapido("");
    actualizarVistaCarrito();
});

// ==========================================
// GESTIÓN DE TURNOS Y CAJEROS
// ==========================================
function actualizarSelectoresListas() {
    const selCajero = document.getElementById('select-cajero-registrado');
    if (selCajero) {
        selCajero.innerHTML = '<option value="">Seleccione cajero...</option>';
        cajerosRegistrados.forEach(c => {
            selCajero.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
        });
    }

    const selProveedor = document.getElementById('select-proveedor-registrado');
    if (selProveedor) {
        selProveedor.innerHTML = '<option value="">Seleccione proveedor...</option>';
        proveedoresRegistrados.forEach(p => {
            selProveedor.innerHTML += `<option value="${p.nombre}">${p.nombre}</option>`;
        });
    }
}

function seleccionarCajeroLista(nombre) {
    document.getElementById('input-cajero-nombre').value = nombre;
}

function seleccionarProveedorLista(nombre) {
    document.getElementById('input-compra-proveedor').value = nombre;
}

function abrirModalTurno() {
    new bootstrap.Modal(document.getElementById('modalTurno')).show();
}

function abrirModalCrearUsuario() {
    new bootstrap.Modal(document.getElementById('modalCrearUsuario')).show();
}

function guardarNuevoCajero() {
    const nombre = document.getElementById('nuevo-cajero-nombre').value.trim();
    const pin = document.getElementById('nuevo-cajero-pin').value.trim();
    if (!nombre || !pin) {
        alert("Complete todos los campos del cajero.");
        return;
    }
    cajerosRegistrados.push({ nombre, pin });
    localStorage.setItem('cajeros_carniceria', JSON.stringify(cajerosRegistrados));
    document.getElementById('nuevo-cajero-nombre').value = '';
    document.getElementById('nuevo-cajero-pin').value = '';
    bootstrap.Modal.getInstance(document.getElementById('modalCrearUsuario')).hide();
    actualizarSelectoresListas();
}

function iniciarTurnoCajero() {
    const horario = document.getElementById('select-horario-turno').value;
    const cajero = document.getElementById('input-cajero-nombre').value;
    const pin = document.getElementById('input-cajero-pin').value;
    const fondo = parseFloat(document.getElementById('input-fondo-inicial').value);

    let cajeroValido = cajerosRegistrados.find(c => c.nombre === cajero && c.pin === pin);
    if (!cajeroValido) {
        alert("PIN incorrecto o cajero no seleccionado.");
        return;
    }

    if (isNaN(fondo) || fondo < 0) {
        alert("Ingrese un fondo inicial válido.");
        return;
    }

    turnoActivo = {
        cajero: cajero,
        horario: horario,
        fondoInicial: fondo,
        inicio: new Date().toISOString()
    };

    localStorage.setItem('turno_activo_carniceria', JSON.stringify(turnoActivo));
    ventasTurno = [];
    comprasTurno = [];
    localStorage.setItem('ventas_turno_carniceria', JSON.stringify(ventasTurno));
    localStorage.setItem('compras_turno_carniceria', JSON.stringify(comprasTurno));

    bootstrap.Modal.getInstance(document.getElementById('modalTurno')).hide();
    verificarEstadoTurnoVisual();
}

function verificarEstadoTurnoVisual() {
    const labelCajero = document.getElementById('label-cajero-actual');
    const panelCajero = document.getElementById('panel-nombre-cajero');
    const panelHorario = document.getElementById('panel-horario-turno');

    if (turnoActivo) {
        if (labelCajero) labelCajero.innerText = `Cajero: ${turnoActivo.cajero}`;
        if (panelCajero) panelCajero.innerText = turnoActivo.cajero;
        if (panelHorario) panelHorario.innerText = `${turnoActivo.horario} (Fondo: $U ${turnoActivo.fondoInicial})`;
        actualizarResumenCajaFinanciero();
    } else {
        if (labelCajero) labelCajero.innerText = "Cajero: Ninguno";
        if (panelCajero) panelCajero.innerText = "Ninguno";
        if (panelHorario) panelHorario.innerText = "Sin Turno Activo";
    }
}

// ==========================================
// GESTIÓN DE COMPRAS Y PROVEEDORES
// ==========================================
function abrirModalCompras() {
    if (!turnoActivo) {
        alert("Debe iniciar un turno de caja antes de registrar compras.");
        return;
    }
    new bootstrap.Modal(document.getElementById('modalCompras')).show();
}

function abrirModalCrearProveedor() {
    new bootstrap.Modal(document.getElementById('modalCrearProveedor')).show();
}

function guardarNuevoProveedor() {
    const nombre = document.getElementById('nuevo-proveedor-nombre').value.trim();
    if (!nombre) return;
    proveedoresRegistrados.push({ nombre });
    localStorage.setItem('proveedores_carniceria', JSON.stringify(proveedoresRegistrados));
    document.getElementById('nuevo-proveedor-nombre').value = '';
    bootstrap.Modal.getInstance(document.getElementById('modalCrearProveedor')).hide();
    actualizarSelectoresListas();
}

function registrarCompraProveedor() {
    const proveedor = document.getElementById('input-compra-proveedor').value;
    const monto = parseFloat(document.getElementById('input-compra-monto').value);
    const formaPago = document.getElementById('select-compra-pago').value;

    if (!proveedor || isNaN(monto) || monto <= 0) {
        alert("Complete todos los campos correctamente.");
        return;
    }

    const compra = {
        proveedor,
        monto,
        formaPago,
        fecha: new Date().toISOString()
    };

    comprasTurno.push(compra);
    localStorage.setItem('compras_turno_carniceria', JSON.stringify(comprasTurno));

    bootstrap.Modal.getInstance(document.getElementById('modalCompras')).hide();
    document.getElementById('input-compra-monto').value = '';
    actualizarResumenCajaFinanciero();
}

// ==========================================
// CATÁLOGO, BÚSQUEDA Y CARRITO (MEJORADO)
// ==========================================
function filtrarCatalogoRapido(texto) {
    const contenedor = document.getElementById('lista-catalogo-general');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    const filtrados = productosInventario.filter(p => 
        p.nombre.toLowerCase().includes(texto.toLowerCase()) || 
        p.codigo.toLowerCase().includes(texto.toLowerCase())
    );

    if (filtrados.length === 0) {
        contenedor.innerHTML = `<div class="text-muted text-center small py-2">No se encontraron artículos</div>`;
        return;
    }

    filtrados.forEach(prod => {
        contenedor.innerHTML += `
            <div class="d-flex justify-content-between align-items-center border-bottom py-1">
                <div>
                    <span class="badge bg-dark me-1">${prod.codigo}</span>
                    <strong class="small">${prod.nombre}</strong>
                    <span class="text-muted small ms-1">($U ${prod.precio}/kg)</span>
                </div>
                <button class="btn btn-outline-success btn-sm py-0 px-2" onclick="agregarAlCarritoPorCodigoOMenu('${prod.codigo}')">
                    <i class="fas fa-plus"></i> Elegir
                </button>
            </div>
        `;
    });
}

function manejarEnterEscanner(event) {
    if (event.key === 'Enter') {
        procesarCodigoBarras();
    }
}

function procesarCodigoBarras() {
    const input = document.getElementById('input-buscar-articulo');
    const valor = input.value.trim();
    if (!valor) return;

    let codigoBuscado = valor;
    let kilosDetectados = null;

    // Detectar si es un código de barras de balanza (empieza con '2' y tiene longitud típica ej. 13 dígitos)
    if (valor.startsWith('2') && valor.length >= 12) {
        // Estándar común de balanzas: 
        // Posición 0: prefijo '2'
        // Posiciones 1 a 5 (5 dígitos): Código del producto (ej: '00002')
        // Posiciones 6 a 11 (6 dígitos): Precio total o peso codificado
        let codigoProdBruto = valor.substring(1, 6);
        codigoBuscado = String(parseInt(codigoProdBruto, 10)); // Elimina ceros a la izquierda para coincidir con el inventario (ej: "2")

        let producto = productosInventario.find(p => p.codigo === codigoBuscado);
        if (producto && producto.precio > 0) {
            // Los siguientes dígitos usualmente contienen el precio total en centavos o el peso. 
            // Suponiendo que los últimos dígitos representan el importe total cobrado en la balanza:
            let valorMontoBruto = parseFloat(valor.substring(6, 12)) / 100; 
            if (valorMontoBruto > 0) {
                kilosDetectados = valorMontoBruto / producto.precio;
            }
        }
    }

    let producto = productosInventario.find(p => p.codigo === codigoBuscado || p.nombre.toLowerCase().includes(valor.toLowerCase()));
    
    if (producto) {
        if (kilosDetectados !== null && kilosDetectados > 0) {
            // Si se leyó directo de la balanza, lo agregamos calculando sus kilos exactos sin abrir ventanas
            let subtotalItem = kilosDetectados * producto.precio;
            
            let itemExistente = carrito.find(item => item.codigo === producto.codigo);
            if (itemExistente) {
                itemExistente.kilos += kilosDetectados;
                itemExistente.subtotal += subtotalItem;
            } else {
                carrito.push({
                    codigo: producto.codigo,
                    nombre: producto.nombre,
                    categoria: producto.categoria,
                    precioUnitario: producto.precio,
                    kilos: kilosDetectados,
                    subtotal: subtotalItem
                });
            }
            actualizarVistaCarrito();
        } else {
            // Si es un código común o manual, usa la función de menú/precio
            agregarAlCarritoPorCodigoOMenu(producto.codigo);
        }
        
        input.value = '';
        filtrarCatalogoRapido('');
    } else {
        alert("Artículo no encontrado.");
    }
}

// Función mejorada para admitir montos en dinero ($U) o fracciones exactas de kilo (kg)
function agregarAlCarritoPorCodigoOMenu(codigo) {
    let producto = productosInventario.find(p => p.codigo === codigo);
    if (!producto) return;

    let entrada = prompt(`Artículo: ${producto.nombre}\nPrecio por Kg: $U ${producto.precio}\n\nIngrese el MONTO en dinero ($U) o los KILOS exactos (ej: 0.750):`, "1");
    if (entrada === null) return; 

    let valorIngresado = parseFloat(entrada.replace(',', '.'));
    if (isNaN(valorIngresado) || valorIngresado <= 0) {
        alert("Por favor, ingrese un valor válido.");
        return;
    }

    let cantidadKilos = 0;
    let subtotalItem = 0;

    // Si ingresa un valor mayor a 10 se asume dinero total ($U), de lo contrario son kilos directos.
    if (valorIngresado > 10 && producto.precio > 0) {
        subtotalItem = valorIngresado;
        cantidadKilos = subtotalItem / producto.precio;
    } else {
        cantidadKilos = valorIngresado;
        subtotalItem = cantidadKilos * producto.precio;
    }

    let itemExistente = carrito.find(item => item.codigo === codigo);
    if (itemExistente) {
        itemExistente.kilos += cantidadKilos;
        itemExistente.subtotal += subtotalItem;
    } else {
        carrito.push({
            codigo: producto.codigo,
            nombre: producto.nombre,
            categoria: producto.categoria,
            precioUnitario: producto.precio,
            kilos: cantidadKilos,
            subtotal: subtotalItem
        });
    }

    actualizarVistaCarrito();
}

function actualizarMetodoPago() {
    if (document.getElementById('pago-efectivo').checked) metodoPagoSeleccionado = "Efectivo";
    else if (document.getElementById('pago-transf').checked) metodoPagoSeleccionado = "Transferencia";
    else if (document.getElementById('pago-debito').checked) metodoPagoSeleccionado = "Debito";
    else if (document.getElementById('pago-credito')?.checked) metodoPagoSeleccionado = "Credito";
    actualizarVistaCarrito();
}

function actualizarVistaCarrito() {
    const lista = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    const descuentoEl = document.getElementById('cart-descuento-monto');
    const totalEl = document.getElementById('cart-total');

    if (!lista) return;
    lista.innerHTML = '';

    if (carrito.length === 0) {
        lista.innerHTML = `<li class="list-group-item text-center text-muted py-2">El carrito está vacío</li>`;
        if (subtotalEl) subtotalEl.innerText = "$U 0.00";
        if (descuentoEl) descuentoEl.innerText = "-$U 0.00";
        if (totalEl) totalEl.innerText = "$U 0.00";
        return;
    }

    let subtotalGeneral = 0;
    let descuentoTotal = 0;

    carrito.forEach((item, index) => {
        subtotalGeneral += item.subtotal;
        let aplicaDesc = (metodoPagoSeleccionado === "Efectivo" || metodoPagoSeleccionado === "Transferencia");
        let descItem = aplicaDesc ? (item.subtotal * 0.10) : 0;
        descuentoTotal += descItem;

        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center py-1">
                <div>
                    <strong>${item.nombre}</strong><br>
                    <small class="text-muted">${item.kilos.toFixed(3)} kg x $${item.precioUnitario}</small>
                </div>
                <div class="text-end">
                    <span>$U ${item.subtotal.toFixed(2)}</span>
                    <button class="btn btn-link text-danger btn-sm p-0 ms-2" onclick="eliminarItemCarrito(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </li>
        `;
    });

    let totalPagar = subtotalGeneral - descuentoTotal;

    if (subtotalEl) subtotalEl.innerText = `$U ${subtotalGeneral.toFixed(2)}`;
    if (descuentoEl) descuentoEl.innerText = `-$U ${descuentoTotal.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `$U ${totalPagar.toFixed(2)}`;
}

function eliminarItemCarrito(index) {
    carrito.splice(index, 1);
    actualizarVistaCarrito();
}

function cobrarVenta() {
    if (!turnoActivo) {
        alert("Debe iniciar un turno de caja antes de realizar cobros.");
        return;
    }
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let subtotal = carrito.reduce((acc, i) => acc + i.subtotal, 0);
    let aplicaDesc = (metodoPagoSeleccionado === "Efectivo" || metodoPagoSeleccionado === "Transferencia");
    let descuento = aplicaDesc ? (subtotal * 0.10) : 0;
    let total = subtotal - descuento;

    const venta = {
        id: Date.now(),
        cajero: turnoActivo.cajero,
        metodoPago: metodoPagoSeleccionado,
        subtotal: subtotal,
        descuento: descuento,
        total: total,
        items: [...carrito],
        fecha: new Date().toISOString()
    };

    ventasTurno.push(venta);
    ventasHistoricas.push(venta);

    localStorage.setItem('ventas_turno_carniceria', JSON.stringify(ventasTurno));
    localStorage.setItem('ventas_historicas_carniceria', JSON.stringify(ventasHistoricas));

    carrito = [];
    actualizarVistaCarrito();
    actualizarResumenCajaFinanciero();
    alert("¡Venta cobrada con éxito!");
}

// ==========================================
// CONTROL FINANCIERO Y CIERRE DE CAJA
// ==========================================
function actualizarResumenCajaFinanciero() {
    if (!turnoActivo) return;

    let fondo = turnoActivo.fondoInicial || 0;
    let ventasEfectivo = 0;
    let ventasTransf = 0;
    let ventasDebito = 0;
    let ventasCredito = 0;
    let comprasEfectivo = 0;

    ventasTurno.forEach(v => {
        if (v.metodoPago === "Efectivo") ventasEfectivo += v.total;
        else if (v.metodoPago === "Transferencia") ventasTransf += v.total;
        else if (v.metodoPago === "Debito") ventasDebito += v.total;
        else if (v.metodoPago === "Credito") ventasCredito += v.total;
    });

    comprasTurno.forEach(c => {
        if (c.formaPago === "Efectivo") comprasEfectivo += c.monto;
    });

    let efectivoCaja = fondo + ventasEfectivo - comprasEfectivo;

    if (document.getElementById('resumen-fondo-inicial')) document.getElementById('resumen-fondo-inicial').innerText = `$U ${fondo.toFixed(2)}`;
    if (document.getElementById('resumen-ventas-efe')) document.getElementById('resumen-ventas-efe').innerText = `$U ${ventasEfectivo.toFixed(2)}`;
    if (document.getElementById('resumen-compras-efe')) document.getElementById('resumen-compras-efe').innerText = `$U ${comprasEfectivo.toFixed(2)}`;
    if (document.getElementById('resumen-ventas-trans')) document.getElementById('resumen-ventas-trans').innerText = `$U ${ventasTransf.toFixed(2)}`;
    if (document.getElementById('resumen-ventas-deb')) document.getElementById('resumen-ventas-deb').innerText = `$U ${ventasDebito.toFixed(2)}`;
    if (document.getElementById('resumen-ventas-cred')) document.getElementById('resumen-ventas-cred').innerText = `$U ${ventasCredito.toFixed(2)}`;
    if (document.getElementById('resumen-efectivo-caja')) document.getElementById('resumen-efectivo-caja').innerText = `$U ${efectivoCaja.toFixed(2)}`;
}

function abrirModalCierreCaja() {
    if (!turnoActivo) {
        alert("No hay ningún turno activo para cerrar.");
        return;
    }

    let fondo = turnoActivo.fondoInicial || 0;
    let ventasEfe = 0, ventasTra = 0, ventasDeb = 0, ventasCred = 0, comprasEfe = 0, descuentosTotales = 0;

    ventasTurno.forEach(v => {
        if (v.metodoPago === "Efectivo") ventasEfe += v.total;
        else if (v.metodoPago === "Transferencia") ventasTra += v.total;
        else if (v.metodoPago === "Debito") ventasDeb += v.total;
        else if (v.metodoPago === "Credito") ventasCred += v.total;
        descuentosTotales += v.descuento;
    });

    comprasTurno.forEach(c => {
        if (c.formaPago === "Efectivo") comprasEfe += c.monto;
    });

    let efectivoEsperado = fondo + ventasEfe - comprasEfe;

    document.getElementById('cierre-fondo-inicial').innerText = `$U ${fondo.toFixed(2)}`;
    document.getElementById('cierre-ventas-efe').innerText = `$U ${ventasEfe.toFixed(2)}`;
    document.getElementById('cierre-compras-efe').innerText = `$U ${comprasEfe.toFixed(2)}`;
    document.getElementById('cierre-ventas-trans').innerText = `$U ${ventasTra.toFixed(2)}`;
    document.getElementById('cierre-ventas-deb').innerText = `$U ${ventasDebை.toFixed(2)}`;
    // Si tienes un elemento HTML para ventas a crédito en el cierre, puedes agregarlo aquí también:
    if(document.getElementById('cierre-ventas-cred')) document.getElementById('cierre-ventas-cred').innerText = `$U ${ventasCred.toFixed(2)}`;
    document.getElementById('cierre-descuentos').innerText = `$U ${descuentosTotales.toFixed(2)}`;
    document.getElementById('cierre-total-txt').innerText = `$U ${efectivoEsperado.toFixed(2)}`;

    new bootstrap.Modal(document.getElementById('modalCierreCaja')).show();
}

function confirmarCierreCaja() {
    turnoActivo = null;
    localStorage.removeItem('turno_activo_carniceria');
    ventasTurno = [];
    comprasTurno = [];
    localStorage.setItem('ventas_turno_carniceria', JSON.stringify(ventasTurno));
    localStorage.setItem('compras_turno_carniceria', JSON.stringify(comprasTurno));

    bootstrap.Modal.getInstance(document.getElementById('modalCierreCaja')).hide();
    verificarEstadoTurnoVisual();
    alert("Turno cerrado correctamente.");
}

// ==========================================
// PANEL DE ADMINISTRACIÓN Y GRÁFICAS
// ==========================================
let chartVentasInstancia = null;
let chartCortesInstancia = null;
let chartKilosInstancia = null;
let ventasFiltradasTemporalmente = [];

function verAdmin() {
    let pin = prompt("Ingrese PIN de Administrador:");
    if (pin === "6272") {
        document.getElementById('view-pos').style.display = 'none';
        document.getElementById('view-dashboard').style.display = 'block';
        cambiarFiltroTemporal('hoy');
    } else if (pin !== null) {
        alert("PIN incorrecto.");
    }
}

function switchTab(vista) {
    if (vista === 'pos') {
        document.getElementById('view-dashboard').style.display = 'none';
        document.getElementById('view-pos').style.display = 'block';
    }
}

function cambiarFiltroTemporal(filtro) {
    filtroTemporalActual = filtro;
    document.querySelectorAll('#view-dashboard .btn-group button').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-filtro-${filtro}`).classList.add('active');

    const ahora = new Date();
    ventasFiltradasTemporalmente = ventasHistoricas.filter(v => {
        let fechaVenta = new Date(v.fecha);
        if (filtro === 'hoy') {
            return fechaVenta.toDateString() === ahora.toDateString();
        } else if (filtro === 'semana') {
            let unaSemanaAtras = new Date();
            unaSemanaAtras.setDate(ahora.getDate() - 7);
            return fechaVenta >= unaSemanaAtras;
        } else if (filtro === 'mes') {
            return fechaVenta.getMonth() === ahora.getMonth() && fechaVenta.getFullYear() === ahora.getFullYear();
        }
        return true; // histórico
    });

    actualizarMetricasAdmin();
    actualizarTablaProductosAdmin();
    calcularKilosYEstadisticasAdmin();
}

function actualizarMetricasAdmin() {
    let totalEfe = 0, totalDeb = 0, totalTra = 0, totalCred = 0, totalGastos = 0;

    ventasFiltradasTemporalmente.forEach(v => {
        if (v.metodoPago === "Efectivo") totalEfe += v.total;
        else if (v.metodoPago === "Debito") totalDeb += v.total;
        else if (v.metodoPago === "Transferencia") totalTra += v.total;
        else if (v.metodoPago === "Credito") totalCred += v.total;
    });

    comprasTurno.forEach(c => totalGastos += c.monto);

    if (document.getElementById('admin-total-efe')) document.getElementById('admin-total-efe').innerText = `$U ${totalEfe.toFixed(2)}`;
    if (document.getElementById('admin-total-deb')) document.getElementById('admin-total-deb').innerText = `$U ${totalDeb.toFixed(2)}`;
    if (document.getElementById('admin-total-tra')) document.getElementById('admin-total-tra').innerText = `$U ${totalTra.toFixed(2)}`;
    if (document.getElementById('admin-total-gastos')) document.getElementById('admin-total-gastos').innerText = `$U ${totalGastos.toFixed(2)}`;

    renderizarGraficasAdmin(totalEfe, totalDeb, totalTra, totalCred, totalGastos);
}

function actualizarTablaProductosAdmin() {
    const tbody = document.getElementById('tabla-admin-productos');
    if (!tbody) return;
    tbody.innerHTML = '';

    productosInventario.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.codigo}</td>
                <td class="text-start">${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>$U ${p.precio}</td>
                <td>
                    <button class="btn btn-outline-danger btn-sm py-0 px-1" onclick="eliminarProductoAdmin('${p.codigo}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function abrirModalNuevoProducto() {
    document.getElementById('titulo-modal-producto').innerText = "Nuevo Artículo";
    document.getElementById('prod-codigo').value = '';
    document.getElementById('prod-nombre').value = '';
    document.getElementById('prod-precio').value = '';
    new bootstrap.Modal(document.getElementById('modalProducto')).show();
}

function guardarProductoAdmin() {
    const codigo = document.getElementById('prod-codigo').value.trim();
    const nombre = document.getElementById('prod-nombre').value.trim();
    const categoria = document.getElementById('prod-categoria').value.trim();
    const precio = parseFloat(document.getElementById('prod-precio').value);

    if (!codigo || !nombre || isNaN(precio)) {
        alert("Complete todos los campos correctamente.");
        return;
    }

    let existente = productosInventario.find(p => p.codigo === codigo);
    if (existente) {
        existente.nombre = nombre;
        existente.precio = precio;
    } else {
        productosInventario.push({ codigo, nombre, categoria, precio });
    }

    localStorage.setItem('inventario_carniceria', JSON.stringify(productosInventario));
    bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
    actualizarTablaProductosAdmin();
    filtrarCatalogoRapido('');
}

function eliminarProductoAdmin(codigo) {
    if (confirm("¿Seguro desea eliminar este artículo?")) {
        productosInventario = productosInventario.filter(p => p.codigo !== codigo);
        localStorage.setItem('inventario_carniceria', JSON.stringify(productosInventario));
        actualizarTablaProductosAdmin();
        filtrarCatalogoRapido('');
    }
}

function calcularKilosYEstadisticasAdmin() {
    let desgloseKilos = {};

    ventasFiltradasTemporalmente.forEach(venta => {
        venta.items.forEach(item => {
            if (!desgloseKilos[item.codigo]) {
                desgloseKilos[item.codigo] = {
                    nombre: item.nombre,
                    categoria: item.categoria,
                    kilosTotales: 0,
                    ingresosTotales: 0
                };
            }
            desgloseKilos[item.codigo].kilosTotales += (item.kilos || 0);
            desgloseKilos[item.codigo].ingresosTotales += (item.subtotal || 0);
        });
    });

    let tbodyKilos = document.getElementById('tabla-admin-kilos');
    if (tbodyKilos) {
        tbodyKilos.innerHTML = '';
        Object.keys(desgloseKilos).forEach(cod => {
            let prod = desgloseKilos[cod];
            tbodyKilos.innerHTML += `
                <tr>
                    <td>${cod}</td>
                    <td class="text-start">${prod.nombre}</td>
                    <td>${prod.categoria}</td>
                    <td class="fw-bold text-success">${prod.kilosTotales.toFixed(3)} kg / un</td>
                </tr>
            `;
        });
    }

    return desgloseKilos;
}

function renderizarGraficasAdmin(efe, deb, tra, cred, gastos) {
    let desglose = calcularKilosYEstadisticasAdmin();

    // 1. Gráfica Métodos de Pago
    const ctxVentas = document.getElementById('chartVentasGastos')?.getContext('2d');
    if (ctxVentas) {
        if (chartVentasInstancia) chartVentasInstancia.destroy();
        chartVentasInstancia = new Chart(ctxVentas, {
            type: 'doughnut',
            data: {
                labels: ['Efectivo', 'Débito', 'Transferencia', 'Crédito', 'Gastos'],
                datasets: [{
                    data: [efe, deb, tra, cred, gastos],
                    backgroundColor: ['#198754', '#0dcaf0', '#0d6efd', '#ffc107', '#dc3545']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Preparar datos para Top Cortes y Kilos
    let labelsCortes = [];
    let dataIngresos = [];
    let dataKilos = [];

    Object.keys(desglose).forEach(cod => {
        labelsCortes.push(desglose[cod].nombre);
        dataIngresos.push(desglose[cod].ingresosTotales);
        dataKilos.push(desglose[cod].kilosTotales);
    });

    // 2. Gráfica Top Cortes por Ingresos
    const ctxCortes = document.getElementById('chartCortes')?.getContext('2d');
    if (ctxCortes) {
        if (chartCortesInstancia) chartCortesInstancia.destroy();
        chartCortesInstancia = new Chart(ctxCortes, {
            type: 'bar',
            data: {
                labels: labelsCortes,
                datasets: [{
                    label: 'Ingresos ($U)',
                    data: dataIngresos,
                    backgroundColor: '#0d6efd'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // 3. Gráfica Kilos Vendidos
    const ctxKilos = document.getElementById('chartKilos')?.getContext('2d');
    if (ctxKilos) {
        if (chartKilosInstancia) chartKilosInstancia.destroy();
        chartKilosInstancia = new Chart(ctxKilos, {
            type: 'bar',
            data: {
                labels: labelsCortes,
                datasets: [{
                    label: 'Kilos / Unidades',
                    data: dataKilos,
                    backgroundColor: '#198754'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
        }
