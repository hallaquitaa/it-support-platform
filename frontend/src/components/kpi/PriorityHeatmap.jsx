const PriorityHeatmap = ({ critical = 2, high = 11, medium = 0, low = 1 }) => {
  const priorities = [
    { name: 'CRÍTICA', value: critical, color: 'bg-red-500', bgLight: 'bg-red-50', textColor: 'text-red-600' },
    { name: 'ALTA', value: high, color: 'bg-orange-500', bgLight: 'bg-orange-50', textColor: 'text-orange-600' },
    { name: 'MEDIA', value: medium, color: 'bg-yellow-500', bgLight: 'bg-yellow-50', textColor: 'text-yellow-600' },
    { name: 'BAJA', value: low, color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-600' }
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Mapa de Calor de Prioridad</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {priorities.map((p, i) => (
          <div key={i} className={`${p.bgLight} rounded-lg p-3 border border-slate-100`}>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-semibold ${p.textColor}`}>{p.name}</span>
              <span className="text-xl font-bold text-slate-800">{p.value}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-slate-400 text-center">
        Total tickets activos: {critical + high + medium + low}
      </div>
    </div>
  );
};

export default PriorityHeatmap;