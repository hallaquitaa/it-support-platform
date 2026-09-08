import { User } from 'lucide-react';

const MyTickets = ({ assignedCount = 3, pendingCount = 1, userName = 'JD' }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-700">Mis Tickets Asignados</h3>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
          {userName}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{assignedCount}</p>
      <p className="text-sm text-slate-500 mt-1">Pendientes: {pendingCount}</p>
      <div className="mt-3">
        <button className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          Ver mis tickets →
        </button>
      </div>
    </div>
  );
};

export default MyTickets;