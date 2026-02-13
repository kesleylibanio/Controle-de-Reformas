
import React, { useEffect } from 'react';
import { Trophy, X, PartyPopper } from 'lucide-react';

interface BonusNotificationProps {
  availableCount: number;
  onClose: () => void;
}

const BonusNotification: React.FC<BonusNotificationProps> = ({ availableCount, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-xs w-full text-center relative overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100 dark:border-slate-700">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        
        <div className="mb-4 inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">PARABÉNS!</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
          Você atingiu um marco de reformas e possui novos bônus disponíveis para resgate!
        </p>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-slate-700">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Bônus Disponíveis</p>
          <p className="text-4xl font-black text-slate-800 dark:text-white">{availableCount}</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-200 dark:shadow-none active:scale-95"
        >
          Excelente!
        </button>

        <PartyPopper className="absolute top-4 right-4 text-red-400 w-6 h-6 opacity-40" />
        <PartyPopper className="absolute bottom-20 left-4 text-yellow-400 w-8 h-8 opacity-40" />
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BonusNotification;
