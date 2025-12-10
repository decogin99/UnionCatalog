import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

const LibraryRegistrations = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineId, setDeclineId] = useState(null);
  const [declineNote, setDeclineNote] = useState('');
  const [declineSubmitting, setDeclineSubmitting] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [banId, setBanId] = useState(null);
  const [banNote, setBanNote] = useState('');
  const [banSubmitting, setBanSubmitting] = useState(false);

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterName, setFilterName] = useState('');
  const [filterEmailVerified, setFilterEmailVerified] = useState('All');

  const fetchData = async (name = filterName, status = filterStatus, emailFilter = filterEmailVerified) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await adminService.getLibraryList(1, name.trim(), status);
      if (res?.success) {
        const list = res.data?.result ?? [];
        const raw = Array.isArray(list) ? list : (list.items ?? []);
        let filtered = raw;
        if (emailFilter !== 'All') {
          const want = emailFilter === 'Verified';
          filtered = raw.filter(x => !!x.isEmailVerified === want);
        }
        setItems(filtered);
      } else {
        setItems([]);
        setError(res?.message || 'Failed to load registrations');
      }
    } catch (err) {
      setItems([]);
      setError(err?.message || 'Failed to load registrations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const act = async (id, action) => {
    setActionLoading(id + ':' + action);
    setActionMessage('');
    try {
      let res;
      if (action === 'approve') {
        res = await adminService.approveLibrary(id);
      } else if (action === 'ban') {
        const note = window.prompt('Enter ban note (optional):', '');
        if (note === null) { setActionLoading(null); return; }
        res = await adminService.banLibrary(id, note);
      } else if (action === 'unban') {
        res = await adminService.unbanLibrary(id);
      } else {
        res = await adminService.updateRegistrationStatus(id, action);
      }

      if (res.success) {
        setActionSuccess(true);
        if (action !== 'approve') {
          setActionMessage(res.message || 'Action completed');
        }
        await fetchData();
      } else {
        setActionSuccess(false);
        setActionMessage(res?.message || 'Action failed');
      }
    } catch (err) {
      setActionSuccess(false);
      setActionMessage(err?.message || 'Action failed');
    } finally {
      setActionLoading(null);
      if (actionMessage) {
        setTimeout(() => setActionMessage(''), 3000);
      }
    }
  };

  const openDecline = (id) => {
    setDeclineId(id);
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
        await fetchData();
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

  const openBan = (id) => {
    setBanId(id);
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
        await fetchData();
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
                  onClick={() => fetchData()}
                  className="text-sm px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Search
                </button>
                <button
                  onClick={() => { setFilterName(''); setFilterStatus('All'); setFilterEmailVerified('All'); fetchData('', 'All', 'All'); }}
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
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-800">Reg No</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-800">Library</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-800">Type</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-800">Owner/Contact</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-800">Email/Phone</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-800">Location</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-800">Status</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-800">Registered At</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-800">Account & Document</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
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
                          <div className={item.status === 'Approved' ? 'text-green-700' : 'text-red-700'}>{item.status}</div>
                          {(item.status === 'Declined' || item.status === 'Banned') && item.adminNotes && (
                            <div className="mt-1 text-xs text-gray-600"><strong>Note:</strong> {item.adminNotes}</div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{item.registeredAt ? new Date(item.registeredAt).toLocaleString() : '—'}</td>
                        <td className="px-4 py-2 text-right">
                          <div className="text-gray-900 font-medium">
                            {item.documentFile ? (
                              <span>{item.documentFile}</span>
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
                                onClick={() => openBan(item.publicId)}
                                disabled={actionLoading && actionLoading.split(':')[0] === item.publicId}
                                className="w-18 px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
                              >
                                Ban
                              </button>
                            </div>
                          ) : item.status === 'Banned' ? (
                            <div className="flex flex-col items-end gap-2">
                              <button
                                onClick={() => act(item.publicId, 'unban')}
                                disabled={actionLoading && actionLoading.split(':')[0] === item.publicId}
                                className="w-18 px-3 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded flex items-center justify-center"
                              >
                                {actionLoading === item.publicId + ':unban' ? (
                                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                                  </svg>
                                ) : (
                                  'UnBan'
                                )}
                              </button>
                            </div>
                          ) : item.status === 'Declined' ? 
                          <div>
                            <button
                                onClick={() => act(item.publicId, 'approve')}
                                disabled={actionLoading && actionLoading.split(':')[0] === item.publicId}
                                className="w-18 px-3 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded flex items-center justify-center"
                              >
                                {actionLoading === item.publicId + ':approve' ? (
                                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                                  </svg>
                                ) : (
                                  'Approve'
                                )}
                              </button>
                          </div> : (
                            <div className="flex flex-col items-end gap-2">
                              <button
                                onClick={() => act(item.publicId, 'approve')}
                                disabled={actionLoading && actionLoading.split(':')[0] === item.publicId}
                                className="w-18 px-3 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded flex items-center justify-center"
                              >
                                {actionLoading === item.publicId + ':approve' ? (
                                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                                  </svg>
                                ) : (
                                  'Approve'
                                )}
                              </button>
                              <button
                                onClick={() => openDecline(item.publicId)}
                                disabled={actionLoading && actionLoading.split(':')[0] === item.publicId}
                                className="w-18 px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {actionLoading && actionLoading.split(':')[0] === item.publicId && !actionLoading.endsWith(':approve') && !actionLoading.endsWith(':unban') && (
                            <div className="absolute top-2 right-2">
                              <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0a12 12 0 100 24v-4a8 8 0 01-8-8z"></path>
                              </svg>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {declineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg">
            <div className="px-4 py-3 border-b">
              <h2 className="text-sm font-semibold text-gray-900">Decline Registration</h2>
            </div>
            <div className="p-4">
              <label className="text-sm text-gray-700">Reason (optional)</label>
              <textarea
                className="mt-2 w-full h-28 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
              />
            </div>
            <div className="px-4 py-3 border-t flex justify-end gap-2">
              <button onClick={closeDecline} className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
              <button
                onClick={submitDecline}
                disabled={declineSubmitting}
                className="px-3 py-1 text-sm rounded bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-60"
              >
                {declineSubmitting ? 'Submitting...' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {banOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg">
            <div className="px-4 py-3 border-b">
              <h2 className="text-sm font-semibold text-gray-900">Ban Library</h2>
            </div>
            <div className="p-4">
              <label className="text-sm text-gray-700">Reason (optional)</label>
              <textarea
                className="mt-2 w-full h-28 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E6BAA]"
                value={banNote}
                onChange={(e) => setBanNote(e.target.value)}
              />
            </div>
            <div className="px-4 py-3 border-t flex justify-end gap-2">
              <button onClick={closeBan} className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
              <button
                onClick={submitBan}
                disabled={banSubmitting}
                className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {banSubmitting ? 'Submitting...' : 'Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryRegistrations;