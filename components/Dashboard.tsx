
import React from 'react';
import { BarChart3, Trophy, Plus, ArrowRight, Disc, Gift, TrendingUp, XCircle, Hammer, RefreshCw, CheckCircle } from 'lucide-react';
import { BonusStats, Shipment, ShipmentStatus } from '../types';

interface DashboardProps {
  stats: BonusStats;
  onNewShipment: () => void;
  onViewList: () => void;
  recentShipments: Shipment[];
  onOpenReturn: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, onNewShipment, onViewList, recentShipments, onOpenReturn }) => {
  const nextBonusProgress = Math.max(0, stats.totalReformed - stats.totalBonusPaid) % 15;
  const progressPercent = (nextBonusProgress / 15) * 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Primeiras Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-colors">
          <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-blue-600 dark:text-blue-400 w-fit mb-3">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Reformados</p>
            <p className="text-xl font-black text-slate-800 dark:text-white">{stats.totalReformed}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-colors">
          <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg text-purple-600 dark:text-purple-400 w-fit mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Trocados</p>
            <p className="text-xl font-black text-slate-800 dark:text-white">{stats.totalExchanged}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-colors">
          <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg text-amber-600 dark:text-amber-400 w-fit mb-3">
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Consertados</p>
            <p className="text-xl font-black text-slate-800 dark:text-white">{stats.totalRepaired}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-colors">
          <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-lg text-red-600 dark:text-red-400 w-fit mb-3">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Sem Reforma</p>
            <p className="text-xl font-black text-slate-800 dark:text-white">{stats.totalFailed}</p>
          </div>
        </div>
      </div>

      {/* Cards de Bônus - Área de Foco */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card de Saldo Atual */}
        <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-between overflow-hidden relative">
          <Trophy className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Saldo de Bônus</p>
            <h3 className="text-4xl font-black">{stats.pendingBonuses}</h3>
            <p className="text-[10px] mt-2 font-medium bg-white/20 px-2 py-1 rounded-full w-fit">Disponível para Resgate</p>
          </div>
          <Gift className="w-12 h-12 text-white/40" />
        </div>

        {/* Card de Resgatados (NOVO) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Resgatado</p>
            <h3 className="text-4xl font-black text-slate-800 dark:text-white">{stats.totalBonusPaid}</h3>
            <p className="text-[10px] mt-2 font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Resgates Confirmados
            </p>
          </div>
          <div className="bg-amber-100 dark:bg-amber-900/40 p-4 rounded-2xl text-amber-600">
             <Gift className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Barra de Progresso do Próximo Bônus */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h4 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-tight">Progresso do Próximo Bônus</h4>
            <p className="text-xs text-slate-400 mt-1 font-medium">{nextBonusProgress} de 15 reformas concluídas</p>
          </div>
          <span className="text-xl font-black text-red-600">Faltam {15 - nextBonusProgress} pneus</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-900 h-4 rounded-full overflow-hidden p-1">
          <div 
            className="h-full bg-red-600 rounded-full transition-all duration-1000 ease-out shadow-sm" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-slate-400 mt-3 text-center font-bold italic">
          Ganhe 1 bônus a cada 15 pneus reformados.
        </p>
      </div>

      {/* Remessas Recentes */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Remessas Recentes</h3>
          <button onClick={onViewList} className="text-xs font-bold text-red-600 flex items-center gap-1 hover:underline">
            Ver tudo <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentShipments.length === 0 ? (
          <button 
            onClick={onNewShipment}
            className="w-full bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-red-400 transition-colors group"
          >
            <Plus className="w-8 h-8 mx-auto mb-2 text-slate-300 group-hover:text-red-500 transition-colors" />
            <p className="text-sm font-bold text-slate-400 group-hover:text-slate-600">Cadastrar primeira remessa</p>
          </button>
        ) : (
          recentShipments.map(s => (
            <div key={s.id} onClick={() => onOpenReturn(s.id)} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm cursor-pointer hover:border-red-200 dark:hover:border-red-900 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${s.status === ShipmentStatus.FINISHED ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <Disc className={`w-6 h-6 ${s.status === ShipmentStatus.PARTIAL ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 dark:text-white">{s.number}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{s.quantitySent} Pneus • {new Date(s.sendDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${s.status === ShipmentStatus.FINISHED ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                  {s.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
