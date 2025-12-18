import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { FiGrid, FiList } from 'react-icons/fi';
import { bookService } from '../services/bookService';
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
    const [filterTitle, setFilterTitle] = useState('');
    const [filterAuthor, setFilterAuthor] = useState('');
    const [actionMessage, setActionMessage] = useState('');
    const [actionSuccess, setActionSuccess] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState('');
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Determine book type from URL parameters
    const bookType = location.pathname.includes('English') ? 'English' : 'Myanmar';
    const imageBase = import.meta.env.VITE_IMAGE_BASE_URL || '';

    const fetchBooks = async (page = pageNumber, title = '', author = '') => {
        setError('');
        setIsLoading(true);
        try {
            const res = await bookService.getBookList(page, title, author, bookType);
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
                        id: b.BookID ?? b.bookID ?? b.Id ?? b.id,
                        title: b.Title ?? b.title ?? '',
                        author: b.Author ?? b.author ?? '',
                        publisher: b.Publisher ?? b.publisher ?? '',
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
                const pageNumberVal = container.PageNumber ?? container.pageNumber ?? page;
                setTotalItems(totalItemsVal);
                setTotalPages(totalPagesVal);
                setPageNumber(pageNumberVal);
            }
        } catch (err) {
            setError(err?.message || 'Failed to load books');
            setBooks([]);
            setTotalItems(0);
            setTotalPages(0);
            setPageNumber(page);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPageNumber(1);
        fetchBooks(1);
    }, [bookType]);

    const handleRetry = async () => {
        setRetrying(true);
        try {
            await fetchBooks(pageNumber, filterTitle.trim(), filterAuthor.trim());
        } finally {
            setRetrying(false);
        }
    };

    const handleSearch = async () => {
        setPageNumber(1);
        await fetchBooks(1, filterTitle.trim(), filterAuthor.trim());
    };

    const handleReset = async () => {
        setFilterTitle('');
        setFilterAuthor('');
        setPageNumber(1);
        await fetchBooks(1, '', '');
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

    const confirmDelete = async () => {
      if (!pendingDeleteId || deleteSubmitting) return;
      setDeleteSubmitting(true);
      setActionMessage('');
      try {
        const res = await bookService.deleteBook(pendingDeleteId, bookType);
        if (res?.success) {
          setActionSuccess(true);
          setActionMessage(res?.message || 'Book deleted');
          await fetchBooks(pageNumber, filterTitle.trim(), filterAuthor.trim());
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

    return (
        <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
                <div className="p-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                        <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">{bookType} Books</h1>
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <div className="inline-flex w-full sm:w-auto items-center bg-white/95 rounded-xl ring-1 ring-gray-200 overflow-hidden shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 text-sm flex items-center justify-center gap-2 w-1/2 sm:w-auto ${viewMode==='grid' ? 'bg-[#2E6BAA] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <FiGrid size={16} /> Grid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-2 text-sm flex items-center justify-center gap-2 w-1/2 sm:w-auto ${viewMode==='list' ? 'bg-[#2E6BAA] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <FiList size={16} /> List
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Title"
                                value={filterTitle}
                                onChange={(e)=>setFilterTitle(e.target.value)}
                                onKeyDown={(e)=>{ if(e.key==='Enter') handleSearch(); }}
                                className="w-full sm:w-48 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            />
                            <input
                                type="text"
                                placeholder="Author"
                                value={filterAuthor}
                                onChange={(e)=>setFilterAuthor(e.target.value)}
                                onKeyDown={(e)=>{ if(e.key==='Enter') handleSearch(); }}
                                className="w-full sm:w-48 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                            />
                            <button onClick={handleSearch} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Search</button>
                            <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Reset</button>
                            <button
                                onClick={() => navigate(bookType === 'English' ? '/EnglishBooks/New' : '/MyanmarBooks/New')}
                                className="px-4 py-2 bg-[#2E6BAA] text-white rounded-md hover:bg-opacity-90 transition-colors duration-200"
                            >
                                Add New Book
                            </button>
                        </div>
                    </div>

                    {error && (
                      <div className="mb-4 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200 flex items-center justify-between">
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
                    ) : (!error && books.length === 0) ? (
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
                                    <div key={book.id} className="bg-white/95 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col ring-1 ring-gray-100">
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
                                                <p><span className="font-medium">Publisher:</span> {book.publisher}</p>
                                                <p><span className="font-medium">Edition:</span> {book.edition}</p>
                                                <p><span className="font-medium">Date:</span> {book.date}</p>
                                            </div>
                                            <div className="mt-4 flex justify-end space-x-2">
                                              {book.controlAction ? (
                                                <>
                                                  <button onClick={() => navigate(bookType === 'English' ? `/EnglishBooks/${book.id}/Update` : `/MyanmarBooks/${book.id}/Update`)} className="px-3 py-1 text-sm text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white rounded-md border border-[#2E6BAA] transition-colors duration-200">Update</button>
                                                  <button onClick={() => openDelete(book)} className="px-3 py-1 text-sm text-red-600 hover:bg-red-600 hover:text-white rounded-md border border-red-600 transition-colors duration-200">Delete</button>
                                                </>
                                              ) : (
                                                <span className="text-sm text-gray-500">No actions</span>
                                              )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/95 rounded-2xl shadow-xl ring-1 ring-gray-100">
                                <div className="overflow-x-auto">
                                    <table className="min-w-[900px] w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cover</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Author</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Publisher</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Edition</th>
                                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                                                <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {books.map((book) => (
                                                <tr key={book.id} className="hover:bg-gray-50">
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
                                                    <td className="px-4 py-3 text-gray-700">{book.date}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                          {book.controlAction ? (
                                                            <>
                                                              <button onClick={() => navigate(bookType === 'English' ? `/EnglishBooks/${book.id}/Update` : `/MyanmarBooks/${book.id}/Update`)} className="px-3 py-1 text-sm text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white rounded-md border border-[#2E6BAA]">Update</button>
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
                    )}
                </div>
                <div className="px-4 lg:px-8 pb-6">
                  <div className="mt-4 px-3 py-2 bg-white rounded-xl ring-1 ring-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {pageNumber} of {totalPages} • {totalItems} total Books
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { if (pageNumber > 1) fetchBooks(pageNumber - 1, filterTitle.trim(), filterAuthor.trim()); }}
                        disabled={pageNumber <= 1 || isLoading}
                        className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => { if (!totalPages || pageNumber >= totalPages) return; fetchBooks(pageNumber + 1, filterTitle.trim(), filterAuthor.trim()); }}
                        disabled={pageNumber >= totalPages || isLoading}
                        className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
      </div>

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