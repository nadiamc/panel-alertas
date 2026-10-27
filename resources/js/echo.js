import Echo from 'laravel-echo';

import Pusher from 'pusher-js';

window.Pusher = Pusher;

const connection = import.meta.env.VITE_BROADCAST_CONNECTION ?? 'reverb';

const HOSTS_LOCALES = ['127.0.0.1', 'localhost', '0.0.0.0', '::1', ''];

/**
 * ¿La IP pertenece a una red privada (LAN)?
 *
 * @param {string} host
 * @returns {boolean}
 */
function esRedLocal(host) {
    return HOSTS_LOCALES.includes(host)
        || /^10\./.test(host)
        || /^192\.168\./.test(host)
        || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
}

/**
 * Si el host configurado es local (o no está definido), usa el host con el que
 * el navegador abrió la página. Así el visor y el celular se conectan a Reverb
 * por la misma IP de la red, sin depender de que VITE_REVERB_HOST apunte a la
 * IP de la máquina.
 *
 * @param {string|undefined} configurado
 * @returns {string}
 */
function hostRealtime(configurado) {
    const host = (configurado || '').trim();
    const actual = window.location.hostname;

    if (host && !HOSTS_LOCALES.includes(host)) {
        return host;
    }

    return actual && !HOSTS_LOCALES.includes(actual) ? actual : host || actual || 'localhost';
}

const necesitaEcho = document.querySelector('#campo, #control, #target-div');

/**
 * Cuando la página se abre por un túnel HTTPS, el puerto de Reverb (8080) sólo
 * existe en la LAN: el navegador remoto intentaría conectarse para siempre y
 * llenaría la consola de errores. En ese caso el control usa la sincronización
 * por HTTP y no se crea Echo.
 *
 * @returns {boolean}
 */
function webSocketDisponible() {
    const puerto = Number(import.meta.env.VITE_REVERB_PORT ?? 80);

    if (window.location.protocol !== 'https:' || puerto === 443) {
        return true;
    }

    return esRedLocal(window.location.hostname);
}

const usarWebSocket = webSocketDisponible();

if (necesitaEcho && !usarWebSocket) {
    console.info('WebSocket no publicado en este host: sincronizando por HTTP.');
}

if (necesitaEcho && usarWebSocket) {
    window.Echo = connection === 'pusher'
        ? new Echo({
              broadcaster: 'pusher',
              key: import.meta.env.VITE_PUSHER_APP_KEY,
              cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
              forceTLS: true,
          })
        : new Echo({
              broadcaster: 'reverb',
              key: import.meta.env.VITE_REVERB_APP_KEY,
              wsHost: hostRealtime(import.meta.env.VITE_REVERB_HOST),
              wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
              wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
              forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
              enabledTransports: ['ws', 'wss'],
          });
}
