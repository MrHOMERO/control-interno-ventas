// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
let productosInventario = [
    { codigo: "1", nombre: "Asado de Res", categoria: "Carnicería", precio: 320 },
    { codigo: "2", nombre: "Asado Especial", categoria: "Carnicería", precio: 559 },
    { codigo: "3", nombre: "Milanesa de Res", categoria: "Carnicería", precio: 290 },
    { codigo: "4", nombre: "Vacío", categoria: "Carnicería", precio: 390 },
    { codigo: "5", nombre: "Entraña", categoria: "Carnicería", precio: 450 },
    { codigo: "6", nombre: "Matambre de Res", categoria: "Carnicería", precio: 410 },
    { codigo: "7", nombre: "Ojo de Bife", categoria: "Carnicería", precio: 480 },
    { codigo: "8", nombre: "Lomo de Res", categoria: "Carnicería", precio: 520 },
    { codigo: "9", nombre: "Falda", categoria: "Carnicería", precio: 260 },
    { codigo: "10", nombre: "Puchero de Res", categoria: "Carnicería", precio: 190 },
    { codigo: "11", nombre: "Paleta", categoria: "Carnicería", precio: 310 },
    { codigo: "12", nombre: "Aguja", categoria: "Carnicería", precio: 280 },
    { codigo: "13", nombre: "Bola de Lomo", categoria: "Carnicería", precio: 350 },
    { codigo: "14", nombre: "Cuadrada", categoria: "Carnicería", precio: 350 },
    { codigo: "15", nombre: "Nalga", categoria: "Carnicería", precio: 370 },
    { codigo: "16", nombre: "Costillar", categoria: "Carnicería", precio: 340 },
    { codigo: "17", nombre: "Churrasco de Res", categoria: "Carnicería", precio: 330 },
    { codigo: "18", nombre: "Carne Picada Común", categoria: "Carnicería", precio: 240 },
    { codigo: "19", nombre: "Carne Picada Especial", categoria: "Carnicería", precio: 310 },
    { codigo: "20", nombre: "Hueso de Res", categoria: "Carnicería", precio: 100 },
    { codigo: "21", nombre: "Pechuga de Pollo", categoria: "Carnicería", precio: 280 },
    { codigo: "22", nombre: "Patlo y Muslo", categoria: "Carnicería", precio: 180 },
    { codigo: "23", nombre: "Pollo Entero", categoria: "Carnicería", precio: 160 },
    { codigo: "24", nombre: "Alitas de Pollo", categoria: "Carnicería", precio: 150 },
    { codigo: "25", nombre: "Suprema de Pollo", categoria: "Carnicería", precio: 310 },
    { codigo: "26", nombre: "Menudos de Pollo", categoria: "Carnicería", precio: 110 },
    { codigo: "27", nombre: "Milanesa de Pollo", categoria: "Carnicería", precio: 290 },
    { codigo: "28", nombre: "Hamburguesa de Pollo", categoria: "Carnicería", precio: 250 },
    { codigo: "29", nombre: "Nuggets de Pollo", categoria: "Carnicería", precio: 270 },
    { codigo: "30", nombre: "Milanesa de Peceto", categoria: "Carnicería", precio: 390 },
    { codigo: "31", nombre: "Peceto", categoria: "Carnicería", precio: 430 },
    { codigo: "32", nombre: "Cuadril", categoria: "Carnicería", precio: 390 },
    { codigo: "33", nombre: "Colita de Cuadril", categoria: "Carnicería", precio: 440 },
    { codigo: "34", nombre: "Bife Ancho", categoria: "Carnicería", precio: 340 },
    { codigo: "35", nombre: "Bife Angosto", categoria: "Carnicería", precio: 360 },
    { codigo: "36", nombre: "T-Bone", categoria: "Carnicería", precio: 490 },
    { codigo: "37", nombre: "Tomahawk", categoria: "Carnicería", precio: 510 },
    { codigo: "38", nombre: "Picaña", categoria: "Carnicería", precio: 470 },
    { codigo: "39", nombre: "Hambre de Cerdo", categoria: "Carnicería", precio: 320 },
    { codigo: "40", nombre: "Costillar de Cerdo", categoria: "Carnicería", precio: 350 },
    { codigo: "41", nombre: "Bondiola de Cerdo", categoria: "Carnicería", precio: 340 },
    { codigo: "42", nombre: "Pechito de Cerdo", categoria: "Carnicería", precio: 360 },
    { codigo: "43", nombre: "Carré de Cerdo", categoria: "Carnicería", precio: 310 },
    { codigo: "44", nombre: "Matambre de Cerdo", categoria: "Carnicería", precio: 420 },
    { codigo: "45", nombre: "Chorizo de Pollo", categoria: "Carnicería", precio: 280 },
    { codigo: "46", nombre: "Chorizo de Cerdo", categoria: "Carnicería", precio: 300 },
    { codigo: "47", nombre: "Chorizo Parrillero", categoria: "Carnicería", precio: 290 },
    { codigo: "48", nombre: "Chorizo Colorado", categoria: "Carnicería", precio: 330 },
    { codigo: "49", nombre: "Morcilla Dulce", categoria: "Carnicería", precio: 270 },
    { codigo: "50", nombre: "Morcilla Salada", categoria: "Carnicería", precio: 270 },
    { codigo: "51", nombre: "Salchicha parrillera", categoria: "Carnicería", precio: 310 },
    { codigo: "52", nombre: "Chinchulín", categoria: "Carnicería", precio: 180 },
    { codigo: "53", nombre: "Molleja", categoria: "Carnicería", precio: 650 },
    { codigo: "54", nombre: "Riñón", categoria: "Carnicería", precio: 200 },
    { codigo: "55", nombre: "Higado de Res", categoria: "Carnicería", precio: 150 },
    { codigo: "56", nombre: "Lengua", categoria: "Carnicería", precio: 290 },
    { codigo: "57", nombre: "Sesos", categoria: "Carnicería", precio: 160 },
    { codigo: "58", nombre: "Tripa Rellena", categoria: "Carnicería", precio: 340 },
    { codigo: "59", nombre: "Cuerito de Cerdo", categoria: "Carnicería", precio: 210 },
    { codigo: "60", nombre: "Patitas de Cerdo", categoria: "Carnicería", precio: 150 },
    { codigo: "61", nombre: "Medallón de Carne", categoria: "Carnicería", precio: 230 },
    { codigo: "62", nombre: "Medallón de Jamón y Queso", categoria: "Carnicería", precio: 260 },
    { codigo: "63", nombre: "Brochette Mixta", categoria: "Carnicería", precio: 150 },
    { codigo: "64", nombre: "Brochette de Res", categoria: "Carnicería", precio: 140 },
    { codigo: "65", nombre: "Brochette de Pollo", categoria: "Carnicería", precio: 130 },
    { codigo: "66", nombre: "Albóndigas de Res", categoria: "Carnicería", precio: 290 },
    { codigo: "67", nombre: "Hamburguesa Vacuna Casera", categoria: "Carnicería", precio: 320 },
    { codigo: "68", nombre: "Niños Envueltos", categoria: "Carnicería", precio: 330 },
    { codigo: "69", nombre: "Arrollado de Pollo", categoria: "Carnicería", precio: 390 },
    { codigo: "70", nombre: "Matambre Relleno", categoria: "Carnicería", precio: 490 },
    { codigo: "71", nombre: "Pollo Relleno", categoria: "Carnicería", precio: 410 },
    { codigo: "72", nombre: "Bondiola Rellena", categoria: "Carnicería", precio: 460 },
    { codigo: "73", nombre: "Costilla de Cordero", categoria: "Carnicería", precio: 550 },
    { codigo: "74", nombre: "Cordero Entero", categoria: "Carnicería", precio: 480 },
    { codigo: "75", nombre: "Pulpa de Cordero", categoria: "Carnicería", precio: 620 },
    { codigo: "76", nombre: "Hamburguesa de Cordero", categoria: "Carnicería", precio: 360 },
    { codigo: "77", nombre: "Chorizo de Cordero", categoria: "Carnicería", precio: 350 },
    { codigo: "78", nombre: "Asado Sin Hueso", categoria: "Carnicería", precio: 440 },
    { codigo: "79", nombre: "Paleta Sin Hueso", categoria: "Carnicería", precio: 360 },
    { codigo: "80", nombre: "Tortuguita", categoria: "Carnicería", precio: 340 },
    { codigo: "81", nombre: "Garrón", categoria: "Carnicería", precio: 220 },
    { codigo: "82", nombre: "Ossobuco", categoria: "Carnicería", precio: 240 },
    { codigo: "83", nombre: "Roast Beef", categoria: "Carnicería", precio: 320 },
    { codigo: "84", nombre: "Lomo Fino", categoria: "Carnicería", precio: 580 },
    { codigo: "85", nombre: "Entraña Fina", categoria: "Carnicería", precio: 490 },
    { codigo: "86", nombre: "Falda Parrillera", categoria: "Carnicería", precio: 290 },
    { codigo: "87", nombre: "Punta de Músculo", categoria: "Carnicería", precio: 280 },
    { codigo: "88", nombre: "Muslo Deshuesado", categoria: "Carnicería", precio: 250 },
    { codigo: "89", nombre: "Suprema Rellena", categoria: "Carnicería", precio: 370 },
    { codigo: "90", nombre: "Patitas Rebozadas", categoria: "Carnicería", precio: 260 },
    { codigo: "91", nombre: "Churrasco de Cerdo", categoria: "Carnicería", precio: 330 },
    { codigo: "92", nombre: "Medallón de Cerdo", categoria: "Carnicería", precio: 350 },
    { codigo: "93", nombre: "Jamón de Cerdo", categoria: "Carnicería", precio: 310 },
    { codigo: "94", nombre: "Longaniza", categoria: "Carnicería", precio: 390 },
    { codigo: "95", nombre: "Salamín Picado Fino", categoria: "Carnicería", precio: 450 },
    { codigo: "96", nombre: "Salamín Picado Grueso", categoria: "Carnicería", precio: 460 },
    { codigo: "97", nombre: "Chorizo Español", categoria: "Carnicería", precio: 360 },
    { codigo: "98", nombre: "Chinchulín Trenzado", categoria: "Carnicería", precio: 210 },
    { codigo: "99", nombre: "Churrasco de Cerdo Especial", categoria: "Carnicería", precio: 360 },
    { codigo: "100", nombre: "Pecho de Res", categoria: "Carnicería", precio: 230 },
    { codigo: "101", nombre: "Ossobuco Especial", categoria: "Carnicería", precio: 270 },
    { codigo: "102", nombre: "Lomo Entero Envasado", categoria: "Carnicería", precio: 590 },
    { codigo: "103", nombre: "Medallón de Pollo c/ Queso", categoria: "Carnicería", precio: 290 },
    { codigo: "104", nombre: "Filet de Res", categoria: "Carnicería", precio: 510 },
    { codigo: "105", nombre: "Bife de Chorizo", categoria: "Carnicería", precio: 430 },
    { codigo: "106", nombre: "Asado Aleman", categoria: "Carnicería", precio: 380 },
    { codigo: "107", nombre: "Vacío Envasado al Vacío", categoria: "Carnicería", precio: 420 },
    { codigo: "108", nombre: "Entraña Gruesa", categoria: "Carnicería", precio: 470 },
    { codigo: "109", nombre: "Matambre Tierno", categoria: "Carnicería", precio: 440 },
    { codigo: "110", nombre: "Bife de Lomo", categoria: "Carnicería", precio: 530 },
    { codigo: "111", nombre: "Falda Sin Hueso", categoria: "Carnicería", precio: 310 },
    { codigo: "112", nombre: "Puchero Especial", categoria: "Carnicería", precio: 230 },
    { codigo: "113", nombre: "Paleta Seleccionada", categoria: "Carnicería", precio: 340 },
    { codigo: "114", nombre: "Aguja Sin Hueso", categoria: "Carnicería", precio: 300 },
    { codigo: "115", nombre: "Bola de Lomo Especial", categoria: "Carnicería", precio: 380 },
    { codigo: "116", nombre: "Cuadrada Seleccionada", categoria: "Carnicería", precio: 380 },
    { codigo: "117", nombre: "Nalga Fina", categoria: "Carnicería", precio: 400 },
    { codigo: "118", nombre: "Costillar Premium", categoria: "Carnicería", precio: 390 },
    { codigo: "119", nombre: "Churrasco tierno", categoria: "Carnicería", precio: 350 },
    { codigo: "120", nombre: "Picada Premium", categoria: "Carnicería", precio: 350 },
    { codigo: "121", nombre: "Pechuga Deshuesada", categoria: "Carnicería", precio: 310 },
    { codigo: "122", nombre: "Muslo de Pollo", categoria: "Carnicería", precio: 190 },
    { codigo: "123", nombre: "Pollo Campepero", categoria: "Carnicería", precio: 210 },
    { codigo: "124", nombre: "Alitas Especiales", categoria: "Carnicería", precio: 170 },
    { codigo: "125", nombre: "Suprema de Pollo Fina", categoria: "Carnicería", precio: 330 },
    { codigo: "126", nombre: "Corazón de Pollo", categoria: "Carnicería", precio: 220 },
    { codigo: "127", nombre: "Milanesa Suprema de Pollo", categoria: "Carnicería", precio: 340 },
    { codigo: "128", nombre: "Hamburguesa Gourmet Pollo", categoria: "Carnicería", precio: 280 },
    { codigo: "129", nombre: "Nuggets Caseros Pollo", categoria: "Carnicería", precio: 290 },
    { codigo: "130", nombre: "Peceto Fino", categoria: "Carnicería", precio: 450 },
    { codigo: "131", nombre: "Cuadril Seleccionado", categoria: "Carnicería", precio: 420 },
    { codigo: "132", nombre: "Colita de Cuadril Tierna", categoria: "Carnicería", precio: 470 },
    { codigo: "133", nombre: "Bife Ancho Seleccionado", categoria: "Carnicería", precio: 370 },
    { codigo: "134", nombre: "Bife Angosto Premium", categoria: "Carnicería", precio: 390 },
    { codigo: "135", nombre: "T-Bone Añejado", categoria: "Carnicería", precio: 530 },
    { codigo: "136", nombre: "Tomahawk Premium", categoria: "Carnicería", precio: 560 },
    { codigo: "137", nombre: "Picaña Rústica", categoria: "Carnicería", precio: 500 },
    { codigo: "138", nombre: "Cerdo Costillar Ancho", categoria: "Carnicería", precio: 380 },
    { codigo: "139", nombre: "Bondiola Premium", categoria: "Carnicería", precio: 370 },
    { codigo: "140", nombre: "Pechito Ahumado", categoria: "Carnicería", precio: 410 },
    { codigo: "141", nombre: "Carré Deshuesado", categoria: "Carnicería", precio: 340 },
    { codigo: "142", nombre: "Matambre de Cerdo Tierno", categoria: "Carnicería", precio: 450 },
    { codigo: "143", nombre: "Chorizo Criollo", categoria: "Carnicería", precio: 290 },
    { codigo: "144", nombre: "Chorizo Ahumado", categoria: "Carnicería", precio: 320 },
    { codigo: "145", nombre: "Chorizo Barbacoa", categoria: "Carnicería", precio: 310 },
    { codigo: "146", nombre: "Morcilla con Nueces", categoria: "Carnicería", precio: 310 },
    { codigo: "147", nombre: "Salchicha Parrillera Fina", categoria: "Carnicería", precio: 330 },
    { codigo: "148", nombre: "Chinchulín Selección", categoria: "Carnicería", precio: 200 },
    { codigo: "149", nombre: "Molleja de Corazón", categoria: "Carnicería", precio: 720 },
    { codigo: "150", nombre: "Riñón Limpio", categoria: "Carnicería", precio: 220 },
    { codigo: "151", nombre: "Higado Seleccionado", categoria: "Carnicería", precio: 170 },
    { codigo: "152", nombre: "Lengua Tiernizada", categoria: "Carnicería", precio: 320 },
    { codigo: "153", nombre: "Sesos Frescos", categoria: "Carnicería", precio: 180 },
    { codigo: "154", nombre: "Tripa gorda", categoria: "Carnicería", precio: 290 },
    { codigo: "155", nombre: "Cuerito Seleccionado", categoria: "Carnicería", precio: 230 },
    { codigo: "156", nombre: "Patitas Tiernas", categoria: "Carnicería", precio: 170 },
    { codigo: "157", nombre: "Medallón Especial de Res", categoria: "Carnicería", precio: 250 },
    { codigo: "158", nombre: "Brochette Premium", categoria: "Carnicería", precio: 180 },
    { codigo: "159", nombre: "Albóndigas Finas", categoria: "Carnicería", precio: 310 },
    { codigo: "160", nombre: "Hamburguesa Estilo Angus", categoria: "Carnicería", precio: 360 },
    { codigo: "161", nombre: "Niños Envueltos Premium", categoria: "Carnicería", precio: 360 },
    { codigo: "162", nombre: "Arrollado de Carne", categoria: "Carnicería", precio: 420 },
    { codigo: "163", nombre: "Matambre Relleno Especial", categoria: "Carnicería", precio: 530 },
    { codigo: "164", nombre: "Pollo Relleno Jamón y Queso", categoria: "Carnicería", precio: 450 },
    { codigo: "165", nombre: "Bondiola Rellena Especial", categoria: "Carnicería", precio: 500 },
    { codigo: "166", nombre: "Costillar de Cordero Fino", categoria: "Carnicería", precio: 590 },
    { codigo: "167", nombre: "Pulpa Cordero Seleccionada", categoria: "Carnicería", precio: 660 },
    { codigo: "168", nombre: "Hamburguesa Cordero Gourmet", categoria: "Carnicería", precio: 390 },
    { codigo: "169", nombre: "Asado Sin Hueso Fino", categoria: "Carnicería", precio: 480 },
    { codigo: "170", nombre: "Paleta Sin Hueso Fina", categoria: "Carnicería", precio: 390 },
    { codigo: "171", nombre: "Garrón Seleccionado", categoria: "Carnicería", precio: 240 },
    { codigo: "172", nombre: "Ossobuco Seleccionado", categoria: "Carnicería", precio: 270 },
    { codigo: "173", nombre: "Roast Beef Seleccionado", categoria: "Carnicería", precio: 350 },
    { codigo: "174", nombre: "Lomo Fino Seleccionado", categoria: "Carnicería", precio: 620 },
    { codigo: "175", nombre: "Entraña Fina Seleccionada", categoria: "Carnicería", precio: 530 },
    { codigo: "176", nombre: "Falda Seleccionada", categoria: "Carnicería", precio: 320 },
    { codigo: "177", nombre: "Muslo Deshuesado Fino", categoria: "Carnicería", precio: 280 },
    { codigo: "178", nombre: "Suprema Rellena Jamón/Queso", categoria: "Carnicería", precio: 410 },
    { codigo: "179", nombre: "Churrasco de Cerdo Fino", categoria: "Carnicería", precio: 360 },
    { codigo: "180", nombre: "Medallón de Cerdo Fino", categoria: "Carnicería", precio: 390 },
    { codigo: "181", nombre: "Longaniza Especial", categoria: "Carnicería", precio: 420 },
    { codigo: "182", nombre: "Salamín Especial", categoria: "Carnicería", precio: 490 },
    { codigo: "183", nombre: "Chorizo Español Fino", categoria: "Carnicería", precio: 390 },
    { codigo: "184", nombre: "Chinchulín Rústico", categoria: "Carnicería", precio: 230 },
    { codigo: "185", nombre: "Costillar de Cerdo Ahumado", categoria: "Carnicería", precio: 430 },
    { codigo: "186", nombre: "Entraña Angus", categoria: "Carnicería", precio: 560 },
    { codigo: "187", nombre: "Bife de Costilla", categoria: "Carnicería", precio: 340 },
    { codigo: "188", nombre: "Asado Americano", categoria: "Carnicería", precio: 410 },
    { codigo: "189", nombre: "Matambre de Cerdo Ahumado", categoria: "Carnicería", precio: 480 },
    { codigo: "190", nombre: "Picaña Angus", categoria: "Carnicería", precio: 580 },
    { codigo: "191", nombre: "Chorizo Bombón", categoria: "Carnicería", precio: 310 },
    { codigo: "192", nombre: "Morcilla Bombón", categoria: "Carnicería", precio: 290 },
    { codigo: "193", nombre: "Puchero de Cerdo", categoria: "Carnicería", precio: 210 },
    { codigo: "194", nombre: "Hueso de Cerdito", categoria: "Carnicería", precio: 120 },
    { codigo: "195", nombre: "Grasa de pella", categoria: "Carnicería", precio: 90 },
    { codigo: "196", nombre: "Riñón de Cerdo", categoria: "Carnicería", precio: 190 },
    { codigo: "197", nombre: "Corazón de Res", categoria: "Carnicería", precio: 210 },
    { codigo: "198", nombre: "Corte Americano Ribeye", categoria: "Carnicería", precio: 640 },
    { codigo: "199", nombre: "Corte New York Strip", categoria: "Carnicería", precio: 610 },
    { codigo: "200", nombre: "Asado Bandera", categoria: "Carnicería", precio: 350 }
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
