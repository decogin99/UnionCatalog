import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthProvider.jsx';
import { FiCheck, FiX, FiShield, FiUpload } from 'react-icons/fi';
import { libraryService } from '../services/libraryService';
import { MdVerified } from "react-icons/md";

const FeatureItem = ({ children, dark = false }) => (
  <div className={`flex items-center gap-2 ${dark ? 'text-white/90' : 'text-gray-700'}`}>
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${dark ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
      <FiCheck size={12} />
    </span>
    <span className="text-sm">{children}</span>
  </div>
);

const BlockItem = ({ children, dark = false }) => (
  <div className={`flex items-center gap-2 ${dark ? 'text-white/90' : 'text-gray-700'}`}>
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${dark ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}>
      <FiX size={12} />
    </span>
    <span className="text-sm">{children}</span>
  </div>
);

const LibraryVerify = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // const [verifyOpen, setVerifyOpen] = useState(false);
  // const [officialCode, setOfficialCode] = useState('');
  // const [documentFile, setDocumentFile] = useState(null);
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessError, setAccessError] = useState('');
  const [libraryAccess, setLibraryAccess] = useState(user?.libraryAccess || 'Free');
  const [verifiedAt, setVerifiedAt] = useState('');
  const [verifyResultOpen, setVerifyResultOpen] = useState(false);

  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await fetchAccessStatus();
    setRetrying(false);
  };

  const handleVerifyNow = async () => {
    if (isVerified || isVerifying || verifySubmitting) return;
    setVerifyError('');
    setVerifySuccess('');
    setVerifySubmitting(true);
    try {
      const res = await libraryService.verifyLibraryAccess();
      if (res?.success) {
        const msg = res?.message || res?.data?.message || 'Submitted for verification. We will notify you once reviewed.';
        setVerifySuccess(msg);
        setLibraryAccess('Verified');
        setUser(prev => ({ ...prev, libraryAccess: 'Verified' }));
        setVerifyResultOpen(true);
      } else {
        setVerifyError(res?.message || 'Submission failed');
        setVerifyResultOpen(true);
      }
    } catch (err) {
      setVerifyError(err?.message || 'Submission failed');
      setVerifyResultOpen(true);
    } finally {
      setVerifySubmitting(false);
    }
  };

  const isVerified = (libraryAccess === 'Verified');
  const isVerifying = (libraryAccess === 'Verifying');
  const libraryName = user?.libraryName || '';

  useEffect(() => {
    document.title = 'Verify Your Library';
  }, []);

  const fetchAccessStatus = async () => {
    setAccessLoading(true);
    setAccessError('');
    try {
      const res = await libraryService.getLibraryAccessStatus();
      if (res?.success) {
        const access = res?.data?.libraryAccess ?? res?.libraryAccess;
        const approved = res?.data?.verifiedAt ?? res?.verifiedAt;
        if (access) {
          setLibraryAccess(access);
          if (approved) setVerifiedAt(approved);
          if (access !== 'Verifying') {
            setUser(prev => ({ ...prev, libraryAccess: access }));
          }
        }
      } else {
        setAccessError(
          res?.message
              ? res.message === 'Unauthorized'
                ? 'User unauthorized! Please login again.'
                : res.message
              : 'Fail to load verified libraries'
        );
      }
    } catch (err) {
      setAccessError(err?.message || 'Failed to check library plan');
    } finally {
      setAccessLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessStatus();
  }, []);

  const formatVerifiedDate = (v) => {
    try {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return '';
      const month = d.toLocaleString(undefined, { month: 'short' });
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      let h = d.getHours();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      const hh = String(h).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${month} ${day}, ${year} ${hh}:${mm} ${ampm}`;
    } catch { return ''; }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#1B4B8A] to-[#2E6BAA] text-white w-12 h-12 mb-3 shadow-md">
              <FiShield size={20} />
            </div>
            {accessLoading ? (
              <>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0C2D57]">Checking library plan...</h1>
                <p className="mt-2 text-sm sm:text-base text-[#1B4B8A]">Please wait while we check your library access.</p>
              </>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0C2D57]">Choose Trial or Verified</h1>
                <p className="mt-2 text-sm sm:text-base text-[#1B4B8A]">
                  {libraryName ? `${libraryName}: ` : ''}Upgrade from trial to verified to unlock advanced features. No payments involved.
                </p>
              </>
            )}
          </div>

          {accessError && (
            <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200 flex items-center justify-between">
              <span className="truncate">{accessError}</span>
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

          {accessLoading ? (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm bg-blue-50 text-blue-800 ring-1 ring-blue-200 flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-[#2E6BAA]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
              </svg>
              <span>Checking library plan...</span>
            </div>
          ) : (
            !accessError && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative bg-white rounded-2xl ring-1 ring-white/60 shadow-sm p-6 flex flex-col">
                {!isVerified && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 ring-1 ring-green-200">Current plan</span>
                  </div>
                )}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-[#2E6BAA]">TRIAL PLAN</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">Free Access</div>
                  <div className="mt-1 text-sm text-gray-600">Basic usage with limited features</div>
                </div>
                <div className="space-y-2 mt-4">
                  <FeatureItem>Browse books and view summaries</FeatureItem>
                  <BlockItem>Barcode and label generator</BlockItem>
                  <BlockItem>No Profile badge on library profile</BlockItem>
                  <FeatureItem>Basic DDC list overview</FeatureItem>
                  <FeatureItem>Usage limits apply and advanced features restricted</FeatureItem>
                  <FeatureItem>Standard support</FeatureItem>
                  <FeatureItem>Library visibility: Private</FeatureItem>
                  <BlockItem>Browse other verified libraries</BlockItem>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => { if (!isVerified) navigate('/EnglishBooks'); }}
                    disabled={isVerified}
                    className={`w-full px-4 py-3 rounded-xl transition ${isVerified ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-[#0C2D57] ring-1 ring-gray-200 hover:bg-gray-50'}`}
                  >
                    {isVerified ? 'Trial Disabled' : 'Continue as Trial'}
                  </button>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-sm">
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 text-xs rounded-full bg-white/80 text-[#0C2D57] ring-1 ring-white/70">{isVerified ? 'Current plan' : 'Best choice'}</span>
                </div>
                <div className="bg-gradient-to-br from-[#1B4B8A] to-[#2E6BAA] p-6 h-full flex flex-col">
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-white/80">VERIFIED PLAN</div>
                    <div className="mt-1 text-2xl font-bold text-white flex">Verified User <span className="ml-2 mt-1"><MdVerified size={20} /></span></div>
                    <div className="mt-1 text-sm text-white/80">Unlock advanced features and a verified badge</div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <FeatureItem dark>Advanced Search and Excel Export</FeatureItem>
                    <FeatureItem dark>Barcode and Label Generator</FeatureItem>
                    <FeatureItem dark>Verified badge on library profile</FeatureItem>
                    <FeatureItem dark>Explore detailed DDC classification</FeatureItem>
                    <FeatureItem dark>Increase data limits and remove usage restrictions</FeatureItem>
                    <FeatureItem dark>Priority support</FeatureItem>
                    <FeatureItem dark>Library visibility: Private or Public for members</FeatureItem>
                    <FeatureItem dark>Browse other verified libraries</FeatureItem>
                  </div>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleVerifyNow}
                      disabled={isVerified || isVerifying || verifySubmitting}
                      className={`w-full px-4 py-3 rounded-xl transition ${
                        isVerified || isVerifying || verifySubmitting
                          ? 'bg-white/30 text-white/80 cursor-not-allowed'
                          : 'bg-white text-[#0C2D57] hover:bg-opacity-90'
                      }`}
                    >
                      {isVerified ? `Verified${verifiedAt ? ' on ' + formatVerifiedDate(verifiedAt) : ''}` : (verifySubmitting ? 'Verifying...' : (isVerifying ? 'Waiting for admin approval...' : 'Verify Now'))}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )
          )}

        </div>
      </div>

      {/* {verifyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (!verifySubmitting) { setVerifyOpen(false); setVerifyError(''); setVerifySuccess(''); setOfficialCode(''); setDocumentFile(null); } }}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Verify Your Library</h2>
            {verifyError && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{verifyError}</div>
            )}
            {verifySuccess && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-green-50 text-green-700 ring-1 ring-green-200">{verifySuccess}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-700">Official Library ID/Code</label>
                <input type="text" value={officialCode} onChange={(e)=>setOfficialCode(e.target.value)} className="mt-1 w-full px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" placeholder="e.g. REG-123456" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Official Document Attachment</label>
                <div className="mt-1 flex items-center gap-3">
                  <input id="verify-doc-input" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e)=>setDocumentFile(e.target.files?.[0] || null)} className="hidden" />
                  <label htmlFor="verify-doc-input" className="text-sm inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-opacity-90 cursor-pointer">
                    <FiUpload size={14} /> Attach Document
                  </label>
                </div>
                <div className="mt-1">
                  {documentFile ? (
                    <div className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{documentFile.name}</div>
                  ) : (
                    <span className="text-xs text-gray-500">No file selected</span>
                  )}
                  {documentFile && (
                    <button type="button" onClick={() => setDocumentFile(null)} className="text-xs px-2 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200">Remove</button>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Accepted: PDF, DOC, DOCX, PNG, JPG. Max 10MB.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => { if (!verifySubmitting) { setVerifyOpen(false); setVerifyError(''); setVerifySuccess(''); } }} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
              <button type="button" onClick={async () => {
                if (verifySubmitting) return;
                setVerifyError('');
                setVerifySuccess('');
                if (!officialCode.trim()) { setVerifyError('Please enter your official library ID/code'); return; }
                if (!documentFile) { setVerifyError('Please attach an official document'); return; }
                if (documentFile && documentFile.size > 10 * 1024 * 1024) { setVerifyError('File size must be <= 10MB'); return; }
                setVerifySubmitting(true);
                try {
                  const res = await libraryService.verifyLibraryAccess(officialCode, documentFile);
                  if (res?.success) {
                    setVerifySuccess(res?.message || 'Submitted for verification. We will notify you once reviewed.');
                    setVerifyOpen(false);
                    setLibraryAccess('Verifying');
                  } else {
                    setVerifyError(res?.message || 'Submission failed');
                  }
                } catch (err) {
                  setVerifyError(err?.message || 'Submission failed');
                } finally {
                  setVerifySubmitting(false);
                }
              }} className="px-4 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-opacity-90">{verifySubmitting ? 'Submitting...' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )} */}

      {verifyResultOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setVerifyResultOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Verification Request</h2>
            {verifyError ? (
              <div className="mb-3 text-red-700">{verifyError}</div>
            ) : (
              <div className="mb-3 text-green-700">{verifySuccess || 'Submitted for verification. We will notify you once reviewed.'}</div>
            )}
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setVerifyResultOpen(false)} className="px-4 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-opacity-90">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryVerify;