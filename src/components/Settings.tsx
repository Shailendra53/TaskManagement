import { useState } from 'react';
import type { Task, Category } from '../types';
import { hasPIN, removePIN, setupPIN, verifyPIN } from '../auth';

interface SettingsProps {
  onClose: () => void;
  tasks: Task[];
  categories: Category[];
  archivedTasks: Task[];
  onImport: (data: { tasks: Task[]; categories: Category[]; archivedTasks: Task[] }) => void;
}

export default function Settings({ 
  onClose, 
  tasks, 
  categories, 
  archivedTasks,
  onImport 
}: SettingsProps) {
  const [pinEnabled, setPinEnabled] = useState(hasPIN());
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinRemoval, setShowPinRemoval] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [removalPin, setRemovalPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [removalError, setRemovalError] = useState('');

  const handleExport = () => {
    const data = {
      tasks,
      categories,
      archivedTasks,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks && data.categories) {
          if (confirm('This will replace all current data. Continue?')) {
            onImport({
              tasks: data.tasks || [],
              categories: data.categories || [],
              archivedTasks: data.archivedTasks || []
            });
            alert('Data imported successfully!');
            onClose();
          }
        } else {
          alert('Invalid backup file format');
        }
      } catch (error) {
        alert('Failed to import: Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleSetupPin = async () => {
    setPinError('');
    if (newPin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }
    if (newPin !== confirmNewPin) {
      setPinError('PINs do not match');
      return;
    }
    await setupPIN(newPin);
    setPinEnabled(true);
    setShowPinSetup(false);
    setNewPin('');
    setConfirmNewPin('');
    alert('PIN enabled successfully!');
  };

  const handleRemovePin = async () => {
    setRemovalError('');
    const isValid = await verifyPIN(removalPin);
    if (isValid) {
      removePIN();
      setPinEnabled(false);
      setShowPinRemoval(false);
      setRemovalPin('');
      alert('PIN removed successfully');
    } else {
      setRemovalError('Incorrect PIN');
    }
  };

  const togglePin = () => {
    if (pinEnabled) {
      setShowPinRemoval(true);
    } else {
      setShowPinSetup(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* PIN Lock Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">🔒 PIN Lock</h3>
                <p className="text-sm text-gray-600">Protect your tasks with a PIN</p>
              </div>
              <button
                onClick={togglePin}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pinEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pinEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {showPinSetup && (
              <div className="mt-4 space-y-3 p-4 bg-blue-50 rounded-lg">
                <input
                  type="password"
                  inputMode="numeric"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter PIN (4+ digits)"
                  maxLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Confirm PIN"
                  maxLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {pinError && <p className="text-sm text-red-600">{pinError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleSetupPin}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Set PIN
                  </button>
                  <button
                    onClick={() => {
                      setShowPinSetup(false);
                      setNewPin('');
                      setConfirmNewPin('');
                      setPinError('');
                    }}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {pinEnabled && !showPinSetup && (
              <p className="text-sm text-green-600 mt-2">✓ PIN protection is active</p>
            )}

            {showPinRemoval && (
              <div className="mt-4 space-y-3 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">Enter your current PIN to disable protection</p>
                <input
                  type="password"
                  inputMode="numeric"
                  value={removalPin}
                  onChange={(e) => setRemovalPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter current PIN"
                  maxLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  autoFocus
                />
                {removalError && <p className="text-sm text-red-600">{removalError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleRemovePin}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Remove PIN
                  </button>
                  <button
                    onClick={() => {
                      setShowPinRemoval(false);
                      setRemovalPin('');
                      setRemovalError('');
                    }}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export/Import Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📦 Backup & Restore</h3>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
              >
                📥 Export Data
              </button>
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <div className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors cursor-pointer text-center">
                  📤 Import Data
                </div>
              </label>
              <p className="text-xs text-gray-600">
                Export your tasks to a JSON file for backup. Import to restore from a backup file.
              </p>
            </div>
          </div>

          {/* Browser Profiles Help */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">👥 Multiple Users</h3>
            <p className="text-sm text-gray-700 mb-3">
              To use this app with multiple users on the same device, use browser profiles:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li><strong>Chrome/Edge:</strong> Click profile icon → "Add Profile"</li>
              <li><strong>Firefox:</strong> Menu → Profiles → "Create Profile"</li>
              <li><strong>Safari:</strong> Use different macOS user accounts</li>
            </ul>
          </div>

          {/* Data Info */}
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ℹ️ Data Storage</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• <strong>Active Tasks:</strong> {tasks.length}</p>
              <p>• <strong>Archived Tasks:</strong> {archivedTasks.length}</p>
              <p>• <strong>Categories:</strong> {categories.length}</p>
              <p className="mt-3 text-xs text-gray-600">
                All data is stored locally in your browser's IndexedDB. Clearing browser data will delete everything.
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
