import { useState, useEffect } from 'react';
import { FiBook } from 'react-icons/fi';
import { MdVerified, MdWorkspacePremium } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthProvider.jsx';
import { libraryService } from '../services/libraryService';

const StatCard = ({ icon, title, value, color, onClick }) => (
    <div onClick={onClick} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm p-6 ring-1 ring-gray-100 cursor-pointer hover:shadow-md transition">
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
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isStatusLoading, setIsStatusLoading] = useState(true);
    const [statusError, setStatusError] = useState('');

    const [verifiedLoading, setVerifiedLoading] = useState(false);
    const [verifiedError, setVerifiedError] = useState('');

    const [english, setEnglish] = useState(0);
    const [myanmar, setMyanmar] = useState(0);
    const [verifiedLibs, setVerifiedLibs] = useState([]);
    const [verifiedPage, setVerifiedPage] = useState(1);
    const [verifiedTotalPages, setVerifiedTotalPages] = useState(0);
    const [verifiedTotal, setVerifiedTotal] = useState(0);

    useEffect(() => {
        document.title = "Dashboard"
        if (isSidebarOpen && window.innerWidth < 1024) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => { document.body.classList.remove('no-scroll'); };
    }, [isSidebarOpen]);

    const fetchDashboardStatus = async () => {
      setStatusError('')
      setIsStatusLoading(true);
      try{
        const res = await libraryService.getDashboardStats();
            if (res?.success) {
                const r = res?.data?.result ?? res?.result ?? res?.data ?? {};
                const en = r.TotalEnglishBooks ?? r.totalEnglishBooks ?? 0;
                const mm = r.TotalMyanmarBooks ?? r.totalMyanmarBooks ?? 0;
                setEnglish(en);
                setMyanmar(mm);
            } else {
                setStatusError(
                  res?.message
                    ? res.message === 'Unauthorized'
                      ? 'User unauthorized! Please login again.'
                      : res.message
                    : 'Fail to load stats'
                );
            }
      }
      catch (err) {
        setStatusError(err?.message || 'Failed to load stats');
      }
      finally{
        setIsStatusLoading(false);
      }
    }

    const fetchVerifiedLibraries = async () => {
      setVerifiedError('');
      setVerifiedLoading(true);
      try{
        const res = await libraryService.getVerifiedLibraries(verifiedPage, 3);
        if(res?.success){
          const r = res?.data?.verifiedLibraries ?? res?.verifiedLibraries ?? {};
            const raw = Array.isArray(r.items) ? r.items : [];
            const imageBase = import.meta.env.VITE_IMAGE_BASE_URL || '';
            const normalized = raw.map(x => {
                const name = x.libraryName ?? x.LibraryName ?? '';
                const type = x.libraryType ?? x.LibraryType ?? '';
                const coverRaw = x.coverPhoto ?? x.CoverPhoto ?? '';
                const photoRaw = x.profilePhoto ?? x.ProfilePhoto ?? '';
                const norm = s => String(s).replace(/^\/+/, '');
                const cover = /^https?:\/\//.test(coverRaw) ? coverRaw : (coverRaw ? `${imageBase}libraryCovers/${norm(coverRaw)}` : '');
                const photo = /^https?:\/\//.test(photoRaw) ? photoRaw : (photoRaw ? `${imageBase}libraryProfiles/${norm(photoRaw)}` : '');
                const bookCount = x.bookCount ?? x.BookCount;
                const id = x.profileId ?? x.profileId;
                const libraryAccess = x.libraryAccess ?? x.LibraryAccess ?? '';
                return { id, name, type, cover, photo, bookCount, libraryAccess };
            });
            setVerifiedLibs(normalized);
            setVerifiedTotal(r.totalItems ?? r.TotalItems ?? raw.length);
            setVerifiedTotalPages(r.totalPages ?? r.TotalPages ?? 1);
        }
        else{
          setVerifiedError(
            res?.message
              ? res.message === 'Unauthorized'
                ? 'User unauthorized! Please login again.'
                : res.message
              : 'Fail to load verified libraries'
          );
        }
      }
      catch (err) {
        setVerifiedError(err?.message || 'Failed to load verified libraries');
      }
      finally{
        setVerifiedLoading(false);
      }
    }

    useEffect(() => {
        fetchDashboardStatus();
    }, []);

    useEffect(() => {
        if (user?.libraryAccess !== 'Verified') return;
        fetchVerifiedLibraries();
    }, [user?.libraryAccess, verifiedPage]);

    const handleStatusRetry = async () => {
      await fetchDashboardStatus();
    }

    const handleVerifiedLibrariesRetry = async () => {
      await fetchVerifiedLibraries();
    }

    const stats = [
        { title: 'English Books', value: english.toLocaleString(), icon: <FiBook size={24} className="text-[#0C2D57]" />, color: '#0C2D57', onClick: () => navigate('/EnglishBooks') },
        { title: 'Myanmar Books', value: myanmar.toLocaleString(), icon: <FiBook size={24} className="text-[#2E8A99]" />, color: '#2E8A99', onClick: () => navigate('/MyanmarBooks') },
    ];

    return (
        <div className="fixed inset-0 flex flex-col bg-[#F2F2F2] overflow-y-auto">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <div className='flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto'>
            {/* Main Content */}
            <div className="p-4 lg:px-8">
              <div className="mb-5">
                  <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">Dashboard</h1>
                  <p className="text-sm sm:text-base text-[#1B4B8A]">Welcome to Union Catalog Portal</p>
              </div>

              {isStatusLoading ? (
                <div className="flex justify-center items-center h-24">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
                  </div>
              ) : (
                statusError ? (
                  <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200 flex items-center justify-between">
                    <span className="truncate">{statusError}</span>
                    <button onClick={handleStatusRetry} className="ml-3 px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-70 flex items-center gap-2">
                      <span>Retry</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {stats.map((stat, index) => (
                          <StatCard key={index} {...stat} />
                      ))}
                  </div>
                )
              )}

          </div>

            {/* Verified Libraries */}
            {user?.libraryAccess === 'Verified' && (
            <div className="p-4 lg:px-8">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Verified Libraries 
                    <span className="text-gray-600 text-md mx-1">({verifiedTotal})</span> 
                    {/* <span onClick={() => alert('under maintenance')} className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer">View All</span> */}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { if (verifiedPage > 1) setVerifiedPage(verifiedPage - 1); }} disabled={verifiedPage <= 1 || verifiedLoading} className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50">Prev</button>
                    <button onClick={() => { if (verifiedTotalPages === 0 || verifiedPage >= verifiedTotalPages) return; setVerifiedPage(verifiedPage + 1); }} disabled={verifiedPage >= verifiedTotalPages || verifiedLoading} className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50">Next</button>
                  </div>
                </div>
                {verifiedLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
                  </div>
                ) : verifiedError ? (
                  <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200 flex items-center justify-between">
                    <span className="truncate">{verifiedError}</span>
                    <button onClick={handleVerifiedLibrariesRetry} className="ml-3 px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-70 flex items-center gap-2">
                      <span>Retry</span>
                    </button>
                  </div>
                ) : (verifiedLibs.length === 0 || verifiedTotal === 0) ? (
                  <div className="text-sm text-gray-700">No verified libraries</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {verifiedLibs.map((lib, idx) => (
                      <div key={idx} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden hover:shadow-md">
                        <div className="relative">
                          <div className="h-45 w-full bg-gradient-to-r from-[#1B4B8A] via-[#1B4B8A] to-[#2E6BAA]"></div>
                          {lib.cover && (
                            <img src={lib.cover} alt="" className="absolute inset-0 h-45 w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          )}
                          <div className="absolute left-4 -bottom-8 w-20 h-20 rounded-full ring-2 ring-white object-cover bg-gray-300"></div>
                          {lib.photo ? (
                            <img src={lib.photo} alt="" className="absolute left-4 -bottom-8 w-20 h-20 rounded-full ring-2 ring-white object-cover bg-gray-300" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            <div className="absolute left-4 -bottom-8 w-20 h-20 rounded-full ring-2 ring-white bg-gray-300"></div>
                          )}
                        </div>
                        <div className="pt-10 px-4 pb-4">
                          <div className="font-semibold text-gray-900">
                            <span className="text-lg">{lib.name || '—'}</span>
                            {lib.libraryAccess === 'Verified' && (
                              <span className="ml-2 inline-flex align-text-top text-[#2E6BAA]" title="Verified Library"><MdVerified size={17} /></span>
                            )}
                            {lib.libraryAccess === 'Premium' && (
                              <span className="ml-2 inline-flex items-center text-[#D4AF37]"><MdWorkspacePremium size={14} /></span>
                            )}
                          </div>
                          <div className="text-md text-gray-600">{lib.type || '—'}</div>
                          {lib.bookCount != null && (
                            <div className="text-xs text-gray-600 mt-1">{String(lib.bookCount)} Books</div>
                          )}
                          <div className="mt-3 flex justify-end">
                            <button onClick={() => navigate(`/PublicProfile/${lib.id}`)} className="px-3 py-1.5 text-sm rounded-md bg-[#2E6BAA] text-white hover:bg-[#1B4B8A]">View</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
    );
};

export default Dashboard;