import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { bookService } from '../services/bookService';
import ConfirmDialog from '../components/common/ConfirmDialog';
import BookCopies from '../components/BookCopies';

const BookDetail = () => {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bookType = location.pathname.startsWith('/EnglishBooks')
    ? 'English'
    : 'Myanmar';
  const imageBase = import.meta.env.VITE_IMAGE_BASE_URL || '';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [book, setBook] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [retrying, setRetrying] = useState(false);

  const [copiesOpen, setCopiesOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);


  useEffect(() => {
    document.title = `${bookType} Book Detail`;
    localStorage.setItem('Books:lastDest', 'detail');
  }, [bookType]);

  const fetchBookDetails = async () => {
    setError('');
    setIsLoading(true);
    try {
      const sp = new URLSearchParams(location.search);
      const res = await bookService.getBookDetails(bookId, bookType, sp.get('publicId'));
      if (res?.success) {

        const d = res?.data?.result ?? res?.data ?? {};
        const coverFile = d.BookCover ?? d.bookCover ?? '';
        const mapped = {
          bookId: d.BookId ?? d.bookId ?? bookId,
          isbn: d.ISBN ?? d.isbn ?? '',
          title: d.Title ?? d.title ?? '',
          subTitle: d.SubTitle ?? d.subTitle ?? '',
          initial: d.Initial ?? d.initial ?? '',
          author: d.Author ?? d.author ?? '',
          edition: d.Edition ?? d.edition ?? '',
          publisher: d.Publisher ?? d.publisher ?? '',
          publishedYear: d.PublishedYear ?? d.publishedYear ?? '',
          numberOfPages: d.NumberOfPages ?? d.numberOfPages ?? '',
          description: d.Description ?? d.description ?? '',
          category: d.Category ?? d.category ?? '',
          subjectHeadings: d.SubjectHeadings ?? d.subjectHeadings ?? '',
          classNo: d.ClassNo ?? d.classNo ?? '',
          translator: d.Translator ?? d.translator ?? '',
          editor: d.Editor ?? d.editor ?? '',
          noOfCopies: d.NoOfCopies ?? d.noOfCopies ?? '',
          place: d.Place ?? d.place ?? '',
          pagination: d.Pagination ?? d.pagination ?? '',
          illustration: d.Illustration ?? d.illustration ?? '',
          size: d.Size ?? d.size ?? '',
          SOR: d.SOR ?? d.sor ?? '',
          price: d.Price ?? d.price ?? '',
          summary: d.Summary ?? d.summary ?? '',
          remarks: d.Remarks ?? d.remarks ?? '',
          registrationDate: d.RegistrationDate ?? d.registrationDate ?? '',
          controlAction: !!(d.ControlAction ?? d.controlAction ?? false),
          totalCopies: d.TotalCopies ?? d.totalCopies ?? '',
          cover: coverFile ? `${imageBase}libraryBookCovers/${bookType === 'English' ? 'englishBooks' : 'myanmarBooks'}/${coverFile}` : '',
        };
        setBook(mapped);
      } else {
        setError(res?.message || 'Failed to load book details');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load book details');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBookDetails();
  }, [bookId, bookType, imageBase]);

  const handleRetry = async () => {
    setRetrying(true);
    await fetchBookDetails();
    setRetrying(false);
  };

  const goBack = () => {
    const returnPath = localStorage.getItem('BookDetail:returnPath');
    if (returnPath) {
      localStorage.removeItem('BookDetail:returnPath');
      navigate(returnPath);
      return;
    }
    navigate(bookType === 'English' ? '/EnglishBooks' : '/MyanmarBooks');
  };

  const openDelete = () => { setDeleteOpen(true); };
  const closeDelete = () => { setDeleteOpen(false); };
  const confirmDelete = async () => {
    if (!book?.bookId || deleteSubmitting) { closeDelete(); return; }
    setDeleteSubmitting(true);
    try {
      const res = await bookService.deleteBook(book.bookId, bookType);
      if (res?.success) { closeDelete(); goBack(); }
    } catch (err) {
      setError(err?.message || 'Failed to delete book');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const openCopies = (book) => {
      setCopiesOpen(true);
      setSelectedBook(book);
    };

    const closeCopies = () => {
      setCopiesOpen(false);
      setSelectedBook(null);
    };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">{bookType} Book Detail</h1>
            <button onClick={goBack} className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md">Back</button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
            </div>
          ) : error ? (
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
          ) : !book ? (
            <div className="rounded-xl px-4 py-3 text-sm bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200">No details available</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl ring-1 ring-gray-200 p-4">
                <div className="aspect-[3/3] w-full rounded-xl flex items-center justify-center overflow-hidden">
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-gray-400">No Cover</span>
                  )}
                </div>
                {/* <div className="mt-3 text-sm text-gray-600">
                  <div><span className="font-semibold">ISBN:</span> {book.isbn || '—'}</div>
                  {book.controlAction && 
                    <div><span className="font-semibold">Total Copies:</span> {book.totalCopies || '1'} <span onClick={() => openCopies(book)} className="ml-1 cursor-pointer text-[#2E6BAA] hover:text-[#1B4B8A]">(View)</span></div>
                  }
                </div> */}
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl ring-1 ring-gray-200 p-4">
                <div className="mb-3">
                  <div className="text-xs font-semibold text-[#2E6BAA]">BOOK INFO</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">{book.title || 'Untitled'}</div>
                  {book.subTitle && <div className="text-sm text-gray-600">{book.subTitle}</div>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-800">
                  <div><span className="font-medium">ISBN:</span> {book.isbn || '—'}</div>
                  <div><span className="font-medium">Initial:</span> {book.initial || '—'}</div>
                  <div><span className="font-medium">Author:</span> {book.author || '—'}</div>
                  <div><span className="font-medium">Edition:</span> {book.edition || '—'}</div>
                  <div><span className="font-medium">Publisher:</span> {book.publisher || '—'}</div>
                  <div><span className="font-medium">Published Year:</span> {book.publishedYear || '—'}</div>
                  <div><span className="font-medium">Number of Pages:</span> {book.numberOfPages || '—'}</div>
                  <div><span className="font-medium">Category:</span> {book.category || '—'}</div>
                  <div><span className="font-medium">Subject Headings:</span> {book.subjectHeadings || '—'}</div>
                  <div><span className="font-medium">Class No:</span> {book.classNo || '—'}</div>
                  <div><span className="font-medium">Translator:</span> {book.translator || '—'}</div>
                  <div><span className="font-medium">Editor:</span> {book.editor || '—'}</div>
                  <div><span className="font-medium">Place:</span> {book.place || '—'}</div>
                  <div><span className="font-medium">Pagination:</span> {book.pagination || '—'}</div>
                  <div><span className="font-medium">Illustration:</span> {book.illustration || '—'}</div>
                  <div><span className="font-medium">Size:</span> {book.size || '—'}</div>
                  <div><span className="font-medium">SOR:</span> {book.SOR || '—'}</div>
                  <div><span className="font-medium">Price:</span> {book.price || '—'}</div>
                  <div><span className="font-medium">Registration Date:</span> {book.registrationDate || '—'}</div>
                </div>
                {book.description && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-[#2E6BAA]">DESCRIPTION</div>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{book.description}</p>
                  </div>
                )}
                {book.summary && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-[#2E6BAA]">SUMMARY</div>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{book.summary}</p>
                  </div>
                )}
                {book.remarks && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-[#2E6BAA]">REMARKS</div>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{book.remarks}</p>
                  </div>
                )}
                <div className="mt-4">
                  <div className="text-xs font-semibold text-[#2E6BAA]">Total Copies</div>
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                    {book.totalCopies}
                    {book.controlAction && <span onClick={() => openCopies(book)} className="ml-1 cursor-pointer text-[#2E6BAA] hover:text-[#1B4B8A]">(View)</span>}  
                  </p>
                </div>

                {book.controlAction && (
                  <div className="mt-6 flex justify-end gap-2">
                    <button onClick={() => openCopies(book)} className="px-4 py-2 *: text-sm rounded-md border border-[#2E6BAA] text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white">View Copies</button>
                    <button onClick={() => navigate(bookType === 'English' ? `/EnglishBooks/Update/${bookId}` : `/MyanmarBooks/Update/${bookId}`)} className="px-4 py-2 text-sm rounded-md border border-[#2E6BAA] text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white">Edit</button>
                    <button onClick={openDelete} className="px-4 py-2 text-sm rounded-md border border-red-600 text-red-600 hover:bg-red-600 hover:text-white">Delete</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {copiesOpen && (
        <BookCopies
          open={copiesOpen}
          book={selectedBook}
          showAdminActions={true}
          onClose={closeCopies}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Book"
        message={<span className="text-sm text-gray-800">Are you sure you want to delete <strong className="font-semibold">{book?.title || ''}</strong>?</span>}
        confirmText={deleteSubmitting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
        onCancel={closeDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default BookDetail;