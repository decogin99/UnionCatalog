import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BarcodePrint from '../components/barcode/BarcodePrint';
import Barcode from 'react-barcode';
import { useAuth } from "../context/AuthProvider.jsx";
import { libraryService } from '../services/libraryService';
import FreeUsageDialog from '../components/common/FreeUsageDialog';

// const parseBarcodeId = (id) => {
//   const s = (id || '').trim();
//   if (!s) return { prefix: '', num: NaN, pad: 0 };
//   const m = s.match(/^([A-Za-z]+)(\d+)$/);
//   if (!m) return { prefix: '', num: NaN, pad: 0 };
//   return { prefix: m[1], num: parseInt(m[2], 10), pad: m[2].length };
// };

// const padNumber = (n, width) => {
//   const s = String(n);
//   if (s.length >= width) return s;
//   return '0'.repeat(width - s.length) + s;
// };

const BarCode = () => {

  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [freePromptOpen, setFreePromptOpen] = useState(false);
  const [bookType, setBookType] = useState('English');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableCodes, setAvailableCodes] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [printCodes, setPrintCodes] = useState([]);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    document.title = 'Barcode Generator';
  }, []);

  useEffect(() => {
    fetchBarcodeList();
  }, [bookType]);

  const fetchBarcodeList = async () => {
    setLoading(true);
    setError('');
    setAvailableCodes([]);
    setSelectedCodes([]);
    setPrintCodes([]);
    try {
      const res = await libraryService.getBarcodeList(bookType);
      if (res?.success) {
        const r = res?.data?.result ?? res?.result ?? res?.data ?? [];
        const list = Array.isArray(r) ? r.map(x => String(x)) : [];
        setAvailableCodes(list);
      }
      else{
        setError(
          res?.message
            ? res.message === 'Unauthorized'
              ? 'User unauthorized! Please login again.'
              : res.message
            : 'Fail to load barcodes'
        )
        return;
      }
    } catch (err) {
      setError(err.message || 'Failed to load barcodes.');
    } finally {
      setLoading(false);
    }
  }
  


  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="no-print flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Barcode Generator</h1>
          </div>

          <form className="no-print">
            <div className="flex mb-4 space-x-2">
              <select
              value={bookType}
              onChange={(e) => setBookType(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
              >
                <option value="English">English</option>
                <option value="Myanmar">Myanmar</option>
              </select>
              <button
                type="button"
                onClick={()=>{ if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); return; } fetchBarcodeList(); }}
                className="px-4 py-3 mr-auto bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-60"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                type="button"
                disabled={loading || selectedCodes.length === 0}
                onClick={()=>{ if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); return; } if (selectedCodes.length === 0) { setError('Please select at least one barcode'); return; } setPrintCodes(selectedCodes.slice()); setPrintOpen(true); }}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-60"
              >
                {loading ? 'Loading...' : 'Generate'}
              </button>
            </div>
          </form>

          {error && (
            <div className="no-print mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
            {availableCodes.length === 0 ? (
              <div className="no-print flex justify-center items-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-white">
                <p className="text-gray-500">No barcode to display.</p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Available Barcodes</h2>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSelectedCodes(availableCodes.slice())} className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Select All</button>
                    <button type="button" onClick={() => setSelectedCodes([])} className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Clear</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[500px] overflow-auto">
                  {availableCodes.map(code => {
                    const selected = selectedCodes.includes(code);
                    return (
                      <div
                        key={code}
                        onClick={() => setSelectedCodes(curr => curr.includes(code) ? curr.filter(c => c !== code) : [...curr, code])}
                        className={`cursor-pointer rounded-lg border ${selected ? 'border-[#2E6BAA] ring-2 ring-[#2E6BAA]/40' : 'border-gray-200'} bg-white p-3 hover:shadow`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{code}</span>
                          <input type="checkbox" readOnly checked={selected} className="accent-[#2E6BAA]" />
                        </div>
                        <div className="flex items-center justify-center">
                          <Barcode value={code} format="CODE128" renderer="svg" displayValue={false} height={50} width={1.6} margin={0} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* <div className="hidden"></div> */}
        </div>
      </div>

      {printOpen && (
        <>
          <style>{`@media print { .barcode-modal { position: static !important; inset: auto !important; display: block !important; } .barcode-modal .overlay { display: none !important; } .barcode-modal .modal-content { position: static !important; width: auto !important; max-width: none !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important; } }`}</style>
          <div className="barcode-modal fixed inset-0 z-50 flex items-center justify-center">
            <div className="overlay absolute inset-0 bg-black/40" onClick={() => setPrintOpen(false)}></div>
            <div className="modal-content relative bg-white rounded-2xl shadow-xl w-full max-w-5xl p-4 ring-1 ring-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Barcodes Preview</h2>
                <button type="button" onClick={() => setPrintOpen(false)} className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Close</button>
              </div>
              <div className="print-grid">
                <BarcodePrint codes={printCodes} />
              </div>
            </div>
          </div>
        </>
      )}

      <FreeUsageDialog
        open={freePromptOpen}
        onClose={() => setFreePromptOpen(false)}
        onVerify={() => { setFreePromptOpen(false); navigate('/LibraryVerify'); }}
        libraryName={user?.libraryName || ''}
        userType={user?.libraryAccess || 'Free'}
        title="Limited Access"
      />
    </div>
  );
};

export default BarCode;