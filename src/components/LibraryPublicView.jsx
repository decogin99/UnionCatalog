import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { MdVerified, MdWorkspacePremium } from "react-icons/md";
import { useLanguage } from '../context/AuthProvider.jsx';
export default function LibraryPublicView({
  profileImageUrl = '',
  coverImageUrl = '',
  libraryName = '',
  libraryType = '',
  libraryAccess = '',
  libraryVisibility = '',
  libraryStatus = '',
  email = '',
  phoneNumber = '',
  township = '',
  stateDivision = '',
  address = '',
  profileId = null,
}) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [engBooks, setEngBooks] = useState([]);
  const [mmBooks, setMmBooks] = useState([]);
  const [engLoading, setEngLoading] = useState(false);
  const [mmLoading, setMmLoading] = useState(false);
  const [engError, setEngError] = useState('');
  const [mmError, setMmError] = useState('');
  const [engPage, setEngPage] = useState(1);
  const [mmPage, setMmPage] = useState(1);
  const [engTotalPages, setEngTotalPages] = useState(0);
  const [mmTotalPages, setMmTotalPages] = useState(0);
  const [engTotalItems, setEngTotalItems] = useState(0);
  const [mmTotalItems, setMmTotalItems] = useState(0);
  const [coverOk, setCoverOk] = useState(!!coverImageUrl);
  const [profileOk, setProfileOk] = useState(!!profileImageUrl);

  const t = language === 'mm'
    ? {
        visibility: 'မြင်နိုင်မှု', email: 'အီးမေးလ်', phone: 'ဖုန်း', location: 'တည်နေရာ', address: 'လိပ်စာ',
        englishBooks: 'အင်္ဂလိပ် စာအုပ်များ', myanmarBooks: 'မြန်မာ စာအုပ်များ', viewAll: 'အားလုံးကြည့်မည်',
        prev: 'ရှေ့', next: 'နောက်', noEnglishBooks: 'အင်္ဂလိပ် စာအုပ်များ မရှိပါ', noMyanmarBooks: 'မြန်မာ စာအုပ်များ မရှိပါ',
        banned: 'ဤစာကြည့်တိုက်ကို တားမြစ်ထားသည်'
      }
    : {
        visibility: 'Visibility', email: 'Email', phone: 'Phone', location: 'Location', address: 'Address',
        englishBooks: 'English Books', myanmarBooks: 'Myanmar Books', viewAll: 'View All',
        prev: 'Prev', next: 'Next', noEnglishBooks: 'No English books', noMyanmarBooks: 'No Myanmar books',
        banned: 'This library has been banned'
      };
  useEffect(() => { setCoverOk(!!coverImageUrl); }, [coverImageUrl]);
  useEffect(() => { setProfileOk(!!profileImageUrl); }, [profileImageUrl]);
  const imageBase = (import.meta.env.VITE_IMAGE_BASE_URL || '').replace(/\/+$/, '');
  const normalizeBooks = (res, type) => {
    if (!res?.success) return [];
    const container = res?.data?.result ?? res?.result ?? res?.data ?? {};
    const raw = Array.isArray(container.Items)
      ? container.Items
      : Array.isArray(container.items)
      ? container.items
      : Array.isArray(container)
      ? container
      : [];
    return raw.map((b) => {
      const coverFile = b.BookCover ?? b.bookCover ?? '';
      const cover = coverFile ? `${imageBase}/libraryBookCovers/${type === 'English' ? 'englishBooks' : 'myanmarBooks'}/${coverFile}` : '';
      return {
        bookId: b.BookId ?? b.bookId ?? '',
        publicId: b.PublicId ?? b.publicId ?? '',
        title: b.Title ?? b.title ?? '',
        controlAction: b.ControlAction ?? b.controlAction ?? '',
        cover,
      };
    });
  };
  const fetchEnglishBooks = async (page = engPage) => {
    setEngLoading(true);
    setEngError('');
    try {
      const res = await bookService.getBookList(page, 'English', '', '', '', 'starts', '', 'starts', 0, 0, profileId);
      const list = normalizeBooks(res, 'English');
      const container = res?.data?.result ?? res?.result ?? res?.data ?? {};
      const tp = container.TotalPages ?? container.totalPages ?? 0;
      const ti = container.TotalItems ?? container.totalItems ?? list.length;
      const pn = container.PageNumber ?? container.pageNumber ?? page;
      setEngBooks(list);
      setEngTotalPages(tp);
      setEngTotalItems(ti);
      setEngPage(pn);
    } catch (err) {
      setEngBooks([]);
      setEngError(err?.message || 'Failed to load English books');
    } finally {
      setEngLoading(false);
    }
  };
  const fetchMyanmarBooks = async (page = mmPage) => {
    setMmLoading(true);
    setMmError('');
    try {
      const res = await bookService.getBookList(page, 'Myanmar', '', '', '', 'starts', '', 'starts', 0, 0, profileId);
      const list = normalizeBooks(res, 'Myanmar');
      const container = res?.data?.result ?? res?.result ?? res?.data ?? {};
      const tp = container.TotalPages ?? container.totalPages ?? 0;
      const ti = container.TotalItems ?? container.totalItems ?? list.length;
      const pn = container.PageNumber ?? container.pageNumber ?? page;
      setMmBooks(list);
      setMmTotalPages(tp);
      setMmTotalItems(ti);
      setMmPage(pn);
    } catch (err) {
      setMmBooks([]);
      setMmError(err?.message || 'Failed to load Myanmar books');
    } finally {
      setMmLoading(false);
    }
  };
  useEffect(() => {
    fetchEnglishBooks(1);
    fetchMyanmarBooks(1);
  }, [profileId]);
  const onEngPrev = () => { if (engPage > 1 && !engLoading) fetchEnglishBooks(engPage - 1); };
  const onEngNext = () => { if (engTotalPages === 0 || engPage >= engTotalPages || engLoading) return; fetchEnglishBooks(engPage + 1); };
  const onMmPrev = () => { if (mmPage > 1 && !mmLoading) fetchMyanmarBooks(mmPage - 1); };
  const onMmNext = () => { if (mmTotalPages === 0 || mmPage >= mmTotalPages || mmLoading) return; fetchMyanmarBooks(mmPage + 1); };
  return (
    <>
      <div className="relative z-0 mb-6 rounded-xl overflow-hidden ring-1 ring-white/20">
        <div className="w-full h-64 sm:h-100 bg-gradient-to-r from-[#1B4B8A] via-[#1B4B8A] to-[#2E6BAA]" />
        {coverOk && (
          <img src={coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" onError={() => setCoverOk(false)} />
        )}
      </div>
      <div className="relative z-10 flex items-center gap-4 px-6 -mt-12 sm:-mt-14">
        <div className="relative">
          <div className="w-28 h-28 rounded-full ring-4 ring-white shadow-md bg-gray-300"></div>
          {profileOk && (
            <img src={profileImageUrl} alt="" className="absolute inset-0 w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-md" onError={() => setProfileOk(false)} />
          )}
        </div>
        <div className="pt-10 text-2xl font-bold text-black">
          <div>
            {libraryName}
            {libraryAccess === 'Verified' && (
              <span className="ml-2 inline-flex align-middle text-[#2E6BAA]" title="Verified Library"><MdVerified size={20} /></span>
            )}
            {libraryAccess === 'Premium' && (
              <span className="ml-2 inline-flex align-middle text-[#D4AF37]" title="Premium Library"><MdWorkspacePremium size={20} /></span>
            )}
          </div>
          <div>
            <span className="text-sm text-gray-600">
              {libraryType}
              <span className={`ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 
                ${libraryVisibility === 'Private' ? 'bg-red-50 text-red-700 ring-red-200' : 
                  'bg-green-50 text-green-700 ring-green-200'}`}
              >
                {t.visibility} : {libraryVisibility}
              </span>
            </span>
          </div>
          {libraryStatus === 'Banned' && (
            <span className="inline-flex align-middle text-red-600 text-sm" title="Active Library">{t.banned}</span>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase text-gray-500">{t.email}</div>
            <div className="text-gray-900">{email}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">{t.phone}</div>
            <div className="text-gray-900">{phoneNumber}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">{t.location}</div>
            <div className="text-gray-900">{township}, {stateDivision}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">{t.address}</div>
            <div className="text-gray-900">{address}</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">
              {t.englishBooks} <span className="text-gray-600 text-sm">({engTotalItems}) <span onClick={() => navigate(`/PublicBooks/EnglishBooks?profileId=${profileId}&libraryName=${encodeURIComponent(libraryName)}`)} className="text-blue-600 hover:text-blue-800 text-xs cursor-pointer">{t.viewAll}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEngPrev}
                disabled={engPage <= 1 || engLoading}
                className="px-3 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {t.prev}
              </button>
              <button
                onClick={onEngNext}
                disabled={engPage >= engTotalPages || engLoading}
                className="px-3 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {t.next}
              </button>
            </div>
          </div>

          {engLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E6BAA]"></div>
            </div>
          ) : engError ? (
            <div className="text-xs text-red-700">{engError}</div>
          ) : engBooks.length === 0 ? (
            <div className="text-xs text-gray-700">{t.noEnglishBooks}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {engBooks.map((b) => (
                <div onClick={() => { localStorage.setItem('BookDetail:returnPath', `/PublicProfile/${profileId}`); navigate(b.controlAction && b.bookId ? `/EnglishBooks/Detail/${b.bookId}` : `/EnglishBooks/Detail?publicId=${b.publicId}`); }} key={`mm-${b.controlAction ? b.bookId : b.publicId}`}  className="bg-white rounded-md shadow-sm overflow-hidden ring-1 ring-gray-100 cursor-pointer">
                  <div className="aspect-[2/3] bg-gray-100">
                    {b.cover ? (
                      <img
                        src={b.cover}
                        alt=""
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="m-2 text-[11px] font-medium text-gray-800 h-9 overflow-hidden">{b.title}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">
              {t.myanmarBooks} <span className="text-gray-600 text-sm">({mmTotalItems}) <span onClick={() => navigate(`/PublicBooks/MyanmarBooks?profileId=${profileId}&libraryName=${encodeURIComponent(libraryName)}`)} className="text-blue-600 hover:text-blue-800 text-xs cursor-pointer">{t.viewAll}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onMmPrev}
                disabled={mmPage <= 1 || mmLoading}
                className="px-3 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {t.prev}
              </button>
              <button
                onClick={onMmNext}
                disabled={mmPage >= mmTotalPages || mmLoading}
                className="px-3 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {t.next}
              </button>
            </div>
          </div>

          {mmLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E6BAA]"></div>
            </div>
          ) : mmError ? (
            <div className="text-xs text-red-700">{mmError}</div>
          ) : mmBooks.length === 0 ? (
            <div className="text-xs text-gray-700">{t.noMyanmarBooks}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {mmBooks.map((b) => (
                <div onClick={() => { localStorage.setItem('BookDetail:returnPath', `/PublicProfile/${profileId}`); navigate(b.controlAction && b.bookId ? `/MyanmarBooks/Detail/${b.bookId}` : `/MyanmarBooks/Detail?publicId=${b.publicId}`); }} key={`mm-${b.controlAction ? b.bookId : b.publicId}`}  className="bg-white rounded-md shadow-sm overflow-hidden ring-1 ring-gray-100 cursor-pointer"> 
                  <div className="aspect-[2/3] bg-gray-100">
                    {b.cover ? (
                      <img
                        src={b.cover}
                        alt=""
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="m-2 text-[11px] font-medium text-gray-800 h-9 overflow-hidden">{b.title}</div>
                </div>
              ))}
            </div>
          )}

          
        </div>
      </div>
    </>
  );
}