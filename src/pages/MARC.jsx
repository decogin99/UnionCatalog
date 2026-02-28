import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { marcService } from '../services/marcService';
import ConfirmDialog from '../components/common/ConfirmDialog';

function StatusBadge({ status }) {
  const map = {
    0: { t: 'Staging', cls: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
    1: { t: 'Added', cls: 'bg-green-50 text-green-700 ring-green-200' },
    2: { t: 'Declined', cls: 'bg-red-50 text-red-700 ring-red-200' },
  }[status ?? 0] || { t: 'Staging', cls: 'bg-yellow-50 text-yellow-700 ring-yellow-200' };
  return <span className={`px-2 py-1 rounded text-xs ring-1 ${map.cls}`}>{map.t}</span>;
}

export default function MARC() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Import panel
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    document.title = 'MARC';
  }, []);
  
  const onFileChange = (e) => {
    setImportError('');
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const onImport = async () => {
    setImportError('');
    setImportResult(null);
    if (!file) {
      setImportError('Please select a .txt file');
      return;
    }
    const name = file.name?.toLowerCase() || '';
    if (!name.endsWith('.txt')) {
      setImportError('Only .txt files are supported');
      return;
    }
    setSubmitting(true);
    try {
      const res = await marcService.uploadBatch(file);
      if(!res?.success) {
        setImportError(
          res?.message
            ? res.message === 'Unauthorized'
              ? 'User unauthorized! Please login again.'
              : res.message
            : 'Fail to import batch');
        return;
      }
      else{
        const r = res?.data?.result ?? res?.result ?? res?.data ?? {};
        setImportResult({
          batchId: r.BatchId ?? r.batchId ?? r.Id ?? r.id ?? '',
          total: r.TotalRecords ?? r.totalRecords ?? 0,
          success: r.SuccessCount ?? r.successCount ?? 0,
          failed: r.FailedCount ?? r.failedCount ?? 0,
        });
        await fetchBatches(1, '');
        setFile(null);
      }
    } catch (e) {
      setImportError(e?.message || 'Failed to import');
    } finally {
      setSubmitting(false);
    }
  };

  // Batches list
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchError, setBatchError] = useState('');
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBatches = async (page = pageNumber, q = search) => {
    setLoading(true);
    setBatchError('');
    try {
      const res = await marcService.getBatchList(page, pageSize, q.trim());
      if(!res?.success) {
        setBatchError(
          res?.message
            ? res.message === 'Unauthorized'
              ? 'User unauthorized! Please login again.'
              : res.message
            : 'Fail to load batches'
        );
        return;
      }
      const r = res?.data?.result ?? res?.result ?? res?.data ?? {};
      const raw = Array.isArray(r.Items) ? r.Items : (Array.isArray(r.items) ? r.items : (Array.isArray(r) ? r : []));
      const list = raw.map(x => ({
        id: x.ImportBatchId ?? x.importBatchId,
        fileName: x.FileName ?? x.fileName ?? '',
        total: x.TotalRecords ?? x.totalRecords ?? 0,
        success: x.SuccessCount ?? x.successCount ?? 0,
        failed: x.FailedCount ?? x.failedCount ?? 0,
        importedAt: x.ImportDate ?? x.importDate ?? '',
      }));
      setItems(list);
      const ti = r.TotalItems ?? r.totalItems ?? list.length;
      const tp = r.TotalPages ?? r.totalPages ?? 1;
      setTotalItems(ti);
      setTotalPages(tp);
      setPageNumber(page);
    } catch (e) {
      setBatchError(e || 'Failed to load batches');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBatches(1, ''); }, []);

  // Review modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewBatchId, setReviewBatchId] = useState(null);
  const openReview = (batchId) => { setReviewBatchId(batchId); setReviewOpen(true); fetchRecords(1, batchId); };
  const closeReview = () => { setReviewOpen(false); setReviewBatchId(null); };

  // Review data
  const [recItems, setRecItems] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [status, setStatus] = useState(3);
  const [recPageNumber, setRecPageNumber] = useState(1);
  const [recPageSize] = useState(10);
  const [recTotalItems, setRecTotalItems] = useState(0);
  const [recTotalPages, setRecTotalPages] = useState(0);
  const [selectedRecIds, setSelectedRecIds] = useState(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkTargetType, setBulkTargetType] = useState('English');
  const [bulkApproving, setBulkApproving] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkShowErrors, setBulkShowErrors] = useState(false);

  const fetchRecords = async (page = recPageNumber, bid = reviewBatchId) => {
    if (!bid) return;
    setRecLoading(true);
    setRecError('');
    try {
      const res = await marcService.getBibliographicList({
        batchId: bid,
        pageNumber: page,
        pageSize: recPageSize,
        title: searchTitle.trim(),
        author: searchAuthor.trim(),
        status
      });
      const r = res?.data?.result ?? res?.result ?? res?.data ?? {};
      const raw = Array.isArray(r.Items) ? r.Items : (Array.isArray(r.items) ? r.items : (Array.isArray(r) ? r : []));
      const list = raw.map(x => ({
        id: x.Id ?? x.id,
        barcodeNo: x.BarcodeNo ?? x.barcodeNo ?? '',
        accessionNo: x.AccessionNo ?? x.accessionNo ?? '',
        classNo: x.ClassNo ?? x.classNo ?? '',
        author: x.Author ?? x.author ?? '',
        title: x.Title ?? x.title ?? '',
        place: x.Place ?? x.place ?? '',
        publisher: x.Publisher ?? x.publisher ?? '',
        year: x.Year ?? x.year ?? '',
        subjectHeadings: x.SubjectHeadings ?? x.subjectHeadings ?? '',
        status: x.Status ?? x.status ?? 0,
        targetBookType: x.targetBookType ?? x.targetBookType ?? 0,
      }));
      setRecItems(list);
      const ti = r.TotalItems ?? r.totalItems ?? list.length;
      const tp = r.TotalPages ?? r.totalPages ?? 1;
      setRecTotalItems(ti);
      setRecTotalPages(tp);
      setRecPageNumber(page);
      setSelectedRecIds(new Set());
    } catch (e) {
      setRecError(e?.message || 'Failed to load records');
      setRecItems([]);
    } finally {
      setRecLoading(false);
    }
  };

  // Approve / Reject
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveId, setApproveId] = useState(null);
  const [targetBookType, setTargetBookType] = useState('English');
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState('');
  const openApprove = (id) => { setApproveId(id); setApproveOpen(true); };
  const closeApprove = () => { setApproveOpen(false); setApproveId(null); setTargetBookType('English'); };

  const confirmApprove = async () => {
    if (!approveId) return;
    setApproving(true);
    setApproveError('');
    try {
      const res = await marcService.approveBibliographic(approveId, targetBookType);
      if(res.success){
        setApproveError('');
        await fetchRecords(recPageNumber);
        closeApprove();
      } else {
        setApproveError(res.Message ?? res.message ?? 'Failed to approve');
      }
    } catch (e) {
      setApproveError(e?.message || 'Failed to approve');
    } finally {
      setApproving(false);
    }
  };

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const openReject = (id) => { setRejectId(id); setRejectOpen(true); };
  const closeReject = () => { setRejectOpen(false); setRejectId(null); };

  const confirmReject = async () => {
    if (!rejectId) return;
    setRejecting(true);
    try {
      await marcService.rejectBibliographic(rejectId);
      await fetchRecords(recPageNumber);
      closeReject();
    } catch (e) {
      setRecError(e?.message || 'Failed to reject');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3 sm:mb-2">
            <h1 className="text-1xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">MARC</h1>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
              <button
                onClick={() => setImportOpen(true)}
                className="px-4 py-2 bg-[#2E6BAA] hover:bg-[#1B4B8A] text-white rounded-md hover:bg-opacity-90 transition-colors duration-200"
              >
                Import
              </button>
            </div>
          </div>

          {/* Batches */}
          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
            <div className="flex flex-wrap sm:w-auto items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Import History (Batches)</h2>
              <div className="flex gap-2 sm:w-auto w-full">
                <input
                  type="text"
                  placeholder="Search by file name..."
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                  className="flex-1 w-full sm:w-96 px-3 py-2 bg-white rounded-md ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                />
                <button onClick={() => fetchBatches(1, search)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Search</button>
              </div>
            </div>

            {batchError && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{batchError}</div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">File Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Book</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Success</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Failed</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Imported At</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-600">
                        <div className="flex justify-center items-center h-10">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2E6BAA]"></div>
                        </div>
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-600">No import history</td></tr>
                  ) : items.map(b => (
                    <tr key={b.id} className="border-b border-gray-100">
                      <td className="px-4 py-3">{b.fileName}</td>
                      <td className="px-4 py-3">{b.total}</td>
                      <td className="px-4 py-3 text-green-700">{b.success}</td>
                      <td className="px-4 py-3 text-red-700">{b.failed}</td>
                      <td className="px-4 py-3">{b.importedAt ? new Date(b.importedAt).toLocaleString() : ''}</td>
                      <td className="px-2 py-3 text-right">
                        <button
                          onClick={() => openReview(b.id)}
                          className="px-3 py-1 text-sm rounded-md border border-[#2E6BAA] text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white"
                        >
                          View Records
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">Page {pageNumber} of {totalPages} • {totalItems} total</div>
              <div className="flex gap-2">
                <button
                  onClick={() => { if (pageNumber > 1) fetchBatches(pageNumber - 1, search); }}
                  disabled={pageNumber <= 1 || loading}
                  className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => { if (pageNumber < totalPages) fetchBatches(pageNumber + 1, search); }}
                  disabled={pageNumber >= totalPages || loading}
                  className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => {setImportOpen(false), setImportError(''), setFile(null)}}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Import MARC</h2>
              <button onClick={() => {setImportOpen(false), setImportError(''), setFile(null)}} className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Close</button>
            </div>
            {importError && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{importError}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Upload File (.txt)</label>
                <input type="file" accept=".txt" onChange={onFileChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={onImport}
                  disabled={submitting}
                  className={`px-4 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-[#1B4B8A] ${submitting ? 'opacity-60' : ''}`}
                >
                  {submitting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
            {importResult && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {/* <div className="rounded-xl p-3 ring-1 ring-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-500">Batch Id</div>
                  <div className="text-sm text-gray-800 truncate">{importResult.batchId}</div>
                </div> */}
                <div className="rounded-xl p-3 ring-1 ring-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-500">Total Book</div>
                  <div className="text-lg font-semibold text-gray-900">{importResult.total}</div>
                </div>
                <div className="rounded-xl p-3 ring-1 ring-gray-200 bg-green-50">
                  <div className="text-xs text-gray-600">Success</div>
                  <div className="text-lg font-semibold text-green-700">{importResult.success}</div>
                </div>
                <div className="rounded-xl p-3 ring-1 ring-gray-200 bg-red-50">
                  <div className="text-xs text-gray-600">Failed</div>
                  <div className="text-lg font-semibold text-red-700">{importResult.failed}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeReview}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-[95%] max-w-7xl p-6 ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Review Records</h2>
              <button onClick={closeReview} className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Close</button>
            </div>

            <div className="flex justify-end gap-2 mb-4">
              <input
                type="text"
                placeholder="Search title..."
                value={searchTitle}
                onChange={(e)=>setSearchTitle(e.target.value)}
                className="px-3 py-2 w-full rounded-md bg-white ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
              />
              <input
                type="text"
                placeholder="Search author..."
                value={searchAuthor}
                onChange={(e)=>setSearchAuthor(e.target.value)}
                className="px-3 py-2 w-full rounded-md bg-white ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
              />
              <select
                value={status}
                onChange={(e)=>setStatus(parseInt(e.target.value, 10))}
                className="px-3 py-2 rounded-md bg-white ring-1 ring-gray-200"
              >
                <option value={0}>Staging</option>
                <option value={1}>Added</option>
                <option value={2}>Declined</option>
                <option value={3}>All</option>
              </select>
              <button onClick={() => fetchRecords(1)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Search</button>
            </div>

            {recError && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{recError}</div>
            )}

            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-2">
                <button type="button" onClick={() => setSelectedRecIds(new Set(recItems.filter(r => r.status === 0).map(r => r.id)))} className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Select All</button>
                <button type="button" onClick={() => setSelectedRecIds(new Set())} className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Clear</button>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={selectedRecIds.size===0} onClick={() => { setBulkTargetType('English'); setBulkConfirmOpen(true); }} className="px-3 py-1 rounded border border-green-600 text-green-700 hover:bg-green-600 hover:text-white disabled:opacity-50">Add to English</button>
                <button type="button" disabled={selectedRecIds.size===0} onClick={() => { setBulkTargetType('Myanmar'); setBulkConfirmOpen(true); }} className="px-3 py-1 rounded border border-green-600 text-green-700 hover:bg-green-600 hover:text-white disabled:opacity-50">Add to Myanmar</button>
              </div>
            </div>

            {bulkResult && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm ring-1 bg-green-50 text-green-800 ring-green-200">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="ml-2">Added : {bulkResult.totalAdded ?? bulkResult.totalAdded ?? 0}</span>
                    <span className="ml-2 text-green-700">Success : {bulkResult.SuccessCount ?? bulkResult.successCount ?? 0}</span>
                    <span className="ml-2 text-red-700">Failed : {bulkResult.FailedCount ?? bulkResult.failedCount ?? 0}</span>
                  </div>
                  <div className="flex gap-2">
                    {(Array.isArray(bulkResult.Errors ?? bulkResult.errors) && ((bulkResult.Errors?.length ?? bulkResult.errors?.length ?? 0) > 0)) && (
                      <button type="button" onClick={() => setBulkShowErrors(v => !v)} className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">{bulkShowErrors ? 'Hide errors' : 'Show errors'}</button>
                    )}
                    <button type="button" onClick={() => { setBulkResult(null); setBulkShowErrors(false); }} className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Dismiss</button>
                  </div>
                </div>
                {bulkShowErrors && (
                  <ul className="mt-2 list-disc pl-5 text-red-700">
                    {(bulkResult.Errors ?? bulkResult.errors ?? []).map((e, i) => (
                      <li key={i} className="break-words">{String(e)}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 w-8"></th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-24">Accession No</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Author</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Place</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Publisher</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-20">Year</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Subject Headings</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-28">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recLoading ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-center text-gray-600">
                        <div className="flex justify-center items-center h-10">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2E6BAA]"></div>
                        </div>
                      </td>
                    </tr>
                  ) : recItems.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-600">No records found</td></tr>
                  ) : recItems.map(r => (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="px-4 py-3 w-8">
                        <input type="checkbox" className={`cursor-pointer ${r.status !== 0 ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={r.status !== 0} checked={selectedRecIds.has(r.id)} onChange={(e)=> setSelectedRecIds(prev => { const next = new Set(prev); if (e.target.checked) next.add(r.id); else next.delete(r.id); return next; })} />
                      </td>
                      <td className="px-4 py-3">{r.accessionNo}</td>
                      <td className="px-4 py-3">{r.title}</td>
                      <td className="px-4 py-3">{r.author}</td>
                      <td className="px-4 py-3">{r.place}</td>
                      <td className="px-4 py-3">{r.publisher}</td>
                      <td className="px-4 py-3">{r.year}</td>
                      <td className="px-4 py-3">{r.subjectHeadings}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-2 py-3 text-end">
                        {r.status === 0 && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => openApprove(r.id)}
                              className="px-3 py-1 text-xs rounded-md border border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => openReject(r.id)}
                              className="px-3 py-1 text-xs rounded-md border border-red-600 text-red-700 hover:bg-red-600 hover:text-white ml-2"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {r.status === 1 &&(
                          <span className={`px-2 py-1 rounded text-xs ring-1 bg-green-50 text-green-700 ring-green-200`}>{r.targetBookType}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">Page {recPageNumber} of {recTotalPages} • {recTotalItems} total</div>
              <div className="flex gap-2">
                <button
                  onClick={() => { if (recPageNumber > 1) fetchRecords(recPageNumber - 1); }}
                  disabled={recPageNumber <= 1 || recLoading}
                  className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => { if (recPageNumber < recTotalPages) fetchRecords(recPageNumber + 1); }}
                  disabled={recPageNumber >= recTotalPages || recLoading}
                  className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {approveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeApprove}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Select Book Type</h2>
            {approveError && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{approveError}</div>
            )}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="tc" value="English" checked={targetBookType==='English'} onChange={()=>setTargetBookType('English')} />
                <span>English</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="tc" value="Myanmar" checked={targetBookType==='Myanmar'} onChange={()=>setTargetBookType('Myanmar')} />
                <span>Myanmar</span>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>{closeApprove(); setApproveError('')}} className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
              <button onClick={confirmApprove} disabled={approving} className={`px-3 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-[#1B4B8A] ${approving?'opacity-60':''}`}>{approving ? 'Adding...' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={bulkConfirmOpen}
        title={`Add Selected book(s) to ${bulkTargetType}`}
        message={`Are you sure you want to add ${selectedRecIds.size} selected record(s) to ${bulkTargetType}?`}
        confirmText={bulkApproving ? 'Adding...' : 'Add'}
        cancelText="Cancel"
        onCancel={() => setBulkConfirmOpen(false)}
        onConfirm={async () => {
          if (selectedRecIds.size === 0 || bulkApproving) return;
          setBulkApproving(true);
          try {
            const ids = Array.from(selectedRecIds);
            const res = await marcService.approveBibliographicBulk(ids, bulkTargetType);
            const r = res?.data?.result ?? res?.result ?? res?.data ?? null;
            if (r) { setBulkResult(r); setBulkShowErrors(false); }
            setBulkConfirmOpen(false);
            setSelectedRecIds(new Set());
            await fetchRecords(recPageNumber);
          } catch (e) {
            setRecError(e?.message || 'Failed to approve selected');
          } finally { setBulkApproving(false); }
        }}
      />

      <ConfirmDialog
        open={rejectOpen}
        title="Reject Record"
        message="Are you sure you want to reject this record?"
        confirmText={rejecting ? 'Rejecting...' : 'Reject'}
        cancelText="Cancel"
        variant="danger"
        onCancel={closeReject}
        onConfirm={confirmReject}
      />
    </div>
  );
}