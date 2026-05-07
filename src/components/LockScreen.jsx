import { useEffect, useState, useCallback } from 'react';
import { Fingerprint } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PinDots, NumberPad } from './PinPad';
import VaultLogo from './VaultLogo';

const PIN_LEN = 6;

export default function LockScreen() {
  const { hasBiometrics, biometricAvail, unlockWithPIN, unlockWithBiometrics } = useAuth();
  const [pin,     setPin]     = useState('');
  const [error,   setError]   = useState('');
  const [shake,   setShake]   = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

  const biometricLabel = /iPhone/i.test(navigator.userAgent) ? 'Face ID' : 'Touch ID';
  const canBiometric = hasBiometrics && biometricAvail;

  const triggerBiometric = useCallback(async () => {
    if (!canBiometric || bioLoading) return;
    setBioLoading(true);
    setError('');
    const ok = await unlockWithBiometrics();
    setBioLoading(false);
    if (!ok) setError(`${biometricLabel} failed. Enter your PIN.`);
  }, [canBiometric, bioLoading, unlockWithBiometrics, biometricLabel]);

  // Auto-trigger biometrics when lock screen first appears
  useEffect(() => {
    if (canBiometric) {
      const timer = setTimeout(triggerBiometric, 300);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  async function handleDigit(digit) {
    if (pin.length >= PIN_LEN) return;
    setError('');
    const next = pin + digit;
    setPin(next);

    if (next.length === PIN_LEN) {
      // Small delay so last dot fills visually
      setTimeout(async () => {
        const ok = await unlockWithPIN(next);
        if (!ok) {
          setShake(true);
          setError('Incorrect PIN');
          setPin('');
          setTimeout(() => setShake(false), 500);
        }
      }, 150);
    }
  }

  function handleDelete() {
    setPin(p => p.slice(0, -1));
    setError('');
  }

  const biometricButton = canBiometric ? (
    <button
      onPointerDown={e => { e.preventDefault(); triggerBiometric(); }}
      disabled={bioLoading}
      className="h-16 w-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center active:bg-violet-500/20 transition-colors disabled:opacity-40 mx-auto"
    >
      <Fingerprint className="w-7 h-7" />
    </button>
  ) : null;

  // Current time for the lock screen
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 bg-[#07070f] flex flex-col items-center z-50">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-8 w-56 h-56 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center h-full pt-14 pb-8">
        {/* Clock */}
        <p className="text-6xl font-thin text-white tracking-tight">{timeStr}</p>
        <p className="text-white/40 text-sm mt-1">{dateStr}</p>

        {/* Logo / brand */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <VaultLogo size={64} />
          <p className="text-white/60 text-sm font-medium tracking-wide uppercase">Vault</p>
        </div>

        {/* PIN dots */}
        <PinDots filled={pin.length} shake={shake} />

        {/* Error */}
        <div className="h-5 mb-2">
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>

        {/* Number pad with biometric in bottom-left */}
        <NumberPad
          onPress={handleDigit}
          onDelete={handleDelete}
          extraKey={
            canBiometric ? (
              <button
                onPointerDown={e => { e.preventDefault(); triggerBiometric(); }}
                disabled={bioLoading}
                className="h-16 w-full rounded-2xl text-violet-400 flex items-center justify-center active:bg-violet-500/10 transition-colors disabled:opacity-40"
                title={biometricLabel}
              >
                <Fingerprint className="w-7 h-7" />
              </button>
            ) : null
          }
        />

        {/* Biometric label hint */}
        {canBiometric && (
          <p className="text-white/25 text-xs mt-4">
            {bioLoading ? `Waiting for ${biometricLabel}…` : `or use ${biometricLabel}`}
          </p>
        )}
      </div>
    </div>
  );
}
