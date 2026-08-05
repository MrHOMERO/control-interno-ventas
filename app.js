let cajeroActivo = "Ninguno";
let turnoActivo = "Ninguno";
let metodoPagoActivo = "Efectivo";
let chartInstancia = null;
const ADMIN_PASSWORD = "6272#$";
let modoEdicion = false;

document.addEventListener("DOMContentLoaded", function() {
    if (!localStorage.getItem("minipos_articulos")) {
        let articulosBase = [];
        for (let i = 1; i <= 150; i++) {
            articulosBase.push({ codigo: i, nombre: `Corte de Carnicería Especial ${i}`, categoria: "Carnes", precio: (250.00 + (i * 1.5)).toFixed(2) });
        }
        for (let i = 151; i <= 200; i++) {
            articulosBase.push({ codigo: i, nombre: `Artículo Almacén ${i - 150}`, categoria: "Almacén", precio: (100.00 + (i * 1.2)).toFixed(2) });
        }
        for (let i = 201; i <= 250; i++) {
            articulosBase.push({ codigo: i, nombre: `Bebida Refrescante ${i - 200}`, categoria: "Bebidas", precio: (80.00 + (i * 1.0)).toFixed(2) });
        }
        localStorage.setItem("minipos_articulos", JSON.stringify(articulosBase));
    }
    renderCatalogoRapido();
    renderCart();
    renderLogs();
    renderResumenTurno();
});

// Alerta personalizada con diseño limpio (reemplaza al alert nativo)
function mostrarAlerta(mensaje) {
    let el = document.getElementById("texto-alerta-personalizada");
    if(el) el.innerText = mensaje;
    let modalEl = document.getElementById("modalAlerta");
    if(modalEl) {
        let modal = new bootstrap.Modal(modalEl);
        modal.show();
    } else {
        alert(mensaje);
    }
}

function renderResumenTurno() {
    let ventas = JSON.parse(localStorage.getItem("minipos_ventas")) || [];
    let compras = JSON.parse(localStorage.getItem("minipos_compras")) || [];
    
    let ventasTurno = ventas.filter(v => v.cajero === cajeroActivo && v.turno === turnoActivo);
    let comprasTurno = compras.filter(c => c.cajero === cajeroActivo && c.turno === turnoActivo);
    
    let totalEf = 0, totalTr = 0, totalDe = 0, totalDescTurno = 0, totalComprast = 0;
    ventasTurno.forEach(v => {
        if(v.pago === "Efectivo") totalEf += v.total;
        if(v.pago === "Transferencia") totalTr += v.total;
        if(v.pago === "Debito") totalDe += v.total;
        totalDescTurno += (v.descuento || 0);
    });

    comprasTurno.forEach(c => {
        totalComprast += c.monto;
    });

    if(document.getElementById("contador-ventas")) document.getElementById("contador-ventas").innerText = `${ventasTurno.length} Ventas`;
    if(document.getElementById("total-efectivo-ui")) document.getElementById("total-efectivo-ui").innerText = `$U ${totalEf.toFixed(2)}`;
    if(document.getElementById("total-transf-ui")) document.getElementById("total-transf-ui").innerText = `$U ${totalTr.toFixed(2)}`;
    if(document.getElementById("total-debito-ui")) document.getElementById("total-debito-ui").innerText = `$U ${totalDe.toFixed(2)}`;
    if(document.getElementById("caja-efectivo-total")) document.getElementById("caja-efectivo-total").innerText = `$U ${totalEf.toFixed(2)}`;
    if(document.getElementById("total-descuentos-turno-ui")) document.getElementById("total-descuentos-turno-ui").innerText = `$U ${totalDescTurno.toFixed(2)}`;
    if(document.getElementById("total-compras-turno-ui")) document.getElementById("total-compras-turno-ui").innerText = `$U ${totalComprast.toFixed(2)}`;
}

function abrirModalCompra() {
    if(cajeroActivo === "Ninguno") {
        mostrarAlerta("Debe iniciar turno para registrar compras.");
        return;
    }
    document.getElementById("input-compra-proveedor").value = "";
    document.getElementById("input-compra-monto").value = "";
    let modal = new bootstrap.Modal(document.getElementById("modalCompra"));
    modal.show();
}

