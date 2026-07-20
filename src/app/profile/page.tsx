'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/zustand/stores';
import { updateUserProfileData, sendPasswordResetService } from '@/services/firebase';
import { AuthLogoMark } from '@/features/auth/components/AuthLogoMark';
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, resendVerification } = useAuth();
  const { setUser } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [consents, setConsents] = useState({
    terms: true,
    marketing: false,
    whatsapp: false,
    liveLocation: false,
  });

  const [saving, setSaving] = useState(false);
  const [resetSending, setResetSending] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || user.displayName?.split(' ')[0] || '');
      setLastName(user.lastName || user.displayName?.split(' ').slice(1).join(' ') || '');
      setDob(user.dob || '');
      setGender(user.gender || 'prefer_not_to_say');
      if (user.consents) {
        setConsents({
          terms: user.consents.terms ?? true,
          marketing: user.consents.marketing ?? false,
          whatsapp: user.consents.whatsapp ?? false,
          liveLocation: user.consents.liveLocation ?? false,
        });
      }
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updatedDisplayName = `${firstName} ${lastName}`.trim() || 'Operator User';
      await updateUserProfileData(user.uid, {
        firstName,
        lastName,
        displayName: updatedDisplayName,
        dob: dob || null,
        gender: gender || null,
        consents,
      });

      setUser({
        ...user,
        firstName,
        lastName,
        displayName: updatedDisplayName,
        dob: dob || null,
        gender: gender || null,
        consents,
      });

      toast.success('Profile information updated successfully.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendReset = async () => {
    if (!user?.email) return;
    setResetSending(true);
    try {
      await sendPasswordResetService(user.email);
      toast.success('Password reset link sent to your email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link.');
    } finally {
      setResetSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-primary)]/40 pb-6">
          <div className="flex items-center gap-4">
            <AuthLogoMark iconSize="text-[26px]" containerSize="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Account & Profile Settings
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Manage your personal details, microgrid operator credentials, and consent preferences.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-sm font-semibold hover:border-[var(--color-primary)] transition-all"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Summary Card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-6 space-y-6 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-primary-focus)] flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'O'}
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    {user?.displayName || 'Operator User'}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{user?.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                    {user?.role || 'operator'}
                  </span>
                  {user?.emailVerified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      <CheckCircle2 size={12} /> Verified Email
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      <AlertCircle size={12} /> Unverified
                    </span>
                  )}
                </div>
              </div>

              {!user?.emailVerified && (
                <div className="pt-2 border-t border-[var(--border-primary)]/40">
                  <button
                    type="button"
                    onClick={resendVerification}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors border border-amber-500/30 cursor-pointer"
                  >
                    Resend Verification Email
                  </button>
                </div>
              )}
            </div>

            {/* Security Actions Card */}
            <div className="rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 text-[var(--color-primary)] font-bold">
                <Lock size={18} />
                <h3>Account Security</h3>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Need to change your password or verify two-factor authentication? Trigger a secure password reset link.
              </p>
              <button
                type="button"
                onClick={handleSendReset}
                disabled={resetSending}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {resetSending ? (
                  <><Loader2 className="size-4 animate-spin" /> Sending Link...</>
                ) : (
                  <><Mail size={14} /> Send Password Reset Email</>
                )}
              </button>
            </div>
          </div>

          {/* Right Edit Form (2 cols) */}
          <div className="md:col-span-2 rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-6 md:p-8 space-y-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-primary)]/40 pb-4">
              Edit Profile Information
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--bg-base)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--bg-base)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--bg-base)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Gender Identity
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--bg-base)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                  >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Consents Section */}
              <div className="space-y-3 pt-4 border-t border-[var(--border-primary)]/40">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Communication & Telemetry Consents</h3>
                <div className="space-y-2.5">
                  {[
                    { key: 'marketing', label: 'Receive weekly AI forecasting & energy optimization digests' },
                    { key: 'whatsapp', label: 'Enable emergency high-priority WhatsApp telemetry alerts' },
                    { key: 'liveLocation', label: 'Share active operator terminal geolocation during grid maintenance' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                      <input
                        type="checkbox"
                        checked={consents[key as keyof typeof consents]}
                        onChange={(e) =>
                          setConsents({ ...consents, [key]: e.target.checked })
                        }
                        className="rounded border-[var(--border-primary)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] size-4 cursor-pointer"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-focus)] text-[var(--text-inverse)] shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <><Loader2 className="size-4 animate-spin" /> Saving Changes...</>
                  ) : (
                    <><Save size={16} /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
