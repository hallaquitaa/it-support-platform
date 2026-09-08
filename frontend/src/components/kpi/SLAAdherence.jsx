import { Award, TrendingUp } from 'lucide-react';

const SLAAdherence = ({ value = 94, trend = 2 }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 rounded-lg bg-emerald-500">
          <Award size={20} className="text-white" />
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
          <TrendingUp size={10} />
          <span>+{trend}%</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}%</p>
      <p className="text-sm text-slate-500 mt-1">SLA adherencia</p>
      <p className="text-xs text-slate-400 mt-1">Cumplimiento últimos 30 días</p>
      <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
};

export default SLAAdherence;