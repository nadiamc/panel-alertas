<?php

namespace Tests\Feature;

use App\Events\RemoteStyleUpdate;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class RemoteStyleTest extends TestCase
{
    public function test_emisor_carga(): void
    {
        $this->get('/emisor')->assertOk()->assertSee('Emitir');
    }

    public function test_receptor_carga(): void
    {
        $this->get('/receptor')->assertOk()->assertSee('Esperando mensaje');
    }

    public function test_emisor_muestra_confirmacion(): void
    {
        $this->withSession(['ok' => 'Mensaje emitido correctamente.'])
            ->get('/emisor')
            ->assertOk()
            ->assertSee('Mensaje emitido correctamente.');
    }

    public function test_emitir_valida_y_emite_evento(): void
    {
        Event::fake([RemoteStyleUpdate::class]);

        $response = $this->post('/emitir', [
            'newText' => 'Hola',
            'newStyle' => 'color:red;',
        ]);

        $response->assertRedirect()->assertSessionHas('ok');

        Event::assertDispatched(RemoteStyleUpdate::class, function (RemoteStyleUpdate $event): bool {
            return $event->newText === 'Hola'
                && $event->newStyle === 'color:red;';
        });
    }

    public function test_emitir_sin_texto_no_emite_evento(): void
    {
        Event::fake([RemoteStyleUpdate::class]);

        $response = $this->post('/emitir', [
            'newText' => '',
        ]);

        $response->assertSessionHasErrors('newText');

        Event::assertNotDispatched(RemoteStyleUpdate::class);
    }
}
