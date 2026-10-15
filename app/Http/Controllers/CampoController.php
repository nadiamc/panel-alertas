<?php

namespace App\Http\Controllers;

use App\Events\AccionCampo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\View\View;

class CampoController extends Controller
{
    /**
     * Puntos base que otorga cada acción.
     */
    private const PUNTOS = [
        'sembrar' => 10,
        'regar' => 5,
        'cosechar' => 25,
        'tratar' => 8,
    ];

    private const RACHA_MS = 12000;

    private const PUNTOS_POR_NIVEL = 100;

    private const CACHE_KEY = 'campo.estado';

    public function visor(Request $request): View
    {
        return view('visor', [
            'controlUrl' => $this->controlUrl($request),
        ]);
    }

    public function control(): View
    {
        return view('control');
    }

    /**
     * Estado completo del campo (parcelas, jugadores y misiones) para que
     * las pantallas que se conectan tarde se pongan al día.
     */
    public function estado(): JsonResponse
    {
        return response()->json($this->estadoCampo());
    }

    public function accion(Request $request): RedirectResponse|JsonResponse
    {
        $data = $request->validate([
            'tipo' => ['required', 'string', 'in:sembrar,regar,cosechar,clima,plaga,tratar'],
            'parcela' => ['required', 'integer', 'min:0', 'max:99'],
            'valor' => ['nullable', 'string', 'max:30'],
            'autor' => ['nullable', 'string', 'max:20'],
        ]);

        $estado = $this->estadoCampo();

        $tipo = $data['tipo'];
        $parcela = (int) $data['parcela'];
        $autor = trim((string) ($data['autor'] ?? '')) ?: 'Anónimo';

        $estado['acciones'] = (int) ($estado['acciones'] ?? 0) + 1;

        $parcelaEstado = $this->actualizarParcela($estado, $tipo, $parcela, $data['valor'] ?? null, $autor);
        $resultado = $this->puntuar($estado, $tipo, $autor);

        Cache::put(self::CACHE_KEY, $estado, now()->addHours(8));

        broadcast(new AccionCampo(
            $tipo,
            $parcela,
            $data['valor'] ?? null,
            $data['autor'] ?? null,
            $resultado['ganados'],
            $resultado['puntos'],
            $resultado['nivel'],
            $resultado['racha'],
            $this->rankingPlano($estado['jugadores']),
            $estado['misiones'],
            $parcelaEstado,
            $estado['acciones'],
        ));

        if ($request->expectsJson()) {
            return response()->json(['ok' => true, 'ganados' => $resultado['ganados']]);
        }

        return back()->with('ok', 'Acción enviada al campo.');
    }

    /**
     * @return array{parcelas: array<int, array{cultivo: ?string, autor: ?string, plaga: bool}>, jugadores: array<string, array<string, int>>, misiones: array<int, array<string, mixed>>, acciones: int}
     */
    private function estadoCampo(): array
    {
        $estado = Cache::get(self::CACHE_KEY);

        if (! is_array($estado) || ! isset($estado['misiones'])) {
            $estado = [
                'parcelas' => [],
                'jugadores' => [],
                'misiones' => $this->misionesBase(),
                'acciones' => 0,
            ];
        }

        return $estado;
    }

    /**
     * @return array<int, array{texto: string, tipo: string, meta: int, progreso: int, completada: bool}>
     */
    private function misionesBase(): array
    {
        return [
            ['texto' => 'Regar 5 parcelas', 'tipo' => 'regar', 'meta' => 5, 'progreso' => 0, 'completada' => false],
            ['texto' => 'Cosechar 3 cultivos', 'tipo' => 'cosechar', 'meta' => 3, 'progreso' => 0, 'completada' => false],
            ['texto' => 'Sembrar en 6 parcelas', 'tipo' => 'sembrar', 'meta' => 6, 'progreso' => 0, 'completada' => false],
            ['texto' => 'Salvar 2 parcelas de plaga', 'tipo' => 'tratar', 'meta' => 2, 'progreso' => 0, 'completada' => false],
        ];
    }

    /**
     * Aplica el cambio de la acción sobre la parcela y devuelve su estado.
     *
     * @param  array<string, mixed>  $estado
     * @return array{cultivo: ?string, autor: ?string, plaga: bool}|null
     */
    private function actualizarParcela(array &$estado, string $tipo, int $parcela, ?string $valor, string $autor): ?array
    {
        switch ($tipo) {
            case 'sembrar':
                $estado['parcelas'][$parcela] = ['cultivo' => $valor, 'autor' => $autor, 'plaga' => false];
                break;

            case 'cosechar':
                unset($estado['parcelas'][$parcela]);
                break;

            case 'plaga':
                if (! empty($estado['parcelas'][$parcela])) {
                    $estado['parcelas'][$parcela]['plaga'] = true;
                }
                break;

            case 'tratar':
                if (! empty($estado['parcelas'][$parcela])) {
                    $estado['parcelas'][$parcela]['plaga'] = false;
                }
                break;
        }

        return $estado['parcelas'][$parcela] ?? null;
    }