function guardarCompra() {
    let proveedor = document.getElementById("input-compra-proveedor").value.trim();
    let monto = parseFloat(document.getElementById("input-compra-monto").value);

    if(!proveedor || isNaN(monto) || monto <= 0) {
        mostrarAlerta("Ingrese un proveedor válido y un monto correcto.");
        return;
    }

    let compras = JSON.parse(localStorage.getItem("minipos_compras")) || [];
    compras.push({
        fechaISO: new Date().toISOString().split('T')[0],
        fecha: new Date().toLocaleString('es-UY'),
        cajero: cajeroActivo,
        turno: turnoActivo,
        proveedor: proveedor,
        monto: monto
    });
    localStorage.setItem("minipos_compras", JSON.stringify(compras));

    registrarAccion(`Compra a proveedor: ${proveedor} por $U ${monto.toFixed(2)}`);

    let modalEl = document.getElementById("modalCompra");
    let modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    renderResumenTurno();
    mostrarAlerta("Compra registrada con éxito.");
}

function registrarAccion(accion) {
    let logs = JSON.parse(localStorage.getItem("minipos_logs")) || [];
    logs.push({ fecha: new Date().toLocaleString('es-UY'), detalle: accion, cajero: cajeroActivo });
    localStorage.setItem("minipos_logs", JSON.stringify(logs));
    renderLogs();
}

function abrirModalTurno() {
    if(cajeroActivo !== "Ninguno") {
        mostrarAlerta(`Ya hay un turno activo para ${cajeroActivo}. Cierre la caja primero.`);
        return;
    }
    let modal = new bootstrap.Modal(document.getElementById("modalTurno"));
    modal.show();
}

function iniciarTurnoCajero() {
    let horario = document.getElementById("select-horario-turno").value;
    let nombre = document.getElementById("input-cajero-nombre").value.trim();
    let pin = document.getElementById("input-cajero-pin").value.trim();

    if (!nombre || !pin) return mostrarAlerta("Complete nombre y PIN.");
    let cajeros = JSON.parse(localStorage.getItem("minipos_cajeros")) || [];
    let cajeroEncontrado = cajeros.find(c => c.nombre.toLowerCase() === nombre.toLowerCase() && c.pin === pin);
    if (!cajeroEncontrado) return mostrarAlerta("Cajero no registrado o PIN incorrecto.");

    cajeroActivo = cajeroEncontrado.nombre;
    turnoActivo = horario;

    document.getElementById("label-cajero-actual").innerText = `Cajero: ${cajeroActivo}`;
    document.getElementById("badge-turno").innerHTML = `<i class="fas fa-check-circle me-1"></i>Turno Activo`;
    document.getElementById("badge-turno").className = "btn btn-success btn-sm fw-bold text-white py-1 px-2 shadow-sm";

    let modalEl = document.getElementById("modalTurno");
    let modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    
    registrarAccion(`Inició turno: ${horario}`);
    renderResumenTurno();
}

function registrarNuevoCajero() {
    let nombre = document.getElementById("input-cajero-nombre").value.trim();
    let pin = document.getElementById("input-cajero-pin").value.trim();
    if (!nombre || !pin) return mostrarAlerta("Ingrese nombre y PIN.");
    let cajeros = JSON.parse(localStorage.getItem("minipos_cajeros")) || [];
    if (cajeros.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) return mostrarAlerta("Ya existe.");

    cajeros.push({ nombre, pin });
    localStorage.setItem("minipos_cajeros", JSON.stringify(cajeros));
    mostrarAlerta("Cajero registrado. Ya puede iniciar turno.");
}

