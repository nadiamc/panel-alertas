import QRCode from 'qrcode';

import { CULTIVOS, crearCampo, personaje } from './campo-logica';

const campo = crearCampo();
const refs = {};

let jugadores = {};
let misiones = [];
let misionesPrevias = [];
let audioCtx = null;
let sonidoOn = false;
let echoConectado = false;
let pollOk = false;
let primeraSync = true;

const estadoUrl = document.querySelector('meta[name="campo-estado-url"]')?.content || '/campo/estado';
const POLL_MS = 1200;

/* ===================== Parcelas ===================== */

function initParcelas() {
    document.querySelectorAll('.parcela').forEach(function (el) {
        const i = parseInt(el.dataset.parcela, 10);

        refs[i] = {
            el: el,
            frutaEl: el.querySelector('[data-fruta]'),
            autorEl: el.querySelector('.autor'),
            agronomoEl: el.querySelector('.agronomo'),
            autorTimer: null,
        };

        campo.datos(i);
    });
}

function renderParcela(i) {
    const ref = refs[i];

    if (!ref) {
        return;
    }

    const d = campo.datos(i);
    const conCultivo = !!d.cultivo;

    ref.el.dataset.stage = String(campo.etapa(i));
    ref.el.classList.toggle('regada', conCultivo && d.regada);
    ref.el.classList.toggle('plaga', conCultivo && d.plaga);
    ref.el.classList.toggle('ocupada', conCultivo);

    if (ref.frutaEl) {
        ref.frutaEl.textContent = conCultivo ? (CULTIVOS[d.cultivo] || '🌱') : '';
    }

    if (ref.agronomoEl) {
        ref.agronomoEl.textContent = conCultivo ? personaje(d.autor) : '';
    }
}

function renderTodo() {
    Object.keys(refs).forEach(function (k) {
        renderParcela(parseInt(k, 10));
    });
}

/* ===================== UI general ===================== */

function setClima(valor) {
    const badge = document.getElementById('clima');

    if (!badge) {
        return;
    }

    const lluvia = valor === 'lluvia';
    badge.textContent = lluvia ? '🌧️ Lluvia' : '☀️ Día despejado';
    document.body.classList.toggle('lluvia', lluvia);
}

function setConexion() {
    const dot = document.getElementById('conexion');
    const texto = document.getElementById('estado-texto');
    const on = echoConectado || pollOk;

    if (dot) {
        dot.classList.toggle('on', on);
    }

    if (texto) {
        texto.textContent = on ? 'En vivo' : 'Desconectado';
    }
}

function setAcciones(total) {
    const el = document.getElementById('acciones');

    if (el) {
        el.textContent = total;
    }
}

function toast(mensaje) {
    let cont = document.getElementById('toasts');

    if (!cont) {
        cont = document.createElement('div');
        cont.id = 'toasts';
        document.body.appendChild(cont);
    }

    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = mensaje;
    cont.appendChild(el);

    setTimeout(function () {
        el.classList.add('fuera');
        setTimeout(function () {
            el.remove();
        }, 400);
    }, 2600);
}

function mostrarAutor(i, autor) {
    const ref = refs[i];

    if (!ref || !autor) {
        return;
    }

    let etiqueta = ref.autorEl;

    if (!etiqueta) {
        etiqueta = document.createElement('span');
        etiqueta.className = 'autor';
        ref.el.appendChild(etiqueta);
        ref.autorEl = etiqueta;
    }

    etiqueta.textContent = autor;
    etiqueta.classList.add('visible');

    clearTimeout(ref.autorTimer);
    ref.autorTimer = setTimeout(function () {
        etiqueta.classList.remove('visible');
    }, 5000);
}

/* ===================== Efectos ===================== */

function banner(texto, clase, ms) {
    const el = document.getElementById('banner');

    if (!el) {
        return;
    }

    el.textContent = texto;
    el.className = 'banner visible' + (clase ? ' ' + clase : '');

    clearTimeout(banner.temporizador);
    banner.temporizador = setTimeout(function () {
        el.classList.remove('visible');
    }, ms || 2200);
}

