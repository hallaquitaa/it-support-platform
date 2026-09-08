import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import Modal from './Modal';

export default function AlertModal({ isOpen, onClose, title, message, type = 'success' }) {
  const icons = {
    success: { icon: CheckCircle, color: 'text-green-600' },
    error: { icon: XCircle, color: 'text-red-600' },
    warning: { icon: AlertCircle, color: 'text-yellow-600' },
    info: { icon: Info, color: 'text-blue-600' }
  };

  const Icon = icons[type].icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${icons[type].color}`} />
          <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="btn-primary px-6 py-2 text-sm">
            Aceptar
          </button>
        </div>
      </div>
    </Modal>
  );
}