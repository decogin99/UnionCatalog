import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Libraries = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionMessage, setActionMessage] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  const [approveError, setApproveError] = useState('');
  const [approveSubmitting, setApproveSubmitting] = useState(false);

  const [declineError, setDeclineError] = useState('');
  const [declineSubmitting, setDeclineSubmitting] = useState(false);
  
  const [banOpen, setBanOpen] = useState(false);
  const [banId, setBanId] = useState(null);
  const [banNote, setBanNote] = useState('');
  const [banName, setBanName] = useState('');
  const [banSubmitting, setBanSubmitting] = useState(false);

  const [unbanOpen, setUnbanOpen] = useState(false);
  const [unbanId, setUnbanId] = useState(null);
  const [unbanName, setUnbanName] = useState('');
  const [unbanSubmitting, setUnbanSubmitting] = useState(false);

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifyRegCode, setVerifyRegCode] = useState('');
  const [verifyDocUrl, setVerifyDocUrl] = useState('');
  const [verifyId, setVerifyId] = useState(null);

  const openVerification = async (item) => {
    setVerifyError('');
    setVerifyLoading(true);
    setVerifyModalOpen(true);
    setVerifyId(item.libraryId);
    try {
      const res = await adminService.getLibraryVerificationDetail(item.libraryId);
      if (res?.success) {
        const d = res?.data?.result ?? res?.result ?? {};
        const reg = d.OfficialLibraryRegCode ?? d.officialLibraryRegCode ?? '';
        const raw = d.DocumentFile ?? d.documentFile ?? '';
        const isAbs = /^https?:\/\//.test(raw);
        const imageBase = import.meta.env.VITE_IMAGE_BASE_URL || '';
        const name = String(raw).replace(/^\/+/, '').replace(/^images\//, '').replace(/^libraryVerifications\//, '');
        const url = isAbs ? raw : `${imageBase}/libraryVerifications/${name}`;
        setVerifyRegCode(reg);
        setVerifyDocUrl(url);
      } else {
        setVerifyError(res?.message || 'Failed to fetch verification detail');
      }
    } catch (err) {
      setVerifyError(err?.message || 'Failed to fetch verification detail');
    } finally {
      setVerifyLoading(false);
    }
  };

  const [filterName, setFilterName] = useState('');
  const [libraryAccess, setLibraryAccess] = useState('All');
  const [libraryStatus, setLibraryStatus] = useState('Active');

  const [pageNumber, setPageNumber] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = async (page = pageNumber, name = filterName, access = libraryAccess, status = libraryStatus, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError('');
    try {
      const res = await adminService.getLibraryList(page, name.trim(), access, status);
      if (res?.success) {
        const r = res.data?.result ?? {};
        const raw = Array.isArray(r.Items) ? r.Items : (Array.isArray(r.items) ? r.items : []);
        const normalized = raw.map(x => ({
          profileId: x.profileId ?? x.ProfileId,
          libraryId: x.libraryId ?? x.LibraryId,
          libraryName: x.libraryName ?? x.LibraryName,
          libraryType: x.libraryType ?? x.LibraryType,
          ownerName: x.ownerName ?? x.OwnerName,
          contactPerson: x.contactPerson ?? x.ContactPerson,
          email: x.email ?? x.Email,
          phoneNumber: x.phoneNumber ?? x.PhoneNumber,
          township: x.township ?? x.Township,
          stateDivision: x.stateDivision ?? x.StateDivision,
          address: x.address ?? x.Address ?? '',
          registeredAt: x.registeredAt ?? x.RegisteredAt,
          libraryAccess: x.libraryAccess ?? x.LibraryAccess,
          libraryStatus: x.libraryStatus ?? x.LibraryStatus,
          libraryVisibility : x.libraryVisibility ?? x.LibraryVisibility,
        }));
        let filtered = normalized;
        setItems(filtered);
        const tp = r.totalPages ?? r.TotalPages ?? 0;
        const ti = r.totalItems ?? r.TotalItems ?? filtered.length;
        const pn = r.pageNumber ?? r.PageNumber ?? page;
        setTotalPages(tp);
        setTotalItems(ti);
        setPageNumber(pn);
      } else {
        setItems([]);
        setError(res?.message || 'Failed to load registrations');
      }
    } catch (err) {
      setItems([]);
      setError(err?.message || 'Failed to load registrations');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Admin Panel';
    fetchData();
  }, []);

  const openBan = (item) => {
    setBanId(item.libraryId);
    setBanName(item.libraryName || '');
    setBanNote('');
    setBanOpen(true);
  };

  const closeBan = () => {
    setBanOpen(false);
    setBanId(null);
    setBanNote('');
  };

  const submitBan = async () => {
    if (!banId) return;
    setBanSubmitting(true);
    setActionMessage('');
    try {
      const res = await adminService.banLibrary(banId, banNote);
      if (res.success) {
        setActionSuccess(true);
        setActionMessage(res.message || 'Banned');
        await fetchData(pageNumber, filterName, libraryAccess, libraryStatus, false);
      } else {
        setActionSuccess(false);
        setActionMessage(res?.message || 'Ban failed');
      }
    } catch (err) {
      setActionSuccess(false);
      setActionMessage(err?.message || 'Ban failed');
    } finally {
      setBanSubmitting(false);
      closeBan();
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  const openUnban = (item) => {
    setUnbanId(item.publicId);
    setUnbanName(item.libraryName || '');
    setUnbanOpen(true);
  };

  const closeUnban = () => {
    setUnbanOpen(false);
    setUnbanId(null);
    setUnbanName('');
  };

  const submitUnban = async () => {
    if (!unbanId) return;
    setUnbanSubmitting(true);
    setActionMessage('');
    try {
      const res = await adminService.unbanLibrary(unbanId);
      if (res.success) {
        setActionSuccess(true);
        setActionMessage(res.message || 'Unbanned');
        await fetchData(pageNumber, filterName, libraryAccess, libraryStatus, false);
      } else {
        setActionSuccess(false);
        setActionMessage(res?.message || 'Unban failed');
      }
    } catch (err) {
      setActionSuccess(false);
      setActionMessage(err?.message || 'Unban failed');
    } finally {
      setUnbanSubmitting(false);
      closeUnban();
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  const submitApprove = async () => {
    if (!verifyId) return;
    setApproveSubmitting(true);
    setApproveError('');
    try {
      const res = await adminService.approveLibrary(verifyId);
      if (res.success) {
        setActionSuccess(true);
        setActionMessage(res.message || 'Approved');
        await fetchData(pageNumber, filterName, libraryAccess, libraryStatus, false);
        setVerifyModalOpen(false)
      } else {
        setApproveError(res?.message || 'Approve failed');
      }
    } catch (err) {
      setApproveError(err?.message || 'Approve failed');
    } finally {
      setApproveSubmitting(false);
      setTimeout(() => setActionMessage(''), 3000);
      setTimeout(() => setApproveError(''), 3000);
    }
  };

  const declineApprove = async () => {
    if (!verifyId) return;
    setDeclineSubmitting(true);
    setDeclineError('');
    try {
      const res = await adminService.declineLibrary(verifyId);
      if (res.success) {
        setActionSuccess(true);
        setActionMessage(res.message || 'Declined');
        await fetchData(pageNumber, filterName, libraryAccess, libraryStatus, false);
        setVerifyModalOpen(false)
      } else {
        setDeclineError(res?.message || 'Decline failed');
      }
    } catch (err) {
      setDeclineError(err?.message || 'Decline failed');
    } finally {
      setDeclineSubmitting(false);
      setTimeout(() => setActionMessage(''), 3000);
      setTimeout(() => setDeclineError(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <AdminNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Registered Libraries</h1>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Search library name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchData(); }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA] bg-white"
              />
              <select
                value={libraryAccess}
                onChange={(e) => setLibraryAccess(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700"
              >
                <option value="All">All Library Access</option>
                <option value="Free">Free</option>
                <option value="Verifying">Verifying</option>
                <option value="Verified">Verified</option>
                <option value="Premium">Premium</option>
              </select>
              <select
                value={libraryStatus}
                onChange={(e) => setLibraryStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700"
              >
                <option value="Active">Active Libraries</option>
                <option value="Banned">Banned</option>
              </select>
              <div className="flex md:justify-end gap-2">
                <button
                  onClick={() => fetchData(1)}
                  className="text-sm px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Search
                </button>
                <button
                  onClick={() => { setFilterName(''); setLibraryAccess('All'); setLibraryStatus('Active'); fetchData(1, '', 'All', 'Active'); }}
                  className="text-sm px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          {actionMessage && (
            <div className={`mb-3 rounded-xl px-4 py-3 text-sm ${actionSuccess ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>
              {actionMessage}
            </div>
          )}
          <div className="bg-white">
            <div className="overflow-x-auto rounded-lg">
              <table className="table-auto w-full text-sm">
                <thead className="bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA] text-white sticky top-0 shadow-sm">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Library Name/Type</th>
                    <th className="px-4 py-2 text-left font-semibold">Owner/Contact</th>
                    <th className="px-4 py-2 text-left font-semibold">Email/Phone</th>
                    <th className="px-4 py-2 text-left font-semibold">Location</th>
                    <th className="px-4 py-2 text-left font-semibold">Access</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-left font-semibold">Visibility</th>
                    <th className="px-4 py-2 text-left font-semibold">Registered</th>
                    <th className="px-4 py-2 text-right font-semibold">Verification</th>
                    <th className="px-4 py-2 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-center text-sm text-gray-700">
                        <div className="inline-flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path></svg>
                          <span>Loading library list...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-center text-sm text-red-700">{error}
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-center text-sm text-gray-700">No library found</td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr key={item.libraryId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">
                          <div className="font-semibold">{item.libraryName}</div>
                          <div className="text-xs">{item.libraryType}</div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-gray-900 font-semibold">{item.ownerName}</div>
                          <div className="text-xs text-gray-600">{item.contactPerson}</div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-gray-700">{item.email}</div>
                          <div className="text-md text-gray-600">{item.phoneNumber}</div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-gray-700">{item.township}</div>
                          <div className="text-xs text-gray-600">{item.stateDivision}</div>
                        </td>
                        <td className="p-2">
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 
                            ${item.libraryAccess === 'Premium' ? 'bg-[#D4AF37] text-gray-700 ring-[#D4AF37]' : 
                              item.libraryAccess === 'Verified' ? 'bg-blue-100 text-blue-700 ring-blue-300' : 
                              'bg-gray-100 text-gray-700 ring-gray-300'}`}
                          >
                            {item.libraryAccess}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 
                            ${item.libraryStatus === 'Active' ? 'bg-green-600 text-white' : 
                              'bg-red-600 text-white'}`}
                          >
                            {item.libraryStatus}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 
                            ${item.libraryVisibility === 'Public' ? 'bg-green-600 text-white' : 
                              'bg-red-600 text-white'}`}
                          >
                            {item.libraryVisibility}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {item.registeredAt ? (
                            <div className="flex flex-col">
                              <span>{new Date(item.registeredAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                              <span className="text-xs text-gray-500">{new Date(item.registeredAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {item.libraryAccess === "Verifying" && 
                            <div className="flex flex-col items-end mb-1">
                              <button
                                  onClick={() => openVerification(item)}
                                  className="px-2 py-1 text-xs rounded-md bg-[#2E6BAA] text-white hover:bg-[#1B4B8A] flex items-center justify-center"
                                >
                                  View
                                </button>
                            </div>
                          }
                        </td>
                        <td className="p-2 text-right relative">
                          <div className="flex flex-col items-end mb-1">
                              <button
                                  onClick={() => navigate(`/PublicProfile/${item.profileId || item.libraryId}`)}
                                  className="px-2 py-1 text-xs rounded-md bg-[#2E6BAA] text-white hover:bg-[#1B4B8A] flex items-center justify-center"
                                >
                                  View Library
                                </button>
                            </div>
                          {item.libraryStatus === 'Active' ? (
                            <div className="flex flex-col items-end">
                              <button
                                onClick={() => openBan(item)}

                                className="px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                              >
                                Ban
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end">
                              <button
                                onClick={() => openUnban(item)}

                                className="px-2 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
                              >
                                UnBan
                              </button>
                            </div>
                          )}

                          {/* {item.status === 'Approved' ? (
                            <div className="flex flex-col items-end gap-2">
                              <button
                                onClick={() => openBan(item)}

                                className="px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                              >
                                Ban
                              </button>
                            </div>
                          ) : item.status === 'Banned' ? (
                            <div className="flex flex-col items-end gap-2">
                              <button
                                onClick={() => openUnban(item)}

                                className="px-2 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
                              >
                                UnBan
                              </button>
                            </div>
                          ) : item.status === 'Declined' ? 
                          <div>
                            <button
                                onClick={() => openApprove(item)}
                                className="px-2 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
                              >
                                Approve
                              </button>
                          </div> : (
                            <div className="flex flex-col items-end gap-1">
                              <button
                                onClick={() => openApprove(item)}
                                className="px-2 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openDecline(item)}
                                className="px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                              >
                                Decline
                              </button>
                            </div>
                          )} */}

                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 flex items-center justify-between bg-white">
              <div className="text-sm text-gray-700">
                Page {pageNumber} of {totalPages} • {totalItems} total libraries
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>{ if(pageNumber>1) fetchData(pageNumber-1); }} disabled={pageNumber<=1 || isLoading} className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50">Prev</button>
                <button onClick={()=>{ if(totalPages===0 || pageNumber>=totalPages) return; fetchData(pageNumber+1); }} disabled={pageNumber>=totalPages || isLoading} className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {banOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 bg-red-50 text-red-800 ring-1 ring-red-200 flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/60 text-current">
                <FiAlertTriangle size={18} />
              </div>
              <h2 className="text-sm font-semibold text-current">Ban Library</h2>
            </div>
            <div className="p-4">
              <div className="mb-2 text-sm text-gray-800">Are you sure you want to ban {<strong>{banName}</strong> || 'this library'}?</div>
              <label className="text-sm text-gray-700">Reason (optional)</label>
              <textarea
                maxLength={300}
                className="mt-2 w-full h-28 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                value={banNote}
                onChange={(e) => setBanNote(e.target.value)}
              />
              <div className="mt-1 text-xs text-gray-500">{banNote.length}/300</div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
              <button onClick={closeBan} className="px-3 py-1.5 text-sm rounded-lg bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100">Cancel</button>
              <button
                onClick={submitBan}
                disabled={banSubmitting}
                className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {banSubmitting ? 'Submitting...' : 'Ban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {unbanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 bg-red-50 text-red-800 ring-1 ring-red-200 flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/60 text-current">
                <FiAlertTriangle size={18} />
              </div>
              <h2 className="text-sm font-semibold text-current">Unban Library</h2>
            </div>
            <div className="p-4">
              <div className="mb-2 text-sm text-gray-800">Are you sure you want to unban {<strong>{unbanName}</strong> || 'this library'}?</div>
              
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
              <button onClick={closeUnban} className="px-3 py-1.5 text-sm rounded-lg bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100">Cancel</button>
              <button
                onClick={submitUnban}
                disabled={unbanSubmitting}
                className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              >
                {unbanSubmitting ? 'Submitting...' : 'Unban'}
              </button>
            </div>
          </div>
        </div>
      )}

    {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 text-blue-800 ring-1 ring-blue-200">
              <h2 className="text-sm font-semibold">Verification Detail</h2>
            </div>
            <div className="p-4">
              {verifyLoading ? (
                <div className="flex items-center justify-center h-24">
                  <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path></svg>
                </div>
              ) : verifyError ? (
                <div className="text-sm text-red-700">{verifyError}</div>
              ) : (
                <>
                  <div className="mb-3 text-sm text-gray-800"><strong>Official Code:</strong> {verifyRegCode || '—'}</div>
                  {verifyDocUrl ? (
                    /\.pdf$/i.test(verifyDocUrl) ? (
                      <div className="h-[420px]"><iframe src={verifyDocUrl} title="Verification Document" className="w-full h-full" /></div>
                    ) : (
                      <div className="rounded-md overflow-hidden ring-1 ring-gray-100"><img src={verifyDocUrl} alt="Verification Document" className="w-full object-contain" /></div>
                    )
                  ) : (
                    <div className="text-sm text-gray-600">No document provided.</div>
                  )}
                </>
              )}
            </div>
            <div className="flex border-t border-gray-200 bg-gray-50">
              <div className="px-4 py-3 text-sm text-red-700 align-middle ">{approveError || declineError}</div>
              <div className="px-4 py-3 flex ml-auto gap-2">
                <button onClick={() => { setVerifyModalOpen(false); setVerifyError(''); }} className="px-3 py-1.5 text-sm rounded-lg bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100">Close</button>
                <button
                  onClick={() => { submitApprove() }}
                  disabled={approveSubmitting || declineSubmitting}
                  className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
                    {approveSubmitting ? 'Approving...' : 'Approve'}
                </button>
                <button
                onClick={() => { declineApprove() }}
                disabled={approveSubmitting || declineSubmitting}
                className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">
                  {declineSubmitting ? 'Declining...' : 'Decline'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Libraries;