function confeti(cantidad) {
    const cont = document.getElementById('confeti');

    if (!cont) {
        return;
    }

    const colores = ['#fde047', '#4ade80', '#38bdf8', '#f472b6', '#f59e0b', '#a855f7', '#ef4444'];

    for (let i = 0; i < cantidad; i++) {
        const c = document.createElement('i');
        c.style.left = Math.random() * 100 + 'vw';
        c.style.background = colores[Math.floor(Math.random() * colores.length)];
        c.style.animationDuration = (2 + Math.random() * 1.8) + 's';
        c.style.animationDelay = (Math.random() * 0.3) + 's';
        cont.appendChild(c);
        setTimeout(function () {
            c.remove();
        }, 4400);
    }
}

function sacudir() {
    document.body.classList.add('sacudir');
    setTimeout(function () {
        document.body.classList.remove('sacudir');
    }, 460);
}

function puntosPop(i, texto) {
    const ref = refs[i];

    if (!ref) {
        return;
    }

    const el = document.createElement('span');
    el.className = 'puntos-pop';
    el.textContent = texto;
    ref.el.appendChild(el);

    setTimeout(function () {
        el.remove();
    }, 1000);
}

/* ===================== Audio ===================== */

function activarAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    sonidoOn = true;
}

function nota(freq, dur, tipo, delay) {
    if (!sonidoOn || !audioCtx) {
        return;
    }

    const t = audioCtx.currentTime + (delay || 0);
    const osc = audioCtx.createOscillator();
    const gan = audioCtx.createGain();

    osc.type = tipo || 'sine';
    osc.frequency.value = freq;
    gan.gain.setValueAtTime(0.0001, t);
    gan.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    gan.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gan);
    gan.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
}

function sonido(tipo) {
    if (!sonidoOn) {
        return;
    }

    switch (tipo) {
        case 'sembrar': nota(600, 0.12, 'sine'); break;
        case 'regar': nota(420, 0.15, 'sine'); break;
        case 'tratar': nota(700, 0.12, 'sine'); break;
        case 'plaga': nota(140, 0.35, 'sawtooth'); break;
        case 'cosechar':
            nota(523, 0.12, 'triangle', 0);
            nota(659, 0.12, 'triangle', 0.09);
            nota(784, 0.2, 'triangle', 0.18);
            break;
        case 'clima':
            nota(880, 0.1, 'sine', 0);
            nota(660, 0.1, 'sine', 0.1);
            break;
    }
}

function colorAccion(tipo) {
    switch (tipo) {
        case 'cosechar': return '#f59e0b';
        case 'regar': return '#38bdf8';
        case 'plaga': return '#ef4444';
        case 'tratar': return '#a855f7';
        default: return '#8bc34a';
    }
}

function chispas(el, color, cantidad) {
    for (let i = 0; i < cantidad; i++) {
        const s = document.createElement('span');
        s.className = 'chispa';
        s.style.background = color;

        const ang = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 45;
        s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
        s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
        el.appendChild(s);
        setTimeout(function () { s.remove(); }, 780);
    }
}

/* ===================== Ranking y misiones ===================== */

function pintarRanking() {
    const cont = document.getElementById('ranking-lista');

    if (!cont) {
        return;
    }

    const lista = Object.entries(jugadores)
        .sort(function (a, b) { return b[1].puntos - a[1].puntos; })
        .slice(0, 5);

    cont.innerHTML = '';

    if (lista.length === 0) {
        const vacio = document.createElement('div');
        vacio.className = 'vacio';
        vacio.textContent = 'Todavía nadie jugó';
        cont.appendChild(vacio);

        return;
    }

    lista.forEach(function (entrada, i) {
        const div = document.createElement('div');
        div.className = 'fila' + (i === 0 ? ' lider' : '');

        const pos = document.createElement('span');
        pos.className = 'pos';
        pos.textContent = i + 1;

        const quien = document.createElement('span');
        quien.className = 'quien';
        quien.textContent = (i === 0 ? '👑 ' : '') + entrada[0];

        const pts = document.createElement('span');
        pts.className = 'pts';
        pts.textContent = entrada[1].puntos;

        div.appendChild(pos);
        div.appendChild(quien);
        div.appendChild(pts);
        cont.appendChild(div);
    });
}

