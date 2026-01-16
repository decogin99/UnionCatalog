import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { libraryService } from '../services/libraryService';


const DDCView = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [currentDdc, setCurrentDdc] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    document.title = 'DDC View';
  }, []);

  useEffect(() => {
    let mounted = true;
    setError('');
    setIsLoading(true);
    (async () => {
      try {
        const res = await libraryService.getDDCCodes(currentDdc);
        if (res?.success) {
          const list = Array.isArray(res?.data?.result) ? res.data.result : (Array.isArray(res?.data) ? res.data : []);
          if (mounted) setRows(list);
        } else {
          if (mounted) setError(res?.message || 'Failed to load DDC codes');
        }
      } catch (err) {
        if (mounted) setError(err?.message || 'Failed to load DDC codes');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [currentDdc]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      setError('');
      const res = await libraryService.getDDCCodes(currentDdc);
      if (res?.success) {
        const list = Array.isArray(res?.data?.result) ? res.data.result : (Array.isArray(res?.data) ? res.data : []);
        setRows(list);
      } else {
        setError(res?.message || 'Failed to load DDC codes');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load DDC codes');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Dewey Decimal Classification (DDC) View</h1>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200 flex items-center justify-between mb-5">
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
          )}

          <div className="rounded-xl bg-white ring-1 ring-white/60 shadow-sm">
            {currentDdc && (
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="text-sm text-gray-700">Viewing: {currentDdc}</div>
                <button onClick={() => setCurrentDdc(null)} className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200">Back to 000–900</button>
              </div>
            )}
            <div className={`overflow-x-auto ${!currentDdc && 'rounded-xl'}`}>
              <table className="min-w-[800px] w-full text-sm">
                <thead className="bg-gradient-to-r from-[#dbeeff] to-[#bfe0f7]">
                  <tr className="text-[#0C2D57]">
                    <th className="p-5 text-left font-semibold">DDC Class</th>
                    <th className="p-5 text-left font-semibold">Description/Meaning</th>
                    <th className="p-5 text-right font-semibold">In English</th>
                    <th className="p-5 text-right font-semibold">In Myanmar</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="p-8">
                        <div className="flex justify-center items-center h-24">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((item) => {
                      const cls = item.ddcCode;
                      const desc = item.englishDescription + ' / ' + item.myanmarDescription;
                      const enCount = item.englishBookCount ?? 0;
                      const mmCount = item.myanmarBookCount ?? 0;
                      const topClickable = /^\d{3}$/.test(String(cls)) && String(cls).endsWith('00');
                      return (
                        <tr key={cls}
                            className="border-t border-white/40 hover:bg-gray-100 cursor-pointer"
                            onClick={() => { if (topClickable) setCurrentDdc(String(cls).trim()); }}
                            title={topClickable ? 'Drill down' : undefined}
                        >
                          <td
                            className={`p-5 font-semibold text-gray-800 ${topClickable ? 'cursor-pointer text-[#0C2D57]' : ''}`}
                            onClick={() => { if (topClickable) setCurrentDdc(String(cls).trim()); }}
                            title={topClickable ? 'Drill down' : undefined}
                          >
                            {cls}
                          </td>
                          <td className="p-5 text-gray-800">{desc}</td>
                          <td className="p-5 text-right text-gray-900">{Number(enCount).toLocaleString()}</td>
                          <td className="p-5 text-right text-gray-900">{Number(mmCount).toLocaleString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DDCView;