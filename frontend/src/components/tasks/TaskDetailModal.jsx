import { X, Clock, MapPin, Calendar, User, AlertTriangle } from 'lucide-react';
import { PRIORITIES, INCIDENT_TYPES } from '../../pages/TasksPage';

const TaskDetailModal = ({ ticket, onClose, onEdit, onDelete }) => {
  const priority = PRIORITIES[ticket.priority] || PRIORITIES.medium;
  const type = INCIDENT_TYPES[ticket.type] || INCIDENT_TYPES.network;
  const TypeIcon = type.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-5 border-b">
          <div className="flex items-center gap-2">
            <TypeIcon size={20} className={type.textColor} />
            <h3 className="text-lg font-bold text-slate-800">Ticket #{ticket.id}</h3>
            <div className={`px-2 py-0.5 rounded-full ${priority.bgClass}`}>
              <span className={`text-xs font-bold ${priority.textColor}`}>{priority.level}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div>
            <h4 className="font-semibold text-slate-800 text-lg">{ticket.title}</h4>
            {ticket.description && (
              <p className="text-slate-600 text-sm mt-2">{ticket.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-slate-400" />
              <span className="text-slate-600">Creado: {new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            {ticket.due_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-slate-600">Vence: {new Date(ticket.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {ticket.branch_name && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-slate-600">{ticket.branch_name}</span>
              </div>
            )}
            {ticket.assignee_name && (
              <div className="flex items-center gap-2 text-sm">
                <User size={14} className="text-slate-400" />
                <span className="text-slate-600">Asignado: {ticket.assignee_name}</span>
              </div>
            )}
          </div>
          
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Prioridad</span>
              <span className={`font-semibold ${priority.textColor}`}>{priority.name}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-slate-500">Tipo</span>
              <span className="font-semibold">{type.label}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onEdit} className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
            Editar
          </button>
          <button onClick={onDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;