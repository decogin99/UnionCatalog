import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthProvider.jsx';
import { authService } from '../services/authService';

const OTPVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [remainingSec, setRemainingSec] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const [info, setInfo] = useState('');

    useEffect(() => {
      const key = 'otpExpiryTs';
      const tick = () => {
        const ts = Number(sessionStorage.getItem(key) || 0);
        const left = Math.max(0, Math.floor((ts - Date.now()) / 1000));
        setRemainingSec(left);
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }, []);

    const fmtRemain = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        // Only take the last digit if multiple digits are entered
        const singleDigit = element.value.slice(-1);

        setOtp([...otp.map((d, idx) => (idx === index ? singleDigit : d))]);

        // Focus next input
        if (singleDigit && index < 5) {
            const nextInput = element.parentElement.nextElementSibling?.querySelector('input');
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            e.preventDefault();

            // If current input has a value, clear it
            if (otp[index]) {
                setOtp(otp.map((digit, idx) => idx === index ? '' : digit));
            }
            // If current input is empty, clear previous input and focus it
            else if (index > 0) {
                setOtp(otp.map((digit, idx) => idx === index - 1 ? '' : digit));
                const prevInput = e.target.parentElement.previousElementSibling?.querySelector('input');
                if (prevInput) {
                    prevInput.focus();
                }
            }
        }
        // Handle left arrow
        else if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            const prevInput = e.target.parentElement.previousElementSibling?.querySelector('input');
            if (prevInput) {
                prevInput.focus();
            }
        }
        // Handle right arrow
        else if (e.key === 'ArrowRight' && index < 5) {
            e.preventDefault();
            const nextInput = e.target.parentElement.nextElementSibling?.querySelector('input');
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const otpValue = otp.join('');
        if (otpValue.length !== 6 || otp.some(d => d === '')) {
            setError('Please enter the 6-digit OTP code.');
            const inputs = document.querySelectorAll('input');
            const firstEmptyIndex = otp.findIndex(d => d === '');
            const target = firstEmptyIndex >= 0 ? inputs[firstEmptyIndex] : inputs[0];
            if (target) { target.focus(); }
            return;
        }
        setIsVerifying(true);
        const pendingUsername = sessionStorage.getItem('pendingUsername') || '';
        try {
            const res = await authService.verifyOTP(pendingUsername, otpValue, "Library");
            if (res?.success) {
                setError('');
                const user = res?.data?.user ?? res?.user ?? {};
                const libraryName = user.Name ?? user.name ?? '';
                const libraryAccess = user.Access ?? user.access ?? '';
                setUser({ 
                    email: pendingUsername,
                    libraryName: libraryName || '',
                    libraryAccess: libraryAccess === "Verifying" ? "Free" : libraryAccess || "Free" 
                });
                sessionStorage.removeItem('pendingUsername');
                sessionStorage.removeItem('pendingRememberMe');
                sessionStorage.removeItem('otpExpiryTs');
                navigate('/Dashboard');
            } else {
                setError(res?.message || 'Invalid OTP code. Please try again.');
                setOtp(['', '', '', '', '', '']);
                const firstInput = document.querySelector('input');
                if (firstInput) {
                    firstInput.focus();
                }
            }
        } catch (err) {
            setError(err?.message || 'Verification failed. Please try again.');
            setOtp(['', '', '', '', '', '']);
            const firstInput = document.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA] px-4 sm:px-6">
            <div className="bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md ring-1 ring-white/50">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#1B4B8A] to-[#2E6BAA] text-white w-12 h-12 mb-3 shadow-md">
                        <FiShield size={22} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">OTP Verification</h1>
                    <p className="mt-2 text-sm sm:text-base text-[#1B4B8A]">Enter the 6-digit code sent to your email</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 font-medium">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {(info && remainingSec > 0) && (
                        <div className="rounded-xl px-4 py-3 text-xs bg-green-50 text-green-700 ring-1 ring-green-200 mb-4">{info}</div>
                    )}

                    <div className={`rounded-xl px-4 py-3 text-xs ring-1 mb-4 ${remainingSec > 0 ? 'bg-yellow-50 text-yellow-700 ring-yellow-200' : 'bg-red-50 text-red-700 ring-red-200'}`}>{remainingSec > 0 ? `Code expires in ${fmtRemain(remainingSec)}` : (!isVerifying && 'Code expired. You can request a new code.')}</div>

                    <div className="flex justify-center gap-2 mb-6">
                        {otp.map((digit, index) => (
                            <div key={index} className="w-12">
                                <input
                                    type="number"
                                    min="0"
                                    max="9"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onFocus={(e) => e.target.select()}
                                    className="w-full h-14 text-center text-2xl font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isVerifying || otp.some(d => d === '')}
                        className="w-full bg-[#2E6BAA] text-white py-3 rounded-xl hover:bg-opacity-90 transition duration-300 font-medium shadow-md flex items-center justify-center disabled:opacity-70"
                    >
                        {isVerifying ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                          </svg>
                        ) : (
                          'Verify'
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            disabled={remainingSec > 0 || isResending}
                            className="text-[#2E6BAA] hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={async () => {
                                if (remainingSec > 0 || isResending) return;
                                setError('');
                                setInfo('');
                                const username = sessionStorage.getItem('pendingUsername') || '';
                                if (!username) { setError('No pending username found. Please login again.'); return; }
                                setIsResending(true);
                                try {
                                  const r = await authService.resendOTP(username, 'Library');
                                  if (r?.success) {
                                    setInfo(r?.message || 'A new OTP code has been sent.');
                                    setOtp(['', '', '', '', '', '']);
                                    const newExpiry = Date.now() + 5 * 60 * 1000;
                                    sessionStorage.setItem('otpExpiryTs', String(newExpiry));
                                    setRemainingSec(300);
                                    const firstInput = document.querySelector('input');
                                    if (firstInput) { firstInput.focus(); }
                                  } else {
                                    setError(r?.message || 'Failed to resend OTP.');
                                  }
                                } catch (e) {
                                  setError(e?.message || 'Failed to resend OTP.');
                                } finally {
                                  setIsResending(false);
                                }
                            }}
                        >
                            {isResending ? (
                              <span className="inline-flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-[#2E6BAA]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                                </svg>
                                Resending...
                              </span>
                            ) : 'Resend Code'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OTPVerification;
