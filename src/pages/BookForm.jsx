import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { bookService } from '../services/bookService';

const BookForm = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const bookType = location.pathname.includes('English') ? 'English' : 'Myanmar';
  const isEdit = !!id;

  const [form, setForm] = useState({
    ItemBarCodeID: '',
    ISBN: '',
    Title: '',
    SubTitle: '',
    Author: '',
    Edition: '',
    Publisher: '',
    PublishedYear: '',
    NumberOfPages: '',
    Description: '',
    BookCoverFile: null,
  });

  const [coverPreview, setCoverPreview] = useState('');
  const coverInputRef = useRef(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await bookService.getBookById(id, bookType);
        if (res?.success) {
          const b = res.data;
          setForm({
            ISBN: b.isbn || '',
            Title: b.title || '',
            SubTitle: b.subTitle || '',
            Author: b.author || '',
            Edition: b.edition || '',
            Publisher: b.publisher || '',
            PublishedYear: b.publishedYear ?? '',
            NumberOfPages: b.numberOfPages ?? '',
            Description: b.description || '',
            BookCoverFile: null,
          });
          setCoverPreview(b.bookCoverUrl || '');
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
        setTimeout(() => setMessage(''), 2500);
      }
    };
    if (isEdit) fetch();
  }, [id, isEdit, bookType]);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    setField('BookCoverFile', file);
    setCoverPreview(file ? URL.createObjectURL(file) : '');
  };

  const validate = () => {
    if (!form.ISBN || !form.Title || !form.Author || !form.Publisher) {
      setSuccess(false);
      setMessage('Please fill all required fields');
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
      const res = isEdit
        ? await bookService.updateBook(id, form, bookType)
        : await bookService.addBook(form, bookType);
      if (res?.success) {
        setSuccess(true);
        setMessage(res?.message || (isEdit ? 'Book updated' : 'Book added'));
        setTimeout(() => navigate(bookType === 'English' ? '/EnglishBooks' : '/MyanmarBooks'), 800);
      } else {
        setSuccess(false);
        setMessage(res?.message || 'Failed to submit');
      }
    } catch (err) {
      setSuccess(false);
      setMessage(err?.message || 'Failed to submit');
    } finally {
      setSubmitLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const cancel = () => navigate(bookType === 'English' ? '/EnglishBooks' : '/MyanmarBooks');

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Book' : 'Add New Book'} ({bookType})</h1>
            <button onClick={cancel} className="px-3 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Cancel</button>
          </div>

          {message && (
            <div className={`mb-3 rounded-xl px-4 py-3 text-sm ${success ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>
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
                  <input type="text" value={bookType} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700" />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block">Book Cover</label>
                  <input ref={coverInputRef} type="file" accept="image/*" onChange={handleFile} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
                  {coverPreview && (
                    <img src={coverPreview} alt="Cover Preview" className="mt-3 w-32 h-44 object-cover rounded-md ring-1 ring-gray-200" />
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className={`w-full sm:w-44 px-4 py-2 rounded-lg bg-[#2E6BAA] text-white hover:bg-opacity-90 flex items-center justify-center gap-2 min-h-[44px] ${submitLoading ? 'opacity-70' : ''}`}
                  >
                    {submitLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                        </svg>
                        <span>{isEdit ? 'Updating...' : 'Saving...'}</span>
                      </>
                    ) : (
                      isEdit ? 'Update Book' : 'Save Book'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setField('BookCoverFile', null); setCoverPreview(''); if (coverInputRef.current) coverInputRef.current.value = ''; }}
                    disabled={!coverPreview && !form.BookCoverFile}
                    className="w-full sm:w-44 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 min-h-[44px] disabled:opacity-60"
                  >
                    Remove Cover
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Item Bar Code ID</label>
                    <input type="text" value={form.ItemBarCodeID} placeholder="Auto-generated" disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">ISBN</label>
                    <input type="text" value={form.ISBN} onChange={(e) => setField('ISBN', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-700 mb-1 block">Title</label>
                    <input type="text" value={form.Title} onChange={(e) => setField('Title', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">SubTitle</label>
                    <input type="text" value={form.SubTitle} onChange={(e) => setField('SubTitle', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Author</label>
                    <input type="text" value={form.Author} onChange={(e) => setField('Author', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Edition</label>
                    <input type="text" value={form.Edition} onChange={(e) => setField('Edition', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Publisher</label>
                    <input type="text" value={form.Publisher} onChange={(e) => setField('Publisher', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Published Year</label>
                    <input type="number" value={form.PublishedYear} onChange={(e) => setField('PublishedYear', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 mb-1 block">Number Of Pages</label>
                    <input type="number" value={form.NumberOfPages} onChange={(e) => setField('NumberOfPages', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-700 mb-1 block">Description</label>
                    <textarea value={form.Description} onChange={(e) => setField('Description', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white min-h-[100px]" />
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

export default BookForm;