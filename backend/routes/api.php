<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegistrationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\RequestController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [RegistrationController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

Route::apiResource('requests', RequestController::class)->middleware('auth:sanctum');