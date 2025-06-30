import { useState, useRef } from 'react';
import { FiCamera, FiSave } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import profilePlaceholder from '../assets/profile-placeholder.png';

const Profile = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(profilePlaceholder);
    const [formData, setFormData] = useState({
        organizationName: 'Myanmar Library Association',
        organizationType: 'Non-Profit',
        email: 'info@mla.org.mm',
        phone: '+95 123 456 789',
        website: 'http://www.mla.org.mm',
        address: 'No. 123, Example Street, Yangon, Myanmar'
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Form submitted:', formData);
    };

    return (
        <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
                <div className="p-4 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Organization Profile</h1>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <form onSubmit={handleSubmit} className="space-y-5 font-medium">
                            {/* Profile Image Section */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative">
                                    <img
                                        src={profileImage}
                                        alt=""
                                        className="w-32 h-32 rounded-full object-cover border-4 border-[#2E6BAA]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 bg-[#2E6BAA] text-white p-2 rounded-full hover:bg-opacity-90"
                                    >
                                        <FiCamera size={20} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Organization Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                                    <input
                                        type="text"
                                        name="organizationName"
                                        value={formData.organizationName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Organization Type</label>
                                    <input
                                        type="text"
                                        name="organizationType"
                                        value={formData.organizationType}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Website</label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>
                            </div>

                            {/* Two Factor Authentication Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-md font-medium text-gray-900">Two Factor Authentication</h3>
                                    <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={twoFactorEnabled}
                                        onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0C2D57]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E6BAA]"></div>
                                </label>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center px-4 py-2 bg-[#2E6BAA] text-white rounded-md hover:bg-opacity-90 transition-colors duration-200 text-sm"
                                >
                                    <FiSave className="mr-2" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;