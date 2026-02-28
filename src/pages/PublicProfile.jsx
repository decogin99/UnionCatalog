import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import { libraryService } from '../services/libraryService';
import { adminService } from '../services/adminService';
import LibraryPublicView from '../components/LibraryPublicView';
import { useAuth } from '../context/AuthProvider.jsx';

const PublicProfile = () => {
  const { user } = useAuth();
  const { profileId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = data?.libraryName || 'Library Profile';
  }, [data?.libraryName]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const res = (user?.role === 'SuperAdmin')
          ? await adminService.getLibraryProfile(profileId)
          : await libraryService.getLibraryProfile(profileId);
        const d = res?.data?.result ?? res?.result ?? res ?? {};
        const imageBase = (import.meta.env.VITE_IMAGE_BASE_URL || '').replace(/\/+$/, '');
        const makeCoverUrl = (name) => {
          const raw = typeof name === 'string' ? name : (name || '');
          if (!raw) return '';
          if (/^https?:\/\//.test(raw)) return raw;
          const n = String(raw).replace(/^\/+/, '').replace(/^images\//, '').replace(/^libraryBookCovers\//, '');
          return `${imageBase}/libraryCovers/${n}`;
        };
        const makeProfileUrl = (name) => {
          const raw = typeof name === 'string' ? name : (name || '');
          if (!raw) return '';
          if (/^https?:\/\//.test(raw)) return raw;
          const n = String(raw).replace(/^\/+/, '').replace(/^images\//, '').replace(/^libraryProfiles\//, '');
          return `${imageBase}/libraryProfiles/${n}`;
        };
        if (mounted) {
          setData({
            profileImageUrl: makeProfileUrl(d.LibraryPhoto ?? d.libraryPhoto ?? ''),
            coverImageUrl: makeCoverUrl(d.LibraryCover ?? d.libraryCover ?? ''),
            libraryName: d.LibraryName ?? d.libraryName ?? '',
            libraryType: d.LibraryType ?? d.libraryType ?? '',
            libraryAccess: d.LibraryAccess ?? d.libraryAccess ?? '',
            libraryStatus: d.LibraryStatus ?? d.libraryStatus ?? '',
            libraryVisibility: d.LibraryVisibility ?? d.libraryVisibility ?? '',
            email: d.Email ?? d.email ?? '',
            phoneNumber: d.PhoneNumber ?? d.phoneNumber ?? '',
            township: d.Township ?? d.township ?? '',
            stateDivision: d.StateDivision ?? d.stateDivision ?? '',
            address: d.Address ?? d.address ?? '',
            engBooks: [],
            mmBooks: [],
            engPage: 1,
            mmPage: 1,
            engTotalPages: 0,
            mmTotalPages: 0,
            engTotalItems: 0,
            mmTotalItems: 0,
          });
        }
      } catch (err) {
        if (mounted) setError(err?.message || 'Failed to load library profile');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [profileId]);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      {(user?.role === 'SuperAdmin') ? (
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      ) : (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}
      {(user?.role === 'SuperAdmin') ? (
        <AdminNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      ) : (
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      )}
      
      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
            </div>
          ) : error ? (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{error}</div>
          ) : data ? (
            <>
                <div className="mb-2">
                    <button onClick={() => navigate(user?.role === 'SuperAdmin' ? '/Admin/Libraries' : '/Dashboard')} className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md">Back</button>
                </div>
                <LibraryPublicView
                  profileImageUrl={data.profileImageUrl}
                  coverImageUrl={data.coverImageUrl}
                  libraryName={data.libraryName}
                  libraryType={data.libraryType}
                  libraryAccess={data.libraryAccess}
                  libraryStatus={data.libraryStatus}
                  libraryVisibility={data.libraryVisibility}
                  email={data.email}
                  phoneNumber={data.phoneNumber}
                  township={data.township}
                  stateDivision={data.stateDivision}
                  address={data.address}
                  profileId={profileId}
                />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;