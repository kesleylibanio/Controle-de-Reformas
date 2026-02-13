
import React from 'react';
import { BarChart3, Trophy, Plus, ArrowRight, Clock, CheckCircle2, Disc, RotateCcw, Gift, AlertCircle, TrendingUp, XCircle, Hammer, RefreshCw, CheckCircle } from 'lucide-react';
import { BonusStats, Shipment, ShipmentStatus } from '../types';

interface DashboardProps {
  stats: BonusStats;
  onNewShipment: () => void;
  onViewList: () => void;
  recentShipments: Shipment[];
  onOpenReturn: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, onNewShipment, onViewList, recentShipments, onOpenReturn }) => {
  // Progresso baseado no resto da divisão por 15 das reformas totais
  const nextBonusProgress = stats.totalReformed % 15;
  const progressPercent = (nextBonusProgress / 15) * 100;

  const totalReturns = stats.totalReformed + stats.totalRepaired + stats.totalExchanged + stats.totalFailed;
  const successRate = totalReturns > 0 ? (stats.totalReformed / totalReturns) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Primeiras Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-colors col-span-2 md:col-span-1">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-lg text-emerald-600 dark:text-emerald-400 w-fit mb-3">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Total Resgatado</p>
            <p className="text-xl font-black text-slate-800 dark:text-white">{stats.totalBonusPaid}</p>
          </div>
        </div>
      </div>

      {/* Bônus e Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
           <div className="flex items-center gap-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/40 p-4 rounded-xl text-yellow-600 dark:text-yellow-400">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Bônus Disponíveis</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.pendingBonuses}</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">{nextBonusProgress}/15 para o próximo</p>
             <div className="w-32 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-red-600 dark:bg-red-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                ></div>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-xl text-green-600 dark:text-green-400">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Taxa de Aproveitamento</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-slate-800 dark:text-white">{successRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-400 mb-1">de {totalReturns} retornos</p>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={onNewShipment}
        className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-lg active:scale-95"
      >
        <Plus className="w-6 h-6" />
        Nova Remessa
      </button>

      {/* Histórico Recente */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
          <h2 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-widest">Últimas Remessas</h2>
          <button 
            onClick={onViewList}
            className="text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-1 hover:underline"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {(recentShipments || []).length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Disc className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>Nenhuma remessa encontrada.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-700">
            {recentShipments.map((shipment) => {
               const returns = Array.isArray(shipment.returns) ? shipment.returns : [];
               const totalReturned = returns.reduce((sum, r) => sum + r.reformed + r.repaired + r.exchanged + r.failed, 0);
               
               let statusStyles = "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
               let StatusIcon = AlertCircle;

               if (shipment.status === ShipmentStatus.PARTIAL) {
                 statusStyles = "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
                 StatusIcon = Clock;
               } else if (shipment.status === ShipmentStatus.FINISHED) {
                 statusStyles = "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
                 StatusIcon = CheckCircle2;
               }

               return (
                <div key={shipment.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${statusStyles}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{shipment.number}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(shipment.sendDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{totalReturned} / {shipment.quantitySent} pneus</p>
                      <p className={`text-[10px] font-black uppercase ${
                        shipment.status === ShipmentStatus.AWAITING ? 'text-red-500' : 
                        shipment.status === ShipmentStatus.PARTIAL ? 'text-yellow-600' : 'text-green-500'
                      }`}>
                        {shipment.status}
                      </p>
                    </div>
                    {shipment.status !== ShipmentStatus.FINISHED && (
                      <button 
                        onClick={() => onOpenReturn(shipment.id)}
                        className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 p-2 rounded-xl transition-colors active:scale-95"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
