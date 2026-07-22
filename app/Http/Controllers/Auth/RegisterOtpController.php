<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class RegisterOtpController extends Controller
{
    protected OtpService $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Send OTP code for registration.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone_number' => ['required', 'string', 'min:10', 'regex:/^[0-9+]+$/', 'unique:users,phone_number'],
        ], [
            'phone_number.required' => 'Nomor HP wajib diisi.',
            'phone_number.min' => 'Nomor HP minimal 10 digit.',
            'phone_number.regex' => 'Format nomor HP tidak valid (hanya angka).',
            'phone_number.unique' => 'Nomor HP sudah terdaftar. Silakan login.',
        ]);

        $phoneNumber = $validated['phone_number'];
        $code = $this->otpService->generateOtp($phoneNumber);
        $result = $this->otpService->sendOtp($phoneNumber, $code);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'debug_code' => $result['debug_code'] ?? null,
        ]);
    }

    /**
     * Verify OTP code and register user.
     */
    public function verifyAndRegister(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'min:10', 'regex:/^[0-9+]+$/', 'unique:users,phone_number'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'otp_code' => ['required', 'string', 'size:6'],
        ], [
            'phone_number.required' => 'Nomor HP wajib diisi.',
            'phone_number.min' => 'Nomor HP minimal 10 digit.',
            'phone_number.unique' => 'Nomor HP sudah terdaftar.',
            'otp_code.required' => 'Kode OTP wajib diisi.',
            'otp_code.size' => 'Kode OTP harus 6 digit.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $isValid = $this->otpService->verifyOtp($validated['phone_number'], $validated['otp_code']);

        if (! $isValid) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'otp_code' => ['Kode OTP yang Anda masukkan salah atau sudah kadaluarsa.'],
                ],
            ], 422);
        }

        // Create new Nasabah user
        $user = User::create([
            'name' => $validated['name'],
            'phone_number' => $validated['phone_number'],
            'password' => Hash::make($validated['password']),
            'role' => 'nasabah',
        ]);

        // Assign Spatie Role 'nasabah' if Spatie is installed
        if (method_exists($user, 'assignRole')) {
            $user->assignRole('nasabah');
        }

        // Auto login
        Auth::login($user);

        return response()->json([
            'success' => true,
            'redirect' => route('dashboard'),
        ]);
    }
}
