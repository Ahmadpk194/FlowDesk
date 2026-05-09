'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';
import { loginSchema } from '@/schemas/auth.schema';
import { loginUser } from '@/lib/api/auth.api';
import { useAuth } from '@/context/auth-context';
import { getUserRoleFromToken, getRoleBasedRedirect } from '@/lib/utils/jwt';

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

            // Extract user role from token
            const userRole = getUserRoleFromToken(token);
            const redirectPath = getRoleBasedRedirect(userRole || 'employee');

            login(token); // store token

            toast.success(`Welcome! Redirecting to ${userRole} dashboard...`);

            // Redirect based on user role with setTimeout to avoid router initialization error
            setTimeout(() => {
                router.push(redirectPath);
            }, 0);
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
            <div className="w-full max-w-[440px] flex flex-col items-center">

                {/* Logo */}
                <Link href="/" className="flex flex-col items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
                    <div className="w-12 h-12 bg-[#4338CA] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                        <Layers className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-[#2a14b4] tracking-tight">
                        FlowDesk
                    </h1>
                </Link>

                {/* Card */}
                <div className="bg-white w-full p-10 rounded-3xl border border-[#E2E8F0] shadow-xl shadow-indigo-50/50">

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
                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-semibold text-[#464554]">
                                Email address
                            </label>

                            <input
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                type="email"
                                placeholder="name@company.com"
                                className="w-full h-12 px-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#4338CA] focus:ring-4 focus:ring-indigo-50 transition-all text-[15px]"
                            />

                            {errors.email && (
                                <p className="text-red-500 text-xs font-medium px-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[15px] font-semibold text-[#464554]">
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full h-12 pl-5 pr-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#4338CA] focus:ring-4 focus:ring-indigo-50 transition-all text-[15px]"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777586] hover:text-[#4338CA] transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {errors.password && (
                                <p className="text-red-500 text-xs font-medium px-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#4338CA] text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 font-bold text-[16px] shadow-lg shadow-indigo-100 hover:bg-[#372abf] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in to Dashboard'
                                )}
                            </button>
                        </div>
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