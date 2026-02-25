<?php

use App\Http\Controllers\StrategyController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application.
| These routes are loaded by the RouteServiceProvider within a group
| which contains the "web" middleware group.
|
*/

Route::get('/', function () {
    return redirect('/strategy');
});

Route::get('/strategy', [StrategyController::class, 'index'])->name('strategy');
