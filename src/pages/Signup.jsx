import { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        displayName: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Registering...")
        // Add your signup logic here
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA]">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <div className="text-center mb-5">
                    <h1 className="text-3xl font-bold text-[#2E6BAA] mb-2">Sign Up</h1>
                    <h2 className="text-xl text-[#2E6BAA]">Create your account</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 font-medium">
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete='off'
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="displayName"
                            placeholder="Display Name"
                            value={formData.displayName}
                            onChange={handleChange}
                            autoComplete='off'
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            className="mr-2 cursor-pointer"
                            required
                        />
                        <span className="text-sm text-gray-600">
                            I agree to the <a href="/terms" className="text-[#2E6BAA] hover:underline">Terms and Conditions</a>
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#2E6BAA] text-white py-2 rounded-lg hover:bg-opacity-90 transition duration-300"
                    >
                        Sign Up
                    </button>

                    <div className="text-center mt-1">
                        <span className="text-gray-600">Already have an account? </span>
                        <Link to="/Login" className="text-[#2E6BAA] hover:underline">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;