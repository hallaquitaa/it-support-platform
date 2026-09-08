import { AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Eliminar Ticket</h3>
        </div>
        
        <p className="text-slate-600 mb-6">
          ¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.
        </p>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;