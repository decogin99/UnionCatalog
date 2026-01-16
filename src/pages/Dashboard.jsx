import { useState, useEffect } from 'react';
import { FiBook } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { libraryService } from '../services/libraryService';

const StatCard = ({ icon, title, value, color, onClick }) => (
    <div onClick={onClick} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 ring-1 ring-gray-100 cursor-pointer hover:shadow-lg transition">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-gray-500 text-md font-medium">{title}</h3>
                <p className="text-2xl font-extrabold mt-2" style={{ color }}>{value}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
                {icon}
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [english, setEnglish] = useState(0);
    const [myanmar, setMyanmar] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Dashboard"
        if (isSidebarOpen && window.innerWidth < 1024) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => { document.body.classList.remove('no-scroll'); };
    }, [isSidebarOpen]);

    useEffect(() => {
        let mounted = true;
        setError('');
        setIsLoading(true);
        (async () => {
            try {
                const res = await libraryService.getDashboardStats();
                if (res?.success) {
                    const r = res?.data?.result ?? res?.result ?? res?.data ?? {};
                    const en = r.TotalEnglishBooks ?? r.totalEnglishBooks ?? 0;
                    const mm = r.TotalMyanmarBooks ?? r.totalMyanmarBooks ?? 0;
                    if (mounted) { setEnglish(en); setMyanmar(mm); }
                } else {
                    if (mounted) setError(res?.message || 'Failed to load stats');
                }
            } catch (err) {
                if (mounted) setError(err?.message || 'Failed to load stats');
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const stats = [
        { title: 'English Books', value: english.toLocaleString(), icon: <FiBook size={24} className="text-[#0C2D57]" />, color: '#0C2D57', onClick: () => navigate('/EnglishBooks') },
        { title: 'Myanmar Books', value: myanmar.toLocaleString(), icon: <FiBook size={24} className="text-[#2E8A99]" />, color: '#2E8A99', onClick: () => navigate('/MyanmarBooks') },
    ];

    return (
        <div className="fixed inset-0 flex flex-col bg-[#F2F2F2] font-medium">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
                <div className="p-4 lg:px-8">
                    <div className="mb-5">
                        <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">Dashboard</h1>
                        <p className="text-sm sm:text-base text-[#1B4B8A]">Welcome to Union Catalog Portal</p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{error}</div>
                    )}
                    {isLoading ? (
                        <div className="flex justify-center items-center h-24">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <StatCard key={index} {...stat} />
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Dashboard;