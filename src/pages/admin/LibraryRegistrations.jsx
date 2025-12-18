import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FiAlertTriangle } from 'react-icons/fi';

const LibraryRegistrations = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionMessage, setActionMessage] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  const [approveOpen, setApproveOpen] = useState(false);
  const [approveId, setApproveId] = useState(null);

  const [approveMessage, setApproveMessage] = useState(null);
  const [approveVariant, setApproveVariant] = useState('default');
  const [approveSubmitting, setApproveSubmitting] = useState(false);

  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineId, setDeclineId] = useState(null);
  const [declineNote, setDeclineNote] = useState('');
  const [declineName, setDeclineName] = useState('');
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

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docUrl, setDocUrl] = useState('');

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterName, setFilterName] = useState('');
  const [filterEmailVerified, setFilterEmailVerified] = useState('All');

  const [pageNumber, setPageNumber] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = async (page = pageNumber, name = filterName, status = filterStatus, emailFilter = filterEmailVerified, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError('');
    try {
      const emailVerifiedParam = emailFilter === 'All' ? undefined : (emailFilter === 'Verified');
      const res = await adminService.getLibraryList(page, name.trim(), status, emailVerifiedParam);
      if (res?.success) {
        const r = res.data?.result ?? {};
        const raw = Array.isArray(r.Items) ? r.Items : (Array.isArray(r.items) ? r.items : []);
        const normalized = raw.map(x => ({
          publicId: x.publicId ?? x.PublicId,
          registrationNumber: x.registrationNumber ?? x.RegistrationNumber,
          libraryName: x.libraryName ?? x.LibraryName,
          libraryType: x.libraryType ?? x.LibraryType,
          ownerName: x.ownerName ?? x.OwnerName,
          contactPerson: x.contactPerson ?? x.ContactPerson,
          email: x.email ?? x.Email,
          phoneNumber: x.phoneNumber ?? x.PhoneNumber,
          township: x.township ?? x.Township,
          stateDivision: x.stateDivision ?? x.StateDivision,
          address: x.address ?? x.Address ?? '',
          documentFile: x.documentFile ?? x.DocumentFile ?? '',
          registeredAt: x.registeredAt ?? x.RegisteredAt,
          isGoogleUser: x.isGoogleUser ?? x.IsGoogleUser,
          isEmailVerified: x.isEmailVerified ?? x.IsEmailVerified,
          status: x.status ?? x.Status,
          adminNotes: x.adminNotes ?? x.AdminNotes ?? '',
        }));
        let filtered = normalized;
        if (emailFilter !== 'All') {
          const want = emailFilter === 'Verified';
          filtered = normalized.filter(x => !!x.isEmailVerified === want);
        }
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
    fetchData();
  }, []);

  const openDecline = (item) => {
    setDeclineId(item.publicId);
    setDeclineName(item.libraryName || '');
    setDeclineNote('');
    setDeclineOpen(true);
  };

  const closeDecline = () => {
    setDeclineOpen(false);
    setDeclineId(null);
    setDeclineNote('');
  };

  const submitDecline = async () => {
    if (!declineId) return;
    setDeclineSubmitting(true);
    setActionMessage('');
    try {
      const res = await adminService.declineRegistration(declineId, declineNote);
      if (res.success) {
        setActionSuccess(true);
        setActionMessage(res.message || 'Declined');
        await fetchData(pageNumber, filterName, filterStatus, filterEmailVerified, false);
      } else {
        setActionSuccess(false);
        setActionMessage(res?.message || 'Decline failed');
      }
    } catch (err) {
      setActionSuccess(false);
      setActionMessage(err?.message || 'Decline failed');
    } finally {
      setDeclineSubmitting(false);
      closeDecline();
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  const openBan = (item) => {
    setBanId(item.publicId);
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
        await fetchData(pageNumber, filterName, filterStatus, filterEmailVerified, false);
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
        await fetchData(pageNumber, filterName, filterStatus, filterEmailVerified, false);
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

  const openApprove = (item) => {
    setApproveId(item.publicId);

    const notVerified = !item.isEmailVerified;
    const noDoc = !item.documentFile;
    const name = item.libraryName || 'this library';
    let v = 'default';
    let msgNode;
    if (notVerified && noDoc) {
      msgNode = (
        <span className="text-sm text-gray-800">
          This library <strong className="font-semibold">({name})</strong> email is not verified and no document is attached. Approve this registration?
        </span>
      );
      v = 'danger';
    } else if (notVerified) {
      msgNode = (
        <span className="text-sm text-gray-800">
          This library <strong className="font-semibold">({name})</strong> email is not verified. Approve this registration?
        </span>
      );
      v = 'warning';
    } else if (noDoc) {
      msgNode = (
        <span className="text-sm text-gray-800">
          This library <strong className="font-semibold">({name})</strong> has no document attached. Approve this registration?
        </span>
      );
      v = 'warning';
    } else {
      msgNode = (
        <span className="text-sm text-gray-800">
          Are you sure you want to approve this library <strong className="font-semibold">({name})</strong> registration?
        </span>
      );
      v = 'default';
    }
    setApproveVariant(v);
    setApproveMessage(msgNode);
    setApproveOpen(true);
  };

  const closeApprove = () => {
    setApproveOpen(false);
    setApproveId(null);

    setApproveMessage(null);
    setApproveVariant('default');
  };

  const submitApprove = async () => {
    if (!approveId) return;
    setApproveSubmitting(true);
    setActionMessage('');
    try {
      const res = await adminService.approveLibrary(approveId);
      if (res.success) {
        setActionSuccess(true);
        setActionMessage(res.message || 'Approved');
        await fetchData(pageNumber, filterName, filterStatus, filterEmailVerified, false);
      } else {
        setActionSuccess(false);
        setActionMessage(res?.message || 'Approve failed');
      }
    } catch (err) {
      setActionSuccess(false);
      setActionMessage(err?.message || 'Approve failed');
    } finally {
      setApproveSubmitting(false);
      closeApprove();
      setTimeout(() => setActionMessage(''), 3000);
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Declined">Declined</option>
                <option value="Banned">Banned</option>
              </select>
              <select
                value={filterEmailVerified}
                onChange={(e) => setFilterEmailVerified(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700"
              >
                <option value="All">All Emails</option>
                <option value="Verified">Email Verified</option>
                <option value="NotVerified">Email Not Verified</option>
              </select>
              <div className="flex md:justify-end gap-2">
                <button
                  onClick={() => fetchData(1)}
                  className="text-sm px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Search
                </button>
                <button
                  onClick={() => { setFilterName(''); setFilterStatus('All'); setFilterEmailVerified('All'); fetchData(1, '', 'All', 'All'); }}
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
                    <th className="px-4 py-2 text-left font-semibold">Reg No</th>
                    <th className="px-4 py-2 text-left font-semibold">Library</th>
                    <th className="px-4 py-2 text-left font-semibold">Type</th>
                    <th className="px-4 py-2 text-left font-semibold">Owner/Contact</th>
                    <th className="px-4 py-2 text-left font-semibold">Email/Phone</th>
                    <th className="px-4 py-2 text-left font-semibold">Location</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-left font-semibold">Registered At</th>
                    <th className="px-4 py-2 text-right font-semibold">Account & Document</th>
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
                      <td colSpan={10} className="px-4 py-6 text-center text-sm text-red-700">{error}</td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-center text-sm text-gray-700">No library found</td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr key={item.publicId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-700">{item.registrationNumber}</td>
                        <td className="px-4 py-2 text-gray-900 font-semibold">{item.libraryName}</td>
                        <td className="px-4 py-2 text-gray-700">{item.libraryType}</td>
                        <td className="px-4 py-2">
                          <div className="text-gray-900 font-semibold">{item.ownerName}</div>
                          <div className="text-xs text-gray-600">{item.contactPerson}</div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-gray-700">{item.email}</div>
                          <div className="text-xs text-gray-600">{item.phoneNumber}</div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-gray-700">{item.township}</div>
                          <div className="text-xs text-gray-600">{item.stateDivision}</div>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ring-1 ${item.status==='Approved' ? 'bg-green-50 text-green-700 ring-green-200' : item.status==='Pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-200' : item.status==='Declined' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-red-50 text-red-700 ring-red-200'}`}>{item.status}</span>
                          {(item.status === 'Declined' || item.status === 'Banned') && item.adminNotes && (
                            <div className="mt-1 text-xs text-gray-600"><strong>Note:</strong> {item.adminNotes}</div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{item.registeredAt ? new Date(item.registeredAt).toLocaleString() : '—'}</td>
                        <td className="px-4 py-2 text-right">
                          <div className="text-gray-900 font-medium">
                            {item.documentFile ? (
                              <span>
                                <button
                                  onClick={() => {
                                    const raw = item.documentFile || '';
                                    const isAbs = /^https?:\/\//.test(raw);
                                    const base = (import.meta.env.VITE_IMAGE_BASE_URL || '').replace(/\/+$/, '');
                                    const name = raw.replace(/^\/+/, '').replace(/^images\//, '').replace(/^libraryRegisterDocs\//, '');
                                    const u = isAbs ? raw : `${base}/libraryRegisterDocs/${name}`;
                                    setDocUrl(u);
                                    setDocModalOpen(true);
                                  }}
                                  className="ml-2 text-[#2E6BAA] hover:underline"
                                >
                                  View
                                </button>
                              </span>
                            ) : (
                              'No Document'
                            )}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">Google User: <span className={item.isGoogleUser ? 'text-green-700' : 'text-red-700'}>{item.isGoogleUser ? 'Yes' : 'No'}</span></div>
                          <div className="text-xs text-gray-600">Email Verified: <span className={item.isEmailVerified ? 'text-green-700' : 'text-red-700'}>{item.isEmailVerified ? 'Yes' : 'No'}</span></div>
                        </td>
                        <td className="px-4 py-2 text-right relative">
                          {item.status === 'Approved' ? (
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
                          )}

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

      {approveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className={`px-4 py-3 ${approveVariant === 'danger' ? 'bg-red-50 text-red-800 ring-1 ring-red-200' : approveVariant === 'warning' ? 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200' : 'bg-green-50 text-green-800 ring-1 ring-green-200'} flex items-center gap-2`}>
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/60 text-current">
                <FiAlertTriangle size={18} />
              </div>
              <h2 className="text-sm font-semibold text-current">Approve Library</h2>
            </div>
            <div className="p-4">
              {approveMessage}
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
              <button onClick={closeApprove} className="px-3 py-1.5 text-sm rounded-lg bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100">Cancel</button>
              <button
                onClick={submitApprove}
                disabled={approveSubmitting}
                className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              >
                {approveSubmitting ? 'Submitting...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {declineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 bg-red-50 text-red-800 ring-1 ring-red-200 flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/60 text-current">
                <FiAlertTriangle size={18} />
              </div>
              <h2 className="text-sm font-semibold text-current">Decline Registration</h2>
            </div>
            <div className="p-4">
              <div className="mb-2 text-sm text-gray-800">Are you sure you want to decline {<strong>{declineName}</strong> || 'this registration'}?</div>
              <label className="text-sm text-gray-700">Reason (optional)</label>
              <textarea
                maxLength={300}
                className="mt-2 w-full h-28 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
              />
              <div className="mt-1 text-xs text-gray-500">{declineNote.length}/300</div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
              <button onClick={closeDecline} className="px-3 py-1.5 text-sm rounded-lg bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100">Cancel</button>
              <button
                onClick={submitDecline}
                disabled={declineSubmitting}
                className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {declineSubmitting ? 'Submitting...' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {docModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA] text-white flex items-center justify-between">
              <h2 className="text-sm font-semibold">Attached Document</h2>
              <button onClick={() => setDocModalOpen(false)} className="text-white hover:text-gray-200 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-4">
              {docUrl ? (
                <img src={docUrl} alt="Document" className="max-h-[70vh] w-full object-contain rounded-md ring-1 ring-gray-200" />
              ) : (
                <div className="text-sm text-gray-600">No document to display</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LibraryRegistrations;