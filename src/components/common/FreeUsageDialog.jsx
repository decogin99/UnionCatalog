import { FiInfo } from 'react-icons/fi';

const FreeUsageDialog = ({
  open,
  onVerify,
  onClose,
  libraryName = '',
  userType = 'Free',
  title = 'Limited Access',
}) => {
  if (!open) return null;

  const headerClass =
    userType === 'Premium'
      ? 'bg-purple-50 text-purple-800 ring-1 ring-purple-200'
      : userType === 'ProfileVerified'
      ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-200'
      : 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200';

  const tierText =
    userType === 'Premium'
      ? 'You are on the Premium plan.'
      : userType === 'ProfileVerified'
      ? 'Your profile is verified.'
      : 'Your library has only trial usage access.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className={`px-4 py-3 flex items-center gap-2 ${headerClass}`}>
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/60 text-current">
            <FiInfo size={18} />
          </div>
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>

        <div className="p-5 space-y-3">
          <div className="text-sm text-gray-800">
            {libraryName ? `${libraryName}: ` : ''}{tierText} Verify your library to unlock full access to advanced features, higher limits, and priority support.
          </div>
          <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
            <li>Access advanced search and excel export for any books</li>
            <li>Access barcode and label generator</li>
            <li>Display and get "Verified" badge on your library profile</li>
            <li>Explore more detail about DDC classification system</li>
            <li>Increase data limits and remove usage restrictions</li>
            <li>Get priority support and faster issue resolution</li>
          </ul>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-lg bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
          >
            Later
          </button>
          <button
            type="button"
            onClick={onVerify}
            className="px-3 py-1.5 text-sm rounded-lg bg-[#2E6BAA] text-white hover:bg-opacity-90"
          >
            Verify Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeUsageDialog;