import { useMemo, useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { bookService } from '../services/bookService';
import BookReportPrint from '../components/report/BookReportPrint';



export default function BookReport() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [printPreparing, setPrintPreparing] = useState(false);
  const [printItems, setPrintItems] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [bookType, setBookType] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(b => {
      const bt = b.bookType ?? '';
      const matchesType = bookType ? bt === bookType : true;
      const title = (b.title ?? '').toLowerCase();
      const author = (b.author ?? '').toLowerCase();
      const matchesSearch = q ? (title.includes(q) || author.includes(q)) : true;
      return matchesType && matchesSearch;
    });
  }, [items, search, bookType]);

  const currentPage = pageNumber;

  const totalBooks = displayed.length;
  const totalAvailableCopies = displayed.reduce((sum, b) => sum + (Number(b.totalCopies ?? b.TotalCopies) || 0), 0);
  const englishCount = displayed.filter(b => (b.bookType ?? b.BookType) === 'English').length;
  const myanmarCount = displayed.filter(b => (b.bookType ?? b.BookType) === 'Myanmar').length;
  const typeLabel = bookType || 'All';
  const searchLabel = search.trim() ? `'${search.trim()}'` : 'Any';
  const dateLabel = (dateFrom || dateTo) ? `${dateFrom || 'Any'} to ${dateTo || 'Any'}` : 'Any';

  const fetchReport = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await bookService.getBookReport(page, dateFrom || '', dateTo || '');
      if (res?.success) {
        const r = res?.data?.result ?? res?.result ?? {};
        setItems(r.items ?? []);
        setTotalItems(r.totalItems ?? 0);
        setTotalPages(r.totalPages ?? 1);
        setPageSize(r.pageSize ?? 50);
        setPageNumber(r.pageNumber ?? page);
      } else {
        setError(res?.message || 'Failed to load report');
      }
    } catch (e) {
      setError(e?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(1); }, []);

  const loadAllPagesForPrint = async () => {
    setPrintPreparing(true);
    try {
      const first = await bookService.getBookReport(1, dateFrom || '', dateTo || '');
      const r1 = first?.data?.result ?? first?.result ?? {};
      const tp = r1.totalPages ?? r1.TotalPages ?? 1;
      const acc = [...(r1.items ?? r1.Items ?? [])];
      for (let p = 2; p <= tp; p++) {
        const rp = await bookService.getBookReport(p, dateFrom || '', dateTo || '');
        const ri = rp?.data?.result ?? rp?.result ?? {};
        acc.push(...(ri.items ?? ri.Items ?? []));
      }
      setPrintItems(acc);
    } catch {
      setPrintItems(items);
    } finally { setPrintPreparing(false); }
  };

  const applyFilter = () => { fetchReport(1); };
  const resetFilter = () => { setSearch(''); setBookType(''); setDateFrom(''); setDateTo(''); fetchReport(1); };

  const exportToCSV = () => {
    const rows = [['No', 'Title', 'Author', 'Category', 'ISBN', 'Published Year', 'Available Copies']];
    displayed.forEach((b, idx) => rows.push([String(idx + 1), b.title, b.author, b.category, b.isbn, b.publister, String(b.publishedYear), String(b.totalCopies)]));
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BookReport-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div id="report-print" className="p-4 lg:px-8 report-content">
          <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0C2D57]">Book Report</h1>
            <p className="text-sm text-[#1B4B8A]">Library book list report</p>
            <p className="text-xs text-gray-500">Generated on {new Date().toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2 report-actions">
            <button type="button" onClick={exportToCSV} className="px-4 py-2 rounded-xl bg-white text-[#0C2D57] ring-1 ring-gray-200 hover:bg-gray-50">Export Excel</button>
            <button type="button" onClick={async () => { await loadAllPagesForPrint(); setPrintOpen(true); }} disabled={printPreparing} className="px-4 py-2 rounded-xl bg-[#2E6BAA] text-white hover:bg-opacity-90 disabled:opacity-60">{printPreparing ? 'Preparing…' : 'Print Report'}</button>
          </div>
        </div>

        <div>
          {error && (<div className="mb-3 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-700 ring-1 ring-red-200">{error}</div>)}
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4 sm:p-5 report-filters">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="">
              <label className="text-sm text-gray-700">Search</label>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title or author" className="mt-1 w-full px-3 py-2 bg-gray-50 rounded-xl ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Book Type</label>
              <select value={bookType} onChange={e=>setBookType(e.target.value)} className="mt-1 w-full px-3 py-2 bg-gray-50 rounded-xl ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]">
                <option value="">All</option>
                <option value="English">English</option>
                <option value="Myanmar">Myanmar</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">From Date</label>
              <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="mt-1 w-full px-3 py-2 bg-gray-50 rounded-xl ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
            </div>
            <div>
              <label className="text-sm text-gray-700">To Date</label>
              <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="mt-1 w-full px-3 py-2 bg-gray-50 rounded-xl ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button type="button" onClick={resetFilter} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200">Reset</button>
            <button type="button" onClick={applyFilter} className="px-4 py-2 rounded-xl bg-[#2E6BAA] text-white hover:bg-opacity-90">Apply Filter</button>
          </div>
        </div>

        <div>
            <div className="rounded-xl px-4 py-3 text-xs sm:text-sm bg-blue-50 text-blue-800 ring-1 ring-blue-200 print:bg-white print:text-black print:ring-gray-300">Filter: Search {searchLabel} • Type {typeLabel} • Date {dateLabel}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {loading ? (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4 animate-pulse">
                    <div className="h-3 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4">
                  <div className="text-sm text-gray-600">Total Books</div>
                  <div className="text-2xl font-bold text-[#0C2D57]">{totalBooks}</div>
                </div>
                {bookType === '' && (
                  <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4">
                    <div className="text-sm text-gray-600">Total English</div>
                    <div className="text-2xl font-bold text-[#0C2D57]">{englishCount}</div>
                  </div>
                )}
                {bookType === '' && (
                  <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4">
                    <div className="text-sm text-gray-600">Total Myanmar</div>
                    <div className="text-2xl font-bold text-[#0C2D57]">{myanmarCount}</div>
                  </div>
                )}
                <div className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4">
                  <div className="text-sm text-gray-600">Total Copies</div>
                  <div className="text-2xl font-bold text-[#0C2D57]">{totalAvailableCopies}</div>
                </div>
              </>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-16">No</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Author</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">ISBN</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Publisher</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Year</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Copies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="animate-pulse">
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
                      ))}
                    </tr>
                  ))
                ) : displayed.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No books match the current filters.</td>
                  </tr>
                ) : (
                  displayed.map((b, idx) => (
                    <tr key={`${b.Title}-${idx}`} className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                      <td className="px-4 py-3">{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="px-4 py-3">{(b.bookType ?? b.BookType) === 'Myanmar' ? 'MM' : ((b.bookType ?? b.BookType) === 'English' ? 'EN' : '-')}</td>
                      <td className="px-4 py-3">{b.title}</td>
                      <td className="px-4 py-3">{b.author ?? '-'}</td>
                      <td className="px-4 py-3">{b.isbn ?? '-'}</td>
                      <td className="px-4 py-3">{b.publisher ?? '-'}</td>
                      <td className="px-4 py-3">{b.publishedYear ?? '-'}</td>
                      <td className="px-4 py-3">{b.totalCopies ?? 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 sm:px-6 py-4 flex items-center justify-between report-pagination">
            <div className="text-sm text-gray-600">Page {currentPage} of {totalPages} • {totalItems} result(s)</div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { if (currentPage > 1) fetchReport(currentPage - 1); }} disabled={currentPage <= 1 || loading} className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50">Prev</button>
              <button type="button" onClick={() => { if (currentPage < totalPages) fetchReport(currentPage + 1); }} disabled={currentPage >= totalPages || loading} className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
        </div>

        {printOpen && (
          <BookReportPrint
            open={printOpen}
            onClose={() => setPrintOpen(false)}
            title="Book Report"
            generatedAt={new Date()}
            filters={{ searchLabel, typeLabel, dateLabel }}
            totals={{
              totalBooks: (bookType ? (printItems.length ? printItems.filter(b => (b.bookType ?? b.BookType) === bookType).length : displayed.length) : (printItems.length ? printItems.length : displayed.length)),
              englishCount: (printItems.length ? printItems.filter(b => (b.bookType ?? b.BookType) === 'English').length : englishCount),
              myanmarCount: (printItems.length ? printItems.filter(b => (b.bookType ?? b.BookType) === 'Myanmar').length : myanmarCount),
              totalAvailableCopies: (printItems.length ? printItems.reduce((s,b)=> s + (Number(b.totalCopies ?? b.TotalCopies) || 0), 0) : totalAvailableCopies)
            }}
            items={printItems.length ? (bookType ? printItems.filter(b => (b.bookType ?? b.BookType) === bookType) : printItems) : displayed}
            pageSize={pageSize}
            currentPage={1}
          />
        )}
    </div>
    </div>

      <style>{`@page { size: A4 portrait; margin: 12mm; }
      @media print {
        body * { visibility: hidden; }
        #report-print, #report-print * { visibility: visible; }
        #report-print { position: static !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
        .report-actions, .report-filters, .report-pagination { display: none !important; }
        .ring-1, .shadow-sm, .rounded-2xl { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        html, body { background: #fff !important; }
        table { width: 100% !important; table-layout: fixed; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #ddd; padding: 6px; word-break: break-word; }
        .summary-grid .rounded-xl { border: 1px solid #ddd !important; background: #fff !important; }
      }`}</style>
    </div>
  );
}