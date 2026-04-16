import React, { useState } from "react";
import {
  ArrowLeft,
  Shield,
  RefreshCw,
  LogOut,
  Loader2,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBookmarks } from "../context/BookmarkContext";

interface Props {
  onBack: () => void;
}

const SettingsPage: React.FC<Props> = ({ onBack }) => {
  const { settings, updateSettings, logout } = useAuth();
  const { refresh, loading: syncing } = useBookmarks();
  const [syncDone, setSyncDone] = useState(false);
  const [savingTimeout, setSavingTimeout] = useState(false);
  const [timeoutInput, setTimeoutInput] = useState(
    String(settings.passcodeTimeoutMinutes),
  );

  const handleSaveTimeout = async () => {
    const val = Number(timeoutInput);
    if (isNaN(val) || val < 1) return;
    setSavingTimeout(true);
    await updateSettings({ passcodeTimeoutMinutes: val });
    setTimeout(() => setSavingTimeout(false), 800);
  };

  const handleSync = async () => {
    await refresh();
    setSyncDone(true);
    setTimeout(() => setSyncDone(false), 2000);
  };

  return (
    <div className="flex min-h-[560px] flex-col px-4 py-4">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="font-bold text-white">Settings</h2>
      </div>

      <div className="space-y-3">
        {/* Passcode timeout */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Shield size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Passcode Lock</h3>
          </div>
          <p className="mb-3 text-xs text-slate-400">
            Ask for passcode after the extension has been closed for this many
            minutes.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={1440}
              value={timeoutInput}
              onChange={(e) => setTimeoutInput(e.target.value)}
              className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-white outline-none focus:border-indigo-500"
            />
            <span className="text-sm text-slate-400">minutes</span>
            <button
              onClick={handleSaveTimeout}
              disabled={savingTimeout}
              className="ml-auto flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {savingTimeout ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Save
            </button>
          </div>
        </div>

        {/* Sync */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <RefreshCw size={16} className="text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Sync Bookmarks</h3>
          </div>
          <p className="mb-3 text-xs text-slate-400">
            Bookmarks auto-sync every 5 minutes. Tap below to force a sync now.
          </p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            {syncing ? (
              <RefreshCw size={14} className="animate-spin text-purple-400" />
            ) : syncDone ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <RefreshCw size={14} className="text-slate-400" />
            )}
            {syncing ? "Syncing…" : syncDone ? "Synced!" : "Sync Now"}
          </button>
        </div>

        {/* Account */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Account</h3>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:border-red-500/50 hover:bg-red-500/20"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
