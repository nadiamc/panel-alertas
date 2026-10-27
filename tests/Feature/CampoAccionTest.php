<?php

namespace Tests\Feature;

use App\Events\AccionCampo;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class CampoAccionTest extends TestCase
{
    public function test_visor_carga(): void
    {
        $this->get('/visor')->assertOk()->assertSee('Connect');
    }

    public function test_control_carga(): void
    {
        $this->get('/control')->assertOk()->assertSee('Acción');
    }

    public function test_visor_usa_la_url_publica_indicada_en_el_qr(): void
    {
        $this->get('/visor?publico=https://demo.trycloudflare.com')
            ->assertOk()
            ->assertSee('https://demo.trycloudflare.com/control');
    }

    public function test_accion_valida_emite_evento_con_payload(): void
    {
        Event::fake([AccionCampo::class]);

        $response = $this->post('/campo/accion', [
            'tipo' => 'sembrar',
            'parcela' => 3,
            'valor' => 'trigo',
            'autor' => 'Ana',
        ]);

        $response->assertRedirect();

        Event::assertDispatched(AccionCampo::class, function (AccionCampo $event): bool {
            return $event->tipo === 'sembrar'
                && $event->parcela === 3
                && $event->valor === 'trigo'
                && $event->autor === 'Ana';
        });
    }

    public function test_tipo_invalido_no_emite_evento(): void
    {
        Event::fake([AccionCampo::class]);

        $response = $this->post('/campo/accion', [
            'tipo' => 'bailar',
            'parcela' => 1,
        ]);

        $response->assertSessionHasErrors('tipo');

        Event::assertNotDispatched(AccionCampo::class);
    }
}
