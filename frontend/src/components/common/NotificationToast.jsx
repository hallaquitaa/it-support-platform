import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const NotificationToast = ({ notifications, onDismiss }) => {
  const getIcon = (type) => {
    if (type === 'success') return <CheckCircle size={16} className="text-green-500" />;
    if (type === 'error') return <AlertCircle size={16} className="text-red-500" />;
    return <Info size={16} className="text-blue-500" />;
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {(notifications || []).filter(n => !n.read).slice(0, 5).map(notif => (
        <div key={notif.id} className="p-3 rounded-lg shadow-lg border bg-white border-gray-200 min-w-[280px]">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2"><div className="mt-0.5">{getIcon(notif.type)}</div><div><p className="text-sm font-medium text-gray-800">{notif.message}</p></div></div>
            <button onClick={() => onDismiss(notif.id)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;