import { CULTIVOS, personaje } from './campo-logica';

const ANCHO = 1000;
const ALTO = 700;
const COLUMNAS = 6;
const FILAS = 4;
const LADO = 148;
const HUECO = 12;
const TIPOGRAFIA = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const TEXTO = '"Segoe UI", system-ui, sans-serif';

const ESCALAS = [0.25, 0.52, 0.72, 0.92, 1.14];

/**
 * Dibuja un rectángulo con esquinas redondeadas en un canvas 2D.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} ancho
 * @param {number} alto
 * @param {number} radio
 */
function rectRedondeado(ctx, x, y, ancho, alto, radio) {
    const r = Math.min(radio, ancho / 2, alto / 2);

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + ancho - r, y);
    ctx.quadraticCurveTo(x + ancho, y, x + ancho, y + r);
    ctx.lineTo(x + ancho, y + alto - r);
    ctx.quadraticCurveTo(x + ancho, y + alto, x + ancho - r, y + alto);
    ctx.lineTo(x + r, y + alto);
    ctx.quadraticCurveTo(x, y + alto, x, y + alto - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

/**
 * Posición del centro de la parcela dentro de la escena.
 *
 * @param {number} i
 * @returns {{x: number, y: number}}
 */
function posicion(i) {
    const anchoTotal = COLUMNAS * LADO + (COLUMNAS - 1) * HUECO;
    const altoTotal = FILAS * LADO + (FILAS - 1) * HUECO;
    const x0 = (ANCHO - anchoTotal) / 2 + LADO / 2;
    const y0 = (ALTO - altoTotal) / 2 + LADO / 2;

    return {
        x: x0 + (i % COLUMNAS) * (LADO + HUECO),
        y: y0 + Math.floor(i / COLUMNAS) * (LADO + HUECO),
    };
}

/**
 * Emoji que representa el cultivo según su etapa de crecimiento.
 *
 * @param {string} cultivo
 * @param {number} etapa
 * @returns {string}
 */
function emojiCultivo(cultivo, etapa) {
    if (etapa <= 1) {
        return '🌱';
    }

    if (etapa === 2) {
        return '🌿';
    }

    return CULTIVOS[cultivo] || '🌱';
}

/**
 * Recorta un nombre para que entre en la etiqueta de la parcela.
 *
 * @param {string} autor
 * @returns {string}
 */
function recortar(autor) {
    const nombre = String(autor || '').trim();

    return nombre.length > 12 ? nombre.slice(0, 11) + '…' : nombre;
}

/**
 * @param {string} color
 * @returns {number}
 */
function colorNumerico(color) {
    const valor = Number.parseInt(String(color || '').replace('#', ''), 16);

    return Number.isNaN(valor) ? 0xffffff : valor;
}

/**
 * Genera el fondo de pasto con franjas de corte, ruido y viñeta.
 *
 * @param {Phaser.Scene} escena
 */
function crearPasto(escena) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = ANCHO;
    canvas.height = ALTO;

    const base = ctx.createLinearGradient(0, 0, 0, ALTO);
    base.addColorStop(0, '#7cc24a');
    base.addColorStop(0.55, '#5da531');
    base.addColorStop(1, '#3f7d26');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, ANCHO, ALTO);

    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#ffffff';

    for (let x = -ALTO; x < ANCHO; x += 92) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 46, 0);
        ctx.lineTo(x + 46 + ALTO, ALTO);
        ctx.lineTo(x + ALTO, ALTO);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();

    for (let n = 0; n < 5200; n++) {
        const claro = n % 3 === 0;
        ctx.fillStyle = claro ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .06)';
        ctx.fillRect(Math.random() * ANCHO, Math.random() * ALTO, 2, 2);
    }

    const sombra = ctx.createRadialGradient(
        ANCHO / 2, ALTO / 2, ALTO * 0.34,
        ANCHO / 2, ALTO / 2, ALTO * 0.82,
    );
    sombra.addColorStop(0, 'rgba(0, 0, 0, 0)');
    sombra.addColorStop(1, 'rgba(0, 0, 0, .3)');
    ctx.fillStyle = sombra;
    ctx.fillRect(0, 0, ANCHO, ALTO);

    escena.textures.addCanvas('pasto', canvas);
}

