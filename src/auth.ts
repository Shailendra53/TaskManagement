// Simple PIN authentication utility

const PIN_KEY = 'taskapp_pin_hash';
const SESSION_KEY = 'taskapp_session';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

// Simple hash function (for demo - use proper crypto in production)
async function hashPIN(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function setupPIN(pin: string): Promise<void> {
  const hash = await hashPIN(pin);
  localStorage.setItem(PIN_KEY, hash);
  createSession();
}

export async function verifyPIN(pin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(PIN_KEY);
  if (!storedHash) return false;
  
  const hash = await hashPIN(pin);
  if (hash === storedHash) {
    createSession();
    return true;
  }
  return false;
}

export function hasPIN(): boolean {
  return localStorage.getItem(PIN_KEY) !== null;
}

export function removePIN(): void {
  localStorage.removeItem(PIN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function createSession(): void {
  const expiry = Date.now() + SESSION_DURATION;
  localStorage.setItem(SESSION_KEY, expiry.toString());
}

export function isSessionValid(): boolean {
  const expiry = localStorage.getItem(SESSION_KEY);
  if (!expiry) return false;
  return Date.now() < parseInt(expiry);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function needsUnlock(): boolean {
  return hasPIN() && !isSessionValid();
}

// Lock immediately when visibility changes or before unload
export function setupAutoLock(onLock: () => void): () => void {
  const handleVisibilityChange = () => {
    if (document.hidden && hasPIN()) {
      clearSession();
      onLock();
    }
  };

  const handleBeforeUnload = () => {
    if (hasPIN()) {
      clearSession();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}
