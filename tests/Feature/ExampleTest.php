<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * La raíz redirige a la pantalla grande del juego.
     */
    public function test_la_raiz_redirige_al_visor(): void
    {
        $this->get('/')->assertRedirect('/visor');
    }
}
