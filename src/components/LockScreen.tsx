import { useState } from 'react';
import { setupPIN, verifyPIN, hasPIN } from '../auth';

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const isSetup = !hasPIN();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSetup) {
      // Setup new PIN
      if (pin.length < 4) {
        setError('PIN must be at least 4 digits');
        return;
      }
      if (pin !== confirmPin) {
        setError('PINs do not match');
        return;
      }
      await setupPIN(pin);
      onUnlock();
    } else {
      // Verify existing PIN
      const isValid = await verifyPIN(pin);
      if (isValid) {
        onUnlock();
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
    }
  };

  const handlePinChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setPin(numericValue);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isSetup ? 'Setup PIN' : 'Enter PIN'}
          </h1>
          <p className="text-gray-600">
            {isSetup 
              ? 'Create a PIN to secure your tasks' 
              : 'Enter your PIN to access your tasks'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isSetup ? 'Create PIN' : 'Enter PIN'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              placeholder="Enter 4+ digits"
              maxLength={8}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              autoFocus
            />
          </div>

          {isSetup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Re-enter PIN"
                maxLength={8}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {isSetup ? 'Set PIN' : 'Unlock'}
          </button>

          {isSetup && (
            <div className="text-xs text-gray-500 text-center">
              <p>⚠️ Remember your PIN! If forgotten, you'll need to clear browser data and lose all tasks.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
