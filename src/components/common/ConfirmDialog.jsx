import { FiAlertTriangle, FiInfo, FiCheckCircle } from 'react-icons/fi';

const ConfirmDialog = ({
  open,
  title = 'Confirm',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const variants = {
    default: { header: 'bg-blue-50 text-blue-800 ring-1 ring-blue-200', icon: <FiInfo size={18} /> },
    warning: { header: 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200', icon: <FiAlertTriangle size={18} /> },
    danger: { header: 'bg-red-50 text-red-800 ring-1 ring-red-200', icon: <FiAlertTriangle size={18} /> },
  };
  const v = variants[variant] || variants.default;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
        <div className={`px-4 py-3 flex items-center gap-2 ${v.header}`}>
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/60 text-current">
            {v.icon}
          </div>
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        <div className="p-4">
          {typeof message === 'string' ? (
            <p className="text-sm text-gray-800">{message}</p>
          ) : (
            message
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm rounded-lg bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;