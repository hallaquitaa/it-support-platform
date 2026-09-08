import { Trophy, Medal, Star, Award, Sparkles } from 'lucide-react';

const GamificationBadges = ({ achievements, userPoints, allAchievements, isDarkMode }) => {
  const currentLevel = Math.floor((userPoints || 0) / 100) + 1;
  const progressToNext = ((userPoints || 0) % 100) / 100 * 100;

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex justify-between items-center mb-3"><h3 className="font-semibold">Nivel {currentLevel}</h3><div className="flex items-center gap-1"><Sparkles size={14} className="text-yellow-500" /><span className="text-sm font-bold">{userPoints || 0}</span><span className="text-xs text-gray-500">/500 pts</span></div></div>
        <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${progressToNext}%` }}></div></div>
      </div>
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h3 className="font-semibold mb-3">Logros Desbloqueados</h3>
        <div className="grid grid-cols-2 gap-3">{(achievements || []).map(ach => (<div key={ach.id} className="p-3 rounded-lg bg-indigo-50"><div className="flex items-center gap-2"><Trophy size={20} className="text-yellow-500" /><div><p className="text-sm font-medium">{ach.name}</p><p className="text-xs text-gray-500">{ach.description}</p></div></div></div>))}</div>
      </div>
    </div>
  );
};

export default GamificationBadges;