let inicio = 0,
    timeout = null,
    intervaloSonido = 38000,
    ciclos = 0,
    tiempoTotal = 0,
    parpadeoIntervalo = null,
    parpadeoActivo = false;

let sonido = new Audio();
let sonidoSeleccionado = "alarma1.mp3";

// Elementos DOM
const crono = document.getElementById('crono');
const ciclosDisplay = document.getElementById('ciclos');
const tiempoTotalDisplay = document.getElementById('tiempoTotal');
const mensaje = document.getElementById('mensajeIntervalo');
const selectorSonido = document.getElementById('sonido');
const selectTema = document.getElementById('temas');

const TITULO_ORIGINAL = document.title;

// Función para cargar sonido
function cargarSonido(nombre) {
    sonido.src = `sounds/${nombre}`;
    sonido.load();
}

// Configurar intervalo
function setIntervalo() {
    const segundos = parseInt(document.getElementById("intervaloSegundos").value);
    if (!isNaN(segundos) && segundos > 0 && segundos <= 9999) {
        intervaloSonido = segundos * 1000;
        mensaje.textContent = `Intervalo configurado a ${segundos} segundos.`;
        mensaje.style.color = "green";
        setTimeout(() => mensaje.textContent = "", 3000);
        localStorage.setItem('intervalo', segundos);
    } else {
        mensaje.textContent = "Por favor, ingrese un valor válido entre 1 y 9999.";
        mensaje.style.color = "red";
    }
}

// Cambiar tema
function cambiarTema(tema) {
    document.body.className = '';
    document.body.classList.add(`tema-${tema}`);
    localStorage.setItem('tema', tema);
}

// Cargar tema guardado
function cargarTemaGuardado() {
    const tema = localStorage.getItem('tema') || 'claro';
    cambiarTema(tema);
    if (selectTema) selectTema.value = tema;
}

// Cargar intervalo guardado
function cargarIntervaloGuardado() {
    const intervalo = localStorage.getItem('intervalo');
    if (intervalo) {
        document.getElementById("intervaloSegundos").value = intervalo;
        intervaloSonido = intervalo * 1000;
    }
}

// Cargar sonido guardado
function cargarSonidoGuardado() {
    const guardado = localStorage.getItem('sonido');
    if (guardado) {
        sonidoSeleccionado = guardado;
        if (selectorSonido) selectorSonido.value = guardado;
    }
    cargarSonido(sonidoSeleccionado);
}

// Alternar botón Empezar/Detener
function alternarBoton(elemento, estado) {
    elemento.value = estado ? "Detener" : "Empezar";
    elemento.disabled = false;
}

// Formatear números (con ceros delante)
function formatNumber(num, digits = 2) {
    return num > 9 ? num : `0${num}`;
}

// Actualizar display ciclos y tiempo total
function updateDisplay() {
    const minutos = Math.floor(tiempoTotal / 60000),
          segundos = Math.floor((tiempoTotal % 60000) / 1000);

    tiempoTotalDisplay.textContent = `Tiempo total: ${formatNumber(minutos)}:${formatNumber(segundos)}`;
    ciclosDisplay.textContent = `Ciclos: ${ciclos}`;
}

// Función que inicia o detiene el cronómetro
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
        detenerParpadeo();
        document.title = TITULO_ORIGINAL;
        cambiarFavicon('favicon.ico');
    }
}

// Cronómetro funcionando
function funcionando() {
    timeout = setInterval(() => {
        const actual = Date.now();
        const diff = actual - inicio;

        const horas = Math.floor(diff / 3600000),
            minutos = Math.floor((diff % 3600000) / 60000),
            segundos = Math.floor((diff % 60000) / 1000),
            milisegundos = Math.floor(diff % 1000);

        let tiempoFormateado = "";

        if (horas > 0) tiempoFormateado += `${formatNumber(horas)}:`;
        if (minutos > 0 || horas > 0) tiempoFormateado += `${formatNumber(minutos)}:`;
        tiempoFormateado += `${formatNumber(segundos)}:${formatNumber(milisegundos, 3)}`;

        crono.innerHTML = tiempoFormateado;

        // Actualizar título (segundos)
        document.title = `${formatNumber(segundos)}`;

        if (diff >= intervaloSonido) {
            // Asegurar que se use el sonido seleccionado
            sonido.src = `sounds/${sonidoSeleccionado}`;
            sonido.load();
            sonido.currentTime = 0;
            sonido.play();

            inicio += intervaloSonido;
            ciclos++;
            tiempoTotal += intervaloSonido;
            updateDisplay();

            iniciarParpadeo();
        }
    }, 10);
}

// Cambiar favicon para parpadeo
function cambiarFavicon(nombre) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = nombre;
}

// Iniciar parpadeo del título e ícono
function iniciarParpadeo() {
    if (parpadeoActivo) return; // Ya está parpadeando
    parpadeoActivo = true;
    let toggle = false;
    parpadeoIntervalo = setInterval(() => {
        document.title = toggle ? '!Atención!' : TITULO_ORIGINAL;
        cambiarFavicon(toggle ? 'favicon-alarma.ico' : 'favicon.ico');
        toggle = !toggle;
    }, 700);
}

// Detener parpadeo y restaurar título e ícono
function detenerParpadeo() {
    parpadeoActivo = false;
    clearInterval(parpadeoIntervalo);
    document.title = TITULO_ORIGINAL;
    cambiarFavicon('favicon.ico');
}

// Inicialización al cargar página
window.onload = () => {
    cargarTemaGuardado();
    cargarIntervaloGuardado();
    cargarSonidoGuardado();

    // Añadir listener para cambio de sonido
    if (selectorSonido) {
        selectorSonido.addEventListener('change', () => {
            sonidoSeleccionado = selectorSonido.value;
            localStorage.setItem('sonido', sonidoSeleccionado);
            sonido.pause();
            sonido.currentTime = 0;
            cargarSonido(sonidoSeleccionado);
        });
    }
};
