import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { FiGrid, FiList, FiFilter, FiSearch, FiPlus } from 'react-icons/fi';
import { RiResetRightFill } from "react-icons/ri";
import { bookService } from '../services/bookService';
import { libraryService } from '../services/libraryService';
import { marcService } from '../services/marcService';
import { useAuth, useLanguage } from "../context/AuthProvider.jsx";
import ConfirmDialog from '../components/common/ConfirmDialog';
import FreeUsageDialog from '../components/common/FreeUsageDialog';
import BarcodePrint from '../components/barcode/BarcodePrint';
import BookGridView from '../components/BookGridView';
import BookListView from '../components/BookListView';
import BookCopies from '../components/BookCopies';

const Books = () => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const { bookCategory } = useParams();
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

    const navigate = useNavigate();

    const [freePromptOpen, setFreePromptOpen] = useState(false);

    // Determine book type from URL parameters
    // const bookType = location.pathname.startsWith('/EnglishBooks')
    // ? 'English'
    // : 'Myanmar';
    const bookType = bookCategory === 'EnglishBooks' ? 'English' : 'Myanmar';

    const imageBase = import.meta.env.VITE_IMAGE_BASE_URL || '';

    const t = language === 'mm' ? {
      english: 'အင်္ဂလိပ်', myanmar: 'မြန်မာ',  books: 'စာအုပ်များ', exportMARC: 'MARC ထုတ်မည်', generateBarcodes: 'ဘားကုဒ်ထုတ်မည်', exportExcel: 'Excel ထုတ်မည်', addNewBook: 'စာအုပ်အသစ်ထည့်မည်',
      title: 'ခေါင်းစဉ်', author: 'စာရေးသူ', publishedYear: 'ထုတ်ဝေသည့်နှစ်', isbn: 'ISBN', barcodeNo: 'ဘားကုဒ်နံပါတ်', accessionNo: 'Accession နံပါတ်', date: 'ရက်စွဲ',
      search: 'ရှာမည်', reset: 'ပြန်စမည်', advancedSearch: 'အဆင့်မြင့်ရှာဖွေမှု', grid: 'Grid', list: 'List', retry: 'ထပ်စမ်းမည်',
      noBooksFound: 'စာအုပ်မတွေ့ပါ', noBooksHint: 'သင်၏ catalog ထဲသို့ စာအုပ်အသစ် ထည့်ကြည့်ပါ။',
      page: 'စာမျက်နှာ', of: 'မှ', totalBooks: 'စုစုပေါင်း စာအုပ်', prev: 'ယခင်', next: 'နောက်',
      startsWith: 'အစမှ', endsWith: 'အဆုံးမှ', from: 'မှ', to: 'သို့', apply: 'ရှာမည်', cancel: 'ပယ်ဖျက်မည်',
      deleteBook: 'စာအုပ်ဖျက်ရန်', deleting: 'ဖျက်နေသည်...', delete: 'ဖျက်မည်', limitedAccess: 'အသုံးပြုခွင့် ကန့်သတ်ထားသည်',
      exportBooks: 'စာအုပ်များထုတ်မည်', exportCurrentPage: 'လက်ရှိစာမျက်နှာ ထုတ်မည်', exportSelectedBooks: 'ရွေးထားသော စာအုပ်များ ထုတ်မည်', exportAll: 'အားလုံးထုတ်မည်',
      fileReady: 'ဖိုင်အဆင်သင့်', downloaded: 'သိမ်းဆည်းပြီး', download: 'သိမ်းမည်', exporting: 'ထုတ်နေသည်...', export: 'ထုတ်မည်', selected: 'ရွေးထားသည်',
      generateCurrentPage: 'လက်ရှိစာမျက်နှာ ထုတ်မည်', generateSelectedBooks: 'ရွေးထားသော စာအုပ်များ ထုတ်မည်', generateCustom: 'အလိုအလျောက် (ဘားကုဒ် နံပါတ် မှ - အထိ)', fromBarcodeId: 'ဘားကုဒ် နံပါတ် မှ', toBarcodeId: 'ဘားကုဒ် နံပါတ် အထိ', generating: 'ထုတ်နေသည်...', generate: 'ထုတ်မည်',
      barcodePreview: 'ဘားကုဒ် အစမ်းစာရင်း', close: 'ပိတ်မည်',
      bookCopies: { title: 'မိတ္တူများ', fallbackBook: 'စာအုပ်', close: 'ပိတ်မည်', accessionNo: 'Accession နံပါတ်', barcodeNo: 'ဘားကုဒ်နံပါတ်', callNo: 'Call နံပါတ်', actions: 'လုပ်ဆောင်ချက်များ', noCopiesFound: 'မိတ္တူမတွေ့ပါ', save: 'သိမ်းမည်', saving: 'သိမ်းနေသည်...', edit: 'ပြင်မည်', delete: 'ဖျက်မည်', cancel: 'ပယ်ဖျက်မည်', adding: 'ထည့်နေသည်...', addCopy: 'မိတ္တူထည့်မည်' }
    } : {
      books: 'Books', exportMARC: 'Export MARC', generateBarcodes: 'Generate Barcodes', exportExcel: 'Export Excel', addNewBook: 'Add New Book',
      title: 'Title', author: 'Author', publishedYear: 'Published Year', isbn: 'ISBN', barcodeNo: 'Barcode No', accessionNo: 'Accession No', date: 'Date',
      search: 'Search', reset: 'Reset', advancedSearch: 'Advanced Search', grid: 'Grid', list: 'List', retry: 'Retry',
      noBooksFound: 'No books found', noBooksHint: `Try adding a new book to your ${bookType} catalog.`,
      page: 'Page', of: 'of', totalBooks: 'total Books', prev: 'Prev', next: 'Next',
      startsWith: 'Starts with', endsWith: 'Ends with', from: 'From', to: 'To', apply: 'Apply', cancel: 'Cancel',
      deleteBook: 'Delete Book', deleting: 'Deleting...', delete: 'Delete', limitedAccess: 'Limited Access',
      exportBooks: 'Export Books', exportCurrentPage: 'Export current page', exportSelectedBooks: 'Export selected books', exportAll: 'Export all',
      fileReady: 'File ready', downloaded: 'Downloaded', download: 'Download', exporting: 'Exporting...', export: 'Export', selected: 'selected',
      generateCurrentPage: 'Generate current page', generateSelectedBooks: 'Generate selected books', generateCustom: 'Generate custom (BarCode ID range)', fromBarcodeId: 'From BarCode ID', toBarcodeId: 'To BarCode ID', generating: 'Generating...', generate: 'Generate',
      barcodePreview: 'BarCodes Preview', close: 'Close',
      bookCopies: { title: 'Copies', fallbackBook: 'Book', close: 'Close', accessionNo: 'Accession No', barcodeNo: 'Barcode No', callNo: 'Call No', actions: 'Actions', noCopiesFound: 'No copies found', save: 'Save', saving: 'Saving...', edit: 'Edit', delete: 'Delete', cancel: 'Cancel', adding: 'Adding...', addCopy: 'Add Copy' }
    };

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
        document.title = `${bookType} ${t.books}`;
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
    }, [bookType, t.books]);
    
    

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

      navigate(`/${bookCategory}/Update/${book.bookId}`);
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
      const useBookId = !!book.controlAction && !!book.bookId;
      if (useBookId) {
        navigate(`/${bookCategory}/Detail/${book.bookId}`);
      } else if (book.publicId) {
        navigate(`/${bookCategory}/Detail?publicId=${book.publicId}`);
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
                      <h1 className="text-1xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">{bookType === 'English' ? t.english : t.myanmar} {t.books}</h1>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                        <button
                          onClick={() => { if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); } else { setMarcOpen(true); } }}
                          className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md hover:bg-opacity-90 transition-colors duration-200`}
                        >
                          {t.exportMARC}
                        </button>
                        <button
                          onClick={() => { if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); } else { setBarcodeOpen(true); } }}
                          className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md hover:bg-opacity-90 transition-colors duration-200`}
                        >
                          {t.generateBarcodes}
                        </button>
                        <button
                          onClick={() => { if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); } else { setExportOpen(true); } }}
                          className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md hover:bg-opacity-90 transition-colors duration-200`}
                        >
                          {t.exportExcel}
                        </button>
                        <button
                          onClick={() => navigate(`/${bookCategory}/New`)}
                          className="px-4 py-2 bg-[#2E6BAA] hover:bg-[#1B4B8A] text-white rounded-md hover:bg-opacity-90 transition-colors duration-200 inline-flex items-center gap-2"
                        >
                            <FiPlus size={15} /> {t.addNewBook}
                        </button>
                      </div>
                  </div>

                  {/* Filter Section */}
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-4">
                        <div className="inline-flex items-center gap-2 w-full sm:w-auto">
                          <select value={filterField} onChange={(e)=>{ const v = e.target.value; setFilterField(v); setFilterQuery(''); }} className="px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]">
                            <option value="title">{t.title}</option>
                            <option value="author">{t.author}</option>
                            <option value="year">{t.publishedYear}</option>
                            <option value="isbn">{t.isbn}</option>
                            <option value="barcodeNo">{t.barcodeNo}</option>
                            <option value="accessionNo">{t.accessionNo}</option>
                            <option value="date">{t.date}</option>
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
                              placeholder={language === 'mm'
                                ? `${filterField === 'title' ? t.title : filterField === 'author' ? t.author : filterField === 'year' ? t.publishedYear : filterField === 'isbn' ? t.isbn : filterField === 'barcodeNo' ? t.barcodeNo : filterField === 'accessionNo' ? t.accessionNo : 'သော့ချက်စကားလုံး'} ဖြင့်ရှာမည်`
                                : `Search with ${filterField === 'title' ? t.title : filterField === 'author' ? t.author : filterField === 'year' ? t.publishedYear : filterField === 'isbn' ? t.isbn : filterField === 'barcodeNo' ? t.barcodeNo : filterField === 'accessionNo' ? t.accessionNo : 'Keyword'}`}
                              value={filterQuery}
                              onChange={(e)=> setFilterQuery(e.target.value)}
                              onKeyDown={(e)=>{ if(e.key==='Enter') handleSearch(); }}
                              className="flex-1 w-full sm:w-96 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            />
                          )}
                        </div>
                        <button onClick={handleSearch} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 inline-flex items-center gap-2">
                          <FiSearch size={15} /> {t.search}
                        </button>
                        <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center gap-2">
                          <RiResetRightFill size={15} /> {t.reset}
                        </button>
                        <button type="button" onClick={() => { if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); } else { setAdvOpen(true); } }} className="px-4 py-2 bg-[#2E6BAA] hover:bg-[#1B4B8A] text-white rounded-md inline-flex items-center gap-2">
                          <FiFilter size={15} /> {t.advancedSearch}
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
                                <FiGrid size={15} /> {t.grid}
                            </button>
                            <button
                                type="button"
                                onClick={() => { 
                                  setViewMode('list'); 
                                  localStorage.setItem('viewMode', 'list');
                                }}
                                className={`px-3 py-2 text-sm flex items-center justify-center gap-2 w-1/2 sm:w-auto ${viewMode==='list' ? 'bg-[#2E6BAA] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <FiList size={16} /> {t.list}
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
                        <span>{t.retry}</span>
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
                          <h2 className="text-lg font-semibold text-gray-900 mb-1">{t.noBooksFound}</h2>
                          <p className="text-sm text-gray-600 mb-4">{t.noBooksHint}</p>
                          <button onClick={() => navigate(`/${bookCategory}/New`)} className="px-4 py-2 bg-[#2E6BAA] text-white rounded-md hover:bg-opacity-90">{t.addNewBook}</button>
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
                    {t.page} {pageNumber} {t.of} {totalPages} • {totalItems} {t.totalBooks}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { if (pageNumber > 1) { goToPage(pageNumber - 1); } }}
                      disabled={pageNumber <= 1 || isLoading}
                      className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    >
                      {t.prev}
                    </button>
                    <button
                      onClick={() => { if (pageNumber < totalPages) { goToPage(pageNumber + 1); } }}
                      disabled={pageNumber >= totalPages || isLoading}
                      className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    >
                      {t.next}
                    </button>
                  </div>
                </div>
              </div>
      </div>

      {advOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAdvOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t.advancedSearch}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">{t.title}</label>
                <div className="mt-1 flex gap-2">
                  <input type="text" value={advTitleTerm} onChange={(e)=>setAdvTitleTerm(e.target.value)} className="flex-1 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                  <select value={advTitleMode} onChange={(e)=>setAdvTitleMode(e.target.value)} className="w-36 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]">
                    <option value="starts">{t.startsWith}</option>
                    <option value="ends">{t.endsWith}</option>
                  </select>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">{t.author}</label>
                <div className="mt-1 flex gap-2">
                  <input type="text" value={advAuthorTerm} onChange={(e)=>setAdvAuthorTerm(e.target.value)} className="flex-1 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                  <select value={advAuthorMode} onChange={(e)=>setAdvAuthorMode(e.target.value)} className="w-36 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]">
                    <option value="starts">{t.startsWith}</option>
                    <option value="ends">{t.endsWith}</option>
                  </select>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">{t.publishedYear}</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input type="number" placeholder={t.from} value={advYearFrom} onChange={(e)=>setAdvYearFrom(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                  <input type="number" placeholder={t.to} value={advYearTo} onChange={(e)=>setAdvYearTo(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">{t.date}</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input type="date" placeholder={t.from} value={advDateFrom} onChange={(e)=>setAdvDateFrom(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                  <input type="date" placeholder={t.to} value={advDateTo} onChange={(e)=>setAdvDateTo(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              {/* <button type="button" onClick={() => { setAdvTitleTerm(''); setAdvTitleMode('starts'); setAdvAuthorTerm(''); setAdvAuthorMode('starts'); setAdvYearFrom(''); setAdvYearTo(''); }} className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200">Reset</button> */}
              <button type="button" onClick={async () => { await goToPage(1); setAdvOpen(false); }} className="px-4 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-opacity-90">{t.apply}</button>
              <button type="button" onClick={() => setAdvOpen(false)} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
      
      {marcOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (marcUrl) { URL.revokeObjectURL(marcUrl); } setMarcUrl(''); setMarcFilename(''); setMarcError(''); setMarcDownloaded(false); setMarcOpen(false); }}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{t.exportMARC}</h2>
            {marcError && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{marcError}</div>
            )}
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="radio" id="marc-current" name="marcMode" value="current" checked={marcMode==='current'} onChange={() => setMarcMode('current')} />
                <span htmlFor="marc-current" className="text-sm text-gray-800">{t.exportCurrentPage}</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" id="marc-selected" name="marcMode" value="selected" checked={marcMode==='selected'} onChange={() => setMarcMode('selected')} />
                <span htmlFor="marc-selected" className="text-sm text-gray-800">{t.exportSelectedBooks}</span>
              </label>
            </div>

            {marcUrl && (
              <div className="mt-3 rounded-xl px-4 py-3 bg-green-50 ring-1 ring-green-200">
                  <div className="text-sm text-green-800 mb-2">{t.fileReady}: {marcFilename}</div>
                  <a
                    href={marcUrl}
                    download={marcFilename || 'BooksMARC.txt'} 
                    onClick={() => { setMarcDownloaded(true); setTimeout(() => setMarcDownloaded(false), 2000); }}
                    className="inline-block px-3 py-1 text-sm rounded-md bg-[#2E6BAA] text-white hover:bg-opacity-90"
                  >{marcDownloaded ? t.downloaded : t.download}</a>
                </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={handleMarcExport} disabled={marcExporting || (marcMode==='selected' && selectedIds.size===0)} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">{marcExporting ? t.exporting : t.export}</button>
              <button type="button" onClick={() => { if (marcUrl) { URL.revokeObjectURL(marcUrl); } setMarcUrl(''); setMarcFilename(''); setMarcError(''); setMarcOpen(false); }} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {exportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (exportUrl) { URL.revokeObjectURL(exportUrl); } setExportUrl(''); setExportFilename(''); setExportError(''); setExportDownloaded(false); setExportOpen(false); }}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{t.exportBooks}</h2>
            {exportError && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{exportError}</div>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="radio" id="exp-current" name="exp-mode" value="current" checked={exportMode==='current'} onChange={(e)=>setExportMode(e.target.value)} />
                <label htmlFor="exp-current" className="text-sm text-gray-800">{t.exportCurrentPage}</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" id="exp-selected" name="exp-mode" value="selected" checked={exportMode==='selected'} onChange={(e)=>setExportMode(e.target.value)} />
                <label htmlFor="exp-selected" className="text-sm text-gray-800">{t.exportSelectedBooks}{selectedIds.size > 0 ? ` (${selectedIds.size} ${t.selected})` : ''}</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" id="exp-all" name="exp-mode" value="all" checked={exportMode==='all'} onChange={(e)=>setExportMode(e.target.value)} />
                <label htmlFor="exp-all" className="text-sm text-gray-800">{t.exportAll}</label>
              </div>
            </div>

            {exportUrl && (
              <div className="mt-3 rounded-xl px-4 py-3 bg-green-50 ring-1 ring-green-200">
                <div className="text-sm text-green-800 mb-2">{t.fileReady}: {exportFilename}</div>
                <a
                  href={exportUrl}
                  download={exportFilename || 'BooksExcel.xlsx'} 
                  onClick={() => { setExportDownloaded(true); setTimeout(() => setExportDownloaded(false), 2000); }}
                  className="inline-block px-3 py-1 text-sm rounded-md bg-[#2E6BAA] text-white hover:bg-opacity-90"
                >{exportDownloaded ? t.downloaded : t.download}</a>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={handleExport} disabled={exporting || (exportMode==='selected' && selectedIds.size===0)} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
                {exporting ? t.exporting : t.export}
              </button>
              <button type="button" onClick={() => { if (exportUrl) { URL.revokeObjectURL(exportUrl); } setExportUrl(''); setExportFilename(''); setExportError(''); setExportDownloaded(false); setExportOpen(false); }} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}


      
      {barcodeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setBarcodeOpen(false); setBarcodeMode('current'); setBarcodeFromId(''); setBarcodeToId(''); }}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{t.generateBarcodes}</h2>
            {barcodeError && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{barcodeError}</div>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="radio" id="bc-current" name="bc-mode" value="current" checked={barcodeMode==='current'} onChange={(e)=>setBarcodeMode(e.target.value)} />
                <label htmlFor="bc-current" className="text-sm text-gray-800">{t.generateCurrentPage}</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" id="bc-selected" name="bc-mode" value="selected" checked={barcodeMode==='selected'} onChange={(e)=>setBarcodeMode(e.target.value)} />
                <label htmlFor="bc-selected" className="text-sm text-gray-800">{t.generateSelectedBooks}{selectedIds.size > 0 ? ` (${selectedIds.size} ${t.selected})` : ''}</label>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <input type="radio" id="bc-custom" name="bc-mode" value="custom" checked={barcodeMode==='custom'} onChange={(e)=>setBarcodeMode(e.target.value)} />
                  <label htmlFor="bc-custom" className="text-sm text-gray-800">{t.generateCustom}</label>
                </div>
                {barcodeMode==='custom' && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder={t.fromBarcodeId} value={barcodeFromId} onChange={(e)=>setBarcodeFromId(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                    <input type="text" placeholder={t.toBarcodeId} value={barcodeToId} onChange={(e)=>setBarcodeToId(e.target.value)} className="w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={handleBarcodeGenerate} disabled={barcodeGenerating || (barcodeMode==='selected' && selectedIds.size===0) || (barcodeMode==='custom' && (!barcodeFromId.trim() || !barcodeToId.trim()))} className="px-4 py-2 rounded-md bg-green-600 text-white disabled:opacity-60">{barcodeGenerating ? t.generating : t.generate}</button>
              <button type="button" onClick={() => { setBarcodeOpen(false); setBarcodeMode('current'); setBarcodeFromId(''); setBarcodeToId(''); }} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">{t.cancel}</button>
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
              <h2 className="text-lg font-semibold text-gray-800">{t.barcodePreview}</h2>
              <button type="button" onClick={() => setBarcodePrintOpen(false)} className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">{t.close}</button>
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
          labels={t.bookCopies}
          onClose={closeCopies}
          onCopiesChanged={handleCopiesChanged}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        title={t.deleteBook}
        message={deleteMessage}
        confirmText={deleteSubmitting ? t.deleting : t.delete}
        cancelText={t.cancel}
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
        title={t.limitedAccess}
      />
    </div>
  );
};

export default Books;