function cerrarCaja() {
    if(cajeroActivo === "Ninguno") {
        mostrarAlerta("No hay un turno activo para cerrar.");
        return;
    }

    let ventas = JSON.parse(localStorage.getItem("minipos_ventas")) || [];
    let ventasTurno = ventas.filter(v => v.cajero === cajeroActivo && v.turno === turnoActivo);
    let totalTurno = ventasTurno.reduce((acc, v) => acc + v.total, 0);

    if(confirm(`=== CIERRE DE CAJA ===\nCajero: ${cajeroActivo}\nTotal vendido: $U ${totalTurno.toFixed(2)}\n\n¿Confirmar cierre?`)) {
        registrarAccion(`Cierre de caja. Total vendido: $U ${totalTurno.toFixed(2)}`);
        cajeroActivo = "Ninguno";
        turnoActivo = "Ninguno";
        document.getElementById("label-cajero-actual").innerText = `Cajero: Ninguno`;
        document.getElementById("badge-turno").innerHTML = `<i class="fas fa-play-circle me-1"></i>Comenzar Turno`;
        document.getElementById("badge-turno").className = "btn btn-warning btn-sm fw-bold text-dark py-1 px-2 shadow-sm";
        renderResumenTurno();
        mostrarAlerta("Caja cerrada exitosamente.");
    }
}

function verAdmin() {
    let modal = new bootstrap.Modal(document.getElementById("modalAdmin"));
    document.getElementById("input-admin-pass").value = "";
    modal.show();
    setTimeout(() => { document.getElementById("input-admin-pass").focus(); }, 300);
}

function verificarAccesoAdmin() {
    let pass = document.getElementById("input-admin-pass").value.trim();
    if (pass === ADMIN_PASSWORD) {
        let modalEl = document.getElementById("modalAdmin");
        let modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        document.getElementById('view-pos').style.display = 'none';
        document.getElementById('view-dashboard').style.display = 'flex';
        renderLogs();
        renderGrafica();
        renderReportesAdmin();
        renderTablaKilosAdmin();
        renderTablaAdminProductos();
        registrarAccion("Accedió al Panel de Administración");
    } else {
        mostrarAlerta("Contraseña de administrador incorrecta.");
        document.getElementById("input-admin-pass").value = "";
        document.getElementById("input-admin-pass").focus();
    }
}

function manejarEnterAdmin(event) {
    if (event.key === "Enter") { event.preventDefault(); verificarAccesoAdmin(); }
}

function actualizarMetodoPago() {
    let radios = document.getElementsByName('btnradio_pago');
    for(let radio of radios) { if(radio.checked) { metodoPagoActivo = radio.value; break; } }
    let info = document.getElementById("info-descuento");
    if(metodoPagoActivo === "Debito") {
        info.innerText = "Pago con Débito: NO aplica descuento en ninguna categoría.";
        info.className = "text-danger d-block mt-1 fw-bold";
    } else {
        info.innerText = "Aplica descuento real solo en Carnes (Efectivo/Transferencia).";
        info.className = "text-success d-block mt-1 fw-bold";
    }
    renderCart();
}
function manejarEnterEscanner(event) {
    if (event.key === "Enter") { event.preventDefault(); procesarCodigoBarras(); }
}

function procesarCodigoBarras() {
    let input = document.getElementById("input-buscar-articulo");
    let codigoLeido = input.value.trim();
    if (!codigoLeido) return;
    let articulos = JSON.parse(localStorage.getItem("minipos_articulos")) || [];
    let articuloEncontrado = articulos.find(art => art.codigo.toString() === codigoLeido || art.nombre.toLowerCase().includes(codigoLeido.toLowerCase()));
    if (articuloEncontrado) {
        agregarAlCarrito(articuloEncontrado.codigo);
        input.value = "";
        input.focus();
        renderCatalogoRapido();
    } else {
        mostrarAlerta("Artículo no encontrado.");
    }
}

