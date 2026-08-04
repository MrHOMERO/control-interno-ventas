let cajeroActivo = "Ninguno";
let turnoActivo = "Ninguno";
let metodoPagoActivo = "Efectivo";
let chartInstancia = null;

document.addEventListener("DOMContentLoaded", function() {
    let articulosCarnes = [];
    for (let i = 1; i <= 150; i++) {
        articulosCarnes.push({
            codigo: i, 
            nombre: `Corte de Carnicería Especial ${i}`, 
            categoria: "Carnes", 
            precio: (250.00 + (i * 1.5)).toFixed(2)
        });
    }
    localStorage.setItem("minipos_articulos", JSON.stringify(articulosCarnes));

    renderCatalogoRapido();
    renderCart();
    renderLogs();
    renderResumenTurno();
});

function renderResumenTurno() {
    let ventas = JSON.parse(localStorage.getItem("minipos_ventas")) || [];
    let ventasTurno = ventas.filter(v => v.cajero === cajeroActivo && v.turno === turnoActivo);
    
    let totalEf = 0, totalTr = 0, totalDe = 0, totalDescTurno = 0;
    ventasTurno.forEach(v => {
        if(v.pago === "Efectivo") totalEf += v.total;
        if(v.pago === "Transferencia") totalTr += v.total;
        if(v.pago === "Debito") totalDe += v.total;
        totalDescTurno += (v.descuento || 0);
    });

    document.getElementById("contador-ventas").innerText = `${ventasTurno.length} Ventas`;
    document.getElementById("total-efectivo-ui").innerText = `$U ${totalEf.toFixed(2)}`;
    document.getElementById("total-transf-ui").innerText = `$U ${totalTr.toFixed(2)}`;
    document.getElementById("total-debito-ui").innerText = `$U ${totalDe.toFixed(2)}`;
    document.getElementById("caja-efectivo-total").innerText = `$U ${totalEf.toFixed(2)}`;
    document.getElementById("total-descuentos-turno-ui").innerText = `$U ${totalDescTurno.toFixed(2)}`;
}

function registrarAccion(accion) {
    let logs = JSON.parse(localStorage.getItem("minipos_logs")) || [];
    logs.push({ fecha: new Date().toLocaleString('es-UY'), detalle: accion, cajero: cajeroActivo });
    localStorage.setItem("minipos_logs", JSON.stringify(logs));
    renderLogs();
}

function abrirModalTurno() {
    if(cajeroActivo !== "Ninguno") {
        alert(`Ya hay un turno activo para ${cajeroActivo}. Cierre la caja primero.`);
        return;
    }
    let modal = new bootstrap.Modal(document.getElementById("modalTurno"));
    modal.show();
}

function iniciarTurnoCajero() {
    let horario = document.getElementById("select-horario-turno").value;
    let nombre = document.getElementById("input-cajero-nombre").value.trim();
    let pin = document.getElementById("input-cajero-pin").value.trim();

    if (!nombre || !pin) return alert("Complete nombre y PIN.");
    let cajeros = JSON.parse(localStorage.getItem("minipos_cajeros")) || [];
    let cajeroEncontrado = cajeros.find(c => c.nombre.toLowerCase() === nombre.toLowerCase() && c.pin === pin);
    if (!cajeroEncontrado) return alert("Cajero no registrado o PIN incorrecto.");

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
    alert(`Turno iniciado para ${cajeroActivo}.`);
}

function registrarNuevoCajero() {
    let nombre = document.getElementById("input-cajero-nombre").value.trim();
    let pin = document.getElementById("input-cajero-pin").value.trim();
    if (!nombre || !pin) return alert("Ingrese nombre y PIN.");
    let cajeros = JSON.parse(localStorage.getItem("minipos_cajeros")) || [];
    if (cajeros.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) return alert("Ya existe.");

    cajeros.push({ nombre, pin });
    localStorage.setItem("minipos_cajeros", JSON.stringify(cajeros));
    alert("Cajero registrado. Ya puede iniciar turno.");
}

function cerrarCaja() {
    if(cajeroActivo === "Ninguno") {
        alert("No hay un turno activo para cerrar.");
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
        alert("Caja cerrada exitosamente.");
    }
}

function actualizarMetodoPago() {
    let radios = document.getElementsByName('btnradio_pago');
    for(let radio of radios) {
        if(radio.checked) {
            metodoPagoActivo = radio.value;
            break;
        }
    }
    
    let info = document.getElementById("info-descuento");
    if(metodoPagoActivo === "Debito") {
        info.innerText = "Pago con Débito: NO aplica descuento en Carnes.";
        info.className = "text-danger d-block mt-1 fw-bold";
    } else {
        info.innerText = "Aplica descuento real en Carnes (Efectivo/Transferencia).";
        info.className = "text-success d-block mt-1 fw-bold";
    }
    
    renderCart();
}

function manejarEnterEscanner(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        procesarCodigoBarras();
    }
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
        alert("Artículo no encontrado.");
    }
}

