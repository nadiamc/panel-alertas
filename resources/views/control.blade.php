<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="campo-estado-url" content="{{ route('campo.estado', absolute: false) }}">
    <title>AgroConnect — Control</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <style>
        :root {
            --tierra: #3f5a35;
            --surco: #34502c;
            --tierra-oscura: #24381e;
            --pasto: #4ade80;
            --pasto-claro: #a3e635;
            --fondo: #08150f;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            font-family: "Segoe UI", system-ui, sans-serif;
            background: radial-gradient(circle at 50% 0%, #14372a 0%, var(--fondo) 70%);
            color: #eef2f5;
            min-height: 100vh;
        }

        .wrap {
            max-width: 480px;
            margin: 0 auto;
            padding: 18px 16px 40px;
        }

        .barra-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }

        h1 { font-size: 22px; margin: 0 0 4px; }

        .logo .agro,
        .logo .o { color: #307818; }

        .logo .connect { color: #a84800; }

        .logo .o { position: relative; display: inline-block; }

        .logo .hoja {
            position: absolute;
            left: 50%;
            top: 50%;
            width: .38em;
            height: .38em;
            transform: translate(-50%, -50%);
            fill: #307818;
        }

        .badges { display: flex; align-items: center; gap: 6px; font-size: 13px; }

        .badge {
            background: rgba(255, 255, 255, .08);
            border: 1px solid rgba(255, 255, 255, .14);
            border-radius: 999px;
            padding: 4px 9px;
        }

        .badge-btn {
            color: inherit;
            font: inherit;
            line-height: 1;
            cursor: pointer;
        }

        .punto {
            width: 9px; height: 9px; border-radius: 50%;
            background: #ef4444; display: inline-block; margin-right: 4px;
        }

        .punto.on { background: var(--pasto); box-shadow: 0 0 8px var(--pasto); }

        .sub {
            color: rgba(255, 255, 255, .55);
            font-size: 13px;
            margin: 0 0 14px;
        }

        .card {
            background: rgba(11, 30, 21, .7);
            border: 1px solid rgba(255, 255, 255, .12);
            border-radius: 14px;
            padding: 12px 14px;
            margin-bottom: 14px;
        }

        .progreso { display: flex; gap: 8px; align-items: stretch; }

        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }

        .stat {
            background: rgba(255, 255, 255, .06);
            border-radius: 10px;
            padding: 8px;
            text-align: center;
        }

        .stat .v { font-size: 20px; font-weight: 800; color: var(--pasto-claro); }
        .stat .l { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; color: rgba(255, 255, 255, .6); }

        .prog-nombre { font-size: 13px; color: rgba(255, 255, 255, .7); margin: 0 0 8px; }
        .prog-nombre b { color: #fff; }

        label.sec {
            display: block;
            font-weight: 600;
            margin: 4px 0 8px;
            font-size: 14px;
        }

        select, input[type="text"] {
            width: 100%;
            padding: 11px 12px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, .2);
            background: #12271b;
            color: #fff;
            font-size: 16px;
        }

        .parcelas {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 7px;
        }

        .parcela-btn {
            position: relative;
            container-type: inline-size;
            aspect-ratio: 1 / 1;
            border-radius: 10px;
            border: 1px solid var(--tierra-oscura);
            background:
                repeating-linear-gradient(
                    90deg,
                    var(--tierra) 0px,
                    var(--tierra) 6px,
                    var(--surco) 6px,
                    var(--surco) 12px
                );
            color: rgba(255, 255, 255, .85);
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            overflow: hidden;
            padding: 0;
            transition: transform .1s ease, box-shadow .15s ease;
        }

        .parcela-btn.sel {
            outline: 3px solid var(--pasto-claro);
            transform: scale(1.06);
            z-index: 2;
        }

        .parcela-btn.regada { filter: saturate(1.2) brightness(.9); }

        .parcela-btn.plaga {
            box-shadow: inset 0 0 0 3px #ef4444;
        }

        .parcela-btn.listo {
            box-shadow: inset 0 0 0 3px #f59e0b, 0 0 12px rgba(245, 158, 11, .55);
        }

        .p-num {
            position: absolute;
            top: 2px;
            left: 4px;
            font-size: 9px;
            color: rgba(255, 255, 255, .7);
            z-index: 2;
        }

        .p-emoji {
            position: absolute;
            top: 1px;
            right: 2px;
            transform: none;
            font-size: 11px;
            line-height: 1;
            z-index: 3;
        }

        .p-agronomo {
            position: absolute;
            left: 50%;
            top: 47%;
            transform: translate(-50%, -50%);
            font-size: 56cqw;
            line-height: 1;
            z-index: 2;
            filter: drop-shadow(0 2px 2px rgba(0, 0, 0, .4));
            pointer-events: none;
        }

        .p-autor {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 3;
            font-size: 8px;
            background: rgba(163, 230, 53, .9);
            color: #08210f;
            padding: 1px 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .hint {
            font-size: 12px;
            color: rgba(255, 255, 255, .5);
            margin: 8px 0 0;
        }

        .actual {
            margin-top: 8px;
            font-size: 13px;
            color: var(--pasto-claro);
            min-height: 18px;
        }

        .acciones {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 12px;
        }

        .accion-btn {
            padding: 15px 10px;
            border-radius: 12px;
            border: none;
            font-size: 15px;
            font-weight: 700;
            color: #fff;
            background: #17351f;
            cursor: pointer;
            transition: transform .1s ease;
        }

        .accion-btn:active { transform: scale(.96); }

        .accion-btn.primario { background: var(--pasto); color: #08210f; }
        .accion-btn.agua { background: #0ea5e9; }
        .accion-btn.cosecha { background: #f59e0b; color: #3a2400; }
        .accion-btn.riesgo { background: #b91c1c; }

        .clima-fila {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .panel h2 {
            margin: 0 0 8px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #cbe8b0;
        }

        .fila {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            padding: 3px 0;
        }

        .fila .pos { width: 18px; color: var(--pasto-claro); font-weight: 800; }
        .fila .quien { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fila .pts { font-weight: 700; color: #fde047; font-size: 13px; }
        .fila.lider .quien { color: #fde047; }
        .fila.yo { background: rgba(163, 230, 53, .12); border-radius: 8px; }

        .vacio { font-size: 13px; color: rgba(255, 255, 255, .5); }

        .mision { margin-bottom: 9px; }
        .mision:last-child { margin-bottom: 0; }
        .m-arriba { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; margin-bottom: 4px; }
        .m-arriba .nombre { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .m-arriba .cuenta { color: var(--pasto-claro); font-weight: 700; }
        .barra { height: 7px; border-radius: 999px; background: rgba(255, 255, 255, .15); overflow: hidden; }
        .barra span { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #a3e635, #4ade80); transition: width .4s ease; }
        .mision.hecha { opacity: .7; }
        .mision.hecha .nombre { text-decoration: line-through; }

        #toasts {
            position: fixed;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 50;
            width: min(440px, 92vw);
            pointer-events: none;
        }

        .toast {
            background: rgba(8, 22, 16, .95);
            border: 1px solid rgba(163, 230, 53, .5);
            color: #eef2f5;
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 14px;
            text-align: center;
            opacity: 1;
            transform: translateY(0);
            transition: opacity .4s ease, transform .4s ease;
        }

        .toast.fuera { opacity: 0; transform: translateY(10px); }
    </style>
</head>
<body id="control">

<div class="wrap">
    <div class="barra-top">
        <h1 class="logo"><span class="agro">Agr</span><span class="o">o<svg class="hoja" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.05 8.05c-2.73 2.73-2.73 7.15-.02 9.88 1.47-3.4 4.09-6.24 7.36-7.93-2.77 2.34-4.71 5.61-5.39 9.32 2.6 1.23 5.8.78 7.95-1.37C19.43 14.47 20 4 20 4S9.53 4.57 6.05 8.05z"/></svg></span><span class="connect">Connect</span></h1>
        <div class="badges">
            <span class="badge" id="clima" title="Día despejado">☀️</span>
            <span class="badge">⚡ <span id="acciones">0</span></span>
            <span class="badge"><span class="punto" id="conexion"></span></span>
            <button type="button" class="badge badge-btn" id="btn-sonido" title="Silenciar sonidos">🔊</button>
        </div>
    </div>
    <p class="sub">Tocá una parcela y una acción. Todo lo que pasa se ve en vivo.</p>

    <div class="card">
        <p class="prog-nombre">Tu nombre: <b id="prog-nombre">Sin nombre</b></p>
        <div class="stats">
            <div class="stat"><div class="v" id="prog-puntos">0</div><div class="l">Puntos</div></div>
            <div class="stat"><div class="v" id="prog-nivel">1</div><div class="l">Nivel</div></div>
            <div class="stat"><div class="v" id="prog-racha">0</div><div class="l">Racha</div></div>
        </div>
    </div>

    <form id="form-accion" data-url="{{ route('campo.accion', absolute: false) }}">
        <label class="sec">Tu nombre (opcional)</label>
        <input type="text" name="autor" id="autor" maxlength="20" placeholder="Ej: Ana">

        <label class="sec">1. Elegí tu parcela</label>
        <div class="parcelas" id="parcelas">
            @for ($i = 0; $i < 24; $i++)
                <button type="button" class="parcela-btn" data-parcela="{{ $i }}"><span class="p-num">{{ $i + 1 }}</span></button>
            @endfor
        </div>
        <p class="hint">Las parcelas con nombre en verde ya fueron usadas por otros. 🚜 = lista para cosechar, 🐛 = plaga.</p>
        <div class="actual" id="sel-info">Ninguna parcela elegida.</div>

        <label class="sec">2. Cultivo (para sembrar)</label>
        <select id="cultivo">
            <option value="mangoTommy">🥭 Mango Tommy</option>
            <option value="mangoOro">🥭 Mango Oro</option>
            <option value="banana">🍌 Banana</option>
            <option value="batata">🍠 Batata</option>
            <option value="lechuga">🥬 Lechuga</option>
            <option value="zapallito">🥒 Zapallito</option>
            <option value="maiz">🌽 Maíz</option>
            <option value="tomate">🍅 Tomate</option>
        </select>

        <label class="sec">3. Acción</label>
        <div class="acciones">
            <button type="button" class="accion-btn primario" data-tipo="sembrar">🌱 Sembrar</button>
            <button type="button" class="accion-btn agua" data-tipo="regar">💧 Regar</button>
            <button type="button" class="accion-btn cosecha" data-tipo="cosechar">🚜 Cosechar</button>
            <button type="button" class="accion-btn riesgo" data-tipo="plaga">🐛 Plaga</button>
            <button type="button" class="accion-btn" data-tipo="tratar">🧪 Tratar</button>
        </div>

        <label class="sec">Clima (afecta todo el campo)</label>
        <div class="clima-fila">
            <button type="button" class="accion-btn" data-tipo="clima" data-valor="sol">☀️ Sol</button>
            <button type="button" class="accion-btn agua" data-tipo="clima" data-valor="lluvia">🌧️ Lluvia</button>
        </div>
    </form>

    <div class="card panel">
        <h2>🏆 Ranking</h2>
        <div id="ranking-lista"></div>
    </div>

    <div class="card panel">
        <h2>🎯 Misiones</h2>
        <div id="misiones-lista"></div>
    </div>
</div>

<div id="toasts"></div>

</body>
</html>
