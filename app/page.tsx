"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowUpRight,
  UserCircle,
  FileCheck,
  History,
  Lock,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getUserRoleFromToken, getRoleBasedRedirect } from "@/lib/utils/jwt";

export default function Home() {
  const { token, logout } = useAuth();
  const role = token ? getUserRoleFromToken(token) : null;
  const dashboardLink = role ? getRoleBasedRedirect(role) : "/dashboard/employee";
  const isLoggedIn = !!token;

  const handleLogout = async () => {
    await logout();
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const navHeight = 64; // Height of the fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-1 sm:gap-2 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#4338CA] rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-[#0d1c2e]">Flow<span className="text-[#4338CA]">Desk</span></span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="hover:text-[#4338CA] transition-colors">How it Works</a>
              <a href="#roles" onClick={(e) => scrollToSection(e, "roles")} className="hover:text-[#4338CA] transition-colors">Roles</a>
              <a href="#security" onClick={(e) => scrollToSection(e, "security")} className="hover:text-[#4338CA] transition-colors">Security</a>
            </div>

            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link 
                    href={dashboardLink} 
                    className="bg-[#4338CA] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#372abf] transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 group"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-sm font-semibold text-[#464554] hover:text-[#4338CA] px-3 py-2 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-[#4338CA] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#372abf] transition-all shadow-sm active:scale-95"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#4338CA] text-[10px] font-bold uppercase tracking-widest mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
              </span>
              Enterprise Ready Approval System
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-[#0d1c2e] tracking-tight mb-6 leading-tight">
              Streamline Company Requests <br className="hidden sm:block" />
              <span className="text-[#4338CA]">with Role-Based Precision</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-[#64748B] mb-10 leading-relaxed">
              FlowDesk provides a modular, secure framework for managing internal requests. 
              Built with NestJS and React for lightning-fast performance and absolute clarity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoggedIn ? (
                <Link 
                  href={dashboardLink} 
                  className="w-full sm:w-auto bg-[#4338CA] text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-[#372abf] transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Go to My Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link 
                    href="/register" 
                    className="w-full sm:w-auto bg-[#4338CA] text-white px-8 py-3.5 rounded-xl text-base font-bold hover:bg-[#372abf] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group"
                  >
                    Start for Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href="/login" 
                    className="w-full sm:w-auto bg-white text-[#0d1c2e] border border-[#E2E8F0] px-8 py-3.5 rounded-xl text-base font-bold hover:border-[#4338CA] hover:text-[#4338CA] transition-all flex items-center justify-center gap-2"
                  >
                    Sign In
                    <ArrowUpRight className="w-4 h-4 opacity-50" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="roles" className="py-24 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#0d1c2e] mb-4 tracking-tight">Tailored Experience for Every Role</h2>
              <p className="text-[#64748B] max-w-xl mx-auto">Different tools for different goals. Designed around a strict permission model.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Employee */}
              <div className="p-8 rounded-2xl border border-gray-100 bg-[#F8FAFC]/50 hover:bg-white hover:border-indigo-100 transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                  <UserCircle className="w-6 h-6 text-[#4338CA]" />
                </div>
                <h3 className="text-lg font-bold text-[#0d1c2e] mb-2">Employee</h3>
                <ul className="space-y-2 text-sm text-[#64748B]">
                  <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-indigo-400" /> Create new requests</li>
                  <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-indigo-400" /> Track status in real-time</li>
                  <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-indigo-400" /> Cancel or edit pending items</li>
                </ul>
              </div>

              {/* Manager */}
              <div className="p-8 rounded-2xl border border-gray-100 bg-[#F8FAFC]/50 hover:bg-white hover:border-indigo-100 transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-[#4338CA]" />
                </div>
                <h3 className="text-lg font-bold text-[#0d1c2e] mb-2">Manager</h3>
                <ul className="space-y-2 text-sm text-[#64748B]">
                  <li className="flex items-center gap-2"><FileCheck className="w-3.5 h-3.5 text-indigo-400" /> Oversee all request flows</li>
                  <li className="flex items-center gap-2"><FileCheck className="w-3.5 h-3.5 text-indigo-400" /> Approve or reject items</li>
                  <li className="flex items-center gap-2"><FileCheck className="w-3.5 h-3.5 text-indigo-400" /> Provide rejection reasons</li>
                </ul>
              </div>

              {/* Admin */}
              <div className="p-8 rounded-2xl border border-gray-100 bg-[#F8FAFC]/50 hover:bg-white hover:border-indigo-100 transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                  <Users className="w-6 h-6 text-[#4338CA]" />
                </div>
                <h3 className="text-lg font-bold text-[#0d1c2e] mb-2">Administrator</h3>
                <ul className="space-y-2 text-sm text-[#64748B]">
                  <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-indigo-400" /> Manage users and permissions</li>
                  <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-indigo-400" /> Monitor system-wide activity</li>
                  <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-indigo-400" /> Role assignment control</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-[#0d1c2e] mb-6 tracking-tight">The Lifecycle of a Request</h2>
                <div className="space-y-8">
                  {[
                    {
                      title: "Submission",
                      desc: "Employees submit requests with clear titles and descriptions. Each item starts in a PENDING state.",
                      icon: Zap
                    },
                    {
                      title: "Review",
                      desc: "Managers receive the request. They can analyze the details and choose to Approve or Reject.",
                      icon: FileCheck
                    },
                    {
                      title: "Resolution",
                      desc: "Once decided, the request enters a final immutable state. Employees are notified of the outcome.",
                      icon: History
                    }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 shrink-0 bg-indigo-50 rounded-full flex items-center justify-center text-[#4338CA] font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#0d1c2e] mb-1">{step.title}</h4>
                        <p className="text-sm text-[#64748B] leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative lg:ml-10">
                 <div className="absolute -inset-4 bg-indigo-100 rounded-3xl blur-2xl opacity-50 -z-10" />
                 <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-8">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                       <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Workflow Engine</span>
                       <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="h-4 bg-gray-50 rounded w-3/4" />
                       <div className="h-4 bg-gray-50 rounded w-1/2" />
                       <div className="h-20 bg-gray-50 rounded w-full" />
                       <div className="flex justify-end gap-3 pt-4">
                          <div className="h-8 bg-gray-100 rounded-md w-20" />
                          <div className="h-8 bg-indigo-100 rounded-md w-24" />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-24 bg-[#0d1c2e] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">Security by Architecture</h2>
            <p className="text-indigo-200/70 max-w-2xl mx-auto mb-16">
              Our system is built with industry-standard JWT authentication and deep Role-Based Access Control (RBAC).
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
               <div>
                  <div className="text-2xl font-bold mb-1">JWT</div>
                  <div className="text-xs text-indigo-300/60 uppercase font-bold tracking-widest">Auth Protocol</div>
               </div>
               <div>
                  <div className="text-2xl font-bold mb-1">RBAC</div>
                  <div className="text-xs text-indigo-300/60 uppercase font-bold tracking-widest">Access Model</div>
               </div>
               <div>
                  <div className="text-2xl font-bold mb-1">Modular</div>
                  <div className="text-xs text-indigo-300/60 uppercase font-bold tracking-widest">Design Pattern</div>
               </div>
               <div>
                  <div className="text-2xl font-bold mb-1">Audit</div>
                  <div className="text-xs text-indigo-300/60 uppercase font-bold tracking-widest">Traceability</div>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-[#4338CA] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-[#0d1c2e]">FlowDesk</span>
            </Link>
            
            <p className="text-sm text-[#64748B]">
              © {new Date().getFullYear()} FlowDesk Systems. All rights reserved.
            </p>

            <div className="flex items-center gap-2 text-sm font-medium text-[#464554]">
               <span className="text-[#64748B]">Created by</span>
               <a 
                 href="https://www.linkedin.com/in/ahmad-khan-974203a8/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="bg-[#4338CA]/10 text-[#4338CA] px-3 py-1 rounded-full text-xs font-bold tracking-wide hover:bg-[#4338CA] hover:text-white transition-all duration-300"
               >
                 Ahmad Khan
               </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
