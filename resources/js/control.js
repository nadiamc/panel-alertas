import { CULTIVOS, crearCampo, personaje } from './campo-logica';

const campo = crearCampo();
const refs = {};

let jugadores = {};
let misiones = [];
let miNombre = '';
let seleccion = null;
let primeraSync = true;

const estadoUrl = document.querySelector('meta[name="campo-estado-url"]')?.content || '/campo/estado';
const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';

const INTERVALO_MS = 1200;

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

            jugadores = s.jugadores || {};
            misiones = s.misiones || [];

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
                    aviso('⭐ ¡Subiste al Nivel ' + jugadores[miNombre].nivel + '!');
                }
            }

            primeraSync = false;

            renderTodo();
            pintarRanking();
            pintarMisiones();
            pintarProgreso();
            setConexion(true);
        })
        .catch(function () {
            setConexion(false);
        });
}

function iniciarPolling() {
    refrescar();
    setInterval(refrescar, INTERVALO_MS);
}

/* ===================== Enviar acciones ===================== */

function enviar(tipo, valor) {
    if (tipo !== 'clima' && seleccion === null) {
        aviso('Primero elegí una parcela 🌱');
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
            refrescar();
        })
        .catch(function () {
            aviso('No se pudo enviar, reintentá');
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
    actualizarSeleccion();
    iniciarPolling();

    setInterval(function () {
        campo.avanzar();
        renderTodo();
    }, campo.pasoMs());
});
