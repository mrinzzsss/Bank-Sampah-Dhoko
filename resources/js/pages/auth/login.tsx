import { useState, useEffect } from 'react';
import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [showStatus, setShowStatus] = useState(true);

    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => {
                setShowStatus(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    return (
        <>
            <Head title="Log in" />

            {status && showStatus && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-emerald-500/15 p-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 transition-all duration-500">
                    <span>{status}</span>
                    <button onClick={() => setShowStatus(false)} className="ml-2 font-bold text-sm opacity-70 hover:opacity-100">×</button>
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="phone_number">Nomor Handphone</Label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    name="phone_number"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="tel"
                                    placeholder="Contoh: 081234567890 (min. 10 digit)"
                                    minLength={10}
                                />
                                <InputError message={errors.phone_number || errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot your password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <TextLink href={register()} tabIndex={5}>
                                Sign up
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke Akun Anda',
    description: 'Masukkan nomor HP (min. 10 digit) dan kata sandi Anda di bawah ini',
};
