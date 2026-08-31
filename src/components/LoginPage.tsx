import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { ScrollReveal } from './ui/scroll-reveal.js';
import { OtpAnimatedVerification } from './OtpAnimatedVerification.js';
import {
  BarChart3,
  ArrowLeft,
  Mail,
  Lock,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  RefreshCw,
  User
} from 'lucide-react';

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onBackToHome: () => void;
  onNavigateToApp?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignup,
  onBackToHome,
  onNavigateToApp,
  onNavigateToPrivacy,
  onNavigateToTerms,
}) => {
  const { login, verifyOtp, resendOtp, forgotPassword, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'otp' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devNotice, setDevNotice] = useState<string | null>(null);

  const handleSuccessRedirect = onNavigateToApp || onBackToHome;

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError(null);
    const res = await login('demo@insightboard.app', 'Password123!');
    setLoading(false);
    if (res.success) {
      handleSuccessRedirect();
    } else {
      setError(res.error || 'Quick demo login failed.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);

    if (res.requiresOtp && res.unverifiedEmail) {
      setEmail(res.unverifiedEmail);
      setMode('otp');
      setError('Account is unverified. Please enter your 6-digit OTP code below.');
      return;
    }

    if (res.success) {
      handleSuccessRedirect();
    } else {
      setError(res.error || 'Failed to log in. Please check your credentials.');
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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      setMode('reset');
      setSuccessMsg('OTP code sent for password reset. Enter code and new password.');
      if (res.devOtpCode) {
        setDevNotice(`[Development Notice] Reset OTP: ${res.devOtpCode}`);
      }
    } else {
      setError(res.error || 'Failed to send password reset code.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await resetPassword(email, otpCode, password);
    setLoading(false);

    if (res.success) {
      setMode('login');
      setSuccessMsg('Password reset successfully! Log in with your new password.');
    } else {
      setError(res.error || 'Failed to reset password.');
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
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-24">
        <div className="w-full max-w-md">
          <ScrollReveal direction="up" delayMs={100}>
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Card Title Header */}
              <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-zinc-800 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-950/80 text-indigo-400 rounded-2xl border border-indigo-800/80 mb-4 shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-white font-display tracking-tight">
                  {mode === 'login' && 'Sign In to InsightBoard'}
                  {mode === 'otp' && 'Verify OTP Code'}
                  {mode === 'forgot' && 'Reset Your Password'}
                  {mode === 'reset' && 'Set New Password'}
                </h1>
                <p className="text-xs text-zinc-400 mt-1.5">
                  {mode === 'login' && 'Enter your account details to access your analytics workspace'}
                  {mode === 'otp' && 'Enter the 6-digit verification code sent to your email'}
                  {mode === 'forgot' && 'Receive a password reset code via email'}
                  {mode === 'reset' && 'Create a new secure password for your account'}
                </p>
              </div>

              {/* Card Form Area */}
              <div className="p-6 sm:p-8 space-y-5">
                {error && (
                  <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <div>{error}</div>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-xs text-emerald-300">
                    {successMsg}
                  </div>
                )}

                {devNotice && (
                  <div className="p-3.5 bg-amber-950/50 border border-amber-800/80 rounded-xl text-xs font-mono text-amber-300">
                    {devNotice}
                  </div>
                )}

                {/* LOGIN FORM */}
                {mode === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div className="pt-3 text-center text-xs text-slate-400 border-t border-slate-800/80">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={onNavigateToSignup}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition-colors ml-1"
                      >
                        Sign Up
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
                    onSuccessComplete={handleSuccessRedirect}
                    onBackToLogin={() => setMode('login')}
                    initialError={error}
                    modeLabel="Verify OTP Code"
                  />
                )}

                {/* FORGOT PASSWORD FORM */}
                {mode === 'forgot' && (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                    >
                      {loading ? 'Sending Code...' : 'Send Password Reset Code'}
                    </button>

                    <div className="text-center text-xs pt-2">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </form>
                )}

                {/* RESET PASSWORD FORM */}
                {mode === 'reset' && (
                  <OtpAnimatedVerification
                    email={email}
                    onVerify={async (code) => {
                      if (!password) {
                        return { success: false, error: 'Please enter a new password first.' };
                      }
                      const res = await resetPassword(email, code, password);
                      return res;
                    }}
                    onResend={() => forgotPassword(email)}
                    onSuccessComplete={() => {
                      setMode('login');
                      setSuccessMsg('Password reset successfully! Log in with your new password.');
                    }}
                    onBackToLogin={() => setMode('login')}
                    initialError={error}
                    modeLabel="Reset Password OTP"
                  >
                    <div className="mb-6">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">
                        New Password (Required)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 text-left mt-1.5">Please enter your new password before entering the OTP code.</p>
                    </div>
                  </OtpAnimatedVerification>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
};
