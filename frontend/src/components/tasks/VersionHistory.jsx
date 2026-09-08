import { History, X } from 'lucide-react';

const VersionHistory = ({ ticket, isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-xl max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2"><History size={16} /> Historial de Cambios</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-4">
          {ticket?.versionHistory?.map((v, i) => (
            <div key={i} className="mb-3 p-2 border-b">
              <p className="text-sm">Versión {v.version}</p>
              <p className="text-xs text-gray-500">{new Date(v.date).toLocaleString()}</p>
              <p className="text-xs">{v.changes}</p>
              <p className="text-xs text-gray-400">Por: {v.user}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;