    /**
     * Suma puntos según la acción, la racha reciente y las misiones.
     *
     * @param  array<string, mixed>  $estado
     * @return array{ganados: int, puntos: int, nivel: int, racha: int}
     */
    private function puntuar(array &$estado, string $tipo, string $autor): array
    {
        $base = self::PUNTOS[$tipo] ?? 0;

        if ($base <= 0) {
            $jugador = $estado['jugadores'][$autor] ?? ['puntos' => 0, 'nivel' => 1, 'racha' => 0];

            return [
                'ganados' => 0,
                'puntos' => (int) ($jugador['puntos'] ?? 0),
                'nivel' => (int) ($jugador['nivel'] ?? 1),
                'racha' => (int) ($jugador['racha'] ?? 0),
            ];
        }

        $ahora = (int) round(microtime(true) * 1000);

        $jugador = $estado['jugadores'][$autor] ?? [
            'puntos' => 0,
            'nivel' => 1,
            'racha' => 0,
            'ultima' => 0,
            'acciones' => 0,
        ];

        $jugador['racha'] = ($ahora - (int) ($jugador['ultima'] ?? 0) < self::RACHA_MS)
            ? (int) $jugador['racha'] + 1
            : 1;
        $jugador['ultima'] = $ahora;

        $multiplicador = 1;

        if ($jugador['racha'] >= 3) {
            $multiplicador *= 2;
        }

        if ($tipo === 'cosechar') {
            $multiplicador *= 2;
        }

        $ganados = $base * $multiplicador;

        $jugador['puntos'] = (int) $jugador['puntos'] + $ganados;
        $jugador['acciones'] = (int) ($jugador['acciones'] ?? 0) + 1;
        $jugador['nivel'] = intdiv($jugador['puntos'], self::PUNTOS_POR_NIVEL) + 1;

        $estado['jugadores'][$autor] = $jugador;

        foreach ($estado['misiones'] as $i => $mision) {
            if (! $mision['completada'] && $mision['tipo'] === $tipo) {
                $estado['misiones'][$i]['progreso']++;
                $estado['misiones'][$i]['completada'] = $estado['misiones'][$i]['progreso'] >= $mision['meta'];
            }
        }

        return [
            'ganados' => $ganados,
            'puntos' => $jugador['puntos'],
            'nivel' => $jugador['nivel'],
            'racha' => $jugador['racha'],
        ];
    }

    /**
     * Reduce los jugadores a los datos que necesita el ranking.
     *
     * @param  array<string, array<string, int>>  $jugadores
     * @return array<string, array{puntos: int, nivel: int}>
     */
    private function rankingPlano(array $jugadores): array
    {
        $ranking = [];

        foreach ($jugadores as $nombre => $jugador) {
            $ranking[$nombre] = [
                'puntos' => (int) ($jugador['puntos'] ?? 0),
                'nivel' => (int) ($jugador['nivel'] ?? 1),
            ];
        }

        return $ranking;
    }

    /**
     * Construye la URL del control accesible desde Internet o desde la red local,
     * para que los celulares del público puedan escanear el QR.
     *
     * Prioridad:
     * 1. Parámetro ?publico= (URL del túnel de Cloudflare u otro host público).
     * 2. APP_URL cuando no apunta a un host local.
     * 3. La propia petición si no es local.
     * 4. La IP de red local (misma WiFi).
     */
    private function controlUrl(Request $request): string
    {
        $publica = $request->query('publico');

        if (is_string($publica) && $this->esUrlPublica($publica)) {
            return rtrim($publica, '/').'/control';
        }

        $appUrl = (string) config('app.url');

        if ($appUrl !== '' && ! $this->esHostLocal((string) parse_url($appUrl, PHP_URL_HOST))) {
            return rtrim($appUrl, '/').'/control';
        }

        $host = $request->getHttpHost();

        if (! $this->esHostLocal($host)) {
            return $request->getScheme().'://'.$host.'/control';
        }

        $ip = gethostbyname(gethostname());

        if (! $this->esHostLocal($ip)) {
            return 'http://'.$ip.':'.$request->getPort().'/control';
        }

        return $request->getScheme().'://'.$host.'/control';
    }

    private function esUrlPublica(string $url): bool
    {
        $scheme = parse_url($url, PHP_URL_SCHEME);
        $host = parse_url($url, PHP_URL_HOST);

        return in_array($scheme, ['http', 'https'], true) && is_string($host) && $host !== '';
    }

    private function esHostLocal(string $host): bool
    {
        $nombre = strtolower(explode(':', $host)[0]);

        return in_array($nombre, ['localhost', '127.0.0.1', '0.0.0.0', '::1'], true);
    }
}
