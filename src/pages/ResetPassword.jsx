import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { authService } from '../services/authService';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const email = decodeURIComponent(params.get('user') || '');
  const userType = params.get('userType') || 'Library';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVerifying(true);
    if (!token || !email) {
      setIsValid(false);
      setIsVerifying(false);
      return;
    }
    (async () => {
      try {
        const res = await authService.validateResetToken(token, email, userType);
        if (res?.success) {
          setIsValid(true);
          setError('');
        } else {
          setIsValid(false);
          setError(res?.message || 'Invalid or expired reset link');
        }
      } catch (err) {
        setIsValid(false);
        setError(err?.message || 'Invalid or expired reset link');
      } finally {
        setIsVerifying(false);
      }
    })();
  }, [token, email, userType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token || !email) {
      setError('Invalid or expired reset link');
      return;
    }
    if (!newPassword || newPassword.length < 5) {
      setError('New password must be at least 5 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.confirmResetPassword(token, email, userType, newPassword);
      if (res?.success) {
        setMessage(res?.message || 'Password has been reset successfully');
        setTimeout(() => navigate('/Login'), 2000);
      } else {
        setError(res?.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Reset Password"
  }, []);

  const invalidLink = !isValid;

  return (
    isVerifying ? (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-3"></div>
        <div className="text-white text-lg font-semibold">Validating your reset link...</div>
        <div className="text-white/80 text-sm">This should only take a moment.</div>
      </div>
    ) : invalidLink ? (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA]">
        <div className="text-white text-lg">{error || 'Invalid or expired reset link'}</div>
      </div>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA] px-4 sm:px-6">
        <div className="bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md ring-1 ring-white/50">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#1B4B8A] to-[#2E6BAA] text-white w-12 h-12 mb-3 shadow-md">
              <FiLock size={22} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">Set New Password</h1>
            {email && <p className="mt-2 text-sm sm:text-base text-[#1B4B8A]">{email}</p>}
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 font-medium">
            <div>
              <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" required disabled={isLoading} />
            </div>
            <div>
              <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" required disabled={isLoading} />
            </div>
            {error && (<div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{error}</div>)}
            {message && (<div className="rounded-xl px-4 py-3 text-sm bg-green-50 text-green-700 ring-1 ring-green-200">{message}</div>)}
            <button type="submit" disabled={isLoading} className={`w-full bg-[#2E6BAA] text-white py-3 rounded-xl transition duration-300 shadow-md ${isLoading ? 'opacity-70' : 'hover:bg-opacity-90'}`}>{isLoading ? 'Updating...' : 'Update Password'}</button>
          </form>
        </div>
      </div>
    )
  );
};

export default ResetPassword;