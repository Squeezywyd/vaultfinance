import { useState } from 'react';
import { Fingerprint, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PinDots, NumberPad } from './PinPad';
import VaultLogo from './VaultLogo';

const PIN_LEN = 6;

export default function SetupScreen() {
  const { setupPIN, setupBiometrics, biometricAvail } = useAuth();
  const [step,    setStep]    = useState('intro');   // intro | pin | confirm | biometric
  const [pin,     setPin]     = useState('');
  const [confirm, setConfirm] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const biometricLabel = /iPhone/i.test(navigator.userAgent) ? 'Face ID' : 'Touch ID';

  function handlePinPress(digit) {
    if (step === 'pin') {
      const next = pin + digit;
      setPin(next);
      if (next.length === PIN_LEN) setTimeout(() => setStep('confirm'), 150);
    } else if (step === 'confirm') {
      setError('');
      const next = confirm + digit;
      setConfirm(next);
      if (next.length === PIN_LEN) {
        setTimeout(() => {
          if (next === pin) {
            finishPIN(next);
          } else {
            setError('PINs don\'t match. Try again.');
            setConfirm('');
          }
        }, 150);
      }
    }
  }

  function handleDelete() {
    if (step === 'pin')    setPin(p    => p.slice(0, -1));
    if (step === 'confirm') setConfirm(c => c.slice(0, -1));
  }

  async function finishPIN(confirmedPIN) {
    await setupPIN(confirmedPIN);
    setStep('biometric');
  }

  async function handleBiometric() {
    setLoading(true);
    const ok = await setupBiometrics();
    setLoading(false);
    if (!ok) setError(`${biometricLabel} setup failed. You can still use your PIN.`);
    // AuthContext sets status to 'unlocked' already from setupPIN; just skip biometric step
    // Nothing to do here — the app will show once biometric prompt closes either way
    // If ok, hasBiometrics is now true for future lock screens
  }

  // ── INTRO ────────────────────────────────────────────────────────────────
  if (step === 'intro') return (
    <FullScreen>
      <div className="flex flex-col items-center gap-6 px-8 pt-16 pb-8 text-center">
        <VaultLogo size={96} />
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Secure Vault</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Set up a PIN to protect your financial data.<br />
            Optionally add {biometricLabel} for quick access.
          </p>
        </div>
        <button
          onClick={() => setStep('pin')}
          className="mt-4 w-full py-4 rounded-2xl bg-indigo-500 text-white font-semibold text-lg flex items-center justify-center gap-2 active:bg-indigo-600 transition-colors"
        >
          Get Started <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </FullScreen>
  );

  // ── BIOMETRIC OFFER ───────────────────────────────────────────────────────
  if (step === 'biometric') return (
    <FullScreen>
      <div className="flex flex-col items-center gap-6 px-8 pt-16 pb-8 text-center">
        <div className="w-24 h-24 rounded-3xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
          <Fingerprint className="w-12 h-12 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Use {biometricLabel}?</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Unlock Vault instantly with {biometricLabel}.<br />
            Your PIN remains as a fallback.
          </p>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {biometricAvail ? (
          <button
            onClick={handleBiometric}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-violet-600 text-white font-semibold text-lg flex items-center justify-center gap-2 active:bg-violet-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Setting up…' : `Enable ${biometricLabel}`}
            {!loading && <Fingerprint className="w-5 h-5" />}
          </button>
        ) : (
          <p className="text-white/30 text-sm">{biometricLabel} not available on this device.</p>
        )}

        <button
          onClick={() => { /* status already 'unlocked' from setupPIN */ }}
          className="text-white/40 text-sm py-2"
        >
          Skip for now
        </button>
      </div>
    </FullScreen>
  );

  // ── PIN ENTRY (create + confirm) ──────────────────────────────────────────
  const isConfirmStep = step === 'confirm';
  const current = isConfirmStep ? confirm : pin;

  return (
    <FullScreen>
      <div className="flex flex-col items-center pt-16 pb-8 w-full">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-2">
          {isConfirmStep ? 'Confirm PIN' : 'Create PIN'}
        </p>
        <h2 className="text-xl font-semibold text-white mb-1">
          {isConfirmStep ? 'Enter your PIN again' : 'Choose a 6-digit PIN'}
        </h2>
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}

        <PinDots filled={current.length} />

        <NumberPad onPress={handlePinPress} onDelete={handleDelete} />

        {isConfirmStep && (
          <button
            onClick={() => { setStep('pin'); setPin(''); setConfirm(''); setError(''); }}
            className="mt-6 text-white/40 text-sm"
          >
            ← Start over
          </button>
        )}
      </div>
    </FullScreen>
  );
}

function FullScreen({ children }) {
  return (
    <div className="fixed inset-0 bg-[#07070f] flex flex-col items-center justify-start overflow-y-auto z-50">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-8 w-56 h-56 bg-violet-600/8 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
