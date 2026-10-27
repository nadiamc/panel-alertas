<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="campo-estado-url" content="{{ route('campo.estado', absolute: false) }}">
    <title>AgroConnect — Visor</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <style>
        :root {
            --tierra: #6b4a2f;
            --tierra-oscura: #3d2818;
            --surco: #573b25;
            --pasto: #4ade80;
            --pasto-claro: #a3e635;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: "Segoe UI", system-ui, sans-serif;
            color: #eef2f5;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: #0c2418;
        }

        /* ================= Paisaje de fondo ================= */
        .fondo {
            position: fixed;
            inset: 0;
            z-index: -1;
            overflow: hidden;
            background: linear-gradient(
                #63b0e6 0%,
                #8ec9ec 32%,
                #c7e6f7 48%,
                #d9ecc0 54%,
                #8fc353 62%,
                #5fa233 78%,
                #4a8a29 100%
            );
        }

        .fondo .sol {
            position: absolute;
            top: 5%;
            left: 12%;
            width: 96px;
            height: 96px;
            border-radius: 50%;
            background: radial-gradient(circle at 50% 50%, #fffbe0, #ffe066 58%, #ffce3a);
            box-shadow: 0 0 90px 20px rgba(255, 224, 102, .55);
            animation: sol-ciclo 200s linear infinite;
        }

        .fondo .luna {
            position: absolute;
            top: 8%;
            right: 16%;
            width: 74px;
            height: 74px;
            border-radius: 50%;
            background: radial-gradient(circle at 38% 38%, #fdf7de, #e6e0b8 70%);
            box-shadow: 0 0 70px rgba(253, 247, 222, .5);
            opacity: 0;
            animation: luna-ciclo 200s linear infinite;
        }

        .fondo .noche {
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: linear-gradient(#0a1633, #1b2a52 55%, #35486f);
            opacity: 0;
            animation: noche-ciclo 200s linear infinite;
        }

        .fondo .estrellas {
            position: absolute;
            inset: 0 0 45% 0;
            opacity: 0;
            animation: noche-ciclo 200s linear infinite;
            background-image:
                radial-gradient(2px 2px at 12% 22%, #fff, transparent),
                radial-gradient(1.5px 1.5px at 28% 40%, #fff, transparent),
                radial-gradient(2px 2px at 44% 16%, #fff, transparent),
                radial-gradient(1.5px 1.5px at 58% 34%, #fff, transparent),
                radial-gradient(2px 2px at 72% 20%, #fff, transparent),
                radial-gradient(1.5px 1.5px at 84% 44%, #fff, transparent),
                radial-gradient(1.5px 1.5px at 92% 26%, #fff, transparent),
                radial-gradient(1.5px 1.5px at 20% 62%, #fff, transparent),
                radial-gradient(2px 2px at 66% 58%, #fff, transparent);
        }

        @keyframes sol-ciclo {
            0%, 42% { opacity: 1; }
            58%, 82% { opacity: 0; }
            96%, 100% { opacity: 1; }
        }

        @keyframes luna-ciclo {
            0%, 42% { opacity: 0; }
            58%, 82% { opacity: 1; }
            96%, 100% { opacity: 0; }
        }

        @keyframes noche-ciclo {
            0%, 42% { opacity: 0; }
            58%, 82% { opacity: .72; }
            96%, 100% { opacity: 0; }
        }

        .fondo .nube {
            position: absolute;
            background: rgba(255, 255, 255, .9);
            border-radius: 999px;
            box-shadow:
                28px 8px 0 -4px rgba(255, 255, 255, .9),
                56px 0 0 -8px rgba(255, 255, 255, .9);
            filter: blur(.5px);
        }

        .fondo .n1 { top: 12%; left: 55%; width: 90px; height: 30px; animation: flotar 60s linear infinite; }
        .fondo .n2 { top: 22%; left: 78%; width: 60px; height: 22px; opacity: .8; animation: flotar 85s linear infinite; }
        .fondo .n3 { top: 7%; left: 30%; width: 70px; height: 24px; opacity: .7; animation: flotar 100s linear infinite; }

        @keyframes flotar {
            from { transform: translateX(0); }
            to { transform: translateX(-60vw); }
        }

        .fondo .ave {
            position: absolute;
            font-size: 26px;
            transform: scaleX(-1);
            animation: volar 26s linear infinite;
        }

        .fondo .a1 { top: 13%; animation-duration: 26s; }
        .fondo .a2 { top: 21%; font-size: 20px; animation-duration: 34s; animation-delay: -10s; }
        .fondo .a3 { top: 17%; font-size: 22px; animation-duration: 30s; animation-delay: -20s; }

        @keyframes volar {
            from { left: -8%; transform: translateY(0) scaleX(-1); }
            50% { transform: translateY(-26px) scaleX(-1); }
            to { left: 108%; transform: translateY(0) scaleX(-1); }
        }

        .fondo .bichito {
            position: absolute;
            font-size: 20px;
            animation: revolotear 13s ease-in-out infinite;
        }

        .fondo .b1 { bottom: 26%; left: 24%; }
        .fondo .b2 { bottom: 30%; left: 70%; animation-delay: -5s; }
        .fondo .b3 { bottom: 22%; left: 48%; animation-delay: -8s; }

        @keyframes revolotear {
            0% { transform: translate(0, 0) rotate(0); }
            25% { transform: translate(32px, -22px) rotate(8deg); }
            50% { transform: translate(0, -44px) rotate(0); }
            75% { transform: translate(-32px, -22px) rotate(-8deg); }
            100% { transform: translate(0, 0) rotate(0); }
        }

        .fondo .animal {
            position: absolute;
            bottom: 8%;
            font-size: 34px;
            transform: scaleX(-1);
            animation: pasear 50s linear infinite;
        }

        .fondo .oveja { font-size: 30px; bottom: 5%; animation-duration: 64s; animation-delay: -20s; }
        .fondo .cabra { font-size: 28px; bottom: 11%; animation-duration: 56s; animation-delay: -36s; }

        @keyframes pasear {
            from { left: -7%; transform: scaleX(-1); }
            50% { transform: scaleX(-1) translateY(-3px); }
            to { left: 107%; transform: scaleX(-1); }
        }

        .fondo .montanas {
            position: absolute;
            bottom: 40%;
            left: 0;
            width: 100%;
            height: 26%;
        }

        .fondo .pasto {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 46%;
            background:
                radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, .12), transparent 60%),
                repeating-linear-gradient(90deg, rgba(0, 0, 0, .05) 0 6px, transparent 6px 14px);
        }

        body.lluvia .fondo { filter: brightness(.78) saturate(.7); }

        /* ================= Header ================= */
        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 32px;
            background: linear-gradient(rgba(8, 22, 16, .7), rgba(8, 22, 16, 0));
            z-index: 20;
        }

        header h1 {
            margin: 0;
            font-size: 26px;
            letter-spacing: .5px;
            text-shadow: 0 2px 8px rgba(0, 0, 0, .5);
        }

        .logo { margin: 0; letter-spacing: .5px; }

        .logo .agro,
        .logo .o { color: #7ec850; }

        .logo .connect { color: #ffb060; }

        .logo .o { position: relative; display: inline-block; }

        .logo .hoja {
            position: absolute;
            left: 50%;
            top: 50%;
            width: .38em;
            height: .38em;
            transform: translate(-50%, -50%);
            fill: #7ec850;
        }

        .estado {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 15px;
        }

        .badge {
            background: rgba(8, 22, 16, .55);
            border: 1px solid rgba(255, 255, 255, .18);
            border-radius: 999px;
            padding: 6px 14px;
            backdrop-filter: blur(4px);
        }

        .punto {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ef4444;
            display: inline-block;
            margin-right: 6px;
        }

        .punto.on { background: var(--pasto); box-shadow: 0 0 10px var(--pasto); }

        .icono-btn {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, .18);
            background: rgba(8, 22, 16, .55);
            color: #eef2f5;
            font-size: 18px;
            cursor: pointer;
            backdrop-filter: blur(4px);
        }

        .icono-btn:hover { background: rgba(8, 22, 16, .8); }

        /* ================= Tablero ================= */
        .tablero {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: clamp(12px, 1.6vw, 24px);
            padding: 8px clamp(14px, 1.8vw, 28px) 14px;
            min-height: 0;
            z-index: 10;
        }

        main {
            flex: 1 1 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 0;
            height: 100%;
        }

        .campo {
            position: relative;
            width: min(1000px, 100%, calc((100dvh - 190px) * 10 / 7));
            aspect-ratio: 10 / 7;
            border-radius: 22px;
            overflow: hidden;
            background: #3f7d26;
            box-shadow: 0 20px 50px rgba(0, 0, 0, .35), inset 0 0 0 2px rgba(120, 85, 55, .45);
        }

        .campo-escena {
            position: absolute;
            inset: 0;
        }

        .campo-escena canvas {
            display: block;
        }

        .campo-cargando {
            position: absolute;
            inset: 0;
            display: grid;
            place-items: center;
            font-size: 15px;
            letter-spacing: .02em;
            color: rgba(255, 255, 255, .85);
            background: linear-gradient(180deg, #6aa93e, #3f7d26);
        }

        body.lluvia::before {
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
            background: repeating-linear-gradient(
                100deg,
                rgba(174, 194, 224, .18) 0px,
                rgba(174, 194, 224, .18) 1px,
                transparent 1px,
                transparent 8px
            );
            animation: lluvia .6s linear infinite;
            z-index: 5;
        }

        @keyframes lluvia {
            from { background-position: 0 0; }
            to { background-position: -80px 300px; }
        }

        /* ================= HUD (ranking + misiones) ================= */
        .hud {
            flex: 0 1 auto;
            width: clamp(142px, 14vw, 172px);
            min-width: 132px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 100%;
            overflow-y: auto;
            padding-right: 2px;
            scrollbar-width: thin;
        }

        .panel {
            background: rgba(8, 22, 16, .62);
            border: 1px solid rgba(255, 255, 255, .14);
            border-radius: 11px;
            padding: 8px 10px;
            backdrop-filter: blur(5px);
            box-shadow: 0 8px 22px rgba(0, 0, 0, .3);
        }

        .panel h2 {
            margin: 0 0 6px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: .8px;
            color: #cbe8b0;
        }

        .fila {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            padding: 2px 0;
        }

        .fila .pos { width: 14px; color: var(--pasto-claro); font-weight: 800; }
        .fila .quien { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fila .pts { font-weight: 700; color: #fde047; font-size: 11px; }
        .fila.lider .quien { color: #fde047; }

        .vacio { font-size: 11px; color: rgba(255, 255, 255, .5); }

        .mision { margin-bottom: 7px; }
        .mision:last-child { margin-bottom: 0; }
        .m-arriba { display: flex; justify-content: space-between; gap: 6px; font-size: 11px; margin-bottom: 3px; }
        .m-arriba .nombre { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .m-arriba .cuenta { color: var(--pasto-claro); font-weight: 700; }
        .barra { height: 5px; border-radius: 999px; background: rgba(255, 255, 255, .15); overflow: hidden; }
        .barra span { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #a3e635, #4ade80); transition: width .4s ease; }
        .mision.hecha { opacity: .7; }
        .mision.hecha .nombre { text-decoration: line-through; }

        /* ================= Banner ================= */
        .banner {
            position: fixed;
            top: 16%;
            left: 50%;
            transform: translateX(-50%) scale(.6);
            z-index: 60;
            padding: 16px 34px;
            border-radius: 18px;
            font-size: 30px;
            font-weight: 800;
            text-align: center;
            color: #fff;
            background: linear-gradient(135deg, #1f7a45, #2fa35c);
            box-shadow: 0 16px 40px rgba(0, 0, 0, .45);
            opacity: 0;
            pointer-events: none;
            transition: opacity .3s ease, transform .3s cubic-bezier(.34, 1.56, .64, 1);
        }

        .banner.visible { opacity: 1; transform: translateX(-50%) scale(1); }
        .banner.oro { background: linear-gradient(135deg, #d97706, #f59e0b); }
        .banner.rojo { background: linear-gradient(135deg, #b91c1c, #ef4444); }

        body.sacudir { animation: sacudir .45s ease; }

        @keyframes sacudir {
            0%, 100% { transform: translate(0, 0); }
            20% { transform: translate(-6px, 3px); }
            40% { transform: translate(6px, -3px); }
            60% { transform: translate(-4px, 2px); }
            80% { transform: translate(4px, -2px); }
        }

        /* ================= Toasts ================= */
        #toasts {
            position: fixed;
            bottom: 24px;
            left: 24px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 50;
        }

        .toast {
            background: rgba(8, 22, 16, .92);
            border: 1px solid rgba(163, 230, 53, .5);
            color: #eef2f5;
            padding: 10px 16px;
            border-radius: 10px;
            font-size: 15px;
            opacity: 1;
            transform: translateY(0);
            transition: opacity .4s ease, transform .4s ease;
        }

        .toast.fuera {
            opacity: 0;
            transform: translateY(10px);
        }

        footer {
            text-align: center;
            padding: 12px;
            font-size: 14px;
            color: rgba(255, 255, 255, .9);
            background: linear-gradient(rgba(8, 22, 16, 0), rgba(8, 22, 16, .65));
            z-index: 20;
        }

        footer code {
            background: rgba(0, 0, 0, .4);
            padding: 2px 8px;
            border-radius: 6px;
            color: var(--pasto-claro);
        }

        footer .tp-links {
            display: block;
            margin-top: 6px;
            font-size: 12px;
            color: rgba(255, 255, 255, .55);
        }

        footer .tp-links a {
            color: var(--pasto-claro);
            text-decoration: none;
            border-bottom: 1px dotted rgba(163, 230, 53, .5);
        }

        footer .tp-links a:hover {
            border-bottom-style: solid;
        }

        /* ================= Panel QR ================= */
        .qr-panel {
            flex: 0 1 auto;
            width: clamp(112px, 11vw, 138px);
            min-width: 104px;
            background: rgba(255, 255, 255, .95);
            color: #0f172a;
            border-radius: 12px;
            padding: 10px;
            text-align: center;
            box-shadow: 0 6px 18px rgba(0, 0, 0, .35);
            transition: transform .2s ease, box-shadow .2s ease;
        }

        .qr-panel:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 24px rgba(0, 0, 0, .45);
        }

        .qr-titulo {
            font-weight: 700;
            font-size: 12px;
            margin-bottom: 6px;
        }

        #qr {
            display: block;
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            margin: 0 auto;
            border-radius: 6px;
        }

        .qr-url {
            font-size: 9px;
            margin-top: 6px;
            word-break: break-all;
            color: #64748b;
        }
    </style>
</head>
<body>

<div class="fondo">
    <div class="noche"></div>
    <div class="estrellas"></div>
    <div class="sol"></div>
    <div class="luna"></div>
    <div class="nube n1"></div>
    <div class="nube n2"></div>
    <div class="nube n3"></div>
    <span class="ave a1">🐦</span>
    <span class="ave a2">🕊️</span>
    <span class="ave a3">🐦</span>
    <svg class="montanas" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 300 L180 110 L340 235 L520 70 L760 250 L980 120 L1200 300 Z" fill="#6b8b93"/>
        <path d="M0 300 L200 190 L430 300 Z" fill="#547681"/>
        <path d="M700 300 L900 175 L1200 300 Z" fill="#547681"/>
    </svg>
    <div class="pasto"></div>
    <span class="bichito b1">🦋</span>
    <span class="bichito b2">🐝</span>
    <span class="bichito b3">🦋</span>
    <span class="animal vaca">🐄</span>
    <span class="animal oveja">🐑</span>
    <span class="animal cabra">🐐</span>
</div>

<header>
    <h1 class="logo"><span class="agro">Agr</span><span class="o">o<svg class="hoja" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.05 8.05c-2.73 2.73-2.73 7.15-.02 9.88 1.47-3.4 4.09-6.24 7.36-7.93-2.77 2.34-4.71 5.61-5.39 9.32 2.6 1.23 5.8.78 7.95-1.37C19.43 14.47 20 4 20 4S9.53 4.57 6.05 8.05z"/></svg></span><span class="connect">Connect</span></h1>
    <div class="estado">
        <span class="badge" id="clima">☀️ Día despejado</span>
        <span class="badge">⚡ <span id="acciones">0</span> acciones</span>
        <span class="badge"><span class="punto" id="conexion"></span><span id="estado-texto">Conectando…</span></span>
        <button class="icono-btn" id="btn-sonido" title="Activar sonido">🔇</button>
        <button class="icono-btn" id="btn-full" title="Pantalla completa">⛶</button>
    </div>
</header>

<div class="tablero">
    <aside class="hud">
        <div class="panel">
            <h2>🏆 Ranking</h2>
            <div id="ranking-lista"></div>
        </div>
        <div class="panel">
            <h2>🎯 Misiones</h2>
            <div id="misiones-lista"></div>
        </div>
    </aside>

    <main>
        <div class="campo" id="campo">
            <div class="campo-escena" id="campo-escena">
                <div class="campo-cargando">Cargando el campo...</div>
            </div>
        </div>
    </main>

    <aside class="qr-panel">
        <div class="qr-titulo">📱 Entrá y jugá</div>
        <canvas id="qr" width="236" height="236" data-url="{{ $controlUrl }}"></canvas>
        <div class="qr-url">{{ $controlUrl }}</div>
    </aside>
</div>

<footer>
    Escaneá el QR y tocá <code>sembrar</code>, <code>regar</code> o <code>cosechar</code> para interactuar con el campo.
    <span class="tp-links">
        Demo del TP de WebSockets:
        <a href="{{ route('emisor') }}">Emisor</a> ·
        <a href="{{ route('receptor') }}">Receptor</a>
    </span>
</footer>

<div class="banner" id="banner"></div>

</body>
</html>
