import { Howl, Howler } from 'howler';

import climaUrl from '../audio/clima.wav?url';
import cosecharUrl from '../audio/cosechar.wav?url';
import misionUrl from '../audio/mision.wav?url';
import nivelUrl from '../audio/nivel.wav?url';
import plagaUrl from '../audio/plaga.wav?url';
import regarUrl from '../audio/regar.wav?url';
import sembrarUrl from '../audio/sembrar.wav?url';
import tratarUrl from '../audio/tratar.wav?url';

/**
 * Sonidos del campo, sintetizados en WAV e importados como assets de Vite
 * (así funcionan igual en local, en la LAN y detrás del túnel).
 */
const ARCHIVOS = {
    sembrar: sembrarUrl,
    regar: regarUrl,
    cosechar: cosecharUrl,
    tratar: tratarUrl,
    plaga: plagaUrl,
    clima: climaUrl,
    nivel: nivelUrl,
    mision: misionUrl,
};

const VOLUMENES = {
    sembrar: 0.55,
    regar: 0.45,
    cosechar: 0.65,
    tratar: 0.5,
    plaga: 0.4,
    clima: 0.4,
    nivel: 0.75,
    mision: 0.7,
};

const pistas = {};

let silenciado = false;

/**
 * Crea (una sola vez) la pista de Howler para un sonido.
 *
 * @param {string} nombre
 * @returns {Howl|null}
 */
function pista(nombre) {
    if (!ARCHIVOS[nombre]) {
        return null;
    }

    if (!pistas[nombre]) {
        pistas[nombre] = new Howl({
            src: [ARCHIVOS[nombre]],
            volume: VOLUMENES[nombre] ?? 0.5,
            preload: true,
        });
    }

    return pistas[nombre];
}

/**
 * Precarga los sonidos para que la primera reproducción no tenga retardo.
 *
 * @param {string[]} nombres
 */
export function precargar(nombres = Object.keys(ARCHIVOS)) {
    nombres.forEach(pista);
}

/**
 * Reproduce un sonido del pack. Si el audio está silenciado no hace nada.
 *
 * @param {string} nombre
 */
export function reproducir(nombre) {
    if (silenciado) {
        return;
    }

    const sonido = pista(nombre);

    if (sonido) {
        sonido.play();
    }
}

/**
 * Silencia o reactiva todo el audio de la página.
 *
 * @param {boolean} valor
 */
export function silenciar(valor) {
    silenciado = !!valor;
    Howler.mute(silenciado);
}

/**
 * @returns {boolean}
 */
export function estaSilenciado() {
    return silenciado;
}
