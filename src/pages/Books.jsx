import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { FiGrid, FiList, FiFilter, FiSearch, FiPlus } from 'react-icons/fi';
import { RiResetRightFill } from "react-icons/ri";
import { bookService } from '../services/bookService';
import { libraryService } from '../services/libraryService';
import { marcService } from '../services/marcService';
import { useAuth } from "../context/AuthProvider.jsx";
import ConfirmDialog from '../components/common/ConfirmDialog';
import FreeUsageDialog from '../components/common/FreeUsageDialog';
import BarcodePrint from '../components/barcode/BarcodePrint';
import BookGridView from '../components/BookGridView';
import BookListView from '../components/BookListView';
import BookCopies from '../components/BookCopies';

const Books = () => {
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
    const [advDateFrom, setAdvDateFrom] = useState('');
    const [advDateTo, setAdvDateTo] = useState('');

    const [exportOpen, setExportOpen] = useState(false);
    const [exportMode, setExportMode] = useState('current');
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState('');
    const [exportUrl, setExportUrl] = useState('');
    const [exportFilename, setExportFilename] = useState('');
    const [exportDownloaded, setExportDownloaded] = useState(false);

    const [barcodeOpen, setBarcodeOpen] = useState(false);
    const [barcodeMode, setBarcodeMode] = useState('current');
    const [barcodeFromId, setBarcodeFromId] = useState('');
    const [barcodeToId, setBarcodeToId] = useState('');
    const [barcodeGenerating, setBarcodeGenerating] = useState(false);
    const [barcodeError, setBarcodeError] = useState('');
    const [barcodeCodes, setBarcodeCodes] = useState([]);
    const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);

    const [marcOpen, setMarcOpen] = useState(false);
    const [marcMode, setMarcMode] = useState('current');
    const [marcExporting, setMarcExporting] = useState(false);
    const [marcError, setMarcError] = useState('');
    const [marcUrl, setMarcUrl] = useState('');
    const [marcFilename, setMarcFilename] = useState('');
    const [marcDownloaded, setMarcDownloaded] = useState(false);



    const [selectedIds, setSelectedIds] = useState(new Set());
    const toggleSelected = (id, checked) => {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (checked) next.add(id); else next.delete(id);
        return next;
      });
    };

    const [copiesOpen, setCopiesOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    const [freePromptOpen, setFreePromptOpen] = useState(false);

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
        const dFrom = (overrides?.advDateFrom ?? advDateFrom) || '';
        const dTo = (overrides?.advDateTo ?? advDateTo) || '';
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
              yTo,
              null,
              dFrom,
              dTo
            );
            if (!res?.success) {
                setError(
                  res?.message
                    ? res.message === 'Unauthorized'
                      ? 'User unauthorized! Please login again.'
                      : res.message
                    : 'Fail to load stats'
                );
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
                        place: b.Place ?? b.place ?? '',
                        subjectHeadings: b.SubjectHeadings ?? b.subjectHeadings ?? '',
                        publisher: b.Publisher ?? b.publisher ?? '',
                        publishedYear: b.PublishedYear ?? b.publishedYear ?? '',
                        cover: coverFile ? `${imageBase}libraryBookCovers/${bookType === 'English' ? 'englishBooks' : 'myanmarBooks'}/${coverFile}` : '',
                        isbn: b.ISBN ?? b.isbn ?? '',
                        controlAction: !!(b.ControlAction ?? b.controlAction ?? false),
                        date: b.RegistrationDate ?? b.registrationDate ?? '',
                        totalCopies: b.TotalCopies ?? b.totalCopies ?? 0,
                        barcodeNoList: b.barcodeNoList ?? b.barcodeNoList ?? [],
                        accessionNoList: b.accessionNoList ?? b.accessionNoList ?? [],
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
    
    useEffect(() => { setSelectedIds(new Set()); }, [bookType]);

    useEffect(() => {
      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          const active = document.activeElement;
          const tag = active?.tagName;
          const type = (active?.type || '').toLowerCase();
          const isTextEntry = tag === 'TEXTAREA' || ['text','number','search','email','url','tel','password'].includes(type);
          const isCheckControl = ['checkbox','radio'].includes(type);
          if (barcodeOpen || exportOpen || advOpen || deleteOpen) return;
          if (isTextEntry) return;
          if (isCheckControl && typeof active?.blur === 'function') { active.blur(); }
          setSelectedIds(new Set());
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [barcodeOpen, exportOpen, advOpen, deleteOpen]);

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
          advDateFrom: '',
          advDateTo: '',
        };
        setFilterField(overrides.filterField);
        setFilterQuery(overrides.filterQuery);
        setAdvTitleTerm(overrides.advTitleTerm);
        setAdvTitleMode(overrides.advTitleMode);
        setAdvAuthorTerm(overrides.advAuthorTerm);
        setAdvAuthorMode(overrides.advAuthorMode);
        setAdvYearFrom('');
        setAdvYearTo('');
        setAdvDateFrom('');
        setAdvDateTo('');
        await goToPage(1, overrides);
    };

    const openDelete = (book) => {
      setPendingDeleteId(book.bookId);
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

    const openUpdate = (book) => {
      localStorage.setItem('Books:lastDest', 'detail');
      localStorage.setItem(`pageNumber:${bookType}`, String(pageNumber));
      const base = bookType === 'English' ? '/EnglishBooks/Update' : '/MyanmarBooks/Update';
      navigate(`${base}/${book.bookId}`);
    };

    const openCopies = (book) => {
      setCopiesOpen(true);
      setSelectedBook(book);
    };

    const closeCopies = () => {
      setCopiesOpen(false);
      setSelectedBook(null);
    };

    const handleCopiesChanged = (bookId, count) => {
      const n = Number(count) || 0;
      setBooks(prev => prev.map(b => b.bookId === bookId ? { ...b, totalCopies: n } : b));
    };

    const openDetail = (book) => {
      localStorage.setItem('Books:lastDest', 'detail');
      localStorage.setItem(`pageNumber:${bookType}`, String(pageNumber));
      const base = bookType === 'English' ? '/EnglishBooks/Detail' : '/MyanmarBooks/Detail';
      const useBookId = !!book.controlAction && !!book.bookId;
      if (useBookId) {
        navigate(`${base}/${book.bookId}`);
      } else if (book.publicId) {
        navigate(`${base}?publicId=${book.publicId}`);
      }
    };

    const handleExport = async () => {
      setExporting(true);
      setExportError('');
      setExportUrl('');
      setExportFilename('');
      try {
        const mode = exportMode;
        let ids = [];
        if (mode === 'current') {
          ids = books.map(b => b.bookId).filter(Boolean);
        } else if (mode === 'selected') {
          ids = Array.from(selectedIds);
          if (ids.length === 0) { setExportError('Please select at least one book'); return; }
        }
        const res = await libraryService.exportLibraryData(
          bookType,
          ids,
          mode === 'all' ? true : false
        );
        if (res?.data) {
          let blob = res.data;
          if (!(blob instanceof Blob)) {
            const str = typeof blob === 'string' ? blob : '';
            const bytes = new Uint8Array([...str].map(c => c.charCodeAt(0)));
            blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          }
          if (exportUrl) { URL.revokeObjectURL(exportUrl); }
          const url = URL.createObjectURL(blob);
          const cd = res.headers?.['content-disposition'] || res.headers?.get?.('content-disposition') || '';
          const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);
          const name = decodeURIComponent(match?.[1] || match?.[2] || `${bookType}-Books-${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`);
          setExportUrl(url);
          setExportFilename(name);
        } else {
          setExportError(res?.message || 'Failed to export');
        }
      } catch (err) {
        setExportError(err?.message || 'Failed to export');
      } finally {
        setExporting(false);
      }
    };

    const handleMarcExport = async () => {
      if (marcExporting) return;
      setMarcError('');
      const ids = marcMode === 'current' ? books.map(b => b.bookId).filter(Boolean) : Array.from(selectedIds);
      if (!ids.length) { setMarcError('No books to export'); return; }
      try {
        setMarcExporting(true);
        const res = await marcService.exportMARC(ids, bookType);
        if (res?.data) {
          let blob = res.data;
          if (!(blob instanceof Blob)) { blob = new Blob([res.data], { type: 'text/plain' }); }
          if (marcUrl) { URL.revokeObjectURL(marcUrl); }
          const url = URL.createObjectURL(blob);
          const cd = res.headers?.['content-disposition'] || res.headers?.get?.('content-disposition') || '';
          const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);
          const name = decodeURIComponent(match?.[1] || match?.[2] || `BooksMARC_${new Date().toISOString().replace(/[:.]/g,'-')}.txt`);
          setMarcUrl(url);
          setMarcFilename(name);
        } else {
          setMarcError(
            res?.message
              ? res.message === 'Unauthorized'
                ? 'User unauthorized! Please login again.'
                : res.message
              : 'Fail to export MARC'
          );
        }
      } catch (err) {
        setMarcError(err?.message || 'Failed to export MARC');
      } finally {
        setMarcExporting(false);
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
        setTimeout(() => setActionMessage(''), 3000);
      }
    };

    const goToPage = async (newPage, overrides) => {
      if (newPage > 0 && (totalPages === 0 || newPage <= totalPages)) {
        await fetchBooks(newPage, overrides);
        setPageNumber(newPage);
        localStorage.setItem(`pageNumber:${bookType}`, String(newPage));
      }
    };

    const handleBarcodeGenerate = async () => {
      if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); return; }
      const mode = barcodeMode;
      setBarcodeError('');
      setBarcodeCodes([]);
      setBarcodeGenerating(true);
      try {
        if (mode === 'current') {
          const codes = books
            .flatMap(b => Array.isArray(b.barcodeNoList) ? b.barcodeNoList : [])
            .map(s => (s || '').trim())
            .filter(Boolean);
          if (!codes.length) { setBarcodeError('No barcodes to display.'); } else { setBarcodeCodes(codes); setBarcodePrintOpen(true); }
        } else if (mode === 'selected') {
          const ids = Array.from(selectedIds);
          const byId = new Map(books.map(b => [b.bookId ?? b.id, b]));
          const codes = ids
            .flatMap(id => Array.isArray(byId.get(id)?.barcodeNoList) ? byId.get(id).barcodeNoList : [])
            .map(s => (s || '').trim())
            .filter(Boolean);
          if (!codes.length) { setBarcodeError('No barcodes to display.'); } else { setBarcodeCodes(codes); setBarcodePrintOpen(true); }
        } 
        // else if (mode === 'custom') {
        //   if (!barcodeFromId.trim() || !barcodeToId.trim()) { setBarcodeGenerating(false); return; }
        //   const res = await libraryService.getBarCodeRange(bookType, barcodeFromId.trim(), barcodeToId.trim());
        //   if (res?.success) {
        //     const list = Array.isArray(res?.data?.result) ? res.data.result : (Array.isArray(res?.data) ? res.data : []);
        //     if (!list.length) { setBarcodeError('No barcodes found in the specified range.'); } else { setBarcodeCodes(list); setBarcodePrintOpen(true); }
        //   } else {
        //     setBarcodeError(res?.message || 'Failed to generate available barcodes');
        //   }
        // }
        setBarcodeOpen(false);
        setBarcodeMode('current');
        setBarcodeFromId('');
        setBarcodeToId('');
      } catch (err) {
        setBarcodeError(err?.message || 'Failed to generate barcodes');
      } finally {
        setBarcodeGenerating(false);
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
                          onClick={() => { if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); } else { setMarcOpen(true); } }}
                          className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md hover:bg-opacity-90 transition-colors duration-200`}
                        >
                          Export MARC
                        </button>
                        <button
                          onClick={() => { if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); } else { setBarcodeOpen(true); } }}
                          className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md hover:bg-opacity-90 transition-colors duration-200`}
                        >
                          Generate Barcodes
                        </button>
                        <button
                          onClick={() => { if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); } else { setExportOpen(true); } }}
                          className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md hover:bg-opacity-90 transition-colors duration-200`}
                        >
                          Export Excel
                        </button>
                        <button
                          onClick={() => navigate(bookType === 'English' ? '/EnglishBooks/New' : '/MyanmarBooks/New')}
                          className="px-4 py-2 bg-[#2E6BAA] hover:bg-[#1B4B8A] text-white rounded-md hover:bg-opacity-90 transition-colors duration-200 inline-flex items-center gap-2"
                      >
                          <FiPlus size={15} /> Add New Book
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
                            <option value="barcodeNo">Barcode No</option>
                            <option value="accessionNo">Accession No</option>
                            <option value="date">Date</option>
                          </select>
                          {filterField === 'date' ? 
                          (
                            <input
                              type="date"
                              value={filterQuery}
                              onChange={(e)=> setFilterQuery(e.target.value)}
                              onKeyDown={(e)=>{ if(e.key==='Enter') handleSearch(); }}
                              className="flex-1 w-full sm:w-96 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            />
                          ) : 
                          (
                            <input
                              type={filterField === 'year' ? 'number' : 'text'}
                              placeholder={`Search with ${filterField === 'title' ? 'Title' : filterField === 'author' ? 'Author' : filterField === 'year' ? 'Published Year' : filterField === 'isbn' ? 'ISBN' : filterField === 'barcodeNo' ? 'Barcode No' : filterField === 'accessionNo' ? 'Accession No' : 'Keyword'}`}
                              value={filterQuery}
                              onChange={(e)=> setFilterQuery(e.target.value)}
                              onKeyDown={(e)=>{ if(e.key==='Enter') handleSearch(); }}
                              className="flex-1 w-full sm:w-96 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            />
                          )}
                        </div>
                        <button onClick={handleSearch} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 inline-flex items-center gap-2">
                          <FiSearch size={15} /> Search
                        </button>
                        <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center gap-2">
                          <RiResetRightFill size={15} /> Reset
                        </button>
                        <button type="button" onClick={() => { if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); } else { setAdvOpen(true); } }} className="px-4 py-2 bg-[#2E6BAA] hover:bg-[#1B4B8A] text-white rounded-md inline-flex items-center gap-2">
                          <FiFilter size={15} /> Advanced Search
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
                                <FiGrid size={15} /> Grid
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
                          <p className="text-sm text-gray-600 mb-4">Try adding a new book to your {bookType} catalog.</p>
                          <button onClick={() => navigate(bookType === 'English' ? '/EnglishBooks/New' : '/MyanmarBooks/New')} className="px-4 py-2 bg-[#2E6BAA] text-white rounded-md hover:bg-opacity-90">Add New Book</button>
                      </div>
                    ) : (
                      viewMode === 'grid' ? (
                        <BookGridView
                          books={books}
                          pageNumber={pageNumber}
                          pageSize={pageSize || books.length}
                          selectedIds={selectedIds}
                          onToggleSelected={toggleSelected}
                          onUpdate={openUpdate}
                          onDetail={openDetail}
                          onDelete={openDelete}
                          openCopies={openCopies}
                          showAdminActions={true}
                          enableSelection={true}
                        />
                      ) : (
                        <BookListView
                          books={books}
                          pageNumber={pageNumber}
                          pageSize={pageSize || books.length}
                          selectedIds={selectedIds}
                          onToggleSelected={toggleSelected}
                          onUpdate={openUpdate}
                          onDetail={openDetail}
                          onDelete={openDelete}
                          openCopies={openCopies}
                          showAdminActions={true}
                          enableSelection={true}
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
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Date</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input type="date" placeholder="From" value={advDateFrom} onChange={(e)=>setAdvDateFrom(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                  <input type="date" placeholder="To" value={advDateTo} onChange={(e)=>setAdvDateTo(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
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
      
      {marcOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (marcUrl) { URL.revokeObjectURL(marcUrl); } setMarcUrl(''); setMarcFilename(''); setMarcError(''); setMarcDownloaded(false); setMarcOpen(false); }}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Export MARC</h2>
            {marcError && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{marcError}</div>
            )}
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="radio" id="marc-current" name="marcMode" value="current" checked={marcMode==='current'} onChange={() => setMarcMode('current')} />
                <span htmlFor="marc-current" className="text-sm text-gray-800">Export current page</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" id="marc-selected" name="marcMode" value="selected" checked={marcMode==='selected'} onChange={() => setMarcMode('selected')} />
                <span htmlFor="marc-selected" className="text-sm text-gray-800">Export selected books</span>
              </label>
            </div>

            {marcUrl && (
              <div className="mt-3 rounded-xl px-4 py-3 bg-green-50 ring-1 ring-green-200">
                  <div className="text-sm text-green-800 mb-2">File ready: {marcFilename}</div>
                  <a
                    href={marcUrl}
                    download={marcFilename || 'BooksMARC.txt'} 
                    onClick={() => { setMarcDownloaded(true); setTimeout(() => setMarcDownloaded(false), 2000); }}
                    className="inline-block px-3 py-1 text-sm rounded-md bg-[#2E6BAA] text-white hover:bg-opacity-90"
                  >{marcDownloaded ? 'Downloaded' : 'Download'}</a>
                </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={handleMarcExport} disabled={marcExporting || (marcMode==='selected' && selectedIds.size===0)} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">{marcExporting ? 'Exporting...' : 'Export'}</button>
              <button type="button" onClick={() => { if (marcUrl) { URL.revokeObjectURL(marcUrl); } setMarcUrl(''); setMarcFilename(''); setMarcError(''); setMarcOpen(false); }} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
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
                <input type="radio" id="exp-selected" name="exp-mode" value="selected" checked={exportMode==='selected'} onChange={(e)=>setExportMode(e.target.value)} />
                <label htmlFor="exp-selected" className="text-sm text-gray-800">Export selected books{selectedIds.size > 0 ? ` (${selectedIds.size} selected)` : ''}</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" id="exp-all" name="exp-mode" value="all" checked={exportMode==='all'} onChange={(e)=>setExportMode(e.target.value)} />
                <label htmlFor="exp-all" className="text-sm text-gray-800">Export all</label>
              </div>
            </div>

            {exportUrl && (
              <div className="mt-3 rounded-xl px-4 py-3 bg-green-50 ring-1 ring-green-200">
                <div className="text-sm text-green-800 mb-2">File ready: {exportFilename}</div>
                <a
                  href={exportUrl}
                  download={exportFilename || 'BooksExcel.xlsx'} 
                  onClick={() => { setExportDownloaded(true); setTimeout(() => setExportDownloaded(false), 2000); }}
                  className="inline-block px-3 py-1 text-sm rounded-md bg-[#2E6BAA] text-white hover:bg-opacity-90"
                >{exportDownloaded ? 'Downloaded' : 'Download'}</a>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={handleExport} disabled={exporting || (exportMode==='selected' && selectedIds.size===0)} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
                {exporting ? 'Exporting...' : 'Export'}
              </button>
              <button type="button" onClick={() => { if (exportUrl) { URL.revokeObjectURL(exportUrl); } setExportUrl(''); setExportFilename(''); setExportError(''); setExportDownloaded(false); setExportOpen(false); }} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}


      
      {barcodeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setBarcodeOpen(false); setBarcodeMode('current'); setBarcodeFromId(''); setBarcodeToId(''); }}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Generate Barcodes</h2>
            {barcodeError && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{barcodeError}</div>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="radio" id="bc-current" name="bc-mode" value="current" checked={barcodeMode==='current'} onChange={(e)=>setBarcodeMode(e.target.value)} />
                <label htmlFor="bc-current" className="text-sm text-gray-800">Generate current page</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" id="bc-selected" name="bc-mode" value="selected" checked={barcodeMode==='selected'} onChange={(e)=>setBarcodeMode(e.target.value)} />
                <label htmlFor="bc-selected" className="text-sm text-gray-800">Generate selected books{selectedIds.size > 0 ? ` (${selectedIds.size} selected)` : ''}</label>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <input type="radio" id="bc-custom" name="bc-mode" value="custom" checked={barcodeMode==='custom'} onChange={(e)=>setBarcodeMode(e.target.value)} />
                  <label htmlFor="bc-custom" className="text-sm text-gray-800">Generate custom (BarCode ID range)</label>
                </div>
                {barcodeMode==='custom' && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder="From BarCode ID" value={barcodeFromId} onChange={(e)=>setBarcodeFromId(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                    <input type="text" placeholder="To BarCode ID" value={barcodeToId} onChange={(e)=>setBarcodeToId(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={handleBarcodeGenerate} disabled={barcodeGenerating || (barcodeMode==='selected' && selectedIds.size===0) || (barcodeMode==='custom' && (!barcodeFromId.trim() || !barcodeToId.trim()))} className="px-4 py-2 rounded-md bg-green-600 text-white disabled:opacity-60">{barcodeGenerating ? 'Generating...' : 'Generate'}</button>
              <button type="button" onClick={() => { setBarcodeOpen(false); setBarcodeMode('current'); setBarcodeFromId(''); setBarcodeToId(''); }} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {barcodePrintOpen && (
        <>
          <style>{`@media print { .barcode-modal { position: static !important; inset: auto !important; display: block !important; } .barcode-modal .overlay { display: none !important; } .barcode-modal .modal-content { position: static !important; width: auto !important; max-width: none !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important; } }`}</style>
          <div className="barcode-modal fixed inset-0 z-50 flex items-center justify-center">
          <div className="overlay absolute inset-0 bg-black/40" onClick={() => setBarcodePrintOpen(false)}></div>
          <div className="modal-content relative bg-white rounded-2xl shadow-xl w-full max-w-5xl p-4 ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">BarCodes Preview</h2>
              <button type="button" onClick={() => setBarcodePrintOpen(false)} className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Close</button>
            </div>
            <div className="print-grid">
              <BarcodePrint codes={barcodeCodes} />
            </div>
          </div>
        </div>
        </>
      )}
      


      {copiesOpen && (
        <BookCopies
          open={copiesOpen}
          book={selectedBook}
          showAdminActions={true}
          onClose={closeCopies}
          onCopiesChanged={handleCopiesChanged}
        />
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

      <FreeUsageDialog
        open={freePromptOpen}
        onClose={() => setFreePromptOpen(false)}
        onVerify={() => { setFreePromptOpen(false); navigate('/LibraryVerify'); }}
        libraryName={user?.libraryName || ''}
        userType={user?.libraryAccess || 'Free'}
        title="Limited Access"
      />
    </div>
  );
};

export default Books;