<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">

    <title>Receptor</title>

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

    </style>
</head>

<body>

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