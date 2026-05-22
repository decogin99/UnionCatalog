import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { authService } from '../services/authService';

const VerifyEmail = () => {
    const [params] = useSearchParams();
    const token = params.get('token') || '';
    const email = decodeURIComponent(params.get('email') || '');
    const userType = params.get('userType');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [isVerifying, setIsVerifying] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [memberVerified, setMemberVerified] = useState(false);
    const navigate = useNavigate();
    const isMember = (userType === 'Member');

    useEffect(() => {
        setIsVerifying(true);
        if (!token || !email) {
        setIsValid(false);
        setError('Invalid or expired verification link');
        setIsVerifying(false);
        return;
        }
        if (!userType || !String(userType).trim() || !['Library','Member'].includes(userType)) {
        setIsValid(false);
        setError('Invalid User Type please try again.');
        setIsVerifying(false);
        return;
        }
        (async () => {
        try {
            const res = await authService.validateEmailToken(token, email, userType);
            if (res?.success) {
            setIsValid(true);
            setError('');
            if (userType === 'Member') setMemberVerified(true);
            } else {
            setIsValid(false);
            setError(res?.message || 'Invalid or expired verification link');
            }
        } catch (err) {
            setIsValid(false);
            setError(err?.message || 'Invalid or expired verification link');
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
        setError('Invalid or expired verification link');
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
        const res = await authService.confirmSetPassword(token, email, userType, newPassword);
        if (res?.success) {
            setMessage(res?.message || 'Password has been set successfully');
            setTimeout(() => navigate('/Login'), 2000);
        } else {
            setError(res?.message || 'Failed to set password');
        }
        } catch (err) {
        setError(err?.message || 'Failed to set password');
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Verify Email"
    }, []);

    const invalidLink = !isValid;

    return (
        isVerifying ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-3"></div>
            <div className="text-white text-lg font-semibold">Verifying your library email...</div>
            <div className="text-white/80 text-sm">This should only take a moment.</div>
        </div>
        ) : invalidLink ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA]">
            <div className="text-white text-lg">{error || 'Invalid or expired verification link'}</div>
        </div>
        ) : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA] px-4 sm:px-6">
            <div className="bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md ring-1 ring-white/50">
            {isMember && memberVerified ? (
                <div className="text-center">
                    <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#1B4B8A] to-[#2E6BAA] text-white w-12 h-12 mb-3 shadow-md">
                        <FiLock size={22} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0C2D57]">Email Verified</h1>
                    {email && <p className="mt-2 text-sm sm:text-base text-[#1B4B8A]">{email}</p>}
                    <p className="mt-2 text-sm text-gray-600">Your email has been verified successfully.</p>
                </div>
            ) : (
                <>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#1B4B8A] to-[#2E6BAA] text-white w-12 h-12 mb-3 shadow-md">
                    <FiLock size={22} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">Create Password</h1>
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
                    <button type="submit" disabled={isLoading} className={`w-full bg-[#2E6BAA] text-white py-3 rounded-xl transition duration-300 shadow-md ${isLoading ? 'opacity-70' : 'hover:bg-opacity-90'}`}>{isLoading ? 'Creating...' : 'Create Password'}</button>
                </form>
                </>
            )}
            </div>
        </div>
        )
    );
}

export default VerifyEmail;