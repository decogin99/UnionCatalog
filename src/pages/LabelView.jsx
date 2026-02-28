import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { libraryService } from '../services/libraryService';
import LabelPrint from '../components/label/LabelPrint';
import { useAuth } from "../context/AuthProvider.jsx";
import FreeUsageDialog from '../components/common/FreeUsageDialog';

const LabelView = () => {

  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [freePromptOpen, setFreePromptOpen] = useState(false);
  const [bookType, setBookType] = useState('English');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [printLabels, setPrintLabels] = useState([]);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    document.title = 'Label Generator';
  }, []);

  useEffect(() => {
      fetchLabelList();
    }, [bookType]);
  
    const fetchLabelList = async () => {
      setLoading(true);
      setError('');
      setAvailableLabels([]);
      setSelectedLabels([]);
      setPrintLabels([]);
      try {
        const res = await libraryService.getLabelList(bookType);
        if (res?.success) {
          const r = res?.data?.result ?? res?.result ?? res?.data ?? [];
          const list = Array.isArray(r) ? r.map(x => ({
            ClassNo: x.ClassNo ?? x.classNo ?? '',
            Initial: x.Initial ?? x.initial ?? '',
            AccessionNo: x.AccessionNo ?? x.accessionNo ?? '',
            BarcodeNo: x.BarcodeNo ?? x.barcodeNo ?? ''
          })) : [];
          setAvailableLabels(list);
        }
        else{
          setError(
            res?.message
              ? res.message === 'Unauthorized'
                ? 'User unauthorized! Please login again.'
                : res.message
              : 'Fail to load barLabels'
          )
          return;
        }
      } catch (err) {
        setError(err.message || 'Failed to load barLabels.');
      } finally {
        setLoading(false);
      }
    }

  // const handleGenerate = async (e) => {
  //   e.preventDefault();
  //   if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); return; }
  //   setError('');
  //   setLoading(true);
  //   setLabels([]);
  //   const s = (str) => (str || '').trim();
  //   const from = s(fromId);
  //   const to = s(toId);
  //   const valid = /^[A-Za-z]+\d+$/.test(from) && /^[A-Za-z]+\d+$/.test(to);
  //   if (!valid) {
  //     setLoading(false);
  //     setError('Invalid Barcode ID.');
  //     return;
  //   }
  //   try {
  //     const res = await libraryService.getLabelRange(bookType, from, to);
  //     if (res?.success) {
  //       const list = Array.isArray(res?.data?.result) ? res.data.result : (Array.isArray(res?.data) ? res.data : []);
  //       setLabels(list);
  //       if (!list.length) setError('No labels found in the specified range.');
  //     } else {
  //       setError(res?.message || 'Failed to fetch labels');
  //     }
  //   } catch (err) {
  //     setError(err?.message || 'Failed to fetch labels');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Label Generator</h1>
          </div>

          <form className="no-print">
            <div className='flex mb-4 space-x-2'>
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
                onClick={()=>{ if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); return; } fetchLabelList(); }}
                className="px-4 py-3 mr-auto bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-60"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              {/* <input
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
              /> */}
              <button
                type="button"
                disabled={loading || selectedLabels.length === 0}
                onClick={() => { if (user?.libraryAccess === 'Free') { setFreePromptOpen(true); return; } if (!selectedLabels.length) { setError('Please select at least one label'); return; } setPrintLabels(selectedLabels.map(i => availableLabels[i])); setPrintOpen(true); }}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-60"
              >
                {loading ? 'Loading...' : 'Generate'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow ring-1 ring-gray-100 p-6">
            {availableLabels.length === 0 ? (
              <div className="no-print flex justify-center items-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-white">
                <p className="text-gray-500">No labels to display.</p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Available Labels</h2>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setSelectedLabels(availableLabels.map((_, i) => i))} className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Select All</button>
                    <button type="button" onClick={() => setSelectedLabels([])} className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Clear</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[500px] overflow-auto">
                  {availableLabels.map((item, idx) => {
                    const selected = selectedLabels.includes(idx);
                    const key = `${item.ClassNo}-${item.AccessionNo}-${idx}`;
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedLabels(curr => curr.includes(idx) ? curr.filter(i => i !== idx) : [...curr, idx])}
                        className={`cursor-pointer rounded-lg border ${selected ? 'border-[#2E6BAA] ring-2 ring-[#2E6BAA]/40' : 'border-gray-200'} bg-white p-3 hover:shadow`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 truncate">{item.ClassNo}</span>
                          <input type="checkbox" readOnly checked={selected} className="accent-[#2E6BAA]" />
                        </div>
                        <div className="text-center leading-tight">
                          {item.Initial && (<div className="text-base font-semibold text-gray-800">{item.Initial}</div>)}
                          <div className="text-sm text-gray-900 mt-[1mm]">{item.AccessionNo}</div>
                          {item.BarcodeNo && (<div className="text-[11px] text-gray-500 mt-[1mm]">Barcode: {item.BarcodeNo}</div>)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {printOpen && (
        <>
          <style>{`@media print { .barcode-modal { position: static !important; inset: auto !important; display: block !important; } .barcode-modal .overlay { display: none !important; } .barcode-modal .modal-content { position: static !important; width: auto !important; max-width: none !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important; } }`}</style>
          <div className="barcode-modal fixed inset-0 z-50 flex items-center justify-center">
            <div className="overlay absolute inset-0 bg-black/40" onClick={() => setPrintOpen(false)}></div>
            <div className="modal-content relative bg-white rounded-2xl shadow-xl w-full max-w-5xl p-4 ring-1 ring-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">Labels Preview</h2>
                <button type="button" onClick={() => setPrintOpen(false)} className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Close</button>
              </div>
              <div className="print-grid">
                <LabelPrint labels={printLabels} />
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

export default LabelView;