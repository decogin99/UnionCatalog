import { useState } from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { marcService } from '../../services/marcService';

export default function ImportMARC() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const onFileChange = (e) => {
    setError('');
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const onImport = async () => {
    setError('');
    setResult(null);
    if (!file) {
      setError('Please select a .txt file');
      return;
    }
    const name = file.name?.toLowerCase() || '';
    if (!name.endsWith('.txt')) {
      setError('Only .txt files are supported');
      return;
    }
    setSubmitting(true);
    try {
      const res = await marcService.uploadBatch(file);
      const r = res?.data?.result ?? res?.result ?? res?.data ?? {};
      if(res.success){
        setResult({
          batchId: r.BatchId ?? r.batchId ?? r.Id ?? r.id ?? '',
          total: r.TotalRecords ?? r.totalRecords ?? 0,
          success: r.SuccessCount ?? r.successCount ?? 0,
          failed: r.FailedCount ?? r.failedCount ?? 0,
        });
      } else {
        setError(r.Message ?? r.message ?? 'Failed to import');
      }
    } catch (e) {
      setError(e?.message || 'Failed to import');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-4">MARC Import</h1>

            {error && (
              <div className="mb-4 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Upload File (.txt)</label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={onFileChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={onImport}
                  disabled={submitting || !file}
                  className={`px-4 py-2 rounded-md bg-[#2E6BAA] text-white hover:bg-[#1B4B8A] ${submitting ? 'opacity-60' : ''}`}
                >
                  {submitting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>

            {result && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                {/* <div className="rounded-xl p-4 ring-1 ring-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-500">Batch Id</div>
                  <div className="text-sm text-gray-800 truncate">{result.batchId}</div>
                </div> */}
                <div className="rounded-xl p-4 ring-1 ring-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-500">Total Records</div>
                  <div className="text-lg font-semibold text-gray-900">{result.total}</div>
                </div>
                <div className="rounded-xl p-4 ring-1 ring-gray-200 bg-green-50">
                  <div className="text-xs text-gray-600">Success</div>
                  <div className="text-lg font-semibold text-green-700">{result.success}</div>
                </div>
                <div className="rounded-xl p-4 ring-1 ring-gray-200 bg-red-50">
                  <div className="text-xs text-gray-600">Failed</div>
                  <div className="text-lg font-semibold text-red-700">{result.failed}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}