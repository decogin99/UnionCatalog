import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import { useAuth } from "../context/AuthProvider.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await authService.login(email, password, rememberMe);
      if (res?.success) {
        const { token, userType } = res.data || {};
        if (token) {
          setUser({ email, role: userType || "Library" });
          sessionStorage.removeItem("pendingUsername");
          sessionStorage.removeItem("pendingUserType");
          navigate(userType === "SuperAdmin" ? "/Admin/Registrations" : "/Dashboard");
        } else {
          if (userType) sessionStorage.setItem("pendingUserType", userType);
          sessionStorage.setItem("pendingUsername", email);
          navigate("/OTPVerification");
        }
      } else {
        setError(res?.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA] px-4 sm:px-6">
      <div className="bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md md:max-w-lg ring-1 ring-white/50">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#1B4B8A] to-[#2E6BAA] text-white w-12 h-12 mb-3 shadow-md">
            <FiLogIn size={22} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">Welcome</h1>
          <p className="mt-2 text-sm sm:text-base text-[#1B4B8A]">Sign in to continue to Myanmar Union Catalog</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-medium">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
              required
            />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
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
            <Link to="/Forgotpassword" className="text-sm text-[#2E6BAA] hover:underline font-medium">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2E6BAA] text-white py-3 rounded-xl hover:bg-opacity-90 transition duration-300 shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link to="/Signup" className="inline-flex items-center gap-2 text-[#2E6BAA] hover:underline font-medium">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
