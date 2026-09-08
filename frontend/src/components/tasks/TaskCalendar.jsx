import { useState } from 'react';

const TaskCalendar = ({ tasks, tickets, onTaskClick, isDarkMode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startPadding = firstDay.getDay();
    for (let i = startPadding; i > 0; i--) days.push({ date: new Date(year, month, -i + 1), isPadding: true });
    for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i), isPadding: false });
    return days;
  };

  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayTasks = tasks?.filter(task => task.history?.some(h => h.date === dateStr)) || [];
    const dayTickets = tickets?.filter(ticket => ticket.requestedAt?.split('T')[0] === dateStr) || [];
    return { count: dayTasks.length + dayTickets.length };
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const changeMonth = (delta) => { const newDate = new Date(currentDate); newDate.setMonth(currentDate.getMonth() + delta); setCurrentDate(newDate); };

  return (
    <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-gray-100">←</button>
        <h2 className="text-lg font-semibold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-gray-100">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => <div key={day} className="text-center text-sm font-medium p-2 text-gray-500">{day}</div>)}
        {days.map((day, idx) => {
          const { count } = getTasksForDate(day.date);
          const isToday = day.date.toDateString() === new Date().toDateString();
          return (<div key={idx} className={`min-h-[80px] p-1 rounded-lg border cursor-pointer ${day.isPadding ? 'bg-gray-50' : 'bg-white'} ${isToday ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200'}`}><span className={`text-xs ${isToday ? 'text-indigo-500 font-bold' : 'text-gray-500'}`}>{day.date.getDate()}</span>{count > 0 && <div className="mt-1"><div className="text-[10px] px-1 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{count} tareas</div></div>}</div>);
        })}
      </div>
    </div>
  );
};

export default TaskCalendar;