'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { registerSchema } from '@/schemas/auth.schema';
import { registerUser } from '@/lib/api/auth.api';
import { useAuth } from '@/context/auth-context';
import { email } from 'zod';

import Link from 'next/link';

export default function RegisterForm() {
    const router = useRouter();
    // const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

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

        const result = registerSchema.safeParse(form);

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;

            setErrors({
                fullName: fieldErrors.fullName?.[0] || '',
                email: fieldErrors.email?.[0] || '',
                password: fieldErrors.password?.[0] || '',
                confirmPassword: fieldErrors.confirmPassword?.[0] || '',
            });

            return;
        }

        try {
            setLoading(true);

            const response = await registerUser({
                name: result.data.fullName,
                email: result.data.email,
                password: result.data.password,
                confirmPassword: result.data.confirmPassword
            });

            // login(response.accessToken);

            toast.success('Account created successfully');

            router.push('/login');
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Registration failed'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] flex flex-col items-center">

                {/* Logo */}
                <Link href="/" className="flex flex-col items-center gap-2 mb-3 hover:opacity-80 transition-opacity">
                    <div className="w-11 h-11 bg-[#4338CA] rounded-xl flex items-center justify-center shadow-sm">
                        <Layers className="w-6 h-6 text-white" />
                    </div>

                    <h1 className="text-3xl font-semibold text-[#2a14b4] tracking-tight">
                        FlowDesk
                    </h1>
                </Link>

                {/* Card */}
                <div className="bg-white w-full px-8 py-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
                    <div className="mb-7 text-center">
                        <h2 className="text-[22px] font-semibold text-[#0d1c2e] mb-1">
                            Create an account
                        </h2>
                        <p className="text-[#64748B] text-[14px]">
                            Join FlowDesk to submit and track requests
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Full Name */}
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="fullName"
                                className="text-sm font-medium text-[#464554]"
                            >
                                Full name
                            </label>

                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Ahmad Khan"
                                className="w-full h-9 px-4 bg-white border border-[#C7C4D7] rounded-md
                                focus:border-[#4338CA] outline-none text-sm"
                            />

                            {errors.fullName && (
                                <p className="text-red-500 text-xs">
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-[#464554]"
                            >
                                Email address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                className="w-full h-9 px-4 bg-white border border-[#C7C4D7] rounded-md
                                focus:border-[#4338CA] outline-none text-sm"
                            />

                            {errors.email && (
                                <p className="text-red-500 text-xs">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-[#464554]"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full h-9 pl-4 pr-11 bg-white border border-[#C7C4D7] rounded-md
                                    focus:border-[#4338CA] outline-none text-sm"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
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

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="confirmPassword"
                                className="text-sm font-medium text-[#464554]"
                            >
                                Confirm password
                            </label>

                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full h-9 pl-4 pr-11 bg-white border border-[#C7C4D7] rounded-md
                                    focus:border-[#4338CA] outline-none text-sm"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777586]"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 bg-[#4338CA] text-white font-medium rounded-md
                            hover:bg-[#372abf] transition-all mt-2 disabled:opacity-70
                            disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 h-px bg-[#C7C4D7] opacity-30" />
                    </div>

                    {/* Login link */}
                    <p className="text-center text-sm text-[#64748B]">
                        Already have an account?{' '}
                        <a
                            href="/login"
                            className="text-[#2a14b4] font-medium hover:underline"
                        >
                            Sign in
                        </a>
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-[#64748B] opacity-60">
                        © 2026 FlowDesk Systems Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}