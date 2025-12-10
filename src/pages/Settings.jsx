import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthProvider.jsx';

const Settings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwSuccess, setPwSuccess] = useState(null);
  const [pwLoading, setPwLoading] = useState(false);

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAMessage, setTwoFAMessage] = useState('');
  const [twoFASuccess, setTwoFASuccess] = useState(null);

  const fetchTwoFA = async () => {
    setTwoFALoading(true);
    setTwoFAMessage('');
    try {
      const res = await authService.getTwoFactorStatus();
      const enabled = res?.data?.enabled ?? res?.enabled ?? false;
      setTwoFAEnabled(!!enabled);
    } catch (err) {
      setTwoFAEnabled(false);
      setTwoFASuccess(false);
      setTwoFAMessage(err?.message || 'Failed to load 2FA status');
      setTimeout(() => setTwoFAMessage(''), 3000);
    } finally {
      setTwoFALoading(false);
    }
  };

  useEffect(() => {
    fetchTwoFA();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwSuccess(false);
      setPwMessage('Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwSuccess(false);
      setPwMessage('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPwSuccess(false);
      setPwMessage('New password must be at least 6 characters');
      return;
    }
    if (currentPassword === newPassword) {
      setPwSuccess(false);
      setPwMessage('New password must be different from current');
      return;
    }
    setPwLoading(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword, user?.role || 'Library');
      if (res?.success) {
        setPwSuccess(true);
        setPwMessage(res?.message || 'Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwSuccess(false);
        setPwMessage(res?.message || 'Failed to change password');
      }
    } catch (err) {
      setPwSuccess(false);
      setPwMessage(err?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwMessage(''), 3000);
    }
  };

  const handleToggleTwoFA = async () => {
    setTwoFALoading(true);
    setTwoFAMessage('');
    try {
      const res = await authService.setTwoFactorEnabled(!twoFAEnabled);
      if (res?.success) {
        setTwoFASuccess(true);
        setTwoFAMessage(res?.message || (!twoFAEnabled ? '2FA enabled' : '2FA disabled'));
        setTwoFAEnabled(!twoFAEnabled);
      } else {
        setTwoFASuccess(false);
        setTwoFAMessage(res?.message || 'Failed to update 2FA');
      }
    } catch (err) {
      setTwoFASuccess(false);
      setTwoFAMessage(err?.message || 'Failed to update 2FA');
    } finally {
      setTwoFALoading(false);
      setTimeout(() => setTwoFAMessage(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
              {pwMessage && (
                <div className={`mb-3 rounded-xl px-4 py-3 text-sm ${pwSuccess ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>
                  {pwMessage}
                </div>
              )}
              <form onSubmit={handleChangePassword} noValidate className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA] bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA] bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA] bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full sm:w-44 px-4 py-2 rounded-lg bg-[#2E6BAA] text-white hover:bg-opacity-90 flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-70"
                >
                  {pwLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                      </svg>
                      <span>Updating...</span>
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Two-Factor Authentication (2FA)</h2>
              <p className="text-xs text-gray-600 mb-3">Use 2FA to add an extra layer of security to your account.</p>
              {twoFAMessage && (
                <div className={`mb-3 rounded-xl px-4 py-3 text-sm ${twoFASuccess ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>
                  {twoFAMessage}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Status: <span className={twoFAEnabled ? 'text-green-700' : 'text-red-700'}>{twoFAEnabled ? 'Enabled' : 'Disabled'}</span></span>
                <button
                  onClick={handleToggleTwoFA}
                  disabled={twoFALoading}
                  className={`px-4 py-2 rounded-lg text-white ${twoFAEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-70`}
                >
                  {twoFALoading ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                    </svg>
                  ) : (
                    twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;