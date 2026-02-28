import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import { FiGrid, FiList, FiFilter } from 'react-icons/fi';
import { bookService } from '../services/bookService';
import BookGridView from '../components/BookGridView';
import BookListView from '../components/BookListView';
import { useAuth } from '../context/AuthProvider.jsx';

export default function PublicBooks() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(0);

  const [filterField, setFilterField] = useState('title');
  const [filterQuery, setFilterQuery] = useState('');
  const [advOpen, setAdvOpen] = useState(false);
  const [advTitleTerm, setAdvTitleTerm] = useState('');
  const [advTitleMode, setAdvTitleMode] = useState('starts');
  const [advAuthorTerm, setAdvAuthorTerm] = useState('');
  const [advAuthorMode, setAdvAuthorMode] = useState('starts');
  const [advYearFrom, setAdvYearFrom] = useState('');
  const [advYearTo, setAdvYearTo] = useState('');

  const [selectedIds, setSelectedIds] = useState(new Set());
  const toggleSelected = (id, checked) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const location = useLocation();
  const navigate = useNavigate();

  const bookType = location.pathname.includes('EnglishBooks') ? 'English' : 'Myanmar';
  const sp = new URLSearchParams(location.search);
  const profileId = sp.get('profileId') || null;
  const libraryName = sp.get('libraryName') || '';
  const imageBase = import.meta.env.VITE_IMAGE_BASE_URL || '';

  const fetchBooks = async (page = pageNumber, overrides) => {
    const ff = overrides?.filterField ?? filterField;
    const fq = (overrides?.filterQuery ?? filterQuery).trim();
    const tTerm = (overrides?.advTitleTerm ?? advTitleTerm).trim();
    const tMode = overrides?.advTitleMode ?? advTitleMode;
    const aTerm = (overrides?.advAuthorTerm ?? advAuthorTerm).trim();
    const aMode = overrides?.advAuthorMode ?? advAuthorMode;
    const yFrom = parseInt((overrides?.advYearFrom ?? advYearFrom) || 0, 10);
    const yTo = parseInt((overrides?.advYearTo ?? advYearTo) || 0, 10);
    setAdvOpen(false);
    setError('');
    setIsLoading(true);
    try {
      const res = await bookService.getBookList(
        page,
        bookType,
        ff,
        fq,
        tTerm,
        tMode,
        aTerm,
        aMode,
        yFrom,
        yTo,
        profileId
      );
      if (!res?.success) {
        setError(res?.message || 'Failed to load books');
        setBooks([]);
        setTotalItems(0);
        setTotalPages(0);
        setPageNumber(page);
      } else {
        const container = res?.data?.result ?? res?.result ?? res?.data ?? {};
        const raw = Array.isArray(container.Items)
          ? container.Items
          : Array.isArray(container.items)
          ? container.items
          : Array.isArray(container)
          ? container
          : [];
        const items = raw.map((b) => {
          const coverFile = b.BookCover ?? b.bookCover ?? '';
          return {
            bookId: b.BookId ?? b.bookId ?? '',
            publicId: b.PublicId ?? b.publicId ?? '',
            title: b.Title ?? b.title ?? '',
            author: b.Author ?? b.author ?? '',
            publisher: b.Publisher ?? b.publisher ?? '',
            publishedYear: b.PublishedYear ?? b.publishedYear ?? '',
            edition: b.Edition ?? b.edition ?? '',
            cover: coverFile ? `${imageBase}libraryBookCovers/${bookType === 'English' ? 'englishBooks' : 'myanmarBooks'}/${coverFile}` : '',
            isbn: b.ISBN ?? b.isbn ?? '',
            barCodeId: b.BarCodeId ?? b.barCodeId ?? '',
            controlAction: !!(b.ControlAction ?? b.controlAction ?? false),
            date: (() => {
              const d = b.CreatedAt ?? b.createdAt ?? '';
              return d && !isNaN(Date.parse(d)) ? new Date(d).toLocaleDateString() : d;
            })(),
          };
        });
        setBooks(items);
        const totalItemsVal = container.TotalItems ?? container.totalItems ?? items.length;
        const pageSizeVal = container.PageSize ?? container.pageSize ?? (items.length || undefined);
        const totalPagesVal = container.TotalPages ?? container.totalPages ?? (pageSizeVal ? Math.ceil(totalItemsVal / pageSizeVal) : (totalItemsVal > 0 ? 1 : 0));
        setTotalItems(totalItemsVal);
        setTotalPages(totalPagesVal);
        setPageSize(pageSizeVal || items.length);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load books');
      setBooks([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { setSelectedIds(new Set()); }, [bookType, profileId]);

  const initTypeRef = useRef(null);
  useEffect(() => {
    if (initTypeRef.current === `${bookType}:${profileId || ''}`) return;
    initTypeRef.current = `${bookType}:${profileId || ''}`;
    document.title = libraryName ? `${libraryName} Books` : `Public ${bookType} Books`;
    const lastDest = localStorage.getItem('Books:lastDest');
    const savedPageRaw = localStorage.getItem(`pageNumber:${bookType}`);
    let initialPage = 1;
    if (lastDest === 'detail' && savedPageRaw) {
      initialPage = Math.max(1, parseInt(savedPageRaw, 10));
    } else {
      localStorage.removeItem(`pageNumber:${bookType}`);
    }
    setPageNumber(initialPage);
    fetchBooks(initialPage);
    if (lastDest) {
      localStorage.removeItem('Books:lastDest');
    }
  }, [bookType, profileId]);

  useEffect(() => {
    const saved = localStorage.getItem('viewMode');
    if (saved) setViewMode(saved);
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await fetchBooks(pageNumber);
    } finally {
      setRetrying(false);
    }
  };

  const handleSearch = async () => { await goToPage(1); };

  const handleReset = async () => {
    const overrides = {
      filterField: 'title',
      filterQuery: '',
      advTitleTerm: '',
      advTitleMode: 'starts',
      advAuthorTerm: '',
      advAuthorMode: 'starts',
      advYearFrom: 0,
      advYearTo: 0,
    };
    setFilterField(overrides.filterField);
    setFilterQuery(overrides.filterQuery);
    setAdvTitleTerm(overrides.advTitleTerm);
    setAdvTitleMode(overrides.advTitleMode);
    setAdvAuthorTerm(overrides.advAuthorTerm);
    setAdvAuthorMode(overrides.advAuthorMode);
    setAdvYearFrom('');
    setAdvYearTo('');
    await goToPage(1, overrides);
  };

  const openDetail = (book) => {
    localStorage.setItem('Books:lastDest', 'detail');
    localStorage.setItem(`pageNumber:${bookType}`, String(pageNumber));
    localStorage.setItem('BookDetail:returnPath', `${location.pathname}${location.search}`);
    const base = bookType === 'English' ? '/EnglishBooks/Detail' : '/MyanmarBooks/Detail';
    const useBookId = !!book.controlAction && !!book.bookId;
    if (useBookId) {
      navigate(`${base}/${book.bookId}`);
    } else if (book.publicId) {
      navigate(`${base}?publicId=${book.publicId}`);
    }
  };

  const goToPage = async (newPage, overrides) => {
    if (newPage > 0 && (totalPages === 0 || newPage <= totalPages)) {
      await fetchBooks(newPage, overrides);
      setPageNumber(newPage);
      localStorage.setItem(`pageNumber:${bookType}`, String(newPage));
    }
  };

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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3 sm:mb-2">
            <h1 className="text-1xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">{libraryName ? `${libraryName} Books` : `Public ${bookType} Books`}</h1>

            {profileId && (
                <button
                    onClick={() => navigate(`/PublicProfile/${profileId}`)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md"
                >
                    Back
                </button>
              )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-4">
            <div className="inline-flex items-center gap-2 w-full sm:w-auto">
              <select value={filterField} onChange={(e)=>{ const v = e.target.value; setFilterField(v); setFilterQuery(''); }} className="px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]">
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="year">Published Year</option>
                <option value="isbn">ISBN</option>
              </select>
              <input
                type={filterField === 'year' ? 'number' : 'text'}
                placeholder={`Search with ${filterField === 'title' ? 'Title' : filterField === 'author' ? 'Author' : filterField === 'year' ? 'Published Year' : 'ISBN'}`}
                value={filterQuery}
                onChange={(e)=> setFilterQuery(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter') handleSearch(); }}
                className="flex-1 w-full sm:w-96 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
              />
            </div>
            <button onClick={handleSearch} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Search</button>
            <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Reset</button>
            <button type="button" onClick={() => setAdvOpen(true)} className="px-4 py-2 bg-[#2E6BAA] hover:bg-[#1B4B8A] text-white rounded-md inline-flex items-center gap-2">
              <FiFilter size={16} /> Advanced Search
            </button>
            <div className="inline-flex w-full sm:w-auto items-center bg-white/95 rounded-xl ring-1 ring-gray-200 overflow-hidden shadow-sm ml-auto">
              <button
                  type="button"
                  onClick={() => { 
                    setViewMode('grid');
                    localStorage.setItem('viewMode', 'grid');
                  }}
                  className={`px-3 py-2 text-sm flex items-center justify-center gap-2 w-1/2 sm:w-auto ${viewMode==='grid' ? 'bg-[#2E6BAA] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                  <FiGrid size={16} /> Grid
              </button>
              <button
                  type="button"
                  onClick={() => { 
                    setViewMode('list'); 
                    localStorage.setItem('viewMode', 'list');
                  }}
                  className={`px-3 py-2 text-sm flex items-center justify-center gap-2 w-1/2 sm:w-auto ${viewMode==='list' ? 'bg-[#2E6BAA] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                  <FiList size={16} /> List
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200 flex items-center justify-between">
              <span className="truncate">{error}</span>
              <button onClick={handleRetry} disabled={retrying} className="ml-3 px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-70">
                {retrying ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-30">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
            </div>
          ) : (
            !error && books.length === 0 ? (
              <div className="py-2 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <span className="text-2xl text-gray-400">📚</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">No books found</h2>
                <p className="text-sm text-gray-600 mb-4">Try adjusting filters.</p>
              </div>
            ) : (
              viewMode === 'grid' ? (
                <BookGridView
                  books={books}
                  pageNumber={pageNumber}
                  pageSize={pageSize || books.length}
                  selectedIds={selectedIds}
                  onToggleSelected={toggleSelected}
                  onDetail={openDetail}
                  showAdminActions={false}
                  enableSelection={false}
                />
              ) : (
                <BookListView
                  books={books}
                  pageNumber={pageNumber}
                  pageSize={pageSize || books.length}
                  selectedIds={selectedIds}
                  onToggleSelected={toggleSelected}
                  onDetail={openDetail}
                  showAdminActions={false}
                  enableSelection={false}
                />
              )
            )
          )}
        </div>

        <div className="px-4 lg:px-8 pb-6">
          <div className="mt-1 px-3 py-2 bg-white rounded-xl ring-1 ring-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {pageNumber} of {totalPages} • {totalItems} total Books
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (pageNumber > 1) { goToPage(pageNumber - 1); } }}
                disabled={pageNumber <= 1 || isLoading}
                className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => { if (pageNumber < totalPages) { goToPage(pageNumber + 1); } }}
                disabled={pageNumber >= totalPages || isLoading}
                className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {advOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAdvOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Advanced Search</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Title</label>
                <div className="mt-1 flex gap-2">
                  <input type="text" value={advTitleTerm} onChange={(e)=>setAdvTitleTerm(e.target.value)} className="flex-1 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                  <select value={advTitleMode} onChange={(e)=>setAdvTitleMode(e.target.value)} className="w-36 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]">
                    <option value="starts">Starts with</option>
                    <option value="ends">Ends with</option>
                  </select>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Author</label>
                <div className="mt-1 flex gap-2">
                  <input type="text" value={advAuthorTerm} onChange={(e)=>setAdvAuthorTerm(e.target.value)} className="flex-1 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                  <select value={advAuthorMode} onChange={(e)=>setAdvAuthorMode(e.target.value)} className="w-36 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]">
                    <option value="starts">Starts with</option>
                    <option value="ends">Ends with</option>
                  </select>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Published Year</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input type="number" placeholder="From" value={advYearFrom} onChange={(e)=>setAdvYearFrom(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                  <input type="number" placeholder="To" value={advYearTo} onChange={(e)=>setAdvYearTo(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={async () => { await goToPage(1); setAdvOpen(false); }} className="px-4 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-opacity-90">Apply</button>
              <button type="button" onClick={() => setAdvOpen(false)} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}