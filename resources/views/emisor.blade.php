<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgroConnect — Emisor</title>

    @vite(['resources/css/app.css','resources/js/app.js'])

    <style>
        :root {
            --tierra: #3f5a35;
            --tierra-oscura: #24381e;
            --pasto: #4ade80;
            --pasto-claro: #a3e635;
            --fondo: #08150f;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: "Segoe UI", system-ui, sans-serif;
            background: radial-gradient(circle at 50% 0%, #14372a 0%, var(--fondo) 70%);
            color: #eef2f5;
        }

        .wrap {
            max-width: 720px;
            margin: 0 auto;
            padding: 28px 16px 48px;
        }

        .barra-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
            margin-bottom: 18px;
        }

        h1 {
            font-size: 26px;
            margin: 0 0 6px;
        }

        .logo .agro,
        .logo .o { color: var(--pasto); }

        .logo .connect { color: #fb923c; }

        .sub {
            margin: 0;
            font-size: 14px;
            color: rgba(255, 255, 255, .6);
        }

        .nav {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .nav a {
            font-size: 13px;
            font-weight: 600;
            color: var(--pasto-claro);
            text-decoration: none;
            background: rgba(255, 255, 255, .08);
            border: 1px solid rgba(255, 255, 255, .14);
            border-radius: 999px;
            padding: 7px 12px;
            transition: background .15s ease, border-color .15s ease;
        }

        .nav a:hover {
            background: rgba(163, 230, 53, .16);
            border-color: rgba(163, 230, 53, .5);
        }

        .aviso {
            border-radius: 10px;
            padding: 11px 14px;
            margin-bottom: 14px;
            font-size: 14px;
        }

        .aviso.ok {
            background: rgba(74, 222, 128, .12);
            border: 1px solid rgba(74, 222, 128, .55);
            color: #bbf7d0;
        }

        .aviso.error {
            background: rgba(239, 68, 68, .12);
            border: 1px solid rgba(239, 68, 68, .55);
            color: #fecaca;
        }

        .card {
            background: rgba(11, 30, 21, .7);
            border: 1px solid rgba(255, 255, 255, .12);
            border-radius: 14px;
            padding: 18px;
        }

        label {
            display: block;
            font-weight: 600;
            font-size: 14px;
            margin: 0 0 6px;
        }

        label + label,
        input + label,
        textarea + label { margin-top: 16px; }

        input[type="text"],
        textarea {
            width: 100%;
            padding: 11px 12px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, .2);
            background: #12271b;
            color: #fff;
            font-size: 16px;
            font-family: inherit;
        }

        textarea {
            resize: vertical;
            min-height: 120px;
            font-family: ui-monospace, "Cascadia Code", Consolas, monospace;
            font-size: 13px;
            line-height: 1.5;
        }

        input:focus,
        textarea:focus {
            outline: 2px solid rgba(163, 230, 53, .55);
            outline-offset: 1px;
        }

        .ejemplos {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 10px;
            font-size: 12px;
            color: rgba(255, 255, 255, .55);
        }

        .ejemplos button {
            background: rgba(255, 255, 255, .08);
            border: 1px solid rgba(255, 255, 255, .16);
            color: #eef2f5;
            border-radius: 999px;
            padding: 5px 11px;
            font-size: 12px;
            cursor: pointer;
            transition: background .15s ease;
        }

        .ejemplos button:hover { background: rgba(255, 255, 255, .16); }

        .btn {
            width: 100%;
            margin-top: 18px;
            padding: 15px 10px;
            border: none;
            border-radius: 12px;
            background: var(--pasto);
            color: #08210f;
            font-size: 16px;
            font-weight: 800;
            cursor: pointer;
            transition: transform .1s ease, filter .15s ease;
        }

        .btn:hover { filter: brightness(1.08); }
        .btn:active { transform: scale(.98); }

        .hint {
            margin: 16px 0 0;
            font-size: 13px;
            color: rgba(255, 255, 255, .55);
            text-align: center;
        }

        .hint code {
            background: rgba(0, 0, 0, .4);
            padding: 2px 7px;
            border-radius: 6px;
            color: var(--pasto-claro);
        }
    </style>
</head>
<body>

<div class="wrap">
    <header class="barra-top">
        <div>
            <h1 class="logo"><span class="agro">Agr</span><span class="o">o</span><span class="connect">Connect</span> · Emisor</h1>
            <p class="sub">Emití un texto y un CSS inline; el receptor lo muestra al instante por WebSocket.</p>
        </div>

        <nav class="nav">
            <a href="{{ route('receptor') }}">Ver receptor →</a>
            <a href="{{ route('visor') }}">Ir al visor</a>
        </nav>
    </header>

    @if (session('ok'))
        <div class="aviso ok">✅ {{ session('ok') }}</div>
    @endif

    @if ($errors->any())
        <div class="aviso error">⚠️ {{ $errors->first() }}</div>
    @endif

    <form class="card" method="POST" action="{{ route('emitir') }}">
        @csrf

        <label for="newText">Texto a mostrar</label>
        <input
            id="newText"
            type="text"
            name="newText"
            value="{{ old('newText') }}"
            placeholder="Ej: Ahora atendiendo: A-037"
            required
            autofocus
        >

        <label for="newStyle">CSS inline (opcional)</label>
        <textarea
            id="newStyle"
            name="newStyle"
            rows="6"
            placeholder="Ej: background:#111;color:#fff;padding:24px;border-radius:16px;font-size:28px;text-align:center;"
        >{{ old('newStyle') }}</textarea>

        <div class="ejemplos">
            <span>Probar con:</span>
            <button type="button" data-ejemplo="alerta">Alerta roja</button>
            <button type="button" data-ejemplo="cartel">Cartel verde</button>
            <button type="button" data-ejemplo="limpiar">Limpiar CSS</button>
        </div>

        <button class="btn" type="submit">Emitir</button>
    </form>

    <p class="hint">Abrí <code>/receptor</code> en otra pestaña para ver los cambios en vivo.</p>
</div>

<script>
    const ejemplos = {
        alerta: 'width:80%;max-width:600px;margin:40px auto;padding:20px;background-color:#e02424;border:2px solid #b91c1c;border-radius:12px;box-shadow:0 4px 15px rgba(220,38,38,.5);color:#fff;font-family:"Segoe UI",sans-serif;text-align:center;font-size:28px;',
        cartel: 'width:80%;max-width:600px;margin:40px auto;padding:28px;background-color:#0f2916;border:2px solid #4ade80;border-radius:18px;color:#d9f99d;font-family:"Segoe UI",sans-serif;text-align:center;font-size:32px;',
    };

    document.querySelectorAll('[data-ejemplo]').forEach(function (boton) {
        boton.addEventListener('click', function () {
            const campo = document.getElementById('newStyle');
            const clave = boton.dataset.ejemplo;

            campo.value = clave === 'limpiar' ? '' : ejemplos[clave];
            campo.focus();
        });
    });
</script>

</body>
</html>
