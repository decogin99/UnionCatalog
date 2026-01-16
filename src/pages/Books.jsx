import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { FiGrid, FiList, FiFilter } from 'react-icons/fi';
import { bookService } from '../services/bookService';
import { libraryService } from '../services/libraryService';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Books = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [error, setError] = useState('');
    const [retrying, setRetrying] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [filterField, setFilterField] = useState('title');
    const [filterQuery, setFilterQuery] = useState('');

    const [actionMessage, setActionMessage] = useState('');
    const [actionSuccess, setActionSuccess] = useState(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState('');
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    const [advOpen, setAdvOpen] = useState(false);
    const [advTitleTerm, setAdvTitleTerm] = useState('');
    const [advTitleMode, setAdvTitleMode] = useState('starts');
    const [advAuthorTerm, setAdvAuthorTerm] = useState('');
    const [advAuthorMode, setAdvAuthorMode] = useState('starts');
    const [advYearFrom, setAdvYearFrom] = useState('');
    const [advYearTo, setAdvYearTo] = useState('');

    const [exportOpen, setExportOpen] = useState(false);
    const [exportMode, setExportMode] = useState('current');
    const [exportFromId, setExportFromId] = useState('');
    const [exportToId, setExportToId] = useState('');
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState('');
    const [exportUrl, setExportUrl] = useState('');
    const [exportFilename, setExportFilename] = useState('');
    const [exportDownloaded, setExportDownloaded] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Determine book type from URL parameters
    const bookType = location.pathname.includes('English') ? 'English' : 'Myanmar';
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
        setAdvOpen(false)
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
              yTo
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
                        id: b.BookId ?? b.bookId ?? b.Id ?? b.id,
                        title: b.Title ?? b.title ?? '',
                        author: b.Author ?? b.author ?? '',
                        publisher: b.Publisher ?? b.publisher ?? '',
                        publishedYear: b.PublishedYear ?? b.publishedYear ?? '',
                        edition: b.Edition ?? b.edition ?? '',
                        cover: coverFile ? `${imageBase}libraryBookCovers/${bookType === 'English' ? 'englishBooks' : 'myanmarBooks'}/${coverFile}` : '',
                        isbn: b.ISBN ?? b.isbn ?? '',
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

    const initTypeRef = useRef(null);
    useEffect(() => {
        if (initTypeRef.current === bookType) return;
        initTypeRef.current = bookType;
        document.title = `${bookType} Books`;
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
    }, [bookType]);
    
    useEffect(() => {}, [bookType]);

    useEffect(() => {
      setViewMode(localStorage.getItem('viewMode'))
    }, [viewMode])

    const handleRetry = async () => {
        setRetrying(true);
        try {
            await fetchBooks(pageNumber);
        } finally {
            setRetrying(false);
        }
    };

    const handleSearch = async () => {
        await goToPage(1);
    };

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

    const openDelete = (book) => {
      setPendingDeleteId(book.id);
      setDeleteMessage(
        <span className="text-sm text-gray-800">Are you sure you want to delete <strong className="font-semibold">{book.title}</strong>?</span>
      );
      setDeleteOpen(true);
    };

    const closeDelete = () => {
      setDeleteOpen(false);
      setPendingDeleteId(null);
      setDeleteMessage('');
    };

    const handleExport = async () => {
      setExporting(true);
      setExportError('');
      setExportUrl('');
      setExportFilename('');
      try {
        const mode = exportMode;
        if (mode === 'custom' && (!exportFromId.trim() || !exportToId.trim())) {
          setExportError('Please enter both From and To BarCode IDs');
          return;
        }
        const params = {
          bookType,
          currentPage: mode === 'current' ? pageNumber : undefined,
          all: mode === 'all' ? true : undefined,
          fromBarCodeId: mode === 'custom' ? exportFromId.trim() : undefined,
          toBarCodeId: mode === 'custom' ? exportToId.trim() : undefined,
        };
        const res = await libraryService.exportLibraryData(
          params.bookType,
          params.currentPage,
          params.all,
          params.fromBarCodeId,
          params.toBarCodeId
        );
        if (res?.success && res?.data) {
          let blob = res.data;
          if (!(blob instanceof Blob)) {
            const str = typeof blob === 'string' ? blob : '';
            const bytes = new Uint8Array([...str].map(c => c.charCodeAt(0)));
            blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          }
          if (exportUrl) { URL.revokeObjectURL(exportUrl); }
          const url = URL.createObjectURL(blob);
          const stamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `${bookType}-Books-${mode}-${stamp}.xlsx`;
          setExportUrl(url);
          setExportFilename(filename);
        } else {
          if(res?.message == "Not Found"){
            setExportError('No book to export');
          }
          else{
            setExportError(res?.message || 'Failed to export');
          }
        }
      } catch (err) {
        setExportError(err?.message || 'Failed to export');
      } finally {
        setExporting(false);
      }
    };

    const confirmDelete = async () => {
      if (!pendingDeleteId || deleteSubmitting) return;
      setDeleteSubmitting(true);
      setActionMessage('');
      try {
        const res = await bookService.deleteBook(pendingDeleteId, bookType);
        if (res?.success) {
          setActionSuccess(true);
          setActionMessage(res?.message || 'Book deleted');
          await fetchBooks(pageNumber);
        } else {
          setActionSuccess(false);
          setActionMessage(res?.message || 'Failed to delete');
        }
      } catch (err) {
        setActionSuccess(false);
        setActionMessage(err?.message || 'Failed to delete');
      } finally {
        setDeleteSubmitting(false);
        closeDelete();
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
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
                <div className="p-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3 sm:mb-2">
                        <h1 className="text-1xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">{bookType} Books</h1>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                          <button
                            onClick={() => setExportOpen(true)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md hover:bg-opacity-90 transition-colors duration-200"
                          >
                            Export Excel
                          </button>
                          <button
                            onClick={() => navigate(bookType === 'English' ? '/EnglishBooks/New' : '/MyanmarBooks/New')}
                            className="px-4 py-2 bg-[#2E6BAA] text-white rounded-md hover:bg-opacity-90 transition-colors duration-200"
                        >
                            Add New Book
                        </button>
                        </div>
                    </div>

                    {/* Filter Section */}
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
                          <button type="button" onClick={() => setAdvOpen(true)} className="px-4 py-2 bg-[#2E6BAA] text-white rounded-md inline-flex items-center gap-2">
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
                    {/* Filter Section */}

                    {error && (
                      <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200 flex items-center justify-between">
                        <span className="truncate">{error}</span>
                        <button onClick={handleRetry} disabled={retrying} className="ml-3 px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-70 flex items-center gap-2">
                          {retrying && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                            </svg>
                          )}
                          <span>Retry</span>
                        </button>
                      </div>
                    )}

                    {actionMessage && (
                      <div className={`mb-3 rounded-xl px-4 py-3 text-sm ${actionSuccess ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>
                        {actionMessage}
                      </div>
                    )}

                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
                        </div>
                    ) : (
                      !error && books.length === 0 ? (
                        <div className="py-2 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <span className="text-2xl text-gray-400">📚</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-1">No books found</h2>
                            <p className="text-sm text-gray-600 mb-4">Try adding a new book to your {bookType} catalog.</p>
                            <button onClick={() => navigate(bookType === 'English' ? '/EnglishBooks/New' : '/MyanmarBooks/New')} className="px-4 py-2 bg-[#2E6BAA] text-white rounded-md hover:bg-opacity-90">Add New Book</button>
                        </div>
                      ) : (
                        viewMode === 'grid' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                                {books.map((book) => (
                                    <div key={book.id} className="bg-white/95 rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col ring-1 ring-gray-100">
                                        <div className="relative pt-[100%] w-full max-w-[200px] mx-auto overflow-hidden">
                                            <img
                                                src={book.cover}
                                                alt={book.title}
                                                loading='lazy'
                                                className="absolute inset-0 w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
                                            </div>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <p><span className="font-medium">Author:</span> {book.author}</p>
                                                <p><span className="font-medium">ISBN:</span> {book.isbn}</p>
                                                <p><span className="font-medium">Edition:</span> {book.edition}</p>
                                                <p><span className="font-medium">Publisher:</span> {book.publisher}</p>
                                                <p><span className="font-medium">Published Year:</span> {book.publishedYear}</p>
                                            </div>
                                            <div className="pt-5 mt-auto">
                                              {book.controlAction ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                  <button onClick={() => navigate(bookType === 'English' ? `/EnglishBooks/Update/${book.id}` : `/MyanmarBooks/Update/${book.id}`)} className="px-3 py-2 text-sm rounded-md w-full border border-[#2E6BAA] text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white transition-colors duration-200">Update</button>
                                                  <button onClick={() => openDelete(book)} className="px-3 py-2 text-sm rounded-md w-full border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200">Delete</button>
                                                </div>
                                              ) : (
                                                <div className="text-sm text-gray-500 text-right">No actions</div>
                                              )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                          <div className="bg-white/95 shadow-md ring-1 ring-gray-100">
                                <div className="overflow-x-auto">
                                    <table className="min-w-[900px] w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cover</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Author</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Edition</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Publisher</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Published Year</th>
                                                <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {books.map((book) => (
                                                <tr key={book.id} className="hover:bg-gray-100 transition-colors duration-200">
                                                    <td className="px-4 py-3">
                                                        <img src={book.cover} alt={book.title} className="w-10 h-14 object-cover rounded-md" />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-gray-900">{book.title}</div>
                                                        <div className="text-xs text-gray-500">ISBN: {book.isbn}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700">{book.author}</td>
                                                    <td className="px-4 py-3 text-gray-700">{book.publisher}</td>
                                                    <td className="px-4 py-3 text-gray-700">{book.edition}</td>
                                                    <td className="px-4 py-3 text-gray-700">{book.publishedYear}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                          {book.controlAction ? (
                                                            <>
                                                              <button onClick={() => navigate(bookType === 'English' ? `/EnglishBooks/Update/${book.id}` : `/MyanmarBooks/Update/${book.id}`)} className="px-3 py-1 text-sm text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white rounded-md border border-[#2E6BAA]">Update</button>
                                                              <button onClick={() => openDelete(book)} className="px-3 py-1 text-sm text-red-600 hover:bg-red-600 hover:text-white rounded-md border border-red-600">Delete</button>
                                                            </>
                                                          ) : (
                                                            <span className="text-sm text-gray-500">No actions</span>
                                                          )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
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
              {/* <button type="button" onClick={() => { setAdvTitleTerm(''); setAdvTitleMode('starts'); setAdvAuthorTerm(''); setAdvAuthorMode('starts'); setAdvYearFrom(''); setAdvYearTo(''); }} className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200">Reset</button> */}
              <button type="button" onClick={async () => { await goToPage(1); setAdvOpen(false); }} className="px-4 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-opacity-90">Apply</button>
              <button type="button" onClick={() => setAdvOpen(false)} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {exportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (exportUrl) { URL.revokeObjectURL(exportUrl); } setExportUrl(''); setExportFilename(''); setExportError(''); setExportDownloaded(false); setExportOpen(false); }}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Export Books</h2>
            {exportError && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{exportError}</div>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="radio" id="exp-current" name="exp-mode" value="current" checked={exportMode==='current'} onChange={(e)=>setExportMode(e.target.value)} />
                <label htmlFor="exp-current" className="text-sm text-gray-800">Export current page</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" id="exp-all" name="exp-mode" value="all" checked={exportMode==='all'} onChange={(e)=>setExportMode(e.target.value)} />
                <label htmlFor="exp-all" className="text-sm text-gray-800">Export all</label>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <input type="radio" id="exp-custom" name="exp-mode" value="custom" checked={exportMode==='custom'} onChange={(e)=>setExportMode(e.target.value)} />
                  <label htmlFor="exp-custom" className="text-sm text-gray-800">Export custom (BarCode ID range)</label>
                </div>
                {exportMode==='custom' && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder="From BarCode ID" value={exportFromId} onChange={(e)=>setExportFromId(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                    <input type="text" placeholder="To BarCode ID" value={exportToId} onChange={(e)=>setExportToId(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                  </div>
                )}
              </div>
            </div>
            {exportUrl && (
              <div className="mt-3 rounded-xl px-4 py-3 bg-green-50 ring-1 ring-green-200">
                <div className="text-sm text-green-800 mb-2">File ready: {exportFilename}</div>
                <a
                  href={exportUrl}
                  download={exportFilename}
                  onClick={() => { setExportDownloaded(true); setTimeout(() => setExportDownloaded(false), 2000); }}
                  className="inline-block px-4 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-opacity-90"
                >{exportDownloaded ? 'Downloaded' : 'Download'}</a>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={handleExport} disabled={exporting || (exportMode==='custom' && (!exportFromId.trim() || !exportToId.trim()))} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
                {exporting ? 'Exporting...' : 'Export'}
              </button>
              <button type="button" onClick={() => { if (exportUrl) { URL.revokeObjectURL(exportUrl); } setExportUrl(''); setExportFilename(''); setExportError(''); setExportDownloaded(false); setExportOpen(false); }} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Book"
        message={deleteMessage}
        confirmText={deleteSubmitting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
        onCancel={closeDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Books;