function agregarAlCarrito(codigo) {
    let articulos = JSON.parse(localStorage.getItem("minipos_articulos")) || [];
    let articulo = articulos.find(art => art.codigo == codigo);
    if (!articulo) return;

    let carrito = JSON.parse(localStorage.getItem("minipos_carrito")) || [];
    let precioFinal = parseFloat(articulo.precio);
    let index = carrito.findIndex(item => item.codigo == codigo);
    
    if (index > -1) {
        carrito[index].cantidad += 1;
    } else {
        carrito.push({
            codigo: articulo.codigo, 
            nombre: articulo.nombre,
            categoria: articulo.categoria,
            precio: precioFinal, 
            cantidad: 1
        });
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
        let totalItem = item.precio * item.cantidad;
        subtotal += totalItem;

        let descuentoItem = 0;
        if (item.categoria === "Carnes" && (metodoPagoActivo === "Efectivo" || metodoPagoActivo === "Transferencia")) {
            descuentoItem = totalItem - (totalItem / 1.1);
            descuentoTotal += descuentoItem;
        }

        contenedor.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center py-2 small">
                <div>
                    <strong>${item.nombre}</strong> <span class="badge bg-success" style="font-size:0.65rem;">${item.categoria}</span><br>
                    <span class="text-muted">${item.cantidad} x $U ${item.precio.toFixed(2)}</span>
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
    if (carrito.length === 0) return alert("El carrito está vacío.");
    if (cajeroActivo === "Ninguno") return alert("Inicie turno antes de cobrar.");

    let ventas = JSON.parse(localStorage.getItem("minipos_ventas")) || [];
    ventas.push({
        fecha: new Date().toLocaleString('es-UY'),
        cajero: cajeroActivo,
        turno: turnoActivo,
        pago: metodoPagoActivo,
        total: window.totalActual,
        descuento: window.descuentoActual || 0
    });
    localStorage.setItem("minipos_ventas", JSON.stringify(ventas));

    registrarAccion(`Cobró venta N°${ventas.filter(v => v.cajero === cajeroActivo && v.turno === turnoActivo).length} ($U ${window.totalActual.toFixed(2)}) - ${metodoPagoActivo}`);
    
    localStorage.removeItem("minipos_carrito");
    
    renderCart();
    renderResumenTurno();
    renderGrafica();
    alert("¡Venta cobrada con éxito!");
}

function renderCatalogoRapido() {
    let filtro = document.getElementById("input-buscar-articulo") ? document.getElementById("input-buscar-articulo").value.toLowerCase() : "";
    let articulos = JSON.parse(localStorage.getItem("minipos_articulos")) || [];
    let grid = document.getElementById("product-grid");
    if (!grid) return;
    grid.innerHTML = "";

    let filtrados = articulos.filter(art => art.codigo.toString().includes(filtro) || art.nombre.toLowerCase().includes(filtro));

    if (filtrados.length === 0) {
        grid.innerHTML = `<div class="p-3 text-center text-muted small">No se encontraron artículos de carnes.</div>`;
        return;
    }

    filtrados.forEach(art => {
        let esCoincidenciaBuscador = filtro !== "" && (art.codigo.toString() === filtro || art.nombre.toLowerCase().includes(filtro));
        let claseColorCard = esCoincidenciaBuscador ? "bg-secondary text-white" : "bg-white text-dark";
        let estiloExtra = esCoincidenciaBuscador ? "border: 2px solid #495057;" : "";

        grid.innerHTML += `
            <div class="col">
                <div class="card shadow-sm ${claseColorCard}" style="cursor: pointer; ${estiloExtra}" onclick="agregarAlCarrito(${art.codigo})">
                    <div class="card-body py-2 d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge ${esCoincidenciaBuscador ? 'bg-dark text-light' : 'bg-secondary'}">Cód: ${art.codigo}</span>
                            <span class="badge bg-success" style="font-size:0.65rem;">${art.categoria} (Desc. Real)</span>
                            <h6 class="mb-0 fw-bold mt-1 small">${art.nombre}</h6>
                        </div>
                        <span class="fw-bold ${esCoincidenciaBuscador ? 'text-light' : 'text-success'}">$U ${parseFloat(art.precio).toFixed(2)}</span>
                    </div>
                </div>
            </div>`;
    });
}

function filtrarCatalogoRapido() { renderCatalogoRapido(); }

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
    
    ventas.forEach(v => {
        if(totales[v.pago] !== undefined) totales[v.pago] += v.total;
    });

    const ctx = document.getElementById('salesChart');
    if(!ctx) return;

    if(chartInstancia) chartInstancia.destroy();

    chartInstancia = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Efectivo', 'Transferencia', 'Débito'],
            datasets: [{
                data: [totales.Efectivo, totales.Transferencia, totales.Debito],
                backgroundColor: ['#198754', '#0d6efd', '#0dcaf0']
            }]
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

function verAdmin() {
    document.getElementById('view-pos').style.display = 'none';
    document.getElementById('view-dashboard').style.display = 'flex';
    renderLogs();
    renderGrafica();
}
