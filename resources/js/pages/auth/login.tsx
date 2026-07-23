import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Phone, KeyRound, ArrowLeft, Send, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { register } from '@/routes';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status }: Props) {
    const [loginMode, setLoginMode] = useState<'otp' | 'password'>('otp');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    
    // Password mode states
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [debugCode, setDebugCode] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        if (status) {
            setSuccessMsg(status);
        }
    }, [status]);

    // Handle sending OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!phoneNumber || phoneNumber.length < 10) {
            setErrorMsg('Nomor HP minimal 10 digit.');
            return;
        }

        setLoading(true);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/login/otp/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ phone_number: phoneNumber }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.message || data.errors?.phone_number?.[0] || 'Nomor HP belum terdaftar.');
            } else {
                setSuccessMsg(data.message || 'Kode OTP berhasil dikirim!');
                if (data.debug_code) {
                    setDebugCode(data.debug_code);
                }
                setStep('otp');
            }
        } catch {
            setErrorMsg('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Handle verifying OTP and logging in
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!otpCode || otpCode.length !== 6) {
            setErrorMsg('Kode OTP harus 6 digit angka.');
            return;
        }

        setLoading(true);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/login/otp/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    otp_code: otpCode,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.errors?.otp_code?.[0] || data.message || 'Kode OTP salah.');
            } else if (data.redirect) {
                window.location.href = data.redirect;
            }
        } catch {
            setErrorMsg('Terjadi kesalahan saat memverifikasi OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Handle traditional password login
    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    password: password,
                    remember: remember,
                }),
            });

            if (res.ok || res.redirected) {
                window.location.href = res.url || '/dashboard';
            } else {
                const data = await res.json();
                setErrorMsg(data.message || data.errors?.phone_number?.[0] || data.errors?.password?.[0] || 'Nomor HP atau kata sandi salah.');
            }
        } catch {
            setErrorMsg('Gagal masuk. Silakan periksa kembali data Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Masuk dengan OTP" />

            {/* Flash / Error Messages */}
            {successMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/15 p-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                </div>
            )}

            {errorMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/15 p-3.5 text-xs font-semibold text-red-800 dark:text-red-300 border border-red-500/30">
                    <AlertCircle className="size-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Mode Switcher Header */}
            <div className="mb-4 flex rounded-lg bg-muted p-1 text-xs">
                <button
                    type="button"
                    onClick={() => { setLoginMode('otp'); setStep('phone'); setErrorMsg(null); }}
                    className={`flex-1 rounded-md py-2 font-medium transition-all ${
                        loginMode === 'otp'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    📱 Masuk Kode OTP
                </button>
                <button
                    type="button"
                    onClick={() => { setLoginMode('password'); setErrorMsg(null); }}
                    className={`flex-1 rounded-md py-2 font-medium transition-all ${
                        loginMode === 'password'
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    🔑 Kata Sandi
                </button>
            </div>

            {/* LOGIN VIA OTP FLOW */}
            {loginMode === 'otp' && (
                <>
                    {step === 'phone' ? (
                        /* STEP 1: INPUT NOMOR HP */
                        <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="phone_number" className="flex items-center gap-1.5">
                                    <Phone className="size-4 text-emerald-600" /> Nomor Handphone
                                </Label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Contoh: 081234567890"
                                    required
                                    autoFocus
                                />
                                <span className="text-[11px] text-muted-foreground">
                                    Kode verifikasi OTP akan dikirim via WhatsApp ke nomor ini.
                                </span>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                                {loading ? <Spinner /> : <Send className="size-4" />}
                                Kirim Kode OTP
                            </Button>
                        </form>
                    ) : (
                        /* STEP 2: INPUT KODE OTP */
                        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                            {debugCode && (
                                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                                    <span className="font-bold">🔑 Mode Pengujian (Mock OTP):</span> Kode OTP Anda adalah{' '}
                                    <span className="font-mono text-base font-extrabold text-amber-900 dark:text-amber-200">{debugCode}</span>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="otp_code" className="flex items-center gap-1.5">
                                        <ShieldCheck className="size-4 text-emerald-600" /> Kode Verifikasi OTP (6 Digit)
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={() => setStep('phone')}
                                        className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                                    >
                                        <ArrowLeft className="size-3" /> Ubah No. HP
                                    </button>
                                </div>

                                <Input
                                    id="otp_code"
                                    type="text"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="Masukkan 6 digit OTP..."
                                    className="text-center font-mono text-lg tracking-widest"
                                    required
                                    autoFocus
                                />
                                <span className="text-[11px] text-muted-foreground text-center">
                                    Dikirim ke <strong className="text-foreground">{phoneNumber}</strong>
                                </span>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                                {loading && <Spinner />}
                                Verifikasi & Masuk ke Dashboard
                            </Button>

                            <div className="text-center text-xs">
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    className="font-medium text-emerald-600 hover:underline"
                                >
                                    Kirim Ulang Kode OTP
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}

            {/* LOGIN VIA PASSWORD FLOW (FALLBACK) */}
            {loginMode === 'password' && (
                <form onSubmit={handlePasswordLogin} className="flex flex-col gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="phone_number_pass">Nomor Handphone</Label>
                        <Input
                            id="phone_number_pass"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Contoh: 081234567890"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Kata Sandi</Label>
                        </div>
                        <PasswordInput
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukkan kata sandi..."
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            checked={remember}
                            onCheckedChange={(checked) => setRemember(Boolean(checked))}
                        />
                        <Label htmlFor="remember">Ingat Saya</Label>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading && <Spinner />}
                        Masuk
                    </Button>
                </form>
            )}

            <div className="mt-6 text-center text-xs text-muted-foreground">
                Belum memiliki akun?{' '}
                <TextLink href={register()}>
                    Daftar Sekarang
                </TextLink>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Masuk Portal Bank Sampah',
    description: 'Masuk dengan cepat menggunakan nomor HP dan verifikasi kode OTP',
};
