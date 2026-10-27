<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>AgroConnect — Receptor</title>

    @vite(['resources/css/app.css','resources/js/app.js'])

    <style>

        body{
            font-family:Arial;
            background:#101010;
            color:white;
            margin:0;
            height:100vh;

            display:flex;
            align-items:center;
            justify-content:center;
        }

        #target-div{
            text-align:center;
            font-size:40px;
        }

        .nav{
            position:fixed;
            top:14px;
            right:14px;
            display:flex;
            gap:8px;
        }

        .nav a{
            font-size:13px;
            font-weight:600;
            text-decoration:none;
            color:#a3e635;
            background:rgba(255,255,255,.08);
            border:1px solid rgba(255,255,255,.16);
            border-radius:999px;
            padding:7px 12px;
        }

        .nav a:hover{
            background:rgba(163,230,53,.16);
            border-color:rgba(163,230,53,.5);
        }

    </style>
</head>

<body>

<nav class="nav">
    <a href="{{ route('emisor') }}">← Emisor</a>
    <a href="{{ route('visor') }}">Visor</a>
</nav>

<div id="target-div">
    Esperando mensaje...
</div>

<script>

document.addEventListener('DOMContentLoaded', function(){

    const targetDiv =
        document.getElementById('target-div');

    window.Echo
        .channel('style-channel')
        .listen('.RemoteStyleUpdate', (e)=>{

            targetDiv.innerText =
                e.newText ?? '';

            targetDiv.style.cssText =
                e.newStyle ?? '';

        });

});

</script>

</body>
</html>
