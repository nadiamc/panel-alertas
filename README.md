# AgroConnect — Campo Vivo

Aplicación web hecha con **Laravel** que sincroniza en **tiempo real** lo que hace un celular con una pantalla grande, usando **WebSockets** con **Laravel Reverb**. El público escanea un QR, entra desde el celular y cada acción (sembrar, regar, cosechar…) se refleja al instante en el visor, con puntos, niveles, rachas, misiones y ranking.

## Demo en vivo

- `/visor` → pantalla grande (se abre en la PC).
- `/control` → control remoto en el celular (se llega escaneando el QR del visor).

## ¿Qué demuestra?

El eje del trabajo es el **broadcasting / comunicación en tiempo real**:

- Un dispositivo **emite** una acción y el servidor la **difunde** a todos los que escuchan un **canal**.
- El emisor **no conoce** a los receptores: se comunican a través del servidor (arquitectura desacoplada).
- Dos estrategias para mantener la pantalla al día: **WebSockets** (instantáneo) y **polling** (consultar cada tanto).

## Cómo funciona (flujo)

1. El **visor** (pantalla grande) muestra un campo con 24 parcelas y un **QR**.
2. El público **escanea el QR**, entra a `/control` desde el celular y escribe su nombre.
3. Toca una parcela y una acción. El celular hace un **POST** a `/campo/accion`.
4. El **servidor** valida, actualiza el **estado** (parcelas, puntos, misiones) y **emite el evento** `AccionCampo` al canal `campo`.
5. **Reverb** (servidor WebSocket) lo difunde a todos los conectados.
6. El **visor** lo recibe al instante con **Laravel Echo** y actualiza parcela, ranking y misiones (con efectos).
7. El celular, que no puede abrir el WebSocket desde afuera, se sincroniza con **polling** a `/campo/estado` cada 1,2 s.

## Tecnologías

- **Laravel 13** + **PHP 8.4**
- **Laravel Reverb** — servidor WebSocket (protocolo compatible con Pusher)
- **Laravel Echo** + **pusher-js** en el frontend
- **Blade + Vite + Tailwind CSS** y JavaScript
- **Cache (store `database`)** como fuente de verdad del estado
- **QR** para el acceso de los celulares y **túnel de Cloudflare** para entrar desde cualquier red

## Requisitos

- PHP 8.4+ y Composer
- Node.js + npm
- Una base de datos configurada (se usa para sesión y cache)

## Instalación

```bash
composer install
copy .env.example .env        # Windows (o: cp .env.example .env)
php artisan key:generate
npm install
php artisan migrate
npm run build                  # o: npm run dev
```

## Ejecutar la demo

Se necesitan tres terminales:

```bash
# 1) Servidor web
php artisan serve --host=0.0.0.0 --port=8000

# 2) Servidor de WebSockets
php artisan reverb:start --host=0.0.0.0 --port=8080

# 3) Túnel para acceso desde cualquier red (opcional)
cloudflared tunnel --url http://localhost:8000
```

Abrí el visor apuntando el QR a la URL pública del túnel:

```
http://127.0.0.1:8000/visor?publico=https://<tu-tunel>.trycloudflare.com
```

## Estructura y archivos clave

| Archivo | Rol |
| --- | --- |
| `routes/web.php` | Definición de rutas. |
| `app/Http/Controllers/CampoController.php` | Validación, puntaje, estado en cache y `broadcast(...)`. |
| `app/Events/AccionCampo.php` | Evento que se transmite (`ShouldBroadcast`). |
| `app/Events/RemoteStyleUpdate.php` | Primera versión del TP (emisor/receptor de estilo en remoto). |
| `resources/js/echo.js` | Configuración de Echo / Reverb. |
| `resources/js/campo-logica.js` | Lógica compartida (cultivos + simulación de parcelas). |
| `resources/js/campo.js` | Comportamiento del visor. |
| `resources/js/control.js` | Comportamiento del control (celular). |
| `resources/views/visor.blade.php` | Vista de la pantalla grande. |
| `resources/views/control.blade.php` | Vista del control remoto. |

## Dos demos incluidas

- **Campo Vivo** — `/visor` + `/control`, canal `campo`, evento `AccionCampo`.
- **TP original** — `/emisor` + `/receptor`, canal `style-channel`, evento `RemoteStyleUpdate`.

## Notas técnicas y decisiones

- **¿Por qué Reverb y no Pusher?** Reverb es el servidor WebSocket **oficial y self-hosted** de Laravel; no depende de un servicio externo.
- **¿Por qué hay polling en el celular?** El WebSocket vive en `127.0.0.1:8080` y no es alcanzable a través del túnel; el celular consulta `/campo/estado` para mantenerse sincronizado y funciona igual.
- **¿Dónde se guarda el puntaje?** En el **servidor** (cache), no en el navegador, así todos los dispositivos ven el mismo resultado.
- **Estado autoritativo en el servidor:** los puntos, niveles y misiones se calculan en el backend para evitar inconsistencias y trampas desde el front.
- **Seguridad:** validación en el servidor, token **CSRF** en los POST y `trustProxies` para funcionar detrás del túnel.
- **Canales públicos:** es una demo abierta al público; un canal privado necesitaría autenticación por usuario.

### Dificultades resueltas

- El **firewall de Windows** bloqueaba el puerto → se usó un **túnel**.
- El **WebSocket no era accesible** desde afuera → **polling** en el celular.
- El navegador marcaba **"formulario no seguro"** (mixed content) → `trustProxies` + `action` relativo.

## Licencia

Proyecto educativo. Construido sobre [Laravel](https://laravel.com), licencia MIT.
