'use client';

import { useState } from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';

export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] flex flex-col items-center">
                
                {/* Logo Section */}
                <div className="flex flex-col items-center gap-2 mb-3">
                    <div className="w-11 h-11 bg-[#4338CA] rounded-xl flex items-center justify-center">
                        <Layers className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-semibold text-[#2a14b4] tracking-tight">
                        FlowDesk
                    </h1>
                </div>

                {/* Register Card */}
                <div className="bg-white w-full px-8 py-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
                    <div className="mb-7 text-center">
                        <h2 className="text-[22px] font-semibold text-[#0d1c2e] mb-1">
                            Create an account
                        </h2>
                        <p className="text-[#64748B] text-[14px]">
                            Join FlowDesk to submit and track requests
                        </p>
                    </div>

                    <form className="space-y-4">
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
                                type="text"
                                placeholder="Ahmad khan"
                                className="w-full h-9 px-4 bg-white border border-[#C7C4D7] rounded-md 
                                           focus:border-[#4338CA] focus:ring-0 outline-none 
                                           text-sm transition-colors"
                                required
                            />
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
                                type="email"
                                placeholder="name@company.com"
                                className="w-full h-9 px-4 bg-white border border-[#C7C4D7] rounded-md 
                                           focus:border-[#4338CA] focus:ring-0 outline-none 
                                           text-sm transition-colors"
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
                                    className="w-full h-9 pl-4 pr-11 bg-white border border-[#C7C4D7] rounded-md 
                                               focus:border-[#4338CA] focus:ring-0 outline-none 
                                               text-sm transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777586] hover:text-[#4338CA] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
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
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full h-9 pl-4 pr-11 bg-white border border-[#C7C4D7] rounded-md 
                                               focus:border-[#4338CA] focus:ring-0 outline-none 
                                               text-sm transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777586] hover:text-[#4338CA] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Create Account Button */}
                        <button
                            type="submit"
                            className="w-full h-10 bg-[#4338CA] text-white font-medium rounded-md 
                                       hover:bg-[#372abf] active:scale-[0.985] transition-all mt-2"
                        >
                            Create account
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 h-px bg-[#C7C4D7] opacity-30" />
                    </div>

                    {/* Sign In Link */}
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