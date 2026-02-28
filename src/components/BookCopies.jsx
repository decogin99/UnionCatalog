import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { bookService } from '../services/bookService';

export default function BookCopies({
  open = false,
  book = null,
  showAdminActions = false,
  onClose,
  onCopiesChanged
}) {
  const location = useLocation();
  const bookType = location.pathname.includes('English') ? 'English' : 'Myanmar';
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState('');
  const [delSubmittingId, setDelSubmittingId] = useState(null);
  const [delError, setDelError] = useState('');
  
  const [editId, setEditId] = useState(null);
  const [editAccessionNo, setEditAccessionNo] = useState('');
  const [editBarcodeNo, setEditBarcodeNo] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (!open) return;
    fetchBookCopy(book, { showLoading: true });
  }, [open, book?.bookId, bookType]);

  const fetchBookCopy = async (book, opts = {}) => {
    const { showLoading = true } = opts;
    if (!book?.bookId) {
      setCopies([]);
      setError('Missing bookId');
      return [];
    }
    if (showLoading) setLoading(true);
    setError('');
    try {
      const res = await bookService.getBookCopyList(book.bookId, bookType);
      const raw = res?.data?.result ?? res?.result ?? res?.data ?? [];
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw.items) ? raw.items : (Array.isArray(raw.Items) ? raw.Items : []));
      const normalized = list.map(copy => ({
        bookId: copy.bookId ?? copy.BookId ?? '',
        bookCopyId: copy.bookCopyId ?? copy.BookCopyId ?? '',
        accessionNo: copy.accessionNo ?? copy.AccessionNo ?? '',
        barcodeNo: copy.barcodeNo ?? copy.BarcodeNo ?? '',
        callNo: copy.callNo ?? copy.CallNo ?? '',
        status: copy.status ?? copy.Status ?? ''
      }));
      setCopies(normalized);
      return normalized;
    } catch (err) {
      setError(err?.message || (typeof err === 'string' ? err : 'Failed to load book copies'));
      return [];
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleAddCopy = async (book) => {
    if (!book?.bookId) return;
    setAddError('');
    setAddSubmitting(true);
    try {
      const res = await bookService.addBookCopy(book.bookId, bookType);
      if (res?.success === false) {
        setAddError(res?.message || 'Failed to add copy');
      } else {
        const updated = await fetchBookCopy(book, { showLoading: false });
        if (onCopiesChanged) onCopiesChanged(book.bookId, updated.length);
      }
    } catch (err) {
      setAddError(err?.message || (typeof err === 'string' ? err : 'Failed to add copy'));
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleEditCopy = (book, copy) => {
    setEditError('');
    const id = copy.bookCopyId || copy.BookCopyId;
    setEditId(id);
    setEditAccessionNo(copy.accessionNo || copy.AccessionNo || '');
    setEditBarcodeNo(copy.barcodeNo || copy.BarcodeNo || '');
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditAccessionNo('');
    setEditBarcodeNo('');
    setEditSubmitting(false);
    setEditError('');
  };

  const handleSaveEdit = async (book, copy) => {
    if (!editId) return;
    setEditError('');
    const acc = Number.parseInt(editAccessionNo, 10);
    if (Number.isNaN(acc)) {
      setEditError('Accession No must be a number');
      return;
    }
    setEditSubmitting(true);
    try {
      const cid = copy.bookCopyId || copy.BookCopyId;
      const res = await bookService.editBookCopy(cid, book.bookId, bookType, acc, editBarcodeNo);
      if (res?.success === false) {
        setEditError(res?.message || 'Failed to save changes');
      } else {
        await fetchBookCopy(book, { showLoading: false });
        setEditId(null);
        setEditAccessionNo('');
        setEditBarcodeNo('');
      }
    } catch (e) {
      setEditError(e?.message || 'Failed to save changes');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteCopy = async (book, copy) => {
    if (!book?.bookId || !copy?.bookCopyId) return;
    setDelError('');
    setDelSubmittingId(copy.bookCopyId);
    try {
      const res = await bookService.deleteBookCopy(copy.bookCopyId, bookType);
      if (res?.success === false) {
        setDelError(res?.message || 'Failed to delete copy');
      } else {
        const updated = await fetchBookCopy(book, { showLoading: false });
        if (onCopiesChanged) onCopiesChanged(book.bookId, updated.length);
      }
    } catch (err) {
      setDelError(err?.message || (typeof err === 'string' ? err : 'Failed to delete copy'));
    } finally {
      setDelSubmittingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 ring-1 ring-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Copies • {book?.title || 'Book'}</h2>
          <button onClick={onClose} className="px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Close</button>
        </div>

        {(addError || delError || editError) && (
          <div className="mb-2 rounded-xl px-3 py-2 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{addError || delError || editError}</div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Accession No</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Barcode No</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Call No</th>
                {/* <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th> */}
                {showAdminActions && (
                  <th className="px-3 py-2 text-right font-semibold text-gray-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr><td colSpan={showAdminActions ? 5 : 4} className="px-3 py-2 text-red-700 bg-red-50 ring-1 ring-red-200">{error}</td></tr>
              ) : loading ? (
                <tr>
                  <td colSpan={showAdminActions ? 5 : 4} className="px-3 py-2 text-gray-600">
                    <div className="flex justify-center items-center mt-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2E6BAA]"></div>
                    </div>
                  </td>
                </tr>
              ) : copies.length === 0 ? (
                <tr><td colSpan={showAdminActions ? 5 : 4} className="px-3 py-2 text-gray-600">No copies found</td></tr>
              ) : (
                copies.map((c, i) => {
                  const cid = c.bookCopyId || c.BookCopyId;
                  const editing = editId === cid;
                  return (
                    <tr key={cid || i} className="border-b border-gray-100">
                      <td className="px-3 py-2">
                        {editing ? (
                          <input type="text" value={editAccessionNo} onChange={(e)=>setEditAccessionNo(e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded" />
                        ) : (
                          c.accessionNo
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {editing ? (
                          <input type="text" value={editBarcodeNo} onChange={(e)=>setEditBarcodeNo(e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded" />
                        ) : (
                          c.barcodeNo
                        )}
                      </td>
                      <td className="px-3 py-2">{c.callNo}</td>
                      {/* <td className="px-3 py-2">{c.status}</td> */}
                      {showAdminActions && (
                        <td className="px-2 py-2 text-right">
                          {editing ? (
                            <>
                              <button onClick={() => handleSaveEdit(book, c)} disabled={editSubmitting} className={`px-2 py-1 text-xs rounded-md border border-green-600 text-green-600 hover:bg-green-600 hover:text-white mr-1 ${editSubmitting ? 'opacity-60' : ''}`}>{editSubmitting ? 'Saving...' : 'Save'}</button>
                              <button onClick={handleCancelEdit} disabled={editSubmitting} className="px-2 py-1 text-xs rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditCopy(book, c)} className="px-2 py-1 text-xs rounded-md border border-[#2E6BAA] text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white mr-1">Edit</button>
                              <button onClick={() => handleDeleteCopy(book, c)} disabled={delSubmittingId === cid} className={`relative px-2 py-1 text-xs rounded-md border border-red-600 text-red-600 hover:bg-red-600 hover:text-white ${delSubmittingId === cid ? 'opacity-60' : ''}`}>
                                {delSubmittingId === cid && (
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                                    </svg>
                                  </span>
                                )}
                                <span className={delSubmittingId === cid ? 'opacity-0' : ''}>Delete</span>
                              </button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {showAdminActions && !loading && (
          <div className="flex justify-between mt-4">
            {/* <button
              className="px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white"
            >
              Generate Barcodes
            </button> */}
            <button
              onClick={() => handleAddCopy(book)}
              disabled={addSubmitting}
              className={`px-3 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-[#1B4B8A] ${addSubmitting ? 'opacity-60' : ''}`}
            >
              {addSubmitting ? 'Adding...' : 'Add Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}