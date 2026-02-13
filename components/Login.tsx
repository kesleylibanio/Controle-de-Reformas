
import React, { useState } from 'react';
import { Disc, Lock, User, AlertCircle, Loader2, UserPlus, LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
  onRegister: (username: string, password: string) => Promise<boolean>;
  validUsers: { username: string, password: string }[];
  isLoading: boolean;
  darkMode?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, validUsers, isLoading, darkMode }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
      if (password.length < 4) {
        setError('A senha deve ter pelo menos 4 caracteres.');
        return;
      }
      
      const userExists = validUsers.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
      if (userExists) {
        setError('Este nome de usuário já está em uso.');
        return;
      }

      setIsProcessing(true);
      const success = await onRegister(username.trim(), password);
      setIsProcessing(false);

      if (success) {
        setMode('login');
        setError(null);
        alert('Cadastro realizado com sucesso! Agora você pode entrar.');
      } else {
        setError('Ocorreu um erro ao tentar cadastrar. Tente novamente.');
      }
    } else {
      // Garantir comparação de tipos string
      const user = validUsers.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase() && String(u.password) === String(password)
      );

      if (user) {
        onLogin(user.username);
      } else {
        setError('Usuário ou senha inválidos.');
      }
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'} flex flex-col items-center justify-center p-6 transition-colors duration-300`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 text-white rounded-3xl shadow-xl shadow-red-200 dark:shadow-red-900/20 mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <Disc className="w-10 h-10 animate-spin-slow" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Controle de Reformas</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Gestão de Manutenção e Bônus</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-500">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
            {mode === 'login' ? 'Acesse sua conta' : 'Criar nova conta'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Usuário</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu nome de usuário"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 pl-12 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 transition-all outline-none"
                  required
                  disabled={isLoading || isProcessing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 pl-12 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 transition-all outline-none"
                  required
                  disabled={isLoading || isProcessing}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 pl-12 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 transition-all outline-none"
                    required
                    disabled={isLoading || isProcessing}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl animate-in shake duration-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading || isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {(isLoading || isProcessing) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isProcessing ? 'Cadastrando...' : 'Carregando...'}
                </>
              ) : (
                mode === 'login' ? (
                  <><LogIn className="w-5 h-5" /> Entrar no Sistema</>
                ) : (
                  <><UserPlus className="w-5 h-5" /> Criar Conta</>
                )
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-700 text-center">
            <button 
              onClick={toggleMode}
              className="text-red-600 dark:text-red-400 text-sm font-bold hover:underline transition-all"
            >
              {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já possui conta? Faça login'}
            </button>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-6 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Controle de Reformas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