// ================= AGREGAR AL CARRITO CON CÁLCULO DE KILOS (CARNES) =================
function agregarAlCarrito(codigo) {
    let articulos = JSON.parse(localStorage.getItem("minipos_articulos")) || [];
    let articulo = articulos.find(art => art.codigo == codigo);
    if (!articulo) return;

    let precioPorKgOUnidad = parseFloat(articulo.precio);
    let cantidadFinal = 1;
    let kilosFinal = 0;

    if (articulo.categoria === "Carnes") {
        let inputMonto = prompt(`[VENTA DE CARNE POR PESO] - ${articulo.nombre}\nPrecio por Kg: $U ${precioPorKgOUnidad.toFixed(2)}\n\nIngrese el MONTO A COBRAR ($U) (Ej: 150 para $U 150):`, "");
        if (inputMonto === null) return; // Si cancela
        let montoDeseado = parseFloat(inputMonto);
        if (isNaN(montoDeseado) || montoDeseado <= 0) {
            mostrarAlerta("Monto ingresado inválido.");
            return;
        }
        // Calcular los kilos exactos
        kilosFinal = montoDeseado / precioPorKgOUnidad;
        precioPorKgOUnidad = montoDeseado; // El precio de la línea del carrito es el monto digitado
        cantidadFinal = 1;
    }

    let carrito = JSON.parse(localStorage.getItem("minipos_carrito")) || [];
    
    // Si es carne, cada pesaje se añade como ítem independiente en el carrito para mantener precisión exacta
    if (articulo.categoria === "Carnes") {
        carrito.push({ 
            codigo: articulo.codigo, 
            nombre: articulo.nombre, 
            categoria: articulo.categoria, 
            precio: precioPorKgOUnidad, // Monto total cobrado por esta pesada
            cantidad: cantidadFinal,
            kilos: kilosFinal 
        });
    } else {
        // Productos normales por unidad
        let index = carrito.findIndex(item => item.codigo == codigo && item.categoria !== "Carnes");
        if (index > -1) {
            carrito[index].cantidad += 1;
        } else {
            carrito.push({ 
                codigo: articulo.codigo, 
                nombre: articulo.nombre, 
                categoria: articulo.categoria, 
                precio: precioPorKgOUnidad, 
                cantidad: 1, 
                kilos: 0 
            });
        }
    }

    localStorage.setItem("minipos_carrito", JSON.stringify(carrito));
    renderCart();
}

