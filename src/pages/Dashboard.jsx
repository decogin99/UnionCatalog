import { useState, useEffect } from 'react';
import { FiBook, FiClock, FiUsers } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 ring-1 ring-gray-100">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
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

    // Handle body scroll lock
    useEffect(() => {
        if (isSidebarOpen && window.innerWidth < 1024) { // 1024px is the 'lg' breakpoint in Tailwind
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isSidebarOpen]);

    // Sample data - replace with actual data later
    const stats = [
        {
            title: 'English Books',
            value: '2,451',
            icon: <FiBook size={24} className="text-[#0C2D57]" />,
            color: '#0C2D57'
        },
        {
            title: 'Myanmar Books',
            value: '1,257',
            icon: <FiBook size={24} className="text-[#2E8A99]" />,
            color: '#2E8A99'
        },
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

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>

                    {/* Recent Activity Section */}
                    <div className="mt-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 ring-1 ring-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Recent Activity</h2>
                        <div className="space-y-1">
                            {/* Sample activity items */}
                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-blue-100 mr-3">
                                        <FiBook className="text-[#0C2D57]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">New Book Added</p>
                                        <p className="text-sm text-gray-500">The Art of Programming</p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">2 hours ago</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-green-100 mr-3">
                                        <FiBook className="text-[#2E8A99]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Book Updated</p>
                                        <p className="text-sm text-gray-500">Myanmar Literature Vol.2</p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">5 hours ago</span>
                            </div>
                        </div>
                    </div>



                </div>
            </div>
        </div>
    );
};

export default Dashboard;