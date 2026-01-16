import { useEffect, useRef, useState } from 'react';
import { FiCamera, FiEye, FiEdit2 } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import profilePlaceholder from '../assets/profile-placeholder.png';
import { libraryService } from '../services/libraryService';
import { bookService } from '../services/bookService';
import { useAuth } from '../context/AuthProvider.jsx';

const Profile = () => {
  const { setUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const imageBase = (import.meta.env.VITE_IMAGE_BASE_URL || '').replace(/\/+$/, '');
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState(profilePlaceholder);
  const [coverImage, setCoverImage] = useState('');

  const [libraryPhotoFile, setLibraryPhotoFile] = useState(null);
  const [libraryCoverFile, setLibraryCoverFile] = useState(null);
  const [removeLibraryPhoto, setRemoveLibraryPhoto] = useState(false);
  const [removeLibraryCover, setRemoveLibraryCover] = useState(false);
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);

  const [formData, setFormData] = useState({
    LibraryName: '',
    LibraryType: '',
    OwnerName: '',
    ContactPerson: '',
    Email: '',
    PhoneNumber: '',
    Township: '',
    StateDivision: '',
    Address: '',
    LibraryCover: '',
    LibraryPhoto: '',
    BookCount: 0,
  });

  const makeCoverUrl = (name) => {
    const raw = typeof name === 'string' ? name : (name || '');
    if (!raw) return '';
    if (/^https?:\/\//.test(raw)) return raw;
    const n = raw.replace(/^\/+/, '').replace(/^images\//, '').replace(/^libraryBookCovers\//, '');
    return `${imageBase}/libraryCovers/${n}`;
  };
  const makeProfileUrl = (name) => {
    const raw = typeof name === 'string' ? name : (name || '');
    if (!raw) return '';
    if (/^https?:\/\//.test(raw)) return raw;
    const n = raw.replace(/^\/+/, '').replace(/^images\//, '').replace(/^libraryProfiles\//, '');
    return `${imageBase}/libraryProfiles/${n}`;
  };

  useEffect(() => {
    let mounted = true;
    setError('');
    setIsLoading(true);
    (async () => {
      try {
        const res = await libraryService.getLibraryProfile();
        const data = res?.data?.result ?? res?.result ?? res ?? {};
        const merged = {
          LibraryName: data.LibraryName ?? data.libraryName ?? '',
          LibraryType: data.LibraryType ?? data.libraryType ?? '',
          OwnerName: data.OwnerName ?? data.ownerName ?? '',
          ContactPerson: data.ContactPerson ?? data.contactPerson ?? '',
          Email: data.Email ?? data.email ?? '',
          PhoneNumber: data.PhoneNumber ?? data.phoneNumber ?? '',
          Township: data.Township ?? data.township ?? '',
          StateDivision: data.StateDivision ?? data.stateDivision ?? '',
          Address: data.Address ?? data.address ?? '',
          LibraryCover: data.LibraryCover ?? data.libraryCover ?? '',
          LibraryPhoto: data.LibraryPhoto ?? data.libraryPhoto ?? '',
          BookCount: data.BookCount ?? data.bookCount ?? 0,
        };
        if (mounted) {
          setFormData(merged);
          setProfileImage(makeProfileUrl(merged.LibraryPhoto) || profilePlaceholder);
          setCoverImage(makeCoverUrl(merged.LibraryCover));
          setRemoveLibraryPhoto(false);
          setRemoveLibraryCover(false);
          setLibraryPhotoFile(null);
          setLibraryCoverFile(null);
        }
      } catch (err) {
        if (mounted) setError(err?.message || 'Failed to load profile');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLibraryPhotoFile(file);
    setProfileImage(file ? URL.createObjectURL(file) : profilePlaceholder);
    setRemoveLibraryPhoto(false);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLibraryCoverFile(file);
    setCoverImage(file ? URL.createObjectURL(file) : '');
    setRemoveLibraryCover(false);
  };

  const removePhoto = () => {
    setLibraryPhotoFile(null);
    setProfileImage(profilePlaceholder);
    setRemoveLibraryPhoto(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeCover = () => {
    setLibraryCoverFile(null);
    setCoverImage('');
    setRemoveLibraryCover(true);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

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
        id: b.BookId ?? b.bookId ?? b.Id ?? b.id,
        title: b.Title ?? b.title ?? '',
        cover,
      };
    });
  };

  useEffect(() => {
    if (!previewMode) return;
    let mounted = true;
    (async () => {
      setBooksLoading(true);
      try {
        const [eng, mm] = await Promise.all([
          bookService.getBookList(1, 'English'),
          bookService.getBookList(1, 'Myanmar'),
        ]);
        const list = [...normalizeBooks(eng, 'English'), ...normalizeBooks(mm, 'Myanmar')];
        if (mounted) setBooks(list);
      } catch (err) {
        console.log(err)
        if (mounted) setBooks([]);
      } finally {
        if (mounted) setBooksLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [previewMode]);

  useEffect(() => {
    document.title = "Profile"
  }, []);

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSubmitLoading(true);
    try {
      const fd = new FormData();
      fd.append('LibraryName', (formData.LibraryName || '').trim());
      fd.append('LibraryType', (formData.LibraryType || '').trim());
      fd.append('OwnerName', (formData.OwnerName || '').trim());
      fd.append('ContactPerson', (formData.ContactPerson || '').trim());
      fd.append('Email', (formData.Email || '').trim());
      fd.append('PhoneNumber', (formData.PhoneNumber || '').trim());
      fd.append('Township', (formData.Township || '').trim());
      fd.append('StateDivision', (formData.StateDivision || '').trim());
      fd.append('Address', (formData.Address || '').trim());
      if (libraryCoverFile) fd.append('LibraryCoverFile', libraryCoverFile);
      fd.append('RemoveLibraryCover', String(!!removeLibraryCover));
      if (libraryPhotoFile) fd.append('LibraryPhotoFile', libraryPhotoFile);
      fd.append('RemoveLibraryPhoto', String(!!removeLibraryPhoto));

      const res = await libraryService.updateLibraryProfile(fd);
      if (res?.success) {
        setSuccess(true);
        setMessage(res?.message || 'Profile updated');
        setUser(prev => prev ? { ...prev, libraryName: (formData.LibraryName || '').trim() } : prev);
      } else {
        setSuccess(false);
        setMessage(res?.message || 'Failed to update');
      }
    } catch (err) {
      setSuccess(false);
      setMessage(err?.message || 'Failed to update');
    } finally {
      setSubmitLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Library Profile</h1>
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="px-3 py-2 rounded-md border border-[#2E6BAA] text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white text-sm inline-flex items-center gap-2"
            >
              {previewMode ? (
                <>
                  <FiEdit2 size={14} />
                  <span>Back to Edit</span>
                </>
              ) : (
                <>
                  <FiEye size={14} />
                  <span>View As</span>
                </>
              )}
            </button>
          </div>


          {isLoading && (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{error}</div>
          )}

          {!isLoading && !error && (
            <>
              <div className="relative z-0 mb-6 rounded-xl overflow-hidden ring-1 ring-white/20">
                {coverImage ? (
                  <img src={coverImage} alt="Cover" className="w-full h-64 sm:h-80 object-cover" />
                ) : (
                  <div className="w-full h-64 sm:h-80 bg-gradient-to-r from-[#1B4B8A] via-[#1B4B8A] to-[#2E6BAA]" />
                )}

                {!previewMode && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="bg-white/20 text-white px-3 py-1 rounded-md backdrop-blur hover:bg-white/30 text-sm inline-flex items-center gap-2"
                    >
                      <FiCamera size={14} />
                      Change Cover
                    </button>
                    <button
                      type="button"
                      onClick={removeCover}
                      disabled={!libraryCoverFile && !coverImage}
                      className="bg-red-600/80 text-white px-3 py-1 rounded-md backdrop-blur hover:bg-red-700 text-sm disabled:opacity-60"
                    >
                      Remove Cover
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              {previewMode && (
                <div className="relative z-10 flex items-center gap-4 px-6 -mt-12 sm:-mt-14">
                  <img src={profileImage} alt="" className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-md" />
                  <div className="text-2xl font-bold text-black">
                    {formData.LibraryName}
                    <br></br>
                    <span className="text-sm text-gray-600 absolute">{formData.LibraryType}</span>
                  </div>
                </div>
              )}

              {previewMode ? (
                <div className="bg-white rounded-lg shadow-md p-6 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs uppercase text-gray-500">Email</div>
                      <div className="text-gray-900">{formData.Email}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase text-gray-500">Phone</div>
                      <div className="text-gray-900">{formData.PhoneNumber}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase text-gray-500">Location</div>
                      <div className="text-gray-900">{formData.Township}, {formData.StateDivision}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase text-gray-500">Address</div>
                      <div className="text-gray-900">{formData.Address}</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="text-sm font-semibold text-gray-800 mb-3">Books</div>
                    {booksLoading ? (
                      <div className="flex justify-center items-center h-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E6BAA]"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {books.map((b) => (
                          <div key={b.id} className="bg-white rounded-md shadow-sm overflow-hidden ring-1 ring-gray-100">
                            <div className="aspect-[2/3] bg-gray-100">
                              {b.cover ? (
                                <img src={b.cover} alt={b.title} className="w-full h-full object-cover" />
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
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <form onSubmit={handleSubmit} className="space-y-5 font-medium">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <img src={profileImage} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md" />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute top-1 right-1 bg-[#2E6BAA] text-white p-2 rounded-full hover:bg-opacity-90 shadow"
                      >
                        <FiCamera size={16} />
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={removePhoto}
                          disabled={!libraryPhotoFile && (!profileImage || profileImage === profilePlaceholder)}
                          className="inline-flex items-center px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs disabled:opacity-60"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">{formData.LibraryName}</div>
                      <div className="text-md text-gray-600">{formData.LibraryType}</div>

                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Library Name</label>
                      <input
                        type="text"
                        name="LibraryName"
                        value={formData.LibraryName}
                        onChange={(e) => setField('LibraryName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Library Type</label>
                      <input
                        type="text"
                        name="LibraryType"
                        value={formData.LibraryType}
                        onChange={(e) => setField('LibraryType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                      <input
                        type="text"
                        name="OwnerName"
                        value={formData.OwnerName}
                        onChange={(e) => setField('OwnerName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                      <input
                        type="text"
                        name="ContactPerson"
                        value={formData.ContactPerson}
                        onChange={(e) => setField('ContactPerson', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Primary Email</label>
                      <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        type="text"
                        name="PhoneNumber"
                        value={formData.PhoneNumber}
                        onChange={(e) => setField('PhoneNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Township</label>
                      <input
                        type="text"
                        name="Township"
                        value={formData.Township}
                        onChange={(e) => setField('Township', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State/Division</label>
                      <input
                        type="text"
                        name="StateDivision"
                        value={formData.StateDivision}
                        onChange={(e) => setField('StateDivision', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <textarea
                        name="Address"
                        value={formData.Address}
                        onChange={(e) => setField('Address', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2E6BAA] bg-white"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center">
                        <div className="text-sm text-gray-700">Books added: <strong className="text-gray-900">{formData.BookCount}</strong></div>
                      </div>
                    </div>
                  </div>

                  {message && (
                    <div className={`mb-3 rounded-xl px-4 py-3 text-sm ${success ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>
                      {message}
                    </div>
                  )}
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
                          <span>Saving...</span>
                        </>
                      ) : (
                          <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;