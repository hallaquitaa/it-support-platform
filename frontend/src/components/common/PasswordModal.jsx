import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Modal from './Modal';

export default function PasswordModal({ isOpen, onClose, onConfirm, title, message }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!password) return;
    setLoading(true);
    try {
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (error) {
      // Error ya manejado por el callback
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Master Password'} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {message || 'Ingrese la Master Password para continuar:'}
        </p>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-9 pr-10 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            placeholder="Master Password"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
          </button>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1 py-2 text-sm">
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={loading || !password} className="btn-primary flex-1 py-2 text-sm">
            {loading ? 'Verificando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}