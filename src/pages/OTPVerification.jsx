import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthProvider.jsx';
import { authService } from '../services/authService';

const OTPVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setUser } = useAuth();

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
        const otpValue = otp.join('');
        const pendingUsername = sessionStorage.getItem('pendingUsername') || '';
        const pendingUserType = sessionStorage.getItem('pendingUserType') || 'Library';
        try {
            const res = await authService.verifyOTP(pendingUsername, otpValue);
            if (res?.success) {
                setError('');
                setUser({ email: pendingUsername, role: pendingUserType });
                sessionStorage.removeItem('pendingUsername');
                sessionStorage.removeItem('pendingUserType');
                navigate(pendingUserType === 'SuperAdmin' ? '/Admin/Registrations' : '/Dashboard');
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
                        className="w-full bg-[#2E6BAA] text-white py-3 rounded-xl hover:bg-opacity-90 transition duration-300 font-medium shadow-md"
                    >
                        Verify
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            className="text-[#2E6BAA] hover:underline font-medium"
                            onClick={() => {
                                setOtp(['', '', '', '', '', '']);
                                setError('');
                                // Focus first input
                                const firstInput = document.querySelector('input');
                                if (firstInput) {
                                    firstInput.focus();
                                }
                            }}
                        >
                            Resend Code
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OTPVerification;
