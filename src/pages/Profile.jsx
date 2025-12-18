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
    const coverInputRef = useRef(null);
    const [coverImage, setCoverImage] = useState('');
    const [formData, setFormData] = useState({
        LibraryName: 'Myanmar Union Catalog',
        LibraryType: 'Public',
        OwnerName: 'John Doe',
        ContactPerson: 'Jane Smith',
        Email: 'info@ucatalog.mm',
        PhoneNumber: '+95 123 456 789',
        Township: 'Yangon',
        StateDivision: 'Yangon Region',
        Address: 'No. 123, Example Street, Yangon, Myanmar',
        LibraryCover: '',
        LibraryPhoto: '',
        BookCount: 0,
        UpdatedAt: new Date().toISOString(),
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
                setFormData(prev => ({ ...prev, LibraryPhoto: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImage(reader.result);
                setFormData(prev => ({ ...prev, LibraryCover: reader.result }));
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

                    <div className="relative mb-6 rounded-xl overflow-hidden ring-1 ring-white/20">
                        {coverImage ? (
                            <img src={coverImage} alt="Cover" className="w-full h-40 sm:h-56 object-cover" />
                        ) : (
                            <div className="w-full h-40 sm:h-56 bg-gradient-to-r from-[#1B4B8A] via-[#1B4B8A] to-[#2E6BAA]" />
                        )}
                        <button
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            className="absolute top-3 right-3 bg-white/20 text-white px-3 py-1 rounded-md backdrop-blur hover:bg-white/30 text-sm inline-flex items-center gap-2"
                        >
                            <FiCamera size={14} />
                            Change Cover
                        </button>
                        <input
                            type="file"
                            ref={coverInputRef}
                            onChange={handleCoverChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <form onSubmit={handleSubmit} className="space-y-5 font-medium">
                            {/* Profile Image Section */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <img src={profileImage} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md" />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 bg-[#2E6BAA] text-white p-2 rounded-full hover:bg-opacity-90"
                                    >
                                        <FiCamera size={16} />
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-gray-900">{formData.LibraryName}</div>
                                    <div className="text-sm text-gray-600">{formData.LibraryType}</div>
                                    <div className="text-xs text-gray-500">{formData.Email}</div>
                                </div>
                            </div>

                            {/* Library Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Library Name</label>
                                    <input
                                        type="text"
                                        name="LibraryName"
                                        value={formData.LibraryName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Library Type</label>
                                    <input
                                        type="text"
                                        name="LibraryType"
                                        value={formData.LibraryType}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                                    <input
                                        type="text"
                                        name="OwnerName"
                                        value={formData.OwnerName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                                    <input
                                        type="text"
                                        name="ContactPerson"
                                        value={formData.ContactPerson}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="Email"
                                        value={formData.Email}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="text"
                                        name="PhoneNumber"
                                        value={formData.PhoneNumber}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Township</label>
                                    <input
                                        type="text"
                                        name="Township"
                                        value={formData.Township}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">State/Division</label>
                                    <input
                                        type="text"
                                        name="StateDivision"
                                        value={formData.StateDivision}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea
                                        name="Address"
                                        value={formData.Address}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0C2D57] focus:border-[#0C2D57]"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-700">Books: <strong className="text-gray-900">{formData.BookCount}</strong></div>
                                        <div className="text-sm text-gray-700">Updated: <span className="text-gray-900">{new Date(formData.UpdatedAt).toLocaleString()}</span></div>
                                    </div>
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