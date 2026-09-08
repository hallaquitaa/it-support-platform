import { CheckCircle, Circle } from 'lucide-react';

const SubtaskList = ({ subtasks, onToggle, isDarkMode }) => {
  if (!subtasks || subtasks.length === 0) return null;
  
  return (
    <div className="mt-2 pl-4 border-l-2 border-gray-200">
      {subtasks.map(subtask => (
        <div key={subtask.id} className="flex items-center gap-2 py-1">
          <button onClick={() => onToggle(subtask.id)} className="cursor-pointer">
            {subtask.completed ? <CheckCircle size={12} className="text-green-500" /> : <Circle size={12} className="text-gray-400" />}
          </button>
          <span className={`text-xs ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>{subtask.title}</span>
        </div>
      ))}
    </div>
  );
};

export default SubtaskList;