import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { bookService } from '../services/bookService';

const BookUpdateInfo = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { bookId } = useParams();

  const bookType = location.pathname.startsWith('/EnglishBooks')
    ? 'English'
    : 'Myanmar';
  const imageBase = import.meta.env.VITE_IMAGE_BASE_URL || '';

  useEffect(() => {
    document.title = `Update ${bookType} Book Info`;
    localStorage.setItem('Books:lastDest', 'detail');
  });

  const [form, setForm] = useState({
    RemoveBookCover: false,
    BookCoverFile: null,
    BookCover: '',
    Author: '',
    Title: '',
    ISBN: '',
    SubTitle: '',
    Edition: '',
    Publisher: '',
    PublishedYear: '',
    NumberOfPages: '',
    SubjectHeadings: '',
    Initial: '',
    ClassNo: '',
    Translator: '',
    Editor: '',
    Place: '',
    Pagination: '',
    Illustration: '',
    Size: '',
    SOR: '',
    Price: 0,
    Summary: '',
    RegistrationDate: '',
    Remarks: '',
  });

  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const messageRef = useRef(null);
  useEffect(() => {
    if (message) {
      requestAnimationFrame(() => {
        messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageRef.current?.focus();
      });
    }
  }, [message]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await bookService.getBookInfo(bookId, bookType);
        if (res?.success) {
          const b = res.data?.result || res.data;
          const coverFileName = b.bookCover || '';
          const preview = coverFileName
            ? `${imageBase}libraryBookCovers/${bookType === 'English' ? 'englishBooks' : 'myanmarBooks'}/${coverFileName}`
            : '';
          const normDate = (val) => {
            const s = String(val || '').trim();
            if (!s) return '';
            const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (m) return `${m[1]}-${m[2]}-${m[3]}`;
            const d = new Date(s);
            if (!isNaN(d.getTime())) {
              const y = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              return `${y}-${mm}-${dd}`;
            }
            return '';
          };
          setForm({
            RemoveBookCover: false,
            BookCover: coverFileName,
            BookCoverFile: null,
            Title: b.Title ?? b.title ?? '',
            Author: b.Author ?? b.author ?? '',
            ISBN: b.ISBN ?? b.isbn ?? '',
            SubTitle: b.SubTitle ?? b.subTitle ?? '',
            Edition: b.Edition ?? b.edition ?? '',
            Publisher: b.Publisher ?? b.publisher ?? '',
            PublishedYear: (b.PublishedYear ?? b.publishedYear ?? ''),
            NumberOfPages: (b.NumberOfPages ?? b.numberOfPages ?? ''),
            SubjectHeadings: b.SubjectHeadings ?? b.subjectHeadings ?? '',
            Initial: b.Initial ?? b.initial ?? '',
            ClassNo: b.ClassNo ?? b.classNo ?? '',
            Translator: b.Translator ?? b.translator ?? '',
            Editor: b.Editor ?? b.editor ?? '',
            NoOfCopies: b.NoOfCopies ?? b.noOfCopies ?? '',
            Place: b.Place ?? b.place ?? '',
            Pagination: b.Pagination ?? b.pagination ?? '',
            Illustration: b.Illustration ?? b.illustration ?? '',
            Size: b.Size ?? b.size ?? '',
            SOR: b.SOR ?? b.sor ?? '',
            Price: b.Price ?? b.price ?? 0,
            Summary: b.Summary ?? b.summary ?? '',
            RegistrationDate: normDate(b.RegistrationDate ?? b.registrationDate ?? ''),
            Remarks: b.Remarks ?? b.remarks ?? '',
          });
          setCoverPreview(preview);
          setSuccess(true);
          setMessage(res.message || '');
        } else {
          setSuccess(false);
          setMessage(res?.message || 'Failed to load book');
        }
      } catch (err) {
        setSuccess(false);
        setMessage(err?.message || 'Failed to load book');
      } finally {
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
      }
    };
    fetch();
  }, [bookId, bookType, imageBase]);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    setField('BookCoverFile', file);
    if (file) {
      setField('RemoveBookCover', false);
      setCoverPreview(URL.createObjectURL(file));
    } else if (form.BookCover) {
      setCoverPreview(`${imageBase}libraryBookCovers/${bookType === 'English' ? 'englishBooks' : 'myanmarBooks'}/${form.BookCover}`);
    } else {
      setCoverPreview('');
    }
  };

  const validate = () => {
    if (!form.Title?.trim() || !form.ClassNo?.trim()) {
      setSuccess(false);
      setMessage('Please fill all required * fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validate()) return;
    setSubmitLoading(true);
    try {
      const res = await bookService.updateBookInfo(bookId, form, bookType);
      if (res?.success) {
        setSuccess(true);
        setMessage(res?.message || 'Book updated');
        setTimeout(() => {
          localStorage.setItem('Books:lastDest', 'detail');
          navigate(bookType === 'English' ? '/EnglishBooks' : '/MyanmarBooks');
        }, 2000);
      } else {
        setSuccess(false);
        setMessage(res?.message || 'Failed to update book');
      }
    } catch (err) {
      setSuccess(false);
      setMessage(err?.message || 'Failed to update book');
    } finally {
      setSubmitLoading(false);
    }
  };

  const cancel = () => {
    navigate(bookType === 'English' ? '/EnglishBooks' : '/MyanmarBooks');
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Update Info ({bookType})</h1>
            <button onClick={cancel} className="px-3 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Cancel</button>
          </div>

          {message && (
            <div ref={messageRef} tabIndex="-1" className={`mb-3 rounded-xl px-4 py-3 text-sm ${success ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>
              {message}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-white rounded-xl p-6 shadow space-y-4">
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Book Type</label>
                  <input type="text" value={bookType} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100" />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Title <span className="text-red-600">*</span></label>
                  <input type="text" value={form.Title} onChange={(e) => setField('Title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Initial of (Author name)</label>
                  <input type="text" value={form.Initial} onChange={(e) => setField('Initial', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Author</label>
                  <input type="text" value={form.Author} onChange={(e) => setField('Author', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Book Cover</label>
                  <input type="file" accept="image/*" onChange={handleFile} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  {coverPreview && (
                    <img src={coverPreview} alt="Cover Preview" className="mt-3 w-32 h-50 object-cover rounded-md ring-1 ring-gray-200" />
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setField('RemoveBookCover', true); setField('BookCoverFile', null); setField('BookCover',''); setCoverPreview(''); }}
                    disabled={!coverPreview && !form.BookCover && !form.BookCoverFile}
                    className="w-full sm:w-44 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 min-h-[44px] disabled:opacity-60"
                  >
                    Remove Cover
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className={`w-full sm:w-44 px-4 py-2 rounded-lg bg-[#2E6BAA] hover:bg-[#1B4B8A] text-white hover:bg-opacity-90 flex items-center justify-center gap-2 min-h-[44px] ${submitLoading ? 'opacity-70' : ''}`}
                  >
                    {submitLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                        </svg>
                        <span>Updating...</span>
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Class No <span className="text-red-600">*</span></label>
                    <input type="text" value={form.ClassNo} onChange={(e) => setField('ClassNo', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">ISBN</label>
                    <input type="text" value={form.ISBN} onChange={(e) => setField('ISBN', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Translator</label>
                    <input type="text" value={form.Translator} onChange={(e) => setField('Translator', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Editor</label>
                    <input type="text" value={form.Editor} onChange={(e) => setField('Editor', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Publisher</label>
                    <input type="text" value={form.Publisher} onChange={(e) => setField('Publisher', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Published Year</label>
                    <input type="number" min="0" value={form.PublishedYear} onChange={(e) => setField('PublishedYear', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">SubTitle</label>
                    <input type="text" value={form.SubTitle} onChange={(e) => setField('SubTitle', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Place</label>
                    <input type="text" value={form.Place} onChange={(e) => setField('Place', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Edition</label>
                    <input type="text" value={form.Edition} onChange={(e) => setField('Edition', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Subject Headings</label>
                    <input type="text" value={form.SubjectHeadings} onChange={(e) => setField('SubjectHeadings', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Pagination</label>
                    <input type="text" value={form.Pagination} onChange={(e) => setField('Pagination', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Illustration</label>
                    <input type="text" value={form.Illustration} onChange={(e) => setField('Illustration', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Size</label>
                    <input type="text" value={form.Size} onChange={(e) => setField('Size', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Number Of Pages</label>
                    <input type="number" min="0" value={form.NumberOfPages} onChange={(e) => setField('NumberOfPages', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Statement of Responsibility</label>
                    <input type="text" value={form.SOR} onChange={(e) => setField('SOR', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Price</label>
                    <input type="number" min="0" max="9999999" value={form.Price} onChange={(e) => setField('Price', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Registration Date</label>
                    <input type="date" value={form.RegistrationDate} onChange={(e) => setField('RegistrationDate', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Summary</label>
                    <textarea value={form.Summary} onChange={(e) => setField('Summary', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white min-h-[100px]" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Remarks</label>
                    <textarea value={form.Remarks} onChange={(e) => setField('Remarks', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white min-h-[100px]" />
                  </div>
                  <div></div>
                  <div className="flex justify-end gap-3">
                  <button type="button" onClick={cancel} className="px-3 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Cancel</button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className={`w-full sm:w-44 px-4 py-2 rounded-lg bg-[#2E6BAA] hover:bg-[#1B4B8A] text-white hover:bg-opacity-90 flex items-center justify-center gap-2 min-h-[44px] ${submitLoading ? 'opacity-70' : ''}`}
                  >
                    {submitLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                        </svg>
                        <span>Updating...</span>
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookUpdateInfo;