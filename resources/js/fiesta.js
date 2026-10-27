import confetti from 'canvas-confetti';
import Swal from 'sweetalert2';

const COLORES = ['#4ade80', '#a3e635', '#fde047', '#38bdf8', '#f472b6', '#f59e0b'];

const BASE = {
    background: '#0b1f16',
    color: '#eef2f5',
    backdrop: 'rgba(3, 10, 7, .55)',
    confirmButtonColor: '#4ade80',
    customClass: { popup: 'swal-campo' },
};

/**
 * Escapa un texto para poder insertarlo con `html` en SweetAlert2.
 *
 * @param {string} texto
 * @returns {string}
 */
function escapar(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Lanza confeti sobre toda la pantalla con canvas-confetti.
 *
 * @param {number} cantidad
 * @param {{origen?: number, angulo?: number, y?: number, spread?: number, velocidad?: number}} opciones
 */
export function confeti(cantidad = 60, opciones = {}) {
    confetti({
        particleCount: cantidad,
        spread: opciones.spread ?? 70,
        startVelocity: opciones.velocidad ?? 42,
        ticks: 220,
        zIndex: 1100,
        colors: COLORES,
        disableForReducedMotion: true,
        origin: { x: opciones.origen ?? 0.5, y: opciones.y ?? 1.02 },
        angle: opciones.angulo ?? 90,
    });
}

/**
 * Celebración grande: dos cañones laterales y una ráfaga central.
 */
export function confetiFiesta() {
    confeti(80, { origen: 0.08, angulo: 60, y: 0.92 });
    confeti(80, { origen: 0.92, angulo: 120, y: 0.92 });

    setTimeout(function () {
        confeti(55, { origen: 0.5, angulo: 90, y: 0.78 });
    }, 160);
}

/**
 * Modal de subida de nivel.
 *
 * @param {string} nombre
 * @param {number} nivel
 * @returns {Promise<unknown>}
 */
export function alertaNivel(nombre, nivel) {
    return Swal.fire({
        ...BASE,
        icon: 'success',
        title: '⭐ ¡Nivel ' + nivel + '!',
        text: nombre + ' subió de nivel',
        showConfirmButton: false,
        timer: 3400,
        timerProgressBar: true,
    });
}

/**
 * Toast de misión cumplida. Si son varias, las lista juntas.
 *
 * @param {string[]} textos
 * @returns {Promise<unknown>}
 */
export function alertaMisiones(textos) {
    const misiones = textos.filter(Boolean);

    if (misiones.length === 0) {
        return Promise.resolve();
    }

    const detalle = misiones.length === 1
        ? escapar(misiones[0])
        : '<ul class="swal-misiones">' + misiones.map(function (m) {
            return '<li>🏆 ' + escapar(m) + '</li>';
        }).join('') + '</ul>';

    return Swal.fire({
        ...BASE,
        icon: 'success',
        title: misiones.length === 1 ? '🏆 ¡Misión cumplida!' : '🏆 ¡' + misiones.length + ' misiones cumplidas!',
        html: detalle,
        showConfirmButton: false,
        timer: 3200,
        timerProgressBar: true,
    });
}

/**
 * Aviso no bloqueante de plaga.
 *
 * @param {number} parcela número visible (1..24)
 * @returns {Promise<unknown>}
 */
export function alertaPlaga(parcela) {
    return Swal.fire({
        ...BASE,
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: '🐛 ¡Plaga en la parcela ' + parcela + '!',
        showConfirmButton: false,
        timer: 2800,
        timerProgressBar: true,
        customClass: { popup: 'swal-campo swal-toast' },
    });
}

/**
 * Aviso suave para el jugador (por ejemplo, falta elegir una parcela).
 *
 * @param {string} mensaje
 * @returns {Promise<unknown>}
 */
export function alertaAviso(mensaje) {
    return Swal.fire({
        ...BASE,
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: mensaje,
        showConfirmButton: false,
        timer: 2400,
        timerProgressBar: true,
        customClass: { popup: 'swal-campo swal-toast' },
    });
}

/**
 * Error no bloqueante.
 *
 * @param {string} mensaje
 * @returns {Promise<unknown>}
 */
export function alertaError(mensaje) {
    return Swal.fire({
        ...BASE,
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: mensaje,
        showConfirmButton: false,
        timer: 2800,
        timerProgressBar: true,
        customClass: { popup: 'swal-campo swal-toast' },
    });
}
