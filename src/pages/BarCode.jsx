import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BarcodePrint from '../components/barcode/BarcodePrint';
import { libraryService } from '../services/libraryService';

const parseBarcodeId = (id) => {
  const s = (id || '').trim();
  if (!s) return { prefix: '', num: NaN, pad: 0 };
  const m = s.match(/^([A-Za-z]+)(\d+)$/);
  if (!m) return { prefix: '', num: NaN, pad: 0 };
  return { prefix: m[1], num: parseInt(m[2], 10), pad: m[2].length };
};

const padNumber = (n, width) => {
  const s = String(n);
  if (s.length >= width) return s;
  return '0'.repeat(width - s.length) + s;
};

const BarcodeTile = ({ code }) => {
  const stripes = useMemo(() => Array.from({ length: 50 }, (_, i) => i), [code]);
  return (
    <div className="barcode-tile">
      <svg className="bars-svg" viewBox="0 0 100 60" preserveAspectRatio="none">
        {stripes.map((i) => (
          <rect key={i} x={i * 2} y={0} width={1} height={60} fill="#000" />
        ))}
      </svg>
      <div className="code">{code}</div>
    </div>
  );
};

const BarCode = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [bookType, setBookType] = useState('English');
  // const [sourceMode, setSourceMode] = useState('Raw'); // 'Raw' or 'Available'
  const [sourceMode, setSourceMode] = useState('Available');
  const [count, setCount] = useState(0);
  const [startCode, setStartCode] = useState('');
  const [availableCodes, setAvailableCodes] = useState([]);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    document.title = 'Barcode Generator';
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    const from = parseBarcodeId(fromId);
    const to = parseBarcodeId(toId);
    if (Number.isNaN(from.num) || Number.isNaN(to.num)) {
      setError('Invalid Barcode ID.');
      return;
    }

    if (sourceMode === 'Available') {
      setGenerating(true);
      setCount(0);
      setStartCode('');
      setAvailableCodes([]);
      try {
        const res = await libraryService.getBarCodeRange(bookType, fromId.trim(), toId.trim());
        if (res?.success) {
          const ids = Array.isArray(res?.data?.result) ? res.data.result : [];
          setAvailableCodes(ids);
          setCount(ids.length);
          setStartCode(ids[0] || '');
          if (!ids.length) setError('No barcodes found in the specified range.');
        } else {
          setError(res?.message || 'Failed to fetch available barcodes');
        }
      } catch (err) {
        setError(err?.message || 'Failed to fetch available barcodes');
      } finally {
        setGenerating(false);
      }
      return;
    }

    const prefix = from.prefix || to.prefix;
    const start = Math.min(from.num, to.num);
    const end = Math.max(from.num, to.num);
    const width = Math.max(from.pad, to.pad);
    setGenerating(true);
    setAvailableCodes([]);
    setCount(0);
    setStartCode('');
    setTimeout(() => {
      setCount(end - start + 1);
      setStartCode(`${prefix}${padNumber(start, width)}`);
      setGenerating(false);
    }, 2000);
  };


  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="no-print flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Barcode Generator</h1>
          </div>

          <form onSubmit={handleGenerate} className="no-print grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
            <div className="flex items-center gap-4 px-4 py-3 bg-white border border-gray-200 rounded-xl">
              {/* <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                <input type="radio" name="bc-source" value="Raw" checked={sourceMode==='Raw'} onChange={(e)=>setSourceMode(e.target.value)} />
                Raw
              </label> */}
              <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                <input type="radio" name="bc-source" value="Available" checked={sourceMode==='Available'} onChange={(e)=>setSourceMode(e.target.value)} />
                Available Books
              </label>
            </div>
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
              {generating ? 'Generating...' : 'Generate Barcodes'}
            </button>
          </form>

          {error && (
            <div className="no-print mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <div className="print-grid">
            {sourceMode === 'Available' ? (
              availableCodes.length > 0 ? (
                <BarcodePrint codes={availableCodes} />
              ) : (
                <div className="no-print flex justify-center items-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-white">
                  <p className="text-gray-500">No barcodes to display.</p>
                </div>
              )
            ) : (
              count > 0 ? (
                <BarcodePrint count={count} startCode={startCode || 'E0000001'} />
              ) : (
                <div className="no-print flex justify-center items-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-white">
                  <p className="text-gray-500">No barcodes to display.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarCode;