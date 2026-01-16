import { useMemo } from 'react';
import Barcode from 'react-barcode';

const makeCodes = (count, startCode = 'E0000001') => {
  const c = Math.max(1, Math.floor(count || 1));
  const s = (startCode || 'E0000001').trim();
  const m = s.match(/^([A-Za-z]+)(\d+)$/);
  const prefix = m ? m[1] : 'E';
  const startNum = m ? parseInt(m[2], 10) : 1;
  const width = m ? m[2].length : 7;
  return Array.from({ length: c }, (_, i) => `${prefix}${String(startNum + i).padStart(width, '0')}`);
};

export default function BarcodePrint({ count = 20, startCode = 'E0000001', codes: inputCodes }) {
  const codes = useMemo(() => {
    if (Array.isArray(inputCodes) && inputCodes.length > 0) return inputCodes;
    return makeCodes(count, startCode);
  }, [inputCodes, count, startCode]);

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
          .barcode-card { box-sizing: border-box; border: 0.3mm solid #d1d5db !important; border-radius: 0 !important; padding: 1mm !important; height: 100%; display:flex; align-items:center; justify-content:center; }
          .barcode-card svg { width: 100% !important; height: calc(100% - 2mm) !important; }
        }
      `}</style>

      <div id="print-area" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {codes.map((code) => (
          <div
            key={code}
            className="barcode-card bg-white border border-gray-300 rounded-md p-2 print:p-[1mm] print:rounded-none flex items-center justify-center"
            style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
          >
            <Barcode
              value={code}
              format="CODE128"
              renderer="svg"
              displayValue={true}
              background="#ffffff"
              lineColor="#000000"
              height={80}
              width={1.9}
              margin={0}
              textMargin={1}
              fontSize={13}
            />
          </div>
        ))}
      </div>
    </div>
  );
}