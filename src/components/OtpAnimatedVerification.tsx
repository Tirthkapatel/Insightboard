import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowLeft } from 'lucide-react';

interface OtpAnimatedVerificationProps {
  email: string;
  onVerify: (code: string) => Promise<{ success: boolean; error?: string }>;
  onResend: () => Promise<{ success: boolean; error?: string }>;
  onSuccessComplete: () => void;
  onBackToLogin?: () => void;
  initialError?: string | null;
  modeLabel?: string;
  children?: React.ReactNode;
}

export const OtpAnimatedVerification: React.FC<OtpAnimatedVerificationProps> = ({
  email,
  onVerify,
  onResend,
  onSuccessComplete,
  onBackToLogin,
  initialError,
  modeLabel = 'Verify Email OTP',
  children,
}) => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [glowIntensity, setGlowIntensity] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError || null);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [shake, setShake] = useState<boolean>(false);

  // Stage for the success checkmark animation: 'dot' | 'checkmark' | 'calm'
  const [checkStage, setCheckStage] = useState<'dot' | 'checkmark' | 'calm'>('dot');

  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input focused automatically
  useEffect(() => {
    if (!verificationSuccess && !isVerifying) {
      inputRef.current?.focus();
    }
  }, [verificationSuccess, isVerifying]);

  const otpCode = digits.join('');

  // Handle hidden input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 6);
    const newDigits = Array(6).fill('');
    for (let i = 0; i < rawVal.length; i++) {
      newDigits[i] = rawVal[i];
    }
    setDigits(newDigits);
    setErrorMsg(null);
    setFocusedIndex(Math.min(rawVal.length, 5));

    // Auto trigger verification when all 6 digits are filled
    if (rawVal.length === 6 && !isVerifying && !verificationSuccess) {
      triggerVerification(rawVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otpCode.length > 0) {
      setErrorMsg(null);
    }
  };

  const triggerVerification = async (codeToVerify: string) => {
    setIsVerifying(true);
    setGlowIntensity(true);
    setErrorMsg(null);

    // Glow build-up effect duration (~700ms) before API check completes
    const glowTimer = new Promise((resolve) => setTimeout(resolve, 700));

    try {
      const [res] = await Promise.all([onVerify(codeToVerify), glowTimer]);

      if (res.success) {
        // Step 3: Transition to success state
        setVerificationSuccess(true);
        setIsVerifying(false);

        // Step 4: Dot-to-checkmark morph sequence
        // 1) Start as dot
        setCheckStage('dot');
        // 2) Morph dot to checkmark after 350ms
        setTimeout(() => {
          setCheckStage('checkmark');
        }, 350);
        // 3) Settle into steady calm glow after 850ms
        setTimeout(() => {
          setCheckStage('calm');
        }, 850);

        // Step 5: Final state pause then redirect
        setTimeout(() => {
          onSuccessComplete();
        }, 1800);
      } else {
        setIsVerifying(false);
        setGlowIntensity(false);
        setErrorMsg(res.error || 'Verification failed. Please check your OTP code.');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } catch (err: any) {
      setIsVerifying(false);
      setGlowIntensity(false);
      setErrorMsg(err.message || 'Verification error occurred.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setErrorMsg(null);
    setResendNotice(null);
    try {
      const res = await onResend();
      if (res.success) {
        setResendNotice('A fresh 6-digit OTP code has been sent!');
        setDigits(Array(6).fill(''));
        setFocusedIndex(0);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        setErrorMsg(res.error || 'Failed to resend OTP.');
      }
    } catch {
      setErrorMsg('Network error while resending code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <AnimatePresence mode="wait">
        {!verificationSuccess ? (
          /* ========================================== */
          /* STAGE 1 & 2: INPUT & GLOW BUILD-UP STAGE   */
          /* ========================================== */
          <motion.div
            key="otp-input-stage"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 text-center"
          >
            {/* Header */}
            <div>
              <motion.h3
                className="text-xl font-bold text-white tracking-tight"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {modeLabel}
              </motion.h3>
              <p className="text-xs text-slate-400 mt-1.5">
                Verification code sent to <span className="text-indigo-300 font-medium">{email}</span>
              </p>
            </div>
            
            {children && (
              <div className="w-full mb-4">
                {children}
              </div>
            )}

            {/* OTP 6-Box Input Container */}
            <div className="relative py-2">
              {/* Hidden input overlay for full accessibility & mobile focus */}
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otpCode}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocusedIndex(Math.min(otpCode.length, 5))}
                disabled={isVerifying}
                className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-pointer disabled:cursor-wait"
                autoComplete="one-time-code"
                autoFocus
              />

              {/* 6 Digit Box Grid */}
              <motion.div
                animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center gap-2 sm:gap-3"
              >
                {digits.map((digit, idx) => {
                  const isCurrentFocused = idx === Math.min(otpCode.length, 5) && !isVerifying;
                  const isFilled = digit !== '';

                  return (
                    <motion.div
                      key={idx}
                      className="relative w-11 h-13 sm:w-12 sm:h-14 rounded-xl flex items-center justify-center text-xl font-mono font-bold select-none transition-colors duration-200"
                      animate={{
                        boxShadow: glowIntensity
                          ? [
                              '0 0 8px rgba(99,102,241,0.3)',
                              '0 0 22px rgba(129,140,248,0.85), inset 0 0 10px rgba(99,102,241,0.5)',
                              '0 0 35px rgba(165,180,252,1), inset 0 0 16px rgba(129,140,248,0.7)',
                            ]
                          : isCurrentFocused
                          ? '0 0 14px rgba(99,102,241,0.45)'
                          : '0 0 0px rgba(0,0,0,0)',
                        borderColor: glowIntensity
                          ? 'rgba(165,180,252,0.9)'
                          : isCurrentFocused
                          ? 'rgba(99,102,241,1)'
                          : errorMsg
                          ? 'rgba(239,68,68,0.6)'
                          : isFilled
                          ? 'rgba(99,102,241,0.5)'
                          : 'rgba(51,65,85,0.6)',
                        backgroundColor: glowIntensity
                          ? 'rgba(30,27,75,0.9)'
                          : isCurrentFocused
                          ? 'rgba(30,27,75,0.6)'
                          : 'rgba(15,23,42,0.8)',
                      }}
                      transition={{
                        boxShadow: glowIntensity
                          ? { duration: 0.7, repeat: Infinity, repeatType: 'reverse' }
                          : { duration: 0.2 },
                        borderColor: { duration: 0.2 },
                        backgroundColor: { duration: 0.2 },
                      }}
                      style={{
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                      }}
                    >
                      {/* Focus Ring Indicator */}
                      {isCurrentFocused && !glowIntensity && (
                        <motion.div
                          layoutId="focus-ring"
                          className="absolute -inset-[3px] rounded-[14px] border-2 border-indigo-500/80 pointer-events-none"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}

                      {/* Digit character pop-in animation */}
                      <AnimatePresence mode="wait">
                        {digit ? (
                          <motion.span
                            key={`digit-${digit}-${idx}`}
                            initial={{ scale: 0.7, opacity: 0, y: 4 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                            className="text-white drop-shadow-[0_0_8px_rgba(165,180,252,0.5)]"
                          >
                            {digit}
                          </motion.span>
                        ) : (
                          <motion.span
                            key="placeholder"
                            className="w-1.5 h-1.5 rounded-full bg-slate-700/60"
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Error or Notice messages */}
            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 px-3 py-2 rounded-lg font-medium"
              >
                {errorMsg}
              </motion.p>
            )}

            {resendNotice && !errorMsg && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-2 rounded-lg font-medium"
              >
                {resendNotice}
              </motion.p>
            )}

            {/* Resend and Back Controls */}
            <div className="flex items-center justify-between text-xs pt-2 text-slate-400">
              <button
                type="button"
                onClick={handleResend}
                disabled={isVerifying || resendLoading}
                className="text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition-colors flex items-center gap-1.5 font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>

              {onBackToLogin && (
                <button
                  type="button"
                  onClick={onBackToLogin}
                  disabled={isVerifying}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          /* ========================================== */
          /* STAGE 3, 4 & 5: SUCCESS & CHECKMARK ANIM   */
          /* ========================================== */
          <motion.div
            key="otp-success-stage"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-6 text-center space-y-5"
          >
            {/* Glow square container with Dot-to-Checkmark morph */}
            <div className="relative flex items-center justify-center">
              {/* Pulsating background aura glow */}
              <motion.div
                animate={{
                  boxShadow:
                    checkStage === 'calm'
                      ? '0 0 25px rgba(99,102,241,0.45), 0 0 50px rgba(139,92,246,0.2)'
                      : '0 0 45px rgba(129,140,248,0.85), 0 0 80px rgba(99,102,241,0.5)',
                  scale: checkStage === 'calm' ? 1 : [1, 1.08, 1],
                }}
                transition={{
                  duration: checkStage === 'calm' ? 1.5 : 0.6,
                  repeat: checkStage === 'calm' ? Infinity : 0,
                  repeatType: 'reverse',
                }}
                className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl"
              />

              {/* Main rounded square card */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="relative w-20 h-20 bg-slate-900/90 border border-indigo-500/60 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] backdrop-blur-md"
              >
                <AnimatePresence mode="wait">
                  {checkStage === 'dot' ? (
                    /* Initial Glowing Dot in center of square */
                    <motion.div
                      key="glowing-dot"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.3, 1] }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-4 h-4 rounded-full bg-indigo-400 shadow-[0_0_15px_#818cf8]"
                    />
                  ) : (
                    /* Checkmark SVG with animated path length draw-in */
                    <motion.svg
                      key="checkmark-svg"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.8)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <motion.path
                        d="M20 6L9 17l-5-5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                      />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Success Heading & Subtitle */}
            <div className="space-y-1">
              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="text-xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400"
              >
                Verified successfully
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="text-xs text-slate-400"
              >
                Your account email has been authenticated.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
