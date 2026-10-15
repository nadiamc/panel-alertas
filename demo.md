# Demo — Campo Vivo (AgroConnect)

Guía rápida para levantar la demo y probarla desde el celular.

## Antes de empezar
- La PC tiene que quedar **encendida y sin dormirse** (Configuración → Energía → Suspensión: **Nunca**).
- Abrí **tres terminales** en `C:\xampp\htdocs\panel-alertas`.

## Terminal 1 — Servidor web
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

## Terminal 2 — Servidor de WebSockets
```bash
php artisan reverb:start --host=0.0.0.0 --port=8080
```

## Terminal 3 — Túnel (para acceso desde cualquier red)
```bash
cloudflared tunnel --url http://localhost:8000
```
Cuando arranca, imprime una URL parecida a:
```
https://algo-aleatorio.trycloudflare.com
```
⚠️ Esta URL **cambia cada vez** que reiniciás el túnel.

## Abrir el visor
Usá la URL del túnel en el parámetro `publico` para que el QR apunte a Internet:
```
http://127.0.0.1:8000/visor?publico=https://algo-aleatorio.trycloudflare.com
```

El público escanea el QR → entra a `/control` desde el celular → escribe su nombre → juega.

## Resetear el campo (arrancar en cero)
```bash
php artisan cache:clear
```

## Rutas útiles
| Ruta | Qué es |
| --- | --- |
| `/visor` | Pantalla grande (se abre en la PC). |
| `/control` | Control remoto (celular). |
| `/emisor` y `/receptor` | Demo original del TP (estilo en remoto). |

## Si algo no anda
- **No se actualiza en el celular** → esperá 1-2 s (usa polling) y verificá que la Terminal 1 siga viva.
- **El QR no abre** → revisá que la URL del túnel esté bien pegada en `?publico=`.
- **No aparece "En vivo" en el visor** → fijate que la Terminal 2 (reverb) esté corriendo.
- **"Unable to locate file in Vite manifest"** → corré `npm run build`.
