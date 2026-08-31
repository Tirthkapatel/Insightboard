import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { User, ShieldAlert, LogOut, Trash2, KeyRound, AlertTriangle, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, logoutAllDevices, deleteAccount, inviteUser } = useAuth();

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleLogoutAll = async () => {
    setLoading(true);
    setError(null);
    const res = await logoutAllDevices();
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to logout from all devices.');
    }
  };

  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await deleteAccount(confirmPassword);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to delete account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-sm">Account Settings & Security</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 rounded-lg">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 rounded-lg">
              {successMsg}
            </div>
          )}

          {/* Profile Details */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-500">Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-500">Email:</span>
              <span className="font-mono text-slate-900 dark:text-white">{user.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-500">Role:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{user.role}</span>
            </div>
          </div>

          {/* User Management (Admin Only) */}
          {user.role === 'admin' && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Invite Users
              </h4>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const email = formData.get('email') as string;
                const role = formData.get('role') as 'admin' | 'viewer';
                setLoading(true);
                setError(null);
                setSuccessMsg(null);
                const res = await inviteUser(email, role);
                setLoading(false);
                if (res.success) {
                  setSuccessMsg(`Invite sent successfully to ${email}.`);
                  (e.target as HTMLFormElement).reset();
                } else {
                  setError(res.error || 'Failed to send invite.');
                }
              }} className="space-y-3">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="User's Email Address"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex items-center gap-3">
                  <select
                    name="role"
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="viewer">Viewer (Read Only)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    {loading ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sessions Action */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Session Management
            </h4>
            <button
              onClick={handleLogoutAll}
              disabled={loading}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Out From All Devices & Sessions
            </button>
          </div>

          {/* Destructive Zone: Account Deletion */}
          <div className="border-t border-rose-100 dark:border-rose-950/80 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h4>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete My Account
              </button>
            ) : (
              <form onSubmit={handleDeleteAccountSubmit} className="space-y-3 p-3 bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl">
                <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                  Deleting your account will permanently remove all your saved dashboards, queries, and datasets. Enter your password to confirm.
                </p>

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 rounded-lg text-xs text-slate-900 dark:text-white"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
                  >
                    {loading ? 'Deleting...' : 'Confirm Account Deletion'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
