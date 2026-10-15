<?php

use App\Http\Controllers\CampoController;
use App\Http\Controllers\RemoteStyleController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect('/visor'));

// Pantalla grande (Campo Vivo)
Route::get('/visor', [CampoController::class, 'visor'])->name('visor');

// Control remoto (celular)
Route::get('/control', [CampoController::class, 'control'])->name('control');
Route::get('/campo/estado', [CampoController::class, 'estado'])->name('campo.estado');
Route::post('/campo/accion', [CampoController::class, 'accion'])->name('campo.accion');

// Trabajo práctico original (emisor/receptor)
Route::get('/emisor', [RemoteStyleController::class, 'emisor'])->name('emisor');
Route::post('/emitir', [RemoteStyleController::class, 'emitir'])->name('emitir');
Route::get('/receptor', [RemoteStyleController::class, 'receptor'])->name('receptor');
