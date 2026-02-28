import { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { marcService } from '../../services/marcService';
import { useNavigate } from 'react-router-dom';

export default function ImportBatches() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  const fetchBatches = async (page = pageNumber, q = search) => {
    setLoading(true);
    setError('');
    try {
      const res = await marcService.getBatchList(page, pageSize, q.trim());
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
      setError(e?.message || 'Failed to load batches');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches(1, '');
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:p-8">
          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900">Import Batches</h1>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by file name..."
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                  className="px-3 py-2 rounded-md bg-white ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                />
                <button onClick={() => fetchBatches(1, search)} className="px-4 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-[#1B4B8A]">Search</button>
              </div>
            </div>

            {error && (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{error}</div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">File Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Total</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Success</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Failed</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Imported At</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-600">Loading...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-600">No batches found</td></tr>
                  ) : items.map(b => (
                    <tr key={b.id} className="border-b border-gray-100">
                      <td className="px-4 py-3">{b.fileName}</td>
                      <td className="px-4 py-3">{b.total}</td>
                      <td className="px-4 py-3 text-green-700">{b.success}</td>
                      <td className="px-4 py-3 text-red-700">{b.failed}</td>
                      <td className="px-4 py-3">{b.importedAt ? new Date(b.importedAt).toLocaleString() : ''}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => navigate(`/MARC/Import/Review?batchId=${b.id}`)}
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
    </div>
  );
}