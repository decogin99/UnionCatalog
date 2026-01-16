import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUnlock } from 'react-icons/fi';
import { authService } from '../services/authService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitMessage, setSubmitMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitMessage('');
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        setIsLoading(true);
        try {
            const res = await authService.resetPassword(email.trim());
            if (res?.success) {
                setIsSubmitted(true);
                setSubmitMessage(res?.message || 'Reset instructions have been sent to your email.');
            } else {
                setError(res?.message || 'Failed to request password reset');
            }
        } catch (err) {
            setError(err?.message || 'Failed to request password reset');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Forgot Password"
      }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA] px-4 sm:px-6">
            <div className="bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md ring-1 ring-white/50">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#1B4B8A] to-[#2E6BAA] text-white w-12 h-12 mb-3 shadow-md">
                        <FiUnlock size={22} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">Reset Password</h1>
                    <p className="mt-2 text-sm sm:text-base text-[#1B4B8A]">Enter your email to receive reset instructions</p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6 font-medium">
                        <div>
                            <input
                                type="email"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                          <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{error}</div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-[#2E6BAA] text-white py-3 rounded-xl transition duration-300 shadow-md ${isLoading ? 'opacity-70' : 'hover:bg-opacity-90'}`}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                        </button>

                        <div className="text-center mt-3">
                            <Link to="/Login" className="text-[#2E6BAA] hover:underline">
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div className="text-center space-y-4 font-medium">
                        <div className="rounded-xl px-4 py-3 bg-green-50 text-green-700 ring-1 ring-green-200 mb-5">
                            {submitMessage || 'Reset instructions have been sent to your email.'}
                        </div>
                        <Link
                            to="/Login"
                            className="inline-flex items-center gap-2 text-[#2E6BAA] hover:underline font-medium"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;