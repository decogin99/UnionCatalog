import { FiMenu } from "react-icons/fi";
import { MdVerified, MdWorkspacePremium } from "react-icons/md";
import { useAuth, useLanguage } from "../context/AuthProvider.jsx";

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { language, toggleLanguage } = useLanguage();
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
          <div className="">
            {user?.libraryName ? (
              <>
                <div className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                  {user?.libraryName}
                  {user?.libraryAccess === 'Verified' && (
                    <span className="ml-2 inline-flex align-middle text-white"><MdVerified size={16} /></span>
                  )}
                  {user?.libraryAccess === 'Premium' && (
                    <span className="ml-2 inline-flex align-middle text-[#D4AF37]"><MdWorkspacePremium size={16} /></span>
                  )}
                  {user?.libraryAccess !== 'Verified' && user?.libraryAccess !== 'Premium' && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 bg-gray-100 text-gray-700 ring-gray-300">
                      {user?.libraryAccess}
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/90 mt-0.5 hidden sm:block">Library Management System</div>
              </>
            ) : (
              <div className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                Library Management System
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-white">
          <span className="hidden sm:flex text-sm">{user?.email || ''}</span>

          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 text-xs font-semibold text-white rounded-md hover:bg-white/10 transition-colors duration-200"
          >
            {language === "en" ? "🇺🇸 EN" : "🇲🇲 MM"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
