<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginOtpController extends Controller
{
    protected OtpService $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Send OTP code for login.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone_number' => ['required', 'string', 'min:10', 'regex:/^[0-9+]+$/', 'exists:users,phone_number'],
        ], [
            'phone_number.required' => 'Nomor HP wajib diisi.',
            'phone_number.min' => 'Nomor HP minimal 10 digit.',
            'phone_number.regex' => 'Format nomor HP tidak valid (hanya angka).',
            'phone_number.exists' => 'Nomor HP belum terdaftar di sistem.',
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
     * Verify OTP code and authenticate user.
     */
    public function verifyAndLogin(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'phone_number' => ['required', 'string', 'min:10', 'exists:users,phone_number'],
            'otp_code' => ['required', 'string', 'size:6'],
        ], [
            'phone_number.required' => 'Nomor HP wajib diisi.',
            'phone_number.exists' => 'Nomor HP tidak ditemukan.',
            'otp_code.required' => 'Kode OTP wajib diisi.',
            'otp_code.size' => 'Kode OTP harus 6 digit.',
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

        $user = User::where('phone_number', $validated['phone_number'])->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'phone_number' => ['Pengguna tidak ditemukan.'],
                ],
            ], 404);
        }

        Auth::login($user);
        $request->session()->regenerate();

        $redirectUrl = match ($user->role) {
            'super_admin' => route('super_admin.dashboard'),
            'admin' => route('admin.transactions.index'),
            default => route('nasabah.dashboard'),
        };

        return response()->json([
            'success' => true,
            'redirect' => $redirectUrl,
        ]);
    }
}
