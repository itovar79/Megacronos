let inicio = 0, timeout = null, intervaloSonido = 38000, ciclos = 0, tiempoTotal = 0;
const sonido = new Audio('sounds/button-15.mp3');

sonido.addEventListener('error', () => {
    console.error('Error al cargar el sonido.');
});

// Función para configurar el intervalo
function setIntervalo() {
    const segundos = parseInt(document.getElementById("intervaloSegundos").value);
    const mensaje = document.getElementById("mensajeIntervalo");
    if (!isNaN(segundos) && segundos > 0 && segundos <= 9999) {
        intervaloSonido = segundos * 1000;
        mensaje.textContent = `Intervalo configurado a ${segundos} segundos.`;
        mensaje.style.color = "green";
        setTimeout(() => mensaje.textContent = "", 3000);

        // Guardar el intervalo en localStorage
        localStorage.setItem('intervalo', segundos);
    } else {
        mensaje.textContent = "Por favor, ingrese un valor válido entre 1 y 9999.";
        mensaje.style.color = "red";
    }
}

// Función para cambiar el tema
function cambiarTema(tema) {
    // Remover todas las clases de tema
    document.body.classList.remove('tema-claro', 'tema-oscuro', 'tema-azul', 'tema-verde', 'tema-rojo');
    // Aplicar el tema seleccionado
    document.body.classList.add(`tema-${tema}`);
    // Guardar la preferencia del tema en localStorage
    localStorage.setItem('tema', tema);
}

// Cargar la preferencia del tema al iniciar la página
function cargarTemaGuardado() {
    const temaGuardado = localStorage.getItem('tema') || 'claro'; // Tema claro por defecto
    document.body.classList.add(`tema-${temaGuardado}`);
    document.getElementById('temas').value = temaGuardado;
}

// Cargar el intervalo guardado al iniciar la página
function cargarIntervaloGuardado() {
    const intervaloGuardado = localStorage.getItem('intervalo');
    if (intervaloGuardado) {
        document.getElementById("intervaloSegundos").value = intervaloGuardado;
        intervaloSonido = intervaloGuardado * 1000;
    }
}

// Llamar a las funciones para cargar el tema y el intervalo al cargar la página
window.onload = () => {
    cargarTemaGuardado();
    cargarIntervaloGuardado();
};

function empezarDetener(elemento) {
    if (timeout === null) {
        ciclos = 0;
        tiempoTotal = 0;
        updateDisplay();
        alternarBoton(elemento, true);
        inicio = Date.now();
        funcionando();
    } else {
        alternarBoton(elemento, false);
        clearInterval(timeout);
        timeout = null;
        sonido.pause();
        sonido.currentTime = 0;
    }
}

function funcionando() {
    timeout = setInterval(() => {
        const actual = Date.now();
        const diff = actual - inicio;

        const horas = Math.floor(diff / 3600000),
            minutos = Math.floor((diff % 3600000) / 60000),
            segundos = Math.floor((diff % 60000) / 1000),
            milisegundos = Math.floor(diff % 1000);

        // Formatear el tiempo (sin ceros innecesarios)
        let tiempoFormateado = "";

        if (horas > 0) {
            tiempoFormateado += `${formatNumber(horas)}:`;
        }
        if (minutos > 0 || horas > 0) {
            tiempoFormateado += `${formatNumber(minutos)}:`;
        }
        tiempoFormateado += `${formatNumber(segundos)}:${formatNumber(milisegundos, 3)}`;

        // Actualiza el cronómetro en la página
        document.getElementById('crono').innerHTML = tiempoFormateado;

        // Actualiza el título de la página (solo segundos)
        document.title = `${formatNumber(segundos)}`;

        if (diff >= intervaloSonido) {
            sonido.currentTime = 0;
            sonido.play();
            inicio = Date.now();
            ciclos++;
            tiempoTotal += intervaloSonido;
            updateDisplay();
        }
    }, 10);
}

function updateDisplay() {
    const minutos = Math.floor(tiempoTotal / 60000),
        segundos = Math.floor((tiempoTotal % 60000) / 1000);

    document.getElementById('tiempoTotal').textContent = `Tiempo total: ${formatNumber(minutos)}:${formatNumber(segundos)}`;
    document.getElementById('ciclos').textContent = `Ciclos: ${ciclos}`;
}

// Función para formatear números (sin ceros innecesarios)
function formatNumber(num, digits = 2) {
    if (num === 0 && digits === 2) return ""; // No mostrar ceros innecesarios
    return num > 9 ? num : `0${num}`;
}

function alternarBoton(elemento, estado) {
    elemento.value = estado ? "Detener" : "Empezar";
    elemento.disabled = false;
}
