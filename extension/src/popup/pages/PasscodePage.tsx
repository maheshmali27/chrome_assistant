import React, { useRef, useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { verifyPasscode } from "@/utils/crypto";
import { getItem, setItem } from "@/utils/storage";
import { STORAGE_KEYS } from "@/types";
import { useAuth } from "../context/AuthContext";

const PASSCODE_LENGTH = 6;

const PasscodePage: React.FC = () => {
  const { onPasscodeVerified, logout } = useAuth();
  const [digits, setDigits] = useState<string[]>(
    Array(PASSCODE_LENGTH).fill(""),
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const currentCode = digits.join("");

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < PASSCODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (value && index === PASSCODE_LENGTH - 1) {
      const full = next.join("");
      if (full.length === PASSCODE_LENGTH) verify(full);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && currentCode.length === PASSCODE_LENGTH) {
      verify(currentCode);
    }
  };

  const verify = async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const storedHash = await getItem<string>(STORAGE_KEYS.PASSCODE_HASH);
      if (!storedHash) {
        setError("No passcode found. Please log in again.");
        return;
      }
      const valid = await verifyPasscode(code, storedHash);
      if (valid) {
        await setItem(STORAGE_KEYS.PASSCODE_LAST_UNLOCK, Date.now());
        onPasscodeVerified();
      } else {
        setError("Incorrect passcode. Try again.");
        setDigits(Array(PASSCODE_LENGTH).fill(""));
        setTimeout(() => inputs.current[0]?.focus(), 50);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[560px] flex-col items-center justify-center px-6 py-8">
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
          <Lock size={26} className="text-white" />
        </div>
        <h2 className="text-lg font-bold text-white">Enter Passcode</h2>
        <p className="text-sm text-slate-400">
          Enter your 6-digit passcode to continue
        </p>
      </div>

      <div className="mb-6 flex gap-3">
        {Array.from({ length: PASSCODE_LENGTH }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digits[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            autoFocus={i === 0}
            className="h-12 w-10 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-bold text-white outline-none focus:border-indigo-500 focus:bg-white/10 transition"
          />
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs text-red-400">
          {error}
        </p>
      )}

      {loading && (
        <div className="mb-4">
          <Loader2 size={20} className="animate-spin text-indigo-400" />
        </div>
      )}

      <button
        onClick={() => logout()}
        className="mt-4 text-xs text-slate-500 underline hover:text-slate-300"
      >
        Sign in with a different account
      </button>
    </div>
  );
};

export default PasscodePage;
