import TaskCard from './TaskCard';

const columns = [
  { id: 'pending', title: 'Pendiente', color: 'bg-slate-50 dark:bg-slate-800/50' },
  { id: 'in_progress', title: 'En Proceso', color: 'bg-blue-50 dark:bg-blue-950/20' },
  { id: 'resolved', title: 'Resuelto', color: 'bg-green-50 dark:bg-green-950/20' }
];

export default function TaskBoard({ tasks, onTaskClick, onStatusChange }) {
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onStatusChange(taskId, columnId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(column => (
        <div
          key={column.id}
          className={`rounded-lg ${column.color} border border-slate-200 dark:border-slate-700 p-3`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <h3 className="font-semibold mb-3">
            {column.title} <span className="text-xs text-slate-400">({tasks.filter(t => t.status === column.id).length})</span>
          </h3>
          <div className="space-y-3 min-h-[400px]">
            {tasks.filter(t => t.status === column.id).map(task => (
              <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)}>
                <TaskCard task={task} onClick={onTaskClick} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}