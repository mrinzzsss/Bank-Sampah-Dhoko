<?php

use App\Http\Controllers\Auth\LoginOtpController;
use App\Http\Controllers\Auth\RegisterOtpController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::post('/login/otp/send', [LoginOtpController::class, 'sendOtp'])->name('login.otp.send');
Route::post('/login/otp/verify', [LoginOtpController::class, 'verifyAndLogin'])->name('login.otp.verify');

Route::post('/register/otp/send', [RegisterOtpController::class, 'sendOtp'])->name('register.otp.send');
Route::post('/register/otp/verify', [RegisterOtpController::class, 'verifyAndRegister'])->name('register.otp.verify');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__.'/admin.php';
require __DIR__.'/super_admin.php';
require __DIR__.'/nasabah.php';
require __DIR__.'/settings.php';
