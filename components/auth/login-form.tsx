'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { loginSchema } from '@/schemas/auth.schema';
import { loginUser } from '@/lib/api/auth.api';
import { useAuth } from '@/context/auth-context';

export default function LoginForm() {
    const router = useRouter();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

        setErrors((prev) => ({
            ...prev,
            [e.target.name]: '',
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Zod validation
        const result = loginSchema.safeParse(form);

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;

            setErrors({
                email: fieldErrors.email?.[0] || '',
                password: fieldErrors.password?.[0] || '',
            });

            return;
        }

        try {
            setLoading(true);

            const res = await loginUser(result.data);

            // backend: { success: true, data: { accessToken } }
            const token = res.data.accessToken;

            login(token); // store token

            toast.success('Login successful');

            router.push('/dashboard');
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : 'Login failed'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full min-w-[400px] flex flex-col items-center">

                {/* Logo */}
                <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="w-11 h-11 bg-[#4338CA] rounded-xl flex items-center justify-center">
                        <Layers className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-semibold text-[#2a14b4]">
                        FlowDesk
                    </h1>
                </div>

                {/* Card */}
                <div className="bg-white w-full p-8 rounded-2xl border border-[#E2E8F0] shadow-sm">

                    <div className="mb-8 text-center">
                        <h2 className="text-[22px] font-semibold text-[#0d1c2e]">
                            Welcome back
                        </h2>
                        <p className="text-[#64748B] text-[14px]">
                            Sign in to your account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Email */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-[#464554]">
                                Email address
                            </label>

                            <input
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                type="email"
                                placeholder="name@company.com"
                                className="w-full h-10 px-4 bg-white border border-[#C7C4D7] rounded-md outline-none"
                            />

                            {errors.email && (
                                <p className="text-red-500 text-xs">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-[#464554]">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full h-10 pl-4 pr-11 bg-white border border-[#C7C4D7] rounded-md outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777586]"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {errors.password && (
                                <p className="text-red-500 text-xs">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-[#4338CA] text-white rounded-md flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm text-[#64748B] mt-6">
                        Don't have an account?{' '}
                        <a
                            href="/register"
                            className="text-[#2a14b4] font-medium"
                        >
                            Register
                        </a>
                    </p>
                </div>

                <div className="mt-8 text-[#64748B] text-sm">
                    Enterprise Secured
                </div>
            </div>
        </div>
    );
}