function pintarMisiones() {
    const cont = document.getElementById('misiones-lista');

    if (!cont) {
        return;
    }

    cont.innerHTML = '';

    misiones.forEach(function (m) {
        const pct = Math.min(100, Math.round((m.progreso / m.meta) * 100));

        const div = document.createElement('div');
        div.className = 'mision' + (m.completada ? ' hecha' : '');

        const arriba = document.createElement('div');
        arriba.className = 'm-arriba';

        const nombre = document.createElement('span');
        nombre.className = 'nombre';
        nombre.textContent = m.texto;

        const cuenta = document.createElement('span');
        cuenta.className = 'cuenta';
        cuenta.textContent = Math.min(m.progreso, m.meta) + '/' + m.meta;

        arriba.appendChild(nombre);
        arriba.appendChild(cuenta);

        const barra = document.createElement('div');
        barra.className = 'barra';

        const relleno = document.createElement('span');
        relleno.style.width = pct + '%';
        barra.appendChild(relleno);

        div.appendChild(arriba);
        div.appendChild(barra);
        cont.appendChild(div);
    });
}

/* ===================== Reacción al juego ===================== */

function mostrarJuego(e) {
    const autor = (e.autor && e.autor.trim()) ? e.autor.trim() : 'Anónimo';
    const nivelPrevio = (jugadores[autor] && jugadores[autor].nivel) || 1;

    if (typeof e.acciones === 'number') {
        setAcciones(e.acciones);
    }

    if (e.ganados > 0) {
        puntosPop(e.parcela, '+' + e.ganados);
    }

    if (e.tipo === 'cosechar') {
        banner('🚜 ¡' + autor + ' cosechó!', 'oro', 2200);
        confeti(60);
        sacudir();
    } else if (e.racha >= 3) {
        banner('🔥 ¡Racha x' + e.racha + '!  ' + autor, 'oro', 1600);
    }

    if (e.jugadores) {
        jugadores = e.jugadores;
    }

    if (e.nivel > nivelPrevio) {
        setTimeout(function () {
            banner('⭐ ¡' + autor + ' subió al Nivel ' + e.nivel + '!', '', 2500);
            confeti(45);
        }, 500);
    }

    if (Array.isArray(e.misiones)) {
        const nuevas = e.misiones.filter(function (m) {
            return m.completada && !misionesPrevias.some(function (p) {
                return p.texto === m.texto && p.completada;
            });
        });

        nuevas.forEach(function (m, i) {
            setTimeout(function () {
                banner('🏆 ¡Misión cumplida: ' + m.texto + '!', 'oro', 2800);
                confeti(55);
            }, 900 + i * 400);
        });

        misiones = e.misiones;
        misionesPrevias = e.misiones.map(function (m) { return { texto: m.texto, completada: m.completada }; });
    }

    pintarRanking();
    pintarMisiones();
}

/* ===================== Eventos ===================== */

function aplicarEvento(e) {
    const quien = e.autor ? e.autor + ' ' : '';

    campo.aplicar(e);
    renderParcela(e.parcela);

    switch (e.tipo) {
        case 'sembrar':
            toast(quien + 'sembró ' + (e.valor || 'un cultivo') + ' en la parcela ' + (e.parcela + 1));
            break;
        case 'regar':
            toast(quien + 'regó la parcela ' + (e.parcela + 1));
            break;
        case 'cosechar':
            toast(quien + 'cosechó la parcela ' + (e.parcela + 1));
            break;
        case 'plaga':
            toast('🐛 ¡Plaga en la parcela ' + (e.parcela + 1) + '!');
            break;
        case 'tratar':
            toast(quien + 'trató la parcela ' + (e.parcela + 1));
            break;
        case 'clima':
            setClima(e.valor);
            toast(e.valor === 'lluvia' ? '🌧️ Llegó la lluvia' : '☀️ Salió el sol');
            break;
    }

    if (e.tipo !== 'clima' && refs[e.parcela]) {
        chispas(refs[e.parcela].el, colorAccion(e.tipo), e.tipo === 'cosechar' ? 20 : 8);
        mostrarAutor(e.parcela, e.autor);
    }

    sonido(e.tipo);
    mostrarJuego(e);
}

function alternarSonido(boton) {
    if (sonidoOn) {
        sonidoOn = false;
        boton.textContent = '🔇';
        boton.title = 'Activar sonido';
    } else {
        activarAudio();
        boton.textContent = '🔊';
        boton.title = 'Silenciar';
    }
}

function alternarFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
}

/* ===================== Conexión ===================== */

