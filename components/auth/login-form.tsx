'use client';

import { useState } from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full min-w-[400px] flex flex-col items-center">
                {/* Logo Section */}
                <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="w-11 h-11 bg-[#4338CA] rounded-xl flex items-center justify-center">
                        <Layers className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-semibold text-[#2a14b4] tracking-tight">
                        FlowDesk
                    </h1>
                </div>

                {/* Login Card */}
                <div className="bg-white w-full p-8 rounded-2xl border border-[#E2E8F0] shadow-sm">
                    <div className="mb-8 text-center">
                        <h2 className="text-[22px] font-semibold text-[#0d1c2e] ">
                            Welcome back
                        </h2>
                        <p className="text-[#64748B] text-[14px]">
                            Sign in to your account
                        </p>
                    </div>

                    <form className="space-y-4">
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
                                type="email"
                                placeholder="name@company.com"
                                className="w-full h-10 px-4 bg-white border border-[#C7C4D7] rounded-md focus:border-[#4338CA] focus:ring-0 outline-none text-sm transition-colors"
                                required
                            />
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
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full h-10 pl-4 pr-11 bg-white border border-[#C7C4D7] rounded-md focus:border-[#4338CA] focus:ring-0 outline-none text-sm transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777586] hover:text-[#4338CA] transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            className="w-full h-11 bg-[#4338CA] text-white font-medium rounded-md hover:bg-[#372abf] transition-all active:scale-[0.985]"
                        >
                            Sign in
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-[#C7C4D7] opacity-30" />
                    </div>

                    {/* Register Link */}
                    <p className="text-center text-sm text-[#64748B]">
                        Don't have an account?{' '}
                        <a 
                            href="register" 
                            className="text-[#2a14b4] font-medium hover:underline"
                        >
                            Register
                        </a>
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-8">
                    <p className="text-md uppercase tracking-widest text-[#64748B] opacity-60 font-medium">
                        Enterprise Secured
                    </p>
                </div>
            </div>
        </div>
    );
}