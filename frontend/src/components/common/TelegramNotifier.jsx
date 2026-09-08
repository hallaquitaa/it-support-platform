import { useState } from 'react';
import { Send, Check } from 'lucide-react';

const TelegramNotifier = ({ isConnected, onConnect }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [chatId, setChatId] = useState('');

  const handleConnect = () => { if (chatId.trim()) { onConnect(); setShowConfig(false); } };

  return (
    <div className="relative">
      <button onClick={() => setShowConfig(!showConfig)} className={`p-2 rounded-lg ${isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
        <Send size={16} /> {isConnected && <Check size={12} className="inline ml-1" />}
      </button>
      {showConfig && (
        <div className="absolute right-0 top-10 w-64 p-3 rounded-lg shadow-lg z-30 bg-white border">
          <p className="text-sm font-medium mb-2">Configurar Telegram</p>
          <input type="text" placeholder="Chat ID" value={chatId} onChange={e => setChatId(e.target.value)} className="w-full p-2 mb-2 text-sm rounded-lg border" />
          <button onClick={handleConnect} className="w-full p-2 bg-indigo-600 text-white rounded-lg text-sm">Conectar</button>
        </div>
      )}
    </div>
  );
};

export default TelegramNotifier;