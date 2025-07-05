import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (email === 'admin' && password === 'admin') {
            navigate('/OTP-Verification');
        } else {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA]">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-[95%] mx-2">
                <div className="text-center mb-5">
                    <h1 className="text-3xl font-bold text-[#2E6BAA] mb-2">Welcome to</h1>
                    <h2 className="text-2xl font-semibold text-[#2E6BAA]">Myanmar Union Catalog Portal</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 font-medium">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <div>
                        <label className='text-sm'>Email</label>
                        <input
                            type="text"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                    </div>
                    <div>
                        <label className='text-sm'>Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="mr-2 cursor-pointer"
                            />
                            <span className="text-sm text-gray-600">Remember me</span>
                        </label>
                        <Link to="/Forgotpassword" className="text-sm text-[#2E6BAA] hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#2E6BAA] text-white py-2 rounded-lg hover:bg-opacity-90 transition duration-300"
                    >
                        Sign In
                    </button>

                    <div className="relative my-4 mt-1">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition duration-300 shadow-xs"
                    >
                        <FcGoogle size={20} />
                        Sign in with Google
                    </button>

                    <div className="text-center mt-4">
                        <span className="text-gray-600">Don't have an account? </span>
                        <Link to="/Signup" className="text-[#2E6BAA] hover:underline">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;