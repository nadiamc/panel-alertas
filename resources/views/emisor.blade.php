<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Emisor</title>

    @vite(['resources/css/app.css','resources/js/app.js'])

    <style>
        body{
            font-family: Arial,sans-serif;
            padding:20px;
        }

        .contenedor{
            max-width:700px;
            margin:auto;
        }

        input, textarea, button{
            width:100%;
            padding:10px;
            margin-top:10px;
        }
    </style>
</head>
<body>

<div class="contenedor">

    <h1>Panel de Alertas</h1>

    <form method="POST" action="{{ route('emitir') }}">
        @csrf

        <input
            type="text"
            name="newText"
            placeholder="Escribir mensaje"
            required
        >

        <textarea
            name="newStyle"
            rows="5"
            placeholder="Ej: color:red;font-size:40px;"
        ></textarea>

        <button type="submit">
            Enviar
        </button>
    </form>

</div>

</body>
</html>