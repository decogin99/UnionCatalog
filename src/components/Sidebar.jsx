import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiBook, FiHome, FiLogOut, FiUser, FiBookOpen, FiSettings, FiHelpCircle } from 'react-icons/fi';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/Dashboard', icon: <FiHome size={15} />, label: 'Dashboard' },
        { path: '/EnglishBooks', icon: <FiBook size={15} />, label: 'English Books' },
        { path: '/MyanmarBooks', icon: <FiBook size={15} />, label: 'Myanmar Books' },
        { path: '/Profile', icon: <FiUser size={15} />, label: 'Profile' },
        { path: '/settings', icon: <FiSettings size={15} />, label: 'Settings' },
        { path: '/help', icon: <FiHelpCircle size={15} />, label: 'Help Center' },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={() => setIsOpen(false)}
                className={`fixed inset-0 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:translate-x-0 bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 text-white text-center">
                        <h1 className="text-xl font-bold">Union Catalog Client</h1>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar text-sm font-medium">
                        <nav className="mt-1 px-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex items-center px-4 py-3 mb-2 rounded-lg
                                        transition-colors duration-200
                                        ${location.pathname === item.path ? 'bg-white text-[#2E6BAA]' : 'text-white hover:bg-white hover:text-[#2E6BAA]'}`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-gray-500">
                        <button
                            onClick={() => {
                                // Add logout logic here
                                setIsOpen(false);
                                navigate('/Login');
                            }}
                            className="flex items-center text-sm font-medium w-full px-4 py-2 text-white hover:bg-white hover:text-[#2E6BAA] rounded-lg transition-colors duration-200"
                        >
                            <FiLogOut size={15} className="mr-3" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;