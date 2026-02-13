
import React, { useState } from 'react';
import { Lock, X, Save, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface PasswordChangeProps {
  username: string;
  validUsers: { username: string, password: string }[];
  onSave: (newPassword: string) => Promise<boolean>;
  onCancel: () => void;
}

const PasswordChange: React.FC<PasswordChangeProps> = ({ username, validUsers, onSave, onCancel }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação da senha atual localmente primeiro
    const user = validUsers.find(u => u.username === username);
    if (!user || user.password !== currentPassword) {
      setError('A senha atual está incorreta.');
      return;
    }

    if (newPassword.length < 4) {
      setError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação da nova senha não coincide.');
      return;
    }

    setIsProcessing(true);
    const result = await onSave(newPassword);
    setIsProcessing(false);

    if (result) {
      setSuccess(true);
      setTimeout(onCancel, 2000);
    } else {
      setError('Erro ao salvar nova senha no banco de dados.');
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-300">
        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold dark:text-white">Senha Alterada!</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Sua nova senha foi salva com sucesso.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-800 dark:bg-slate-950 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-bold">Configurações de Perfil</h2>
        <button onClick={onCancel} className="p-1 hover:bg-slate-700 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl mb-4 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
           <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-lg">
             <Lock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
           </div>
           <div>
             <p className="text-[10px] font-bold text-slate-400 uppercase">Usuário Logado</p>
             <p className="text-sm font-bold dark:text-white">{username}</p>
           </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Senha Atual</label>
          <input 
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
            required
            disabled={isProcessing}
          />
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Nova Senha</label>
          <input 
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
            required
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Confirmar Nova Senha</label>
          <input 
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
            required
            disabled={isProcessing}
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm font-bold animate-in shake duration-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={isProcessing}
            className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Alterar Senha
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChange;
