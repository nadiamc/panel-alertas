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

        /* ================= Campo ================= */
        main {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px 28px;
            z-index: 10;
        }

        .campo {
            width: min(1000px, 90vw);
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 12px;
            padding: 14px;
            border-radius: 22px;
            background: linear-gradient(180deg, rgba(61, 40, 24, .28), rgba(61, 40, 24, .42));
            box-shadow: 0 20px 50px rgba(0, 0, 0, .35), inset 0 0 0 2px rgba(120, 85, 55, .45);
            backdrop-filter: blur(2px);
        }

        .parcela {
            position: relative;
            container-type: inline-size;
            aspect-ratio: 1 / 1;
            border-radius: 12px;
            overflow: hidden;
            background:
                radial-gradient(circle at 30% 26%, rgba(255, 235, 200, .12), transparent 55%),
                radial-gradient(circle at 78% 82%, rgba(0, 0, 0, .22), transparent 60%),
                repeating-linear-gradient(90deg,
                    #6f4c30 0px,
                    #6f4c30 9px,
                    #5a3c26 9px,
                    #5a3c26 18px
                );
            border: 1px solid rgba(0, 0, 0, .35);
            box-shadow:
                inset 0 3px 6px rgba(0, 0, 0, .35),
                inset 0 -6px 12px rgba(0, 0, 0, .35),
                0 4px 10px rgba(0, 0, 0, .35);
            transition: transform .15s ease, box-shadow .15s ease;
        }

        .parcela:hover {
            transform: translateY(-3px);
            box-shadow:
                inset 0 3px 6px rgba(0, 0, 0, .35),
                inset 0 -6px 12px rgba(0, 0, 0, .35),
                0 10px 22px rgba(0, 0, 0, .45);
        }

        .parcela .num {
            position: absolute;
            top: 5px;
            left: 7px;
            z-index: 3;
            font-size: 11px;
            font-weight: 700;
            color: rgba(255, 255, 255, .85);
            background: rgba(0, 0, 0, .35);
            padding: 1px 7px;
            border-radius: 999px;
        }

        .parcela .agronomo {
            position: absolute;
            left: 50%;
            bottom: 2%;
            z-index: 3;
            font-size: 30px;
            font-size: 36cqw;
            line-height: 1;
            transform: translateX(-50%) translateY(10px) scale(.4);
            opacity: 0;
            filter: drop-shadow(0 5px 5px rgba(0, 0, 0, .45));
            transition: opacity .3s ease, transform .55s cubic-bezier(.34, 1.56, .64, 1);
            pointer-events: none;
        }

        .parcela.ocupada .agronomo {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
        }

        .parcela .bicho {
            position: absolute;
            top: 6px;
            right: 7px;
            z-index: 4;
            font-size: 20px;
            opacity: 0;
            transform: scale(.4);
            transition: opacity .2s ease, transform .2s ease;
        }

        .parcela.plaga .bicho {
            opacity: 1;
            transform: scale(1);
            animation: bicho-mueve .6s ease-in-out infinite alternate;
        }

        @keyframes bicho-mueve {
            from { transform: scale(1) translateY(0) rotate(-6deg); }
            to { transform: scale(1) translateY(2px) rotate(6deg); }
        }

        .planta {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 92%;
            opacity: 0;
            transform-origin: 50% 100%;
            transform: scaleY(.25);
            transition: transform .55s cubic-bezier(.34, 1.3, .64, 1), opacity .4s ease;
            filter: drop-shadow(0 3px 2px rgba(0, 0, 0, .35));
            z-index: 2;
        }

        .planta .tallo {
            fill: none;
            stroke: #3f7d2c;
            stroke-width: 4;
            stroke-linecap: round;
        }

        .planta .hoja {
            fill: #5aa83a;
            opacity: 0;
            transition: opacity .45s ease;
            transform-box: fill-box;
            transform-origin: center;
        }

        .parcela[data-stage="1"] .planta { opacity: 1; transform: scaleY(.4); }
        .parcela[data-stage="2"] .planta { opacity: 1; transform: scaleY(.66); }
        .parcela[data-stage="3"] .planta { opacity: 1; transform: scaleY(.88); }
        .parcela[data-stage="4"] .planta { opacity: 1; transform: scaleY(1); }

        .parcela[data-stage="1"] .hoja-1 { opacity: 1; }
        .parcela[data-stage="2"] .hoja-1,
        .parcela[data-stage="2"] .hoja-2 { opacity: 1; }
        .parcela[data-stage="3"] .hoja-1,
        .parcela[data-stage="3"] .hoja-2,
        .parcela[data-stage="3"] .hoja-3 { opacity: 1; }
        .parcela[data-stage="4"] .hoja { opacity: 1; }

        .parcela .fruta {
            position: absolute;
            top: 8%;
            left: 50%;
            z-index: 3;
            font-size: 26px;
            line-height: 1;
            opacity: 0;
            transform: translateX(-50%) scale(.4);
            transition: opacity .3s ease, transform .45s cubic-bezier(.34, 1.56, .64, 1);
            filter: drop-shadow(0 2px 3px rgba(0, 0, 0, .45));
            pointer-events: none;
        }

        .parcela[data-stage="1"] .fruta,
        .parcela[data-stage="2"] .fruta,
        .parcela[data-stage="3"] .fruta {
            opacity: .85;
            transform: translateX(-50%) scale(.7);
        }

        .parcela[data-stage="4"] .fruta {
            opacity: 1;
            transform: translateX(-50%) scale(1.3);
        }

        .parcela.plaga .fruta {
            filter: grayscale(1) brightness(.8) drop-shadow(0 2px 3px rgba(0, 0, 0, .45));
        }

        .parcela.plaga .planta { filter: grayscale(.55) brightness(.7) drop-shadow(0 3px 2px rgba(0, 0, 0, .35)); }

        .parcela.regada {
            background:
                radial-gradient(circle at 30% 26%, rgba(255, 235, 200, .08), transparent 55%),
                radial-gradient(circle at 78% 82%, rgba(0, 0, 0, .28), transparent 60%),
                repeating-linear-gradient(90deg,
                    #4b3520 0px,
                    #4b3520 9px,
                    #382718 9px,
                    #382718 18px
                );
        }

        .parcela.regada::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 1;
            background: radial-gradient(circle at 50% 125%, rgba(56, 189, 248, .55), transparent 68%);
            pointer-events: none;
        }

        .parcela.plaga {
            box-shadow:
                inset 0 0 0 3px #b91c1c,
                inset 0 3px 6px rgba(0, 0, 0, .4),
                inset 0 -6px 12px rgba(0, 0, 0, .4),
                0 4px 10px rgba(0, 0, 0, .35);
        }

        .parcela .autor {
            position: absolute;
            left: 6px;
            right: 6px;
            bottom: 6px;
            z-index: 5;
            padding: 2px 8px;
            border-radius: 999px;
            background: var(--pasto-claro);
            color: #08210f;
            font-size: 12px;
            font-weight: 700;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            opacity: 0;
            transform: translateY(6px);
            transition: opacity .25s ease, transform .25s ease;
            pointer-events: none;
        }

        .parcela .autor.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .puntos-pop {
            position: absolute;
            left: 50%;
            top: 34%;
            z-index: 7;
            font-weight: 800;
            font-size: 22px;
            color: #fde047;
            text-shadow: 0 2px 6px rgba(0, 0, 0, .65);
            pointer-events: none;
            transform: translate(-50%, 0);
            animation: punto-subir 1s ease-out forwards;
        }

        @keyframes punto-subir {
            to { transform: translate(-50%, -48px); opacity: 0; }
        }

        .chispa {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 6;
            animation: chispa .78s ease-out forwards;
        }

        @keyframes chispa {
            to {
                transform: translate(var(--dx), var(--dy)) scale(.2);
                opacity: 0;
            }
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
            position: fixed;
            left: 18px;
            top: 80px;
            z-index: 45;
            width: 172px;
            display: flex;
            flex-direction: column;
            gap: 8px;
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

        /* ================= Banner y confeti ================= */
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

        .confeti {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 70;
            overflow: hidden;
        }

        .confeti i {
            position: absolute;
            top: -24px;
            width: 10px;
            height: 14px;
            border-radius: 2px;
            animation: caer linear forwards;
        }

        @keyframes caer {
            to { transform: translateY(112vh) rotate(760deg); opacity: .9; }
        }

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

        /* ================= Panel QR ================= */
        .qr-panel {
            position: fixed;
            right: 18px;
            bottom: 18px;
            background: rgba(255, 255, 255, .95);
            color: #0f172a;
            border-radius: 12px;
            padding: 10px;
            text-align: center;
            box-shadow: 0 6px 18px rgba(0, 0, 0, .35);
            z-index: 40;
            width: 138px;
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
            width: 118px;
            height: 118px;
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
        @for ($i = 0; $i < 24; $i++)
            <div class="parcela" data-parcela="{{ $i }}" data-stage="0">
                <span class="num">{{ $i + 1 }}</span>
                <svg class="planta" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
                    <path class="tallo" d="M50 98 C 50 78, 50 58, 50 34" />
                    <ellipse class="hoja hoja-1" cx="32" cy="72" rx="15" ry="6" transform="rotate(-24 32 72)" />
                    <ellipse class="hoja hoja-2" cx="68" cy="64" rx="15" ry="6" transform="rotate(24 68 64)" />
                    <ellipse class="hoja hoja-3" cx="34" cy="50" rx="13" ry="5.5" transform="rotate(-24 34 50)" />
                    <ellipse class="hoja hoja-4" cx="66" cy="42" rx="13" ry="5.5" transform="rotate(24 66 42)" />
                </svg>
                <span class="fruta" data-fruta></span>
                <span class="bicho" aria-hidden="true">🐛</span>
                <span class="agronomo" aria-hidden="true"></span>
                <span class="autor"></span>
            </div>
        @endfor
    </div>
</main>

<footer>
    Escaneá el QR y tocá <code>sembrar</code>, <code>regar</code> o <code>cosechar</code> para interactuar con el campo.
</footer>

<div class="qr-panel">
    <div class="qr-titulo">📱 Entrá y jugá</div>
    <canvas id="qr" width="118" height="118" data-url="{{ $controlUrl }}"></canvas>
    <div class="qr-url">{{ $controlUrl }}</div>
</div>

<div class="banner" id="banner"></div>
<div class="confeti" id="confeti"></div>

</body>
</html>
