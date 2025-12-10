import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { FiUserPlus } from 'react-icons/fi';

const Signup = () => {
    const [formData, setFormData] = useState({
        libraryName: '',
        libraryType: '',
        ownerName: '',
        contactPerson: '',
        email: '',
        phoneNumber: '',
        township: '',
        stateDivision: '',
        address: '',
        documentFile: null,
        agreeToTerms: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const location = useLocation();
    const isCheckMode = new URLSearchParams(location.search).get('check') === 'true';
    const [registrationNo, setRegistrationNo] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [checkMessage, setCheckMessage] = useState('');
    const [checkSuccess, setCheckSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFormData(prev => ({ ...prev, documentFile: file }));
    };

    const validateForm = () => {
        const required = [
            'libraryName',
            'libraryType',
            'ownerName',
            'contactPerson',
            'email',
            'phoneNumber',
            'township',
            'stateDivision',
            'address'
        ];
        for (const key of required) {
            if (!formData[key]?.trim()) {
                return `Please fill ${key}`;
            }
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage('');
        const error = validateForm();
        if (error) {
            setSubmitMessage(error);
            return;
        }
        if (!formData.agreeToTerms) {
            setSubmitMessage('You must agree to the Terms and Conditions');
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await authService.libraryRegister(formData);
            if (res.success) {
                setSubmitMessage(res.message || 'Library registration successful');
                setFormData({
                    libraryName: '',
                    libraryType: '',
                    ownerName: '',
                    contactPerson: '',
                    email: '',
                    phoneNumber: '',
                    township: '',
                    stateDivision: '',
                    address: '',
                    documentFile: '',
                    agreeToTerms: false
                });
            } else {
                setSubmitMessage(res.message || 'Failed to submit registration');
            }
        } catch (err) {
            setSubmitMessage(err?.message || 'Failed to submit registration');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA] p-4 sm:p-6">
            <div className="bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-4xl ring-1 ring-white/50">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#1B4B8A] to-[#2E6BAA] text-white w-12 h-12 mb-3 shadow-md">
                        <FiUserPlus size={22} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">{isCheckMode ? 'Check Registration Status' : 'Create Your Library'}</h1>
                    <p className="mt-2 text-sm sm:text-base text-[#1B4B8A]">{isCheckMode ? 'Enter your registration number to see its status' : 'Register your organization to access Union Catalog services'}</p>
                </div>

                {isCheckMode ? (
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const rn = registrationNo.trim();
                            if (!rn) { setCheckMessage('Please enter your registration number'); return; }
                            setCheckMessage('');
                            setIsChecking(true);
                            try {
                                const res = await authService.checkRegistrationNumber(rn);
                                const msg = res?.message || 'Checked';
                                setCheckMessage(msg);
                                setCheckSuccess(res?.success === true);
                            } catch (err) {
                                const msg = err?.message || 'Failed to check registration number';
                                setCheckMessage(msg);
                                setCheckSuccess(false);
                            } finally {
                                setIsChecking(false);
                            }
                        }}
                        className="space-y-6 font-medium"
                    >
                        <div>
                            <input
                                type="text"
                                name="registrationNo"
                                placeholder="Registration Number (e.g., LIB-YYYYMMDD-XXXXXX)"
                                value={registrationNo}
                                onChange={(e)=>setRegistrationNo(e.target.value)}
                                autoComplete='off'
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                                maxLength={40}
                            />
                        </div>
                        {checkMessage && (
                            <div className={`rounded-xl px-4 py-3 text-sm ${
                                checkMessage.includes('Pending')
                                    ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200'
                                    : (checkMessage.includes('Declined') || checkMessage.includes('Banned'))
                                        ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                                        : checkSuccess
                                            ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                                            : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                            }`}>
                                {checkMessage}
                            </div>
                        )}
                        <button type="submit" disabled={isChecking} className="w-full bg-[#2E6BAA] text-white py-3 rounded-xl hover:bg-opacity-90 transition duration-300 shadow-md">
                            {isChecking ? 'Checking...' : 'Check'}
                        </button>
                        <div className="text-center mt-1">
                            <div className='mb-3'>
                                <Link to="/Signup" className="text-[#2E6BAA] hover:underline">Back to Register</Link>
                            </div>
                            <div>
                                <Link to="/Login" className="text-[#2E6BAA] hover:underline">Back to Login</Link>
                            </div>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 font-medium">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input
                            type="text"
                            name="libraryName"
                            placeholder="Library Name"
                            value={formData.libraryName}
                            onChange={handleChange}
                            autoComplete='off'
                            maxLength={200}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                        <input
                            type="text"
                            name="libraryType"
                            placeholder="Library Type"
                            value={formData.libraryType}
                            onChange={handleChange}
                            autoComplete='off'
                            maxLength={100}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                        <input
                            type="text"
                            name="ownerName"
                            placeholder="Owner Name"
                            value={formData.ownerName}
                            onChange={handleChange}
                            autoComplete='off'
                            maxLength={150}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                        <input
                            type="text"
                            name="contactPerson"
                            placeholder="Contact Person"
                            value={formData.contactPerson}
                            onChange={handleChange}
                            autoComplete='off'
                            maxLength={150}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete='off'
                            maxLength={320}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                        <input
                            type="text"
                            name="phoneNumber"
                            placeholder="Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            autoComplete='off'
                            maxLength={50}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                        <input
                            type="text"
                            name="township"
                            placeholder="Township"
                            value={formData.township}
                            onChange={handleChange}
                            autoComplete='off'
                            maxLength={100}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                        <input
                            type="text"
                            name="stateDivision"
                            placeholder="State/Division"
                            value={formData.stateDivision}
                            onChange={handleChange}
                            autoComplete='off'
                            maxLength={100}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            required
                        />
                    </div>
                    <textarea
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                        autoComplete='off'
                        maxLength={500}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                        required
                    />
                    <div>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleFileChange}
                            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#2E6BAA] file:text-white hover:file:bg-opacity-90"
                        />
                        {formData.documentFile && (
                            <p className="mt-1 text-xs text-gray-500 break-all">Document attached</p>
                        )}
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

                    {submitMessage && (
                        <div className="text-center text-sm text-gray-700">{submitMessage}</div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#2E6BAA] text-white py-3 rounded-xl hover:bg-opacity-90 transition duration-300 shadow-md"
                    >
                        {isSubmitting ? 'Submitting...' : 'Sign Up'}
                    </button>

                    <div className="text-center mt-1">
                        <span className="text-gray-600">Already have an account? </span>
                        <Link to="/Login" className="text-[#2E6BAA] hover:underline">
                            Sign in
                        </Link>
                        <div className="mt-2">
                            <span className="text-gray-600">Already registered? </span>
                            <Link to="/Signup?check=true" className="text-[#2E6BAA] hover:underline">
                                Check
                            </Link>
                        </div>
                    </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Signup;
