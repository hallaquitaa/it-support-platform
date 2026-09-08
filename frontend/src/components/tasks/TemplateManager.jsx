import { useState } from 'react';
import { Layers, X } from 'lucide-react';

const TemplateManager = ({ templates, onUseTemplate, onSaveTemplate, isDarkMode, onClose }) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', category: 'pos', description: '', steps: [] });
  const [stepInput, setStepInput] = useState('');

  const addStep = () => { if (stepInput.trim()) { setNewTemplate(prev => ({ ...prev, steps: [...prev.steps, stepInput.trim()] })); setStepInput(''); } };
  const saveTemplate = () => { if (newTemplate.name.trim()) { onSaveTemplate({ id: Date.now(), ...newTemplate }); setNewTemplate({ name: '', category: 'pos', description: '', steps: [] }); setShowNewForm(false); } };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center p-4 border-b"><h2 className="text-lg font-semibold flex items-center gap-2"><Layers size={18} /> Plantillas</h2><button onClick={onClose}><X size={18} /></button></div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <button onClick={() => setShowNewForm(true)} className="w-full mb-3 p-3 border-2 border-dashed rounded-lg text-center text-indigo-600 hover:bg-indigo-50">+ Nueva Plantilla</button>
          {showNewForm && (<div className="p-3 rounded-lg mb-3 bg-gray-50"><input type="text" placeholder="Nombre" value={newTemplate.name} onChange={e => setNewTemplate(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 mb-2 rounded-lg border" /><input type="text" placeholder="Descripción" value={newTemplate.description} onChange={e => setNewTemplate(prev => ({ ...prev, description: e.target.value }))} className="w-full p-2 mb-2 rounded-lg border" /><div className="flex gap-2 mb-2"><input type="text" placeholder="Agregar paso" value={stepInput} onChange={e => setStepInput(e.target.value)} className="flex-1 p-2 rounded-lg border" onKeyPress={e => e.key === 'Enter' && addStep()} /><button onClick={addStep} className="px-3 py-2 bg-indigo-600 text-white rounded-lg">+</button></div><div className="flex gap-2 mt-3"><button onClick={() => setShowNewForm(false)} className="flex-1 p-2 border rounded-lg">Cancelar</button><button onClick={saveTemplate} className="flex-1 p-2 bg-indigo-600 text-white rounded-lg">Guardar</button></div></div>)}
          {templates?.map(template => (<div key={template.id} className="p-3 rounded-lg mb-2 bg-gray-50"><div className="flex justify-between items-start"><div><p className="font-medium">{template.name}</p><p className="text-xs text-gray-500">{template.description}</p></div><button onClick={() => onUseTemplate(template)} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm">Usar</button></div></div>))}
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;