import { BarChart3, TrendingUp } from 'lucide-react';

const VolumeChart = () => {
  const data = [
    { day: 'L', value: 12 },
    { day: 'M', value: 8 },
    { day: 'M', value: 15 },
    { day: 'J', value: 10 },
    { day: 'V', value: 18 },
    { day: 'S', value: 14 },
    { day: 'D', value: 9 }
  ];
  
  const maxValue = 20;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Volumen de tickets</h3>
        <button className="text-xs text-indigo-600 hover:text-indigo-700">Ver detalle</button>
      </div>
      <p className="text-xs text-slate-400 mb-3">últimos 7 días</p>
      <div className="flex items-end gap-2 h-28">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-indigo-100 rounded-t hover:bg-indigo-200 transition-all relative" 
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            >
              <div 
                className="absolute bottom-0 w-full bg-indigo-500 rounded-t transition-all"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-slate-400">{item.day}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-slate-500">Total: 86 tickets</span>
        <div className="flex items-center gap-1 text-xs text-emerald-500">
          <TrendingUp size={10} />
          <span>+8%</span>
        </div>
      </div>
    </div>
  );
};

export default VolumeChart;