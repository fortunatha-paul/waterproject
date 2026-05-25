<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegistrationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\UserController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [RegistrationController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);

Route::apiResource('requests', RequestController::class)->middleware('auth:sanctum');
Route::post('/requests/{id}/assign-inspector', [RequestController::class, 'assignInspector'])->middleware('auth:sanctum');

Route::get('/users', [UserController::class, 'index'])->middleware('auth:sanctum');

Route::get('/inspectors', function (Request $request) {
    return app(UserController::class)->index(new Request(['role' => 'inspector']));
})->middleware('auth:sanctum');