function renderCart() {
    let carrito = JSON.parse(localStorage.getItem("minipos_carrito")) || [];
    let contenedor = document.getElementById("cart-items");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    if (carrito.length === 0) {
        contenedor.innerHTML = `<li class="list-group-item text-center text-muted py-4 small">El carrito está vacío</li>`;
        document.getElementById("cart-subtotal").innerText = "$U 0.00";
        document.getElementById("cart-descuento-monto").innerText = "-$U 0.00";
        document.getElementById("cart-total").innerText = "$U 0.00";
        window.totalActual = 0;
        window.descuentoActual = 0;
        return;
    }
    let subtotal = 0, descuentoTotal = 0;
    carrito.forEach((item, index) => {
        let totalItem = item.precio * (item.categoria === "Carnes" ? 1 : item.cantidad);
        subtotal += totalItem;
        let descuentoItem = 0;
        if (item.categoria === "Carnes" && (metodoPagoActivo === "Efectivo" || metodoPagoActivo === "Transferencia")) {
            descuentoItem = totalItem - (totalItem / 1.1);
            descuentoTotal += descuentoItem;
        }
        let badgeCatClass = item.categoria === "Carnes" ? "bg-success" : (item.categoria === "Almacén" ? "bg-primary" : "bg-info text-dark");
        
        let detalleTexto = "";
        if(item.categoria === "Carnes") {
            detalleTexto = `<span class="text-success fw-bold">${item.kilos.toFixed(3)} kg</span>`;
        } else {
            detalleTexto = `<span class="text-muted">${item.cantidad} x $U ${item.precio.toFixed(2)}</span>`;
        }

        contenedor.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center py-2 small">
                <div>
                    <strong>${item.nombre}</strong> <span class="badge ${badgeCatClass}" style="font-size:0.65rem;">${item.categoria}</span><br>
                    ${detalleTexto}
                </div>
                <div>
                    <span class="fw-bold me-2">$U ${totalItem.toFixed(2)}</span>
                    <button class="btn btn-outline-danger btn-sm py-0 px-1" onclick="eliminarItemCarrito(${index})"><i class="fas fa-times"></i></button>
                </div>
            </li>`;
    });
    let totalPagar = subtotal - descuentoTotal;
    document.getElementById("cart-subtotal").innerText = `$U ${subtotal.toFixed(2)}`;
    document.getElementById("cart-descuento-monto").innerText = `-$U ${descuentoTotal.toFixed(2)}`;
    document.getElementById("cart-total").innerText = `$U ${totalPagar.toFixed(2)}`;
    window.totalActual = totalPagar; 
    window.descuentoActual = descuentoTotal;
}

function eliminarItemCarrito(index) {
    let carrito = JSON.parse(localStorage.getItem("minipos_carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("minipos_carrito", JSON.stringify(carrito));
    renderCart();
}

function cobrarVenta() {
    let carrito = JSON.parse(localStorage.getItem("minipos_carrito")) || [];
    if (carrito.length === 0) return mostrarAlerta("El carrito está vacío.");
    if (cajeroActivo === "Ninguno") return mostrarAlerta("Inicie turno antes de cobrar.");

    let ventas = JSON.parse(localStorage.getItem("minipos_ventas")) || [];
    let fechaHoyStr = new Date().toISOString().split('T')[0];
    
    ventas.push({
        fechaISO: fechaHoyStr,
        fecha: new Date().toLocaleString('es-UY'),
        cajero: cajeroActivo,
        turno: turnoActivo,
        pago: metodoPagoActivo,
        total: window.totalActual,
        descuento: window.descuentoActual || 0,
        items: carrito
    });
    localStorage.setItem("minipos_ventas", JSON.stringify(ventas));

    registrarAccion(`Cobró venta N°${ventas.filter(v => v.cajero === cajeroActivo && v.turno === turnoActivo).length} ($U ${window.totalActual.toFixed(2)}) - ${metodoPagoActivo}`);
    localStorage.removeItem("minipos_carrito");
    renderCart();
    renderResumenTurno();
    renderGrafica();
    renderTablaKilosAdmin();
    mostrarAlerta("¡Venta cobrada con éxito!");
}

function renderCatalogoRapido() {
    let filtro = document.getElementById("input-buscar-articulo") ? document.getElementById("input-buscar-articulo").value.toLowerCase() : "";
    let articulos = JSON.parse(localStorage.getItem("minipos_articulos")) || [];
    let grid = document.getElementById("product-grid");
    if (!grid) return;
    grid.innerHTML = "";
    let filtrados = articulos.filter(art => art.codigo.toString().includes(filtro) || art.nombre.toLowerCase().includes(filtro) || art.categoria.toLowerCase().includes(filtro));
    if (filtrados.length === 0) {
        grid.innerHTML = `<div class="p-3 text-center text-muted small">No se encontraron artículos.</div>`;
        return;
    }
    filtrados.forEach(art => {
        let esCoincidenciaBuscador = filtro !== "" && (art.codigo.toString() === filtro || art.nombre.toLowerCase().includes(filtro));
        let claseColorCard = esCoincidenciaBuscador ? "bg-secondary text-white" : "bg-white text-dark";
        let estiloExtra = esCoincidenciaBuscador ? "border: 2px solid #495057;" : "";
        let badgeCatClass = art.categoria === "Carnes" ? "bg-success" : (art.categoria === "Almacén" ? "bg-primary" : "bg-info text-dark");
        let textoPrecio = art.categoria === "Carnes" ? `$U ${parseFloat(art.precio).toFixed(2)} / kg (Por peso)` : `$U ${parseFloat(art.precio).toFixed(2)}`;
        grid.innerHTML += `
            <div class="col">
                <div class="card shadow-sm ${claseColorCard}" style="cursor: pointer; ${estiloExtra}" onclick="agregarAlCarrito(${art.codigo})">
                    <div class="card-body py-2 d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge ${esCoincidenciaBuscador ? 'bg-dark text-light' : 'bg-secondary'}">Cód: ${art.codigo}</span>
                            <span class="badge ${badgeCatClass}" style="font-size:0.65rem;">${art.categoria}</span>
                            <h6 class="mb-0 fw-bold mt-1 small">${art.nombre}</h6>
                        </div>
                        <span class="fw-bold ${esCoincidenciaBuscador ? 'text-light' : 'text-success'} small text-end">${textoPrecio}</span>
                    </div>
                </div>
            </div>`;
    });
}

function filtrarCatalogoRapido() { renderCatalogoRapido(); }
// ================= REPORTES ADMIN (DIARIAS, SEMANALES, MENSUALES) =================
function renderReportesAdmin() {
    let ventas = JSON.parse(localStorage.getItem("minipos_ventas")) || [];
    let compras = JSON.parse(localStorage.getItem("minipos_compras")) || [];

    let hoy = new Date();
    let hoyStr = hoy.toISOString().split('T')[0];
    let mesActual = hoy.getMonth();
    let anioActual = hoy.getFullYear();

    let ventasDia = ventas.filter(v => v.fechaISO === hoyStr);
    let comprasDia = compras.filter(c => c.fechaISO === hoyStr);

    let ventasMes = ventas.filter(v => {
        if(!v.fechaISO) return false;
        let d = new Date(v.fechaISO);
        return d.getMonth() === mesActual && d.getFullYear() === anioActual;
    });
    let comprasMes = compras.filter(c => {
        if(!c.fechaISO) return false;
        let d = new Date(c.fechaISO);
        return d.getMonth() === mesActual && d.getFullYear() === anioActual;
    });

    let hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);
    let ventasSemana = ventas.filter(v => {
        if(!v.fechaISO) return false;
        let d = new Date(v.fechaISO);
        return d >= hace7Dias && d <= hoy;
    });
    let comprasSemana = compras.filter(c => {
        if(!c.fechaISO) return false;
        let d = new Date(c.fechaISO);
        return d >= hace7Dias && d <= hoy;
    });

    function calcularMetricas(listaVentas, listaCompras) {
        let ef = 0, tr = 0, de = 0, desc = 0, comp = 0;
        listaVentas.forEach(v => {
            if(v.pago === "Efectivo") ef += v.total;
            if(v.pago === "Transferencia") tr += v.total;
            if(v.pago === "Debito") de += v.total;
            desc += (v.descuento || 0);
        });
        listaCompras.forEach(c => {
            comp += c.monto;
        });
        return { ef, tr, de, desc, comp, totalVentas: ef + tr + de };
    }

    let mDia = calcularMetricas(ventasDia, comprasDia);
    let mSemana = calcularMetricas(ventasSemana, comprasSemana);
    let mMes = calcularMetricas(ventasMes, comprasMes);

    if(document.getElementById("admin-reporte-dia")) {
        document.getElementById("admin-reporte-dia").innerHTML = `
            <strong>Total Ventas:</strong> $U ${mDia.totalVentas.toFixed(2)}<br>
            <span class="text-success">Efectivo:</span> $U ${mDia.ef.toFixed(2)} | <span class="text-primary">Transf:</span> $U ${mDia.tr.toFixed(2)} | <span class="text-info">Débito:</span> $U ${mDia.de.toFixed(2)}<br>
            <span class="text-muted">Descuentos:</span> $U ${mDia.desc.toFixed(2)} | <span class="text-danger">Compras:</span> $U ${mDia.comp.toFixed(2)}
        `;
    }

    if(document.getElementById("admin-reporte-semana")) {
        document.getElementById("admin-reporte-semana").innerHTML = `
            <strong>Total Ventas:</strong> $U ${mSemana.totalVentas.toFixed(2)}<br>
            <span class="text-success">Efectivo:</span> $U ${mSemana.ef.toFixed(2)} | <span class="text-primary">Transf:</span> $U ${mSemana.tr.toFixed(2)} | <span class="text-info">Débito:</span> $U ${mSemana.de.toFixed(2)}<br>
            <span class="text-muted">Descuentos:</span> $U ${mSemana.desc.toFixed(2)} | <span class="text-danger">Compras:</span> $U ${mSemana.comp.toFixed(2)}
        `;
    }

    if(document.getElementById("admin-reporte-mes")) {
        document.getElementById("admin-reporte-mes").innerHTML = `
            <strong>Total Ventas:</strong> $U ${mMes.totalVentas.toFixed(2)}<br>
            <span class="text-success">Efectivo:</span> $U ${mMes.ef.toFixed(2)} | <span class="text-primary">Transf:</span> $U ${mMes.tr.toFixed(2)} | <span class="text-info">Débito:</span> $U ${mMes.de.toFixed(2)}<br>
            <span class="text-muted">Descuentos:</span> $U ${mMes.desc.toFixed(2)} | <span class="text-danger">Compras:</span> $U ${mMes.comp.toFixed(2)}
        `;
    }
}

// ================= CONTROL DE KILOS EN PANEL ADMIN =================
function renderTablaKilosAdmin() {
    let ventas = JSON.parse(localStorage.getItem("minipos_ventas")) || [];
    let acumuladorKilos = {};

    ventas.forEach(v => {
        if (v.items && Array.isArray(v.items)) {
            v.items.forEach(item => {
                if (item.categoria === "Carnes") {
                    if (!acumuladorKilos[item.codigo]) {
                        acumuladorKilos[item.codigo] = { nombre: item.nombre, kilos: 0, totalRecaudado: 0 };
                    }
                    acumuladorKilos[item.codigo].kilos += (item.kilos || 0);
                    acumuladorKilos[item.codigo].totalRecaudado += item.precio;
                }
            });
        }
    });

    let tbody = document.getElementById("tabla-kilos-admin");
    if (!tbody) return;
    tbody.innerHTML = "";

    let codigos = Object.keys(acumuladorKilos);
    if (codigos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-muted py-3">No hay registros de ventas de carnes por peso aún.</td></tr>`;
        return;
    }

    codigos.forEach(cod => {
        let datos = acumuladorKilos[cod];
        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">${cod}</td>
                <td class="text-start">${datos.nombre}</td>
                <td><span class="badge bg-success">${datos.kilos.toFixed(3)} kg</span></td>
                <td class="fw-bold text-dark">$U ${datos.totalRecaudado.toFixed(2)}</td>
            </tr>`;
    });
}

// ================= GESTIÓN ADMIN PRODUCTOS =================
function renderTablaAdminProductos() {
    let filtro = document.getElementById("input-admin-buscar-prod").value.toLowerCase();
    let articulos = JSON.parse(localStorage.getItem("minipos_articulos")) || [];
    let tbody = document.getElementById("tabla-admin-productos");
    if (!tbody) return;
    tbody.innerHTML = "";
    let filtrados = articulos.filter(art => art.codigo.toString().includes(filtro) || art.nombre.toLowerCase().includes(filtro) || art.categoria.toLowerCase().includes(filtro));
    if (filtrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-muted py-3">No hay artículos encontrados.</td></tr>`;
        return;
    }
    filtrados.forEach(art => {
        tbody.innerHTML += `
            <tr>
                <td class="fw-bold">${art.codigo}</td>
                <td>${art.nombre}</td>
                <td><span class="badge bg-secondary">${art.categoria}</span></td>
                <td>$U ${parseFloat(art.precio).toFixed(2)}</td>
                <td class="text-end">
                    <button class="btn btn-warning btn-sm py-0 px-2 me-1 text-dark fw-bold" onclick="abrirModalEditarProducto(${art.codigo})"><i class="fas fa-edit"></i> Modificar</button>
                    <button class="btn btn-danger btn-sm py-0 px-2" onclick="eliminarProductoAdmin(${art.codigo})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

function abrirModalNuevoProducto() {
    modoEdicion = false;
    document.getElementById("titulo-modal-producto").innerText = "Agregar Artículo";
    document.getElementById("prod-codigo").value = "";
    document.getElementById("prod-codigo").disabled = false;
    document.getElementById("prod-nombre").value = "";
    document.getElementById("prod-precio").value = "";
    document.getElementById("prod-categoria").value = "Carnes";
    let modal = new bootstrap.Modal(document.getElementById("modalProducto"));
    modal.show();
}

function abrirModalEditarProducto(codigo) {
    let articulos = JSON.parse(localStorage.getItem("minipos_articulos")) || [];
    let art = articulos.find(a => a.codigo == codigo);
    if (!art) return;
    modoEdicion = true;
    document.getElementById("titulo-modal-producto").innerText = "Modificar Artículo";
    document.getElementById("prod-codigo").value = art.codigo;
    document.getElementById("prod-codigo").disabled = true;
    document.getElementById("prod-nombre").value = art.nombre;
    document.getElementById("prod-precio").value = art.precio;
    document.getElementById("prod-categoria").value = art.categoria;
    let modal = new bootstrap.Modal(document.getElementById("modalProducto"));
    modal.show();
}

function guardarProductoAdmin() {
    let codigo = parseInt(document.getElementById("prod-codigo").value);
    let nombre = document.getElementById("prod-nombre").value.trim();
    let categoria = document.getElementById("prod-categoria").value;
    let precio = parseFloat(document.getElementById("prod-precio").value);
    if (!codigo || !nombre || isNaN(precio)) {
        return mostrarAlerta("Complete todos los campos correctamente.");
    }
    let articulos = JSON.parse(localStorage.getItem("minipos_articulos")) || [];
    if (modoEdicion) {
        let index = articulos.findIndex(a => a.codigo == codigo);
        if (index > -1) {
            articulos[index].nombre = nombre;
            articulos[index].categoria = categoria;
            articulos[index].precio = precio.toFixed(2);
            localStorage.setItem("minipos_articulos", JSON.stringify(articulos));
            registrarAccion(`Modificó el artículo código ${codigo}`);
            mostrarAlerta("Artículo modificado con éxito.");
        }
    } else {
        if (articulos.some(a => a.codigo === codigo)) {
            return mostrarAlerta("Ya existe un artículo con ese código.");
        }
        articulos.push({ codigo: codigo, nombre: nombre, categoria: categoria, precio: precio.toFixed(2) });
        localStorage.setItem("minipos_articulos", JSON.stringify(articulos));
        registrarAccion(`Agregó nuevo artículo: ${nombre}`);
        mostrarAlerta("Artículo agregado con éxito.");
    }
    let modalEl = document.getElementById("modalProducto");
    let modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    renderTablaAdminProductos();
    renderCatalogoRapido();
}

function eliminarProductoAdmin(codigo) {
    if (confirm(`¿Está seguro de eliminar el artículo código ${codigo}?`)) {
        let articulos = JSON.parse(localStorage.getItem("minipos_articulos")) || [];
        articulos = articulos.filter(a => a.codigo != codigo);
        localStorage.setItem("minipos_articulos", JSON.stringify(articulos));
        registrarAccion(`Eliminó el artículo código ${codigo}`);
        renderTablaAdminProductos();
        renderCatalogoRapido();
    }
}

function renderLogs() {
    let logs = JSON.parse(localStorage.getItem("minipos_logs")) || [];
    let tabla = document.getElementById("tabla-logs");
    if(!tabla) return;
    tabla.innerHTML = "";
    if(logs.length === 0) {
        tabla.innerHTML = `<tr><td colspan="3" class="text-muted py-3">No hay actividad registrada.</td></tr>`;
        return;
    }
    logs.slice().reverse().forEach(log => {
        tabla.innerHTML += `
            <tr>
                <td class="text-muted">${log.fecha}</td>
                <td class="fw-bold">${log.cajero}</td>
                <td class="text-start">${log.detalle}</td>
            </tr>`;
    });
}

function renderGrafica() {
    let ventas = JSON.parse(localStorage.getItem("minipos_ventas")) || [];
    let totales = { "Efectivo": 0, "Transferencia": 0, "Debito": 0 };
    ventas.forEach(v => { if(totales[v.pago] !== undefined) totales[v.pago] += v.total; });
    const ctx = document.getElementById('salesChart');
    if(!ctx) return;
    if(chartInstancia) chartInstancia.destroy();
    chartInstancia = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Efectivo', 'Transferencia', 'Débito'],
            datasets: [{ data: [totales.Efectivo, totales.Transferencia, totales.Debito], backgroundColor: ['#198754', '#0d6efd', '#0dcaf0'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function switchTab(tab) {
    if (tab === 'pos') {
        document.getElementById('view-pos').style.display = 'flex';
        document.getElementById('view-dashboard').style.display = 'none';
        renderCatalogoRapido();
    }
    }
