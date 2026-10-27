<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

#[Signature('campo:tunel {--puerto=8000 : Puerto local donde corre la app}')]
#[Description('Publica el campo con un tunel de Cloudflare y actualiza el QR del visor.')]
class PublicarCampo extends Command
{
    private const ARCHIVO = 'app/campo-tunel.txt';

    public function handle(): int
    {
        $binario = $this->buscarCloudflared();

        if ($binario === null) {
            $this->components->error('No se encontro cloudflared. Dejalo en C:\xampp\php\cloudflared.exe o instalalo en el PATH.');

            return self::FAILURE;
        }

        $puerto = (int) $this->option('puerto');
        $archivo = storage_path(self::ARCHIVO);

        @unlink($archivo);

        $this->components->info("Abriendo un tunel publico hacia http://localhost:{$puerto}");
        $this->line('  Deja esta ventana abierta mientras jugas. Ctrl+C para cerrar el tunel.');
        $this->newLine();

        $proceso = new Process([$binario, 'tunnel', '--url', "http://localhost:{$puerto}", '--no-autoupdate']);
        $proceso->setTimeout(null);
        $proceso->start();

        $salida = '';
        $anunciada = false;

        try {
            while ($proceso->isRunning()) {
                $salida .= $proceso->getIncrementalOutput().$proceso->getIncrementalErrorOutput();

                if (! $anunciada && preg_match('#https://[a-z0-9-]+\.trycloudflare\.com#i', $salida, $coincidencia)) {
                    $anunciada = true;
                    $url = $coincidencia[0];

                    file_put_contents($archivo, $url);

                    $this->newLine();
                    $this->components->info("URL publica: {$url}");
                    $this->components->twoColumnDetail('Visor (QR publico)', "{$url}/visor");
                    $this->components->twoColumnDetail('Control (celular)', "{$url}/control");
                    $this->newLine();
                    $this->line('  Recarga el visor para que el QR apunte a la URL publica.');
                }

                usleep(200000);
            }
        } finally {
            $proceso->stop();
            @unlink($archivo);
        }

        if (! $anunciada) {
            $this->components->error('El tunel termino antes de obtener una URL.');
            $this->line(trim($salida));

            return self::FAILURE;
        }

        $this->components->warn('Tunel cerrado.');

        return self::SUCCESS;
    }

    private function buscarCloudflared(): ?string
    {
        $rutas = [
            'C:\xampp\php\cloudflared.exe',
            base_path('cloudflared.exe'),
            base_path('cloudflared'),
        ];

        foreach ($rutas as $ruta) {
            if (is_file($ruta)) {
                return $ruta;
            }
        }

        $encontrado = trim((string) shell_exec('where cloudflared 2>NUL'));

        return $encontrado !== '' ? strtok($encontrado, "\r\n") : null;
    }
}
