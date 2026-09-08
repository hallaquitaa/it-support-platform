const priorityConfig = {
  critical: { border: 'border-l-4 border-red-500', label: 'Crítica' },
  high: { border: 'border-l-4 border-orange-500', label: 'Alta' },
  medium: { border: 'border-l-4 border-yellow-500', label: 'Media' },
  low: { border: 'border-l-4 border-green-500', label: 'Baja' }
};

export default function TaskCard({ task, onClick }) {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  
  return (
    <div
      onClick={() => onClick(task)}
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-all ${priority.border}`}
    >
      <h4 className="font-semibold text-slate-800 dark:text-white">{task.title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
        {task.description || 'Sin descripción'}
      </p>
      {task.branch_name && (
        <p className="text-xs text-slate-400 mt-2">{task.branch_name}</p>
      )}
    </div>
  );
}