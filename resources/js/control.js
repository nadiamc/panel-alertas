import { CULTIVOS, crearCampo, personaje } from './campo-logica';
import { alertaAviso, alertaError, alertaMisiones, alertaNivel, confetiFiesta } from './fiesta';
import { precargar, reproducir, silenciar } from './sonidos';

const campo = crearCampo();
const refs = {};

let jugadores = {};
let misiones = [];
let misionesPrevias = [];
let miNombre = '';
let seleccion = null;
let primeraSync = true;
let echoConectado = false;
let pollOk = false;
let pollIniciado = false;
let pollTimer = null;
let sonidoOn = true;

const estadoUrl = document.querySelector('meta[name="campo-estado-url"]')?.content || '/campo/estado';
const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';

const POLL_WS_MS = 15000;
const POLL_HTTP_MS = 2000;

/* ===================== Parcelas ===================== */

function initParcelas() {
    const grid = document.getElementById('parcelas');

    if (!grid) {
        return;
    }

    grid.querySelectorAll('.parcela-btn').forEach(function (btn) {
        const i = parseInt(btn.dataset.parcela, 10);
        refs[i] = btn;
        campo.datos(i);

        btn.addEventListener('click', function () {
            seleccion = i;
            grid.querySelectorAll('.parcela-btn').forEach(function (b) {
                b.classList.remove('sel');
            });
            btn.classList.add('sel');
            actualizarSeleccion();
        });
    });
}

function renderParcela(i) {
    const btn = refs[i];

    if (!btn) {
        return;
    }

    const d = campo.datos(i);
    const etapa = campo.etapa(i);
    const conCultivo = !!d.cultivo;

    btn.dataset.stage = String(etapa);
    btn.classList.toggle('plaga', conCultivo && d.plaga);
    btn.classList.toggle('listo', conCultivo && etapa >= 4);
    btn.classList.toggle('regada', conCultivo && d.regada);

    let granjero = btn.querySelector('.p-agronomo');
    let emoji = btn.querySelector('.p-emoji');
    let autor = btn.querySelector('.p-autor');

    if (conCultivo) {
        if (!granjero) {
            granjero = document.createElement('span');
            granjero.className = 'p-agronomo';
            btn.appendChild(granjero);
        }

        granjero.textContent = personaje(d.autor);

        if (!emoji) {
            emoji = document.createElement('span');
            emoji.className = 'p-emoji';
            btn.appendChild(emoji);
        }

        emoji.textContent = CULTIVOS[d.cultivo] || '🌱';

        if (!autor) {
            autor = document.createElement('span');
            autor.className = 'p-autor';
            btn.appendChild(autor);
        }

        autor.textContent = d.autor || '';

        let estado = 'creciendo';

        if (d.plaga) {
            estado = '¡plaga!';
        } else if (etapa >= 4) {
            estado = 'lista para cosechar';
        }

        btn.title = 'Parcela ' + (i + 1) + ' — ' + (d.autor || 'Anónimo') + ' · ' + estado;
    } else {
        if (granjero) {
            granjero.remove();
        }

        if (emoji) {
            emoji.remove();
        }

        if (autor) {
            autor.remove();
        }

        btn.title = 'Parcela ' + (i + 1) + ' — libre';
    }

    if (seleccion === i) {
        actualizarSeleccion();
    }
}

function renderTodo() {
    Object.keys(refs).forEach(function (k) {
        renderParcela(parseInt(k, 10));
    });
}

function actualizarSeleccion() {
    const info = document.getElementById('sel-info');

    if (!info) {
        return;
    }

    if (seleccion === null) {
        info.textContent = 'Ninguna parcela elegida.';
        return;
    }

    const d = campo.datos(seleccion);
    const etapa = campo.etapa(seleccion);
    const nro = seleccion + 1;

    if (!d.cultivo) {
        info.textContent = 'Parcela ' + nro + ': libre — podés sembrar 🌱';
    } else if (d.plaga) {
        info.textContent = 'Parcela ' + nro + ': ' + (CULTIVOS[d.cultivo] || '') + ' de ' + (d.autor || 'Anónimo') + ' — ¡tiene plaga! 🐛';
    } else if (etapa >= 4) {
        info.textContent = 'Parcela ' + nro + ': ' + (CULTIVOS[d.cultivo] || '') + ' de ' + (d.autor || 'Anónimo') + ' — lista para cosechar 🚜';
    } else {
        info.textContent = 'Parcela ' + nro + ': ' + (CULTIVOS[d.cultivo] || '') + ' de ' + (d.autor || 'Anónimo') + ' — creciendo 🌿';
    }
}

