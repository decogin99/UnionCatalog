import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { libraryService } from '../services/libraryService';
import { useLanguage } from "../context/AuthProvider.jsx";


export default function Members () {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { language } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [retrying, setRetrying] = useState(false);
    const [members, setMembers] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    //const imageBase = (import.meta.env.VITE_IMAGE_BASE_URL || '').replace(/\/+$/, '');

    const t = language === 'mm'
    ? {
        pageTitle: 'မန်ဘာများ',
        heading: 'မန်ဘာစာရင်း',
        photo: 'ဓာတ်ပုံ',
        name: 'နာမည်',
        email: 'အီးမေးလ်',
        phoneNumber: 'ဖုန်း',
        access: 'အဆင့်',
        address: 'လိပ်စာ',
        joinedDate: 'ဝင်ရောက်သည့်နေ့',
        actions: 'လုပ်ဆောင်ချက်များ',
        retry: 'ပြန်ကြိုးစားပါ',
        prev: 'ယခင်',
        next: 'နောက်',
        page: 'စာမျက်နှာ',
        of: '၏',
        totalMembers: 'စုစုပေါင်း မန်ဘာ',
        noMembersFound: 'မည်သည့် မန်ဘာမှ မတွေ့ရှိပါ'
      }
    : {
        pageTitle: 'Members',
        heading: 'Members List',
        photo: 'Photo',
        name: 'Name',
        email: 'Email',
        phoneNumber: 'Phone',
        access: 'Level',
        address: 'Address',
        joinedDate: 'Joined Date',
        actions: 'Actions',
        retry: 'Retry',
        prev: 'Prev',
        next: 'Next',
        page: 'Page',
        of: 'of',
        totalMembers: 'total Members',
        noMembersFound: 'No members found'
      };

    useEffect(() => {
        document.title = t.pageTitle;
    }, [t.pageTitle]);

    const fetchJoinedMembers = async (page = pageNumber) => {
        setError('');
        setIsLoading(true);
        try {
            const res = await libraryService.getJoinedMembers(page, pageSize);
            if (res?.success) {
                const container = res?.data?.result ?? res?.result ?? res?.data ?? {};
                const items = Array.isArray(container.items) 
                    ? container.items 
                    : Array.isArray(container.Items) 
                    ? container.Items 
                    : Array.isArray(container) 
                    ? container 
                    : [];
                
                setMembers(items);
                
                const totalItemsVal = container.totalItems ?? container.TotalItems ?? items.length;
                const totalPagesVal = container.totalPages ?? container.TotalPages ?? (pageSize ? Math.ceil(totalItemsVal / pageSize) : 1);
                
                setTotalItems(totalItemsVal);
                setTotalPages(totalPagesVal);
                setPageNumber(page);
            } else {
                setError(
                res?.message
                    ? res.message === 'Unauthorized'
                    ? 'User unauthorized! Please login again.'
                    : res.message
                    : 'Fail to load joined members'
                );
            }
        } catch (err) {
            setError(err?.message || 'Failed to load members');
        } finally {
            setIsLoading(false);
            setRetrying(false);
        }
    }

    const goToPage = (newPage) => {
        if (newPage >= 1 && (totalPages === 0 || newPage <= totalPages)) {
            fetchJoinedMembers(newPage);
        }
    };

    useEffect(() => {
    fetchJoinedMembers();
    }, []);

    const handleRetry = async () => {
    setRetrying(true);
    fetchJoinedMembers();
    };

    return(
        <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
                <div className="p-4 lg:px-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">{t.heading}</h1>
                    </div>

                    {error && (
                        <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200 flex items-center justify-between mb-5">
                            <span className="truncate">{error}</span>
                            <button onClick={handleRetry} disabled={retrying} className="ml-3 px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-70 flex items-center gap-2">
                                {retrying && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                                </svg>
                                )}
                                <span>{t.retry}</span>
                            </button>
                        </div>
                    )}

                    <div className="rounded-xl bg-white ring-1 ring-white/60 shadow-sm">
                        <div className={`overflow-x-auto rounded-xl`}>
                            <table className="min-w-[800px] w-full text-sm">
                                <thead className="bg-gradient-to-r from-[#dbeeff] to-[#bfe0f7]">
                                <tr className="text-[#0C2D57]">
                                    <th className="p-5 text-left font-semibold">{t.photo}</th>
                                    <th className="p-5 text-left font-semibold">{t.name}</th>
                                    <th className="p-5 text-left font-semibold">{t.email}</th>
                                    <th className="p-5 text-left font-semibold">{t.phoneNumber}</th>
                                    <th className="p-5 text-left font-semibold">{t.address}</th>
                                    <th className="p-5 text-center font-semibold">{t.access}</th>
                                    <th className="p-5 text-right font-semibold">{t.joinedDate}</th>
                                    {/* <th className="p-5 text-center font-semibold">{t.actions}</th> */}
                                </tr>
                                </thead>
                                <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="p-8">
                                            <div className="flex justify-center items-center h-24">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : members.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-10 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <svg className="h-12 w-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                <p className="text-lg font-medium">{t.noMembersFound}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((item) => {
                                        const address = `${item.township}, ${item.stateDivision}`;
                                        const joinedDate = item.joinedAt ? new Date(item.joinedAt).toLocaleDateString() : '-';
                                        
                                        return (
                                            <tr key={item.memberId}
                                                className="border-t border-white/40 hover:bg-gray-100"
                                            >
                                                <td className="px-5">
                                                    {item.profilePhoto ? (
                                                        <img src={item.profilePhoto} alt={item.displayName} className="h-10 w-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-5 font-semibold text-gray-800">{item.displayName}</td>
                                                <td className="p-5 text-left text-gray-800">{item.email}</td>
                                                <td className="p-5 text-left text-gray-800">{item.phoneNumber}</td>
                                                <td className="p-5 text-left text-gray-800">{address}</td>
                                                <td className="p-5 text-center text-gray-900">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.memberAccess === 'Free' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                                                        {item.memberAccess}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-right text-gray-800">{joinedDate}</td>
                                                {/* <td className="p-5 text-center">
                                                    <button className="px-2 py-1 text-sm rounded bg-[#2E6BAA] text-white hover:bg-[#29529B]">
                                                        {t.edit}
                                                    </button>
                                                </td> */}
                                            </tr>
                                        );
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {!isLoading && !error && (
                        <div className="mt-4 px-4 py-3 bg-white rounded-xl ring-1 ring-gray-200 flex items-center justify-between shadow-sm">
                            <div className="text-sm text-gray-700">
                                {t.page} {pageNumber} {t.of} {totalPages} • {totalItems} {t.totalMembers}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToPage(pageNumber - 1)}
                                    disabled={pageNumber <= 1 || isLoading}
                                    className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                                >
                                    {t.prev}
                                </button>
                                <button
                                    onClick={() => goToPage(pageNumber + 1)}
                                    disabled={pageNumber >= totalPages || isLoading}
                                    className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                                >
                                    {t.next}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}