/**
 * Genera la textura de una parcela de tierra (seca o regada).
 *
 * @param {Phaser.Scene} escena
 * @param {string} clave
 * @param {{arriba: string, abajo: string, regada?: boolean}} colores
 */
function crearTierra(escena, clave, colores) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = LADO;
    canvas.height = LADO;

    rectRedondeado(ctx, 1, 1, LADO - 2, LADO - 2, 16);
    ctx.clip();

    const base = ctx.createLinearGradient(0, 0, 0, LADO);
    base.addColorStop(0, colores.arriba);
    base.addColorStop(1, colores.abajo);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, LADO, LADO);

    for (let x = 10; x < LADO; x += 13) {
        ctx.fillStyle = 'rgba(0, 0, 0, .17)';
        ctx.fillRect(x, 0, 5, LADO);
        ctx.fillStyle = 'rgba(255, 255, 255, .05)';
        ctx.fillRect(x + 5, 0, 2, LADO);
    }

    for (let n = 0; n < 320; n++) {
        ctx.fillStyle = n % 2 === 0 ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .08)';
        ctx.fillRect(Math.random() * LADO, Math.random() * LADO, 2, 2);
    }

    const luz = ctx.createLinearGradient(0, 0, 0, LADO * 0.45);
    luz.addColorStop(0, 'rgba(255, 235, 200, .14)');
    luz.addColorStop(1, 'rgba(255, 235, 200, 0)');
    ctx.fillStyle = luz;
    ctx.fillRect(0, 0, LADO, LADO * 0.45);

    if (colores.regada) {
        const agua = ctx.createRadialGradient(
            LADO * 0.5, LADO * 1.05, 8,
            LADO * 0.5, LADO * 1.05, LADO * 0.9,
        );
        agua.addColorStop(0, 'rgba(56, 189, 248, .34)');
        agua.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = agua;
        ctx.fillRect(0, 0, LADO, LADO);
    }

    ctx.lineWidth = 7;
    ctx.strokeStyle = 'rgba(0, 0, 0, .32)';
    rectRedondeado(ctx, 1, 1, LADO - 2, LADO - 2, 16);
    ctx.stroke();

    escena.textures.addCanvas(clave, canvas);
}

/**
 * Genera un resplandor radial para las parcelas maduras.
 *
 * @param {Phaser.Scene} escena
 */
function crearBrillo(escena) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 180;
    canvas.height = 180;

    const grad = ctx.createRadialGradient(90, 90, 0, 90, 90, 90);
    grad.addColorStop(0, 'rgba(253, 224, 71, .8)');
    grad.addColorStop(0.45, 'rgba(253, 224, 71, .28)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 180, 180);

    escena.textures.addCanvas('brillo', canvas);
}

/**
 * Crea las texturas que usa la escena (sin archivos externos).
 *
 * @param {Phaser.Scene} escena
 */
