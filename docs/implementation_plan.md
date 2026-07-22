# Implementation Plan - Autentikasi Nomor HP + OTP Register & Spatie Permissions

Pembaruan alur autentikasi aplikasi Bank Sampah dari **Email** menjadi **Nomor HP (minimal 10 digit)** untuk Register dan Login, serta integrasi **Spatie Roles & Permissions**.

---

## Ringkasan Alur Autentikasi Baru

1. **Login**: 
   * Input: **Nomor HP** (min. 10 digit) & **Password**.
   * **Tanpa OTP** saat login (langsung masuk ke dashboard jika nomor HP & password cocok).

2. **Register**:
   * Input: **Nama Lengkap**, **Nomor HP** (min. 10 digit), **Password**, & **Konfirmasi Password**.
   * **Menggunakan OTP Verifikasi**:
     1. Calon pengguna mengisi form pendaftaran.
     2. Sistem mengirimkan **6-digit kode OTP** ke Nomor HP (via WhatsApp Gateway / Mock Mode lokal).
     3. Pop-up / Dialog Verifikasi OTP muncul di layar register.
     4. Setelah kode OTP berhasil diverifikasi, akun terdaftar & otomatis login ke portal Nasabah (dengan Role Spatie `nasabah`).

3. **Spatie Roles & Permissions**:
   * Mengintegrasikan `spatie/laravel-permission` untuk role `super_admin`, `admin`, dan `nasabah`.

---

## Proposed Changes

### Database & Models

#### [MODIFY] Migration `users` table
- Memastikan `phone_number` unik, wajib diisi, dan minimal 10 digit (contoh: `081234567890`).
- Mengubah `email` menjadi nullable atau menggantikan identitas utama username di Fortify dari email ke `phone_number`.

#### [MODIFY] User Model (`app/Models/User.php`)
- Menambahkan trait `HasRoles` dari Spatie Permission (`Spatie\Permission\Traits\HasRoles`).
- Memastikan `phone_number` terdaftar di attribute `fillable`.

---

### Backend Components

#### [NEW] Package
- `spatie/laravel-permission`: Di-install & dikonfigurasi untuk manajemen hak akses/role.

#### [NEW] RegisterOtpController (`app/Http/Controllers/Auth/RegisterOtpController.php`)
- `sendOtp(Request $request)`: Validasi nomor HP (min 10 digit & belum terdaftar), generate kode 6-digit OTP, simpan ke Cache (5 menit), lalu panggil `OtpService`.
- `verifyAndRegister(Request $request)`: Memverifikasi kode 6-digit OTP. Jika valid, buat record user baru di database, tetapkan Spatie Role `nasabah`, dan lakukan `Auth::login()`.

#### [NEW] OtpService (`app/Services/OtpService.php`)
- Mengirim pesan OTP ke nomor HP pengguna.
- Mendukung provider **`mock`** (tampil di log / dialog pengujian tanpa biaya) dan provider **`fonnte`** / **`twilio`** untuk integrasi WhatsApp nyata.

#### [MODIFY] FortifyServiceProvider (`app/Providers/FortifyServiceProvider.php`) & `config/fortify.php`
- Mengatur atribut `username` Fortify menggunakan `phone_number` sebagai pengenal login utama.
- Mengatur kustom autentikasi login agar menerima nomor HP & password.

#### [MODIFY] DatabaseSeeder (`database/seeders/DatabaseSeeder.php`)
- Menginisialisasi Role Spatie (`super_admin`, `admin`, `nasabah`).
- Memperbarui dummy user agar memiliki nomor HP yang valid (contoh: `081234567890`).

---

### Frontend Components

#### [MODIFY] Login Page (`resources/js/pages/auth/login.tsx`)
- Mengubah input label & placeholder dari *Email address* menjadi **Nomor HP** (type `tel`, validation minimal 10 digit angka).
- Form dikirim menggunakan `phone_number` & `password`.

#### [MODIFY] Register Page (`resources/js/pages/auth/register.tsx`)
- Mengubah field *Email* menjadi **Nomor HP** (min. 10 digit).
- Menambahkan modal/dialog **Verifikasi OTP** saat tombol *Register* diklik.
- Menampilkan countdown timer resend (60 detik) & tombol verifikasi OTP.

---

## Petunjuk Pengisian Nomor HP & Token Provider (.env)

Setelah implementasi selesai, berikut adalah panduan tempat pengisian nomor HP dan token WhatsApp:

### 1. File `.env` (Konfigurasi Provider & Token WA)
```env
# Pilih provider OTP: 'mock' (bebas biaya, kode OTP muncul di log/dialog) atau 'fonnte' (kirim WA asli)
OTP_PROVIDER=mock

# Jika Anda menggunakan WA Gateway Fonnte (https://fonnte.com):
FONNTE_TOKEN=isi_token_fonnte_anda_di_sini
```

### 2. Format Input Nomor HP Pengguna
- **Minimal 10 Digit**, contoh: `081234567890` atau `085711223344`.
- Input akan divalidasi sistem agar berupa karakter angka unik.

---

## Verification Plan

### Automated Tests
- Menjalankan `php artisan test` untuk memastikan autentikasi via nomor HP & Spatie Permission berfungsi dengan baik.

### Manual Verification
1. **Tes Register dengan OTP**:
   - Buka `/register`, masukkan nama, Nomor HP (`081234567890`), & password.
   - Klik Register -> Modal OTP muncul -> Kode OTP terkirim (pada mode `mock`, kode OTP bisa dilihat langsung di layar/log).
   - Masukkan 6-digit OTP -> Akun berhasil dibuat dan otomatis ter-redirect ke dashboard nasabah.
2. **Tes Login tanpa OTP**:
   - Logout lalu buka `/login`.
   - Masukkan Nomor HP (`081234567890`) & Password.
   - Berhasil login langsung tanpa perlu OTP.
