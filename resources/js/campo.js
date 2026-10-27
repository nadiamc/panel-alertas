import QRCode from 'qrcode';

import { CULTIVOS, crearCampo } from './campo-logica';
import { crearEscena } from './campo-escena';
import { alertaMisiones, alertaNivel, alertaPlaga, confeti, confetiFiesta } from './fiesta';
import { precargar, reproducir, silenciar } from './sonidos';

const campo = crearCampo();

let escena = null;

let jugadores = {};
let misiones = [];
let misionesPrevias = [];
let sonidoOn = false;
let echoConectado = false;
let pollOk = false;
let pollIniciado = false;
let pollTimer = null;
let primeraSync = true;

const estadoUrl = document.querySelector('meta[name="campo-estado-url"]')?.content || '/campo/estado';
const POLL_WS_MS = 15000;
const POLL_HTTP_MS = 2500;

/* ===================== Parcelas ===================== */

function initParcelas() {
    const cont = document.getElementById('campo-escena');

    if (!cont) {
        return;
    }

    for (let i = 0; i < 24; i++) {
        campo.datos(i);
    }

    escena = crearEscena(cont, {
        total: 24,
        estado: function (i) {
            const d = campo.datos(i);

            return {
                cultivo: d.cultivo,
                etapa: campo.etapa(i),
                regada: d.regada,
                plaga: d.plaga,
                autor: d.autor,
            };
        },
    });
}

function renderParcela(i) {
    if (escena) {
        escena.render(i);
    }
}

function renderTodo() {
    if (escena) {
        escena.renderTodo();
    }
}

/**
 * Destaca una parcela durante un instante para que el público note dónde
 * acaba de pasar algo.
 *
 * @param {number} i
 */
