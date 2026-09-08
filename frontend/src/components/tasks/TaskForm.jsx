import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PRIORITIES } from '../../pages/TasksPage';

export default function TaskForm({ task, onClose, onSave, branches = [] }) {
  const [formData, setFormData] = useState({
    title: '', 
    description: '', 
    priority: 'medium', 
    branch_id: '', 
    due_date: '',
    assigned_to: '',
    type: 'network'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        branch_id: task.branch_id || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        assigned_to: task.assigned_to || '',
        type: task.type || 'network'
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const priorityOptions = Object.entries(PRIORITIES).map(([key, p]) => ({
    value: key,
    label: `${p.level} - ${p.name}`
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-slate-800">
            {task ? 'Editar Ticket' : 'Nuevo Ticket'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input
            type="text"
            placeholder="Título *"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          
          <textarea
            placeholder="Descripción"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            rows="3"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            
            <select
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="network">Red</option>
              <option value="hardware">Hardware</option>
              <option value="server">Servidor</option>
              <option value="database">Base de Datos</option>
              <option value="security">Seguridad</option>
              <option value="wifi">WiFi</option>
              <option value="desktop">Desktop</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.branch_id}
              onChange={e => setFormData({...formData, branch_id: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Seleccionar sucursal</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            
            <input
              type="date"
              value={formData.due_date}
              onChange={e => setFormData({...formData, due_date: e.target.value})}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}