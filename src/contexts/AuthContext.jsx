import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

const KEYS = {
  PIN_HASH:     'vault_auth_pin_hash',
  CREDENTIAL:   'vault_auth_credential_id',
  IS_SETUP:     'vault_auth_setup',
};

// Lock 30 s after app goes to background
const AUTO_LOCK_MS = 30_000;

async function hashPIN(pin) {
  const data = new TextEncoder().encode(pin + 'vault_pin_v1');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export function AuthProvider({ children }) {
  // 'loading' | 'setup' | 'locked' | 'unlocked'
  const [status,           setStatus]           = useState('loading');
  const [hasBiometrics,    setHasBiometrics]    = useState(false);
  const [biometricAvail,   setBiometricAvail]   = useState(false);
  const lockTimer = useRef(null);

  useEffect(() => {
    async function init() {
      const isSetup     = localStorage.getItem(KEYS.IS_SETUP) === 'true';
      const hasCredId   = !!localStorage.getItem(KEYS.CREDENTIAL);
      setHasBiometrics(hasCredId);

      if (window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) {
        try {
          const ok = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvail(ok);
        } catch { /* ignore */ }
      }

      setStatus(isSetup ? 'locked' : 'setup');
    }
    init();
  }, []);

  // Auto-lock when app goes to background
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        lockTimer.current = setTimeout(
          () => setStatus(s => s === 'unlocked' ? 'locked' : s),
          AUTO_LOCK_MS
        );
      } else {
        clearTimeout(lockTimer.current);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const setupPIN = useCallback(async (pin) => {
    const hash = await hashPIN(pin);
    localStorage.setItem(KEYS.PIN_HASH, hash);
    localStorage.setItem(KEYS.IS_SETUP, 'true');
    setStatus('unlocked');
  }, []);

  const unlockWithPIN = useCallback(async (pin) => {
    const stored = localStorage.getItem(KEYS.PIN_HASH);
    if (!stored) return false;
    const hash = await hashPIN(pin);
    if (hash === stored) { setStatus('unlocked'); return true; }
    return false;
  }, []);

  const setupBiometrics = useCallback(async () => {
    try {
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: 'Vault', id: window.location.hostname },
          user: {
            id: new TextEncoder().encode('vault-user-001'),
            name: 'vault@local',
            displayName: 'Vault User',
          },
          pubKeyCredParams: [
            { alg: -7,   type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60_000,
        },
      });
      const id = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
      localStorage.setItem(KEYS.CREDENTIAL, id);
      setHasBiometrics(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const unlockWithBiometrics = useCallback(async () => {
    const idB64 = localStorage.getItem(KEYS.CREDENTIAL);
    if (!idB64) return false;
    try {
      const idBytes = Uint8Array.from(atob(idB64), c => c.charCodeAt(0));
      await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{ type: 'public-key', id: idBytes, transports: ['internal'] }],
          userVerification: 'required',
          timeout: 60_000,
        },
      });
      setStatus('unlocked');
      return true;
    } catch {
      return false;
    }
  }, []);

  const lock = useCallback(() => setStatus('locked'), []);

  return (
    <AuthContext.Provider value={{
      status, hasBiometrics, biometricAvail,
      setupPIN, unlockWithPIN, setupBiometrics, unlockWithBiometrics, lock,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
