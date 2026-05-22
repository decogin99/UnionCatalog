import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useLanguage } from "../context/AuthProvider.jsx";
import {
  FiHome,
  FiBook,
  FiLogOut,
  FiUser,
  FiSettings,
  FiGrid,
  FiBookOpen,
  FiUsers,
} from "react-icons/fi";
import { TbBookDownload } from "react-icons/tb";
import { BsCardText } from "react-icons/bs";
import { LuScanBarcode } from "react-icons/lu";
import { MdVerified } from "react-icons/md";
import { authService } from "../services/authService";

const sidebarTranslations = {
  en: {
    dashboard: "Dashboard",
    englishBooks: "English Books",
    myanmarBooks: "Myanmar Books",
    barcodeGenerator: "Barcode Generator",
    labelGenerator: "Label Generator",
    ddcView: "DDC View",
    bookReport: "Book Report",
    marc: "MARC",
    verifyLibrary: "Verify Library",
    profile: "Profile",
    members: "Members",
    settings: "Settings",
    admin: "Admin",
    logout: "Logout",
  },
  mm: {
    dashboard: "ပင်မစာမျက်နှာ",
    englishBooks: "အင်္ဂလိပ် စာအုပ်များ",
    myanmarBooks: "မြန်မာ စာအုပ်များ",
    barcodeGenerator: "ဘားကုဒ် ထုတ်လုပ်ရန်",
    labelGenerator: "လေဘယ် ထုတ်လုပ်ရန်",
    ddcView: "DDC ကြည့်ရှုရန်",
    bookReport: "စာအုပ် အစီရင်ခံစာ",
    marc: "MARC",
    verifyLibrary: "စာကြည့်တိုက် အတည်ပြုရန်",
    profile: "သင့်စာကြည့်တိုက်",
    members: "မန်ဘာများ",
    settings: "ပြင်ဆင်ရန်",
    admin: "အက်မင်",
    logout: "ထွက်မည်",
  },
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { language } = useLanguage();

  const baseItems = [
    { path: "/Dashboard", icon: <FiHome size={15} />, labelKey: "dashboard" },
    { path: "/EnglishBooks", icon: <FiBook size={15} />, labelKey: "englishBooks" },
    { path: "/MyanmarBooks", icon: <FiBook size={15} />, labelKey: "myanmarBooks" },
    { path: "/Barcode", icon: <LuScanBarcode size={15} />, labelKey: "barcodeGenerator" },
    { path: "/Label", icon: <BsCardText size={15} />, labelKey: "labelGenerator" },
    { path: "/DDC", icon: <FiGrid size={15} />, labelKey: "ddcView" },
    { path: "/BookReport", icon: <FiBookOpen size={15} />, labelKey: "bookReport" },
    { path: "/MARC", icon: <TbBookDownload size={15} />, labelKey: "marc" },
    { path: "/LibraryVerify", icon: <MdVerified size={15} />, labelKey: "verifyLibrary" },
    { path: "/Profile", icon: <FiUser size={15} />, labelKey: "profile" },
    { path: "/Members", icon: <FiUsers size={15} />, labelKey: "members" },
    { path: "/Settings", icon: <FiSettings size={15} />, labelKey: "settings" },
  ];

  const menuItems = useMemo(() => {
    const adminItem = user?.role === "SuperAdmin"
      ? [{ path: "/Admin/Registrations", icon: <FiBookOpen size={15} />, labelKey: "admin" }]
      : [];
    return [...baseItems, ...adminItem];
  }, [user?.role]);

  const translatedMenuItems = useMemo(() => {
    const dictionary = sidebarTranslations[language] || sidebarTranslations.en;
    return menuItems.map((item) => ({ ...item, label: dictionary[item.labelKey] || item.labelKey }));
  }, [menuItems, language]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      sessionStorage.clear();
      localStorage.removeItem('uc_user');
      setUser(null);
      navigate("/Login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:translate-x-0 bg-gradient-to-br from-[#0C2D57] via-[#1B4B8A] to-[#2E6BAA] backdrop-blur-sm shadow-xl ring-1 ring-white/20 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 text-white text-center">
            <h1 className="text-xl font-extrabold tracking-wide">Union Catalog</h1>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar text-sm font-medium">
            <nav className="mt-1 px-2">
              {translatedMenuItems.map((item) => (
                <Link key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 ${location.pathname === item.path ? "bg-white/95 text-[#2E6BAA] shadow-md" : "text-white hover:bg-white/20 hover:text-white"}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-500">
            <button
              onClick={handleLogout}
              className="flex items-center text-sm font-medium w-full px-4 py-2 text-white hover:bg-white hover:text-[#2E6BAA] rounded-lg transition-colors duration-200"
            >
              <FiLogOut size={15} className="mr-3" />
              <span>{(sidebarTranslations[language] || sidebarTranslations.en).logout}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
