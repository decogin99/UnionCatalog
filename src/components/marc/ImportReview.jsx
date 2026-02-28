import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { marcService } from '../../services/marcService';
import ConfirmDialog from '../../components/common/ConfirmDialog';

function StatusBadge({ status }) {
  const map = {
    0: { t: 'Pending', cls: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
    1: { t: 'Approved', cls: 'bg-green-50 text-green-700 ring-green-200' },
    2: { t: 'Rejected', cls: 'bg-red-50 text-red-700 ring-red-200' },
  }[status ?? 0] || { t: 'Pending', cls: 'bg-yellow-50 text-yellow-700 ring-yellow-200' };
  return <span className={`px-2 py-1 rounded text-xs ring-1 ${map.cls}`}>{map.t}</span>;
}

export default function ImportReview() {
  const location = useLocation();
  const sp = new URLSearchParams(location.search);
  const batchId = sp.get('batchId') || '';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [status, setStatus] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [approveOpen, setApproveOpen] = useState(false);
  const [approveId, setApproveId] = useState(null);
  const [targetCategory, setTargetCategory] = useState('English');
  const [approving, setApproving] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  const fetchRecords = async (page = pageNumber) => {
    setLoading(true);
    setError('');
    try {
      const res = await marcService.getBibliographicList({
        batchId,
        pageNumber: page,
        pageSize,
        title: searchTitle.trim(),
        author: searchAuthor.trim(),
        status
      });
      const r = res?.data?.result ?? res?.result ?? res?.data ?? {};
      const raw = Array.isArray(r.Items) ? r.Items : (Array.isArray(r.items) ? r.items : (Array.isArray(r) ? r : []));
      const list = raw.map(x => ({
        id: x.Id ?? x.id,
        controlNo: x.ControlNo ?? x.controlNo ?? '',
        classNo: x.ClassNo ?? x.classNo ?? '',
        author: x.Author ?? x.author ?? '',
        title: x.Title ?? x.title ?? '',
        statement: x.Statement ?? x.statement ?? '',
        place: x.Place ?? x.place ?? '',
        publisher: x.Publisher ?? x.publisher ?? '',
        year: x.Year ?? x.year ?? '',
        description: x.Description ?? x.description ?? '',
        subject: x.Subject ?? x.subject ?? '',
        accessionNo: x.AccessionNo ?? x.accessionNo ?? '',
        status: x.Status ?? x.status ?? 0,
        targetCategory: x.TargetCategory ?? x.targetCategory ?? 0,
      }));
      setItems(list);
      const ti = r.TotalItems ?? r.totalItems ?? list.length;
      const tp = r.TotalPages ?? r.totalPages ?? 1;
      setTotalItems(ti);
      setTotalPages(tp);
      setPageNumber(page);
    } catch (e) {
      setError(e?.message || 'Failed to load records');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) fetchRecords(1);
  }, [batchId]);

  const openApprove = (id) => { setApproveId(id); setApproveOpen(true); };
  const closeApprove = () => { setApproveOpen(false); setApproveId(null); setTargetCategory('English'); };

  const confirmApprove = async () => {
    if (!approveId) return;
    setApproving(true);
    try {
      const category = targetCategory === 'English' ? 1 : 2;
      await marcService.approveBibliographic(approveId, category);
      await fetchRecords(pageNumber);
      closeApprove();
    } catch (e) {
      setError(e?.message || 'Failed to approve');
    } finally {
      setApproving(false);
    }
  };

  const openReject = (id) => { setRejectId(id); setRejectOpen(true); };
  const closeReject = () => { setRejectOpen(false); setRejectId(null); };

  const confirmReject = async () => {
    if (!rejectId) return;
    setRejecting(true);
    try {
      await marcService.rejectBibliographic(rejectId);
      await fetchRecords(pageNumber);
      closeReject();
    } catch (e) {
      setError(e?.message || 'Failed to reject');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:p-8">
          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900">Review Records</h1>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search title..."
                  value={searchTitle}
                  onChange={(e)=>setSearchTitle(e.target.value)}
                  className="px-3 py-2 rounded-md bg-white ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                />
                <input
                  type="text"
                  placeholder="Search author..."
                  value={searchAuthor}
                  onChange={(e)=>setSearchAuthor(e.target.value)}
                  className="px-3 py-2 rounded-md bg-white ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                />
                <select
                  value={status}
                  onChange={(e)=>setStatus(parseInt(e.target.value, 10))}
                  className="px-3 py-2 rounded-md bg-white ring-1 ring-gray-200"
                >
                  <option value={0}>Pending</option>
                  <option value={1}>Approved</option>
                  <option value={2}>Rejected</option>
                </select>
                <button onClick={() => fetchRecords(1)} className="px-4 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-[#1B4B8A]">Apply</button>
              </div>
            </div>

            {error && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{error}</div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-24">Control No</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Author</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-20">Year</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-28">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-600">Loading...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-600">No records found</td></tr>
                  ) : items.map(r => (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="px-4 py-3">{r.controlNo}</td>
                      <td className="px-4 py-3">{r.title}</td>
                      <td className="px-4 py-3">{r.author}</td>
                      <td className="px-4 py-3">{r.year}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openApprove(r.id)}
                          disabled={r.status !== 0}
                          className="px-3 py-1 text-sm rounded-md border border-green-600 text-green-700 hover:bg-green-600 hover:text-white disabled:opacity-50 mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openReject(r.id)}
                          disabled={r.status !== 0}
                          className="px-3 py-1 text-sm rounded-md border border-red-600 text-red-700 hover:bg-red-600 hover:text-white disabled:opacity-50"
                        >
                          Reject
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
                  onClick={() => { if (pageNumber > 1) fetchRecords(pageNumber - 1); }}
                  disabled={pageNumber <= 1 || loading}
                  className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => { if (pageNumber < totalPages) fetchRecords(pageNumber + 1); }}
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

      {approveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeApprove}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Choose Target Category</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="tc" value="English" checked={targetCategory==='English'} onChange={(e)=>setTargetCategory(e.target.value)} />
                <span>English</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="tc" value="Myanmar" checked={targetCategory==='Myanmar'} onChange={(e)=>setTargetCategory(e.target.value)} />
                <span>Myanmar</span>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeApprove} className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
              <button onClick={confirmApprove} disabled={approving} className={`px-3 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-[#1B4B8A] ${approving?'opacity-60':''}`}>{approving ? 'Approving...' : 'Approve'}</button>
            </div>
          </div>
        </div>
      )}

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