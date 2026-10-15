<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class AccionCampo implements ShouldBroadcast
{
    /**
     * @param  array<string, array{puntos: int, nivel: int}>  $jugadores
     * @param  array<int, array{texto: string, tipo: string, meta: int, progreso: int, completada: bool}>  $misiones
     * @param  array{cultivo: ?string, autor: ?string, plaga: bool}|null  $parcelaEstado
     */
    public function __construct(
        public string $tipo,
        public int $parcela,
        public ?string $valor = null,
        public ?string $autor = null,
        public int $ganados = 0,
        public int $puntos = 0,
        public int $nivel = 1,
        public int $racha = 0,
        public array $jugadores = [],
        public array $misiones = [],
        public ?array $parcelaEstado = null,
        public int $acciones = 0,
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('campo')];
    }

    public function broadcastAs(): string
    {
        return 'AccionCampo';
    }
}
