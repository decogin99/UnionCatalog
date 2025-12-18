import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
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
  const [twoFALoading, setTwoFALoading] = useState(true);
  const [twoFAMessage, setTwoFAMessage] = useState('');
  const [twoFASuccess, setTwoFASuccess] = useState(null);
  const [twoFAFetchError, setTwoFAFetchError] = useState(false);

  const fetchTwoFA = async () => {
    setTwoFALoading(true);
    try {
      const res = await authService.getTwoFactorStatus(user?.role || 'Library');
      const enabled = res?.data?.is2FAEnabled ?? res?.is2FAEnabled ?? false;
      setTwoFAEnabled(!!enabled);
      setTwoFAFetchError(false);
    } catch (err) {
      setTwoFAMessage(err?.message || 'Failed to fetch 2FA status');
      setTwoFAFetchError(true);
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
    if (newPassword.length < 5) {
      setPwSuccess(false);
      setPwMessage('New password must be at least 5 characters');
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
      const res = await authService.setTwoFactorEnabled(!twoFAEnabled, user?.role || 'Library');
      if (res?.success) {
        setTwoFASuccess(true);
        setTwoFAMessage(res?.message || (!twoFAEnabled ? '2FA enabled successfully' : '2FA disabled successfully'));
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
      {(user?.role === 'SuperAdmin') ? (
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      ) : (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}
      {(user?.role === 'SuperAdmin') ? (
        <AdminNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      ) : (
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      )}
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

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Status: {twoFALoading ? (
                  <span className="text-gray-600 italic">Loading...</span>
                ) : twoFAFetchError ? (
                  <span className="text-red-700">Error</span>
                ) : (
                  <strong className={`${twoFAEnabled ? 'text-green-700' : 'text-red-700'}`}>{twoFAEnabled ? 'ON' : 'OFF'}</strong>
                )}</span>
                <div className="flex items-center">
                  {twoFALoading ? (
                    <div className="relative inline-flex h-6 w-11 items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                      </svg>
                    </div>
                  ) : (
                    <button
                      onClick={handleToggleTwoFA}
                      role="switch"
                      aria-checked={twoFAEnabled}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFAEnabled ? 'bg-green-600' : 'bg-gray-300'} cursor-pointer`}
                    >
                      <span className={`inline-block h-5 w-5 transform bg-white rounded-full shadow transition-transform ${twoFAEnabled ? 'translate-x-5' : 'translate-x-1'}`}></span>
                    </button>
                  )}
                </div>
              </div>
              {twoFAMessage && (
                <div className={`text-xs mt-2 ${twoFASuccess ? 'text-green-700' : 'text-red-700'}`}>{twoFAMessage}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;