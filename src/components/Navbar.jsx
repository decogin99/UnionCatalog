import { FiMenu } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
    return (
        <nav className="fixed top-0 right-0 left-0 lg:left-64 shadow-sm z-40 h-16 bg-gradient-to-br from-[#1B4B8A] via-[#1B4B8A] to-[#2E6BAA]">
            <div className="flex items-center justify-between h-full px-4">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-md text-white hover:bg-white hover:text-[#2E6BAA]"
                >
                    <FiMenu size={20} />
                </button>

                <div className="flex-1 px-4">
                    <h1 className="text-md font-semibold text-white">Thu Htoo Aung</h1>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;