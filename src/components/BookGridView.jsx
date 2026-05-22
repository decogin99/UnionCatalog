import { useLanguage } from '../context/AuthProvider.jsx';

export default function BookGridView({
  books = [],
  pageNumber = 1,
  pageSize = books.length,
  selectedIds = new Set(),
  onToggleSelected,
  onDetail,
  onUpdate,
  onDelete,
  openCopies,
  showAdminActions = false,
  enableSelection = true,
}) {
  const { language } = useLanguage();
  const t = language === 'mm'
    ? {
        isbn: 'ISBN', barcode: 'ဘားကုဒ်', accession: 'အမှတ်စဉ်', author: 'စာရေးသူ',
        publisher: 'ထုတ်ဝေသူ', year: 'နှစ်', place: 'နေရာ', subjectHeadings: 'ခေါင်းစဉ်များ',
        added: 'ထည့်သွင်းခဲ့သည်', copies: 'အုပ်ရေ', view: 'အသေးစိတ်', edit: 'ပြင်ဆင်မည်',
        delete: 'ဖျက်မည်', noCover: 'မျက်နှာဖုံးမရှိ', viewCopies: '(ကြည့်မည်)'
      }
    : {
        isbn: 'ISBN', barcode: 'Barcode', accession: 'Accession', author: 'Author',
        publisher: 'Publisher', year: 'Year', place: 'Place', subjectHeadings: 'Subject Headings',
        added: 'Added', copies: 'Copies', view: 'View', edit: 'Edit',
        delete: 'Delete', noCover: 'No Cover', viewCopies: '(View)'
      };

  const rel = (v) => {
    const s = String(v || '').trim();
    if (!s) return '';
    let d;
    try {
      const iso = s.replace(' ', 'T');
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(iso)) {
        d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y,m,dd] = s.split('-').map(Number);
        d = new Date(Date.UTC(y, m - 1, dd));
      } else {
        d = new Date(s);
      }
    } catch { return ''; }
    if (Number.isNaN(d.getTime())) return '';
    const nowMs = Date.now();
    let diffMs = nowMs - d.getTime();
    if (diffMs < 0) diffMs = 0;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return mins <= 0 ? 'just now' : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const today = new Date(); today.setHours(0,0,0,0);
    const localD = new Date(d.getTime()); localD.setHours(0,0,0,0);
    const dayDiff = Math.floor((today.getTime() - localD.getTime()) / 86400000);
    if (dayDiff === 0) return 'today';
    if (dayDiff === 1) return 'yesterday';
    return `${dayDiff} days ago`;
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
      {books.map((book, idx) => (
        <div
          key={book.bookId || book.publicId || `${book.title}-${idx}`}
          className={`rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col ring-1 ring-gray-100 ${selectedIds.has(book.bookId) ? 'ring-2 ring-green-300 bg-green-50' : 'bg-white/95'}`}
        >
          <div className="relative flex text-end">
            <label className="absolute top-1 left-2">{(pageNumber - 1) * (pageSize || books.length) + idx + 1}</label>
            {enableSelection && (
              <label className="absolute top-1 right-2">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={selectedIds.has(book.bookId)}
                  onChange={(e) => onToggleSelected && onToggleSelected(book.bookId, e.target.checked)}
                />
              </label>
            )}
          </div>
          <div className="relative pt-[100%] w-full max-w-[200px] mx-auto overflow-hidden">
            {book.cover ? 
            (<img
              src={book.cover}
              alt={book.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain hover:scale-105 transition-transform duration-300"
            />)
          :
          (
            <div className="inset-0 absolute w-full h-full flex items-center justify-center bg-[#f3f4f6] text-[#9ca3af] text-sm">
              {t.noCover}
            </div>
          )}
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">{t.isbn}:</span> {book.isbn}</p>
              <p>
                <span className="font-medium">{t.barcode}:</span>{Array.isArray(book.barcodeNoList) && book.barcodeNoList.length ? (<span className="ml-1 text-gray-700">{book.barcodeNoList.slice(0,3).join(', ')}{book.barcodeNoList.length>3 ? ` +${book.barcodeNoList.length-3} more` : ''}</span>) : (<span className="ml-1 text-gray-400">—</span>)}
              </p>
              <p>
                <span className="font-medium">{t.accession}:</span>{Array.isArray(book.accessionNoList) && book.accessionNoList.length ? (<span className="ml-1 text-gray-700">{book.accessionNoList.slice(0,3).join(', ')}{book.accessionNoList.length>3 ? ` +${book.accessionNoList.length-3} more` : ''}</span>) : (<span className="ml-1 text-gray-400">—</span>)}
              </p>
              <p><span className="font-medium">{t.author}:</span> {book.author}</p>
              <p><span className="font-medium">{t.publisher}:</span> {book.publisher}</p>
              <p><span className="font-medium">{t.year}:</span> {book.publishedYear}</p>
              <p><span className="font-medium">{t.place}:</span> {book.place}</p>
              <p><span className="font-medium">{t.subjectHeadings}:</span> {book.subjectHeadings}</p>
              <p><span className="font-medium">{t.added}:</span> {rel(book.date)}</p>
              <p><span className="font-medium">{t.copies}:</span> {book.totalCopies} {showAdminActions && <span onClick={() => openCopies(book)} className="ml-0.5 cursor-pointer text-[#2E6BAA] hover:text-[#1B4B8A]">{t.viewCopies}</span>}</p>
            </div>
            <div className="pt-5 mt-auto">
              <div className={`grid gap-1 ${showAdminActions && book.controlAction ? 'grid-cols-3' : 'grid-cols-1'}`}>
                <button
                  onClick={() => onDetail && onDetail(book)}
                  className="px-3 py-2 text-sm rounded-md w-full border border-[#2E6BAA] text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white transition-colors duration-200"
                >
                  {t.view}
                </button>
                {showAdminActions && book.controlAction && (
                  <>
                    <button
                    onClick={() => onUpdate && onUpdate(book)}
                    className="px-3 py-2 text-sm rounded-md w-full border border-[#2E6BAA] text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white transition-colors duration-200"
                    >
                      {t.edit}
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(book)}
                      className="px-3 py-2 text-sm rounded-md w-full border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
                    >
                      {t.delete}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}