import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
        // Add your password reset logic here
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA]">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <div className="text-center mb-5">
                    <h1 className="text-3xl font-bold text-[#2E6BAA] mb-2">Forgot Password</h1>
                    <p className="text-gray-600">
                        Enter your email address and we'll send you instructions to reset your password.
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4 font-medium">
                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#2E6BAA] text-white py-2 rounded-lg hover:bg-opacity-90 transition duration-300"
                        >
                            Send Reset Instructions
                        </button>

                        <div className="text-center mt-3">
                            <Link to="/Login" className="text-[#2E6BAA] hover:underline">
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div className="text-center space-y-4 font-medium">
                        <div className="text-green-600 mb-4">
                            Reset instructions have been sent to your email.
                        </div>
                        <Link
                            to="/Login"
                            className="block text-[#2E6BAA] hover:underline"
                        >
                            Return to Sign In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;