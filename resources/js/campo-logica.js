export const CULTIVOS = {
    mangoTommy: '🥭',
    mangoOro: '🥭',
    banana: '🍌',
    batata: '🍠',
    lechuga: '🥬',
    zapallito: '🥒',
    maiz: '🌽',
    tomate: '🍅',
};

/**
 * Devuelve el agrónomo (nene o nena) que representa a un jugador según su
 * nombre: termina en "a"/"á" => nena, el resto => nene.
 *
 * @param {string} nombre
 * @returns {string}
 */
export function personaje(nombre) {
    const limpio = (nombre || '').trim().toLowerCase();

    return /[aá]$/.test(limpio) ? '👩‍🌾' : '👨‍🌾';
}

const PASO_CRECIMIENTO = 3;
const PASO_RIEGO = 6;
const PASO_MS = 350;

/**
 * Simulación del campo compartida entre el visor (pantalla grande) y el
 * control (celular). El puntaje y las misiones viven en el servidor; acá
 * solo se modela el crecimiento de cada parcela.
 *
 * @returns {{
 *   datos: (i: number) => object,
 *   aplicar: (e: object) => object,
 *   avanzar: () => void,
 *   etapa: (i: number) => number,
 *   cargar: (parcelas: object) => void,
 * }}
 */
export function crearCampo() {
    const parcelas = {};

    function datos(i) {
        if (!parcelas[i]) {
            parcelas[i] = {
                cultivo: null,
                progreso: 0,
                regada: false,
                plaga: false,
                madura: false,
                autor: null,
            };
        }

        return parcelas[i];
    }

    function aplicar(e) {
        const d = datos(e.parcela);

        switch (e.tipo) {
            case 'sembrar':
                d.cultivo = e.valor || 'maiz';
                d.progreso = 0;
                d.madura = false;
                d.plaga = false;
                d.regada = false;
                d.autor = e.autor || null;
                break;

            case 'regar':
                if (d.cultivo) {
                    d.regada = true;
                }
                break;

            case 'cosechar':
                d.cultivo = null;
                d.progreso = 0;
                d.madura = false;
                d.plaga = false;
                d.regada = false;
                d.autor = null;
                break;

            case 'plaga':
                if (d.cultivo) {
                    d.plaga = true;
                }
                break;

            case 'tratar':
                d.plaga = false;
                break;
        }

        return d;
    }

    function avanzar() {
        Object.keys(parcelas).forEach(function (k) {
            const d = parcelas[k];

            if (!d.cultivo || d.madura || d.plaga) {
                return;
            }

            d.progreso += d.regada ? PASO_RIEGO : PASO_CRECIMIENTO;

            if (d.progreso >= 100) {
                d.progreso = 100;
                d.madura = true;
            }
        });
    }

    function etapa(i) {
        const d = datos(i);

        if (!d.cultivo) {
            return 0;
        }

        if (d.madura) {
            return 4;
        }

        if (d.progreso < 25) {
            return 1;
        }

        if (d.progreso < 55) {
            return 2;
        }

        return 3;
    }

    function cargar(parcelasServidor) {
        Object.keys(parcelasServidor || {}).forEach(function (k) {
            const s = parcelasServidor[k];

            if (!s || !s.cultivo) {
                return;
            }

            const d = datos(parseInt(k, 10));
            d.cultivo = s.cultivo;
            d.autor = s.autor || null;
            d.plaga = !!s.plaga;
        });
    }

    /**
     * Reconcilia el estado local con el del servidor sin reiniciar el
     * crecimiento de las parcelas que no cambiaron. Devuelve la lista de
     * cambios detectados para poder avisar en pantalla.
     *
     * @param  {object} mapa  parcelas del servidor: { i: {cultivo, autor, plaga} }
     * @returns {Array<object>}
     */
    function sincronizar(mapa) {
        const cambios = [];
        const vistos = {};

        Object.keys(mapa || {}).forEach(function (k) {
            const s = mapa[k];

            if (!s || !s.cultivo) {
                return;
            }

            vistos[k] = true;

            const i = parseInt(k, 10);
            const d = datos(i);
            const plagaAntes = d.plaga;
            const cambioCultivo = d.cultivo !== s.cultivo || d.autor !== (s.autor || null);

            if (cambioCultivo) {
                d.cultivo = s.cultivo;
                d.autor = s.autor || null;
                d.progreso = 0;
                d.madura = false;
                d.regada = false;
                d.plaga = !!s.plaga;
                cambios.push({ tipo: 'sembrado', parcela: i, cultivo: s.cultivo, autor: d.autor });
            } else if (!!s.plaga !== plagaAntes) {
                d.plaga = !!s.plaga;
                cambios.push({ tipo: d.plaga ? 'plaga' : 'tratado', parcela: i, cultivo: d.cultivo, autor: d.autor });
            }
        });

        Object.keys(parcelas).forEach(function (k) {
            const d = parcelas[k];

            if (d.cultivo && !vistos[k]) {
                d.cultivo = null;
                d.progreso = 0;
                d.madura = false;
                d.plaga = false;
                d.regada = false;
                d.autor = null;
                cambios.push({ tipo: 'cosechado', parcela: parseInt(k, 10) });
            }
        });

        return cambios;
    }

    function pasoMs() {
        return PASO_MS;
    }

    return { datos, aplicar, avanzar, etapa, cargar, sincronizar, pasoMs };
}