/* ===================== Estado general ===================== */

function setClima(valor) {
    const badge = document.getElementById('clima');

    if (!badge) {
        return;
    }

    const lluvia = valor === 'lluvia';
    badge.textContent = lluvia ? '🌧️' : '☀️';
    badge.title = lluvia ? 'Lluvia' : 'Día despejado';
}

function setConexion(on) {
    const dot = document.getElementById('conexion');

    if (dot) {
        dot.classList.toggle('on', on);
    }
}

function actualizarConexion() {
    setConexion(echoConectado || pollOk);
}

function setAcciones(total) {
    const el = document.getElementById('acciones');

    if (el) {
        el.textContent = total;
    }
}

function aviso(mensaje) {
    const cont = document.getElementById('toasts');

    if (!cont) {
        return;
    }

    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = mensaje;
    cont.appendChild(el);

    setTimeout(function () {
        el.classList.add('fuera');
        setTimeout(function () { el.remove(); }, 400);
    }, 2400);
}

/* ===================== Ranking / misiones / progreso ===================== */

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
        vacio.textContent = 'Todavía nadie sumó puntos';
        cont.appendChild(vacio);

        return;
    }

    lista.forEach(function (entrada, i) {
        const div = document.createElement('div');
        div.className = 'fila' + (i === 0 ? ' lider' : '') + (entrada[0] === miNombre ? ' yo' : '');

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

function pintarProgreso() {
    const puntos = document.getElementById('prog-puntos');
    const nivel = document.getElementById('prog-nivel');
    const racha = document.getElementById('prog-racha');
    const nombre = document.getElementById('prog-nombre');

    const j = miNombre ? jugadores[miNombre] : null;

    if (nombre) {
        nombre.textContent = miNombre || 'Sin nombre';
    }

    if (puntos) {
        puntos.textContent = j ? j.puntos : 0;
    }

    if (nivel) {
        nivel.textContent = j ? j.nivel : 1;
    }

    if (racha) {
        racha.textContent = j ? (j.racha || 0) : 0;
    }
}

/* ===================== Celebraciones ===================== */

/**
 * Modal, confeti y sonido cuando el jugador del celular sube de nivel.
 *
 * @param {number} nivel
 */
function celebrarNivelPropio(nivel) {
    alertaNivel(miNombre || 'Vos', nivel);
    confetiFiesta();
    reproducir('nivel');

    if (navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
    }
}

/**
 * Celebra las misiones recién completadas.
 *
 * @param {string[]} textos
 */
function celebrarMisiones(textos) {
    if (textos.length === 0) {
        return;
    }

    alertaMisiones(textos);
    reproducir('mision');

    if (navigator.vibrate) {
        navigator.vibrate(60);
    }
}

/**
 * Devuelve los textos de las misiones que se completaron desde la última vez.
 *
 * @param {Array<{texto: string, completada: boolean}>} nuevas
 * @returns {string[]}
 */
function misionesRecienCumplidas(nuevas) {
    const antes = misionesPrevias
        .filter(function (m) { return m.completada; })
        .map(function (m) { return m.texto; });

    return (nuevas || [])
        .filter(function (m) { return m.completada && antes.indexOf(m.texto) === -1; })
        .map(function (m) { return m.texto; });
}

/* ===================== Sincronización por HTTP ===================== */

function descripcionCambio(c) {
    const nro = c.parcela + 1;
    const emoji = CULTIVOS[c.cultivo] || '🌱';

    switch (c.tipo) {
        case 'sembrado': return (c.autor || 'Alguien') + ' sembró ' + emoji + ' en la ' + nro;
        case 'cosechado': return '🚜 cosecharon la ' + nro;
        case 'plaga': return '🐛 ¡plaga en la ' + nro + '!';
        case 'tratado': return '🧪 trataron la ' + nro;
        default: return 'Novedad en la ' + nro;
    }
}

function refrescar() {
    return fetch(estadoUrl, { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (s) {
            const nivelPrevio = (miNombre && jugadores[miNombre]) ? jugadores[miNombre].nivel : 1;
            const cambios = campo.sincronizar(s.parcelas || {});
            const misionesServidor = Array.isArray(s.misiones) ? s.misiones : [];
            const recienCumplidas = misionesRecienCumplidas(misionesServidor);

            jugadores = s.jugadores || {};
            misiones = misionesServidor;
            misionesPrevias = misiones.map(function (m) {
                return { texto: m.texto, completada: m.completada };
            });

            if (typeof s.acciones === 'number') {
                setAcciones(s.acciones);
            }

            if (!primeraSync) {
                cambios.forEach(function (c) {
                    if ((c.tipo === 'sembrado' || c.tipo === 'tratado') && c.autor === miNombre) {
                        return;
                    }

                    aviso(descripcionCambio(c));
                });

                if (miNombre && jugadores[miNombre] && jugadores[miNombre].nivel > nivelPrevio) {
                    celebrarNivelPropio(jugadores[miNombre].nivel);
                }

                celebrarMisiones(recienCumplidas);
            }

            primeraSync = false;

            renderTodo();
            pintarRanking();
            pintarMisiones();
            pintarProgreso();

            pollOk = true;
            actualizarConexion();
        })
        .catch(function () {
            pollOk = false;
            actualizarConexion();
        });
}

/**
 * Aplica un evento recibido por WebSocket sin pedirle nada más al servidor.
 *
 * @param {object} e
 */
function aplicarRemoto(e) {
    const autor = (e.autor || '').trim();
    const nivelPrevio = (miNombre && jugadores[miNombre]) ? jugadores[miNombre].nivel : 1;

    campo.aplicar(e);

    const d = campo.datos(e.parcela);
    const estado = e.parcelaEstado;

    if (estado) {
        d.cultivo = estado.cultivo || null;
        d.autor = estado.autor || null;
        d.plaga = !!estado.plaga;

        if (!estado.cultivo) {
            d.progreso = 0;
            d.madura = false;
            d.regada = false;
        }
    }

    if (e.tipo === 'regar' && d.cultivo) {
        d.regada = true;
    }

    renderParcela(e.parcela);
    actualizarSeleccion();

    if (e.jugadores) {
        jugadores = e.jugadores;
    }

    let recienCumplidas = [];

    if (Array.isArray(e.misiones)) {
        recienCumplidas = misionesRecienCumplidas(e.misiones);
        misiones = e.misiones;
        misionesPrevias = misiones.map(function (m) {
            return { texto: m.texto, completada: m.completada };
        });
    }

    if (typeof e.acciones === 'number') {
        setAcciones(e.acciones);
    }

    pintarRanking();
    pintarMisiones();
    pintarProgreso();

    if (autor && autor !== miNombre) {
        avisarEvento(e, autor);
    }

    if (miNombre && jugadores[miNombre] && jugadores[miNombre].nivel > nivelPrevio) {
        celebrarNivelPropio(jugadores[miNombre].nivel);
    }

    celebrarMisiones(recienCumplidas);
}

function avisarEvento(e, autor) {
    const nro = e.parcela + 1;

    switch (e.tipo) {
        case 'sembrar':
            aviso(autor + ' sembró ' + (CULTIVOS[e.valor] || '🌱') + ' en la ' + nro);
            break;
        case 'cosechar':
            aviso('🚜 ' + autor + ' cosechó la ' + nro);
            break;
        case 'plaga':
            aviso('🐛 ¡plaga en la ' + nro + '!');
            break;
        case 'tratar':
            aviso('🧪 ' + autor + ' trató la ' + nro);
            break;
        case 'clima':
            aviso(e.valor === 'lluvia' ? '🌧️ Llegó la lluvia' : '☀️ Salió el sol');
            break;
    }
}

/**
 * Programa el próximo sondeo HTTP. Con WebSocket conectado alcanza con un
 * latido cada tanto; sin WS se consulta más seguido como respaldo.
 */
function programarPoll() {
    clearTimeout(pollTimer);

    if (!pollIniciado || document.hidden) {
        return;
    }

    const espera = echoConectado ? POLL_WS_MS : POLL_HTTP_MS;

    pollTimer = setTimeout(function () {
        refrescar().finally(programarPoll);
    }, espera + Math.floor(Math.random() * 300));
}

function iniciarPolling() {
    pollIniciado = true;
    refrescar().finally(programarPoll);
}

function marcarConexion(conectado) {
    if (echoConectado === conectado) {
        return;
    }

    echoConectado = conectado;
    actualizarConexion();

    if (!pollIniciado) {
        return;
    }

    if (conectado) {
        refrescar().finally(programarPoll);
    } else {
        programarPoll();
    }
}

function conectar() {
    if (!window.Echo) {
        setTimeout(conectar, 200);

        return;
    }

    window.Echo.channel('campo').listen('.AccionCampo', aplicarRemoto);

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

/* ===================== Enviar acciones ===================== */

function enviar(tipo, valor) {
    if (tipo !== 'clima' && seleccion === null) {
        alertaAviso('Primero elegí una parcela 🌱');
        return;
    }

    const form = document.getElementById('form-accion');
    const url = form ? form.dataset.url : '/campo/accion';

    const fd = new FormData();
    fd.append('_token', csrf);
    fd.append('tipo', tipo);
    fd.append('parcela', seleccion === null ? 0 : seleccion);
    fd.append('valor', valor || '');
    fd.append('autor', miNombre);

    reproducir(tipo === 'clima' ? 'clima' : tipo);

    if (navigator.vibrate) {
        navigator.vibrate(25);
    }

    fetch(url, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': csrf, Accept: 'application/json' },
        body: fd,
    })
        .then(function (r) {
            if (!r.ok) {
                throw new Error('Error al enviar');
            }

            aviso(tipo === 'clima' ? 'Clima actualizado' : '¡Acción enviada!');

            if (!echoConectado) {
                refrescar().finally(programarPoll);
            }
        })
        .catch(function () {
            alertaError('No se pudo enviar, reintentá');
        });
}

function initSonido() {
    const boton = document.getElementById('btn-sonido');
    const guardado = localStorage.getItem('campo.sonido');

    sonidoOn = guardado !== 'off';
    silenciar(!sonidoOn);

    if (sonidoOn) {
        precargar();
    }

    if (!boton) {
        return;
    }

    const pintar = function () {
        boton.textContent = sonidoOn ? '🔊' : '🔇';
        boton.title = sonidoOn ? 'Silenciar sonidos' : 'Activar sonidos';
    };

    pintar();

    boton.addEventListener('click', function () {
        sonidoOn = !sonidoOn;
        silenciar(!sonidoOn);
        localStorage.setItem('campo.sonido', sonidoOn ? 'on' : 'off');
        pintar();

        if (sonidoOn) {
            precargar();
            reproducir('sembrar');
        }
    });
}

function initFormulario() {
    const inputAutor = document.getElementById('autor');
    const cultivo = document.getElementById('cultivo');

    miNombre = localStorage.getItem('campo.autor') || '';

    if (inputAutor) {
        inputAutor.value = miNombre;

        inputAutor.addEventListener('input', function () {
            miNombre = inputAutor.value.trim();
            localStorage.setItem('campo.autor', miNombre);
            pintarProgreso();
            pintarRanking();
        });
    }

    document.querySelectorAll('.accion-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const tipo = btn.dataset.tipo;

            if (tipo === 'sembrar') {
                enviar(tipo, cultivo ? cultivo.value : 'maiz');
            } else if (btn.dataset.valor) {
                enviar(tipo, btn.dataset.valor);
            } else {
                enviar(tipo, '');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('control')) {
        return;
    }

    initParcelas();
    initFormulario();
    initSonido();
    actualizarSeleccion();
    conectar();
    iniciarPolling();

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
});
