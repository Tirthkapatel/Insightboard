import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { ScrollReveal } from './ui/scroll-reveal.js';
import { OtpAnimatedVerification } from './OtpAnimatedVerification.js';
import {
  BarChart3,
  ArrowLeft,
  User,
  Mail,
  Lock,
  ShieldCheck,
  AlertCircle,
  Check,
  RefreshCw
} from 'lucide-react';

interface SignupPageProps {
  onNavigateToLogin: () => void;
  onBackToHome: () => void;
  onNavigateToApp?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onNavigateToLogin,
  onBackToHome,
  onNavigateToApp,
  onNavigateToPrivacy,
  onNavigateToTerms,
}) => {
  const { signup, verifyOtp, resendOtp } = useAuth();

  const [mode, setMode] = useState<'signup' | 'otp'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'viewer'>('admin');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devNotice, setDevNotice] = useState<string | null>(null);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      setError('Please accept the Terms & Conditions and Privacy Policy to continue.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await signup(name, email, password, confirmPassword, role);
    setLoading(false);

    if (res.success) {
      setMode('otp');
      setSuccessMsg('Account created successfully! Please enter the 6-digit verification code below.');
      if (res.devOtpCode) {
        setDevNotice(`[Development Notice] Your OTP code is: ${res.devOtpCode}`);
      }
    } else {
      setError(res.error || 'Signup failed.');
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await verifyOtp(email, otpCode);
    setLoading(false);

    if (res.success) {
      onBackToHome();
    } else {
      setError(res.error || 'OTP verification failed.');
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    setDevNotice(null);

    const res = await resendOtp(email);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('A fresh verification OTP code has been sent.');
      if (res.devOtpCode) {
        setDevNotice(`[Development Notice] Your new OTP code is: ${res.devOtpCode}`);
      }
    } else {
      setError(res.error || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col relative overflow-hidden">
      {/* Background Ambient Warm Amber & Grid Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-25 pointer-events-none -z-20" />
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.25),rgba(147,51,234,0.12),transparent_70%)] blur-[120px]" />
      </div>

      {/* Header Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={onBackToHome}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-300 bg-clip-text text-transparent">
              InsightBoard
            </span>
          </div>

          <ScrollReveal direction="up" delayMs={50}>
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </ScrollReveal>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-20 my-1">
        <div className="w-full max-w-md">
          <ScrollReveal direction="up" delayMs={100}>
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Card Title Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-zinc-800 text-center">
                <div className="inline-flex items-center justify-center p-2 bg-indigo-950/80 text-indigo-400 rounded-xl border border-indigo-800/80 mb-2 shadow-inner">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <h1 className="text-xl font-bold text-white font-display tracking-tight">
                  {mode === 'signup' ? 'Create Your Account' : 'Verify Email OTP'}
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  {mode === 'signup'
                    ? 'Join InsightBoard to build interactive SQL queries and live BI dashboards'
                    : 'Enter the 6-digit verification code sent to your email'}
                </p>
              </div>

              {/* Card Form Area */}
              <div className="p-4 sm:p-6 space-y-3">
                {error && (
                  <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <div>{error}</div>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-xs text-emerald-300">
                    {successMsg}
                  </div>
                )}

                {devNotice && (
                  <div className="p-3 bg-amber-950/50 border border-amber-800/80 rounded-xl text-xs font-mono text-amber-300">
                    {devNotice}
                  </div>
                )}

                {/* SIGNUP FORM */}
                {mode === 'signup' && (
                  <form onSubmit={handleSignupSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter full name"
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Password (min 8 chars, 1 number, 1 special)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Consent Checkbox */}
                    <div className="flex items-start gap-2 pt-0.5">
                      <label className="relative flex items-center justify-center cursor-pointer mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={agreeToTerms}
                          onChange={(e) => {
                            setAgreeToTerms(e.target.checked);
                            if (e.target.checked && error?.includes('Terms')) {
                              setError(null);
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-4 h-4 rounded bg-slate-950 border border-slate-800 peer-checked:bg-indigo-600 peer-checked:border-indigo-500 transition-all flex items-center justify-center">
                          <Check
                            className={`w-3 h-3 text-white stroke-[3] transition-opacity ${
                              agreeToTerms ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                        </div>
                      </label>
                      <span className="text-xs text-slate-400 select-none leading-tight">
                        I agree to the{' '}
                        <a
                          href="/terms-and-conditions"
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            if (onNavigateToTerms) {
                              e.preventDefault();
                              onNavigateToTerms();
                            }
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition-colors"
                        >
                          Terms &amp; Conditions
                        </a>{' '}
                        and{' '}
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            if (onNavigateToPrivacy) {
                              e.preventDefault();
                              onNavigateToPrivacy();
                            }
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition-colors"
                        >
                          Privacy Policy
                        </a>
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !agreeToTerms}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mt-1"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div className="pt-2.5 text-center text-xs text-slate-400 border-t border-slate-800/80">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={onNavigateToLogin}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition-colors ml-1"
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                )}

                {/* OTP FORM */}
                {mode === 'otp' && (
                  <OtpAnimatedVerification
                    email={email}
                    onVerify={(code) => verifyOtp(email, code)}
                    onResend={() => resendOtp(email)}
                    onSuccessComplete={onNavigateToApp || onBackToHome}
                    onBackToLogin={onNavigateToLogin}
                    initialError={error}
                    modeLabel="Verify Email OTP"
                  />
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
};
