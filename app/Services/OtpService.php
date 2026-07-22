<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OtpService
{
    /**
     * Generate 6-digit OTP code and save it in Cache for 5 minutes.
     */
    public function generateOtp(string $phoneNumber): string
    {
        $code = (string) rand(100000, 999999);
        $key = $this->getCacheKey($phoneNumber);

        // Store OTP code for 5 minutes (300 seconds)
        Cache::put($key, [
            'code' => $code,
            'attempts' => 0,
        ], 300);

        return $code;
    }

    /**
     * Verify the entered OTP code for a given phone number.
     */
    public function verifyOtp(string $phoneNumber, string $inputCode): bool
    {
        $key = $this->getCacheKey($phoneNumber);
        $cached = Cache::get($key);

        if (! $cached) {
            return false;
        }

        if ($cached['code'] === trim($inputCode)) {
            Cache::forget($key);
            return true;
        }

        // Increment attempts
        $cached['attempts'] += 1;
        if ($cached['attempts'] >= 5) {
            Cache::forget($key);
        } else {
            Cache::put($key, $cached, 300);
        }

        return false;
    }

    /**
     * Send OTP via configured provider (mock, fonnte, or twilio).
     */
    public function sendOtp(string $phoneNumber, string $code): array
    {
        $provider = config('services.otp.provider', 'fonnte');

        if ($provider === 'fonnte') {
            return $this->sendViaFonnte($phoneNumber, $code);
        }

        // Default mock / log mode for local development
        Log::info("MOCK OTP SENT to {$phoneNumber}: Kode OTP Anda adalah {$code}");

        return [
            'success' => true,
            'message' => 'Kode OTP berhasil dikirim (Mock Mode)',
            'debug_code' => $code,
        ];
    }

    /**
     * Send OTP via Fonnte WhatsApp Gateway API.
     */
    protected function sendViaFonnte(string $phoneNumber, string $code): array
    {
        $token = config('services.otp.fonnte_token');
        if (! $token) {
            Log::warning("Fonnte Token is missing in .env. Falling back to Mock OTP: {$code}");
            return [
                'success' => true,
                'message' => 'Token Fonnte belum diisi di .env. Kode OTP (Mock): '.$code,
                'debug_code' => $code,
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target' => $phoneNumber,
                'message' => "Kode OTP pendaftaran Bank Sampah Anda adalah:\n\n*`{$code}`*\n\nBerlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.",
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Kode OTP berhasil dikirim via WhatsApp!',
                ];
            }

            Log::error("Fonnte API Error: ".$response->body());
            return [
                'success' => false,
                'message' => 'Gagal mengirim OTP via WhatsApp. Silakan coba lagi.',
                'debug_code' => $code,
            ];
        } catch (\Exception $e) {
            Log::error("Fonnte Exception: ".$e->getMessage());
            return [
                'success' => false,
                'message' => 'Terjadi kesalahan pengiriman OTP: '.$e->getMessage(),
                'debug_code' => $code,
            ];
        }
    }

    protected function getCacheKey(string $phoneNumber): string
    {
        // Sanitize phone number (only digits)
        $cleanPhone = preg_replace('/[^0-9]/', '', $phoneNumber);
        return "otp_reg_".$cleanPhone;
    }
}