function crearTexturas(escena) {
    crearPasto(escena);
    crearTierra(escena, 'tierra', { arriba: '#7a5433', abajo: '#4b3120' });
    crearTierra(escena, 'tierraRegada', { arriba: '#5f4228', abajo: '#332214', regada: true });
    crearBrillo(escena);

    const agua = document.createElement('canvas');
    const ctx = agua.getContext('2d');

    agua.width = LADO;
    agua.height = LADO;

    rectRedondeado(ctx, 1, 1, LADO - 2, LADO - 2, 16);
    ctx.clip();

    const grad = ctx.createRadialGradient(
        LADO * 0.5, LADO * 0.95, 10,
        LADO * 0.5, LADO * 0.95, LADO * 0.8,
    );
    grad.addColorStop(0, 'rgba(56, 189, 248, .5)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, LADO, LADO);

    escena.textures.addCanvas('agua', agua);
}

/**
 * Escena Phaser del campo: 24 parcelas, cultivos y efectos en vivo.
 *
 * @param {HTMLElement} contenedor
 * @param {{total?: number, estado: (i: number) => object}} opciones
 * @returns {{
 *   render: (i: number) => void,
 *   renderTodo: () => void,
 *   pulsar: (i: number) => void,
 *   mostrarAutor: (i: number, autor: string) => void,
 *   puntosPop: (i: number, texto: string) => void,
 *   chispas: (i: number, color: string, cantidad: number) => void,
 *   cosecha: (i: number) => void,
 * }}
 */
export function crearEscena(contenedor, opciones) {
    const total = opciones.total || 24;
    const estado = opciones.estado;
    const pendientes = [];

    let escena = null;

    /**
     * Ejecuta una acción sobre la escena o la deja encolada hasta que esté lista.
     *
     * @param {(escena: Phaser.Scene) => void} accion
     */
    function cuandoLista(accion) {
        if (escena) {
            accion(escena);
        } else {
            pendientes.push(accion);
        }
    }

    import('phaser').then(function (modulo) {
        const Phaser = modulo.default;

        class EscenaCampo extends Phaser.Scene {
            constructor() {
                super('Campo');
            }

            create() {
                escena = this;
                crearTexturas(this);

                this.add.image(ANCHO / 2, ALTO / 2, 'pasto');
                this.parcelas = [];

                for (let i = 0; i < total; i++) {
                    this.parcelas.push(this.crearParcela(i));
                }

                this.decorar();
                this.renderTodo();

                contenedor.dataset.listo = '1';
                contenedor.querySelector('.campo-cargando')?.remove();

                pendientes.splice(0).forEach(function (accion) {
                    accion(escena);
                });
            }

            /**
             * @param {number} i
             * @returns {object}
             */
            crearParcela(i) {
                const pos = posicion(i);
                const cont = this.add.container(pos.x, pos.y);
                const suelo = this.add.image(0, 0, 'tierra');
                const agua = this.add.image(0, 0, 'agua').setAlpha(0);
                const brillo = this.add.image(0, -10, 'brillo')
                    .setVisible(false)
                    .setAlpha(0.45);
                const borde = this.add.graphics();
                const cultivo = this.add.text(0, 30, '', {
                    fontFamily: TIPOGRAFIA,
                    fontSize: '64px',
                }).setOrigin(0.5, 1).setScale(ESCALAS[0]);
                const agronomo = this.add.text(50, 60, '', {
                    fontFamily: TIPOGRAFIA,
                    fontSize: '26px',
                }).setOrigin(0.5, 1);
                const numero = this.add.text(-LADO / 2 + 9, -LADO / 2 + 7, String(i + 1), {
                    fontFamily: TEXTO,
                    fontSize: '12px',
                    fontStyle: 'bold',
                    color: '#ffffff',
                    backgroundColor: 'rgba(0, 0, 0, .38)',
                    padding: { left: 7, right: 7, top: 3, bottom: 3 },
                }).setOrigin(0, 0);
                const autor = this.add.text(0, LADO / 2 - 7, '', {
                    fontFamily: TEXTO,
                    fontSize: '12px',
                    fontStyle: 'bold',
                    color: '#08210f',
                    backgroundColor: '#a3e635',
                    padding: { left: 8, right: 8, top: 3, bottom: 3 },
                }).setOrigin(0.5, 1).setAlpha(0);
                const bicho = this.add.text(LADO / 2 - 18, -LADO / 2 + 26, '🐛', {
                    fontFamily: TIPOGRAFIA,
                    fontSize: '20px',
                }).setOrigin(0.5).setAlpha(0);

                cont.add([suelo, agua, brillo, borde, cultivo, agronomo, numero, autor, bicho]);

                const parcela = {
                    i,
                    cont,
                    suelo,
                    agua,
                    brillo,
                    borde,
                    cultivo,
                    agronomo,
                    numero,
                    autor,
                    bicho,
                    cultivoActual: null,
                    etapa: 0,
                    regada: false,
                    plaga: false,
                    autorNombre: null,
                    firmaBorde: '',
                    brilloOn: false,
                    sway: null,
                    bichoTween: null,
                    autorTimer: null,
                };

                parcela.brilloTween = this.tweens.add({
                    targets: brillo,
                    alpha: { from: 0.3, to: 0.7 },
                    duration: 1400,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    paused: true,
                });

                return parcela;
            }

            /**
             * Actualiza una parcela con el estado actual del modelo.
             *
             * @param {object} p
             */
            actualizarParcela(p) {
                const s = estado(p.i) || {};
                const cultivo = s.cultivo || null;
                const etapa = cultivo ? (s.etapa || 0) : 0;
                const cambioCultivo = cultivo !== p.cultivoActual;
                const cambioEtapa = etapa !== p.etapa;
                const regada = !!s.regada && !!cultivo;
                const plaga = !!s.plaga && !!cultivo;

                if (cambioCultivo) {
                    p.cultivoActual = cultivo;
                    p.etapa = etapa;
                    this.pararBalanceo(p);
                    p.cultivo.setText(cultivo ? emojiCultivo(cultivo, etapa) : '');
                    p.cultivo.setAngle(0);
                    p.cultivo.setScale(ESCALAS[0]);
                    p.autor.setAlpha(0);
                    p.agua.setAlpha(0);
                    p.regada = false;

                    if (cultivo) {
                        this.tweens.add({
                            targets: p.cultivo,
                            scaleX: ESCALAS[etapa],
                            scaleY: ESCALAS[etapa],
                            duration: 480,
                            ease: 'Back.easeOut',
                        });
                    }
                } else if (cultivo && cambioEtapa) {
                    p.etapa = etapa;
                    p.cultivo.setText(emojiCultivo(cultivo, etapa));
                    this.tweens.add({
                        targets: p.cultivo,
                        scaleX: ESCALAS[etapa],
                        scaleY: ESCALAS[etapa],
                        duration: 420,
                        ease: 'Back.easeOut',
                    });
                }

                if (regada !== p.regada) {
                    p.regada = regada;
                    p.suelo.setTexture(regada ? 'tierraRegada' : 'tierra');
                    p.agua.setAlpha(regada ? 0.55 : 0);

                    if (regada) {
                        this.lloverGotas(p);
                    }
                }

                if (plaga !== p.plaga) {
                    p.plaga = plaga;
                    p.cultivo.setAlpha(plaga ? 0.7 : 1);
                    p.bicho.setAlpha(plaga ? 1 : 0);
                    this.pararBicho(p);

                    if (plaga) {
                        p.bicho.setScale(0.4);
                        this.tweens.add({
                            targets: p.bicho,
                            scaleX: 1,
                            scaleY: 1,
                            duration: 260,
                            ease: 'Back.easeOut',
                        });
                        p.bichoTween = this.tweens.add({
                            targets: p.bicho,
                            angle: { from: -8, to: 8 },
                            duration: 420,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut',
                        });
                    }

                    this.balancear(p);
                }

                const autor = cultivo ? (s.autor || null) : null;

                if (autor !== p.autorNombre) {
                    p.autorNombre = autor;
                    p.agronomo.setText(autor ? personaje(autor) : '');
                }

                const firma = etapa + ':' + (plaga ? '1' : '0');

                if (firma !== p.firmaBorde) {
                    p.firmaBorde = firma;
                    this.pintarBorde(p);
                    this.ajustarBrillo(p);
                }

                if (!cultivo) {
                    this.pararBalanceo(p);
                    p.agua.setAlpha(0);
                }
            }

            /**
             * @param {object} p
             */
            pintarBorde(p) {
                p.borde.clear();

                if (!p.cultivoActual) {
                    return;
                }

                if (p.plaga) {
                    p.borde
                        .lineStyle(4, 0xb91c1c, 0.95)
                        .strokeRoundedRect(-LADO / 2 + 2, -LADO / 2 + 2, LADO - 4, LADO - 4, 16);
                } else if (p.etapa === 4) {
                    p.borde
                        .lineStyle(2, 0xfde047, 0.6)
                        .strokeRoundedRect(-LADO / 2 + 3, -LADO / 2 + 3, LADO - 6, LADO - 6, 15);
                }
            }

            /**
             * @param {object} p
             */
            ajustarBrillo(p) {
                const activo = !!p.cultivoActual && p.etapa === 4 && !p.plaga;

                if (activo === p.brilloOn) {
                    return;
                }

                p.brilloOn = activo;
                p.brillo.setVisible(activo);

                if (activo) {
                    p.brilloTween.resume();
                } else {
                    p.brilloTween.pause();
                }
            }

            /**
             * @param {object} p
             */
            balancear(p) {
                this.pararBalanceo(p);

                if (!p.cultivoActual || p.plaga || p.etapa < 2) {
                    return;
                }

                p.sway = this.tweens.add({
                    targets: p.cultivo,
                    angle: { from: -2.5, to: 2.5 },
                    duration: 1700 + (p.i % 7) * 130,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    delay: (p.i % 5) * 90,
                });
            }

            /**
             * @param {object} p
             */
            pararBalanceo(p) {
                if (p.sway) {
                    p.sway.remove();
                    p.sway = null;
                }

                if (p.cultivo) {
                    p.cultivo.setAngle(0);
                }
            }

            /**
             * @param {object} p
             */
            pararBicho(p) {
                if (p.bichoTween) {
                    p.bichoTween.remove();
                    p.bichoTween = null;
                }

                if (p.bicho) {
                    p.bicho.setAngle(0);
                }
            }

            /**
             * Gotas cayendo sobre una parcela recién regada.
             *
             * @param {object} p
             */
            lloverGotas(p) {
                for (let n = 0; n < 6; n++) {
                    const gota = this.add.circle(
                        -LADO / 2 + 16 + Math.random() * (LADO - 32),
                        -LADO / 2 + 4,
                        3 + Math.random() * 2,
                        0x38bdf8,
                        0.9,
                    );

                    p.cont.add(gota);

                    this.tweens.add({
                        targets: gota,
                        y: LADO / 2 - 10 - Math.random() * 16,
                        alpha: 0,
                        duration: 420 + Math.random() * 260,
                        delay: n * 55,
                        ease: 'Quad.easeIn',
                        onComplete: function () {
                            gota.destroy();
                        },
                    });
                }
            }

            /**
             * Detalle decorativo en los márgenes de la escena.
             */
            decorar() {
                const adornos = ['🌿', '🌼', '🌾', '🍀'];

                for (let n = 0; n < 14; n++) {
                    const arriba = n % 2 === 0;
                    const adorno = this.add.text(
                        30 + Math.random() * (ANCHO - 60),
                        arriba ? 12 + Math.random() * 12 : ALTO - 24 - Math.random() * 12,
                        adornos[n % adornos.length],
                        { fontFamily: TIPOGRAFIA, fontSize: '22px' },
                    );
                    adorno
                        .setOrigin(0.5)
                        .setScale(0.55 + Math.random() * 0.25)
                        .setAlpha(0.85);

                    this.tweens.add({
                        targets: adorno,
                        angle: { from: -4, to: 4 },
                        duration: 1800 + Math.random() * 1200,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut',
                    });
                }
            }

            /**
             * Vuelve a leer el modelo para todas las parcelas.
             */
            renderTodo() {
                if (!this.parcelas) {
                    return;
                }

                for (let i = 0; i < this.parcelas.length; i++) {
                    this.actualizarParcela(this.parcelas[i]);
                }
            }

            /**
             * @param {number} i
             */
            renderParcela(i) {
                const p = this.parcelas && this.parcelas[i];

                if (p) {
                    this.actualizarParcela(p);
                }
            }

            /**
             * @param {number} i
             */
            pulsar(i) {
                const p = this.parcelas && this.parcelas[i];

                if (!p) {
                    return;
                }

                const anillo = this.add.graphics();

                anillo
                    .lineStyle(5, 0x86efac, 1)
                    .strokeRoundedRect(-LADO / 2 - 3, -LADO / 2 - 3, LADO + 6, LADO + 6, 18);
                p.cont.add(anillo);

                this.tweens.add({
                    targets: anillo,
                    alpha: 0,
                    scaleX: 1.12,
                    scaleY: 1.12,
                    duration: 720,
                    ease: 'Cubic.easeOut',
                    onComplete: function () {
                        anillo.destroy();
                    },
                });

                this.tweens.add({
                    targets: p.cont,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 140,
                    yoyo: true,
                    ease: 'Sine.easeInOut',
                });
            }

            /**
             * @param {number} i
             * @param {string} autor
             */
            mostrarAutor(i, autor) {
                const p = this.parcelas && this.parcelas[i];

                if (!p || !autor) {
                    return;
                }

                p.autor.setText(recortar(autor)).setAlpha(0).setY(LADO / 2 - 1);

                this.tweens.add({
                    targets: p.autor,
                    alpha: 1,
                    y: LADO / 2 - 7,
                    duration: 220,
                    ease: 'Cubic.easeOut',
                });

                if (p.autorTimer) {
                    p.autorTimer.remove();
                }

                const self = this;

                p.autorTimer = this.time.delayedCall(5000, function () {
                    self.tweens.add({
                        targets: p.autor,
                        alpha: 0,
                        duration: 300,
                    });
                });
            }

            /**
             * @param {number} i
             * @param {string} texto
             */
            puntosPop(i, texto) {
                const p = this.parcelas && this.parcelas[i];

                if (!p) {
                    return;
                }

                const el = this.add.text(Math.random() * 18 - 9, -12, texto, {
                    fontFamily: TEXTO,
                    fontSize: '24px',
                    fontStyle: 'bold',
                    color: '#fde047',
                    stroke: '#3a2a00',
                    strokeThickness: 4,
                }).setOrigin(0.5);

                p.cont.add(el);

                this.tweens.add({
                    targets: el,
                    y: -66,
                    alpha: 0,
                    duration: 950,
                    ease: 'Cubic.easeOut',
                    onComplete: function () {
                        el.destroy();
                    },
                });
            }

            /**
             * @param {number} i
             * @param {string} color
             * @param {number} cantidad
             */
            chispas(i, color, cantidad) {
                const p = this.parcelas && this.parcelas[i];

                if (!p) {
                    return;
                }

                const tono = colorNumerico(color);

                for (let n = 0; n < cantidad; n++) {
                    const chispa = this.add.circle(0, 0, 3 + Math.random() * 3, tono, 1);
                    const angulo = Math.random() * Math.PI * 2;
                    const distancia = 30 + Math.random() * 50;

                    p.cont.add(chispa);

                    this.tweens.add({
                        targets: chispa,
                        x: Math.cos(angulo) * distancia,
                        y: Math.sin(angulo) * distancia,
                        alpha: 0,
                        scaleX: 0.2,
                        scaleY: 0.2,
                        duration: 680 + Math.random() * 220,
                        ease: 'Cubic.easeOut',
                        onComplete: function () {
                            chispa.destroy();
                        },
                    });
                }
            }

            /**
             * Destello y tractorcito al cosechar.
             *
             * @param {number} i
             */
            cosecha(i) {
                const p = this.parcelas && this.parcelas[i];

                if (!p) {
                    return;
                }

                this.chispas(i, '#fde047', 12);
                this.chispas(i, '#a3e635', 8);

                const destello = this.add.circle(0, -4, 24, 0xfde047, 0.85);
                p.cont.add(destello);

                this.tweens.add({
                    targets: destello,
                    scaleX: 2.6,
                    scaleY: 2.6,
                    alpha: 0,
                    duration: 520,
                    ease: 'Cubic.easeOut',
                    onComplete: function () {
                        destello.destroy();
                    },
                });

                const tractor = this.add.text(-LADO / 2 - 4, 22, '🚜', {
                    fontFamily: TIPOGRAFIA,
                    fontSize: '30px',
                }).setOrigin(0.5);

                p.cont.add(tractor);

                this.tweens.add({
                    targets: tractor,
                    x: LADO / 2 + 18,
                    duration: 880,
                    ease: 'Sine.easeInOut',
                    onComplete: function () {
                        tractor.destroy();
                    },
                });
            }
        }

        const juego = new Phaser.Game({
            type: Phaser.AUTO,
            parent: contenedor,
            width: ANCHO,
            height: ALTO,
            backgroundColor: '#3f7d26',
            banner: false,
            render: { antialias: true },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: ANCHO,
                height: ALTO,
            },
            scene: [EscenaCampo],
        });

        juego.canvas?.setAttribute('aria-hidden', 'true');
    }).catch(function (error) {
        console.error('No se pudo cargar Phaser', error);

        const aviso = contenedor.querySelector('.campo-cargando');

        if (aviso) {
            aviso.textContent = 'No se pudo cargar el campo';
        }
    });

    return {
        render: function (i) {
            cuandoLista(function (s) { s.renderParcela(i); });
        },
        renderTodo: function () {
            cuandoLista(function (s) { s.renderTodo(); });
        },
        pulsar: function (i) {
            cuandoLista(function (s) { s.pulsar(i); });
        },
        mostrarAutor: function (i, autor) {
            cuandoLista(function (s) { s.mostrarAutor(i, autor); });
        },
        puntosPop: function (i, texto) {
            cuandoLista(function (s) { s.puntosPop(i, texto); });
        },
        chispas: function (i, color, cantidad) {
            cuandoLista(function (s) { s.chispas(i, color, cantidad); });
        },
        cosecha: function (i) {
            cuandoLista(function (s) { s.cosecha(i); });
        },
    };
}
