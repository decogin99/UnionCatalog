import { FiMenu } from "react-icons/fi";
import { useAuth } from "../../context/AuthProvider.jsx";

const AdminNavbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  return (
    <nav className="fixed top-0 right-0 left-0 lg:left-64 z-40 h-16 bg-gradient-to-br from-[#1B4B8A] via-[#1B4B8A] to-[#2E6BAA] backdrop-blur-sm shadow-xl ring-1 ring-white/20">
      <div className="flex items-center justify-between h-full px-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md text-white hover:bg-white hover:text-[#2E6BAA]"
        >
          <FiMenu size={20} />
        </button>
        <div className="flex-1 px-4">
          <h1 className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Super Admin</h1>
        </div>
        <div className="flex items-center gap-3 text-white">
          <span className="text-sm">{user?.email || ''}</span>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;