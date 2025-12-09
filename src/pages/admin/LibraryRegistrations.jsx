import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminNavbar from '../../components/admin/AdminNavbar';

const statusColor = (s) => {
  if (s === 'Approved') return 'text-green-700 bg-green-100';
  if (s === 'Declined') return 'text-yellow-700 bg-yellow-100';
  if (s === 'Banned') return 'text-red-700 bg-red-100';
  return 'text-gray-700 bg-gray-100';
};

const LibraryRegistrations = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    const res = await adminService.getLibraryList(1, '', 'All');
    const list = res?.data?.result ?? res?.data ?? [];
    setItems(Array.isArray(list) ? list : (list.items ?? []));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const act = async (id, action) => {
    setActionLoading(id + ':' + action);
    const res = await adminService.updateRegistrationStatus(id, action);
    if (res.success) {
      setItems(items.map(x => x.registerPkid === id ? { ...x, status: action === 'approve' ? 'Approved' : action === 'decline' ? 'Declined' : 'Banned', reviewedByAdmin: true } : x));
    }
    setActionLoading(null);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F2F2F2]">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <AdminNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 lg:ml-64 mt-16 transition-all duration-300 overflow-y-auto">
        <div className="p-4 lg:px-8">
          <div className="mb-5">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4B8A] to-[#2E6BAA]">Library Registrations</h1>
            <p className="text-sm sm:text-base text-[#1B4B8A]">Review and manage registration requests</p>
          </div>
          <div className="bg-white/95 rounded-2xl shadow-xl ring-1 ring-gray-100">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2E6BAA]"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[1200px] w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Library</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Owner</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Contact</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Location</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map(item => (
                      <tr key={item.registerPkid} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{item.libraryName}</div>
                          <div className="text-xs text-gray-500">{item.registrationNumber}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{item.libraryType}</td>
                        <td className="px-4 py-3 text-gray-700">{item.ownerName}</td>
                        <td className="px-4 py-3 text-gray-700">{item.contactPerson}</td>
                        <td className="px-4 py-3 text-gray-700">{item.email}</td>
                        <td className="px-4 py-3 text-gray-700">{item.phoneNumber}</td>
                        <td className="px-4 py-3 text-gray-700">{item.township}, {item.stateDivision}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-md text-xs ${statusColor(item.status)}`}>{item.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => act(item.registerPkid, 'approve')}
                              disabled={actionLoading === item.registerPkid + ':approve'}
                              className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => act(item.registerPkid, 'decline')}
                              disabled={actionLoading === item.registerPkid + ':decline'}
                              className="px-3 py-1 text-sm text-white bg-yellow-600 hover:bg-yellow-700 rounded-md disabled:opacity-60"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => act(item.registerPkid, 'ban')}
                              disabled={actionLoading === item.registerPkid + ':ban'}
                              className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-60"
                            >
                              Ban
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryRegistrations;