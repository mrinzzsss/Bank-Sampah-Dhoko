import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { login } from '@/routes';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    
    // OTP Dialog states
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState('');
    const [mockCode, setMockCode] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let interval: any = null;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const handleInitialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Client validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi.';
        if (!formData.phone_number.trim()) {
            newErrors.phone_number = 'Nomor HP wajib diisi.';
        } else if (formData.phone_number.trim().length < 10) {
            newErrors.phone_number = 'Nomor HP minimal 10 digit angka.';
        }
        if (!formData.password) newErrors.password = 'Kata sandi wajib diisi.';
        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Konfirmasi kata sandi tidak cocok.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Request OTP
        await requestOtpCode();
    };

    const getCsrfToken = () => {
        const metaToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        if (metaToken) return metaToken;
        const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
        if (match) return decodeURIComponent(match[2]);
        return '';
    };

    const requestOtpCode = async () => {
        setIsSendingOtp(true);
        setOtpError('');
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch('/register/otp/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-XSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ phone_number: formData.phone_number }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setShowOtpDialog(true);
                setMockCode(data.debug_code || null);
                setResendTimer(60);
            } else {
                if (data.errors) {
                    const apiErrors: Record<string, string> = {};
                    Object.keys(data.errors).forEach((key) => {
                        apiErrors[key] = data.errors[key][0];
                    });
                    setErrors(apiErrors);
                } else {
                    setErrors({ phone_number: data.message || 'Gagal mengirim OTP.' });
                }
            }
        } catch (err: any) {
            setErrors({ phone_number: 'Terjadi kesalahan sistem saat mengirim OTP.' });
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setOtpError('');

        if (!otpCode || otpCode.length !== 6) {
            setOtpError('Masukkan 6 digit kode OTP.');
            return;
        }

        setIsVerifying(true);
        try {
            const csrfToken = getCsrfToken();
            const response = await fetch('/register/otp/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-XSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    ...formData,
                    otp_code: otpCode,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                window.location.href = data.redirect || '/dashboard';
            } else {
                if (data.errors?.otp_code) {
                    setOtpError(data.errors.otp_code[0]);
                } else if (data.errors) {
                    const firstErrKey = Object.keys(data.errors)[0];
                    setOtpError(data.errors[firstErrKey][0]);
                } else {
                    setOtpError(data.message || 'Verifikasi OTP gagal. Silakan periksa kode Anda.');
                }
            }
        } catch (err: any) {
            setOtpError('Verifikasi OTP gagal. Silakan periksa koneksi Anda.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <>
            <Head title="Daftar Akun" />

            <form onSubmit={handleInitialSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                            id="name"
                            type="text"
                            name="name"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            placeholder="Contoh: Ahmad Fauzi"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone_number">Nomor Handphone (WhatsApp)</Label>
                        <Input
                            id="phone_number"
                            type="tel"
                            name="phone_number"
                            required
                            tabIndex={2}
                            autoComplete="tel"
                            placeholder="Contoh: 081234567890 (min. 10 digit)"
                            minLength={10}
                            value={formData.phone_number}
                            onChange={handleChange}
                        />
                        <InputError message={errors.phone_number} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Kata Sandi</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            placeholder="Password minimal 8 karakter"
                            passwordrules={passwordRules}
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi</Label>
                        <PasswordInput
                            id="password_confirmation"
                            name="password_confirmation"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            placeholder="Ulangi password"
                            passwordrules={passwordRules}
                            value={formData.password_confirmation}
                            onChange={handleChange}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 w-full"
                        tabIndex={5}
                        disabled={isSendingOtp}
                        data-test="register-user-button"
                    >
                        {isSendingOtp && <Spinner />}
                        Daftar & Kirim Kode OTP
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Sudah memiliki akun?{' '}
                    <TextLink href={login()} tabIndex={6}>
                        Masuk
                    </TextLink>
                </div>
            </form>

            {/* Modal Dialog Verifikasi OTP */}
            <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Verifikasi Kode OTP</DialogTitle>
                        <DialogDescription>
                            Masukkan 6 digit kode OTP yang telah dikirim ke nomor{' '}
                            <span className="font-semibold text-foreground">{formData.phone_number}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    {mockCode && (
                        <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800">
                            <strong>[MOCK MODE / UJI COBA]</strong><br />
                            Kode OTP Anda adalah: <span className="text-sm font-bold tracking-widest">{mockCode}</span>
                        </div>
                    )}

                    <form onSubmit={handleVerifyOtp} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="otp_code">Kode OTP (6 Digit)</Label>
                            <Input
                                id="otp_code"
                                type="text"
                                maxLength={6}
                                placeholder="123456"
                                className="text-center text-2xl tracking-[0.5em] font-mono"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                autoFocus
                            />
                            <InputError message={otpError} />
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={resendTimer > 0 || isSendingOtp}
                                onClick={requestOtpCode}
                                className="w-full sm:w-auto text-xs"
                            >
                                {resendTimer > 0 ? `Kirim Ulang (${resendTimer}s)` : 'Kirim Ulang OTP'}
                            </Button>

                            <Button type="submit" disabled={isVerifying} className="w-full sm:w-auto">
                                {isVerifying && <Spinner />}
                                Verifikasi & Buat Akun
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Register.layout = {
    title: 'Buat Akun Bank Sampah',
    description: 'Lengkapi data Anda di bawah ini untuk mendaftar akun Nasabah baru',
};
