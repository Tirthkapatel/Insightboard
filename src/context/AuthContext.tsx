import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types.js';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<{ success: boolean; requiresOtp?: boolean; unverifiedEmail?: string; error?: string }>;
  signup: (name: string, email: string, pass: string, confirmPass: string, role: string) => Promise<{ success: boolean; email?: string; devOtpCode?: string; error?: string }>;
  verifyOtp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; devOtpCode?: string; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; devOtpCode?: string; error?: string }>;
  resetPassword: (email: string, code: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  logoutAllDevices: () => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (password: string) => Promise<{ success: boolean; error?: string }>;
  inviteUser: (email: string, role: 'admin' | 'viewer') => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ib_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load current user on mount
  useEffect(() => {
    async function loadMe() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Clear invalid token
          setToken(null);
          localStorage.removeItem('ib_token');
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMe();
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          requiresOtp: data.requiresOtp,
          unverifiedEmail: data.unverifiedEmail,
          error: data.error || 'Login failed.'
        };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('ib_token', data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error during login.' };
    }
  };

  const signup = async (name: string, email: string, pass: string, confirmPass: string, role: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, confirmPassword: confirmPass, role })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed.' };
      }

      return { success: true, email: data.email, devOtpCode: data.devOtpCode };
    } catch (err) {
      return { success: false, error: 'Network error during signup.' };
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'OTP verification failed.' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('ib_token', data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error during OTP verification.' };
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to resend OTP.' };
      }

      return { success: true, devOtpCode: data.devOtpCode };
    } catch (err) {
      return { success: false, error: 'Network error during OTP request.' };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, devOtpCode: data.devOtpCode };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const resetPassword = async (email: string, code: string, newPass: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: newPass })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ib_token');
    sessionStorage.removeItem('ib_last_view');
  };

  const logoutAllDevices = async () => {
    try {
      if (!token) return { success: false, error: 'Not logged in.' };
      const res = await fetch('/api/auth/logout-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        logout();
        return { success: true };
      }
      const data = await res.json();
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const inviteUser = async (email: string, role: 'admin' | 'viewer') => {
    try {
      if (!token) return { success: false, error: 'Not logged in.' };
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, role })
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      if (!token) return { success: false, error: 'Not logged in.' };
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete account.' };
      }

      logout();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error during account deletion.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        logout,
        logoutAllDevices,
        deleteAccount,
        inviteUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
