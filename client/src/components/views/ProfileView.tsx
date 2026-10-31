import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.js';
import { User, KeyRound, Smartphone, Check, UserPlus, Shield, Copy, LogOut } from 'lucide-react';
import { api } from '../../services/api.js';

export const ProfileView: React.FC = () => {
  const { currentUser, otrkKey, loginWithOtrk, logout, registerNewUser } = useApp();

  const [inputKey, setInputKey] = useState(otrkKey);
  const [fcmToken, setFcmToken] = useState('SAMPLE_FCM_DEVICE_TOKEN_' + Math.random().toString(36).substring(2, 8));
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [profession, setProfession] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOtrkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    setStatusMsg(null);
    const success = await loginWithOtrk(inputKey.trim());
    if (success) {
      setStatusMsg({ type: 'success', text: 'Authentication successful! OTRK linked.' });
    } else {
      setStatusMsg({ type: 'error', text: 'OTRK token not found in registry.' });
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const created = await registerNewUser({ name, email, contact, profession });
      setInputKey(created.id);
      setName('');
      setEmail('');
      setContact('');
      setProfession('');
      setStatusMsg({ type: 'success', text: `Registered successfully! Assigned OTRK: ${created.id}` });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to register user' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterDeviceToken = async () => {
    if (!otrkKey || !fcmToken) return;
    try {
      await api.registerDevice(otrkKey, fcmToken);
      setStatusMsg({ type: 'success', text: 'Device FCM token updated for push alerts!' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update device token' });
    }
  };

  const copyOtrk = () => {
    if (otrkKey) {
      navigator.clipboard.writeText(otrkKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Identity & Device Management</h1>
        <p className="text-sm text-slate-400">
          Authenticate using your One-Time Registration Key (OTRK) and configure push notification devices.
        </p>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center space-x-2 ${
          statusMsg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Current Active User Profile Card */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white">
                  {currentUser ? currentUser.name : 'Unregistered User'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {currentUser ? 'VERIFIED' : 'GUEST'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser?.profession || 'IoT Resident'} • {currentUser?.email || 'No email attached'}
              </p>
            </div>
          </div>

          {currentUser && (
            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5 self-start sm:self-center"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Unlink Token</span>
            </button>
          )}
        </div>

        {/* OTRK Token Badge & Copy */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              One-Time Registration Key (OTRK)
            </span>
            <span className="text-sm font-mono font-bold text-blue-400 select-all">
              {otrkKey || 'No token active'}
            </span>
          </div>

          {otrkKey && (
            <button
              onClick={copyOtrk}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center space-x-1.5 self-start sm:self-center"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Key'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Switch / Enter OTRK Token Form */}
        <div className="glass-panel p-6">
          <div className="flex items-center space-x-2.5 mb-4">
            <KeyRound className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Authenticate With Existing Key</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Enter an existing token issued to your mobile app or IoT server credentials.
          </p>

          <form onSubmit={handleOtrkSubmit} className="space-y-4">
            <div className="field">
              <label htmlFor="otrk-input">OTRK Access Key</label>
              <span id="otrk-hint" className="hint">Example: DEMO-OTRK-999 or OTRK_...</span>
              <input
                id="otrk-input"
                type="text"
                required
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Enter OTRK token"
                aria-describedby="otrk-hint"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <div className="error-msg">Please enter a valid OTRK token.</div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/30"
            >
              Verify & Switch User
            </button>
          </form>

          {/* FCM Push Token Registration */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                FCM Push Token Sync
              </h4>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={fcmToken}
                onChange={(e) => setFcmToken(e.target.value)}
                placeholder="FCM Device Token"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleRegisterDeviceToken}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
              >
                Sync Device
              </button>
            </div>
          </div>
        </div>

        {/* Register New User Form with Accessible Validation */}
        <div className="glass-panel p-6">
          <div className="flex items-center space-x-2.5 mb-4">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Register New IoT User</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Generates a brand new unique OTRK token and registers the resident in the database.
          </p>

          <form onSubmit={handleRegisterUser} className="space-y-3">
            <div className="field">
              <label htmlFor="user-name">Full Name</label>
              <span id="name-hint" className="hint">Legal or household resident name</span>
              <input
                id="user-name"
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Patel"
                aria-describedby="name-hint"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="error-msg">Name must contain at least 2 characters.</div>
            </div>

            <div className="field">
              <label htmlFor="user-email">Email Address</label>
              <span id="email-hint" className="hint">Receives initial OTRK token link</span>
              <input
                id="user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maya.patel@example.com"
                aria-describedby="email-hint"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="error-msg">Please enter a valid email address.</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="field">
                <label htmlFor="user-contact">Contact Phone</label>
                <input
                  id="user-contact"
                  type="tel"
                  required
                  minLength={5}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+1-555-0182"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="error-msg">Phone must be at least 5 digits.</div>
              </div>

              <div className="field">
                <label htmlFor="user-prof">Profession (Optional)</label>
                <input
                  id="user-prof"
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Architect"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Resident & Issue OTRK'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
