import React from 'react';

export default function BookReportPrint({
  open = false,
  onClose = () => {},
  title = 'Book Report',
  generatedAt = new Date(),
  filters = { searchLabel: 'Any', typeLabel: 'All', dateLabel: 'Any' },
  totals = { totalBooks: 0, englishCount: 0, myanmarCount: 0, totalAvailableCopies: 0 },
  items = [],
  pageSize = 10,
  currentPage = 1
}) {
  if (!open) return null;

  const fmtDateTime = (d) => {
    try {
      const dt = new Date(d);
      return dt.toLocaleString();
    } catch { return String(d); }
  };
  const typeCode = (t) => (t === 'Myanmar' ? 'MM' : (t === 'English' ? 'EN' : '-'));

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 6mm; }
        .report-print-modal .content { font-size: 12px; }
        .report-print-modal h2 { font-size: 16px; margin: 0 0 4px 0; }
        .report-print-modal table { font-size: 12px; }
        @media print {
          body * { visibility: hidden; }
          .report-print-modal, .report-print-modal * { visibility: visible; }
          .report-print-modal { position: static !important; inset: auto !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
          .report-print-modal .overlay { display: none !important; }
          .report-print-modal .content { position: static !important; max-width: none !important; width: 100% !important; box-shadow: none !important; border: none !important; padding: 0 !important; max-height: none !important; overflow: visible !important; }
          .action-bar { display: none !important; }
          .cards { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 6px !important; }
          table { width: 100% !important; table-layout: fixed; border-collapse: collapse; font-size: 10px; }
          thead th { border-bottom: 2px solid #ccc; }
          th, td { border-bottom: 1px solid #e5e7eb; border-left: none !important; border-right: none !important; padding: 3px 4px; word-break: break-word; }
          tr { break-inside: avoid; }
          .cards .card { border: 1px solid #ddd !important; background: #fff !important; padding: 8px !important; }
        }
      `}</style>

      <div className="report-print-modal fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain" role="dialog" aria-modal="true">
        <div className="overlay absolute inset-0 bg-black/40" onClick={onClose}></div>
        <div className="content relative bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-4 ring-1 ring-gray-100">
          <div className="action-bar flex items-center justify-end gap-2 mb-2">
            <button type="button" onClick={() => window.print()} className="px-3 py-2 rounded-md bg-[#2E6BAA] text-white">Download</button>
            <button type="button" onClick={onClose} className="px-3 py-2 rounded-md bg-gray-100 text-gray-700">Close</button>
          </div>

          <div className="mb-2">
            <h2 className="text-xl font-bold text-[#0C2D57]">{title}</h2>
            <div className="text-xs text-gray-600">Generated on {fmtDateTime(generatedAt)}</div>
          </div>

          <div className="mb-2 rounded-xl px-3 py-2 text-xs bg-blue-50 text-blue-800 ring-1 ring-blue-200">
            Filter: Search {filters.searchLabel} • Type {filters.typeLabel} • Date {filters.dateLabel}
          </div>

          <div className="cards grid grid-cols-4 gap-2 mb-3">
            <div className="card rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4">
              <div className="text-sm text-gray-600">Total Books</div>
              <div className="text-2xl font-bold text-[#0C2D57]">{totals.totalBooks}</div>
            </div>
            <div className="card rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4">
              <div className="text-sm text-gray-600">Total English</div>
              <div className="text-2xl font-bold text-[#0C2D57]">{totals.englishCount}</div>
            </div>
            <div className="card rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4">
              <div className="text-sm text-gray-600">Total Myanmar</div>
              <div className="text-2xl font-bold text-[#0C2D57]">{totals.myanmarCount}</div>
            </div>
            <div className="card rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4">
              <div className="text-sm text-gray-600">Total Copies (page)</div>
              <div className="text-2xl font-bold text-[#0C2D57]">{totals.totalAvailableCopies}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-[12px]">
              <colgroup>
                <col style={{ width: '6%' }} />
                <col style={{ width: '6%' }} />
                <col style={{ width: '34%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-14">No</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-14">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Author</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">ISBN</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Publisher</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-20">Year</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-24">Total Copies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No books match the current filters.</td>
                  </tr>
                ) : items.map((b, idx) => {
                  const bt = b.bookType ?? b.BookType ?? '';
                  const title2 = b.title ?? b.Title ?? '';
                  const author2 = b.author ?? b.Author ?? '';
                  const isbn2 = b.isbn ?? b.ISBN ?? '';
                  const pub2 = b.publisher ?? b.Publisher ?? '';
                  const year2 = b.publishedYear ?? b.PublishedYear ?? '';
                  const copies2 = b.totalCopies ?? b.TotalCopies ?? 0;
                  return (
                    <tr key={`${title2}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="px-4 py-3">{typeCode(bt)}</td>
                      <td className="px-4 py-3">{title2}</td>
                      <td className="px-4 py-3">{author2 || '-'}</td>
                      <td className="px-4 py-3">{isbn2 || '-'}</td>
                      <td className="px-4 py-3">{pub2 || '-'}</td>
                      <td className="px-4 py-3">{year2 || '-'}</td>
                      <td className="px-4 py-3">{copies2}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}