export default function LabelPrint({ labels = [] }) {
  const getMiddleText = (author, title) => {
    const src = (author || '').trim() || (title || '').trim();
    if (!src) return '';
    const three = src.slice(0, 3);
    if (/^[A-Za-z]+$/.test(three)) {
      return three.charAt(0).toUpperCase() + three.slice(1).toLowerCase();
    }
    return three;
  };

  return (
    <div className="p-4 bg-gray-100">
      <div className="flex items-center justify-end gap-2 mb-4 print:hidden">
        <button className="px-3 py-2 bg-[#2E6BAA] text-white rounded-md" onClick={() => window.print()}>
          Print
        </button>
      </div>

      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area {
            position: absolute; inset: 0; width: 210mm; height: 297mm; margin: 0 auto; padding: 0 3mm; box-sizing: border-box;
            display: grid; grid-template-columns: repeat(4, 1fr) !important; grid-auto-rows: 26mm; gap: 2mm !important;
          }
          .label-card { box-sizing: border-box; border: 0.3mm solid #d1d5db !important; border-radius: 0 !important; padding: 1mm !important; height: 100%; display:flex; align-items:center; justify-content:center; }
        }
      `}</style>

      <div id="print-area" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {labels.map((item, idx) => {
          const classNo = item.ClassNo ?? item.classNo ?? '';
          const title = item.Title ?? item.title ?? '';
          const initial = item.Initial ?? item.initial ?? '';
          const author = item.Author ?? item.author ?? '';
          const accessionNo = item.AccessionNo ?? item.accessionNo ?? '';
          const middle = getMiddleText(author, title);

          return (
            <div
              key={idx}
              className="label-card bg-white border border-gray-300 rounded-md p-2 print:p-[1mm] print:rounded-none flex items-center justify-center"
              style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
            >
              <div className="text-center leading-tight">
                <div className="text-sm font-semibold text-gray-900">{classNo}</div>
                {initial ? (
                  <div className="text-base font-semibold text-gray-800 mt-[1mm]">{initial}</div>
                ) : (
                  <div className="text-base font-semibold text-gray-800 mt-[1mm]">{middle}</div>
                )}
                <div className="text-sm text-gray-900 mt-[1mm]">{accessionNo}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}