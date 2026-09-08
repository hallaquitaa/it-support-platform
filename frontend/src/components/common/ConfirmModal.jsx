import { AlertCircle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Eliminar', type = 'danger' }) {
  const colors = {
    danger: { bg: 'bg-red-600 hover:bg-red-700', text: 'text-red-600' },
    warning: { bg: 'bg-yellow-600 hover:bg-yellow-700', text: 'text-yellow-600' },
    info: { bg: 'bg-blue-600 hover:bg-blue-700', text: 'text-blue-600' }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <AlertCircle className={`w-6 h-6 ${colors[type].text}`} />
          <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 py-2 text-sm">
            Cancelar
          </button>
          <button onClick={onConfirm} className={`${colors[type].bg} text-white px-4 py-2 rounded-lg flex-1 text-sm transition`}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}