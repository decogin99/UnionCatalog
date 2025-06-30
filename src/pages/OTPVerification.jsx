import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OTPVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    const handleSubmit = (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue === '000000') {
            setError('');
            navigate('/Dashboard');
        } else {
            setError('Invalid OTP code. Please try again.');
            // Clear OTP fields on error
            setOtp(['', '', '', '', '', '']);
            // Focus first input
            const firstInput = document.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA]">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-[95%] mx-2">
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-[#2E6BAA] mb-2">OTP Verification</h1>
                    <p className="text-gray-600 font-medium">Enter the 6-digit code sent to your email</p>
                </div>

                <form onSubmit={handleSubmit}>
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
                                    className="w-full h-12 text-center text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#2E6BAA] text-white py-3 rounded-lg hover:bg-opacity-90 transition duration-300 font-medium"
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