function pulsar(i) {
    if (escena) {
        escena.pulsar(i);
    }
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
        if (echoConectado) {
            texto.textContent = 'En vivo';
        } else if (pollOk) {
            texto.textContent = 'Sincronizando';
        } else {
            texto.textContent = 'Desconectado';
        }
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
    if (escena && autor) {
        escena.mostrarAutor(i, autor);
    }
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

function sacudir() {
    document.body.classList.add('sacudir');
    setTimeout(function () {
        document.body.classList.remove('sacudir');
    }, 460);
}

function puntosPop(i, texto) {
    if (escena) {
        escena.puntosPop(i, texto);
    }
}

/* ===================== Audio ===================== */

function activarAudio() {
    sonidoOn = true;
    silenciar(false);
    precargar();
}

function sonido(tipo) {
    if (!sonidoOn) {
        return;
    }

    reproducir(tipo);
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

function chispas(i, color, cantidad) {
    if (escena) {
        escena.chispas(i, color, cantidad);
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

/**
 * Celebra una subida de nivel con modal, confeti y sonido.
 *
 * @param {string} nombre
 * @param {number} nivel
 */
function celebrarNivel(nombre, nivel) {
    alertaNivel(nombre, nivel);
    confetiFiesta();
    sonido('nivel');
}

/**
 * Celebra una o varias misiones cumplidas.
 *
 * @param {string[]} textos
 */
function celebrarMisiones(textos) {
    alertaMisiones(textos);
    confetiFiesta();
    sonido('mision');
}

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
        confeti(90);
        sacudir();
    } else if (e.racha >= 3) {
        banner('🔥 ¡Racha x' + e.racha + '!  ' + autor, 'oro', 1600);
    }

    if (e.jugadores) {
        jugadores = e.jugadores;
    }

    if (e.nivel > nivelPrevio) {
        setTimeout(function () {
            celebrarNivel(autor, e.nivel);
        }, 420);
    }

    if (Array.isArray(e.misiones)) {
        const nuevas = e.misiones.filter(function (m) {
            return m.completada && !misionesPrevias.some(function (p) {
                return p.texto === m.texto && p.completada;
            });
        });

        if (nuevas.length > 0) {
            setTimeout(function () {
                celebrarMisiones(nuevas.map(function (m) { return m.texto; }));
            }, 850);
        }

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
    pulsar(e.parcela);

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
            alertaPlaga(e.parcela + 1);
            sacudir();
            break;
        case 'tratar':
            toast(quien + 'trató la parcela ' + (e.parcela + 1));
            break;
        case 'clima':
            setClima(e.valor);
            toast(e.valor === 'lluvia' ? '🌧️ Llegó la lluvia' : '☀️ Salió el sol');
            break;
    }

    if (e.tipo === 'cosechar' && escena) {
        escena.cosecha(e.parcela);
    }

    if (e.tipo !== 'clima') {
        chispas(e.parcela, colorAccion(e.tipo), e.tipo === 'cosechar' ? 20 : 8);
        mostrarAutor(e.parcela, e.autor);
    }

    sonido(e.tipo);
    mostrarJuego(e);
}

function alternarSonido(boton) {
    if (sonidoOn) {
        sonidoOn = false;
        silenciar(true);
        boton.textContent = '🔇';
        boton.title = 'Activar sonido';
    } else {
        activarAudio();
        reproducir('mision');
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

    switch (c.tipo) {
        case 'sembrado':
            toast(autor + ' sembró ' + (CULTIVOS[c.cultivo] || 'un cultivo') + ' en la parcela ' + nro);
            break;
        case 'cosechado':
            toast('🚜 cosecharon la parcela ' + nro);
            banner('🚜 ¡Cosecha!', 'oro', 2200);
            confeti(90);
            sacudir();

            if (escena) {
                escena.cosecha(c.parcela);
            }

            break;
        case 'plaga':
            toast('🐛 ¡Plaga en la parcela ' + nro + '!');
            alertaPlaga(nro);
            sacudir();
            break;
        case 'tratado':
            toast(autor + ' trató la parcela ' + nro);
            break;
    }

    if (c.tipo !== 'cosechado') {
        chispas(c.parcela, colorAccion(c.tipo === 'sembrado' ? 'sembrar' : c.tipo), 8);
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

            cambios.forEach(function (c) {
                renderParcela(c.parcela);

                if (!primeraSync) {
                    pulsar(c.parcela);
                }
            });

            if (!primeraSync && !echoConectado) {
                cambios.forEach(efectoCambio);

                Object.keys(jugadoresNuevos).forEach(function (n, i) {
                    const ahora = jugadoresNuevos[n].nivel || 1;

                    if (ahora > (nivelesPrevios[n] || 1)) {
                        setTimeout(function () {
                            celebrarNivel(n, ahora);
                        }, 400 + i * 900);
                    }
                });

                const misionesNuevasHechas = misionesNuevas
                    .filter(function (m) { return m.completada && misionesHechas.indexOf(m.texto) === -1; })
                    .map(function (m) { return m.texto; });

                if (misionesNuevasHechas.length > 0) {
                    setTimeout(function () {
                        celebrarMisiones(misionesNuevasHechas);
                    }, 900);
                }
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

/**
 * Programa el próximo sondeo HTTP. Con WebSocket conectado solo se consulta
 * cada tanto como red de seguridad; si el WS no está disponible se sondea más
 * seguido para que el visor igual se mantenga al día.
 */
function programarPoll() {
    clearTimeout(pollTimer);

    if (!pollIniciado || document.hidden) {
        return;
    }

    pollTimer = setTimeout(function () {
        refrescar().finally(programarPoll);
    }, echoConectado ? POLL_WS_MS : POLL_HTTP_MS);
}

function iniciarSincronizacion() {
    pollIniciado = true;
    refrescar().finally(programarPoll);
}

function marcarConexion(conectado) {
    if (echoConectado === conectado) {
        return;
    }

    echoConectado = conectado;
    setConexion();

    if (!pollIniciado) {
        return;
    }

    if (conectado) {
        refrescar().finally(programarPoll);
    } else {
        programarPoll();
    }
}

function dibujarQr() {
    const canvas = document.getElementById('qr');

    if (!canvas) {
        return;
    }

    QRCode.toCanvas(canvas, canvas.dataset.url, { width: canvas.width, margin: 1 }, function (err) {
        if (err) {
            console.error(err);

            return;
        }

        canvas.style.removeProperty('width');
        canvas.style.removeProperty('height');
    });
}

function conectar() {
    if (!window.Echo) {
        setTimeout(conectar, 200);

        return;
    }

    window.Echo.channel('campo').listen('.AccionCampo', aplicarEvento);

    const pusher = window.Echo.connector && window.Echo.connector.pusher;

    if (!pusher) {
        return;
    }

    pusher.connection.bind('connected', function () {
        marcarConexion(true);
    });
    pusher.connection.bind('disconnected', function () {
        marcarConexion(false);
    });
    pusher.connection.bind('unavailable', function () {
        marcarConexion(false);
    });
    pusher.connection.bind('failed', function () {
        marcarConexion(false);
    });

    if (pusher.connection.state === 'connected') {
        marcarConexion(true);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('campo')) {
        return;
    }

    initParcelas();
    pintarMisiones();
    dibujarQr();
    conectar();
    iniciarSincronizacion();

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            clearTimeout(pollTimer);

            return;
        }

        refrescar().finally(programarPoll);
    });

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
