import React, { useRef, useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { hashPasscode } from "@/utils/crypto";
import { setItem } from "@/utils/storage";
import { STORAGE_KEYS } from "@/types";
import { useAuth } from "../context/AuthContext";

const PASSCODE_LENGTH = 6;

const SetPasscodePage: React.FC = () => {
  const { onPasscodeSet } = useAuth();
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [firstCode, setFirstCode] = useState("");
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
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleNext = async () => {
    if (currentCode.length < PASSCODE_LENGTH) {
      setError("Enter a 6-digit passcode");
      return;
    }
    if (step === "enter") {
      setFirstCode(currentCode);
      setDigits(Array(PASSCODE_LENGTH).fill(""));
      setStep("confirm");
      setError("");
      setTimeout(() => inputs.current[0]?.focus(), 50);
    } else {
      if (currentCode !== firstCode) {
        setError("Passcodes do not match. Try again.");
        setDigits(Array(PASSCODE_LENGTH).fill(""));
        setTimeout(() => inputs.current[0]?.focus(), 50);
        return;
      }
      setLoading(true);
      try {
        const hash = await hashPasscode(currentCode);
        await Promise.all([
          setItem(STORAGE_KEYS.PASSCODE_HASH, hash),
          setItem(STORAGE_KEYS.PASSCODE_LAST_UNLOCK, Date.now()),
        ]);
        onPasscodeSet();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-[560px] flex-col items-center justify-center px-6 py-8">
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
          <ShieldCheck size={26} className="text-white" />
        </div>
        <h2 className="text-lg font-bold text-white">
          {step === "enter" ? "Set a Passcode" : "Confirm Passcode"}
        </h2>
        <p className="text-center text-sm text-slate-400">
          {step === "enter"
            ? "Choose a 6-digit passcode to secure your extension"
            : "Re-enter your passcode to confirm"}
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

      <button
        onClick={handleNext}
        disabled={loading || currentCode.length < PASSCODE_LENGTH}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {step === "enter"
          ? "Continue"
          : loading
            ? "Saving…"
            : "Confirm & Continue"}
      </button>
    </div>
  );
};

export default SetPasscodePage;
