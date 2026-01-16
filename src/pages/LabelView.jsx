import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { libraryService } from '../services/libraryService';
import LabelPrint from '../components/label/LabelPrint';

const LabelView = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookType, setBookType] = useState('English');
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    document.title = 'Label Generator';
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setGenerating(true);
    setLabels([]);
    const s = (str) => (str || '').trim();
    const from = s(fromId);
    const to = s(toId);
    const valid = /^[A-Za-z]+\d+$/.test(from) && /^[A-Za-z]+\d+$/.test(to);
    if (!valid) {
      setGenerating(false);
      setError('Invalid Barcode ID.');
      return;
    }
    try {
      const res = await libraryService.getLabelRange(bookType, from, to);
      if (res?.success) {
        const list = Array.isArray(res?.data?.result) ? res.data.result : (Array.isArray(res?.data) ? res.data : []);
        setLabels(list);
        if (!list.length) setError('No labels found in the specified range.');
      } else {
        setError(res?.message || 'Failed to fetch labels');
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch labels');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Label Generator</h1>
          </div>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
            <select
              value={bookType}
              onChange={(e) => setBookType(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
            >
              <option value="English">English</option>
              <option value="Myanmar">Myanmar</option>
            </select>
            <input
              type="text"
              placeholder="From BarcodeID (e.g E0000001)"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
            />
            <input
              type="text"
              placeholder="To BarcodeID (e.g E0000040)"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
            />
            <button
                type="submit"
                disabled={generating}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                {generating ? 'Generating...' : 'Generate Labels'}
              </button>
          </form>

          {error && (
            <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          {labels.length > 0 ? (
            <LabelPrint labels={labels} />
          ) : (
            <div className="no-print flex justify-center items-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-white">
              <p className="text-gray-500">No labels to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabelView;