import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { OtpAnimatedVerification } from './OtpAnimatedVerification.js';
import { ShieldCheck, Mail, Lock, User, AlertCircle, RefreshCw, KeyRound, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onNavigateToApp?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onNavigateToApp,
  onNavigateToPrivacy,
  onNavigateToTerms
}) => {
  const { login, signup, verifyOtp, resendOtp, forgotPassword, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'otp' | 'forgot' | 'reset'>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'viewer'>('admin');
  const [otpCode, setOtpCode] = useState('');
  const [devNotice, setDevNotice] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
      setDevNotice(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSuccessFinish = () => {
    onClose();
    onNavigateToApp?.();
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError(null);
    const res = await login('demo@insightboard.app', 'Password123!');
    setLoading(false);
    if (res.success) {
      handleSuccessFinish();
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
      handleSuccessFinish();
    } else {
      setError(res.error || 'Failed to log in.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTerms) {
      setError('Please accept the Terms & Conditions and Privacy Policy to continue');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await signup(name, email, password, confirmPassword, role);
    setLoading(false);

    if (res.success) {
      setMode('otp');
      setSuccessMsg('Account created! Enter the 6-digit verification OTP code below.');
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
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="bg-black px-6 py-5 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h3 className="font-semibold text-lg tracking-tight">
              {mode === 'login' && 'Log In to InsightBoard'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'otp' && 'Verify Email OTP'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'reset' && 'Set New Password'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none font-medium px-2"
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-700 dark:text-emerald-300">
              {successMsg}
            </div>
          )}

          {devNotice && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-mono text-amber-800 dark:text-amber-300">
              {devNotice}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition-colors"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>

              <div className="text-center text-xs text-slate-500 mt-3">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Disposable emails blocked)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password (min 8 chars, 1 number, 1 special)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              {/* Consent Checkbox */}
              <div className="flex items-start gap-2.5 pt-1.5 pb-0.5">
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
                  <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 peer-checked:bg-indigo-600 peer-checked:border-indigo-500 peer-focus:ring-2 peer-focus:ring-indigo-500/40 transition-all flex items-center justify-center">
                    <Check className={`w-3 h-3 text-white transition-opacity stroke-[3] ${agreeToTerms ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                </label>
                <span className="text-xs text-slate-600 dark:text-slate-400 select-none leading-relaxed">
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
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
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
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Privacy Policy
                  </a>
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || !agreeToTerms}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs rounded-lg shadow-sm transition-colors mt-2"
              >
                {loading ? 'Creating Account...' : 'Sign Up & Send OTP'}
              </button>

              <div className="text-center text-xs text-slate-500 mt-2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* OTP VERIFICATION FORM */}
          {mode === 'otp' && (
            <OtpAnimatedVerification
              email={email}
              onVerify={(code) => verifyOtp(email, code)}
              onResend={() => resendOtp(email)}
              onSuccessComplete={handleSuccessFinish}
              onBackToLogin={() => setMode('login')}
              initialError={error}
              modeLabel="Verify Email OTP"
            />
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Enter your registered email address to receive a password reset OTP code.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition-colors"
              >
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 text-left">
                  New Password (Required)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 text-left mt-1.5">Please enter your new password before entering the OTP code.</p>
              </div>
            </OtpAnimatedVerification>
          )}
        </div>
      </div>
    </div>
  );
};