function efectoCambio(c) {
    const nro = c.parcela + 1;
    const autor = c.autor || 'Anónimo';
    const ref = refs[c.parcela];

    switch (c.tipo) {
        case 'sembrado':
            toast(autor + ' sembró ' + (CULTIVOS[c.cultivo] || 'un cultivo') + ' en la parcela ' + nro);
            break;
        case 'cosechado':
            toast('🚜 cosecharon la parcela ' + nro);
            banner('🚜 ¡Cosecha!', 'oro', 2200);
            confeti(60);
            sacudir();
            break;
        case 'plaga':
            toast('🐛 ¡Plaga en la parcela ' + nro + '!');
            break;
        case 'tratado':
            toast(autor + ' trató la parcela ' + nro);
            break;
    }

    if (ref && c.tipo !== 'cosechado') {
        chispas(ref.el, colorAccion(c.tipo === 'sembrado' ? 'sembrar' : c.tipo), 8);
        mostrarAutor(c.parcela, autor);
    }

    sonido(c.tipo === 'sembrado' ? 'sembrar' : c.tipo);
}

function refrescar() {
    return fetch(estadoUrl, { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (s) {
            const cambios = campo.sincronizar(s.parcelas || {});

            const nivelesPrevios = {};
            Object.keys(jugadores).forEach(function (n) {
                nivelesPrevios[n] = jugadores[n].nivel || 1;
            });
            const misionesHechas = misiones
                .filter(function (m) { return m.completada; })
                .map(function (m) { return m.texto; });

            const jugadoresNuevos = s.jugadores || {};
            const misionesNuevas = Array.isArray(s.misiones) ? s.misiones : [];

            cambios.forEach(function (c) { renderParcela(c.parcela); });

            if (!primeraSync && !echoConectado) {
                cambios.forEach(efectoCambio);

                Object.keys(jugadoresNuevos).forEach(function (n) {
                    const ahora = jugadoresNuevos[n].nivel || 1;

                    if (ahora > (nivelesPrevios[n] || 1)) {
                        setTimeout(function () {
                            banner('⭐ ¡' + n + ' subió al Nivel ' + ahora + '!', '', 2500);
                            confeti(45);
                        }, 400);
                    }
                });

                misionesNuevas.forEach(function (m, i) {
                    if (m.completada && misionesHechas.indexOf(m.texto) === -1) {
                        setTimeout(function () {
                            banner('🏆 ¡Misión cumplida: ' + m.texto + '!', 'oro', 2800);
                            confeti(55);
                        }, 900 + i * 400);
                    }
                });
            }

            primeraSync = false;

            jugadores = jugadoresNuevos;
            misiones = misionesNuevas;
            misionesPrevias = misiones.map(function (m) {
                return { texto: m.texto, completada: m.completada };
            });

            if (typeof s.acciones === 'number') {
                setAcciones(s.acciones);
            }

            renderTodo();
            pintarRanking();
            pintarMisiones();

            pollOk = true;
            setConexion();
        })
        .catch(function () {
            pollOk = false;
            setConexion();
        });
}

function iniciarSincronizacion() {
    refrescar();
    setInterval(refrescar, POLL_MS);
}

function dibujarQr() {
    const canvas = document.getElementById('qr');

    if (!canvas) {
        return;
    }

    QRCode.toCanvas(canvas, canvas.dataset.url, { width: canvas.width, margin: 1 }, function (err) {
        if (err) {
            console.error(err);
        }
    });
}

function conectar() {
    if (!window.Echo) {
        setTimeout(conectar, 200);

        return;
    }

    window.Echo.channel('campo').listen('.AccionCampo', aplicarEvento);

    const pusher = window.Echo.connector && window.Echo.connector.pusher;

    if (pusher) {
        pusher.connection.bind('connected', function () { echoConectado = true; setConexion(); });
        pusher.connection.bind('disconnected', function () { echoConectado = false; setConexion(); });
        pusher.connection.bind('unavailable', function () { echoConectado = false; setConexion(); });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('campo')) {
        return;
    }

    initParcelas();
    pintarMisiones();
    dibujarQr();
    iniciarSincronizacion();
    conectar();

    setInterval(function () {
        campo.avanzar();
        renderTodo();
    }, campo.pasoMs());

    const btnSonido = document.getElementById('btn-sonido');
    const btnFull = document.getElementById('btn-full');

    if (btnSonido) {
        btnSonido.addEventListener('click', function () {
            alternarSonido(btnSonido);
        });
    }

    if (btnFull) {
        btnFull.addEventListener('click', alternarFullscreen);
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'f' || e.key === 'F') {
            alternarFullscreen();
        }
    });
});
