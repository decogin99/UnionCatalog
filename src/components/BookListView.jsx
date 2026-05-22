import { useLanguage } from '../context/AuthProvider.jsx';

export default function BookListView({
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
        cover: 'မျက်နှာဖုံး', title: 'ခေါင်းစဉ်', author: 'စာရေးသူ', publisher: 'ထုတ်ဝေသူ',
        year: 'နှစ်', place: 'နေရာ', subjectHeadings: 'ခေါင်းစဉ်များ', added: 'အချိန်',
        copies: 'အုပ်ရေ', actions: 'လုပ်ဆောင်ချက်များ', view: 'အသေးစိတ်', edit: 'ပြင်ဆင်မည်',
        delete: 'ဖျက်မည်', noCover: 'မျက်နှာဖုံးမရှိ', isbn: 'ISBN', barcode: 'ဘားကုဒ်',
        accession: 'အမှတ်စဉ်', viewCopies: '(ကြည့်မည်)'
      }
    : {
        cover: 'Cover', title: 'Title', author: 'Author', publisher: 'Publisher',
        year: 'Year', place: 'Place', subjectHeadings: 'Subject Headings', added: 'Added',
        copies: 'Copies', actions: 'Actions', view: 'View', edit: 'Edit',
        delete: 'Delete', noCover: 'No Cover', isbn: 'ISBN', barcode: 'Barcode',
        accession: 'Accession', viewCopies: '(View)'
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
    <div className="bg-white/95 shadow-md ring-1 ring-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-8">#</th>
              <th className=""></th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.cover}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.title}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.author}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.publisher}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.year}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.place}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.subjectHeadings}</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{t.added}</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">{t.copies}</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, idx) => (
              <tr
                key={book.bookId || book.publicId || `${book.title}-${idx}`}
                className={`transition-colors duration-200 border-b border-gray-100 ${selectedIds.has(book.bookId) ? 'bg-green-50' : 'hover:bg-gray-100'}`}
              >
                <td className="px-4 py-3 w-8 text-gray-700">{(pageNumber - 1) * (pageSize || books.length) + idx + 1}</td>
                <td className="pt-[4.5px]">
                  {enableSelection && (
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      checked={selectedIds.has(book.bookId)}
                      onChange={(e) => onToggleSelected && onToggleSelected(book.bookId, e.target.checked)}
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} className="w-13 h-20 object-cover rounded-md" />
                  ) : 
                  (
                    <div className="w-13 h-20 bg-[#f3f4f6] text-[#9ca3af] text-[7px] rounded-md flex items-center justify-center">
                      {t.noCover}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">
                    <span className="">{book.title}</span>
                  </div>
                  <div className="text-xs text-gray-500">{t.isbn}: {book.isbn}</div>
                  <div className="text-xs text-gray-500">{t.barcode}:{Array.isArray(book.barcodeNoList) && book.barcodeNoList.length ? (<span className="ml-1 text-gray-700">{book.barcodeNoList.slice(0,3).join(', ')}{book.barcodeNoList.length>3 ? ` +${book.barcodeNoList.length-3} more` : ''}</span>) : (<span className="ml-1 text-gray-400">—</span>)}</div>
                  <div className="text-xs text-gray-500">{t.accession}:{Array.isArray(book.accessionNoList) && book.accessionNoList.length ? (<span className="ml-1 text-gray-700">{book.accessionNoList.slice(0,3).join(', ')}{book.accessionNoList.length>3 ? ` +${book.accessionNoList.length-3} more` : ''}</span>) : (<span className="ml-1 text-gray-400">—</span>)}</div>
                </td>
                <td className="px-4 py-3 text-gray-700">{book.author}</td>
                <td className="px-4 py-3 text-gray-700">{book.publisher}</td>
                <td className="px-4 py-3 text-gray-700">{book.publishedYear}</td>
                <td className="px-4 py-3 text-gray-700">{book.place}</td>
                <td className="px-4 py-3 text-gray-700">{book.subjectHeadings}</td>
                <td className="px-4 py-3 text-gray-700">{rel(book.date)}</td>
                <td className="px-4 py-3 text-gray-700 text-center">
                  {book.totalCopies}
                  {showAdminActions && <span onClick={() => openCopies(book)} className="ml-1 cursor-pointer text-[#2E6BAA] hover:text-[#1B4B8A]">{t.viewCopies}</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="text-end space-y-1">
                    <div>
                      <button 
                      onClick={() => onDetail && onDetail(book)}
                      className="text-sm rounded-md w-full border border-[#2E6BAA] text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white transition-colors duration-200">{t.view}</button>
                    </div>
                    {showAdminActions && 
                      <>
                        <div>
                          <button 
                          onClick={() => onUpdate && onUpdate(book)}
                          className='text-sm rounded-md w-full border border-[#2E6BAA] text-[#2E6BAA] hover:bg-[#2E6BAA] hover:text-white transition-colors duration-200'>{t.edit}</button>
                        </div>
                        <div>
                          <button 
                          onClick={() => onDelete && onDelete(book)}
                          className="text-sm rounded-md w-full border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200">{t.delete}</button>
                        </div>
                      </>
                    }
                  </div>
                  {/* <div className="flex justify-end space-x-2">
                    {showAdminActions && (
                      <>
                        <FiEdit size={16}
                            className="text-[#2E6BAA] cursor-pointer hover:text-[#1B4B8A]"
                            onClick={() => onUpdate && onUpdate(book)} />
                        <FiTrash2 size={16}
                            className="text-[#AA2E2E] cursor-pointer hover:text-[#8A1B1B]"
                            onClick={() => onDelete && onDelete(book)} />
                      </>
                    )}
                    <LuBookText size={16}
                        className="text-[#6BAA2E] cursor-pointer hover:text-[#4B8A1B]"
                        onClick={() => onDetail && onDetail(book)} />
                    {showAdminActions && (
                      <LuBookCopy size={16}
                          className="text-[#2E6BAA] cursor-pointer hover:text-[#1B4B8A]"
                          onClick={() => openCopies(book)} />
                    )}
                  </div> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}